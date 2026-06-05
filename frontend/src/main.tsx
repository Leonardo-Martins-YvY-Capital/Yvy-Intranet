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
  // MSAL must be initialized before any use, and the redirect response processed on return.
  await msalInstance.initialize()
  await msalInstance.handleRedirectPromise()
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
