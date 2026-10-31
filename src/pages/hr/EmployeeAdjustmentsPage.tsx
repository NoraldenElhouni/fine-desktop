import React from "react";
import { Gift } from "lucide-react";
import { EmployeeAdjustmentsPanel } from "../../components/hr/EmployeeAdjustmentsPanel";

/** W5-03 (HR-13): the monthly one-off rewards and deductions under HR. */
export const EmployeeAdjustmentsPage: React.FC = () => (
  <div className="space-y-6 p-6" dir="rtl">
    <div>
      <h1 className="text-2xl font-bold text-app-label-primary flex items-center gap-2">
        <Gift className="w-7 h-7 text-app-accent" />
        المكافآت والجزاءات الشهرية
      </h1>
      <p className="text-xs text-app-label-secondary mt-1">
        يُدخلها قسم الموارد البشرية مسودةً لشهر معيّن، ولا تدخل مسير ذلك الشهر إلا بعد اعتمادها من المالك أو مدير الحسابات أو
        مدير الموارد البشرية. تُضاف المكافآت إلى إجمالي الراتب، وتُستقطع الجزاءات منه حسب نوع الخصم: ما يُسدَّد لجهة يُقيَّد على
        حساب الاستقطاعات المستحقة (225)، وما تحتفظ به الشركة يُخفِّض مصروف الرواتب (57). البدلات والاستقطاعات المتكررة تُسجَّل من
        بطاقة الموظف.
      </p>
    </div>
    <EmployeeAdjustmentsPanel />
  </div>
);

export default EmployeeAdjustmentsPage;
