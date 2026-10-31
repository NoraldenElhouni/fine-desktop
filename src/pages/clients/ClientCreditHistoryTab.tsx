import React from "react";
import { History } from "lucide-react";
import { useClientCreditLimitChanges } from "../../hooks/useClients";
import { formatDateTime, formatNumber } from "../../lib/utils/format";

const th = "px-3 py-2 text-start text-[11px] font-semibold text-app-label-secondary";
const td = "px-3 py-2 text-xs text-app-label-primary";

/** W5-05: every change of the client's credit limit, newest first, with who made it and why. */
export const ClientCreditHistoryTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: changes = [], isLoading, isError } = useClientCreditLimitChanges(clientId);

  return (
    <>
      <table className="w-full">
        <thead className="bg-app-bg-secondary border-b border-app-separator">
          <tr>
            <th className={th}>التاريخ</th>
            <th className={th}>الحد السابق</th>
            <th className={th}>الحد الجديد</th>
            <th className={th}>الفرق</th>
            <th className={th}>السبب</th>
            <th className={th}>بواسطة</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => {
            const diff = Number(c.new_limit) - Number(c.old_limit);
            return (
              <tr key={c.id} className="border-b border-app-separator last:border-0">
                <td className={`${td} font-mono`}>{c.created_at ? formatDateTime(c.created_at) : "—"}</td>
                <td className={`${td} font-mono`}>{formatNumber(c.old_limit)}</td>
                <td className={`${td} font-mono font-semibold`}>{formatNumber(c.new_limit)}</td>
                <td className={`${td} font-mono ${diff >= 0 ? "text-app-status-positive" : "text-app-status-danger"}`}>
                  <span dir="ltr">
                    {diff > 0 ? "+" : ""}
                    {formatNumber(diff)}
                  </span>
                </td>
                <td className={td}>{c.reason || "—"}</td>
                <td className={td}>{c.changed_by?.name ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLoading && <p className="p-4 text-xs text-app-label-secondary">جارٍ التحميل…</p>}
      {isError && <p className="p-4 text-xs text-app-status-danger">تعذر تحميل سجل حد الائتمان.</p>}
      {!isLoading && !isError && changes.length === 0 && (
        <p className="flex items-center gap-2 p-4 text-xs text-app-label-secondary">
          <History className="h-4 w-4" />
          لم يتغير حد الائتمان لهذا العميل منذ بدء التسجيل.
        </p>
      )}
    </>
  );
};
