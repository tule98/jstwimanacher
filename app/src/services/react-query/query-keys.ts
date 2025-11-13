export const queryKeys = {
  categories: {
    all: ["categories"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    infinite: (filters?: {
      onlyUnresolved?: boolean;
      onlyVirtual?: boolean;
      search?: string;
      categoryId?: string;
      bucketId?: string;
    }) => ["transactions", "infinite", filters] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
  },
  balance: {
    stats: (month: number, year: number) =>
      ["balance-stats", month, year] as const,
  },
  virtual: {
    transactions: ["virtual-transactions"] as const,
  },
  unresolved: {
    transactions: ["unresolved-transactions"] as const,
  },
  words: {
    all: ["words"] as const,
    lists: () => ["words", "list"] as const,
    list: (filters: Record<string, unknown>) =>
      ["words", "list", filters] as const,
    details: () => ["words", "detail"] as const,
    detail: (id: string) => ["words", "detail", id] as const,
  },
  stories: {
    all: ["stories"] as const,
    lists: () => ["stories", "list"] as const,
    details: () => ["stories", "detail"] as const,
    detail: (id: string) => ["stories", "detail", id] as const,
  },
} as const;
