import React from "react";
import { cn } from "../../lib/utils/utils";

export type BadgeVariant =
  | "positive"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "accent"
  | "purple";

export type BadgeSize = "sm" | "md";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  positive: {
    bg: "bg-app-status-positive/15 border-app-status-positive/30",
    text: "text-app-status-positive",
    dot: "bg-app-status-positive",
  },
  warning: {
    bg: "bg-app-status-warning/15 border-app-status-warning/30",
    text: "text-app-status-warning",
    dot: "bg-app-status-warning",
  },
  danger: {
    bg: "bg-app-status-danger/15 border-app-status-danger/30",
    text: "text-app-status-danger",
    dot: "bg-app-status-danger",
  },
  info: {
    bg: "bg-app-status-info/15 border-app-status-info/30",
    text: "text-app-status-info",
    dot: "bg-app-status-info",
  },
  neutral: {
    bg: "bg-app-fill-f2 border-app-separator",
    text: "text-app-label-secondary",
    dot: "bg-app-label-tertiary",
  },
  accent: {
    bg: "bg-app-accent/15 border-app-accent/30",
    text: "text-app-accent",
    dot: "bg-app-accent",
  },
  purple: {
    bg: "bg-purple-500/15 border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
  },
};

const resolveStatusVariant = (status: string): BadgeVariant => {
  const s = status.toLowerCase();
  if (
    s === "fulfilled" ||
    s === "paid" ||
    s === "completed" ||
    s === "approved" ||
    s === "active" ||
    s === "closed" ||
    s === "graded" ||
    s === "success"
  ) {
    return "positive";
  }
  if (
    s === "pending" ||
    s === "pending_approval" ||
    s === "curing" ||
    s === "running" ||
    s === "warning"
  ) {
    return "warning";
  }
  if (
    s === "rejected" ||
    s === "cancelled" ||
    s === "voided" ||
    s === "inactive" ||
    s === "error" ||
    s === "danger"
  ) {
    return "danger";
  }
  if (
    s === "confirmed" ||
    s === "in_progress" ||
    s === "configured" ||
    s === "info"
  ) {
    return "info";
  }
  return "neutral";
};

const defaultStatusLabels: Record<string, string> = {
  draft: "مسودة",
  pending_approval: "قيد المراجعة والاعتماد",
  pending: "معلق",
  confirmed: "مؤكد",
  in_progress: "قيد التنفيذ",
  fulfilled: "مكتمل التجهيز",
  partially_paid: "مدفوع جزئياً",
  paid: "مدفوع بالكامل",
  completed: "مكتمل",
  closed: "مغلق ومرحل",
  graded: "تم التقييم",
  running: "قيد التشغيل",
  active: "نشط",
  inactive: "غير نشط",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  variant,
  size = "md",
  dot = false,
  className,
}) => {
  const activeVariant = variant || resolveStatusVariant(status);
  const displayLabel = label || defaultStatusLabels[status.toLowerCase()] || status;
  const style = variantStyles[activeVariant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        style.bg,
        style.text,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />}
      <span>{displayLabel}</span>
    </span>
  );
};
