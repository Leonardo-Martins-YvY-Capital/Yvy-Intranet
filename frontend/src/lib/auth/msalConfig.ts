import type { Configuration, RedirectRequest } from '@azure/msal-browser';

const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID;
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;

/** The API scope the SPA requests; the resulting access token carries the `roles` claim. */
export const apiScope: string = import.meta.env.VITE_ENTRA_API_SCOPE;

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    // sessionStorage (cleared on tab close) per ADR-001's XSS trade-off note.
    cacheLocation: 'sessionStorage',
  },
};

export const loginRequest: RedirectRequest = {
  scopes: [apiScope],
};
