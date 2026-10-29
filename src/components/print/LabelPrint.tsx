import React, { useState } from "react";
import { AlertTriangle, Printer } from "lucide-react";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Code128Barcode } from "./Code128Barcode";
import { CODE128_MIN_MODULE_MM, code128ModuleMm } from "../../lib/code128";
import { money } from "./PrintDocument";
import { formatNumber } from "../../lib/utils/format";
import { formatSizeCm } from "../../api/endpoints/sales";
import { type InventoryItem, type StockLot, PRICE_BASIS_LABELS, UOM_LABELS } from "../../api/endpoints/inventory";
import { cn } from "../../lib/utils/utils";

/**
 * Barcode labels (W4-03): an item label (name, code, price, barcode) and a lot
 * label (lot no., item, size, barcode). They print one per 50×30 mm page on a
 * label roll, or as an A4 sheet of 50×30 mm labels. The `.print-area` rules in
 * index.css isolate them from the app; `.print-label-roll` selects the
 * 50×30 mm @page.
 */

export interface ItemLabelData {
  kind: "item";
  key: string;
  name: string;
  code: string;
  /** Formatted price with its basis, or null when the item has no selling price. */
  price: string | null;
  barcode: string;
}

export interface LotLabelData {
  kind: "lot";
  key: string;
  lotNumber: string;
  itemName: string;
  /** Block size (L×W×H) or the lot's quantity. */
  size: string | null;
  barcode: string;
}

export type LabelData = ItemLabelData | LotLabelData;

/** An item label scans by the item's barcode, or by its code when it has none. */
export const itemLabelData = (item: InventoryItem): ItemLabelData => {
  const hasPrice = item.selling_price !== null && item.selling_price !== undefined && item.selling_price !== "";
  return {
    kind: "item",
    key: item.id,
    name: item.name,
    code: item.code,
    price: hasPrice
      ? `${money(item.selling_price)}${item.price_basis === "m3" ? ` ${PRICE_BASIS_LABELS.m3}` : ""}`
      : null,
    barcode: item.barcode || item.code,
  };
};

/** A lot label scans by its lot number. `itemName` covers lots returned without their item. */
export const lotLabelData = (lot: StockLot, itemName?: string): LotLabelData => {
  const uom = lot.inventory_item?.unit_of_measure;
  const quantity = `${formatNumber(lot.quantity, { maximumFractionDigits: 4 })} ${uom ? (UOM_LABELS[uom] ?? uom) : ""}`.trim();
  return {
    kind: "lot",
    key: lot.id,
    lotNumber: lot.lot_number,
    itemName: lot.inventory_item?.name ?? itemName ?? "",
    size: formatSizeCm(lot.length_m, lot.width_m, lot.height_m) ?? quantity,
    barcode: lot.lot_number,
  };
};

type LabelLayout = "roll" | "sheet";

/**
 * The barcode spans the label's inner width (50 mm less 2 mm padding each
 * side); that padding is most of its quiet zone, so long lot numbers keep as
 * wide a bar as the label allows.
 */
const LABEL_BARCODE_FIT = { widthMm: 46, marginMm: 2 };

/** Labels whose barcode would print bars too thin to read reliably on a 50 mm label. */
const tooDenseBarcodes = (labels: LabelData[]): string[] =>
  labels
    .map((l) => l.barcode)
    .filter((code, i, all) => all.indexOf(code) === i)
    .filter((code) => {
      const moduleMm = code128ModuleMm(code, LABEL_BARCODE_FIT.widthMm, LABEL_BARCODE_FIT.marginMm);
      return moduleMm !== null && moduleMm < CODE128_MIN_MODULE_MM;
    });

const LabelFace: React.FC<{ label: LabelData; layout: LabelLayout }> = ({ label, layout }) => (
  <div
    dir="rtl"
    className={cn(
      "label-cell flex flex-col justify-between overflow-hidden bg-white text-black leading-tight",
      layout === "roll" ? "border border-dashed border-gray-300 print:border-0" : "border border-dotted border-gray-400",
    )}
    style={{ width: "50mm", height: "30mm", padding: "1.5mm 2mm", boxSizing: "border-box" }}
  >
    {label.kind === "item" ? (
      <>
        <div className="truncate font-bold" style={{ fontSize: "8pt" }}>
          {label.name}
        </div>
        <div className="flex items-center justify-between gap-1" style={{ fontSize: "7pt" }}>
          <span className="truncate font-mono" dir="ltr">
            {label.code}
          </span>
          {label.price && <span className="shrink-0 font-bold">{label.price}</span>}
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between gap-1">
          <span className="truncate font-mono font-bold" style={{ fontSize: "8pt" }} dir="ltr">
            {label.lotNumber}
          </span>
          {label.size && (
            <span className="shrink-0 font-mono" style={{ fontSize: "7pt" }}>
              {label.size}
            </span>
          )}
        </div>
        <div className="truncate" style={{ fontSize: "7pt" }}>
          {label.itemName}
        </div>
      </>
    )}
    <div>
      <Code128Barcode value={label.barcode} height="11mm" fit={LABEL_BARCODE_FIT} />
      <div className="text-center font-mono" style={{ fontSize: "6.5pt" }} dir="ltr">
        {label.barcode}
      </div>
    </div>
  </div>
);

interface LabelPrintDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  labels: LabelData[];
}

/** Preview labels, pick the roll or the A4 sheet and the copies of each, then print. */
export const LabelPrintDialog: React.FC<LabelPrintDialogProps> = ({ open, onClose, title = "طباعة الملصقات", labels }) => {
  const [layout, setLayout] = useState<LabelLayout>("roll");
  const [copies, setCopies] = useState("1");
  const copyCount = Math.min(100, Math.max(1, Math.floor(Number(copies) || 1)));
  const faces = labels.flatMap((l) => Array.from({ length: copyCount }, (_, i) => ({ label: l, id: `${l.key}-${i}` })));
  const dense = tooDenseBarcodes(labels);

  return (
    // Chromium never splits a position:fixed box across printed pages, and the
    // dialog's max-height/overflow would clip the labels: on paper nothing
    // above the .print-area may be fixed or clipped, or a roll prints only its
    // first label and an A4 sheet is cut off after one page.
    <Dialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      className="print:static print:block print:p-0 print:bg-transparent print:backdrop-blur-none"
    >
      <DialogContent size="3xl" className="print:max-h-none print:overflow-visible print:border-0 print:shadow-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="space-y-3 bg-app-fill-f1 print:overflow-visible print:bg-white print:p-0">
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <div className="inline-flex rounded-xl border border-app-separator bg-app-bg-secondary p-1">
              {(
                [
                  { value: "roll", label: "ملصق 50×30 مم" },
                  { value: "sheet", label: "ورقة A4" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLayout(opt.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    layout === opt.value
                      ? "bg-app-bg-primary text-app-label-primary shadow-sm"
                      : "text-app-label-secondary hover:text-app-label-primary",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-app-label-secondary">
              النسخ من كل ملصق
              <input
                type="number"
                min={1}
                max={100}
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                className="w-20 rounded-lg border border-app-separator bg-app-bg-secondary px-2 py-1 text-xs font-mono focus:border-app-accent focus:outline-none"
                dir="ltr"
              />
            </label>
            <span className="text-[11px] text-app-label-tertiary">
              {formatNumber(faces.length)} ملصق
            </span>
          </div>

          {dense.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-app-status-orange/30 bg-app-status-orange/10 px-3 py-2 text-[11px] text-app-label-primary print:hidden">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-app-status-orange" />
              <span>
                {dense.length === 1 ? "هذا الرمز أطول" : "هذه الرموز أطول"} من أن يُطبع باركودها بوضوح على ملصق بعرض 50 مم
                (أشرطة أدق من {CODE128_MIN_MODULE_MM} مم)، وقد يتعذّر مسحها بطابعة 203 نقطة/بوصة:{" "}
                <span className="font-mono" dir="ltr">
                  {dense.slice(0, 3).join("، ")}
                </span>
                {dense.length > 3 ? ` و${formatNumber(dense.length - 3)} غيرها` : ""}. جرّب طباعة تجريبية والمسح قبل لصقها.
              </span>
            </div>
          )}

          {labels.length === 0 ? (
            <div className="py-16 text-center text-xs text-app-label-secondary print:hidden">لا توجد ملصقات للطباعة.</div>
          ) : layout === "roll" ? (
            <div className="print-area print-label-roll flex flex-col items-center gap-3 print:block">
              {faces.map((f) => (
                <LabelFace key={f.id} label={f.label} layout="roll" />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-[210mm] bg-white p-[12mm] shadow-sm print:p-0 print:shadow-none">
              <div className="print-area print-label-sheet">
                {faces.map((f) => (
                  <LabelFace key={f.id} label={f.label} layout="sheet" />
                ))}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={labels.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            طباعة
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
