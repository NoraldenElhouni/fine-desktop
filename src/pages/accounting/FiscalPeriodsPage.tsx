import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Lock, LockOpen, AlertTriangle, Settings2, Plus } from "lucide-react";
import {
  useFiscalCalendar,
  useLockPeriod,
  useReopenPeriod,
  useCreateFiscalYear,
  useUpdateFiscalSettings,
  useClosingPreview,
  useCloseYear,
  useReopenYear,
} from "../../hooks/useFiscal";
import { usePermissions } from "../../hooks/usePermissions";
import { ARABIC_MONTHS, type FiscalPeriod, type FiscalYear } from "../../api/endpoints/fiscal";
import { apiErrorMessage, apiErrorPayload, LEDGER_ERROR_MESSAGE } from "../../api/endpoints/production";
import { formatDate, formatNumber } from "../../lib/utils/format";
import { toast } from "../../stores/toastStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../../components/ui/Dialog";

const todayIso = () => new Date().toISOString().slice(0, 10);

/** A month is lockable once it has ended (ACC-11). */
const hasEnded = (period: FiscalPeriod) => period.end_date.slice(0, 10) < todayIso();

const formatOpenPeriod = (periodLabel: string): string => {
  const parts = periodLabel.split("-");
  if (parts.length === 2) {
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return `${ARABIC_MONTHS[monthNum - 1]} ${year}`;
    }
  }
  return periodLabel;
};

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
  const closeYearMutation = useCloseYear();
  const reopenYearMutation = useReopenYear();

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

  const [closingYear, setClosingYear] = useState<FiscalYear | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [reopeningYear, setReopeningYear] = useState<FiscalYear | null>(null);
  const [reopenYearReason, setReopenYearReason] = useState("");
  const [reopenYearError, setReopenYearError] = useState<string | null>(null);

  const previewQuery = useClosingPreview(closingYear?.id ?? null);

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

  const submitCloseYear = () => {
    if (!closingYear) return;
    setCloseError(null);
    closeYearMutation.mutate(closingYear.id, {
      onSuccess: () => {
        toast.success(`تم إقفال السنة المالية ${closingYear.name}`);
        setClosingYear(null);
      },
      onError: (err) => setCloseError(apiErrorMessage(err, "تعذر إقفال السنة المالية.")),
    });
  };

  const submitReopenYear = () => {
    if (!reopeningYear) return;
    setReopenYearError(null);
    reopenYearMutation.mutate(
      { id: reopeningYear.id, reason: reopenYearReason.trim() },
      {
        onSuccess: () => {
          toast.success(`تمت إعادة فتح السنة المالية ${reopeningYear.name}`);
          setReopeningYear(null);
          setReopenYearReason("");
        },
        onError: (err) => setReopenYearError(apiErrorMessage(err, "تعذرت إعادة فتح السنة المالية.")),
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
            onCloseYear={(y) => { setClosingYear(y); setCloseError(null); }}
            onReopenYear={(y) => { setReopeningYear(y); setReopenYearReason(""); setReopenYearError(null); }}
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

      <Dialog
        open={closingYear !== null}
        onOpenChange={(open) => {
          if (!open) {
            setClosingYear(null);
            setCloseError(null);
          }
        }}
      >
        <DialogContent size="2xl">
          <DialogHeader>
            <div>
              <DialogTitle>إقفال السنة المالية {closingYear?.name}</DialogTitle>
              <DialogDescription>
                معاينة قيد إقفال الحسابات الاسمية (الإيرادات والمصروفات) وترحيل صافي النتيجة.
              </DialogDescription>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
            {closeError && <ErrorBox message={closeError} />}

            <div className="rounded-xl border border-app-status-info/30 bg-app-status-info/10 p-3 text-xs text-app-status-info leading-relaxed">
              سيتم ترحيل صافي الربح أو الخسارة إلى حساب 33 أرباح وخسائر مرحلة، ولن يُقبل أي قيد بتاريخ داخل هذه السنة بعد الإقفال.
            </div>

            {previewQuery.isLoading ? (
              <div className="flex h-36 items-center justify-center text-xs text-app-label-secondary">
                جارٍ تحميل معاينة قيد الإقفال…
              </div>
            ) : previewQuery.isError ? (
              <ErrorBox message={apiErrorMessage(previewQuery.error, "تعذر تحميل معاينة قيد الإقفال.")} />
            ) : previewQuery.data && (
              <>
                {previewQuery.data.blockers.length > 0 && (
                  <div className="space-y-2 rounded-xl border border-app-status-warning/30 bg-app-status-warning/10 p-3 text-xs text-app-status-warning">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>موانع إقفال السنة المالية ({previewQuery.data.blockers.length}):</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 ps-1">
                      {previewQuery.data.blockers.map((b, idx) => (
                        <li key={idx}>
                          <span>{LEDGER_ERROR_MESSAGE[b.code] ?? b.message}</span>
                          {b.open_periods && b.open_periods.length > 0 && (
                            <span className="font-semibold">: {b.open_periods.map(formatOpenPeriod).join("، ")}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewQuery.data.units.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-app-label-secondary">صافي الدخل حسب الوحدة التشغيلية:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {previewQuery.data.units.map((u, idx) => (
                        <div key={idx} className="flex flex-col rounded-xl border border-app-separator bg-app-bg-secondary p-2.5 text-xs">
                          <span className="text-app-label-secondary truncate">{u.unit_name || "عام"}</span>
                          <span
                            className={`font-mono font-bold mt-1 ${
                              u.net_income >= 0 ? "text-app-status-positive" : "text-app-status-danger"
                            }`}
                          >
                            {formatNumber(u.net_income)} د.ل
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-app-separator bg-app-bg-secondary p-3 text-xs">
                  <span className="font-bold text-app-label-primary">إجمالي صافي الدخل:</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      previewQuery.data.net_income >= 0 ? "text-app-status-positive" : "text-app-status-danger"
                    }`}
                  >
                    {formatNumber(previewQuery.data.net_income)} د.ل
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-app-label-secondary">
                    بنود قيد الإقفال ({previewQuery.data.lines.length}):
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-app-separator">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
                        <tr>
                          <th className="px-3 py-2 text-start font-semibold">الحساب</th>
                          <th className="px-3 py-2 text-start font-semibold">الوحدة</th>
                          <th className="px-3 py-2 text-end font-semibold">مدين</th>
                          <th className="px-3 py-2 text-end font-semibold">دائن</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-app-separator/50 bg-app-bg-primary text-app-label-primary">
                        {previewQuery.data.lines.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-app-label-tertiary">
                              لا توجد حركات اسمية (إيرادات أو مصروفات) تتطلب الإقفال.
                            </td>
                          </tr>
                        ) : (
                          previewQuery.data.lines.map((line, idx) => (
                            <tr key={idx} className="hover:bg-app-fill-f1/40">
                              <td className="px-3 py-2">
                                <span className="font-mono text-app-label-secondary me-1.5">{line.account_code}</span>
                                <span>{line.account_name}</span>
                              </td>
                              <td className="px-3 py-2 text-app-label-secondary">{line.unit_name || "—"}</td>
                              <td className="px-3 py-2 text-end font-mono">
                                {line.debit > 0 ? formatNumber(line.debit) : "—"}
                              </td>
                              <td className="px-3 py-2 text-end font-mono">
                                {line.credit > 0 ? formatNumber(line.credit) : "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {previewQuery.data.lines.length > 0 && (
                        <tfoot className="border-t border-app-separator bg-app-bg-secondary font-bold">
                          <tr>
                            <td colSpan={2} className="px-3 py-2 text-start text-app-label-primary">الإجمالي</td>
                            <td className="px-3 py-2 text-end font-mono text-app-label-primary">
                              {formatNumber(previewQuery.data.total_debit)}
                            </td>
                            <td className="px-3 py-2 text-end font-mono text-app-label-primary">
                              {formatNumber(previewQuery.data.total_credit)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setClosingYear(null);
                setCloseError(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={submitCloseYear}
              disabled={
                closeYearMutation.isPending ||
                previewQuery.isLoading ||
                !previewQuery.data ||
                previewQuery.data.blockers.length > 0
              }
              className="px-4 py-2 text-xs font-bold text-white bg-app-accent hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {closeYearMutation.isPending ? "جارٍ الإقفال…" : "إقفال السنة المالية"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reopeningYear !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReopeningYear(null);
            setReopenYearReason("");
            setReopenYearError(null);
          }
        }}
      >
        <DialogContent size="md">
          <DialogHeader>
            <div>
              <DialogTitle>إعادة فتح السنة المالية {reopeningYear?.name}</DialogTitle>
              <DialogDescription>سيُعكس قيد الإقفال وتبقى الأشهر مقفلة.</DialogDescription>
            </div>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="space-y-3">
            {reopenYearError && <ErrorBox message={reopenYearError} />}
            <label className="flex flex-col gap-1 text-xs text-app-label-secondary">
              سبب إعادة الفتح
              <textarea
                required
                maxLength={500}
                rows={3}
                value={reopenYearReason}
                onChange={(e) => setReopenYearReason(e.target.value)}
                placeholder="مثال: تصحيح قيد تسوية سنوي أو تدقيق مالي"
                className="rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:border-app-accent focus:outline-none"
              />
            </label>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setReopeningYear(null);
                setReopenYearReason("");
                setReopenYearError(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={submitReopenYear}
              disabled={reopenYearMutation.isPending || !reopenYearReason.trim()}
              className="px-4 py-2 text-xs font-bold text-white bg-app-status-danger hover:opacity-90 rounded-xl disabled:opacity-50"
            >
              {reopenYearMutation.isPending ? "جارٍ الفتح…" : "إعادة فتح السنة"}
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
  onCloseYear: (y: FiscalYear) => void;
  onReopenYear: (y: FiscalYear) => void;
}> = ({ year, canLock, isOwner, onLock, onReopen, onCloseYear, onReopenYear }) => {
  const lockedCount = year.periods.filter((p) => p.status === "locked").length;
  const yearEnded = year.end_date.slice(0, 10) < todayIso();
  const canCloseThisYear = year.status === "open" && canLock && yearEnded;
  const canReopenThisYear = year.status === "closed" && isOwner;

  return (
    <section className="rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
      <header className="flex flex-wrap items-center gap-3 border-b border-app-separator px-5 py-3">
        <h2 className="text-sm font-bold text-app-label-primary">السنة المالية {year.name}</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            year.status === "closed"
              ? "bg-app-status-info/15 text-app-status-info"
              : "bg-app-status-positive/10 text-app-status-positive"
          }`}
        >
          {year.status === "closed" ? "مقفلة" : "مفتوحة"}
        </span>
        <span className="text-[11px] text-app-label-tertiary font-mono">
          {formatDate(year.start_date)} — {formatDate(year.end_date)}
        </span>
        {year.status === "closed" && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-app-label-secondary">
            {year.closed_by && (
              <span>
                أقفلها {year.closed_by.name}
                {year.closed_at ? ` في ${formatDate(year.closed_at)}` : ""}
              </span>
            )}
            {!year.closed_by && year.closed_at && <span>أقفلت في {formatDate(year.closed_at)}</span>}
            {year.closing_entry?.reference && (
              <Link
                to={`/accounting/journal?search=${encodeURIComponent(year.closing_entry.reference)}`}
                className="font-mono text-app-accent hover:underline font-semibold"
              >
                قيد الإقفال {year.closing_entry.reference}
              </Link>
            )}
          </div>
        )}
        <div className="ms-auto flex items-center gap-3">
          <span className="text-[11px] text-app-label-secondary">{lockedCount} من 12 شهراً مقفلة</span>
          {canCloseThisYear && (
            <button
              type="button"
              onClick={() => onCloseYear(year)}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
            >
              <Lock className="w-3.5 h-3.5" />
              إقفال السنة المالية
            </button>
          )}
          {canReopenThisYear && (
            <button
              type="button"
              onClick={() => onReopenYear(year)}
              className="flex items-center gap-1.5 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-1.5 text-xs font-semibold text-app-status-danger hover:bg-app-fill-f1"
            >
              <LockOpen className="w-3.5 h-3.5 text-app-status-danger" />
              إعادة فتح السنة
            </button>
          )}
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {year.periods.map((period) => {
          const locked = period.status === "locked";
          return (
            <div
              key={period.id}
              className={`flex flex-col gap-2 rounded-xl border p-3 ${
                locked ? "border-app-separator bg-app-fill-f1" : "border-app-separator bg-app-bg-secondary"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-app-label-primary">
                  {ARABIC_MONTHS[period.calendar_month - 1]} {period.calendar_year}
                </span>
                {locked ? (
                  <Lock className="w-3.5 h-3.5 text-app-label-secondary" />
                ) : (
                  <LockOpen className="w-3.5 h-3.5 text-app-status-positive" />
                )}
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
