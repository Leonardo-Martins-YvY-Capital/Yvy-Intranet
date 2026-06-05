import { Outlet } from '@tanstack/react-router';
import { cn } from '../lib/utils';
import { useUIStore } from '../store/ui.store';
import { Sidebar } from './Sidebar';

export default function RootLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      <Sidebar />
      <main
        className={cn(
          'flex-1 min-w-0 yvy-transition',
          sidebarOpen ? 'ml-60' : 'ml-14'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
