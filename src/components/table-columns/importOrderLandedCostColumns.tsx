import { useMemo } from "react";
import { ColumnDef } from "../ui/DataTable";
import { formatNumber } from "../../lib/utils/format";
import { ImportOrder, LandedCostLine } from "../../types/procurement";
import { OperatingUnit } from "../../types/entities";
import {
  useApproveLandedCostLine,
  useMarkLandedCostLinePaid,
} from "../../hooks/useProcurement";
import { AllocationPaymentActions } from "../allocations/AllocationPaymentActions";

export interface UseImportOrderLandedCostColumnsArgs {
  selectedOrder: ImportOrder | null;
  operatingUnits: OperatingUnit[];
  approveLandedCostMutation: ReturnType<typeof useApproveLandedCostLine>;
  markLandedCostPaidMutation: ReturnType<typeof useMarkLandedCostLinePaid>;
  lineError: Record<string, string>;
  onApprove: (line: LandedCostLine, note: string) => void;
  onMarkPaid: (line: LandedCostLine, note: string) => void;
}

export function useImportOrderLandedCostColumns({
  selectedOrder,
  operatingUnits,
  approveLandedCostMutation,
  markLandedCostPaidMutation,
  lineError,
  onApprove,
  onMarkPaid,
}: UseImportOrderLandedCostColumnsArgs): ColumnDef<LandedCostLine, unknown>[] {
  return useMemo<ColumnDef<LandedCostLine, unknown>[]>(
    () => [
      {
        id: "type",
        header: "نوع التكلفة",
        cell: ({ row }) => row.original.type,
        meta: { className: "font-semibold" },
      },
      {
        id: "amount",
        header: "المبلغ",
        cell: ({ row }) => `${formatNumber(row.original.amount)} ${row.original.currency}`,
        meta: { className: "font-mono font-bold" },
      },
      {
        id: "note",
        header: "الملاحظة",
        cell: ({ row }) => row.original.note || "—",
        meta: { className: "text-app-label-secondary max-w-xs truncate" },
      },
      {
        id: "responsible",
        header: "المسؤول",
        cell: ({ row }) => row.original.payer?.name ?? row.original.approver?.name ?? "—",
        meta: { className: "text-app-label-secondary" },
      },
      {
        id: "status_action",
        header: "الحالة والإجراء",
        enableSorting: false,
        meta: { align: "end" },
        cell: ({ row }) => {
          const lc = row.original;
          const orderUnitId = selectedOrder?.operating_unit_id;
          const unit = operatingUnits.find((u) => u.id === orderUnitId);
          const managerId = unit?.manager_user_id ?? null;
          return (
            <AllocationPaymentActions
              status={lc.status}
              managerId={managerId}
              isPending={
                approveLandedCostMutation.isPending &&
                approveLandedCostMutation.variables?.lineId === lc.id
              }
              isMarkingPaid={
                markLandedCostPaidMutation.isPending &&
                markLandedCostPaidMutation.variables?.lineId === lc.id
              }
              errorMessage={lineError[lc.id] ?? null}
              onApprove={(note) => selectedOrder && onApprove(lc, note)}
              onMarkPaid={(note) => selectedOrder && onMarkPaid(lc, note)}
            />
          );
        },
      },
    ],
    [selectedOrder, operatingUnits, approveLandedCostMutation, markLandedCostPaidMutation, lineError, onApprove, onMarkPaid]
  );
}
