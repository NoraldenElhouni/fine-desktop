import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Pencil, Tags } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { InventoryItem, UOM_LABELS } from "../../api/endpoints/inventory";
import { ITEM_TYPE_LABELS, InventoryItemType } from "../../api/endpoints/categories";
import {
  INVENTORY_EVENT_LABELS,
  REQUIRED_INVENTORY_EVENTS,
  type InventoryEventType,
} from "../../api/endpoints/inventoryItemAccounts";
import { formatDate, formatNumber } from "../../lib/utils/format";

export interface UseInventoryItemsColumnsArgs {
  onEdit?: (item: InventoryItem) => void;
}

export function useInventoryItemsColumns({ onEdit }: UseInventoryItemsColumnsArgs = {}): ColumnDef<InventoryItem, unknown>[] {
  return useMemo<ColumnDef<InventoryItem, unknown>[]>(
    () => [
      {
        id: "code",
        accessorKey: "code",
        header: "رمز الصنف",
        meta: { className: "font-mono font-bold text-app-accent" },
        cell: ({ row }) => row.original.code,
      },
      {
        id: "name",
        accessorKey: "name",
        header: "الاسم",
        meta: { className: "font-medium" },
        cell: ({ row }) => row.original.name,
      },
      {
        id: "category",
        header: "الفئة والنوع",
        enableSorting: false,
        cell: ({ row }) => {
          const cat = row.original.category;
          const typeLabel =
            ITEM_TYPE_LABELS[row.original.item_type as InventoryItemType] ??
            row.original.item_type;
          return (
            <div className="flex flex-col gap-1 items-start">
              {cat ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                  <Tags className="w-3 h-3" /> {cat.name}
                </span>
              ) : (
                <span className="text-app-label-tertiary text-xs">بدون فئة</span>
              )}
              {typeLabel && (
                <span className="text-[10px] text-app-label-secondary font-medium px-1.5 py-0.5 rounded bg-app-bg-secondary border border-app-separator">
                  {typeLabel}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "uom",
        header: "وحدة القياس والتعبئة",
        enableSorting: false,
        meta: { className: "font-mono font-medium text-app-label-secondary" },
        cell: ({ row }) => {
          const item = row.original;
          const cap = Number(item.container_capacity);
          const uomLabel = UOM_LABELS[item.unit_of_measure] ?? item.unit_of_measure;
          if (cap > 0 && item.primary_uom) {
            return (
              <div className="flex flex-col">
                <span className="font-semibold text-app-label-primary text-xs">
                  1 {item.primary_uom} = {formatNumber(cap)} {uomLabel}
                </span>
                <span className="text-[10px] text-app-label-tertiary">
                  {item.primary_uom} / {uomLabel}
                </span>
              </div>
            );
          }
          return <span className="font-semibold text-app-label-primary text-xs">{uomLabel}</span>;
        },
      },
      {
        id: "accounts",
        header: "الحسابات",
        enableSorting: false,
        cell: ({ row }) => {
          const accounts = row.original.accounts ?? [];
          const byType = new Map<InventoryEventType, { id: string; account_code: string; name: string }>();
          for (const row_ of accounts) {
            if (row_.account) byType.set(row_.event_type, row_.account);
          }
          const linkedCount = byType.size;
          const missingRequired = REQUIRED_INVENTORY_EVENTS.filter((e) => !byType.has(e));
          const allRequired = missingRequired.length === 0;

          const chips: React.ReactNode[] = [];
          for (const ev of REQUIRED_INVENTORY_EVENTS) {
            const acc = byType.get(ev);
            if (acc) {
              chips.push(
                <span
                  key={ev}
                  className="inline-flex items-center gap-1 rounded-full bg-app-bg-secondary border border-app-separator px-2 py-0.5 text-[10px] font-mono font-semibold text-app-label-primary"
                  title={`${INVENTORY_EVENT_LABELS[ev]} → ${acc.name}`}
                >
                  <span className="text-app-accent">{acc.account_code}</span>
                  <span className="text-app-label-tertiary">·</span>
                  <span>{INVENTORY_EVENT_LABELS[ev]}</span>
                </span>,
              );
            } else {
              chips.push(
                <span
                  key={ev}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-app-status-danger/40 bg-app-status-danger/5 px-2 py-0.5 text-[10px] font-semibold text-app-status-danger"
                  title={`${INVENTORY_EVENT_LABELS[ev]} غير مربوط`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {INVENTORY_EVENT_LABELS[ev]}
                </span>,
              );
            }
          }

          return (
            <div className="flex flex-col gap-1 items-start">
              <div className="flex flex-wrap gap-1">{chips}</div>
              <span
                className={`text-[10px] font-semibold ${
                  allRequired ? "text-app-status-positive" : "text-app-status-danger"
                }`}
              >
                {allRequired ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> مكتمل ({linkedCount}/12)
                  </span>
                ) : (
                  <span>ينقصه {missingRequired.length} حدث ({linkedCount}/12)</span>
                )}
              </span>
            </div>
          );
        },
      },
      {
        id: "dimensions",
        header: "المقاس",
        enableSorting: false,
        meta: { className: "font-mono text-app-label-secondary" },
        cell: ({ row }) => {
          const { length_m, width_m, height_m } = row.original;
          if (!length_m && !width_m && !height_m) {
            return "—";
          }
          return (
            <>
              {length_m ?? "—"}م × {width_m ?? "—"}م × {height_m ?? "—"}م
            </>
          );
        },
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: "تاريخ الإنشاء",
        meta: { className: "text-app-label-tertiary" },
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(item);
                }}
                className="flex items-center gap-1 rounded-lg border border-app-separator px-2.5 py-1 text-xs font-semibold text-app-label-secondary hover:border-app-accent hover:text-app-accent hover:bg-app-accent-subtle transition-colors"
                title="تعديل الصنف"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit]
  );
}

