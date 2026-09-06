import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight, Home } from "lucide-react";

interface AccessDeniedPageProps {
  title?: string;
  message?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  title = "غير مصرح لك بالوصول",
  message = "ليس لديك الصلاحيات الكافية للوصول إلى هذه الشاشة أو هذا القسم. إذا كنت بحاجة للوصول، يرجى التواصل مع مسؤول النظام.",
}) => {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-fade-in"
    >
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 ring-8 ring-red-500/5">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <div className="absolute -bottom-1 -left-1 rounded-full bg-app-bg-primary px-2 py-0.5 text-[11px] font-black tracking-wider text-red-600 border border-red-200 dark:border-red-800 shadow-sm">
          403
        </div>
      </div>

      <h1 className="text-2xl font-bold text-app-label-primary sm:text-3xl mb-3">
        {title}
      </h1>

      <p className="max-w-md text-sm text-app-label-secondary leading-relaxed mb-8">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-xl bg-app-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-95"
        >
          <Home className="h-4 w-4" />
          <span>العودة للوحة التحكم الرئيسية</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-app-separator bg-app-bg-primary px-4 py-2.5 text-xs font-bold text-app-label-primary shadow-sm transition-all duration-150 hover:bg-app-fill-f1 active:scale-95"
        >
          <ArrowRight className="h-4 w-4" />
          <span>الرجوع للصفحة السابقة</span>
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
