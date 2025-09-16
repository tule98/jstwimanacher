export const queryKeys = {
  categories: {
    all: ["categories"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    infinite: ["transactions", "infinite"] as const,
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
} as const;
