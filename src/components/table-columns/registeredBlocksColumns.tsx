import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { StockLot } from "../../api/endpoints/inventory";

// Registered blocks — the page's main per-batch list; can grow large, so it gets
// sorting/search/pagination like a top-level list would.
export function useRegisteredBlocksColumns(): ColumnDef<StockLot, unknown>[] {
  return useMemo<ColumnDef<StockLot, unknown>[]>(
    () => [
      {
        id: "lot_number",
        accessorKey: "lot_number",
        header: "كود البلوك",
        meta: { className: "font-mono font-bold text-app-accent" },
        cell: ({ row }) => row.original.lot_number,
      },
      {
        id: "sequence_in_batch",
        accessorKey: "sequence_in_batch",
        header: "التسلسل",
        meta: { className: "font-mono" },
        cell: ({ row }) => row.original.sequence_in_batch ?? "—",
      },
      {
        id: "pressure",
        accessorKey: "pressure",
        header: "الضغط",
        meta: { className: "font-mono" },
        cell: ({ row }) => row.original.pressure ?? "—",
      },
      {
        id: "dimensions",
        header: "الأبعاد",
        enableSorting: false,
        meta: { className: "font-mono text-app-label-secondary" },
        cell: ({ row }) => (
          <>
            {row.original.length_m}م × {row.original.width_m}م × {row.original.height_m}م
          </>
        ),
      },
      {
        id: "volume_m3",
        accessorKey: "volume_m3",
        header: "الحجم",
        meta: { className: "font-mono" },
        cell: ({ row }) => (
          <>
            {row.original.volume_m3} م³
          </>
        ),
      },
      {
        id: "grade",
        header: "الدرجة",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-app-accent-subtle text-app-accent">
            {row.original.grade}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "الحالة",
        meta: { className: "text-app-label-secondary" },
        cell: ({ row }) => row.original.status,
      },
    ],
    [],
  );
}
