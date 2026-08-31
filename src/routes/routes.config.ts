import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  BookOpenText,
  Boxes,
  Briefcase,
  Building,
  Building2,
  CalendarCheck2,
  CalendarOff,
  Droplets,
  Factory,
  LayoutGrid,
  ListTree,
  Package,
  Scale,
  Scissors,
  ShieldCheck,
  ShoppingCart,
  Store,
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
  { id: "admin-entities", path: "/admin/entities", label: "إدارة الكيانات (مشرف)", icon: Building2 },
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
  { id: "furniture", path: "/furniture/orders", label: "الأثاث", icon: Armchair },
  { id: "sales", path: "/sales/orders", label: "المبيعات", icon: ShoppingCart },
  { id: "pos", path: "/sales/pos", label: "نقطة البيع", icon: Store },
  { id: "restock", path: "/sales/restock", label: "التزويد الداخلي", icon: Truck },
  { id: "attendance", path: "/hr/attendance", label: "الحضور والانصراف", icon: CalendarCheck2 },
  { id: "labor-rates", path: "/hr/rates", label: "أجور الأدوار", icon: BadgeDollarSign },
  { id: "payroll", path: "/hr/payroll", label: "مسير الرواتب", icon: Banknote },
  { id: "leave", path: "/hr/leave", label: "طلبات الإجازة", icon: CalendarOff },
  { id: "journal", path: "/accounting/journal", label: "دفتر اليومية", icon: BookOpenText },
  { id: "accounts", path: "/accounting/accounts", label: "شجرة الحسابات", icon: ListTree },
  { id: "trial-balance", path: "/accounting/trial-balance", label: "ميزان المراجعة", icon: Scale },
  { id: "overhead", path: "/accounting/overhead", label: "المصاريف العمومية", icon: Droplets },
  { id: "fixed-assets", path: "/accounting/assets", label: "الأصول الثابتة", icon: Building },
  { id: "reports", path: "/reports", label: "التقارير المالية", icon: BarChart3 },
  { id: "users", path: "/users", label: "المستخدمون والصلاحيات", icon: ShieldCheck },
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

  if (normalizedPath.startsWith("/hub/")) {
    const categoryId = normalizedPath.split("/")[2];
    const categoryLabels: Record<string, string> = {
      partners: "الكيانات والشركاء",
      procurement: "التوريد والاعتمادات",
      production: "الإنتاج والمخازن",
      sales: "المبيعات والمعارض",
      hr: "الموارد البشرية",
      finance: "المالية والتقارير",
      admin: "إدارة النظام",
    };
    if (categoryId && categoryLabels[categoryId]) {
      entries.push({ path: normalizedPath, label: categoryLabels[categoryId] });
      return entries;
    }
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
    normalizedPath.startsWith("/admin/entities/") ||
    normalizedPath.startsWith("/inventory/") ||
    normalizedPath.startsWith("/manufacturing/batches/") ||
    normalizedPath.startsWith("/cutter/orders/") ||
    normalizedPath.startsWith("/furniture/orders/") ||
    normalizedPath.startsWith("/sales/orders/")
  ) {
    entries.push({ path: normalizedPath, label: dynamicLabel });
  }

  return entries;
};
