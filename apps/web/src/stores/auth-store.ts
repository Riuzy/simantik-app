import { create } from 'zustand';
import type { User } from '../features/auth/types';

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  setHydrated: () => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    set({ token });
  },
  setHydrated: () => set({ hydrated: true }),
  clearSession: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, token: null, hydrated: true });
  },
}));
