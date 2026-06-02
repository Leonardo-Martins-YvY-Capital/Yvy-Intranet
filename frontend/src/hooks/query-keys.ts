export const queryKeys = {
  funds: {
    all: ['funds'] as const,
    list: (filters?: Record<string, unknown>) => ['funds', 'list', filters] as const,
    detail: (id: string) => ['funds', 'detail', id] as const,
  },
  investors: {
    all: ['investors'] as const,
    list: (page: number) => ['investors', 'list', page] as const,
    detail: (id: string) => ['investors', 'detail', id] as const,
  },
} as const;
