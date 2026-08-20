import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "../../lib/utils/utils";

export interface Column<T> {
  header: React.ReactNode;
  key?: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "start" | "center" | "end";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
  skeletonRows?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "لا توجد بيانات متاحة حالياً.",
  emptyIcon: EmptyIcon = Inbox,
  onRowClick,
  keyExtractor,
  className,
  skeletonRows = 4,
}: DataTableProps<T>) {
  const getAlignClass = (align?: Column<T>["align"]) => {
    switch (align) {
      case "center":
        return "text-center";
      case "end":
        return "text-end";
      case "start":
      default:
        return "text-start";
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm",
        className
      )}
      dir="rtl"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary font-semibold">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={cn(
                    "px-4 py-3.5 whitespace-nowrap",
                    getAlignClass(col.align),
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-app-separator">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-col-${cIdx}`} className="px-4 py-4">
                      <div className="h-3.5 rounded bg-app-fill-f2 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-app-label-tertiary">
                    <EmptyIcon className="h-8 w-8 text-app-label-secondary/40 mb-1" />
                    <span className="text-xs font-semibold text-app-label-secondary">
                      {emptyMessage}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => {
                const key = keyExtractor
                  ? keyExtractor(item, rowIdx)
                  : item.id || rowIdx;
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-app-fill-f1",
                      !onRowClick && "hover:bg-app-fill-f1/40"
                    )}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.key || colIdx}
                        className={cn(
                          "px-4 py-3 text-app-label-primary",
                          getAlignClass(col.align),
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(item, rowIdx)
                          : col.key
                          ? item[col.key]
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
