import React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "../../lib/utils/utils";

interface DiffEntry {
  key: string;
  kind: "added" | "removed" | "changed" | "unchanged";
  oldValue?: unknown;
  newValue?: unknown;
}

const summarize = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const diffValues = (
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null,
): DiffEntry[] => {
  const old = oldValues ?? {};
  const fresh = newValues ?? {};
  const keys = new Set([...Object.keys(old), ...Object.keys(fresh)]);
  const entries: DiffEntry[] = [];
  keys.forEach((key) => {
    const hasOld = Object.prototype.hasOwnProperty.call(old, key);
    const hasNew = Object.prototype.hasOwnProperty.call(fresh, key);
    if (hasOld && !hasNew) {
      entries.push({ key, kind: "removed", oldValue: old[key] });
    } else if (!hasOld && hasNew) {
      entries.push({ key, kind: "added", newValue: fresh[key] });
    } else if (JSON.stringify(old[key]) !== JSON.stringify(fresh[key])) {
      entries.push({ key, kind: "changed", oldValue: old[key], newValue: fresh[key] });
    } else {
      entries.push({ key, kind: "unchanged", oldValue: old[key], newValue: fresh[key] });
    }
  });
  return entries;
};

interface AuditLogDiffProps {
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

export const AuditLogDiff: React.FC<AuditLogDiffProps> = ({ oldValues, newValues }) => {
  const entries = diffValues(oldValues, newValues);
  const visible = entries.filter((e) => e.kind !== "unchanged");

  if (visible.length === 0) {
    return (
      <div className="rounded-lg border border-app-separator bg-app-bg-secondary p-3 text-xs text-app-label-secondary">
        لا توجد تغييرات (القيم متطابقة).
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-app-separator">
      <div className="grid grid-cols-3 bg-app-bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase text-app-label-secondary">
        <span>الحقل</span>
        <span>قبل</span>
        <span>بعد</span>
      </div>
      <ul className="divide-y divide-app-separator bg-app-bg-primary">
        {visible.map((entry) => (
          <li
            key={entry.key}
            className={cn(
              "grid grid-cols-3 gap-2 px-3 py-2 text-[11px]",
              entry.kind === "added" && "bg-app-status-positive/10",
              entry.kind === "removed" && "bg-app-status-danger/10",
              entry.kind === "changed" && "bg-app-status-warning/10",
            )}
          >
            <span className="font-mono text-app-label-primary">{entry.key}</span>
            <span
              className={cn(
                "break-all font-mono text-app-label-secondary",
                "flex items-start gap-1",
              )}
            >
              {(entry.kind === "removed" || entry.kind === "changed") && (
                <Minus className="mt-0.5 h-3 w-3 shrink-0 text-app-status-danger" />
              )}
              {summarize(entry.oldValue)}
            </span>
            <span
              className={cn(
                "break-all font-mono text-app-label-primary",
                "flex items-start gap-1",
              )}
            >
              {(entry.kind === "added" || entry.kind === "changed") && (
                <Plus className="mt-0.5 h-3 w-3 shrink-0 text-app-status-positive" />
              )}
              {summarize(entry.newValue)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuditLogDiff;
