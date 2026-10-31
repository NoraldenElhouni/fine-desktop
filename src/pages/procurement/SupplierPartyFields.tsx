import React from "react";
import { AlertTriangle, GitMerge } from "lucide-react";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import type { Entity, EntityRoleType } from "../../types/entities";
import type { SupplierDuplicate, SupplierDuplicateMatch } from "../../types/procurement";

/**
 * W5-07: the supplier form's party fields: link an existing entity (a client
 * or another unit's supplier) and the tax number, plus the SUPPLIER_DUPLICATE
 * warning the save can come back with.
 */

const ROLE_LABEL: Record<EntityRoleType, string> = {
  client: "عميل",
  vendor: "مورد",
  employee: "موظف",
};

const MATCH_LABEL: Record<SupplierDuplicateMatch, string> = {
  entity: "الجهة نفسها",
  tax_number: "الرقم الضريبي نفسه",
  name: "الاسم نفسه",
};

/** Clients and suppliers can be linked as a supplier's party; a bare employee entity is not offered. */
export const isLinkableSupplierEntity = (entity: Entity): boolean =>
  Boolean(entity.roles?.some((r) => r.role_type === "client" || r.role_type === "vendor"));

/** "عميل (المعرض) · مورد (المشتريات)": which parties the entity already is, and where. */
export const entityRolesLabel = (entity: Entity, unitName: (id: string | null | undefined) => string): string =>
  (entity.roles ?? [])
    .map((r) => {
      const unit = r.operating_unit_id ? unitName(r.operating_unit_id) : "";
      return unit ? `${ROLE_LABEL[r.role_type] ?? r.role_type} (${unit})` : (ROLE_LABEL[r.role_type] ?? r.role_type);
    })
    .join(" · ");

const inputClass =
  "w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none disabled:opacity-60";

interface SupplierPartyFieldsProps {
  entities: Entity[];
  entitiesLoading?: boolean;
  entityId: string | null;
  onEntityChange: (entity: Entity | null) => void;
  /** The edit form relinks to another entity but cannot unlink. */
  clearable?: boolean;
  taxNumber: string;
  onTaxNumberChange: (value: string) => void;
  unitName: (id: string | null | undefined) => string;
  /** Edit form: the supplier's own private entity, whose tax number follows the supplier. */
  privateEntityId?: string | null;
}

/**
 * The supplier's own entity is private when its only role is vendor of the
 * supplier's unit and no other supplier links to it (SupplierService::entityIsShared).
 */
export const isPrivateSupplierEntity = (
  entity: Entity | undefined,
  operatingUnitId: string,
  linkedByAnotherSupplier = false
): boolean =>
  !linkedByAnotherSupplier &&
  Boolean(entity?.roles?.length) &&
  Boolean(entity?.roles?.every((r) => r.role_type === "vendor" && r.operating_unit_id === operatingUnitId));

export const SupplierPartyFields: React.FC<SupplierPartyFieldsProps> = ({
  entities,
  entitiesLoading,
  entityId,
  onEntityChange,
  clearable = true,
  taxNumber,
  onTaxNumberChange,
  unitName,
  privateEntityId,
}) => {
  const linked = entities.find((e) => e.id === entityId) ?? null;
  // A shared entity that already has a tax number keeps it: the API refuses a different one.
  const taxLocked = Boolean(linked?.tax_number) && linked?.id !== privateEntityId;

  return (
    <div className="space-y-3 rounded-xl border border-app-separator p-3">
      <div>
        <label className="block text-xs font-semibold text-app-label-secondary mb-1">
          ربط بجهة موجودة (اختياري)
        </label>
        <SearchableSelect<Entity>
          options={entities}
          value={linked}
          onChange={onEntityChange}
          getOptionId={(e) => e.id}
          getOptionLabel={(e) => e.name}
          getOptionSubLabel={(e) =>
            [entityRolesLabel(e, unitName), e.tax_number ? `ض: ${e.tax_number}` : ""].filter(Boolean).join(" — ") ||
            undefined
          }
          getOptionSearchText={(e) => `${e.name} ${e.tax_number ?? ""} ${e.phone ?? ""}`}
          placeholder="-- جهة جديدة باسم المورد --"
          emptyMessage="لا توجد جهات مطابقة"
          loading={entitiesLoading}
          clearable={clearable}
        />
        <p className="mt-1 text-[11px] text-app-label-secondary">
          إن كانت الشركة عميلاً لدينا أو مورداً لوحدة أخرى فاربطها هنا بدلاً من إنشاء جهة مكررة.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-app-label-secondary mb-1">الرقم الضريبي</label>
        <input
          type="text"
          value={taxNumber}
          onChange={(e) => onTaxNumberChange(e.target.value)}
          disabled={taxLocked}
          maxLength={100}
          placeholder="اختياري — يُستخدم لكشف الموردين المكررين"
          className={`${inputClass} font-mono`}
        />
        {taxLocked && (
          <p className="mt-1 text-[11px] text-app-label-secondary">
            الرقم الضريبي محفوظ على الجهة المرتبطة، ويُعدَّل من بطاقتها لا من المورد.
          </p>
        )}
      </div>
    </div>
  );
};

interface SupplierDuplicateWarningProps {
  duplicates: SupplierDuplicate[];
  saving: boolean;
  onForce: () => void;
  /** Edit form only: merge the supplier being edited into the matching one. */
  onMerge?: (duplicate: SupplierDuplicate) => void;
}

export const SupplierDuplicateWarning: React.FC<SupplierDuplicateWarningProps> = ({
  duplicates,
  saving,
  onForce,
  onMerge,
}) => (
  <div className="space-y-2 rounded-xl border border-app-status-warning/40 bg-app-status-warning/10 p-3 text-xs">
    <div className="flex items-center gap-1.5 font-bold text-app-status-warning">
      <AlertTriangle className="h-4 w-4" />
      <span>يوجد مورد مشابه في هذه الوحدة</span>
    </div>
    <ul className="space-y-1">
      {duplicates.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-2 text-app-label-primary">
          <span>
            <span className="font-semibold">{d.name}</span>
            {d.tax_number && <span className="ms-1 font-mono text-app-label-secondary">({d.tax_number})</span>}
            <span className="ms-1 text-app-label-secondary">— {MATCH_LABEL[d.match] ?? d.match}</span>
          </span>
          {onMerge && (
            <button
              type="button"
              onClick={() => onMerge(d)}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-app-separator px-2 py-0.5 text-[11px] font-semibold text-app-label-secondary hover:border-app-accent hover:text-app-accent"
            >
              <GitMerge className="h-3 w-3" />
              <span>دمج فيه</span>
            </button>
          )}
        </li>
      ))}
    </ul>
    <p className="text-app-label-secondary">
      {onMerge
        ? "إن كانا المورد نفسه فادمجهما، وإلا فاحفظ رغم التشابه."
        : "إن كان المورد نفسه فاستخدم السجل الموجود (أو ادمج المكرر لاحقاً)، وإلا فاحفظ رغم التشابه."}
    </p>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onForce}
        disabled={saving}
        className="rounded-lg border border-app-status-warning/50 px-3 py-1 text-[11px] font-bold text-app-status-warning hover:bg-app-status-warning/15 disabled:opacity-50"
      >
        {saving ? "جاري الحفظ..." : "حفظ رغم التشابه"}
      </button>
    </div>
  </div>
);
