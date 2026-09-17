import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Factory,
  Package,
  ShieldCheck,
  Store,
  UserCheck,
} from "lucide-react";
import { navItems, AppNavItem } from "./routes.config";

export interface CategoryGroup {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  path: string;
  itemIds: string[];
  items: AppNavItem[];
}

const findItems = (ids: string[]): AppNavItem[] => {
  return ids
    .map((id) => navItems.find((item) => item.id === id))
    .filter((item): item is AppNavItem => Boolean(item));
};

export const categoryGroups: CategoryGroup[] = [
  {
    id: "partners",
    label: "الكيانات والشركاء",
    description: "إدارة الكيانات المستقلة والعملاء والموردين والجهات المشغلة والعمالة",
    icon: Building2,
    path: "/hub/partners",
    itemIds: ["suppliers", "clients", "external-employers", "employees"],
    get items() {
      return findItems(this.itemIds);
    },
  },
  {
    id: "procurement",
    label: "التوريد والاعتمادات",
    description: "تتبع أوامر الاستيراد الخارجي، وحجوزات المصارف، وأسعار الصرف وتكاليف التوريد",
    icon: Package,
    path: "/hub/procurement",
    itemIds: ["import-orders", "treasury"],
    get items() {
      return findItems(this.itemIds);
    },
  },
  {
    id: "production",
    label: "الإنتاج والمخازن",
    description: "سجل قطع المخزون، أوامر التقطيع والتصنيع، وخلطات الفوم، وإدارة قطع الأثاث",
    icon: Factory,
    path: "/hub/production",
    itemIds: ["inventory", "orders", "manufacturing", "cutter", "furniture"],
    get items() {
      return findItems(this.itemIds);
    },
  },
  {
    id: "sales",
    label: "المبيعات والمعارض",
    description: "إدارة طلبات المبيعات، ومنافذ البيع المباشر (POS)، ونظام التزويد الداخلي للمعارض",
    icon: Store,
    path: "/hub/sales",
    itemIds: ["sales", "pos", "restock"],
    get items() {
      return findItems(this.itemIds);
    },
  },
  {
    id: "hr",
    label: "الموارد البشرية",
    description: "سجلات الحضور والانصراف، وأجور الأدوار التشغيلية، ومسير الرواتب وطلبات الإجازة",
    icon: UserCheck,
    path: "/hub/hr",
    itemIds: ["attendance", "labor-rates", "payroll", "leave"],
    get items() {
      return findItems(this.itemIds);
    },
  },
  {
    id: "finance",
    label: "المالية والتقارير",
    description: "سجل اليومية العامة، شجرة الحسابات، ميزان المراجعة، المصاريف العمومية، والأصول والتقارير",
    icon: BarChart3,
    path: "/hub/finance",
    itemIds: ["journal", "accounts", "trial-balance", "overhead", "fixed-assets", "reports"],
    get items() {
      return findItems(this.itemIds);
    },
  },
  {
    id: "admin",
    label: "إدارة النظام",
    description: "إدارة حسابات المستخدمين وصلاحيات الأدوار وسجلات الأمان في النظام",
    icon: ShieldCheck,
    path: "/hub/admin",
    itemIds: ["users", "admin-entities", "admin-units", "admin-blueprints"],
    get items() {
      return findItems(this.itemIds);
    },
  },
];
