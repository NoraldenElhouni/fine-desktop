import React from "react";
import { ChangePasswordForm } from "../../components/forms/auth/ChangePasswordForm";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

const ChangePasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-app-bg-primary text-app-label-primary p-4">
      <div className="w-full max-w-sm bg-app-bg-secondary border border-app-separator rounded-app-xl p-6 shadow-xl">
        <div className="mb-6">
          <h1
            className={cn(
              tokens.typography.webUI.largeTitleEmphasized,
              "text-app-label-primary tracking-tight",
            )}
          >
            تغيير كلمة المرور
          </h1>

          <p
            className={cn(
              tokens.typography.webUI.c1Regular,
              "text-app-label-secondary mt-1",
            )}
          >
            يجب تغيير كلمة المرور للمتابعة لاستخدام التطبيق
          </p>
        </div>

        <ChangePasswordForm />

        <div className="mt-6 pt-4 border-t border-app-separator text-center">
          <p className="text-[11px] text-app-label-tertiary">
            عميل فاين ديسكتوب • نظام تخطيط موارد المؤسسات
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
