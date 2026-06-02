import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ApiError } from '../lib/api';
import { queryKeys } from './query-keys';

export interface Fund {
  id: string;
  name: string;
  code: string;
  status: string;
  type: string;
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
