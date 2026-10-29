import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { execFile } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

/**
 * Thermal receipt printing and cash-drawer kick (FR-INV-055, FR-RPT-008, FR-RPT-025).
 * The renderer is untrusted input: every payload is validated here before it reaches the OS.
 */

export interface PrinterSummary {
  name: string;
  displayName: string;
  isDefault: boolean;
  status: string | null;
}

export interface PrintingResult {
  ok: boolean;
  error?: string;
}

const DEFAULT_WIDTH_MICRONS = 80000;
const PAGE_HEIGHT_MICRONS = 297000;
const DEFAULT_DRAWER_PORT = 9100;
const NETWORK_TIMEOUT_MS = 3000;
const POWERSHELL_TIMEOUT_MS = 15000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const errorMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/** A printer name as the OS knows it: non-empty, bounded, no control characters. */
const cleanPrinterName = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const name = value.trim();
  // eslint-disable-next-line no-control-regex
  if (!name || name.length > 256 || /[\u0000-\u001f\u007f]/.test(name)) return null;
  return name;
};

/** A hostname or IPv4/IPv6 literal; nothing that could smuggle anything else. */
const cleanHost = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const host = value.trim();
  if (!host || host.length > 253) return null;
  if (net.isIP(host)) return host;
  return /^[A-Za-z0-9]([A-Za-z0-9-]{0,62})(\.[A-Za-z0-9]([A-Za-z0-9-]{0,62}))*$/.test(host) ? host : null;
};

const cleanInt = (value: unknown, fallback: number, min: number, max: number): number | null => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) return null;
  return value;
};

/** ESC p m t1 t2 — pulse drawer pin m (0 = pin 2, 1 = pin 5) for 25×2 ms on, 250×2 ms off. */
const drawerKickBytes = (pin: 0 | 1): Buffer => Buffer.from([0x1b, 0x70, pin, 0x19, 0xfa]);

const kickOverNetwork = (host: string, port: number, bytes: Buffer): Promise<PrintingResult> =>
  new Promise((resolve) => {
    let settled = false;
    const finish = (result: PrintingResult) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };
    const socket = net.createConnection({ host, port });
    socket.setTimeout(NETWORK_TIMEOUT_MS);
    socket.on("connect", () => {
      socket.end(bytes, () => finish({ ok: true }));
    });
    socket.on("timeout", () => finish({ ok: false, error: `انتهت مهلة الاتصال بـ ${host}:${port}` }));
    socket.on("error", (e) => finish({ ok: false, error: e.message }));
  });

/**
 * Sends raw bytes to a Windows printer through the spooler (datatype RAW) via winspool.drv.
 * The printer name and file path reach PowerShell only through environment variables, so no
 * untrusted text is ever interpolated into the script.
 */
const WINDOWS_RAW_PRINT_SCRIPT = `
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
public static class FineRawPrinter {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public class DOCINFO {
    [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
    [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
    [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
  }
  [DllImport("winspool.drv", EntryPoint = "OpenPrinterW", SetLastError = true, CharSet = CharSet.Unicode)]
  public static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool ClosePrinter(IntPtr hPrinter);
  [DllImport("winspool.drv", EntryPoint = "StartDocPrinterW", SetLastError = true, CharSet = CharSet.Unicode)]
  public static extern int StartDocPrinter(IntPtr hPrinter, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFO di);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool EndDocPrinter(IntPtr hPrinter);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool StartPagePrinter(IntPtr hPrinter);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool EndPagePrinter(IntPtr hPrinter);
  [DllImport("winspool.drv", SetLastError = true)]
  public static extern bool WritePrinter(IntPtr hPrinter, byte[] pBytes, int dwCount, out int dwWritten);

  public static void Send(string printer, byte[] bytes) {
    IntPtr h;
    if (!OpenPrinter(printer, out h, IntPtr.Zero)) throw new Win32Exception(Marshal.GetLastWin32Error());
    try {
      DOCINFO di = new DOCINFO();
      di.pDocName = "Fine cash drawer";
      di.pDataType = "RAW";
      if (StartDocPrinter(h, 1, di) == 0) throw new Win32Exception(Marshal.GetLastWin32Error());
      try {
        if (!StartPagePrinter(h)) throw new Win32Exception(Marshal.GetLastWin32Error());
        try {
          int written;
          if (!WritePrinter(h, bytes, bytes.Length, out written)) throw new Win32Exception(Marshal.GetLastWin32Error());
          if (written != bytes.Length) throw new Exception("Short write to printer");
        } finally {
          EndPagePrinter(h);
        }
      } finally {
        EndDocPrinter(h);
      }
    } finally {
      ClosePrinter(h);
    }
  }
}
'@
[FineRawPrinter]::Send($env:FINE_RAW_PRINTER, [System.IO.File]::ReadAllBytes($env:FINE_RAW_FILE))
`;

const runExecFile = (file: string, args: string[], env?: NodeJS.ProcessEnv): Promise<PrintingResult> =>
  new Promise((resolve) => {
    execFile(
      file,
      args,
      { windowsHide: true, timeout: POWERSHELL_TIMEOUT_MS, env: env ?? process.env },
      (error, _stdout, stderr) => {
        if (error) {
          const detail = String(stderr || "").trim() || error.message;
          resolve({ ok: false, error: detail.split(/\r?\n/).slice(0, 3).join(" ") });
          return;
        }
        resolve({ ok: true });
      },
    );
  });

const kickThroughPrinter = async (printerName: string, bytes: Buffer): Promise<PrintingResult> => {
  let dir: string | null = null;
  try {
    dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "fine-drawer-"));
    const file = path.join(dir, "kick.bin");
    await fs.promises.writeFile(file, bytes);

    if (process.platform === "win32") {
      return await runExecFile(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", WINDOWS_RAW_PRINT_SCRIPT],
        { ...process.env, FINE_RAW_PRINTER: printerName, FINE_RAW_FILE: file },
      );
    }
    return await runExecFile("lp", ["-d", printerName, "-o", "raw", file]);
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  } finally {
    if (dir) {
      fs.promises.rm(dir, { recursive: true, force: true }).catch((): void => undefined);
    }
  }
};

const DEFAULT_PRINTER_TIMEOUT_MS = 5000;

/**
 * The OS default printer's name, or null when there is none or it can't be read. Windows asks WMI
 * through PowerShell; Linux/macOS parse `lpstat -d` ("system default destination: NAME"). Fixed
 * commands only — nothing from the renderer reaches them.
 */
const getDefaultPrinterName = (): Promise<string | null> =>
  new Promise((resolve) => {
    const [file, args] =
      process.platform === "win32"
        ? [
            "powershell.exe",
            [
              "-NoProfile",
              "-NonInteractive",
              "-ExecutionPolicy",
              "Bypass",
              "-Command",
              "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; (Get-CimInstance Win32_Printer -Filter 'Default=TRUE').Name",
            ],
          ]
        : ["lpstat", ["-d"]];
    const env = { ...process.env, LC_ALL: "C" }; // lpstat prints its fixed English phrasing
    execFile(file, args, { windowsHide: true, timeout: DEFAULT_PRINTER_TIMEOUT_MS, env }, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      const out = String(stdout).trim();
      const name = process.platform === "win32" ? out.split(/\r?\n/)[0]?.trim() : out.match(/:\s*(.+)$/m)?.[1]?.trim();
      resolve(name ? name : null);
    });
  });

/** Last known OS default printer (undefined until a lookup has finished once). */
let cachedDefaultPrinter: string | null | undefined;
let pendingDefaultPrinter: Promise<string | null> | null = null;
const DEFAULT_PRINTER_WAIT_MS = 1500;

/** Starts one background lookup (never two at once) and remembers its answer for the session. */
const refreshDefaultPrinter = (): Promise<string | null> => {
  pendingDefaultPrinter ??= getDefaultPrinterName()
    .then((name) => {
      cachedDefaultPrinter = name;
      return name;
    })
    .finally(() => {
      pendingDefaultPrinter = null;
    });
  return pendingDefaultPrinter;
};

/**
 * The default printer without holding up the list: the cached name at once (refreshed in the
 * background), or on the first call the lookup raced against a short wait (null when it loses).
 */
const getDefaultPrinterQuick = (): Promise<string | null> => {
  const pending = refreshDefaultPrinter();
  if (cachedDefaultPrinter !== undefined) return Promise.resolve(cachedDefaultPrinter);
  return Promise.race([
    pending,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), DEFAULT_PRINTER_WAIT_MS)),
  ]);
};

const UNTRUSTED_SENDER: PrintingResult = { ok: false, error: "طلب من مصدر غير موثوق" };

/**
 * `isTrustedUrl` says whether a frame URL is the app's own renderer. Every handler rejects a request
 * from any other page, so remote content can never reach the printers, spooler or raw sockets.
 */
export const registerPrintingHandlers = (isTrustedUrl: (url: string) => boolean): void => {
  const isTrustedSender = (event: IpcMainInvokeEvent): boolean => {
    const url = event.senderFrame?.url;
    return typeof url === "string" && isTrustedUrl(url);
  };

  ipcMain.handle("printers:list", async (event): Promise<PrinterSummary[]> => {
    if (!isTrustedSender(event)) return [];
    const [printers, defaultName] = await Promise.all([event.sender.getPrintersAsync(), getDefaultPrinterQuick()]);
    return printers.map((p) => {
      const options = (p.options ?? {}) as Record<string, string | undefined>;
      // Electron 43's PrinterInfo has no isDefault/status: the default comes from the OS (above); the
      // state is only in CUPS's options (Windows leaves it out, so status is null there).
      return {
        name: p.name,
        displayName: p.displayName || p.name,
        isDefault: defaultName !== null && p.name === defaultName,
        status: options["printer-state"] ?? null,
      };
    });
  });

  ipcMain.handle("print:silent", (event, opts: unknown): Promise<PrintingResult> => {
    if (!isTrustedSender(event)) return Promise.resolve(UNTRUSTED_SENDER);
    if (!isRecord(opts)) return Promise.resolve({ ok: false, error: "طلب طباعة غير صالح" });
    const deviceName = cleanPrinterName(opts.deviceName);
    const widthMicrons = cleanInt(opts.widthMicrons, DEFAULT_WIDTH_MICRONS, 20000, 300000);
    const copies = cleanInt(opts.copies, 1, 1, 10);
    if (!deviceName) return Promise.resolve({ ok: false, error: "لم تُحدَّد الطابعة" });
    if (widthMicrons === null || copies === null) {
      return Promise.resolve({ ok: false, error: "إعدادات طباعة غير صالحة" });
    }

    return new Promise((resolve) => {
      try {
        event.sender.print(
          {
            silent: true,
            deviceName,
            copies,
            margins: { marginType: "none" },
            pageSize: { width: widthMicrons, height: PAGE_HEIGHT_MICRONS },
            printBackground: true,
          },
          (success, failureReason) => {
            resolve(success ? { ok: true } : { ok: false, error: failureReason || "فشلت الطباعة" });
          },
        );
      } catch (e) {
        resolve({ ok: false, error: errorMessage(e) });
      }
    });
  });

  ipcMain.handle("drawer:kick", async (event, opts: unknown): Promise<PrintingResult> => {
    if (!isTrustedSender(event)) return UNTRUSTED_SENDER;
    if (!isRecord(opts)) return { ok: false, error: "طلب غير صالح" };
    if (opts.pin !== 0 && opts.pin !== 1) return { ok: false, error: "رقم منفذ الدرج غير صالح" };
    const bytes = drawerKickBytes(opts.pin);

    if (opts.host !== undefined && opts.host !== null && opts.host !== "") {
      const host = cleanHost(opts.host);
      const port = cleanInt(opts.port, DEFAULT_DRAWER_PORT, 1, 65535);
      if (!host) return { ok: false, error: "عنوان الطابعة غير صالح" };
      if (port === null) return { ok: false, error: "رقم المنفذ غير صالح" };
      return kickOverNetwork(host, port, bytes);
    }

    const printerName = cleanPrinterName(opts.printerName);
    if (!printerName) return { ok: false, error: "لم تُحدَّد الطابعة" };
    return kickThroughPrinter(printerName, bytes);
  });
};
