import type { LucideIcon } from "lucide-react";
import { REFERENCE_LOOKUPS, WAREHOUSE_LOOKUPS } from "../config/referenceLookups";
import {
  BadgeDollarSign,
  Banknote,
  BarChart3,
  BookOpenText,
  Boxes,
  Building,
  Building2,
  CalendarCheck2,
  CalendarOff,
  Database,
  Warehouse,
  Droplets,
  Factory,
  Layers,
  LayoutGrid,
  ListTree,
  Package,
  Package2,
  PackageCheck,
  Scale,
  Scissors,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tags,
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

export const ALL_MANAGER_ROLES = [
  "owner",
  "admin",
  "accounting-manager",
  "treasury-officer",
  "procurement-manager",
  "hr-manager",
  "inventory-manager",
  "foam-manager",
  "cutter-manager",
  "furniture-manager",
  "store-manager",
  "unit_manager",
  "manager",
];

export const SETTINGS_ROLES = [
  "owner",
  "admin",
  "furniture-manager",
  "assembler",
  "unit_manager",
  "manager",
];

export const navItems: AppNavItem[] = [
  { id: "dashboard", path: "/", label: "لوحة التحكم", icon: LayoutGrid },
  { id: "admin-entities", path: "/admin/entities", label: "إدارة الكيانات (مشرف)", icon: Building2, allowedRoles: ["owner", "admin"] },
  { id: "admin-units", path: "/admin/units", label: "إدارة الوحدات التشغيلية", icon: Building, allowedRoles: ["owner", "admin"] },
  { id: "admin-blueprints", path: "/admin/blueprints", label: "قوالب الوحدات", icon: Layers, allowedRoles: ["owner", "admin"] },
  { id: "suppliers", path: "/suppliers", label: "الموردون", icon: Truck, allowedRoles: ALL_MANAGER_ROLES },
  { id: "import-orders", path: "/import-orders", label: "أوامر الاستيراد", icon: Package, allowedRoles: ALL_MANAGER_ROLES },
  { id: "treasury", path: "/treasury", label: "الخزينة وسعر الصرف", icon: Wallet, allowedRoles: ALL_MANAGER_ROLES },
  { id: "employees", path: "/employees", label: "الموظفون والعمالة", icon: UserCheck, allowedRoles: ["owner", "admin", "hr-manager", "accounting-manager", "unit_manager", "manager", "foam-manager", "cutter-manager", "furniture-manager", "store-manager", "procurement-manager"] },
  { id: "clients", path: "/clients", label: "العملاء", icon: Users, allowedRoles: ["owner", "admin", "store-manager", "pos-cashier", "accounting-manager", "unit_manager", "manager"] },
  { id: "orders", path: "/orders", label: "الطلبات", icon: ShoppingCart, allowedRoles: ["owner", "admin", "furniture-manager", "store-manager", "unit_manager", "manager"] },
  { id: "inventory", path: "/inventory/ledger", label: "المخزون والقطع", icon: Boxes, allowedRoles: ["owner", "admin", "inventory-manager", "foam-manager", "foam-operator", "cutter-manager", "cutter-operator", "furniture-manager", "assembler", "store-manager", "unit_manager", "manager"] },
  {
    id: "manufacturing",
    path: "/manufacturing/batches",
    label: "التصنيع",
    icon: Factory,
    allowedRoles: ["owner", "admin", "foam-manager", "foam-operator", "unit_manager", "manager"],
  },
  { id: "cutter", path: "/cutter/orders", label: "التقطيع", icon: Scissors, allowedRoles: ["owner", "admin", "cutter-manager", "cutter-operator", "unit_manager", "manager"] },
  { id: "material-requests", path: "/material-requests", label: "طلبات المواد (MRs)", icon: PackageCheck, allowedRoles: ["owner", "admin", "furniture-manager", "cutter-manager", "foam-manager", "unit_manager", "manager"] },
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
  { id: "reports-bundles", path: "/reports/bundles", label: "تقرير مبيعات الحزم", icon: Package2, allowedRoles: ["owner", "admin", "store-manager", "pos-cashier", "unit_manager", "manager"] },
  { id: "users", path: "/users", label: "المستخدمون والصلاحيات", icon: ShieldCheck, allowedRoles: ["owner", "admin"] },
  { id: "settings-company", path: "/settings/company", label: "إعدادات الشركة", icon: Building2, allowedRoles: ["owner", "admin"] },
  { id: "settings-products", path: "/settings/products", label: "إعدادات المنتجات", icon: Tags, allowedRoles: SETTINGS_ROLES },
  { id: "settings-data", path: "/settings/data", label: "إعدادات البيانات", icon: Database, allowedRoles: ["owner", "admin"] },
  { id: "settings-warehouses", path: "/settings/warehouses", label: "إعدادات المخازن", icon: Warehouse, allowedRoles: SETTINGS_ROLES },
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
      settings: "الإعدادات",
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
    normalizedPath.startsWith("/sales/orders/") ||
    normalizedPath.startsWith("/accounting/accounts/")
  ) {
    entries.push({ path: normalizedPath, label: dynamicLabel });
  }

  if (normalizedPath.startsWith("/settings/")) {
    entries.push({ path: "/settings", label: "الإعدادات" });

    const settingsSections: Record<string, { label: string; pages: Record<string, string> }> = {
      company: {
        label: "إعدادات الشركة",
        pages: {
          profile: "بيانات الشركة",
          roles: "الأدوار والصلاحيات",
          units: "الوحدات التشغيلية",
        },
      },
      products: {
        label: "إعدادات المنتجات",
        pages: {
          items: "الأصناف",
          categories: "الفئات والخصائص",
          bundles: "الحزم",
        },
      },
      data: {
        label: "إعدادات البيانات",
        pages: Object.fromEntries(
          REFERENCE_LOOKUPS.map((lookup) => [lookup.path, lookup.title]),
        ),
      },
      warehouses: {
        label: "إعدادات المخازن",
        pages: Object.fromEntries(
          WAREHOUSE_LOOKUPS.map((lookup) => [lookup.path, lookup.title]),
        ),
      },
    };

    const [, , sectionId, pageId] = normalizedPath.split("/");
    const section = sectionId ? settingsSections[sectionId] : undefined;

    if (section) {
      entries.push({ path: `/settings/${sectionId}`, label: section.label });
      const pageLabel = pageId ? section.pages[pageId] : undefined;
      if (pageLabel) {
        entries.push({ path: `/settings/${sectionId}/${pageId}`, label: pageLabel });
      }
    }
  }

  return entries;
};
