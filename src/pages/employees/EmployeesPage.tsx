import React, { useState, useMemo } from "react";
import { UserCheck, Plus, RefreshCw, Briefcase, Building } from "lucide-react";
import { isAxiosError } from "axios";
import { PayType, EmployeeStatus } from "../../types/entities";
import { useEmployees, useCreateEmployee } from "../../hooks/useEmployees";
import { useEntities, useOperatingUnits } from "../../hooks/usePartners";
import { useServerConfigStore } from "../../stores/serverConfigStore";
import { toast } from "../../stores/toastStore";
import { apiErrorPayload } from "../../api/endpoints/production";
import { Modal } from "../../components/ui/Modal";

export const EmployeesPage: React.FC = () => {
  const { allowManualEntitySelection } = useServerConfigStore();
  const [selectedOperatingUnitId, setSelectedOperatingUnitId] = useState("");

  const {
    data: employees = [],
    isLoading,
    error: queryError,
    refetch,
  } = useEmployees();
  const { data: entities = [] } = useEntities();
  const { data: operatingUnits = [] } = useOperatingUnits();
  const createEmployeeMutation = useCreateEmployee();

  const externalEmployers = useMemo(() => {
    return entities.filter(
      (e) =>
        e.roles?.some((r) => r.role_type === "external_employer") ||
        Boolean(e.external_employer)
    );
  }, [entities]);

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

  const resetForm = () => {
    setEmployeeName("");
    setTaxNumber("");
    setSelectedEntityId("");
    setJobTitle("");
    setLaborRole("");
    setMonthlySalary("");
    setHourlyRate("");
    setEmployerEntityId("");
    setEntityMode("auto");
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = selectedOperatingUnitId || operatingUnits[0]?.id;

    if (entityMode === "existing" && !selectedEntityId) {
      toast.error("يرجى اختيار الكيان الحالي");
      return;
    }

    if (entityMode === "auto" && !employeeName.trim()) {
      toast.error("يرجى إدخال اسم الموظف لإنشاء الكيان التلقائي");
      return;
    }

    if (!jobTitle || !unitId) {
      toast.error("يرجى تعبئة كافة الحقول المطلوبة والوحدة التشغيلية");
      return;
    }

    const validEmployerEntityId =
      employerEntityId.trim() && employerEntityId !== selectedEntityId
        ? employerEntityId.trim()
        : undefined;

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

    createEmployeeMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("تمت إضافة الموظف بنجاح");
        setIsModalOpen(false);
        resetForm();
      },
      onError: (err: unknown) => {
        const payloadErr = apiErrorPayload(err);
        const message = payloadErr?.message || (isAxiosError(err) ? err.response?.data?.message : null);
        toast.error(message || "خطأ أثناء إضافة الموظف");
      },
    });
  };

  const errorMessage = queryError
    ? apiErrorPayload(queryError)?.message ||
      (isAxiosError(queryError) ? queryError.response?.data?.message : null) ||
      "تعذر تحميل سجلات الموظفين"
    : null;

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
            onClick={() => refetch()}
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
      ) : errorMessage ? (
        <div className="rounded-2xl border border-app-status-danger/30 bg-app-status-danger/10 p-4 text-center text-xs text-app-status-danger">
          {errorMessage}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-separator bg-app-bg-primary p-12 text-center">
          <UserCheck className="h-12 w-12 text-app-label-secondary mb-3 opacity-40" />
          <p className="text-sm font-bold text-app-label-primary">لا يوجد موظفون مضافون</p>
          <p className="text-xs text-app-label-secondary mt-1">
            قم بإضافة موظف جديد لتسجيل بيانات الراتب والتشغيل
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-app-separator bg-app-bg-primary shadow-sm">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-app-separator bg-app-bg-secondary text-app-label-secondary">
              <tr>
                <th className="px-4 py-3 text-start font-bold">اسم الموظف / الكيان</th>
                <th className="px-4 py-3 text-start font-bold">المسمى الوظيفي</th>
                <th className="px-4 py-3 text-start font-bold">الجهة المشغلة (Employer)</th>
                <th className="px-4 py-3 text-start font-bold">طريقة الدفع</th>
                <th className="px-4 py-3 text-start font-bold">الراتب / الأجر</th>
                <th className="px-4 py-3 text-start font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-separator text-app-label-primary">
              {employees.map((emp) => {
                const isExternal = Boolean(emp.employer_entity_id);
                return (
                  <tr key={emp.id} className="hover:bg-app-bg-secondary/50">
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex flex-col">
                        <span className="text-app-label-primary font-bold">
                          {emp.entity?.name || "بدون اسم"}
                        </span>
                        <span className="text-[10px] text-app-label-secondary">
                          {emp.entity?.tax_number ? `رقم/هوية: ${emp.entity.tax_number}` : "بدون هوية"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-app-label-secondary">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-app-accent" />
                        <span>{emp.job_title}</span>
                        {emp.labor_role && (
                          <span className="rounded bg-app-bg-secondary px-1.5 py-0.5 text-[10px] text-app-label-secondary">
                            {emp.labor_role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isExternal ? (
                        <div className="flex items-center gap-1 text-app-status-warning">
                          <Building className="h-3.5 w-3.5" />
                          <span className="font-semibold">{emp.employer_entity?.name || "جهة مشغلة خارجية"}</span>
                        </div>
                      ) : (
                        <span className="text-app-label-secondary font-medium">عمالة مباشرة للمصنع</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-app-label-secondary">
                      {emp.pay_type === "monthly" ? "راتب شهري" : emp.pay_type === "hourly" ? "أجر بالساعة" : "إنتاج/قطعة"}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-app-label-primary">
                      {emp.pay_type === "monthly" && emp.monthly_salary
                        ? `${Number(emp.monthly_salary).toLocaleString()} د.ل / شهر`
                        : emp.pay_type === "hourly" && emp.hourly_rate
                        ? `${Number(emp.hourly_rate).toLocaleString()} د.ل / ساعة`
                        : "حسب الإنتاج"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        emp.status === "active"
                          ? "bg-app-status-positive/15 text-app-status-positive"
                          : "bg-app-status-danger/15 text-app-status-danger"
                      }`}>
                        {emp.status === "active" ? "نشط" : emp.status === "terminated" ? "منتهي" : emp.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة موظف / عامل جديد"
        size="lg"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4" dir="rtl">
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

          {/* Entity Information (Auto-create or Select Existing) */}
          {allowManualEntitySelection ? (
            <div className="rounded-xl border border-app-separator bg-app-bg-secondary p-3 space-y-3">
              <label className="block text-xs font-bold text-app-label-primary">
                الكيان المرتبط بالموظف
              </label>
              <div className="flex items-center gap-4 text-xs font-semibold text-app-label-primary">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="empEntityMode"
                    checked={entityMode === "auto"}
                    onChange={() => setEntityMode("auto")}
                    className="text-app-accent"
                  />
                  <span>إنشاء فرد جديد تلقائياً</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="empEntityMode"
                    checked={entityMode === "existing"}
                    onChange={() => setEntityMode("existing")}
                    className="text-app-accent"
                  />
                  <span>اختيار كيان حالي</span>
                </label>
              </div>

              {entityMode === "auto" ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                      اسم الموظف الثلاثي <span className="text-app-status-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="مثال: أحمد عبد الله المحمودي"
                      className="w-full rounded-lg border border-app-separator bg-app-bg-primary px-3 py-1.5 text-xs text-app-label-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-app-label-secondary mb-1">
                      الرقم الوطني / جواز السفر (اختياري)
                    </label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="مثال: 11985002010"
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
                    <option value="">-- اختر كيان --</option>
                    {entities
                      .filter((ent) => ent.entity_type === "individual")
                      .map((ent) => (
                        <option key={ent.id} value={ent.id}>
                          {ent.name} (فرد)
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  اسم الموظف الثلاثي <span className="text-app-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله المحمودي"
                  className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                  الرقم الوطني / جواز السفر (اختياري)
                </label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="مثال: 11985002010"
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
                placeholder="مثال: مشغل آلة صب الفوم"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                الدور العمالي (للربط بتكلفة الإنتاج)
              </label>
              <input
                type="text"
                value={laborRole}
                onChange={(e) => setLaborRole(e.target.value)}
                placeholder="مثال: operator, tailor, cutter"
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                الجهة المشغلة (اختياري - للعمالة الموردة)
              </label>
              <select
                value={employerEntityId}
                onChange={(e) => setEmployerEntityId(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              >
                <option value="">-- عمالة مباشرة (بدون وسيط) --</option>
                {externalEmployers.map((empAgency) => (
                  <option key={empAgency.id} value={empAgency.id}>
                    {empAgency.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                تاريخ التعيين
              </label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                نوع الدفع / الأجر
              </label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value as PayType)}
                className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
              >
                <option value="monthly">راتب شهري ثابت</option>
                <option value="hourly">أجر بالساعة</option>
                <option value="piece_rate">حسب الإنتاج (بالقطعة)</option>
              </select>
            </div>

            <div>
              {payType === "monthly" && (
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    الراتب الشهري (LYD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="مثال: 1500"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              )}
              {payType === "hourly" && (
                <div>
                  <label className="block text-xs font-semibold text-app-label-secondary mb-1">
                    الأجر بالساعة (LYD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="مثال: 10"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full rounded-xl border border-app-separator bg-app-bg-secondary px-3 py-2 text-xs text-app-label-primary focus:outline-none"
                  />
                </div>
              )}
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
                createEmployeeMutation.isPending ||
                (entityMode === "existing" && !selectedEntityId) ||
                (entityMode === "auto" && !employeeName.trim()) ||
                !jobTitle
              }
              className="rounded-xl bg-app-accent px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {createEmployeeMutation.isPending ? "جاري الحفظ..." : "حفظ الموظف"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
