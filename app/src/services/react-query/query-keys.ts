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
      bucketIds?: string[];
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
  buckets: {
    all: ["buckets"] as const,
    lists: () => [...queryKeys.buckets.all, "list"] as const,
    balance: (bucketId?: string) =>
      bucketId
        ? (["buckets", "balance", bucketId] as const)
        : (["buckets", "balance"] as const),
  },
  heatmap: {
    all: ["heatmap"] as const,
    data: (year: number, month?: number) =>
      month
        ? (["heatmap", "data", year, month] as const)
        : (["heatmap", "data", year] as const),
  },
  flashCards: {
    all: ["flash-cards"] as const,
    lists: () => ["flash-cards", "list"] as const,
    details: () => ["flash-cards", "detail"] as const,
    detail: (id: string) => ["flash-cards", "detail", id] as const,
  },
} as const;
