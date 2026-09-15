import React, { useState } from "react";
import { Check, ShieldCheck, DollarSign, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { ALLOCATION_PAYMENT_STATUS_LABEL, type AllocationPaymentStatus } from "../../api/endpoints/overhead";
import { LANDED_COST_STATUS_LABEL, type LandedCostStatus } from "../../types/procurement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../ui/Dialog";

export type AllocationStatus = AllocationPaymentStatus | LandedCostStatus;

export const ALLOCATION_STATUS_LABEL: Record<AllocationStatus, string> = {
  ...ALLOCATION_PAYMENT_STATUS_LABEL,
  ...LANDED_COST_STATUS_LABEL,
};

interface AllocationPaymentActionsProps {
  status: AllocationStatus;
  approverId?: string | null;
  payerId?: string | null;
  managerId: string | null | undefined;
  isPending: boolean;
  isMarkingPaid: boolean;
  errorMessage?: string | null;
  onApprove: (note: string) => void;
  onMarkPaid: (note: string) => void;
}

const STATUS_BADGE: Record<AllocationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-800",
};

export const AllocationPaymentActions: React.FC<AllocationPaymentActionsProps> = ({
  status,
  managerId,
  isPending,
  isMarkingPaid,
  errorMessage,
  onApprove,
  onMarkPaid,
}) => {
  const user = useAuthStore((s) => s.user);
  const [noteOpen, setNoteOpen] = useState<"approve" | "paid" | null>(null);
  const [note, setNote] = useState("");

  const userId = user ? String(user.id) : null;
  const isManager = managerId != null && userId === managerId;
  const noManager = managerId == null;

  if (status === "paid") {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
        {ALLOCATION_STATUS_LABEL.paid}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_BADGE[status]}`}>
        {ALLOCATION_STATUS_LABEL[status]}
      </span>

      {errorMessage && (
        <span className="text-[10px] text-rose-700 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {errorMessage}
        </span>
      )}

      {noManager && (
        <span className="text-[10px] text-amber-700">
          لا يوجد مستخدم مسؤول على هذه الوحدة.
        </span>
      )}

      {isManager && (status as string) !== "paid" && (
        <div className="flex items-center gap-2">
          {status === "pending" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setNote("");
                setNoteOpen("approve");
              }}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              اعتماد
            </button>
          )}
          {status === "approved" && (
            <button
              type="button"
              disabled={isMarkingPaid}
              onClick={() => {
                setNote("");
                setNoteOpen("paid");
              }}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              <DollarSign className="h-3.5 w-3.5" />
              تأكيد الدفع
            </button>
          )}
        </div>
      )}

      <Dialog open={isManager && Boolean(noteOpen)} onOpenChange={(next) => !next && setNoteOpen(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {noteOpen === "approve" ? "اعتماد التكلفة" : "تأكيد دفع التكلفة"}
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="ملاحظة (اختياري)"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs focus:outline-none"
            />
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setNoteOpen(null)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => {
                const handler = noteOpen === "approve" ? onApprove : onMarkPaid;
                handler(note.trim() || "");
                setNoteOpen(null);
              }}
              className="flex items-center gap-1 rounded-xl bg-app-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" />
              تأكيد
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
