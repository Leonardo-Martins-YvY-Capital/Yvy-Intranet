import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useAuthStore } from '../store/auth.store';
import { getAccessToken } from '../lib/auth/getAccessToken';
import { decodeClaims } from '../lib/auth/roles';
import { loginRequest } from '../lib/auth/msalConfig';

/**
 * Hydrates the auth store with the signed-in user's identity + roles, decoded from the access token.
 * Run once near the app root (inside MsalProvider).
 */
export function useAuthBootstrap(): void {
  const { instance, accounts } = useMsal();
  const setIdentity = useAuthStore((s) => s.setIdentity);
  const clearIdentity = useAuthStore((s) => s.clearIdentity);

  useEffect(() => {
    let cancelled = false;

    if (accounts.length === 0) {
      clearIdentity();
      return;
    }

    instance.setActiveAccount(accounts[0]);
    void (async () => {
      const token = await getAccessToken();
      if (cancelled || !token) return;
      setIdentity(decodeClaims(token));
    })();

    return () => {
      cancelled = true;
    };
  }, [accounts, instance, setIdentity, clearIdentity]);
}

/** Login/logout actions bound to the MSAL instance. */
export function useAuthActions() {
  const { instance } = useMsal();
  const clearIdentity = useAuthStore((s) => s.clearIdentity);

  return {
    login: () => instance.loginRedirect(loginRequest),
    logout: () => {
      clearIdentity();
      return instance.logoutRedirect();
    },
  };
}
