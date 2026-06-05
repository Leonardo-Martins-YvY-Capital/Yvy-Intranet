import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './msalConfig';

/** Single MSAL instance shared by the provider, the router guard, and the API client. */
export const msalInstance = new PublicClientApplication(msalConfig);
