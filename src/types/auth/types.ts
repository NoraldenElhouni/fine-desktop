export interface UserRole {
  id: string | number;
  name: string;
  slug: string;
  pivot?: {
    operating_unit_id: string | null;
  };
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  is_active: boolean;
  must_change_password?: boolean;
  role_slugs?: string[];
  permissions?: string[];
  roles?: UserRole[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
  user: User;
}

