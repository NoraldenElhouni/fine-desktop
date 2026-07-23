import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useChangePasswordMutation } from "../../../hooks/useAuthQuery";
import {
  ChangePasswordCredentials,
  changePasswordSchema,
} from "../../../types/auth/schemas";
import { PasswordInput } from "../../ui/PasswordInput";

export const ChangePasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordCredentials>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = (data: ChangePasswordCredentials) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        navigate("/", { replace: true });
      },
    });
  };

  const errorMessage =
    changePasswordMutation.error?.response?.data?.message ||
    (changePasswordMutation.isError
      ? "تعذّر تغيير كلمة المرور. يرجى التحقق من البيانات والمحاولة مجدداً."
      : null);

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
            htmlFor="current_password"
            className="block text-xs font-medium mb-1.5 text-app-label-primary"
          >
            كلمة المرور الحالية
          </label>
          <PasswordInput
            id="current_password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={changePasswordMutation.isPending}
            error={errors.current_password?.message}
            {...register("current_password")}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium mb-1.5 text-app-label-primary"
          >
            كلمة المرور الجديدة
          </label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={changePasswordMutation.isPending}
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div>
          <label
            htmlFor="password_confirmation"
            className="block text-xs font-medium mb-1.5 text-app-label-primary"
          >
            تأكيد كلمة المرور الجديدة
          </label>
          <PasswordInput
            id="password_confirmation"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={changePasswordMutation.isPending}
            error={errors.password_confirmation?.message}
            {...register("password_confirmation")}
          />
        </div>

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="w-full py-2 px-4 bg-app-accent hover:bg-app-accent-hover active:bg-app-accent-hover text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {changePasswordMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جارٍ حفظ كلمة المرور...</span>
            </>
          ) : (
            <span>تحديث كلمة المرور</span>
          )}
        </button>
      </form>
    </>
  );
};
