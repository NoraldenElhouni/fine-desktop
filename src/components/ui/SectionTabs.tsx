import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export interface SectionTab {
  path: string;
  label: string;
}

/**
 * Horizontal pill nav linking the pages of one sidebar section, for pages
 * that would otherwise be reachable only by typing the URL. Mount it as a
 * layout route: the active page renders through the Outlet.
 */
export const SectionTabsLayout: React.FC<{ tabs: SectionTab[] }> = ({ tabs }) => (
  <div>
    <nav className="flex flex-wrap items-center gap-2 border-b border-app-separator bg-app-bg-primary px-6 py-3">
      {tabs.map((t) => (
        <NavLink
          key={t.path}
          to={t.path}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isActive
                ? "bg-app-accent text-white"
                : "bg-app-fill-f1 text-app-label-secondary hover:bg-app-fill-f2"
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
    <Outlet />
  </div>
);
