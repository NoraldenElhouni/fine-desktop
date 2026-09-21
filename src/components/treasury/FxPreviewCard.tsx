import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils/utils";
import { formatNumber } from "../../lib/utils/format";

export interface FxPreviewCardProps {
  bookedRate: number | null;
  effectiveRate: number | null;
  effectiveSettledLyd: number | null;
  varianceLyd: number | null;
  toleranceLyd: number;
  hardCapPercent: number;
  amountRequested: number;
  hardCapAcknowledged: boolean;
  onAcknowledgeHardCap: (acknowledged: boolean) => void;
  showHardCapControl?: boolean;
}

const formatRate = (rate: number | null): string =>
  rate === null || rate === undefined ? "—" : Number(rate).toFixed(4);

const formatLyd = (value: number | null): string =>
  value === null || value === undefined ? "—" : `${formatNumber(value)} LYD`;

export const FxPreviewCard: React.FC<FxPreviewCardProps> = ({
  bookedRate,
  effectiveRate,
  effectiveSettledLyd,
  varianceLyd,
  toleranceLyd,
  hardCapPercent,
  amountRequested,
  hardCapAcknowledged,
  onAcknowledgeHardCap,
  showHardCapControl = true,
}) => {
  const varianceAbs = varianceLyd === null ? null : Math.abs(varianceLyd);
  const varianceExceedsHardCap =
    varianceAbs !== null &&
    effectiveSettledLyd !== null &&
    effectiveSettledLyd > 0 &&
    varianceAbs > (hardCapPercent / 100) * effectiveSettledLyd;

  const varianceExceedsTolerance =
    varianceAbs !== null && varianceAbs > toleranceLyd;

  let varianceTone: "neutral" | "positive" | "amber" | "danger" = "neutral";
  if (varianceLyd !== null) {
    if (varianceExceedsHardCap) {
      varianceTone = "danger";
    } else if (varianceExceedsTolerance) {
      varianceTone = "amber";
    } else if (varianceLyd < 0) {
      varianceTone = "positive";
    }
  }

  const varianceColor =
    varianceTone === "danger"
      ? "text-app-status-danger"
      : varianceTone === "amber"
        ? "text-app-status-warning"
        : varianceTone === "positive"
          ? "text-app-status-positive"
          : "text-app-label-secondary";

  const hasInput = effectiveRate !== null || effectiveSettledLyd !== null;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-app-bg-secondary px-4 py-3 space-y-2",
        varianceTone === "danger"
          ? "border-app-status-danger/40"
          : varianceTone === "amber"
            ? "border-app-status-warning/40"
            : "border-app-separator"
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-app-label-secondary uppercase tracking-wider">
          معاينة سعر الصرف والتسوية
        </span>
        {hasInput ? (
          varianceTone === "danger" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-app-status-danger">
              <ShieldAlert className="h-3 w-3" />
              فرق يتجاوز الحد الأقصى
            </span>
          ) : varianceTone === "amber" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-app-status-warning">
              <AlertTriangle className="h-3 w-3" />
              فرق ضمن النطاق المقبول
            </span>
          ) : varianceTone === "positive" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-app-status-positive">
              <CheckCircle2 className="h-3 w-3" />
              ضمن السعر المرجعي
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-app-label-secondary">
              <CheckCircle2 className="h-3 w-3" />
              مطابق
            </span>
          )
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono">
        <Row label="السعر المرجعي المحجوز" value={formatRate(bookedRate)} suffix="LYD/USD" />
        <Row label="السعر المنفذ فعلياً" value={formatRate(effectiveRate)} suffix="LYD/USD" />
        <Row label="المبلغ الأجنبي" value={formatNumber(amountRequested)} suffix="USD" />
        <Row label="المبلغ المنفذ بالدينار" value={formatLyd(effectiveSettledLyd)} />
      </div>

      <div
        className={cn(
          "flex items-center justify-between rounded-xl border px-3 py-2 text-xs",
          varianceTone === "danger"
            ? "border-app-status-danger/30 bg-app-status-danger/10"
            : varianceTone === "amber"
              ? "border-app-status-warning/30 bg-app-status-warning/10"
              : "border-app-separator bg-app-bg-primary"
        )}
      >
        <span className="font-semibold text-app-label-secondary">فرق عن السعر المرجعي</span>
        <span className={cn("font-bold font-mono", varianceColor)}>
          {varianceLyd === null
            ? "—"
            : `${varianceLyd > 0 ? "+" : ""}${formatNumber(varianceLyd)} LYD`}
        </span>
      </div>

      <div className="flex items-center justify-between text-[10px] text-app-label-tertiary font-mono">
        <span>حد التسامح: {formatNumber(toleranceLyd)} LYD</span>
        <span>الحد الأقصى: {hardCapPercent.toFixed(1)}% من المبلغ</span>
      </div>

      {showHardCapControl && varianceExceedsHardCap ? (
        <label className="flex items-start gap-2 rounded-xl border border-app-status-danger/40 bg-app-status-danger/10 px-3 py-2 text-[11px] text-app-label-primary cursor-pointer">
          <input
            type="checkbox"
            checked={hardCapAcknowledged}
            onChange={(e) => onAcknowledgeHardCap(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 accent-app-status-danger"
          />
          <span>
            أؤكد أن فرق السعر ({formatNumber(varianceLyd ?? 0)} LYD) يتجاوز الحد الأقصى وأتحمل
            مسؤوليته.
          </span>
        </label>
      ) : null}
    </div>
  );
};

interface RowProps {
  label: string;
  value: string;
  suffix?: string;
}

const Row: React.FC<RowProps> = ({ label, value, suffix }) => (
  <>
    <span className="text-app-label-secondary">{label}</span>
    <span className="text-start font-mono">
      <span className="font-bold">{value}</span>
      {suffix ? <span className="ms-1 text-app-label-tertiary text-[10px]">{suffix}</span> : null}
    </span>
  </>
);
