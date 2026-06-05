import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.tsx'
import { router } from './router.ts'
import { ToastProvider } from './components/ui/Toast.tsx'
import { queryClient } from './lib/queryClient.ts'
import { msalInstance } from './lib/auth/msalInstance.ts'

async function bootstrap() {
  // MSAL must be initialized before any use. The redirect response is processed by <MsalProvider>
  // (calling handleRedirectPromise here too would double-consume the request cache and throw
  // no_token_request_cache_error). App gates rendering until inProgress === None.
  await msalInstance.initialize()
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length > 0) msalInstance.setActiveAccount(accounts[0])

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <App />
          </ToastProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackRouterDevtools router={router} initialIsOpen={false} />
        </QueryClientProvider>
      </MsalProvider>
    </StrictMode>,
  )
}

void bootstrap()
