import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { loginSchema, LoginCredentials } from "../../api/auth";
import { useLoginMutation } from "../../hooks/useAuthQuery";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
    });
  };

  const errorMessage =
    loginMutation.error?.response?.data?.message ||
    (loginMutation.isError ? "Unable to connect to backend server." : null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-100 p-4 select-none">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Fine Desktop
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sign in to access your workstation
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="operator@company.com"
                autoComplete="email"
                disabled={loginMutation.isPending}
                {...register("email")}
                className={`w-full pl-9 pr-3 py-2 bg-zinc-950 border ${
                  errors.email
                    ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                } rounded-lg text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors disabled:opacity-50`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-400 mt-1 font-normal">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
                {...register("password")}
                className={`w-full pl-9 pr-9 py-2 bg-zinc-950 border ${
                  errors.password
                    ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                } rounded-lg text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-400 mt-1 font-normal">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-2 px-4 bg-zinc-100 hover:bg-white active:bg-zinc-200 text-zinc-950 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-zinc-800/60 text-center">
          <p className="text-[11px] text-zinc-500">
            Fine Desktop Client • Enterprise ERP
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

