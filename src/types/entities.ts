export type EntityType = 'individual' | 'organization';

export type EntityRoleType = 'employee' | 'client' | 'vendor' | 'external_employer';

export type PayType = 'hourly' | 'monthly' | 'piece_rate';

export type EmployeeStatus = 'active' | 'terminated' | 'on_leave';

export type ClientStatus = 'active' | 'suspended' | 'blacklisted';

export interface OperatingUnit {
  id: string;
  company_id?: string;
  blueprint_id?: string;
  name: string;
  unit_type?: string;
  currency?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EntityContact {
  id?: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  is_primary?: boolean;
  created_at?: string;
}

export interface EntityRole {
  id?: string;
  role_type: EntityRoleType;
  operating_unit_id?: string | null;
  created_at?: string;
}

export interface Entity {
  id: string;
  name: string;
  entity_type: EntityType;
  tax_number?: string | null;
  user_id?: string | null;
  is_active: boolean;
  record_version?: number;
  roles?: EntityRole[];
  contacts?: EntityContact[];
  primary_contact?: EntityContact | null;
  employee?: Employee | null;
  client?: Client | null;
  external_employer?: ExternalEmployer | null;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  entity_id: string;
  operating_unit_id: string;
  employer_entity_id?: string | null;
  job_title: string;
  labor_role?: string | null;
  pay_type: PayType;
  monthly_salary?: string | number | null;
  hourly_rate?: string | number | null;
  hire_date: string;
  status: EmployeeStatus;
  record_version?: number;
  entity?: Entity;
  employer_entity?: Entity | null;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  entity_id: string;
  operating_unit_id: string;
  credit_limit: string | number;
  current_balance?: string | number;
  payment_terms_days: number;
  account_id?: string | null;
  status: ClientStatus;
  record_version?: number;
  entity?: Entity;
  created_at?: string;
  updated_at?: string;
}

export interface ExternalEmployer {
  id: string;
  entity_id: string;
  contract_reference?: string | null;
  billing_rate_multiplier: string | number;
  account_id?: string | null;
  entity?: Entity;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEntityPayload {
  name: string;
  entity_type: EntityType;
  tax_number?: string;
  is_active?: boolean;
  contact?: {
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  roles?: Array<{
    role_type: EntityRoleType;
    operating_unit_id?: string;
  }>;
}

export interface CreateEmployeePayload {
  entity_id?: string;
  name?: string;
  entity_type?: EntityType;
  tax_number?: string;
  operating_unit_id: string;
  employer_entity_id?: string | null;
  job_title: string;
  labor_role?: string | null;
  pay_type: PayType;
  monthly_salary?: number | null;
  hourly_rate?: number | null;
  hire_date: string;
  status?: EmployeeStatus;
}

export interface CreateClientPayload {
  entity_id?: string;
  name?: string;
  entity_type?: EntityType;
  tax_number?: string;
  operating_unit_id: string;
  credit_limit?: number;
  payment_terms_days?: number;
  account_id?: string | null;
  status?: ClientStatus;
}

export interface CreateExternalEmployerPayload {
  entity_id?: string;
  name?: string;
  entity_type?: EntityType;
  tax_number?: string;
  operating_unit_id?: string;
  contract_reference?: string;
  billing_rate_multiplier?: number;
  account_id?: string | null;
}

export interface SplitEntityPayload {
  new_name?: string;
}

export interface RelinkEntityPayload {
  target_entity_id: string;
}
