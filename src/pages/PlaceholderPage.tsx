import type { ReactNode } from "react";
import { cn } from "../lib/utils/utils";
import { tokens } from "../lib/tokens";

interface PlaceholderPageProps {
  title: string;
  description: string;
  children?: ReactNode;
}

const PlaceholderPage = ({
  title,
  description,
  children,
}: PlaceholderPageProps) => {
  return (
    <div className="rounded-app-xl border border-app-separator bg-app-bg-primary p-6 shadow-sm">
      <h1
        className={cn(
          tokens.typography.webUI.largeTitleEmphasized,
          "text-app-label-primary",
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          tokens.typography.webUI.b2Regular,
          "mt-3 text-app-label-secondary",
        )}
      >
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
};

export default PlaceholderPage;
