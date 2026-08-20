import React, { useEffect, useState } from "react";
import { UserCheck, Plus, RefreshCw, Briefcase, Building, Calendar, DollarSign, Scissors } from "lucide-react";
import { isAxiosError } from "axios";
import { Employee, Entity, PayType, EmployeeStatus, OperatingUnit } from "../../types/entities";
import { getEmployees, createEmployee, splitEmployeeEntity } from "../../api/endpoints/employees";
import { getEntities } from "../../api/endpoints/entities";
import { getOperatingUnits } from "../../api/endpoints/operatingUnits";
import { useServerConfigStore } from "../../stores/serverConfigStore";

export const EmployeesPage: React.FC = () => {
  const { allowManualEntitySelection } = useServerConfigStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [externalEmployers, setExternalEmployers] = useState<Entity[]>([]);
  const [operatingUnits, setOperatingUnits] = useState<OperatingUnit[]>([]);
  const [selectedOperatingUnitId, setSelectedOperatingUnitId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entityMode, setEntityMode] = useState<"auto" | "existing">("auto");
  const [employeeName, setEmployeeName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [laborRole, setLaborRole] = useState("");
  const [payType, setPayType] = useState<PayType>("monthly");
  const [monthlySalary, setMonthlySalary] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [hireDate, setHireDate] = useState(new Date().toISOString().split("T")[0]);
  const [employerEntityId, setEmployerEntityId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [empData, entData, unitData] = await Promise.all([
        getEmployees(),
        getEntities(),
        getOperatingUnits(),
      ]);
      setEmployees(empData);
      setEntities(entData);
      setOperatingUnits(unitData);
      if (unitData.length > 0 && !selectedOperatingUnitId) {
        setSelectedOperatingUnitId(unitData[0].id);
      }

      // Filter external employer agencies
      const employersList = entData.filter(
        (e) =>
          e.roles?.some((r) => r.role_type === "external_employer") ||
          Boolean(e.external_employer)
      );
      setExternalEmployers(employersList);
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setError(message || "تعذر تحميل سجلات الموظفين");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = selectedOperatingUnitId || operatingUnits[0]?.id;
    
    if (entityMode === "existing" && !selectedEntityId) {
      alert("يرجى اختيار الكيان الحالي");
      return;
    }

    if (entityMode === "auto" && !employeeName.trim()) {
      alert("يرجى إدخال اسم الموظف لإنشاء الكيان التلقائي");
      return;
    }

    if (!jobTitle || !unitId) {
      alert("يرجى تعبئة كافة الحقول المطلوبة والوحدة التشغيلية");
      return;
    }

    const validEmployerEntityId =
      employerEntityId.trim() && employerEntityId !== selectedEntityId
        ? employerEntityId.trim()
        : undefined;

    try {
      setIsSubmitting(true);
      const payload = {
        operating_unit_id: unitId,
        employer_entity_id: validEmployerEntityId,
        job_title: jobTitle,
        labor_role: laborRole.trim() || undefined,
        pay_type: payType,
        monthly_salary: payType === "monthly" && monthlySalary ? Number(monthlySalary) : undefined,
        hourly_rate: payType === "hourly" && hourlyRate ? Number(hourlyRate) : undefined,
        hire_date: hireDate,
        status: "active" as EmployeeStatus,
        ...(entityMode === "existing"
          ? { entity_id: selectedEntityId }
          : { name: employeeName.trim(), entity_type: "individual" as const, tax_number: taxNumber.trim() || undefined }),
      };

      const newEmp = await createEmployee(payload);

      setEmployees((prev) => [newEmp, ...prev]);
      setIsModalOpen(false);
      // Reset
      setEmployeeName("");
      setTaxNumber("");
      setSelectedEntityId("");
      setJobTitle("");
      setLaborRole("");
      setMonthlySalary("");
      setHourlyRate("");
      setEmployerEntityId("");
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : null;
      alert(message || "خطأ أثناء إضافات الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSplitEntity = async (emp: Employee) => {
    const newName = prompt(`فصل الموظف (${emp.entity?.name || emp.job_title}) في كيان مستقل.\nأدخل الاسم الجديد للكيان (أو اتركه فارغاً للاحتفاظ بالاسم الحالي):`, emp.entity?.name || "");
    if (newName === null) return;

    try {
      await splitEmployeeEntity(emp.id, { new_name: newName.trim() || undefined });
      alert("تم فصل الموظف في كيان جديد بنجاح");
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
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
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
                <th className="px-4 py-3 text-start font-bold">المسمى الوظيفي والدور</th>
                <th className="px-4 py-3 text-start font-bold">نوع التوظيف والجهة المشغلة</th>
                <th className="px-4 py-3 text-start font-bold">نظام الأجر والمعدل</th>
                <th className="px-4 py-3 text-start font-bold">تاريخ التعيين</th>
                <th className="px-4 py-3 text-start font-bold">الحالة</th>
                <th className="px-4 py-3 text-end font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-app-fill-f1 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    {emp.entity?.name || "كيان غير معرف"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Briefcase className="h-3.5 w-3.5 text-app-accent" />
                      <span className="font-semibold">{emp.job_title}</span>
                      {emp.labor_role && (
                        <span className="rounded-md bg-app-fill-f2 px-1.5 py-0.5 text-[10px] font-mono text-app-label-secondary border border-app-separator">
                          {emp.labor_role}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {emp.employer_entity_id ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-app-status-info/10 px-2.5 py-1 text-[11px] font-bold text-app-status-info border border-app-status-info/20">
                        <Building className="h-3 w-3" />
                        عبر: {emp.employer_entity?.name || "جهة مشغلة خارجية"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-app-status-positive/10 px-2.5 py-1 text-[11px] font-bold text-app-status-positive border border-app-status-positive/20">
                        تعيين مباشر
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 font-mono">
                      <DollarSign className="h-3.5 w-3.5 text-app-accent" />
                      {emp.pay_type === "monthly" && (
                        <span>
                          {emp.monthly_salary ? `${Number(emp.monthly_salary).toLocaleString()} د.ل / شهر` : "راتب شهري"}
                        </span>
                      )}
                      {emp.pay_type === "hourly" && (
                        <span>
                          {emp.hourly_rate ? `${Number(emp.hourly_rate).toLocaleString()} د.ل / ساعة` : "أجر بالساعة"}
                        </span>
                      )}
                      {emp.pay_type === "piece_rate" && (
                        <span className="font-sans text-app-label-secondary">بالقطعة</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-app-label-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{emp.hire_date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      emp.status === "active"
                        ? "bg-app-status-positive/15 text-app-status-positive"
                        : emp.status === "on_leave"
                        ? "bg-app-status-warning/15 text-app-status-warning"
                        : "bg-app-status-danger/15 text-app-status-danger"
                    }`}>
                      {emp.status === "active" ? "نشط" : emp.status === "on_leave" ? "إجازة" : emp.status === "terminated" ? "منتهي" : emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => handleSplitEntity(emp)}
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

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-app-separator bg-app-bg-primary p-6 shadow-xl" dir="rtl">
            <h3 className="text-lg font-bold text-app-label-primary mb-4">إضافة موظف جديد</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الوحدة التشغيلية <span className="text-app-status-danger">*</span>
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

              {/* Entity Information (Auto-create by default, or Manual Toggle if enabled in Settings) */}
              {allowManualEntitySelection ? (
                <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-3">
                  <label className="block text-xs font-bold text-app-label-primary">
                    الكيان المرتبط بالموظف
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
                          اسم الموظف الكامل <span className="text-app-status-danger">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={employeeName}
                          onChange={(e) => setEmployeeName(e.target.value)}
                          placeholder="مثال: ناصر الدين أحمد"
                          className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                          الرقم الضريبي / الوطني (اختياري)
                        </label>
                        <input
                          type="text"
                          value={taxNumber}
                          onChange={(e) => setTaxNumber(e.target.value)}
                          placeholder="مثال: TAX-100200"
                          className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                        />
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
                        <option value="">-- اختر كيان شخصي --</option>
                        {entities.map((ent) => (
                          <option key={ent.id} value={ent.id}>
                            {ent.name} ({ent.entity_type === "individual" ? "فرد" : "شركة"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                      اسم الموظف الكامل <span className="text-app-status-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="مثال: ناصر الدين أحمد"
                      className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                      الرقم الضريبي / الوطني (اختياري)
                    </label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="مثال: TAX-100200"
                      className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    المسمى الوظيفي <span className="text-app-status-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="مثال: فني قوالب / خياط / نجار"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    الدور المهني / الحرفي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={laborRole}
                    onChange={(e) => setLaborRole(e.target.value)}
                    placeholder="مثال: tailor / carpenter / operator"
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary font-mono focus:outline-none"
                  />
                </div>
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
                  {payType === "monthly" ? (
                    <div>
                      <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                        الراتب الشهري الأساسي (LYD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(e.target.value)}
                        placeholder="مثال: 2000"
                        className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                      />
                    </div>
                  ) : payType === "hourly" ? (
                    <div>
                      <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                        الأجر الأساسي بالساعة (LYD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="مثال: 15"
                        className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                        ملاحظات الأجر بالقطعة
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="يحدد بأمر الإنتاج"
                        className="w-full rounded-xl border border-app-separator bg-app-bg-secondary/50 px-3 py-2 text-xs text-app-label-secondary"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    تاريخ التعيين <span className="text-app-status-danger">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
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
                    {externalEmployers
                      .filter((emp) => emp.id !== selectedEntityId)
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} (جهة مشغلة)
                        </option>
                      ))}
                  </select>
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
                    !jobTitle ||
                    (entityMode === "existing" && !selectedEntityId) ||
                    (entityMode === "auto" && !employeeName.trim())
                  }
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
