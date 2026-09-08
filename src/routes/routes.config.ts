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
  allowedRoles?: string[];
}

export interface BreadcrumbEntry {
  path: string;
  label: string;
}

export const navItems: AppNavItem[] = [
  { id: "dashboard", path: "/", label: "لوحة التحكم", icon: LayoutGrid },
  { id: "admin-entities", path: "/admin/entities", label: "إدارة الكيانات (مشرف)", icon: Building2, allowedRoles: ["owner", "admin"] },
  { id: "suppliers", path: "/suppliers", label: "الموردون", icon: Truck, allowedRoles: ["owner", "admin", "procurement-manager", "treasury-officer", "accounting-manager", "unit_manager", "manager"] },
  { id: "import-orders", path: "/import-orders", label: "أوامر الاستيراد", icon: Package, allowedRoles: ["owner", "admin", "procurement-manager", "treasury-officer", "accounting-manager", "unit_manager", "manager"] },
  { id: "treasury", path: "/treasury", label: "الخزينة وسعر الصرف", icon: Wallet, allowedRoles: ["owner", "admin", "treasury-officer", "accounting-manager", "procurement-manager", "unit_manager", "manager"] },
  { id: "employees", path: "/employees", label: "الموظفون والعمالة", icon: UserCheck, allowedRoles: ["owner", "admin", "hr-manager", "accounting-manager", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"] },
  { id: "clients", path: "/clients", label: "العملاء", icon: Users, allowedRoles: ["owner", "admin", "store-manager", "pos-cashier", "accounting-manager", "unit_manager", "manager"] },
  { id: "external-employers", path: "/external-employers", label: "الجهات المشغلة", icon: Briefcase, allowedRoles: ["owner", "admin", "hr-manager", "accounting-manager"] },
  { id: "orders", path: "/orders", label: "الطلبات", icon: ShoppingCart, allowedRoles: ["owner", "admin", "furniture-manager", "store-manager", "unit_manager", "manager"] },
  { id: "inventory", path: "/inventory/items", label: "المخزون والقطع", icon: Boxes, allowedRoles: ["owner", "admin", "inventory-manager", "foam-manager", "foam-operator", "cutter-manager", "cutter-operator", "furniture-manager", "assembler", "store-manager", "unit_manager", "manager"] },
  {
    id: "manufacturing",
    path: "/manufacturing/batches",
    label: "التصنيع",
    icon: Factory,
    allowedRoles: ["owner", "admin", "foam-manager", "foam-operator", "unit_manager", "manager"],
  },
  { id: "cutter", path: "/cutter/orders", label: "التقطيع", icon: Scissors, allowedRoles: ["owner", "admin", "cutter-manager", "cutter-operator", "unit_manager", "manager"] },
  { id: "furniture", path: "/furniture/orders", label: "الأثاث", icon: Armchair, allowedRoles: ["owner", "admin", "furniture-manager", "assembler", "unit_manager", "manager"] },
  { id: "sales", path: "/sales/orders", label: "المبيعات", icon: ShoppingCart, allowedRoles: ["owner", "admin", "store-manager", "pos-cashier", "unit_manager", "manager"] },
  { id: "pos", path: "/sales/pos", label: "نقطة البيع", icon: Store, allowedRoles: ["owner", "admin", "store-manager", "pos-cashier", "unit_manager", "manager"] },
  { id: "restock", path: "/sales/restock", label: "التزويد الداخلي", icon: Truck, allowedRoles: ["owner", "admin", "store-manager", "pos-cashier", "unit_manager", "manager"] },
  { id: "attendance", path: "/hr/attendance", label: "الحضور والانصراف", icon: CalendarCheck2, allowedRoles: ["owner", "admin", "hr-manager", "accounting-manager", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"] },
  { id: "labor-rates", path: "/hr/rates", label: "أجور الأدوار", icon: BadgeDollarSign, allowedRoles: ["owner", "admin", "hr-manager", "accounting-manager"] },
  { id: "payroll", path: "/hr/payroll", label: "مسير الرواتب", icon: Banknote, allowedRoles: ["owner", "admin", "hr-manager", "accounting-manager"] },
  { id: "leave", path: "/hr/leave", label: "طلبات الإجازة", icon: CalendarOff, allowedRoles: ["owner", "admin", "hr-manager", "accounting-manager", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"] },
  { id: "journal", path: "/accounting/journal", label: "دفتر اليومية", icon: BookOpenText, allowedRoles: ["owner", "admin", "accounting-manager"] },
  { id: "accounts", path: "/accounting/accounts", label: "شجرة الحسابات", icon: ListTree, allowedRoles: ["owner", "admin", "accounting-manager"] },
  { id: "trial-balance", path: "/accounting/trial-balance", label: "ميزان المراجعة", icon: Scale, allowedRoles: ["owner", "admin", "accounting-manager"] },
  { id: "overhead", path: "/accounting/overhead", label: "المصاريف العمومية", icon: Droplets, allowedRoles: ["owner", "admin", "accounting-manager"] },
  { id: "fixed-assets", path: "/accounting/assets", label: "الأصول الثابتة", icon: Building, allowedRoles: ["owner", "admin", "accounting-manager"] },
  { id: "reports", path: "/reports", label: "التقارير المالية", icon: BarChart3, allowedRoles: ["owner", "admin", "accounting-manager", "treasury-officer", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"] },
  { id: "users", path: "/users", label: "المستخدمون والصلاحيات", icon: ShieldCheck, allowedRoles: ["owner", "admin"] },
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

  if (normalizedPath.startsWith("/settings/")) {
    entries.push({ path: normalizedPath, label: "الإعدادات" });
  }

  return entries;
};
