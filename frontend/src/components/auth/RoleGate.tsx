import type { ReactNode } from 'react';
import type { Role } from '../../lib/auth/roles';
import { useHasRole } from '../../hooks/useHasRole';

interface RoleGateProps {
  /** Render children when the user has ANY of these roles. */
  roles: Role[];
  children: ReactNode;
  /** Optional element shown when the user lacks the role (defaults to nothing). */
  fallback?: ReactNode;
}

/**
 * Declarative role gate for UI affordances.
 *
 * ⚠️ UX ONLY — this is NOT a security boundary. The API independently authorizes every request and
 * returns 401/403; hiding a button here is a convenience, never the access control. Never rely on
 * RoleGate to protect data or actions.
 */
export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const allowed = useHasRole(...roles);
  return <>{allowed ? children : fallback}</>;
}
