import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { useLoginMutation } from "../../../hooks/useAuthQuery";
import { LoginCredentials, loginSchema } from "../../../types/auth/schemas";
import { PasswordInput } from "../../ui/PasswordInput";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginCredentials) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate(from, { replace: true }),
    });
  };

  const errorMessage =
    loginMutation.error?.response?.data?.message ||
    (loginMutation.isError ? "تعذّر الاتصال بالخادم." : null);

  return (
    <>
      {errorMessage && (
        <div className="mb-4 p-3 rounded-app-md bg-app-status-danger/10 border border-app-status-danger/30 text-app-status-danger text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium mb-1.5 text-app-label-primary"
          >
            البريد الإلكتروني
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-app-label-tertiary">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="operator@company.com"
              autoComplete="email"
              disabled={loginMutation.isPending}
              dir="ltr"
              {...register("email")}
              className={`w-full pl-9 pr-3 py-2 border text-left bg-app-bg-primary text-app-label-primary ${
                errors.email
                  ? "border-app-status-danger/80 focus:border-app-status-danger focus:ring-1 focus:ring-app-status-danger"
                  : "border-app-separator focus:border-app-accent focus:ring-1 focus:ring-app-accent"
              } rounded-lg text-xs placeholder-app-label-tertiary outline-none transition-colors disabled:opacity-50`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-app-status-danger mt-1 font-normal">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium mb-1.5 text-app-label-primary"
          >
            كلمة المرور
          </label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loginMutation.isPending}
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-2 px-4 bg-app-accent hover:bg-app-accent-hover active:bg-app-accent-hover text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جارٍ تسجيل الدخول...</span>
            </>
          ) : (
            <span>تسجيل الدخول</span>
          )}
        </button>
      </form>
    </>
  );
};
