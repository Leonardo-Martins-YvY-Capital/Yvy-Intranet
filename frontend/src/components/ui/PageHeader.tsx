import React from 'react';
import { cn } from '../../lib/utils';
import { Breadcrumb } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-x-4 mb-6', className)}>
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <Breadcrumb items={breadcrumb} className="mb-1" />
        )}
        <h1 className="text-2xl font-barlowcn font-semibold uppercase tracking-wider text-yvy-navy leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm font-barlow font-light text-yvy-navy/55">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-x-2 shrink-0 pt-0.5">{actions}</div>
      )}
    </div>
  );
}
