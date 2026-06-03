import React from 'react';
import { cn } from '../../lib/utils';
import { StatCard } from './StatCard';

type StatCardItem = React.ComponentProps<typeof StatCard>;

interface KPIRowProps {
  items: StatCardItem[];
  period?: string;
  className?: string;
}

export function KPIRow({ items, period, className }: KPIRowProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {period && (
        <p className="text-xs font-barlowcn uppercase tracking-widest text-yvy-navy/40">
          {period}
        </p>
      )}
      <div className={cn(
        'grid gap-4',
        items.length <= 2 && 'grid-cols-2',
        items.length === 3 && 'grid-cols-3',
        items.length >= 4 && 'grid-cols-2 lg:grid-cols-4',
      )}>
        {items.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
