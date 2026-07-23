import React from "react";
import { LoginForm } from "../../components/forms/auth/LoginForm";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

const LoginPage: React.FC = () => {
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
            فاين
          </h1>

          <p
            className={cn(
              tokens.typography.webUI.c1Regular,
              "text-app-label-secondary",
            )}
          >
            سجّل الدخول للوصول إلى محطة العمل الخاصة بك
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 pt-4 border-t border-app-separator text-center">
          <p className="text-[11px] text-app-label-tertiary">
            عميل ديسكتوب • نظام تخطيط موارد
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
