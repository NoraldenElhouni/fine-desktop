import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  Factory,
  LayoutGrid,
  Package,
  Scissors,
  ShoppingCart,
  UserCheck,
  Users,
  Truck,
  Wallet,
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
  { id: "entities", path: "/entities", label: "الكيانات والشركاء", icon: Building2 },
  { id: "suppliers", path: "/suppliers", label: "الموردون", icon: Truck },
  { id: "import-orders", path: "/import-orders", label: "أوامر الاستيراد", icon: Package },
  { id: "treasury", path: "/treasury", label: "الخزينة وسعر الصرف", icon: Wallet },
  { id: "employees", path: "/employees", label: "الموظفون والعمالة", icon: UserCheck },
  { id: "clients", path: "/clients", label: "العملاء", icon: Users },
  { id: "external-employers", path: "/external-employers", label: "الجهات المشغلة", icon: Briefcase },
  { id: "orders", path: "/orders", label: "الطلبات", icon: ShoppingCart },
  { id: "inventory", path: "/inventory/items", label: "المخزون والقطع", icon: Boxes },
  {
    id: "manufacturing",
    path: "/manufacturing/batches",
    label: "التصنيع",
    icon: Factory,
  },
  { id: "cutter", path: "/cutter/orders", label: "التقطيع", icon: Scissors },
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
    normalizedPath.startsWith("/orders/") ||
    normalizedPath.startsWith("/entities/") ||
    normalizedPath.startsWith("/inventory/") ||
    normalizedPath.startsWith("/manufacturing/batches/") ||
    normalizedPath.startsWith("/cutter/orders/")
  ) {
    entries.push({ path: normalizedPath, label: dynamicLabel });
  }

  return entries;
};
