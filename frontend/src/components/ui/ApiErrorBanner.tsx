import { Alert } from './Alert';
import type { ApiError } from '../../lib/api';

interface ApiErrorBannerProps {
  error: ApiError | null | undefined;
  className?: string;
}

export function ApiErrorBanner({ error, className }: ApiErrorBannerProps) {
  if (!error) return null;

  const title = error.title || 'Erro inesperado';
  const fieldErrors = error.errors
    ? Object.entries(error.errors).flatMap(([, msgs]) => msgs)
    : [];

  return (
    <Alert variant="error" title={title} className={className}>
      {error.detail && <p className="text-sm">{error.detail}</p>}
      {fieldErrors.length > 0 && (
        <ul className="mt-1 list-disc list-inside space-y-0.5 text-sm">
          {fieldErrors.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}
