import { RouterProvider } from '@tanstack/react-router';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { router } from './router';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';

export default function App() {
  const { inProgress } = useMsal();
  useAuthBootstrap();

  // Wait for MSAL to finish processing any redirect response (and populate accounts) before the
  // router runs its auth guard — otherwise the guard can momentarily see no account and bounce a
  // freshly-authenticated user back to /login.
  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yvy-navy text-white font-barlowcn uppercase tracking-widest">
        Carregando…
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
