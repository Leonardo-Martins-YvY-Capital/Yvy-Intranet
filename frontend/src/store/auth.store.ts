import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { IdentityClaims, Role } from '../lib/auth/roles';

interface AuthState {
  userId: string | null;
  displayName: string | null;
  email: string | null;
  roles: Role[];
  setIdentity: (identity: IdentityClaims) => void;
  clearIdentity: () => void;
}

// Derived identity only — MSAL owns the token cache, so we never persist tokens here
// (duplicating MSAL's cache invites staleness). Roles are kept so the UI can gate without an
// API round-trip; the API remains the authorization boundary.
export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      userId: null,
      displayName: null,
      email: null,
      roles: [],
      setIdentity: (identity) =>
        set(
          {
            userId: identity.userId,
            displayName: identity.displayName,
            email: identity.email,
            roles: identity.roles,
          },
          false,
          'auth/setIdentity',
        ),
      clearIdentity: () =>
        set(
          { userId: null, displayName: null, email: null, roles: [] },
          false,
          'auth/clearIdentity',
        ),
    }),
    { name: 'AuthStore' },
  ),
);
