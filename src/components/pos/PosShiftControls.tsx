import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Clock, FileSpreadsheet, LogIn, LogOut, PlayCircle, Settings, StopCircle, Users } from "lucide-react";
import { PosShift, salesErrorMessage } from "../../api/endpoints/sales";
import { apiErrorPayload } from "../../api/endpoints/production";
import { useUpdatePosShiftSettings } from "../../hooks/useSales";
import { toast } from "../../stores/toastStore";
import { formatDateTime, localDateIso } from "../../lib/utils/format";

/** Close a popover on an outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

/** HH:MM today, the full date and time for a shift opened on an earlier day. */
const sinceLabel = (iso: string): string => {
  const d = new Date(iso);
  if (localDateIso(d) === localDateIso()) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return formatDateTime(iso);
};

interface PosShiftChipProps {
  /** The shift this POS works under: the user's own, or a colleague's they chose to join. */
  shift: PosShift | null;
  /** The shown shift is the logged-in user's own. */
  isOwn: boolean;
  /** The unit's open shifts of other cashiers, joinable explicitly (shared drawer). */
  otherShifts: PosShift[];
  /** The user's further open shifts (another drawer or terminal), beyond the one shown. */
  extraOwnShifts?: PosShift[];
  /** May close a colleague's shift (manager); the server still checks. */
  canCloseOthers: boolean;
  isLoading?: boolean;
  onOpenShift: () => void;
  onXReport: () => void;
  onCloseShift: () => void;
  /** Close any listed open shift (an extra own one, or a colleague's for a manager). */
  onCloseShiftById: (shiftId: string) => void;
  /** Work under a colleague's open shift, or null to leave it. */
  onJoinShift: (shiftId: string | null) => void;
}

const menuItem = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-app-label-primary hover:bg-app-fill-f1 text-start";

/** The POS header chip of a unit that runs cashier shifts. */
export const PosShiftChip: React.FC<PosShiftChipProps> = ({
  shift,
  isOwn,
  otherShifts,
  extraOwnShifts = [],
  canCloseOthers,
  isLoading,
  onOpenShift,
  onXReport,
  onCloseShift,
  onCloseShiftById,
  onJoinShift,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useDismiss(menuOpen, () => setMenuOpen(false));

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-app-separator bg-app-bg-primary px-4 py-2 text-xs text-app-label-secondary shadow-sm">
        جاري تحميل الوردية...
      </div>
    );
  }

  const run = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  const shiftLabel = (s: PosShift) => `الوردية ${s.number} — ${s.cashier?.name ?? "—"} — ${s.cash_account?.name ?? "—"}`;
  const closeButton = (s: PosShift) => (
    <button
      type="button"
      onClick={run(() => onCloseShiftById(s.id))}
      title={`إغلاق ${shiftLabel(s)}`}
      className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-app-status-danger hover:bg-app-fill-f1"
    >
      <StopCircle className="h-3.5 w-3.5" />
      إغلاق
    </button>
  );

  if (!shift) {
    return (
      <div ref={ref} className="relative">
        <div className="flex items-center gap-2 rounded-2xl border border-app-status-warning/40 bg-app-status-warning/10 px-3 py-1.5 text-xs shadow-sm">
          <Clock className="h-4 w-4 text-app-status-warning" />
          <span className="font-semibold text-app-status-warning">
            {otherShifts.length > 0 ? "لا توجد وردية مفتوحة لك" : "لا توجد وردية مفتوحة"}
          </span>
          <button
            type="button"
            onClick={onOpenShift}
            className="flex items-center gap-1 rounded-xl bg-app-accent px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            فتح وردية
          </button>
          {otherShifts.length > 0 && (
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              title="ورديات الزملاء المفتوحة"
              className="flex items-center gap-1 rounded-xl border border-app-separator bg-app-bg-primary px-2 py-1 text-[11px] font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              <Users className="h-3.5 w-3.5" />
              {otherShifts.length}
              <ChevronDown className="h-3 w-3" />
            </button>
          )}
        </div>
        {menuOpen && otherShifts.length > 0 && (
          <div className="absolute end-0 z-40 mt-1 w-72 rounded-xl border border-app-separator bg-app-bg-primary p-1 shadow-lg">
            <div className="px-3 py-1.5 text-[10px] font-bold text-app-label-secondary">
              ورديات مفتوحة لزملاء — العمل على إحداها يقبض النقد في درجها وتقريرها
            </div>
            {otherShifts.map((s) => (
              <div key={s.id} className="flex items-center gap-1">
                <button type="button" onClick={run(() => onJoinShift(s.id))} className={menuItem}>
                  <LogIn className="h-4 w-4 shrink-0 text-app-accent" />
                  <span>العمل على {shiftLabel(s)}</span>
                </button>
                {canCloseOthers && closeButton(s)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const canClose = isOwn || canCloseOthers;
  // The unit's other open shifts stay reachable from here: the user's extra ones (close), colleagues'
  // (switch to, when not on an own shift; close, for a manager) — the day cannot close while any is open.
  const colleagueShifts = otherShifts.filter((s) => s.id !== shift.id);
  const reachableColleagues = !isOwn || canCloseOthers ? colleagueShifts : [];
  const hasMoreShifts = extraOwnShifts.length > 0 || reachableColleagues.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors ${
          isOwn
            ? "border-app-status-positive/40 bg-app-status-positive/10 text-app-status-positive hover:bg-app-status-positive/15"
            : "border-app-status-info/40 bg-app-status-info/10 text-app-status-info hover:bg-app-status-info/15"
        }`}
      >
        <Clock className="h-4 w-4" />
        <span>
          وردية مفتوحة — {shift.cash_account?.name ?? "—"} — منذ <span className="font-mono">{sinceLabel(shift.opened_at)}</span>
          {!isOwn && <> — الكاشير: {shift.cashier?.name ?? "—"}</>}
        </span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {menuOpen && (
        <div
          className={`absolute end-0 z-40 mt-1 ${hasMoreShifts ? "w-80" : "w-52"} rounded-xl border border-app-separator bg-app-bg-primary p-1 shadow-lg`}
        >
          <button type="button" onClick={run(onXReport)} className={menuItem}>
            <FileSpreadsheet className="h-4 w-4 text-app-accent" />
            تقرير X
          </button>
          {canClose && (
            <button
              type="button"
              onClick={run(onCloseShift)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-app-status-danger hover:bg-app-fill-f1"
            >
              <StopCircle className="h-4 w-4" />
              إغلاق الوردية
            </button>
          )}
          {!isOwn && (
            <>
              <button type="button" onClick={run(() => onJoinShift(null))} className={menuItem}>
                <LogOut className="h-4 w-4 text-app-label-secondary" />
                ترك وردية الزميل
              </button>
              <button type="button" onClick={run(onOpenShift)} className={menuItem}>
                <PlayCircle className="h-4 w-4 text-app-accent" />
                فتح وردية خاصة بي
              </button>
            </>
          )}
          {hasMoreShifts && (
            <>
              <div className="mt-1 border-t border-app-separator px-3 pb-1 pt-2 text-[10px] font-bold text-app-label-secondary">
                ورديات مفتوحة أخرى — تُغلق كلها قبل إقفال يومية الصندوق
              </div>
              {extraOwnShifts.map((s) => (
                <div key={s.id} className="flex items-center gap-1">
                  <span className="flex-1 px-3 py-2 text-xs text-app-label-primary">{shiftLabel(s)} (لك)</span>
                  {closeButton(s)}
                </div>
              ))}
              {reachableColleagues.map((s) => (
                <div key={s.id} className="flex items-center gap-1">
                  {isOwn ? (
                    <span className="flex-1 px-3 py-2 text-xs text-app-label-primary">{shiftLabel(s)}</span>
                  ) : (
                    <button type="button" onClick={run(() => onJoinShift(s.id))} className={menuItem}>
                      <LogIn className="h-4 w-4 shrink-0 text-app-accent" />
                      <span>العمل على {shiftLabel(s)}</span>
                    </button>
                  )}
                  {canCloseOthers && closeButton(s)}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface PosSettingsMenuProps {
  unitId: string;
  shiftsEnabled: boolean;
}

/** POS settings for the owner and unit managers: switch cashier shifts on or off. */
export const PosSettingsMenu: React.FC<PosSettingsMenuProps> = ({ unitId, shiftsEnabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const update = useUpdatePosShiftSettings();

  const toggle = () => {
    update.mutate(
      { unitId, enabled: !shiftsEnabled },
      {
        onSuccess: (res) => toast.success(res.pos_shifts_enabled ? "تم تفعيل الورديات" : "تم إيقاف الورديات"),
        // ACCESS_DENIED here is updateSettings' unit check; elsewhere it is a generic role refusal.
        onError: (err) =>
          toast.error(
            apiErrorPayload(err)?.code === "ACCESS_DENIED"
              ? "لا تملك صلاحية إدارة هذه الوحدة التشغيلية."
              : salesErrorMessage(err, "تعذّر تغيير إعداد الورديات."),
          ),
      },
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="إعدادات نقطة البيع"
        className="flex items-center rounded-2xl border border-app-separator bg-app-bg-secondary p-2 text-app-label-secondary hover:bg-app-fill-f1 transition-colors shadow-sm"
      >
        <Settings className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute end-0 z-40 mt-1 w-64 rounded-xl border border-app-separator bg-app-bg-primary p-3 shadow-lg space-y-2">
          <div className="text-[11px] font-bold text-app-label-secondary">إعدادات نقطة البيع</div>
          <label className="flex items-center justify-between gap-3 text-xs font-semibold text-app-label-primary cursor-pointer">
            <span>تفعيل الورديات</span>
            <button
              type="button"
              role="switch"
              aria-checked={shiftsEnabled}
              disabled={update.isPending}
              onClick={toggle}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                shiftsEnabled ? "bg-app-accent" : "bg-app-fill-f1 border border-app-separator"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                  shiftsEnabled ? "start-[18px]" : "start-0.5"
                }`}
              />
            </button>
          </label>
          <p className="text-[10px] text-app-label-secondary leading-relaxed">
            عند التفعيل يفتح كل كاشير وردية على خزينة الدرج برصيد بداية، ويُغلقها بعدّ النقد (تقرير Z).
          </p>
        </div>
      )}
    </div>
  );
};
