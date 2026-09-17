import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Building2, MapPin, RefreshCw, ShieldCheck, User as UserIcon } from "lucide-react";
import { isAxiosError } from "axios";
import {
  useOperatingUnit,
  useAuditLog,
  useRestoreOperatingUnit,
} from "../../hooks/useOperatingUnits";
import { useWarehouses } from "../../hooks/useWarehouses";
import { useUsers } from "../../hooks/useUsers";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { AuditLogFiltersBar } from "../../components/audit-log/AuditLogFilters";
import { AuditLogTimeline } from "../../components/audit-log/AuditLogTimeline";
import { AuditLogFilters } from "../../types/entities";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

const formatDateTime = (iso?: string): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ar-LY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_LABEL: Record<string, string> = {
  active: "نشطة",
  provisioning: "قيد الإعداد",
  inactive: "معطلة",
};

export const OperatingUnitDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const unitQuery = useOperatingUnit(id);
  const warehousesQuery = useWarehouses();
  const usersQuery = useUsers();
  const restoreMutation = useRestoreOperatingUnit();

  const [filters, setFilters] = useState<AuditLogFilters>({});
  const auditQuery = useAuditLog({
    table: "operating_units",
    recordId: id,
    action: filters.action,
    from: filters.from,
    to: filters.to,
  });

  const unit = unitQuery.data;
  const isDeleted = Boolean(unit?.deleted_at);
  const warehouses = useMemo(
    () => (warehousesQuery.data ?? []).filter((w) => w.operating_unit_id === id),
    [warehousesQuery.data, id],
  );

  const userLookup = useMemo(() => {
    const map: Record<string, string> = {};
    (usersQuery.data ?? []).forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [usersQuery.data]);

  if (unitQuery.isLoading) {
    return <div className="p-6 text-center text-xs text-app-label-secondary">جاري التحميل...</div>;
  }

  if (unitQuery.isError || !unit) {
    const msg = apiErrorPayload(unitQuery.error)?.message || (isAxiosError(unitQuery.error) ? unitQuery.error.response?.data?.message : null);
    return (
      <div className="space-y-4 p-6" dir="rtl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline"
        >
          <ArrowRight className="h-3 w-3" />
          رجوع
        </button>
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {msg ?? "تعذر تحميل بيانات الوحدة."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs font-semibold text-app-accent hover:underline"
        >
          <ArrowRight className="h-3 w-3" />
          رجوع للقائمة
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              unitQuery.refetch();
              warehousesQuery.refetch();
              auditQuery.refetch();
            }}
            className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
          >
            <RefreshCw className={`h-4 w-4 ${unitQuery.isFetching ? "animate-spin" : ""}`} />
            تحديث
          </button>
          {isDeleted && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await restoreMutation.mutateAsync(unit.id);
                  toast.success("تمت الاستعادة.");
                } catch (err) {
                  toast.error(apiErrorPayload(err)?.message || "فشل الاستعادة.");
                }
              }}
              className="rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
            >
              استعادة الوحدة
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-2xl font-bold text-app-label-primary">{unit.name}</h1>
        <span
          className={
            isDeleted
              ? "inline-flex items-center rounded-full bg-app-status-danger/15 px-2 py-0.5 text-[10px] font-bold text-app-status-danger"
              : "inline-flex items-center rounded-full bg-app-status-positive/15 px-2 py-0.5 text-[10px] font-bold text-app-status-positive"
          }
        >
          {isDeleted ? "محذوفة" : STATUS_LABEL[unit.status ?? "active"] ?? unit.status}
        </span>
        <span className="text-[11px] font-mono text-app-label-secondary">{unit.unit_type}</span>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4">
          <h2 className="mb-3 text-xs font-bold uppercase text-app-label-secondary">معلومات الوحدة</h2>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-app-label-secondary">القالب</dt>
              <dd className="mt-0.5 flex items-center gap-1 font-semibold text-app-label-primary">
                <Building2 className="h-3 w-3 text-app-label-secondary" />
                {unit.blueprint?.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-app-label-secondary">المسؤول</dt>
              <dd className="mt-0.5 flex items-center gap-1 font-semibold text-app-label-primary">
                <UserIcon className="h-3 w-3 text-app-label-secondary" />
                {unit.manager?.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-app-label-secondary">العملة</dt>
              <dd className="mt-0.5 font-mono font-semibold text-app-label-primary">
                {unit.currency ?? "LYD"}
              </dd>
            </div>
            <div>
              <dt className="text-app-label-secondary">تاريخ الإنشاء</dt>
              <dd className="mt-0.5 font-mono text-app-label-primary">
                {formatDateTime(unit.created_at)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-app-separator bg-app-bg-primary p-4">
          <h2 className="mb-3 text-xs font-bold uppercase text-app-label-secondary">
            المستودعات ({warehouses.length})
          </h2>
          {warehouses.length === 0 ? (
            <div className="text-xs text-app-label-secondary">لا توجد مستودعات.</div>
          ) : (
            <ul className="space-y-1.5">
              {warehouses.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center gap-2 rounded-lg bg-app-bg-secondary px-2 py-1.5 text-xs"
                >
                  <MapPin className="h-3 w-3 text-app-label-secondary" />
                  <span className="font-semibold text-app-label-primary">{w.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-app-accent" />
          <h2 className="text-sm font-bold text-app-label-primary">سجل النشاط</h2>
          <span className="text-[10px] text-app-label-tertiary">
            ({auditQuery.data?.length ?? 0} حدث)
          </span>
        </div>
        <AuditLogFiltersBar filters={filters} onChange={setFilters} />
        {auditQuery.isLoading ? (
          <div className="rounded-2xl border border-app-separator bg-app-bg-secondary p-6 text-center text-xs text-app-label-secondary">
            جاري التحميل...
          </div>
        ) : (
          <AuditLogTimeline
            entries={auditQuery.data ?? []}
            userLookup={userLookup}
            emptyMessage="لا توجد سجلات نشاط (ربما لم تتطابق المرشحات)."
          />
        )}
      </section>
    </div>
  );
};

export default OperatingUnitDetailPage;
