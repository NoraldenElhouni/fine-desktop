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
            className={`w-full ps-9 pe-9 py-2 border text-end bg-app-bg-primary text-app-label-primary ${
              error
                ? "border-app-status-danger/80 focus:border-app-status-danger focus:ring-1 focus:ring-app-status-danger"
                : "border-app-separator focus:border-app-accent focus:ring-1 focus:ring-app-accent"
            } rounded-lg text-xs placeholder-app-label-tertiary outline-none transition-colors disabled:opacity-50 ${className ?? ""}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 end-0 pe-3 flex items-center text-app-label-tertiary hover:text-app-label-secondary focus:outline-none"
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
          <p className="text-[11px] text-app-status-danger mt-1 font-normal">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
