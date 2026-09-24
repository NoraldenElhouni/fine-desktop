import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Coins,
  Flag,
  Landmark,
  Layers,
  MapPin,
  MapPinned,
  Minus,
  Plus,
  Receipt,
  Ruler,
  UsersRound,
  Warehouse,
} from "lucide-react";

/**
 * TEMPORARY registry of the simple reference lists ("البيانات المرجعية") shown
 * under Settings. They all share one shape — name, code, status, notes plus a
 * couple of list-specific fields — so one generic page renders every one of
 * them, seeded with dummy rows until the backend exposes them.
 *
 * To wire a list to the API later: keep the config, and swap the store reads in
 * `ReferenceLookupPage` for a TanStack Query hook over `src/api/endpoints/`.
 */

export type LookupFieldType = "text" | "number" | "select";

export interface LookupFieldOption {
  value: string;
  label: string;
}

export interface LookupFieldVariant {
  label?: string;
  placeholder?: string;
  hint?: string;
  suffix?: string;
}

export interface LookupFieldConfig {
  key: string;
  label: string;
  type: LookupFieldType;
  options?: LookupFieldOption[];
  placeholder?: string;
  hint?: string;
  /** Renders the value as an accent chip in the table (used for select fields). */
  chip?: boolean;
  mono?: boolean;
  suffix?: string;
  /** Label/suffix follow the current value of another field on the same row. */
  variants?: {
    field: string;
    byValue: Record<string, LookupFieldVariant>;
  };
}

export interface LookupEntry {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  notes?: string;
  fields: Record<string, string>;
}

export interface LookupConfig {
  key: string;
  /** Route segment under its settings section. */
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Label for the row being added/edited, e.g. "وحدة قياس". */
  singular: string;
  nameLabel: string;
  namePlaceholder: string;
  codeLabel: string;
  codePlaceholder: string;
  searchPlaceholder: string;
  fields: LookupFieldConfig[];
  seed: LookupEntry[];
}

const row = (
  id: string,
  name: string,
  code: string,
  fields: Record<string, string> = {},
  extra: { isActive?: boolean; notes?: string } = {},
): LookupEntry => ({
  id,
  name,
  code,
  fields,
  isActive: extra.isActive ?? true,
  notes: extra.notes,
});

const CALCULATION_OPTIONS: LookupFieldOption[] = [
  { value: "fixed", label: "مبلغ ثابت" },
  { value: "percentage", label: "نسبة من الراتب الأساسي" },
];

/** Reads as an amount or a percentage depending on the calculation method. */
const VALUE_FIELD: Omit<LookupFieldConfig, "key"> = {
  label: "القيمة الافتراضية",
  type: "number",
  mono: true,
  placeholder: "0",
  variants: {
    field: "calculation",
    byValue: {
      fixed: { label: "المبلغ الافتراضي", suffix: " د.ل" },
      percentage: { label: "النسبة الافتراضية", suffix: "%" },
    },
  },
};

export const MEASUREMENT_UNITS_LOOKUP: LookupConfig = {
  key: "measurement-units",
  path: "measurements",
  title: "وحدات القياس",
  description:
    "وحدات الوزن والطول والحجم والعدد المستخدمة في الأصناف وأوامر التصنيع والفواتير.",
  icon: Ruler,
  singular: "وحدة قياس",
  nameLabel: "اسم الوحدة",
  namePlaceholder: "مثال: كيلوغرام",
  codeLabel: "الرمز",
  codePlaceholder: "مثال: KG",
  searchPlaceholder: "بحث باسم الوحدة أو الرمز...",
  fields: [
    { key: "symbol", label: "الاختصار المعروض", type: "text", placeholder: "مثال: كجم" },
    {
      key: "dimension",
      label: "نوع القياس",
      type: "select",
      chip: true,
      options: [
        { value: "weight", label: "وزن" },
        { value: "length", label: "طول" },
        { value: "area", label: "مساحة" },
        { value: "volume", label: "حجم" },
        { value: "count", label: "عدد" },
        { value: "time", label: "زمن" },
      ],
    },
  ],
  seed: [
    row("uom-kg", "كيلوغرام", "KG", { symbol: "كجم", dimension: "weight" }, { notes: "وزن المواد الكيميائية والخامات" }),
    row("uom-g", "غرام", "G", { symbol: "غم", dimension: "weight" }),
    row("uom-ton", "طن", "TON", { symbol: "طن", dimension: "weight" }, { notes: "تستخدم في أوامر الاستيراد" }),
    row("uom-m", "متر", "M", { symbol: "م", dimension: "length" }),
    row("uom-cm", "سنتيمتر", "CM", { symbol: "سم", dimension: "length" }, { notes: "أبعاد القص والشرائح" }),
    row("uom-m2", "متر مربع", "M2", { symbol: "م²", dimension: "area" }),
    row("uom-m3", "متر مكعب", "M3", { symbol: "م³", dimension: "volume" }, { notes: "حجم قوالب الإسفنج" }),
    row("uom-l", "لتر", "L", { symbol: "ل", dimension: "volume" }),
    row("uom-pcs", "قطعة", "PCS", { symbol: "قطعة", dimension: "count" }),
    row("uom-blk", "قالب", "BLK", { symbol: "قالب", dimension: "count" }, { notes: "قالب إسفنج كامل قبل التقطيع" }),
    row("uom-plt", "منصة نقالة", "PLT", { symbol: "منصة", dimension: "count" }),
    row("uom-drm", "برميل", "DRM", { symbol: "برميل", dimension: "count" }, { isActive: false, notes: "موقوفة لحين توحيد أحجام البراميل" }),
    row("uom-hr", "ساعة عمل", "HR", { symbol: "س", dimension: "time" }),
  ],
};

export const CURRENCIES_LOOKUP: LookupConfig = {
  key: "currencies",
  path: "currencies",
  title: "العملات",
  description:
    "العملات المعتمدة في التسعير والفواتير والقيود. تُدار أسعار الصرف من شاشة الخزينة وسعر الصرف.",
  icon: Coins,
  singular: "عملة",
  nameLabel: "اسم العملة",
  namePlaceholder: "مثال: الدينار الليبي",
  codeLabel: "رمز العملة (ISO)",
  codePlaceholder: "مثال: LYD",
  searchPlaceholder: "بحث باسم العملة أو رمزها...",
  fields: [
    { key: "symbol", label: "الرمز المختصر", type: "text", placeholder: "مثال: د.ل" },
  ],
  seed: [
    row("cur-lyd", "الدينار الليبي", "LYD", { symbol: "د.ل" }, { notes: "العملة الأساسية للقيود المحاسبية" }),
    row("cur-usd", "الدولار الأمريكي", "USD", { symbol: "$" }, { notes: "أوامر الاستيراد والاعتمادات" }),
    row("cur-eur", "اليورو", "EUR", { symbol: "€" }, { notes: "توريدات الآلات والمواد الأوروبية" }),
  ],
};

export const BANKS_LOOKUP: LookupConfig = {
  key: "banks",
  path: "banks",
  title: "المصارف",
  description:
    "المصارف المتعامل معها في الحوالات والاعتمادات المستندية وحسابات الخزينة.",
  icon: Landmark,
  singular: "مصرف",
  nameLabel: "اسم المصرف",
  namePlaceholder: "مثال: مصرف الجمهورية",
  codeLabel: "رمز المصرف",
  codePlaceholder: "مثال: JUM",
  searchPlaceholder: "بحث باسم المصرف أو الفرع...",
  fields: [
    { key: "branch", label: "الفرع", type: "text", placeholder: "مثال: فرع طبرق" },
  ],
  seed: [
    row("bank-jum", "مصرف الجمهورية", "JUM", { branch: "فرع طبرق" }, { notes: "الحساب التشغيلي الرئيسي" }),
    row("bank-wah", "مصرف الوحدة", "WAH", { branch: "فرع طبرق المركزي" }),
    row("bank-ncb", "المصرف التجاري الوطني", "NCB", { branch: "فرع بنغازي" }),
    row("bank-bcd", "مصرف التجارة والتنمية", "BCD", { branch: "فرع طرابلس" }, { notes: "يستخدم لفتح الاعتمادات المستندية" }),
    row("bank-sah", "مصرف الصحاري", "SAH", { branch: "فرع درنة" }, { isActive: false }),
  ],
};

export const NATIONALITIES_LOOKUP: LookupConfig = {
  key: "nationalities",
  path: "nationalities",
  title: "الجنسيات والدول",
  description: "الجنسيات والدول المستخدمة في ملفات الموظفين والعمالة الخارجية وبيانات الموردين.",
  icon: Flag,
  singular: "جنسية",
  nameLabel: "الجنسية",
  namePlaceholder: "مثال: ليبية",
  codeLabel: "رمز الدولة",
  codePlaceholder: "مثال: LY",
  searchPlaceholder: "بحث بالجنسية أو رمز الدولة...",
  fields: [
    { key: "country", label: "الدولة", type: "text", placeholder: "مثال: ليبيا" },
  ],
  seed: [
    row("nat-ly", "ليبية", "LY", { country: "ليبيا" }),
    row("nat-eg", "مصرية", "EG", { country: "مصر" }),
    row("nat-tn", "تونسية", "TN", { country: "تونس" }),
    row("nat-sd", "سودانية", "SD", { country: "السودان" }),
    row("nat-bd", "بنغلاديشية", "BD", { country: "بنغلاديش" }, { notes: "عمالة متعاقدة عبر وكالات توظيف" }),
    row("nat-ph", "فلبينية", "PH", { country: "الفلبين" }),
    row("nat-in", "هندية", "IN", { country: "الهند" }),
    row("nat-ng", "نيجيرية", "NG", { country: "نيجيريا" }),
  ],
};

export const CITIES_LOOKUP: LookupConfig = {
  key: "cities",
  path: "cities",
  title: "المدن",
  description: "المدن المستخدمة في عناوين العملاء والموردين والفروع وخطوط التوزيع.",
  icon: MapPin,
  singular: "مدينة",
  nameLabel: "اسم المدينة",
  namePlaceholder: "مثال: طبرق",
  codeLabel: "رمز المدينة",
  codePlaceholder: "مثال: TOB",
  searchPlaceholder: "بحث باسم المدينة أو الدولة...",
  fields: [
    { key: "country", label: "الدولة", type: "text", placeholder: "مثال: ليبيا" },
  ],
  seed: [
    row("city-tob", "طبرق", "TOB", { country: "ليبيا" }, { notes: "مقر الشركة والمصنع" }),
    row("city-bng", "بنغازي", "BNG", { country: "ليبيا" }),
    row("city-tip", "طرابلس", "TIP", { country: "ليبيا" }),
    row("city-msr", "مصراتة", "MSR", { country: "ليبيا" }),
    row("city-drn", "درنة", "DRN", { country: "ليبيا" }),
    row("city-bda", "البيضاء", "BDA", { country: "ليبيا" }),
    row("city-ajd", "أجدابيا", "AJD", { country: "ليبيا" }),
    row("city-srt", "سرت", "SRT", { country: "ليبيا" }),
    row("city-sbh", "سبها", "SBH", { country: "ليبيا" }),
    row("city-zaw", "الزاوية", "ZAW", { country: "ليبيا" }),
  ],
};

export const EMPLOYEE_CATEGORIES_LOOKUP: LookupConfig = {
  key: "employee-categories",
  path: "employee-categories",
  title: "فئات الموظفين",
  description:
    "تصنيف العاملين المستخدم في الحضور وأجور الأدوار ومسير الرواتب.",
  icon: UsersRound,
  singular: "فئة موظفين",
  nameLabel: "اسم الفئة",
  namePlaceholder: "مثال: عامل إنتاج",
  codeLabel: "رمز الفئة",
  codePlaceholder: "مثال: PROD",
  searchPlaceholder: "بحث باسم الفئة أو رمزها...",
  fields: [],
  seed: [
    row("emp-cat-prod", "عامل إنتاج", "PROD", {}, { notes: "خطوط الفوم والتقطيع والتجميع" }),
    row("emp-cat-tech", "فني تشغيل وصيانة", "TECH"),
    row("emp-cat-sup", "مشرف وردية", "SUPV"),
    row("emp-cat-adm", "موظف إداري", "ADMIN"),
    row("emp-cat-acc", "محاسب", "ACC"),
    row("emp-cat-sales", "مندوب مبيعات", "SALES"),
    row("emp-cat-drv", "سائق", "DRV"),
    row("emp-cat-sec", "حارس أمن", "SEC"),
  ],
};

export const EXPENSE_TYPES_LOOKUP: LookupConfig = {
  key: "expense-types",
  path: "expenses",
  title: "بنود المصاريف",
  description:
    "بنود المصاريف المعتمدة لتبويب المصروفات العمومية وربطها بالحسابات المحاسبية.",
  icon: Receipt,
  singular: "بند مصروف",
  nameLabel: "اسم البند",
  namePlaceholder: "مثال: كهرباء وماء",
  codeLabel: "رمز البند",
  codePlaceholder: "مثال: EXP-UTIL",
  searchPlaceholder: "بحث باسم البند أو رمزه...",
  fields: [],
  seed: [
    row("exp-rent", "إيجارات", "EXP-RENT"),
    row("exp-util", "كهرباء وماء", "EXP-UTIL"),
    row("exp-fuel", "وقود وزيوت", "EXP-FUEL", {}, { notes: "مولدات المصنع وأسطول النقل" }),
    row("exp-maint", "صيانة آلات ومعدات", "EXP-MAINT"),
    row("exp-freight", "نقل وشحن", "EXP-FRGT"),
    row("exp-stat", "قرطاسية ومطبوعات", "EXP-STAT"),
    row("exp-comm", "اتصالات وإنترنت", "EXP-COMM"),
    row("exp-host", "ضيافة ونظافة", "EXP-HOST"),
  ],
};

export const FIXED_ASSET_CATEGORIES_LOOKUP: LookupConfig = {
  key: "fixed-asset-categories",
  path: "fixed-assets",
  title: "فئات الأصول الثابتة",
  description:
    "تصنيف الأصول الثابتة المستخدم في سجل الأصول وجدول الإهلاك.",
  icon: Banknote,
  singular: "فئة أصول",
  nameLabel: "اسم الفئة",
  namePlaceholder: "مثال: آلات ومعدات إنتاج",
  codeLabel: "رمز الفئة",
  codePlaceholder: "مثال: FA-MACH",
  searchPlaceholder: "بحث باسم الفئة أو رمزها...",
  fields: [],
  seed: [
    row("fa-bld", "مباني ومنشآت", "FA-BLD"),
    row("fa-mach", "آلات ومعدات إنتاج", "FA-MACH", {}, { notes: "خطوط الفوم وماكينات التقطيع" }),
    row("fa-veh", "سيارات ومركبات", "FA-VEH"),
    row("fa-furn", "أثاث ومفروشات", "FA-FURN"),
    row("fa-it", "أجهزة حاسوب وشبكات", "FA-IT"),
    row("fa-tool", "عدد وأدوات", "FA-TOOL"),
  ],
};

export const ALLOWANCE_TYPES_LOOKUP: LookupConfig = {
  key: "allowance-types",
  path: "allowances",
  title: "أنواع العلاوات",
  description: "العلاوات والبدلات المضافة إلى الراتب في مسير الرواتب.",
  icon: Plus,
  singular: "نوع علاوة",
  nameLabel: "اسم العلاوة",
  namePlaceholder: "مثال: بدل نقل",
  codeLabel: "رمز العلاوة",
  codePlaceholder: "مثال: ALW-TRN",
  searchPlaceholder: "بحث باسم العلاوة أو رمزها...",
  fields: [
    { key: "calculation", label: "طريقة الاحتساب", type: "select", chip: true, options: CALCULATION_OPTIONS },
    { key: "value", ...VALUE_FIELD },
  ],
  seed: [
    row("alw-prod", "علاوة إنتاج", "ALW-PROD", { calculation: "percentage", value: "10" }, { notes: "تُحتسب عند تجاوز المستهدف الشهري" }),
    row("alw-trn", "بدل نقل", "ALW-TRN", { calculation: "fixed", value: "150" }),
    row("alw-hou", "بدل سكن", "ALW-HOU", { calculation: "fixed", value: "300" }),
    row("alw-risk", "علاوة طبيعة عمل", "ALW-RISK", { calculation: "percentage", value: "7.5" }, { notes: "لعمال خطوط الكيماويات" }),
    row("alw-ot", "ساعات إضافية", "ALW-OT", { calculation: "fixed", value: "12" }, { notes: "القيمة عن كل ساعة إضافية" }),
    row("alw-perf", "مكافأة أداء", "ALW-PERF", { calculation: "fixed", value: "0" }),
  ],
};

export const DEDUCTION_TYPES_LOOKUP: LookupConfig = {
  key: "deduction-types",
  path: "deductions",
  title: "أنواع الخصومات",
  description: "الخصومات والاستقطاعات المطبقة على الراتب في مسير الرواتب.",
  icon: Minus,
  singular: "نوع خصم",
  nameLabel: "اسم الخصم",
  namePlaceholder: "مثال: ضريبة دخل",
  codeLabel: "رمز الخصم",
  codePlaceholder: "مثال: DED-TAX",
  searchPlaceholder: "بحث باسم الخصم أو رمزه...",
  fields: [
    { key: "calculation", label: "طريقة الاحتساب", type: "select", chip: true, options: CALCULATION_OPTIONS },
    { key: "value", ...VALUE_FIELD },
  ],
  seed: [
    row("ded-ssf", "تأمين اجتماعي", "DED-SSF", { calculation: "percentage", value: "3.75" }, { notes: "حصة الموظف من الضمان الاجتماعي" }),
    row("ded-tax", "ضريبة دخل", "DED-TAX", { calculation: "percentage", value: "5" }),
    row("ded-adv", "سلفة موظف", "DED-ADV", { calculation: "fixed", value: "0" }, { notes: "تُقسَّط حسب اتفاق السلفة" }),
    row("ded-abs", "خصم غياب", "DED-ABS", { calculation: "fixed", value: "0" }),
    row("ded-late", "خصم تأخير", "DED-LATE", { calculation: "fixed", value: "0" }),
    row("ded-pen", "جزاء إداري", "DED-PEN", { calculation: "fixed", value: "0" }, { isActive: false }),
  ],
};

export const WAREHOUSES_LOOKUP: LookupConfig = {
  key: "warehouses",
  path: "list",
  title: "المخازن",
  description:
    "المخازن الفعلية للمواد الخام والمنتج التام وقطع الغيار عبر وحدات الشركة، وتُستخدم في حركات المخزون والتسويات.",
  icon: Warehouse,
  singular: "مخزن",
  nameLabel: "اسم المخزن",
  namePlaceholder: "مثال: مخزن المواد الخام",
  codeLabel: "رمز المخزن",
  codePlaceholder: "مثال: WH-RAW",
  searchPlaceholder: "بحث باسم المخزن أو رمزه...",
  fields: [
    {
      key: "type",
      label: "نوع المخزن",
      type: "select",
      chip: true,
      options: [
        { value: "raw_materials", label: "مواد خام" },
        { value: "finished_goods", label: "منتج تام" },
        { value: "spare_parts", label: "قطع غيار ومستلزمات" },
        { value: "general", label: "عام" },
      ],
    },
    { key: "location", label: "الموقع", type: "text", placeholder: "مثال: مصنع الفوم - طبرق" },
  ],
  seed: [
    row("wh-raw-foam", "مخزن المواد الخام - الفوم", "WH-RAW-FOAM", { type: "raw_materials", location: "مصنع الفوم - طبرق" }, { notes: "كيماويات ومواد أولية لخط الإنتاج" }),
    row("wh-fg-foam", "مخزن المنتج التام - قوالب الفوم", "WH-FG-FOAM", { type: "finished_goods", location: "مصنع الفوم - طبرق" }),
    row("wh-cut", "مخزن قطع التقطيع", "WH-CUT", { type: "finished_goods", location: "خط التقطيع - طبرق" }),
    row("wh-furn", "مخزن الأثاث تام الصنع", "WH-FURN", { type: "finished_goods", location: "مصنع التجميع - طبرق" }),
    row("wh-spare", "مخزن قطع الغيار والمستلزمات", "WH-SPARE", { type: "spare_parts", location: "المستودع المركزي - طبرق" }),
    row("wh-show", "مخزن المعرض", "WH-SHOW", { type: "general", location: "المعرض - طبرق" }),
    row("wh-old", "المخزن القديم", "WH-OLD", { type: "general", location: "—" }, { isActive: false, notes: "أُوقف بعد افتتاح المستودع المركزي" }),
  ],
};

const WAREHOUSE_OPTIONS: LookupFieldOption[] = WAREHOUSES_LOOKUP.seed.map((warehouse) => ({
  value: warehouse.code,
  label: warehouse.name,
}));

export const LOCATION_TYPES_LOOKUP: LookupConfig = {
  key: "location-types",
  path: "types",
  title: "أنواع مواقع التخزين",
  description:
    "تصنيفات مواقع التخزين الفرعية داخل المخازن (رف، منطقة أرضية، حاوية...)، وتُستخدم عند تعريف مواقع التخزين الفرعية.",
  icon: Layers,
  singular: "نوع موقع",
  nameLabel: "اسم النوع",
  namePlaceholder: "مثال: رف",
  codeLabel: "الرمز",
  codePlaceholder: "مثال: SHELF",
  searchPlaceholder: "بحث باسم النوع أو رمزه...",
  fields: [],
  seed: [
    row("loc-type-shelf", "رف", "SHELF"),
    row("loc-type-floor", "منطقة أرضية", "FLOOR"),
    row("loc-type-container", "حاوية/برميل", "CONTAINER"),
  ],
};

const LOCATION_TYPE_OPTIONS: LookupFieldOption[] = LOCATION_TYPES_LOOKUP.seed.map((type) => ({
  value: type.code,
  label: type.name,
}));

export const STORAGE_LOCATIONS_LOOKUP: LookupConfig = {
  key: "storage-locations",
  path: "locations",
  title: "مواقع التخزين الفرعية",
  description:
    "الأرفف والمناطق الفرعية داخل كل مخزن، وتُستخدم لتحديد موقع الصنف بدقة عند الجرد والتسويات.",
  icon: MapPinned,
  singular: "موقع تخزين",
  nameLabel: "اسم الموقع",
  namePlaceholder: "مثال: الرف A1",
  codeLabel: "رمز الموقع",
  codePlaceholder: "مثال: WH-RAW-FOAM-A1",
  searchPlaceholder: "بحث باسم الموقع أو رمزه...",
  fields: [
    { key: "warehouse", label: "المخزن التابع له", type: "select", chip: true, options: WAREHOUSE_OPTIONS },
    { key: "zoneType", label: "نوع الموقع", type: "select", chip: true, options: LOCATION_TYPE_OPTIONS },
  ],
  seed: [
    row("loc-raw-a1", "الرف A1", "WH-RAW-FOAM-A1", { warehouse: "WH-RAW-FOAM", zoneType: "SHELF" }),
    row("loc-raw-a2", "الرف A2", "WH-RAW-FOAM-A2", { warehouse: "WH-RAW-FOAM", zoneType: "SHELF" }),
    row("loc-fg-f1", "المنطقة الأرضية 1", "WH-FG-FOAM-F1", { warehouse: "WH-FG-FOAM", zoneType: "FLOOR" }),
    row("loc-cut-b1", "الرف B1", "WH-CUT-B1", { warehouse: "WH-CUT", zoneType: "SHELF" }),
    row("loc-furn-f1", "المنطقة الأرضية 1", "WH-FURN-F1", { warehouse: "WH-FURN", zoneType: "FLOOR" }),
    row("loc-spare-c1", "حاوية C1", "WH-SPARE-C1", { warehouse: "WH-SPARE", zoneType: "CONTAINER" }),
  ],
};

export const WAREHOUSE_LOOKUPS: LookupConfig[] = [
  WAREHOUSES_LOOKUP,
  LOCATION_TYPES_LOOKUP,
  STORAGE_LOCATIONS_LOOKUP,
];

export const REFERENCE_LOOKUPS: LookupConfig[] = [
  MEASUREMENT_UNITS_LOOKUP,
  CURRENCIES_LOOKUP,
  BANKS_LOOKUP,
  NATIONALITIES_LOOKUP,
  CITIES_LOOKUP,
  EMPLOYEE_CATEGORIES_LOOKUP,
  EXPENSE_TYPES_LOOKUP,
  FIXED_ASSET_CATEGORIES_LOOKUP,
  ALLOWANCE_TYPES_LOOKUP,
  DEDUCTION_TYPES_LOOKUP,
];

/** Every lookup list across all settings sections — used to seed the shared store. */
export const ALL_LOOKUPS: LookupConfig[] = [...REFERENCE_LOOKUPS, ...WAREHOUSE_LOOKUPS];

/** Applies the variant matching the row's current value of `variants.field`. */
export const resolveLookupField = (
  field: LookupFieldConfig,
  fields: Record<string, string>,
): LookupFieldConfig => {
  const variant = field.variants?.byValue[fields[field.variants.field] ?? ""];
  return variant ? { ...field, ...variant } : field;
};

export const lookupFieldLabel = (
  field: LookupFieldConfig,
  fields: Record<string, string>,
): string => {
  const resolved = resolveLookupField(field, fields);
  const value = fields[field.key];
  if (!value) return "—";
  if (resolved.type === "select") {
    return resolved.options?.find((option) => option.value === value)?.label ?? value;
  }
  return resolved.suffix ? `${value}${resolved.suffix}` : value;
};
