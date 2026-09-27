import React from "react";
import { PrintDocument, PrintTable, Cell, PrintDialog } from "./PrintDocument";
import { CUTTER_STATUS_LABEL, CutterJobSheet as CutterJobSheetData } from "../../api/endpoints/cutter";
import { useJobSheet } from "../../hooks/useCutter";
import { apiErrorPayload } from "../../api/endpoints/production";
import { formatNumber } from "../../lib/utils/format";

const size = (l?: number | null, w?: number | null, h?: number | null): string =>
  l && w && h ? `${(l * 100).toFixed(0)}×${(w * 100).toFixed(0)}×${(h * 100).toFixed(0)} سم` : "—";

/** The cutter's instructions — sizes and quantities only, no prices. */
export const CutterJobSheetDocument: React.FC<{ sheet: CutterJobSheetData }> = ({ sheet }) => (
  <PrintDocument
    title="ورقة عمل التقطيع"
    number={sheet.order_number}
    date={sheet.date}
    issuer={sheet.cutter}
    meta={[
      { label: "الحالة", value: CUTTER_STATUS_LABEL[sheet.status] ?? sheet.status },
      ...(sheet.notes ? [{ label: "ملاحظات", value: sheet.notes }] : []),
    ]}
    signatures={["المشغّل", "مراقبة الجودة"]}
  >
    {sheet.blocks.length > 0 && (
      <div className="space-y-1">
        <div className="text-xs font-bold">البلوكات</div>
        <PrintTable head={["رقم اللوت", "المقاس"]}>
          {sheet.blocks.map((b, i) => (
            <tr key={i}>
              <Cell className="font-mono">{b.lot_number ?? "—"}</Cell>
              <Cell className="font-mono">{size(b.length_m, b.width_m, b.height_m)}</Cell>
            </tr>
          ))}
        </PrintTable>
      </div>
    )}

    <div className="space-y-1">
      <div className="text-xs font-bold">القطع المطلوب تقطيعها</div>
      <PrintTable head={["#", "الشكل المطلوب", "المقاس", "الكمية", "المخرجات", "من بيع"]}>
        {sheet.lines.map((line, i) => (
          <tr key={i}>
            <Cell className="w-8 text-center">{i + 1}</Cell>
            <Cell>{line.requested_spec}</Cell>
            <Cell className="font-mono">{size(line.length_m, line.width_m, line.height_m)}</Cell>
            <Cell className="w-16 text-center font-mono font-bold">{formatNumber(line.quantity)}</Cell>
            <Cell>{line.output_item ?? "—"}{line.output_sku ? ` (${line.output_sku})` : ""}</Cell>
            <Cell>
              {line.sale_number ? (
                <>
                  <div className="font-mono text-[11px]">{line.sale_number}</div>
                  <div className="text-[10px] text-gray-600">{[line.bundle, line.client].filter(Boolean).join(" — ")}</div>
                </>
              ) : (
                "لأجل المخزون"
              )}
            </Cell>
          </tr>
        ))}
      </PrintTable>
    </div>
  </PrintDocument>
);

export const CutterJobSheetDialog: React.FC<{ orderId: string | null; onClose: () => void }> = ({ orderId, onClose }) => {
  const { data, isLoading, error } = useJobSheet(orderId ?? undefined, Boolean(orderId));
  return (
    <PrintDialog
      open={Boolean(orderId)}
      onClose={onClose}
      title="ورقة عمل التقطيع"
      isLoading={isLoading}
      error={error ? apiErrorPayload(error)?.message ?? "تعذّر تحميل ورقة العمل." : null}
    >
      {data && <CutterJobSheetDocument sheet={data} />}
    </PrintDialog>
  );
};
