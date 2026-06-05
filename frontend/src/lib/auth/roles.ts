export type Role = 'Approver' | 'Operator' | 'Viewer' | 'Admin';

const KNOWN_ROLES: readonly string[] = ['Approver', 'Operator', 'Viewer', 'Admin'];

export interface IdentityClaims {
  userId: string | null; // Entra oid
  displayName: string | null;
  email: string | null;
  roles: Role[];
}

/**
 * Decode the payload of an Entra **access token** for display/gating purposes.
 *
 * The App Roles (`roles` claim) live in the ACCESS token because they are defined on the API app
 * registration — NOT in the id token. This decode is unverified and is used ONLY for UX (showing the
 * user's name/roles and gating UI). The API independently validates the token and enforces authz.
 */
export function decodeClaims(accessToken: string): IdentityClaims {
  try {
    const payload = accessToken.split('.')[1];
    const json = base64UrlDecode(payload);
    const rawRoles: unknown = json.roles;
    const roles = (Array.isArray(rawRoles) ? rawRoles : []).filter(
      (r): r is Role => typeof r === 'string' && KNOWN_ROLES.includes(r),
    );

    return {
      userId: typeof json.oid === 'string' ? json.oid : null,
      displayName: typeof json.name === 'string' ? json.name : null,
      email:
        (typeof json.preferred_username === 'string' && json.preferred_username) ||
        (typeof json.email === 'string' && json.email) ||
        null,
      roles,
    };
  } catch {
    return { userId: null, displayName: null, email: null, roles: [] };
  }
}

function base64UrlDecode(segment: string): Record<string, unknown> {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  return JSON.parse(json) as Record<string, unknown>;
}
