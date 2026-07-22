import React from "react";
import { LoginForm } from "../../components/forms/auth/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-100 p-4 select-none">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Fine Desktop
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sign in to access your workstation
          </p>
        </div>

        <LoginForm />

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
