import { useAuthStore } from '../../store/auth.store';
import { useAuthActions } from '../../hooks/useAuthBootstrap';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

function initialsFrom(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

export function UserMenu({ collapsed }: { collapsed: boolean }) {
  const displayName = useAuthStore((s) => s.displayName);
  const email = useAuthStore((s) => s.email);
  const roles = useAuthStore((s) => s.roles);
  const { logout } = useAuthActions();

  return (
    <div className="border-t border-white/10 py-3 px-2">
      <div className={cn('flex items-center gap-x-3 px-1', collapsed && 'justify-center px-0')}>
        <Avatar initials={initialsFrom(displayName)} size="sm" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-barlowcn text-white">{displayName ?? 'Usuário'}</p>
            {email && <p className="truncate text-xs text-white/45">{email}</p>}
          </div>
        )}
      </div>

      {!collapsed && roles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 px-1">
          {roles.map((role) => (
            <Badge key={role} variant="info" size="sm">
              {role}
            </Badge>
          ))}
        </div>
      )}

      <button
        onClick={() => void logout()}
        aria-label="Sair"
        className={cn(
          'mt-3 w-full flex items-center gap-x-3 py-2 rounded text-sm font-barlowcn uppercase tracking-widest text-white/55 hover:bg-white/10 hover:text-white yvy-transition',
          collapsed ? 'justify-center px-0' : 'px-3',
        )}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6a1 1 0 1 0 0-2H4V5h5a1 1 0 0 0 0-2H3zm10.293 3.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L14.586 11H8a1 1 0 1 1 0-2h6.586l-1.293-1.293a1 1 0 0 1 0-1.414z"
            clipRule="evenodd"
          />
        </svg>
        {!collapsed && <span>Sair</span>}
      </button>
    </div>
  );
}
