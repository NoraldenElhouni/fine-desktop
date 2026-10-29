import React from "react";
import { PrintDocument, PrintTable, Cell, PrintDialog, money } from "./PrintDocument";
import { useStockCountSheet } from "../../hooks/useStockCounts";
import {
  STOCK_COUNT_STATUS_LABEL,
  StockCountExcludedLot,
  StockCountSheet,
  stockCountErrorMessage,
} from "../../api/endpoints/stockCounts";
import { formatDate, formatNumber } from "../../lib/utils/format";

const qty = (v: number | string | null | undefined): string =>
  v === null || v === undefined ? "" : formatNumber(v, { maximumFractionDigits: 4 });

const ExcludedTable: React.FC<{ title: string; lots: StockCountExcludedLot[]; showQty: boolean }> = ({ title, lots, showQty }) =>
  lots.length === 0 ? null : (
    <div className="space-y-1">
      <div className="text-xs font-bold">{title}</div>
      <PrintTable head={["رقم اللوت", "الصنف", ...(showQty ? ["الكمية"] : [])]}>
        {lots.map((lot) => (
          <tr key={lot.id}>
            <Cell className="font-mono">{lot.lot_number}</Cell>
            <Cell>
              {lot.inventory_item?.name ?? "—"}
              {lot.inventory_item?.code ? <span className="font-mono text-[10px] text-gray-600"> ({lot.inventory_item.code})</span> : null}
            </Cell>
            {showQty && <Cell className="font-mono">{qty(lot.quantity)} {lot.inventory_item?.unit_of_measure ?? ""}</Cell>}
          </tr>
        ))}
      </PrintTable>
    </div>
  );

/**
 * The A4 count sheet: one row per line in counting order with an empty
 * box for the counted figure. A blind count prints no system quantities.
 */
export const StockCountSheetDocument: React.FC<{ sheet: StockCountSheet }> = ({ sheet }) => {
  const hidden = sheet.system_quantities_hidden;
  const head = [
    "#",
    "رمز الصنف",
    "الصنف",
    "الوحدة",
    "اللوت",
    ...(hidden ? [] : ["الدفترية"]),
    "المعدودة",
    ...(hidden ? [] : ["الفرق"]),
    "ملاحظات",
  ];

  return (
    <PrintDocument
      title="ورقة جرد المخزون"
      number={sheet.number}
      date={sheet.printed_at}
      issuer={sheet.operating_unit?.name}
      meta={[
        { label: "المخزن", value: sheet.warehouse?.name ?? "—" },
        { label: "تاريخ الجرد", value: formatDate(sheet.count_date) },
        { label: "الفئة", value: sheet.category?.name ?? "كل الأصناف" },
        { label: "الحالة", value: STOCK_COUNT_STATUS_LABEL[sheet.status] ?? sheet.status },
        { label: "نوع الجرد", value: sheet.blind ? "جرد أعمى" : "جرد مفتوح" },
        { label: "فتحه", value: sheet.created_by?.name ?? "—" },
        ...(sheet.notes ? [{ label: "ملاحظات", value: sheet.notes }] : []),
      ]}
      signatures={["القائم بالجرد", "أمين المخزن", "المعتمد"]}
    >
      <PrintTable head={head}>
        {sheet.rows.map((row) => (
          <tr key={row.line_id}>
            <Cell className="w-8 text-center">{row.no}</Cell>
            <Cell className="font-mono text-[11px]">{row.item_code ?? "—"}</Cell>
            <Cell>{row.item_name ?? "—"}</Cell>
            <Cell>{row.unit_of_measure ?? ""}</Cell>
            <Cell className="font-mono text-[11px]">{row.is_found ? "موجود غير مسجل" : row.lot_number ?? "—"}</Cell>
            {!hidden && <Cell className="font-mono text-end">{qty(row.system_qty)}</Cell>}
            <Cell className="w-20 font-mono text-end font-bold">{qty(row.counted_qty)}</Cell>
            {!hidden && <Cell className="font-mono text-end">{qty(row.variance_qty)}</Cell>}
            <Cell className="w-28">{row.note ?? ""}</Cell>
          </tr>
        ))}
      </PrintTable>

      <div className="text-[11px]">
        الأسطر: {formatNumber(sheet.summary.lines_total)} — المعدودة: {formatNumber(sheet.summary.lines_counted)} — موجود غير مسجل:{" "}
        {formatNumber(sheet.summary.found_lines)}
      </div>

      {!hidden && sheet.summary.shortage_value !== undefined && (
        <dl className="grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <dt className="text-gray-600">العجز</dt>
            <dd className="font-mono font-bold">
              {qty(sheet.summary.shortage_qty)} — {money(sheet.summary.shortage_value)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">الزيادة</dt>
            <dd className="font-mono font-bold">
              {qty(sheet.summary.surplus_qty)} — {money(sheet.summary.surplus_value)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">صافي الفرق</dt>
            <dd className="font-mono font-bold">{money(sheet.summary.net_value)}</dd>
          </div>
        </dl>
      )}

      <ExcludedTable title="لوتات محجوزة (خارج الجرد)" lots={sheet.reserved_lots} showQty={!hidden} />
      <ExcludedTable title="لوتات تشغيلات إنتاج غير مغلقة (خارج الجرد)" lots={sheet.excluded_lots} showQty={!hidden} />
    </PrintDocument>
  );
};

export const StockCountSheetDialog: React.FC<{ countId: string | null; onClose: () => void }> = ({ countId, onClose }) => {
  const { data, isLoading, error } = useStockCountSheet(countId ?? undefined, Boolean(countId));
  return (
    <PrintDialog
      open={Boolean(countId)}
      onClose={onClose}
      title="ورقة جرد المخزون"
      isLoading={isLoading}
      error={error ? stockCountErrorMessage(error, "تعذّر تحميل ورقة الجرد.") : null}
    >
      {data && <StockCountSheetDocument sheet={data} />}
    </PrintDialog>
  );
};
