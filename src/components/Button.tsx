import { tokens } from "../lib/tokens";
import { cn } from "../lib/utils/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger";
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        tokens.typography.webUI.b2Emphasized,
        "rounded-app-md px-4 py-2 transition-colors",
        variant === "primary" &&
          "bg-app-status-info text-white hover:opacity-90",
        variant === "danger" &&
          "bg-app-status-danger text-white hover:opacity-90",
        "disabled:bg-app-label-quaternary disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}
