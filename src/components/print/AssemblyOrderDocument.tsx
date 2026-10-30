import React from "react";
import { PrintDocument, PrintTable, Cell, PrintDialog, money } from "./PrintDocument";
import { ASSEMBLY_STATUS_LABEL, AssemblyOrder, sizeLabel } from "../../api/endpoints/assemblyOrders";
import { UOM_LABELS } from "../../api/endpoints/inventory";
import { formatDateTime, formatNumber } from "../../lib/utils/format";

const qty = (v: number | string | null | undefined): string =>
  v === null || v === undefined ? "" : formatNumber(v, { maximumFractionDigits: 4 });
const uom = (u?: string | null) => (u ? UOM_LABELS[u] ?? u : "");

/**
 * The A4 assembly order: the finished item, its components with the lot each
 * drew from and its actual cost, and the cost roll-up. A draft prints as a
 * pick list (lots left to completion show as automatic, costs blank).
 */
export const AssemblyOrderDocument: React.FC<{ order: AssemblyOrder }> = ({ order }) => {
  const s = order.summary;
  return (
    <PrintDocument
      title="أمر تجميع أثاث"
      number={order.number}
      date={order.created_at}
      issuer={order.output_warehouse?.name ? `مخزن الإنتاج: ${order.output_warehouse.name}` : null}
      meta={[
        {
          label: "المنتج",
          value: `${order.finished_item?.name ?? "—"}${order.finished_item?.code ? ` (${order.finished_item.code})` : ""}`,
        },
        { label: "الكمية", value: `${qty(order.quantity)} ${uom(order.finished_item?.unit_of_measure)}` },
        { label: "الحالة", value: ASSEMBLY_STATUS_LABEL[order.status] ?? order.status },
        ...(order.bundle ? [{ label: "قالب الحزمة", value: order.bundle.name }] : []),
        { label: "أنشأه", value: order.created_by?.name ?? "—" },
        ...(order.completed_by && order.completed_at
          ? [{ label: "أتمّه", value: `${order.completed_by.name} — ${formatDateTime(order.completed_at)}` }]
          : []),
        ...(order.finished_stock_lots.length > 0
          ? [{ label: "لوت المنتج التام", value: order.finished_stock_lots.map((l) => l.lot_number).join("، ") }]
          : []),
        ...(order.journal_entry ? [{ label: "القيد", value: order.journal_entry.reference ?? "—" }] : []),
        ...(order.notes ? [{ label: "ملاحظات", value: order.notes }] : []),
      ]}
      signatures={["المجمِّع", "أمين المخزن", "مدير قسم الأثاث"]}
    >
      <PrintTable head={["#", "رمز المكوّن", "المكوّن", "المقاس", "اللوت", "الكمية", "تكلفة الوحدة", "الإجمالي"]}>
        {order.lines.map((line, i) => (
          <tr key={line.id}>
            <Cell className="w-8 text-center">{i + 1}</Cell>
            <Cell className="font-mono text-[11px]">{line.inventory_item?.code ?? "—"}</Cell>
            <Cell>{line.inventory_item?.name ?? "—"}</Cell>
            <Cell className="font-mono text-[11px]">{sizeLabel(line.length_m, line.width_m, line.height_m) ?? ""}</Cell>
            <Cell className="font-mono text-[11px]">{line.stock_lot?.lot_number ?? "تلقائي"}</Cell>
            <Cell className="font-mono text-end">
              {qty(line.quantity)} {uom(line.inventory_item?.unit_of_measure)}
            </Cell>
            <Cell className="font-mono text-end">{line.unit_cost === null ? "" : qty(line.unit_cost)}</Cell>
            <Cell className="font-mono text-end">{line.total_cost === null ? "" : money(line.total_cost)}</Cell>
          </tr>
        ))}
        {s.total_cost !== null && (
          <tr>
            <Cell colSpan={7} className="text-end font-bold">
              إجمالي تكلفة المكونات
            </Cell>
            <Cell className="font-mono text-end font-bold">{money(s.total_cost)}</Cell>
          </tr>
        )}
      </PrintTable>

      {s.total_cost !== null && (
        <dl className="grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <dt className="text-gray-600">التكلفة الإجمالية (مدين 1134)</dt>
            <dd className="font-mono font-bold">{money(s.total_cost)}</dd>
          </div>
          <div>
            <dt className="text-gray-600">تكلفة الوحدة</dt>
            <dd className="font-mono font-bold">{s.unit_cost === null ? "—" : `${qty(s.unit_cost)} د.ل`}</dd>
          </div>
          <div>
            <dt className="text-gray-600">لوتات المنتج التام</dt>
            <dd className="font-mono font-bold">
              {order.finished_stock_lots.map((l) => `${l.lot_number}: ${qty(l.quantity)} × ${qty(l.unit_cost)}`).join(" · ")}
            </dd>
          </div>
        </dl>
      )}
    </PrintDocument>
  );
};

export const AssemblyOrderPrintDialog: React.FC<{ order: AssemblyOrder | null; onClose: () => void }> = ({ order, onClose }) => (
  <PrintDialog open={Boolean(order)} onClose={onClose} title="أمر تجميع أثاث">
    {order && <AssemblyOrderDocument order={order} />}
  </PrintDialog>
);
