import React, { useEffect, useState } from "react";
import { UserCheck, Plus, RefreshCw, Briefcase, Building, Calendar, DollarSign } from "lucide-react";
import { Employee, Entity, PayType, EmployeeStatus } from "../../types/entities";
import { getEmployees, createEmployee } from "../../api/endpoints/employees";
import { getEntities } from "../../api/endpoints/entities";

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [externalEmployers, setExternalEmployers] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [payType, setPayType] = useState<PayType>("monthly");
  const [hireDate, setHireDate] = useState(new Date().toISOString().split("T")[0]);
  const [employerEntityId, setEmployerEntityId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [empData, entData] = await Promise.all([getEmployees(), getEntities()]);
      setEmployees(empData);
      setEntities(entData);

      // Filter external employer agencies
      const employersList = entData.filter((e) =>
        e.roles?.some((r) => r.role_type === "external_employer")
      );
      setExternalEmployers(employersList);
    } catch (err: any) {
      setError(err.response?.data?.message || "تعذر تحميل سجلات الموظفين");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityId || !jobTitle) return;

    try {
      setIsSubmitting(true);
      const newEmp = await createEmployee({
        entity_id: selectedEntityId,
        operating_unit_id: "00000000-0000-0000-0000-000000000000", // Will be assigned by backend unit scope
        employer_entity_id: employerEntityId || null,
        job_title: jobTitle,
        pay_type: payType,
        hire_date: hireDate,
        status: "active" as EmployeeStatus,
      });

      setEmployees((prev) => [newEmp, ...prev]);
      setIsModalOpen(false);
      // Reset
      setSelectedEntityId("");
      setJobTitle("");
      setEmployerEntityId("");
    } catch (err: any) {
      alert(err.response?.data?.message || "خطأ أثناء إضافات الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-label-primary">إدارة الموظفين والعمالة</h1>
          <p className="text-xs text-app-label-secondary mt-1">
            متابعة القوى العاملة بالوحدة التشغيلية (العمالة المباشرة والعمالة عبر الجهات المشغلة)
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
            إضافة موظف
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
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <UserCheck className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا يوجد موظفون مسجلون</p>
          <p className="text-xs text-app-label-secondary mt-1">
            انقر على إضافة موظف لربط كيان بسجل الوحدة التشغيلية
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">اسم الموظف والكيان</th>
                <th className="px-4 py-3 text-start font-bold">المسمى الوظيفي</th>
                <th className="px-4 py-3 text-start font-bold">نوع التوظيف والجهة المشغلة</th>
                <th className="px-4 py-3 text-start font-bold">نظام الأجر</th>
                <th className="px-4 py-3 text-start font-bold">تاريخ التعيين</th>
                <th className="px-4 py-3 text-start font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    {emp.entity?.name || "كيان غير معرف"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-app-accent" />
                      <span>{emp.job_title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {emp.employer_entity_id ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
                        <Building className="h-3 w-3" />
                        عبر: {emp.employer_entity?.name || "جهة مشغلة خارجية"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        تعيين مباشر
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-app-label-secondary font-semibold">
                      <DollarSign className="h-3 w-3 text-app-accent" />
                      <span>
                        {emp.pay_type === "monthly" && "شهري"}
                        {emp.pay_type === "hourly" && "بالساعة"}
                        {emp.pay_type === "piece_rate" && "بالقطعة"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{emp.hire_date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {emp.status === "active" ? "نشط" : emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
            <h3 className="text-lg font-bold text-app-label-primary mb-4">إضافة موظف جديد</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  اختر الكيان (الشخص) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                >
                  <option value="">-- اختر كيان شخصي --</option>
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.name} ({ent.entity_type === "individual" ? "فرد" : "شركة"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  المسمى الوظيفي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="مثال: فني قوالب إسفنج / محاسب"
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    نظام الأجر
                  </label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as PayType)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  >
                    <option value="monthly">راتب شهري</option>
                    <option value="hourly">أجر بالساعة</option>
                    <option value="piece_rate">أجر بالقطعة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    تاريخ التعيين
                  </label>
                  <input
                    type="date"
                    required
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الجهة المشغلة (اختياري - للعمالة الخارجية)
                </label>
                <select
                  value={employerEntityId}
                  onChange={(e) => setEmployerEntityId(e.target.value)}
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                >
                  <option value="">-- تعيين مباشر (بدون جهة مشغلة) --</option>
                  {externalEmployers.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (جهة مشغلة)
                    </option>
                  ))}
                </select>
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
                  disabled={isSubmitting || !selectedEntityId || !jobTitle}
                  className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ الموظف"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
