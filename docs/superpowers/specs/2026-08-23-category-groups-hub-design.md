# Design Spec: Navigation Category Groups & Feature Block Hubs

**Date**: 2026-08-23  
**Status**: Approved  
**Target Repository**: `fine-desktop`

---

## 1. Executive Summary & Goal

Re-organize all 25+ regular functions in **fine-desktop** from a long flat list into **7 High-Level Category Groups**. Clicking a Category Group opens a dedicated **Category Hub Page** displaying interactive visual function blocks (cards) on the screen, while the sidebar is refactored into collapsible Category Group accordions.

---

## 2. Category Group Definitions

1. **👥 الكيانات والشركاء (`/hub/partners`)**:
   - الكيانات والشركاء (`/entities`)
   - الموردون (`/suppliers`)
   - العملاء (`/clients`)
   - الجهات المشغلة (`/external-employers`)

2. **📦 التوريد والاعتمادات (`/hub/procurement`)**:
   - أوامر الاستيراد (`/import-orders`)
   - الخزينة وسعر الصرف (`/treasury`)

3. **🏭 الإنتاج والمخازن (`/hub/production`)**:
   - المخزون والقطع (`/inventory/items`)
   - الطلبات (`/orders`)
   - التصنيع - خلطات الفوم (`/manufacturing/batches`)
   - التقطيع (`/cutter/orders`)
   - الأثاث (`/furniture/orders`)

4. **🏪 المبيعات والمعارض (`/hub/sales`)**:
   - المبيعات (`/sales/orders`)
   - نقطة البيع POS (`/sales/pos`)
   - التزويد الداخلي (`/sales/restock`)

5. **💼 الموارد البشرية (`/hub/hr`)**:
   - الموظفون والعمالة (`/employees`)
   - الحضور والانصراف (`/hr/attendance`)
   - أجور الأدوار (`/hr/rates`)
   - مسير الرواتب (`/hr/payroll`)
   - طلبات الإجازة (`/hr/leave`)

6. **📊 المالية والتقارير (`/hub/finance`)**:
   - دفتر اليومية (`/accounting/journal`)
   - شجرة الحسابات (`/accounting/accounts`)
   - ميزان المراجعة (`/accounting/trial-balance`)
   - المصاريف العمومية (`/accounting/overhead`)
   - الأصول الثابتة (`/accounting/assets`)
   - التقارير المالية (`/reports`)

7. **🛡️ إدارة النظام (`/hub/admin`)**:
   - المستخدمون والصلاحيات (`/users`)

---

## 3. Component Architecture & UI Specifications

### A. Category Registry (`src/routes/categories.config.ts`)
- Configures 7 Category Groups with Arabic titles, descriptions, icons, paths, and member `AppNavItem` lists.

### B. Category Hub Page (`src/pages/hub/CategoryHubPage.tsx`)
- Displays category title, description, and icon header.
- Renders a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
- Interactive Feature Blocks (Cards):
  - Lucide Icon with token background (`bg-app-accent-subtle text-app-accent rounded-2xl p-4`).
  - Title and description of function.
  - Interactive hover state (`hover:border-app-accent hover:shadow-md transition-all`).
  - Click action navigating directly to sub-page route.

### C. Sidebar Accordions (`src/components/layout/Sidebar/Sidebar.tsx`)
- Refactored from flat 25-item list into 7 Category Group accordions.
- Clicking a Category Group title navigates to `/hub/:categoryId` and toggles sub-item expansion.

---

## 4. Self-Review Checklist

- [x] **Placeholder Scan**: No TODOs, TBDs, or vague placeholders.
- [x] **Internal Consistency**: Uses RTL logical properties and `bg-app-*` design tokens exclusively.
- [x] **Scope Check**: Covers category registry, visual hub page, sidebar accordion, and routing.
- [x] **Ambiguity Check**: Category paths and module allocations specified explicitly.
