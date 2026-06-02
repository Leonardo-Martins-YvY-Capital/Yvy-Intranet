import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ApiError } from '../lib/api';
import { queryKeys } from './query-keys';

export interface Investor {
  id: string;
  name: string;
  document: string;
  status: string;
}

export function useInvestorsQuery(page = 1) {
  return useQuery<Investor[], ApiError>({
    queryKey: queryKeys.investors.list(page),
    queryFn: () => api.get<Investor[]>(`/investors?page=${page}`),
  });
}

export function useInvestorQuery(id: string) {
  return useQuery<Investor, ApiError>({
    queryKey: queryKeys.investors.detail(id),
    queryFn: () => api.get<Investor>(`/investors/${id}`),
    enabled: Boolean(id),
  });
}
