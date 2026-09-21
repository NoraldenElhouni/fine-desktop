import React, { useEffect, useState } from "react";
import { LoginForm } from "../../components/forms/auth/LoginForm";
import { ServerConfigDialog } from "../../components/settings/ServerConfigDialog";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

const LoginPage: React.FC = () => {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.code === "KeyS" || e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        setIsServerModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

      <ServerConfigDialog
        open={isServerModalOpen}
        onOpenChange={setIsServerModalOpen}
      />
    </div>
  );
};

export default LoginPage;
