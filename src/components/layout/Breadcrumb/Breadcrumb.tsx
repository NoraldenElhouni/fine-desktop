import { ChevronLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { BreadcrumbEntry } from "../../../routes/routes.config";

interface BreadcrumbProps {
  items: BreadcrumbEntry[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-2" aria-label="التنقل">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={`${item.path}-${index}`}
            className="flex items-center gap-2"
          >
            {index === 0 ? (
              <>
                <Link
                  to={item.path}
                  className="flex h-11 w-11 items-center justify-center rounded-app-xl bg-app-accent-tint text-app-accent transition-colors hover:bg-app-accent-subtle"
                  aria-label={item.label}
                >
                  <Home className="h-4 w-4" />
                </Link>
                <span className="h-6 w-px bg-app-separator" />
              </>
            ) : (
              <span className="flex h-9 items-center rounded-app-lg bg-app-bg-secondary px-3 text-app-label-secondary">
                {item.label}
              </span>
            )}

            {index > 0 && !isLast ? (
              <ChevronLeft className="h-4 w-4 text-app-label-tertiary [dir='rtl']:rotate-180" />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
