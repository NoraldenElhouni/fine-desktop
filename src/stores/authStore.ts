import { create } from "zustand";
import { User } from "../types/auth/types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const TOKEN_KEY = "fine_auth_token";
const USER_KEY = "fine_auth_user";

const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const getInitialUser = (): User | null => {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: Boolean(initialToken),

  setAuth: (token: string, user: User) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save auth state to localStorage:", e);
    }
    window.electronAPI?.sync?.setToken(token);
    set({ token, user, isAuthenticated: true });
  },

  setUser: (user: User) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to update user in localStorage:", e);
    }
    set({ user });
  },

  logout: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error("Failed to remove auth state from localStorage:", e);
    }
    window.electronAPI?.sync?.setToken(null);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

// Initialize the main process with the loaded token on startup
if (initialToken) {
  window.electronAPI?.sync?.setToken(initialToken);
}

