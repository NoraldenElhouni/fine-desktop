import type { LucideIcon } from "lucide-react";

/** A single item rendered in the sidebar navigation. */
export interface NavItem {
  /** Stable, unique identifier — also used as the React key. */
  id: string;
  /** Absolute route path. Must match a <Route path> in the router. */
  path: string;
  /** Icon rendered before the label. */
  icon: LucideIcon;
}

/**
 * Describes how one route segment should appear inside the breadcrumb trail.
 * `path` is matched with react-router's `matchPath`, so it supports the same
 * `:param` syntax used in <Route path>.
 */
export interface BreadcrumbRoute {
  path: string;
  /** Marks this segment as representing a dynamic resource (e.g. a record id). */
  dynamic?: boolean;
}

export interface BreadcrumbEntry {
  path: string;
  label: string;
}
