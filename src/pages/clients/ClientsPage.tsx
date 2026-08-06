import React, { useEffect, useState } from "react";
import { Users, Plus, RefreshCw, CreditCard, Scissors } from "lucide-react";
import { isAxiosError } from "axios";
import { Client, Entity, ClientStatus, OperatingUnit, EntityType } from "../../types/entities";
import { getClients, createClient, splitClientEntity } from "../../api/endpoints/clients";
import { getEntities } from "../../api/endpoints/entities";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [operatingUnits, setOperatingUnits] = useState<OperatingUnit[]>([]);
  const [selectedOperatingUnitId, setSelectedOperatingUnitId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entityMode, setEntityMode] = useState<"auto" | "existing">("auto");
  const [clientName, setClientName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("organization");
  const [taxNumber, setTaxNumber] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [creditLimit, setCreditLimit] = useState<number>(10000);
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [clientData, entData, unitData] = await Promise.all([
        getClients(),
        getEntities(),
        getOperatingUnits(),
      ]);
      setClients(clientData);
      setEntities(entData);
      setOperatingUnits(unitData);
      if (unitData.length > 0 && !selectedOperatingUnitId) {
        setSelectedOperatingUnitId(unitData[0].id);
      }
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setError(message || "تعذر تحميل سجلات العملاء");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = selectedOperatingUnitId || operatingUnits[0]?.id;

    if (entityMode === "existing" && !selectedEntityId) {
      alert("يرجى اختيار الكيان الحالي");
      return;
    }

    if (entityMode === "auto" && !clientName.trim()) {
      alert("يرجى إدخال اسم العميل/الشركة لإنشاء الكيان التلقائي");
      return;
    }

    if (!unitId) {
      alert("يرجى اختيار الوحدة التشغيلية");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        operating_unit_id: unitId,
        credit_limit: creditLimit,
        payment_terms_days: paymentTermsDays,
        status: "active" as ClientStatus,
        ...(entityMode === "existing"
          ? { entity_id: selectedEntityId }
          : { name: clientName.trim(), entity_type: entityType, tax_number: taxNumber.trim() || undefined }),
      };

      const newClient = await createClient(payload);

      setClients((prev) => [newClient, ...prev]);
      setIsModalOpen(false);
      setClientName("");
      setTaxNumber("");
      setSelectedEntityId("");
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : null;
      alert(message || "خطأ أثناء إضافة العميل");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSplitEntity = async (client: Client) => {
    const newName = prompt(`فصل العميل (${client.entity?.name}) في كيان مستقل.\nأدخل الاسم الجديد للكيان (أو اتركه فارغاً للاحتفاظ بالاسم الحالي):`, client.entity?.name || "");
    if (newName === null) return;

    try {
      await splitClientEntity(client.id, { new_name: newName.trim() || undefined });
      alert("تم فصل العميل في كيان جديد بنجاح");
      fetchData();
    } catch (err: unknown) {
      const message = isAxiosError(err) ? err.response?.data?.message : null;
      alert(message || "حدث خطأ أثناء فصل الكيان");
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary">إدارة العملاء والآجل</h1>
          <p className="text-xs text-app-label-secondary mt-1">
            متابعة سقف الائتمان، شروط السداد، ومحفظة عملاء الكيانات بالوحدة التشغيلية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs font-semibold text-app-label-primary hover:bg-app-fill-f1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-app-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            إضافة عميل
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary">
          <RefreshCw className="h-6 w-6 animate-spin text-app-accent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600">
          {error}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <Users className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا يوجد عملاء مضافون</p>
          <p className="text-xs text-app-label-secondary mt-1">
            قم بإضافة عميل جديد لربطه بسقف ائتماني وشروط سداد
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">اسم العميل / الكيان</th>
                <th className="px-4 py-3 text-start font-bold">الحد الائتماني (LYD)</th>
                <th className="px-4 py-3 text-start font-bold">فترة السداد الآجل</th>
                <th className="px-4 py-3 text-start font-bold">الحالة</th>
                <th className="px-4 py-3 text-end font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    {client.entity?.name || "كيان عميل"}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5 text-app-accent" />
                      <span>{Number(client.credit_limit).toLocaleString()} د.ل</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-app-label-secondary">
                    {client.payment_terms_days} يوم
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {client.status === "active" ? "نشط" : client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => handleSplitEntity(client)}
                      title="فصل الكيان إلى كيان جديد مستقل"
                      className="inline-flex items-center gap-1 rounded-lg border border-app-separator bg-app-bg-secondary px-2.5 py-1 text-[11px] font-semibold text-app-label-primary hover:bg-app-fill-f1"
                    >
                      <Scissors className="h-3 w-3 text-app-accent" />
                      <span>فصل الكيان</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
            <h3 className="text-lg font-bold text-app-label-primary mb-4">إضافة عميل جديد</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الوحدة التشغيلية <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedOperatingUnitId}
                  onChange={(e) => setSelectedOperatingUnitId(e.target.value)}
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                >
                  <option value="">-- اختر الوحدة التشغيلية --</option>
                  {operatingUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entity Selection Mode Toggle */}
              <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-3">
                <label className="block text-xs font-bold text-app-label-primary">
                  الكيان المرتبط بالعميل
                </label>
                <div className="flex items-center gap-4 text-xs font-semibold text-app-label-primary">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="entityMode"
                      checked={entityMode === "auto"}
                      onChange={() => setEntityMode("auto")}
                      className="text-app-accent"
                    />
                    <span>إنشاء كيان جديد تلقائياً</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="entityMode"
                      checked={entityMode === "existing"}
                      onChange={() => setEntityMode("existing")}
                      className="text-app-accent"
                    />
                    <span>اختيار كيان حالي</span>
                  </label>
                </div>

                {entityMode === "auto" ? (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                        اسم العميل / الشركة <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="مثال: شركة الصحراء للمقاولات"
                        className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                          نوع الكيان
                        </label>
                        <select
                          value={entityType}
                          onChange={(e) => setEntityType(e.target.value as EntityType)}
                          className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                        >
                          <option value="organization">شركة / مؤسسة</option>
                          <option value="individual">فرد</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                          الرقم الضريبي (اختياري)
                        </label>
                        <input
                          type="text"
                          value={taxNumber}
                          onChange={(e) => setTaxNumber(e.target.value)}
                          placeholder="مثال: TAX-900800"
                          className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <select
                      required
                      value={selectedEntityId}
                      onChange={(e) => setSelectedEntityId(e.target.value)}
                      className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                    >
                      <option value="">-- اختر كيان --</option>
                      {entities.map((ent) => (
                        <option key={ent.id} value={ent.id}>
                          {ent.name} ({ent.entity_type === "organization" ? "شركة" : "فرد"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    الحد الائتماني المسموح (LYD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    فترة السداد الآجل (أيام)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paymentTermsDays}
                    onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-app-separator">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-app-label-secondary hover:bg-app-fill-f1"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (entityMode === "existing" && !selectedEntityId) ||
                    (entityMode === "auto" && !clientName.trim())
                  }
                  className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ العميل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
