import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div>
        <div className="relative">
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            className={`w-full pl-9 pr-9 py-2 bg-zinc-950 border ${
              error
                ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            } rounded-lg text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors disabled:opacity-50 ${className ?? ""}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 focus:outline-none"
            tabIndex={-1}
          >
            {visible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-[11px] text-red-400 mt-1 font-normal">{error}</p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
