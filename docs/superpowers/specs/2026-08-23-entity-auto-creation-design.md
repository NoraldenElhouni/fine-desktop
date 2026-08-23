# Design Spec: Direct Entity Auto-Creation Flow

**Date**: 2026-08-23  
**Status**: Approved  
**Target Repositories**: `fine-desktop`, `fine_backend`

---

## 1. Executive Summary & Goal

Streamline data entry across **Al-Amana Foam & Furniture Co.** management modules by eliminating prerequisite entity creation steps. Users will create Clients, Employees, Suppliers, and External Employers directly through single-step creation modals. The system will automatically create and link the underlying `Entity` record (capturing name, type, tax number, and contact info) transparently in a single transaction.

---

## 2. Scope of Changes

### A. Clients (`ClientsPage.tsx` in `fine-desktop`)
- **Remove**: Entity selection dropdown (`selectedEntityId`) and mandatory entity pre-fetching.
- **Add Direct Fields**:
  - `name` (string, required): Client / Organization Name
  - `entity_type` (enum, optional, default: `organization`): Organization vs Person
  - `tax_number` (string, optional): Tax Identification or Registration Number
- **Retain Existing Fields**: `credit_limit`, `payment_terms_days`, `operating_unit_id`.
- **API Payload**: Pass `{ name, entity_type, tax_number, operating_unit_id, credit_limit, payment_terms_days }` to `createClient()`.

### B. Employees (`EmployeesPage.tsx` in `fine-desktop`)
- **Remove**: Mandatory `selectedEntityId` dropdown.
- **Add Direct Fields**:
  - `name` (string, required): Employee Full Name
  - `entity_type` (enum, optional, default: `person`): Person vs Organization
  - `tax_number` (string, optional): National ID / Tax ID
- **Retain Existing Fields**: `job_title`, `labor_role`, `pay_type`, `hire_date`, `monthly_salary`, `hourly_rate`, `operating_unit_id`, `employer_entity_id`.
- **API Payload**: Pass `{ name, entity_type, tax_number, job_title, pay_type, hire_date, ... }` to `createEmployee()`.

### C. External Employers (`ExternalEmployersPage.tsx` in `fine-desktop`)
- **Remove**: `selectedEntityId` selector requirement.
- **Add Direct Fields**: `name` (required), `entity_type` (default: `organization`), `tax_number` (optional).
- **API Payload**: Pass `{ name, entity_type, tax_number }` to `createExternalEmployer()`.

### D. User Management (`UsersPage.tsx` in `fine-desktop`)
- Confirm clean 1-step user creation with `name`, `email`, `password`, and role assignments with no entity selection blockers.

### E. Master Entities Directory (`EntitiesListPage.tsx` in `fine-desktop`)
- Retain as an audit directory for viewing, searching, and editing existing contact/tax records across the company, but decoupled from entity creation prerequisites.

---

## 3. Backend API Compatibility (`fine_backend`)

- Ensure request validation (`StoreClientRequest`, `StoreEmployeeRequest`, `StoreExternalEmployerRequest`, `StoreSupplierRequest`) allows `entity_id` to be `nullable`.
- Ensure controllers invoke `EntityService::createEntityForDomainModel` when `entity_id` is omitted and direct attributes (`name`, `entity_type`, `tax_number`) are supplied.

---

## 4. Self-Review Checklist

- [x] **Placeholder Scan**: No TODOs, TBDs, or vague placeholders.
- [x] **Internal Consistency**: Matches existing TanStack Query + Zustand patterns in `fine-desktop` and Laravel `EntityService` in `fine_backend`.
- [x] **Scope Check**: Clear 1-step form simplification focused on client, employee, vendor, and user workflows.
- [x] **Ambiguity Check**: Field names and defaults specified explicitly.
