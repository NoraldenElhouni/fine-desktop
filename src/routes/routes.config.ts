import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Factory,
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

export interface AppNavItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface BreadcrumbEntry {
  path: string;
  label: string;
}

export const navItems: AppNavItem[] = [
  { id: "dashboard", path: "/", label: "لوحة التحكم", icon: LayoutGrid },
  { id: "clients", path: "/clients", label: "العملاء", icon: Users },
  { id: "orders", path: "/orders", label: "الطلبات", icon: ShoppingCart },
  { id: "inventory", path: "/inventory", label: "المخزون", icon: Boxes },
  {
    id: "manufacturing",
    path: "/manufacturing",
    label: "التصنيع",
    icon: Factory,
  },
  { id: "sales", path: "/sales", label: "المبيعات", icon: Package },
  { id: "reports", path: "/reports", label: "التقارير", icon: BarChart3 },
];

export const getBreadcrumbEntries = (
  pathname: string,
  dynamicLabel = "…",
): BreadcrumbEntry[] => {
  const normalizedPath =
    pathname === "/" ? "/" : pathname.replace(/\/+$/, "") || "/";
  const entries: BreadcrumbEntry[] = [{ path: "/", label: "لوحة التحكم" }];

  if (normalizedPath === "/") {
    return entries;
  }

  const matchingItem = navItems.find((item) => {
    if (item.path === "/") {
      return false;
    }

    return (
      normalizedPath === item.path || normalizedPath.startsWith(`${item.path}/`)
    );
  });

  if (matchingItem) {
    entries.push({ path: matchingItem.path, label: matchingItem.label });
  }

  if (
    normalizedPath.startsWith("/clients/") ||
    normalizedPath.startsWith("/orders/")
  ) {
    entries.push({ path: normalizedPath, label: dynamicLabel });
  }

  return entries;
};
