import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ApiError } from '../lib/api';
import { queryKeys } from './query-keys';

export type FundStatus = 'Draft' | 'Active' | 'Suspended' | 'Liquidated';
export type FundType = 'FII' | 'FIC' | 'FIM' | 'FIA';

export interface Fund {
  id: string;
  name: string;
  code: string;
  status: FundStatus;
  type: FundType;
  minimumInvestmentAmount?: number;
  minimumInvestmentCurrency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useFundsQuery() {
  return useQuery<Fund[], ApiError>({
    queryKey: queryKeys.funds.list(),
    queryFn: () => api.get<Fund[]>('/funds'),
  });
}

export function useFundQuery(id: string) {
  return useQuery<Fund, ApiError>({
    queryKey: queryKeys.funds.detail(id),
    queryFn: () => api.get<Fund>(`/funds/${id}`),
    enabled: Boolean(id),
  });
}
