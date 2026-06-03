import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUIStore } from '../store/ui.store';
import { Logo } from '../components/ui/Logo';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path d="M2 10a8 8 0 1 1 16 0A8 8 0 0 1 2 10zm3.5-3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z" />
      </svg>
    ),
  },
  {
    to: '/fundos',
    label: 'Fundos',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5zm6-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7zm6-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V4z" />
      </svg>
    ),
  },
  {
    to: '/investidores',
    label: 'Investidores',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM17 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 0 0-1.5-4.33A5 5 0 0 1 19 16v1h-6.07zM6 11a5 5 0 0 1 5 5v1H1v-1a5 5 0 0 1 5-5z" />
      </svg>
    ),
  },
  {
    to: '/relatorios',
    label: 'Relatórios',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path fillRule="evenodd" d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/compliance',
    label: 'Compliance',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0 0 10 1.944 11.954 11.954 0 0 0 17.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const DEV_ITEMS = [
  {
    to: '/design-system',
    label: 'Design System',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
        <path d="M4 2a2 2 0 0 0-2 2v11a3 3 0 0 0 6 0V4a2 2 0 0 0-2-2H4zm1 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm5-1.757l4.9-4.9a2 2 0 0 0 0-2.828L13.485 5.1a2 2 0 0 0-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center py-2 rounded text-sm font-barlowcn uppercase tracking-widest yvy-transition',
      sidebarOpen ? 'gap-x-3 px-3' : 'justify-center px-0',
      isActive
        ? 'bg-white/15 text-white'
        : 'text-white/55 hover:bg-white/10 hover:text-white/85'
    );

  const labelClass = cn(
    'whitespace-nowrap yvy-transition overflow-hidden',
    sidebarOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 bg-yvy-navy flex flex-col yvy-transition overflow-hidden shrink-0',
        sidebarOpen ? 'w-60' : 'w-14'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'h-14 flex items-center px-3 border-b border-white/10 shrink-0',
          sidebarOpen ? 'justify-between' : 'justify-center'
        )}
      >
        <NavLink
          to="/"
          className={cn(
            'flex items-center overflow-hidden yvy-transition',
            !sidebarOpen && 'w-0 opacity-0 pointer-events-none'
          )}
        >
          <Logo width={72} height={32} fillColor="#ffffff" className="shrink-0" />
        </NavLink>
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 yvy-transition shrink-0"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            {sidebarOpen ? (
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Navegação principal">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={linkClass}>
                {item.icon}
                <span className={labelClass}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Dev section */}
      <div className="border-t border-white/10 py-3 px-2">
        {sidebarOpen && (
          <p className="px-3 pb-1 text-xs font-barlowcn uppercase tracking-widest text-white/25">
            Dev
          </p>
        )}
        <ul className="space-y-0.5">
          {DEV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={linkClass}>
                {item.icon}
                <span className={labelClass}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
