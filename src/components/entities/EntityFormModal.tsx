import React, { useState } from "react";
import { X } from "lucide-react";
import { CreateEntityPayload, EntityType, EntityRoleType } from "../../types/entities";

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEntityPayload) => Promise<void>;
  isLoading?: boolean;
}

export const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("organization");
  const [taxNumber, setTaxNumber] = useState("");

  // Primary Contact
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Tripoli");
  const [address, setAddress] = useState("");

  // Roles selection
  const [roles, setRoles] = useState<EntityRoleType[]>([]);

  if (!isOpen) return null;

  const toggleRole = (role: EntityRoleType) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: CreateEntityPayload = {
      name: name.trim(),
      entity_type: entityType,
      tax_number: taxNumber.trim() || undefined,
      is_active: true,
      contact: {
        contact_name: contactName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        country: "LY",
      },
      roles: roles.map((r) => ({ role_type: r })),
    };

    try {
      await onSubmit(payload);
      // Reset form on success
      setName("");
      setTaxNumber("");
      setContactName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setRoles([]);
      onClose();
    } catch {
      // Keep form inputs intact on error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
        <div className="flex items-center justify-between border-b border-app-separator pb-4">
          <h3 className="text-lg font-bold text-app-label-primary">إضافة كيان جديد</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-app-label-secondary hover:bg-app-fill-f1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Entity Name & Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                الاسم الرسمي / التجاري <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: شركة النماء للإنشاءات"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-sm text-app-label-primary focus:border-app-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                نوع الكيان
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-sm text-app-label-primary focus:border-app-accent focus:outline-none"
              >
                <option value="organization">شركة / منظمة (Organization)</option>
                <option value="individual">فرد (Individual)</option>
              </select>
            </div>
          </div>

          {/* Tax Number */}
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-1">
              الرقم الضريبي / السجل التجاري
            </label>
            <input
              type="text"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="TAX-123456"
              className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-sm text-app-label-primary focus:border-app-accent focus:outline-none"
            />
          </div>

          {/* Primary Contact Info */}
          <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-3">
            <p className="text-xs font-bold text-app-label-primary">بيانات التواصل الأولية</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="اسم الشخص المسؤول"
                  className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف (+218)"
                  className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="المدينة (طرابلس / بنغازي...)"
                  className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                />
              </div>
            </div>
            <div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="العنوان التفصيلي"
                className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Initial Roles Selection */}
          <div>
            <label className="block text-xs font-semibold text-app-label-secondary mb-2">
              أدوار الكيان في النظام (يمكن اختيار أكثر من دور)
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: "client", label: "عميل (Client)" },
                { id: "employee", label: "موظف (Employee)" },
                { id: "external_employer", label: "جهة مشغلة (Employer)" },
                { id: "vendor", label: "مورد (Vendor)" },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id as EntityRoleType)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    roles.includes(role.id as EntityRoleType)
                      ? "border-app-accent bg-app-accent-subtle text-app-accent"
                      : "border-app-separator bg-app-bg-secondary text-app-label-secondary hover:bg-app-fill-f1"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-app-separator">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ الكيان"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
