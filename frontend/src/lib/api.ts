import { getAccessToken } from './auth/getAccessToken';
import { msalInstance } from './auth/msalInstance';
import { loginRequest } from './auth/msalConfig';

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'title' in err && 'status' in err;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (res.status === 401) {
      // Token missing/expired/invalid — re-authenticate interactively.
      const account = msalInstance.getActiveAccount();
      if (account) await msalInstance.acquireTokenRedirect({ ...loginRequest, account });
    }

    if (!res.ok) {
      let err: ApiError;
      try {
        err = await res.json();
      } catch {
        err = {
          type: 'https://httpstatuses.io/' + res.status,
          title: 'Erro na requisição',
          status: res.status,
          detail: res.statusText || undefined,
        };
      }
      throw err;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    if (isApiError(err)) throw err;
    throw {
      type: 'network-error',
      title: 'Serviço indisponível',
      status: 0,
      detail: 'Não foi possível conectar ao servidor. Verifique se a API está em execução.',
    } satisfies ApiError;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
