import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  token: string | null;
  role: 'admin' | 'viewer' | null;
  setSession: (userId: string, token: string, role: AuthState['role']) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        userId: null,
        token: null,
        role: null,
        setSession: (userId, token, role) =>
          set({ userId, token, role }, false, 'auth/setSession'),
        clearSession: () =>
          set({ userId: null, token: null, role: null }, false, 'auth/clearSession'),
      }),
      {
        name: 'yvy-auth',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (s) => ({ userId: s.userId, token: s.token, role: s.role }),
      }
    ),
    { name: 'AuthStore' }
  )
);
