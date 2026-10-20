import React, { useState } from "react";
import { CalendarClock, Lock, LockOpen, AlertTriangle, Settings2, Plus } from "lucide-react";
import { useFiscalCalendar, useLockPeriod, useReopenPeriod, useCreateFiscalYear, useUpdateFiscalSettings } from "../../hooks/useFiscal";
import { usePermissions } from "../../hooks/usePermissions";
import { ARABIC_MONTHS, type FiscalPeriod, type FiscalYear } from "../../api/endpoints/fiscal";
import { apiErrorMessage, apiErrorPayload } from "../../api/endpoints/production";
import { formatDate } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogBody, DialogFooter } from "../../components/ui/Dialog";

const todayIso = () => new Date().toISOString().slice(0, 10);

/** A month is lockable once it has ended (ACC-11). */
const hasEnded = (period: FiscalPeriod) => period.end_date.slice(0, 10) < todayIso();

/**
 * The fiscal calendar (FR-GL-044, ACC-11): each year as twelve months. The
 * accounting manager locks a month once its work is done; nothing can then
 * be posted into it. Only the owner reopens a month, with a reason.
 */
export const FiscalPeriodsPage: React.FC = () => {
  const { data: calendar, isLoading, isError } = useFiscalCalendar();
  const lockMutation = useLockPeriod();
  const reopenMutation = useReopenPeriod();
  const createYearMutation = useCreateFiscalYear();
  const settingsMutation = useUpdateFiscalSettings();
  const { hasRole } = usePermissions();
  const canLock = hasRole(["owner", "accounting-manager"]);
  const isOwner = hasRole(["owner"]);

  const [locking, setLocking] = useState<FiscalPeriod | null>(null);
  const [includeEarlier, setIncludeEarlier] = useState(true);
  const [reopening, setReopening] = useState<FiscalPeriod | null>(null);
  const [reason, setReason] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [startMonth, setStartMonth] = useState(1);

  const years = calendar?.data ?? [];

  const submitLock = () => {
    if (!locking) return;
    setDialogError(null);
    lockMutation.mutate(
      { id: locking.id, includeEarlier },
      {
        onSuccess: () => {
          toast.success(`تم إقفال ${ARABIC_MONTHS[locking.calendar_month - 1]} ${locking.calendar_year}`);
          setLocking(null);
        },
        onError: (err) => {
          const payload = apiErrorPayload(err) as { code?: string; open_periods?: string[] } | undefined;
          setDialogError(
            payload?.code === "PERIOD_LOCK_OUT_OF_ORDER" && payload.open_periods
              ? `يجب إقفال الأشهر السابقة أولاً: ${payload.open_periods.join("، ")}`
              : apiErrorMessage(err, "تعذر إقفال الشهر."),
          );
        },
      },
    );
  };

  const submitReopen = () => {
    if (!reopening) return;
    setDialogError(null);
    reopenMutation.mutate(
      { id: reopening.id, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("تمت إعادة فتح الشهر");
          setReopening(null);
          setReason("");
        },
        onError: (err) => setDialogError(apiErrorMessage(err, "تعذرت إعادة فتح الشهر.")),
      },
    );
  };

  const submitSettings = () => {
    setDialogError(null);
    settingsMutation.mutate(startMonth, {
      onSuccess: () => {
        toast.success("تم تحديث بداية السنة المالية");
        setShowSettings(false);
      },
      onError: (err) => setDialogError(apiErrorMessage(err, "تعذر تحديث الإعداد.")),
    });
  };

  const addNextYear = () => {
    const latest = years[0];
    const next = latest ? Number(latest.start_date.slice(0, 4)) + 1 : new Date().getFullYear();
    createYearMutation.mutate(next, {
      onError: (err) => toast.error(apiErrorMessage(err, "تعذر إنشاء السنة المالية")),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
            <CalendarClock className="w-7 h-7 text-app-accent" />
            الفترات المحاسبية
          </h1>
          <p className="text-xs text-app-label-secondary mt-1">
            أقفل الشهر بعد انتهائه واكتمال قيوده (الإهلاك، الرواتب، المصاريف). لا يُقبل أي قيد بتاريخ داخل شهر مقفل، ولا يعيد فتحه إلا المالك.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canLock && (
            <button
              type="button"
              onClick={addNextYear}
              disabled={createYearMutation.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> سنة مالية تالية
            </button>
          )}
          {isOwner && (
            <button
              type="button"
              onClick={() => { setStartMonth(calendar?.fiscal_year_start_month ?? 1); setDialogError(null); setShowSettings(true); }}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
            >
              <Settings2 className="w-4 h-4" /> بداية السنة المالية
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-xs text-app-label-secondary">جارٍ التحميل…</div>
      ) : isError ? (
        <div className="flex h-48 items-center justify-center text-xs text-app-status-danger">تعذر تحميل الفترات المحاسبية.</div>
      ) : years.length === 0 ? (
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-10 text-center text-xs text-app-label-tertiary">
          تُنشأ السنة المالية تلقائياً عند ترحيل أول قيد فيها.
        </div>
      ) : (
        years.map((year) => (
          <YearCard
            key={year.id}
            year={year}
            canLock={canLock}
            isOwner={isOwner}
            onLock={(p) => { setLocking(p); setIncludeEarlier(true); setDialogError(null); }}
            onReopen={(p) => { setReopening(p); setReason(""); setDialogError(null); }}
          />
        ))
      )}

      <Dialog open={locking !== null} onOpenChange={(open) => { if (!open) setLocking(null); }}>
        <DialogContent size="md">
          <DialogHeader>
            <div>
              <DialogTitle>
                إقفال {locking ? `${ARABIC_MONTHS[locking.calendar_month - 1]} ${locking.calendar_year}` : ""}
              </DialogTitle>
              <DialogDescription>
                بعد الإقفال يُرفض أي قيد مؤرخ داخل هذا الشهر، يدوياً كان أو تلقائياً، حتى يعيد المالك فتحه.
              </DialogDescription>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-3">
            {dialogError && <ErrorBox message={dialogError} />}
            <label className="flex items-center gap-2 text-xs font-semibold text-app-label-secondary">
              <input type="checkbox" checked={includeEarlier} onChange={(e) => setIncludeEarlier(e.target.checked)} className="accent-app-accent" />
              وإقفال الأشهر السابقة المفتوحة أيضاً
            </label>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setLocking(null)} className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl">
              إلغاء
            </button>
            <button
              type="button"
              onClick={submitLock}
              disabled={lockMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {lockMutation.isPending ? "جارٍ الإقفال…" : "إقفال الشهر"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reopening !== null} onOpenChange={(open) => { if (!open) setReopening(null); }}>
        <DialogContent size="md">
          <DialogHeader>
            <div>
              <DialogTitle>
                إعادة فتح {reopening ? `${ARABIC_MONTHS[reopening.calendar_month - 1]} ${reopening.calendar_year}` : ""}
              </DialogTitle>
              <DialogDescription>يُعاد فتح هذا الشهر وحده، ويُسجَّل السبب في سجل التدقيق.</DialogDescription>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-3">
            {dialogError && <ErrorBox message={dialogError} />}
            <label className="flex flex-col gap-1 text-xs text-app-label-secondary">
              سبب إعادة الفتح
              <textarea
                required maxLength={500} rows={3} value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: فاتورة مورد وصلت متأخرة"
                className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
              />
            </label>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setReopening(null)} className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl">
              إلغاء
            </button>
            <button
              type="button"
              onClick={submitReopen}
              disabled={reopenMutation.isPending || !reason.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-app-status-danger hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {reopenMutation.isPending ? "جارٍ الفتح…" : "إعادة فتح الشهر"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent size="md">
          <DialogHeader>
            <div>
              <DialogTitle>بداية السنة المالية</DialogTitle>
              <DialogDescription>يمكن تغييرها فقط قبل إقفال أي شهر.</DialogDescription>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-3">
            {dialogError && <ErrorBox message={dialogError} />}
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
            >
              {ARABIC_MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setShowSettings(false)} className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl">
              إلغاء
            </button>
            <button
              type="button"
              onClick={submitSettings}
              disabled={settingsMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              حفظ
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2 rounded-xl border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-xs text-app-status-danger">
    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);

const YearCard: React.FC<{
  year: FiscalYear;
  canLock: boolean;
  isOwner: boolean;
  onLock: (p: FiscalPeriod) => void;
  onReopen: (p: FiscalPeriod) => void;
}> = ({ year, canLock, isOwner, onLock, onReopen }) => {
  const lockedCount = year.periods.filter((p) => p.status === "locked").length;

  return (
    <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
      <header className="flex flex-wrap items-center gap-3 border-b border-app-separator px-5 py-3">
        <h2 className="text-sm font-bold text-app-label-primary">السنة المالية {year.name}</h2>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${year.status === "closed" ? "bg-app-status-info/15 text-app-status-info" : "bg-app-status-positive/10 text-app-status-positive"}`}>
          {year.status === "closed" ? "مقفلة" : "مفتوحة"}
        </span>
        <span className="text-[11px] text-app-label-tertiary font-mono">
          {formatDate(year.start_date)} — {formatDate(year.end_date)}
        </span>
        <span className="ms-auto text-[11px] text-app-label-secondary">
          {lockedCount} من 12 شهراً مقفلة
        </span>
      </header>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {year.periods.map((period) => {
          const locked = period.status === "locked";
          return (
            <div
              key={period.id}
              className={`flex flex-col gap-2 rounded-xl border p-3 ${locked ? "border-app-separator bg-app-fill-f1" : "border-app-separator bg-app-bg-secondary"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-label-primary">
                  {ARABIC_MONTHS[period.calendar_month - 1]} {period.calendar_year}
                </span>
                {locked ? <Lock className="w-3.5 h-3.5 text-app-label-secondary" /> : <LockOpen className="w-3.5 h-3.5 text-app-status-positive" />}
              </div>
              <div className="text-[11px] text-app-label-secondary">
                {locked ? "مقفل" : "مفتوح"} · <span className="font-mono">{period.entry_count}</span> قيد
              </div>
              {locked && period.locked_by && (
                <div className="text-[10px] text-app-label-tertiary truncate" title={period.locked_at ?? undefined}>
                  أقفله {period.locked_by.name}
                </div>
              )}
              {!locked && period.reopen_reason && (
                <div className="text-[10px] text-app-label-tertiary truncate" title={period.reopen_reason}>
                  أعيد فتحه: {period.reopen_reason}
                </div>
              )}
              {year.status === "open" && (
                <div className="mt-auto">
                  {!locked && canLock && hasEnded(period) && (
                    <button
                      type="button"
                      onClick={() => onLock(period)}
                      className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-2 py-1 text-[11px] font-semibold text-app-label-primary hover:bg-app-fill-f1"
                    >
                      إقفال الشهر
                    </button>
                  )}
                  {locked && isOwner && (
                    <button
                      type="button"
                      onClick={() => onReopen(period)}
                      className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-2 py-1 text-[11px] font-semibold text-app-status-danger hover:bg-app-fill-f1"
                    >
                      إعادة فتح
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
