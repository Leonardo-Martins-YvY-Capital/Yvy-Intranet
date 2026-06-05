import { useRouterState } from '@tanstack/react-router';
import { PageHeader } from '../components/ui/PageHeader';

const SECTION_LABELS: Record<string, string> = {
  '/investidores': 'Investidores',
  '/relatorios': 'Relatórios',
  '/compliance': 'Compliance',
};

export default function ComingSoon() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const label = SECTION_LABELS[pathname] ?? 'Página';

  return (
    <div className="p-6 max-w-[1366px] mx-auto">
      <PageHeader title={label} />
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-12 h-12 border-2 border-navy rounded flex items-center justify-center mb-6">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-yvy-navy">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-12a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l2.828 2.829a1 1 0 1 0 1.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-lg font-barlowcn uppercase tracking-widest text-yvy-navy mb-1">
          Em desenvolvimento
        </p>
        <p className="text-sm font-barlow font-light text-yvy-navy max-w-xs">
          Este módulo estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
