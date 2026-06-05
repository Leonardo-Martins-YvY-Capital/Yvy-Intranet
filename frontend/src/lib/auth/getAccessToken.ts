import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance } from './msalInstance';
import { loginRequest } from './msalConfig';

/**
 * Acquire an API access token silently (MSAL refreshes as needed). Falls back to an interactive
 * redirect when silent acquisition needs user interaction. Returns null when there is no account.
 */
export async function getAccessToken(): Promise<string | null> {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) return null;

  try {
    const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect({ ...loginRequest, account });
    }
    return null;
  }
}
