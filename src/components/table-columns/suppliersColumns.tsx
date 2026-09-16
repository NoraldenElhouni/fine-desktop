import { useMemo } from "react";
import { Building, MapPin } from "lucide-react";
import { ColumnDef } from "../ui/DataTable";
import { Supplier } from "../../types/procurement";

export function useSuppliersColumns(): ColumnDef<Supplier, unknown>[] {
  return useMemo<ColumnDef<Supplier, unknown>[]>(
    () => [
      {
        id: "name",
        header: "اسم المورد",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-app-accent" />
            <span>{row.original.name}</span>
          </div>
        ),
        meta: { className: "font-bold" },
      },
      {
        id: "default_currency",
        header: "العملة الافتراضية",
        accessorKey: "default_currency",
        cell: ({ row }) => (
          <span className="rounded-md bg-app-bg-secondary px-2 py-1 font-bold text-app-label-primary">
            {row.original.default_currency}
          </span>
        ),
        meta: { className: "font-mono" },
      },
      {
        id: "contact",
        header: "معلومات الاتصال",
        accessorFn: (sup) => sup.contact || "—",
        meta: { className: "font-semibold text-app-label-secondary" },
      },
      {
        id: "address",
        header: "العنوان / المرفأ",
        accessorFn: (sup) => sup.address || "غير محدد",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-app-label-secondary" />
            <span>{row.original.address || "غير محدد"}</span>
          </div>
        ),
        meta: { className: "text-app-label-secondary" },
      },
    ],
    []
  );
}
