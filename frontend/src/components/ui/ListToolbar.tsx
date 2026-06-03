import React from 'react';
import { cn } from '../../lib/utils';
import { Input } from './Input';

interface SearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ListToolbarProps {
  search?: SearchConfig;
  filters?: React.ReactNode;
  resultCount?: number;
  resultLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ListToolbar({
  search,
  filters,
  resultCount,
  resultLabel = 'resultados',
  actions,
  className,
}: ListToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {search && (
        <div className="w-64">
          <Input
            type="search"
            placeholder={search.placeholder ?? 'Buscar...'}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
          />
        </div>
      )}
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {resultCount !== undefined && (
        <span className="text-xs font-barlowcn text-yvy-navy/45">
          {resultCount.toLocaleString('pt-BR')} {resultLabel}
        </span>
      )}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
