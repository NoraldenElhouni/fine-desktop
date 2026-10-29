/**
 * Code128 encoder, set B (printable ASCII 0x20–0x7E), with the mod-103 check
 * symbol. It has no dependencies: it turns a value into the bar and space
 * widths that the label renderer draws as SVG (W4-03). The backend accepts
 * barcodes in the same range, so any stored barcode encodes.
 */

/** Bar/space widths (in modules) of symbols 0–105, then the stop pattern (106). */
const PATTERNS: readonly string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

const START_B = 104;
const STOP = 106;
/** Blank margin each side, in modules (the Code128 minimum is 10). */
export const CODE128_QUIET_ZONE = 10;

/** True when every character is in Code128 set B (printable ASCII). */
export const isCode128B = (value: string): boolean => /^[\x20-\x7E]+$/.test(value);

export interface Code128Encoding {
  /** Alternating bar, space, bar… widths in modules, starting with a bar (quiet zones excluded). */
  widths: number[];
  /** Width of the symbols alone (start to stop), in modules. */
  barModules: number;
  /** Total width in modules, full quiet zones included. */
  totalModules: number;
}

/** Encodes `value` in set B with its check symbol; null when the value is empty or not set B. */
export function encodeCode128B(value: string): Code128Encoding | null {
  if (!value || !isCode128B(value)) return null;

  const symbols = [START_B];
  let checksum = START_B;
  for (let i = 0; i < value.length; i++) {
    const symbol = value.charCodeAt(i) - 32;
    symbols.push(symbol);
    checksum += symbol * (i + 1);
  }
  symbols.push(checksum % 103, STOP);

  const widths = symbols.flatMap((s) => PATTERNS[s].split("").map(Number));
  const barModules = widths.reduce((sum, w) => sum + w, 0);
  return { widths, barModules, totalModules: barModules + 2 * CODE128_QUIET_ZONE };
}

/**
 * The quiet zone (modules, each side) to draw inside a barcode `widthMm` wide
 * that already has `marginMm` of blank label on each side: only what the
 * margin does not cover, so a long value gets the whole width for its bars.
 * Solves margin + q·m = 10·m with m = width / (bars + 2q).
 */
export function code128InnerQuietZone(barModules: number, widthMm: number, marginMm: number): number {
  const q = (CODE128_QUIET_ZONE * widthMm - marginMm * barModules) / (2 * marginMm + widthMm);
  return Math.min(CODE128_QUIET_ZONE, Math.max(0, q));
}

/** Narrowest bar (mm) when `value` is drawn `widthMm` wide with `marginMm` blank each side; null when it does not encode. */
export function code128ModuleMm(value: string, widthMm: number, marginMm: number): number | null {
  const encoding = encodeCode128B(value);
  if (!encoding) return null;
  const q = code128InnerQuietZone(encoding.barModules, widthMm, marginMm);
  return widthMm / (encoding.barModules + 2 * q);
}

/**
 * Below this a bar is under about 1.5 dots of a 203 dpi label printer (0.125
 * mm a dot): bar widths come out uneven and many readers fail.
 */
export const CODE128_MIN_MODULE_MM = 0.19;
