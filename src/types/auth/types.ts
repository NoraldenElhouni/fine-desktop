export interface UserRole {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  must_change_password?: boolean;
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

