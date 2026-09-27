import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

const type = tokens.typography.webUI;

export const formInputClass = cn(
  "w-full px-3 py-2 rounded-app-md border border-app-separator bg-app-bg-primary text-app-label-primary",
  "placeholder:text-app-label-tertiary focus:border-app-accent focus:outline-none",
  type.b2Regular,
);

export const Field: React.FC<{
  label: string;
  hint?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, hint, aside, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className={cn(type.c1Emphasized, "text-app-label-secondary")}>
        {label}
      </label>
      {aside}
    </div>
    {children}
    {hint && (
      <p className={cn(type.c1Regular, "text-app-label-tertiary")}>{hint}</p>
    )}
  </div>
);

export const Question: React.FC<{
  number: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ number, title, subtitle, children }) => (
  <section className="py-6 first:pt-0 border-b border-app-separator last:border-b-0">
    <div className="flex items-start gap-3 mb-4">
      <span
        className={cn(
          type.c1Emphasized,
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-app-accent/10 text-app-accent",
        )}
      >
        {number}
      </span>
      <div>
        <h2 className={cn(type.t2Emphasized, "text-app-label-primary")}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(type.c1Regular, "text-app-label-tertiary")}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    <div className="space-y-4 ps-9">{children}</div>
  </section>
);

export const SummaryRow: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-app-separator last:border-b-0">
    <span className={cn(type.c1Regular, "text-app-label-tertiary shrink-0")}>
      {label}
    </span>
    <span className={cn(type.c1Emphasized, "text-app-label-primary text-end")}>
      {children}
    </span>
  </div>
);

export const GuidedFormLoading: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    className={cn(
      type.b2Regular,
      "flex h-64 items-center justify-center text-app-label-secondary",
    )}
  >
    {children}
  </div>
);

interface GuidedFormPageProps {
  backTo: string;
  backLabel: string;
  title: string;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  /** Summary card header: icon, live title (falls back to placeholder), optional LTR subtitle. */
  summaryIcon: React.ElementType;
  summaryTitle: string;
  summaryPlaceholder: string;
  summarySubtitle?: string;
  summary: React.ReactNode;
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
  children: React.ReactNode;
}

/** Two-column create/edit page: numbered questions + sticky live summary with the save actions. */
export const GuidedFormPage: React.FC<GuidedFormPageProps> = ({
  backTo,
  backLabel,
  title,
  error,
  onSubmit,
  summaryIcon: Icon,
  summaryTitle,
  summaryPlaceholder,
  summarySubtitle,
  summary,
  submitLabel,
  isSubmitting,
  onCancel,
  children,
}) => (
  <div className="p-6 space-y-5" dir="rtl">
    <div className="space-y-2">
      <Link
        to={backTo}
        className={cn(
          type.c1Emphasized,
          "flex w-fit items-center gap-1 text-app-accent hover:underline",
        )}
      >
        <ArrowRight className="h-4 w-4" />
        {backLabel}
      </Link>
      <h1 className={cn(type.largeTitleEmphasized, "text-app-label-primary")}>
        {title}
      </h1>
    </div>

    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start max-w-5xl"
    >
      <div className="rounded-app-xl border border-app-separator bg-app-bg-primary p-6">
        {error && (
          <div
            className={cn(
              type.c1Regular,
              "mb-5 rounded-app-md border border-app-status-danger/30 bg-app-status-danger/10 p-3 text-app-status-danger",
            )}
          >
            {error}
          </div>
        )}
        {children}
      </div>

      <aside className="lg:sticky lg:top-6 rounded-app-xl border border-app-separator bg-app-bg-secondary p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app-lg bg-app-accent/10">
            <Icon className="h-5 w-5 text-app-accent" />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                type.b1Emphasized,
                "truncate",
                summaryTitle.trim()
                  ? "text-app-label-primary"
                  : "text-app-label-tertiary",
              )}
            >
              {summaryTitle.trim() || summaryPlaceholder}
            </p>
            {summarySubtitle !== undefined && (
              <p
                className={cn(
                  type.c1Regular,
                  "font-mono text-app-label-secondary",
                )}
                dir="ltr"
              >
                {summarySubtitle || "—"}
              </p>
            )}
          </div>
        </div>

        <div>{summary}</div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              type.b2Emphasized,
              "w-full rounded-app-md bg-app-accent py-2.5 text-white hover:opacity-90 disabled:opacity-50",
            )}
          >
            {isSubmitting ? "جارٍ الحفظ…" : submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              type.b2Regular,
              "w-full rounded-app-md py-2 text-app-label-secondary hover:bg-app-fill-f1",
            )}
          >
            إلغاء
          </button>
        </div>
      </aside>
    </form>
  </div>
);
