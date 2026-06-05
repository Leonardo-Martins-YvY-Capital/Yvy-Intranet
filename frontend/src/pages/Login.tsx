import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsAuthenticated } from '@azure/msal-react';
import { useAuthActions } from '../hooks/useAuthBootstrap';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export default function Login() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { login } = useAuthActions();

  // Already signed in (e.g. visiting /login directly) → go to the app.
  useEffect(() => {
    if (isAuthenticated) void navigate({ to: '/' });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-yvy-navy p-6">
      <Card className="w-full max-w-md items-center text-center gap-y-6">
        <Logo width={120} height={54} fillColor="#122C4F" />
        <div className="flex flex-col gap-y-1">
          <h1 className="text-2xl font-light font-barlowcn uppercase tracking-wide text-yvy-navy">
            Yvy Intranet
          </h1>
          <p className="text-sm font-barlow text-yvy-navy/60">
            Acesso restrito a colaboradores Yvy Capital.
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={() => void login()}>
          Entrar com a Microsoft
        </Button>
      </Card>
    </div>
  );
}
