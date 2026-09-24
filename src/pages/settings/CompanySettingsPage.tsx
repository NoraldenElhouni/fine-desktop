import React, { useState } from "react";
import { Building2, Pencil, Save, X } from "lucide-react";
import { DummyDataNotice } from "../../components/settings/DummyDataNotice";
import { toast } from "../../stores/toastStore";

/**
 * TEMPORARY company profile screen. Fields mirror the expected company
 * resource; values are local dummy state until the API is wired.
 *
 * Reads as a view by default — "تعديل" flips the same layout into inputs.
 */
const DUMMY_COMPANY = {
  displayName: "شركة فاين للإسفنج",
  legalName: "شركة فاين للإسفنج (ذ.م.م)",
  registrationNumber: "LY-TRP-48213",
  taxNumber: "218-994-0071",
  phone: "+218 91 000 0000",
  email: "info@al-amana.ly",
  address: "طبرق، ليبيا",
  baseCurrency: "LYD",
  fiscalYearStart: "01-01",
  invoicePrefix: "INV-",
};

type CompanyForm = typeof DUMMY_COMPANY;

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  hint?: string;
  mono?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  isEditing,
  hint,
  mono,
}) => (
  <div>
    <label className="mb-1 block text-xs font-semibold uppercase text-app-label-secondary">
      {label}
    </label>

    {isEditing ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:border-app-accent focus:outline-none ${
          mono ? "font-mono" : ""
        }`}
      />
    ) : (
      <p
        className={`rounded-xl border border-transparent bg-app-fill-f1/40 px-3 py-2 text-xs text-app-label-primary ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "—"}
      </p>
    )}

    {hint ? (
      <p className="mt-1 text-[11px] text-app-label-tertiary">{hint}</p>
    ) : null}
  </div>
);

export const CompanySettingsPage: React.FC = () => {
  const [company, setCompany] = useState<CompanyForm>(DUMMY_COMPANY);
  const [draft, setDraft] = useState<CompanyForm>(DUMMY_COMPANY);
  const [isEditing, setIsEditing] = useState(false);

  const setField = (key: keyof CompanyForm) => (value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = () => {
    setDraft(company);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(company);
    setIsEditing(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCompany(draft);
    setIsEditing(false);
    toast.info("لم يتم الربط مع الخادم بعد — لن تُحفظ بيانات الشركة.");
  };

  const values = isEditing ? draft : company;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-app-label-primary">
            <Building2 className="h-7 w-7 text-app-accent" />
            إعدادات الشركة
          </h1>
          <p className="mt-1 text-xs text-app-label-secondary">
            البيانات التعريفية والقانونية للشركة، وتظهر على المستندات والفواتير
            المطبوعة.
          </p>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              className="flex items-center gap-2 rounded-xl border border-app-separator px-4 py-2 text-xs font-semibold text-app-label-secondary transition-colors hover:bg-app-fill-f1 hover:text-app-label-primary"
            >
              <X className="h-4 w-4" /> إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
            >
              <Save className="h-4 w-4" /> حفظ التغييرات
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <Pencil className="h-4 w-4" /> تعديل البيانات
          </button>
        )}
      </div>

      <DummyDataNotice />

      <div className="space-y-4 rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-sm">
        <h2 className="text-sm font-bold text-app-label-primary">
          الهوية والتعريف
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="الاسم التجاري"
            value={values.displayName}
            onChange={setField("displayName")}
            isEditing={isEditing}
          />
          <Field
            label="الاسم القانوني"
            value={values.legalName}
            onChange={setField("legalName")}
            isEditing={isEditing}
          />
          <Field
            label="رقم السجل التجاري"
            value={values.registrationNumber}
            onChange={setField("registrationNumber")}
            isEditing={isEditing}
            mono
          />
          <Field
            label="الرقم الضريبي"
            value={values.taxNumber}
            onChange={setField("taxNumber")}
            isEditing={isEditing}
            mono
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-sm">
        <h2 className="text-sm font-bold text-app-label-primary">
          بيانات التواصل
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="رقم الهاتف"
            value={values.phone}
            onChange={setField("phone")}
            isEditing={isEditing}
            mono
          />
          <Field
            label="البريد الإلكتروني"
            value={values.email}
            onChange={setField("email")}
            isEditing={isEditing}
            mono
          />
          <div className="md:col-span-2">
            <Field
              label="العنوان"
              value={values.address}
              onChange={setField("address")}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-sm">
        <h2 className="text-sm font-bold text-app-label-primary">
          الإعدادات المالية والمستندية
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="العملة الأساسية"
            value={values.baseCurrency}
            onChange={setField("baseCurrency")}
            isEditing={isEditing}
            hint="تُسجَّل بها جميع القيود المحاسبية"
            mono
          />
          <Field
            label="بداية السنة المالية"
            value={values.fiscalYearStart}
            onChange={setField("fiscalYearStart")}
            isEditing={isEditing}
            hint="صيغة يوم-شهر (مثال: 01-01)"
            mono
          />
          <Field
            label="بادئة ترقيم الفواتير"
            value={values.invoicePrefix}
            onChange={setField("invoicePrefix")}
            isEditing={isEditing}
            mono
          />
        </div>
      </div>
    </form>
  );
};
