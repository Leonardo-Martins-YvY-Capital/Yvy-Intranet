import { useAuthStore } from '../store/auth.store';
import type { Role } from '../lib/auth/roles';

/**
 * Returns true if the signed-in user has ANY of the given roles.
 *
 * UX ONLY — not a security boundary. The API enforces authorization (401/403); this just decides
 * whether to show an affordance.
 */
export function useHasRole(...roles: Role[]): boolean {
  const userRoles = useAuthStore((s) => s.roles);
  return roles.some((r) => userRoles.includes(r));
}
