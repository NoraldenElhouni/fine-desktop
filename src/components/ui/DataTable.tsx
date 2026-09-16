import React, { createContext, useContext, useMemo, useState } from "react";
import {
  ColumnDef,
  RowSelectionState,
  SortingState,
  PaginationState,
  Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Search,
} from "lucide-react";
import { cn } from "../../lib/utils/utils";

// Lets column defs carry the same per-column display hints the old hand-rolled
// table took as props (align/className), read back in DataTable.Content.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: "start" | "center" | "end";
    className?: string;
    headerClassName?: string;
  }
}

export type { ColumnDef } from "@tanstack/react-table";

function getAlignClass(align?: "start" | "center" | "end"): string {
  switch (align) {
    case "center":
      return "text-center";
    case "end":
      return "text-end";
    default:
      return "text-start";
  }
}

/** Prepend to `columns` when building the instance to get a checkbox column for row selection. */
export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "__select__",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        ref={(el) => {
          if (el)
            el.indeterminate =
              table.getIsSomePageRowsSelected() &&
              !table.getIsAllPageRowsSelected();
        }}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="rounded border-app-separator text-app-accent focus:ring-app-accent"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="rounded border-app-separator text-app-accent focus:ring-app-accent"
      />
    ),
    size: 36,
    enableSorting: false,
    meta: { align: "center" },
  };
}

export interface UseDataTableOptions<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** Click a column header to sort. Off by default — opt in per table. */
  enableSorting?: boolean;
  /** Wires DataTable.SearchInput to filter every column's text client-side. */
  enableGlobalFilter?: boolean;
  /** Adds a checkbox column and tracks selected rows (read via table.getSelectedRowModel()). */
  enableRowSelection?: boolean;
  /** Client-side pagination. On by default per the app's convention. */
  enablePagination?: boolean;
  pageSize?: number;
  getRowId?: (row: TData, index: number) => string;
}

export interface DataTableInstance<TData> {
  table: TanstackTable<TData>;
  enableSorting: boolean;
  enableGlobalFilter: boolean;
  enableRowSelection: boolean;
  enablePagination: boolean;
}

/**
 * Headless TanStack Table wiring. Returns a bundle you pass to <DataTable table={...}>,
 * and keep around in your page component to read selection / call table.setGlobalFilter etc.
 */
export function useDataTable<TData>({
  columns,
  data,
  enableSorting = false,
  enableGlobalFilter = false,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 10,
  getRowId,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const finalColumns = useMemo(
    () =>
      enableRowSelection
        ? [createSelectionColumn<TData>(), ...columns]
        : columns,
    [columns, enableRowSelection],
  );

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      ...(enableSorting ? { sorting } : {}),
      ...(enableGlobalFilter ? { globalFilter } : {}),
      ...(enableRowSelection ? { rowSelection } : {}),
      ...(enablePagination ? { pagination } : {}),
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onGlobalFilterChange: enableGlobalFilter ? setGlobalFilter : undefined,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onPaginationChange: enablePagination ? setPagination : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableGlobalFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    enableRowSelection,
    getRowId: getRowId as ((row: TData, index: number) => string) | undefined,
  });

  return {
    table,
    enableSorting,
    enableGlobalFilter,
    enableRowSelection,
    enablePagination,
  };
}

const DataTableContext = createContext<DataTableInstance<any> | null>(null);

function useDataTableContext<TData>(
  component: string,
): DataTableInstance<TData> {
  const ctx = useContext(DataTableContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside a <DataTable>`);
  }
  return ctx;
}

export interface DataTableProps<TData> {
  table: DataTableInstance<TData>;
  children: React.ReactNode;
  className?: string;
}

function DataTableRoot<TData>({
  table,
  children,
  className,
}: DataTableProps<TData>) {
  return (
    <DataTableContext.Provider value={table}>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm",
          className,
        )}
        dir="rtl"
      >
        {children}
      </div>
    </DataTableContext.Provider>
  );
}

export interface DataTableSlotProps {
  children?: React.ReactNode;
  className?: string;
}

/** Optional top strip inside the table card — put a DataTable.Toolbar and/or DataTable.Actions in it. */
const DataTableHeader: React.FC<DataTableSlotProps> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-between gap-3 border-b border-app-separator bg-app-bg-secondary px-4 py-3",
      className,
    )}
  >
    {children}
  </div>
);

/** Left-hand (search/filters) side of the header — free-form children. */
const DataTableToolbar: React.FC<DataTableSlotProps> = ({
  children,
  className,
}) => (
  <div className={cn("flex flex-1 flex-wrap items-center gap-2", className)}>
    {children}
  </div>
);

/** Right-hand action buttons (e.g. "Add New") — free-form children. */
const DataTableActions: React.FC<DataTableSlotProps> = ({
  children,
  className,
}) => (
  <div className={cn("flex shrink-0 items-center gap-2", className)}>
    {children}
  </div>
);

/** Search box wired to the table's global filter. Requires enableGlobalFilter on useDataTable. */
const DataTableSearchInput: React.FC<{
  placeholder?: string;
  className?: string;
}> = ({ placeholder = "بحث…", className }) => {
  const { table } = useDataTableContext("DataTable.SearchInput");
  return (
    <div className={cn("relative min-w-[10rem] flex-1", className)}>
      <Search className="absolute inset-y-0 start-3 my-auto h-3.5 w-3.5 text-app-label-tertiary pointer-events-none" />
      <input
        type="text"
        value={(table.getState().globalFilter as string) ?? ""}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        placeholder={placeholder}
        className="w-full ps-9 pe-3 py-2 border border-app-separator rounded-xl bg-app-bg-primary text-xs text-app-label-primary placeholder-app-label-tertiary focus:border-app-accent focus:outline-none"
      />
    </div>
  );
};

/** Bar that appears only while rows are selected — put bulk-action buttons in it. */
const DataTableBulkActions: React.FC<DataTableSlotProps> = ({
  children,
  className,
}) => {
  const { table, enableRowSelection } = useDataTableContext(
    "DataTable.BulkActions",
  );
  if (!enableRowSelection) return null;
  const count = table.getSelectedRowModel().rows.length;
  if (count === 0) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-b border-app-separator bg-app-accent-tint px-4 py-2.5",
        className,
      )}
    >
      <span className="text-xs font-bold text-app-accent">{count} محدد</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
};

export interface DataTableContentProps<TData> {
  isLoading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  onRowClick?: (row: TData) => void;
  className?: string;
}

function DataTableContent<TData>({
  isLoading = false,
  skeletonRows = 4,
  emptyMessage = "لا توجد بيانات متاحة حالياً.",
  emptyIcon: EmptyIcon = Inbox,
  onRowClick,
  className,
}: DataTableContentProps<TData>) {
  const { table, enableSorting } =
    useDataTableContext<TData>("DataTable.Content");
  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-start text-xs">
        <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-bold">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = enableSorting && header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const meta = header.column.columnDef.meta;
                return (
                  <th
                    key={header.id}
                    style={
                      header.getSize() !== 150
                        ? { width: header.getSize() }
                        : undefined
                    }
                    className={cn(
                      "px-4 py-3",
                      getAlignClass(meta?.align),
                      canSort && "cursor-pointer select-none",
                      meta?.headerClassName,
                    )}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort &&
                          (sorted === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          ))}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-app-separator text-app-label-primary">
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <tr key={`skeleton-${rowIdx}`} className="animate-pulse">
                {Array.from({ length: columnCount }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-4">
                    <div className="h-3.5 rounded bg-app-fill-f2 w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="py-14 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-app-label-tertiary">
                  <EmptyIcon className="h-8 w-8 text-app-label-secondary/40 mb-1" />
                  <span className="text-xs font-semibold text-app-label-secondary">
                    {emptyMessage}
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                className={cn(
                  "transition-colors",
                  onRowClick
                    ? "cursor-pointer hover:bg-app-fill-f1"
                    : "hover:bg-app-fill-f1/40",
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3",
                        getAlignClass(meta?.align),
                        meta?.className,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const DataTablePagination: React.FC<{
  pageSizeOptions?: number[];
  className?: string;
}> = ({ pageSizeOptions = PAGE_SIZE_OPTIONS, className }) => {
  const { table, enablePagination } = useDataTableContext(
    "DataTable.Pagination",
  );
  if (!enablePagination) return null;

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(totalRows, (pageIndex + 1) * pageSize);
  const pageCount = table.getPageCount() || 1;

  const navBtn =
    "rounded-lg p-1.5 text-app-label-secondary hover:bg-app-fill-f1 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-app-separator bg-app-bg-secondary px-4 py-3 text-xs text-app-label-secondary",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span>
          عرض {start}–{end} من {totalRows}
        </span>
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="rounded-lg border border-app-separator bg-app-bg-primary px-2 py-1 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n} / صفحة
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className={navBtn}
          aria-label="الصفحة الأولى"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={navBtn}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <span className="px-2 font-semibold text-app-label-primary">
          صفحة {pageIndex + 1} من {pageCount}
        </span>
        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={navBtn}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          className={navBtn}
          aria-label="الصفحة الأخيرة"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export const DataTable = Object.assign(DataTableRoot, {
  Header: DataTableHeader,
  Toolbar: DataTableToolbar,
  Actions: DataTableActions,
  SearchInput: DataTableSearchInput,
  BulkActions: DataTableBulkActions,
  Content: DataTableContent,
  Pagination: DataTablePagination,
});
