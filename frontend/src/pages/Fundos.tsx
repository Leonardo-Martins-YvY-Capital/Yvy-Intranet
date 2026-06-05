import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useFundsQuery, type FundStatus, type FundType } from '../hooks/useFundsQuery';
import { formatBRL } from '../lib/formatters';
import { PageHeader } from '../components/ui/PageHeader';
import { ListToolbar } from '../components/ui/ListToolbar';
import { ApiErrorBanner } from '../components/ui/ApiErrorBanner';
import { Button } from '../components/ui/Button';
import { RoleGate } from '../components/auth/RoleGate';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../components/ui/Table';

const STATUS_BADGE: Record<FundStatus, React.ComponentProps<typeof Badge>['variant']> = {
  Active: 'success',
  Draft: 'neutral',
  Suspended: 'warning',
  Liquidated: 'danger',
};

const STATUS_LABEL: Record<FundStatus, string> = {
  Active: 'Ativo',
  Draft: 'Rascunho',
  Suspended: 'Suspenso',
  Liquidated: 'Liquidado',
};

const TYPE_LABEL: Record<FundType, string> = {
  FII: 'FII',
  FIC: 'FIC',
  FIM: 'FIM',
  FIA: 'FIA',
};

export default function Fundos() {
  const navigate = useNavigate();
  const { data: funds, isLoading, error } = useFundsQuery();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    if (!funds) return [];
    return funds.filter((f) => {
      const matchSearch =
        !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.code.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || f.type === typeFilter;
      const matchStatus = !statusFilter || f.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [funds, search, typeFilter, statusFilter]);

  return (
    <div className="p-6 max-w-[1366px] mx-auto">
      <PageHeader
        title="Fundos"
        subtitle="Gestão de fundos de investimento"
        actions={
          <RoleGate roles={['Operator', 'Admin']}>
            <Button size="sm" onClick={() => navigate({ to: '/fundos/novo' })}>
              Novo Fundo
            </Button>
          </RoleGate>
        }
      />

      <ApiErrorBanner error={error} className="mb-4" />

      <ListToolbar
        search={{ value: search, onChange: setSearch, placeholder: 'Buscar por nome ou código...' }}
        filters={
          <>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-32"
            >
              <option value="">Todos os tipos</option>
              <option value="FII">FII</option>
              <option value="FIC">FIC</option>
              <option value="FIM">FIM</option>
              <option value="FIA">FIA</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="">Todos os status</option>
              <option value="Active">Ativo</option>
              <option value="Draft">Rascunho</option>
              <option value="Suspended">Suspenso</option>
              <option value="Liquidated">Liquidado</option>
            </Select>
          </>
        }
        resultCount={isLoading ? undefined : filtered.length}
        resultLabel="fundos"
        className="mb-4"
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={funds?.length === 0 ? 'Nenhum fundo cadastrado' : 'Nenhum resultado encontrado'}
          description={
            funds?.length === 0
              ? 'Crie o primeiro fundo para começar.'
              : 'Tente ajustar os filtros ou o termo de busca.'
          }
          action={
            funds?.length === 0 ? (
              <RoleGate roles={['Operator', 'Admin']}>
                <Button size="sm" onClick={() => navigate({ to: '/fundos/novo' })}>
                  Novo Fundo
                </Button>
              </RoleGate>
            ) : undefined
          }
        />
      ) : (
        <Table striped>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Código</TableHeaderCell>
              <TableHeaderCell>Nome</TableHeaderCell>
              <TableHeaderCell>Tipo</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Invest. Mínimo</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((fund) => (
              <TableRow
                key={fund.id}
                onRowClick={() => navigate({ to: '/fundos/$id', params: { id: fund.id } })}
              >
                <TableCell>
                  <span className="font-barlowcn font-semibold tracking-wide text-yvy-navy">
                    {fund.code}
                  </span>
                </TableCell>
                <TableCell>{fund.name}</TableCell>
                <TableCell>
                  <span className="font-barlowcn text-sm text-yvy-navy/70">
                    {TYPE_LABEL[fund.type] ?? fund.type}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[fund.status] ?? 'neutral'} size="sm">
                    {STATUS_LABEL[fund.status] ?? fund.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {fund.minimumInvestmentAmount != null
                    ? formatBRL(fund.minimumInvestmentAmount)
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
