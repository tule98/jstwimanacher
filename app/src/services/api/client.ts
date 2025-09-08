/**
 * API Client Service
 * Client-side service for interacting with API endpoints
 */

import { UTCString, parseUserDateToUTC } from "@/lib/timezone";

export interface Category {
  id: string;
  name: string;
  color: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: string;
  amount: number;
  category_id: string;
  note?: string;
  /** UTC ISO string - always stored and transmitted in UTC */
  created_at: UTCString;
  /** UTC ISO string - always stored and transmitted in UTC */
  updated_at: UTCString;
  is_resolved: boolean;
  is_virtual: boolean; // Mark virtual transaction
  category: Category; // Joined category data
}

export interface TransactionCreateData {
  amount: number;
  category_id: string;
  note?: string;
  is_virtual?: boolean; // Mark virtual transaction
  /** UTC ISO string - will be converted to UTC if provided, otherwise uses current UTC time */
  created_at?: UTCString | string;
}

export interface TransactionUpdateData {
  id: string;
  amount?: number;
  category_id?: string;
  note?: string;
  is_resolved?: boolean;
  is_virtual?: boolean; // Mark virtual transaction
  /** UTC ISO string - will be converted to UTC if provided */
  created_at?: UTCString | string;
}

export interface CategoryStats {
  category_id: string;
  category_name: string;
  total: number;
  percentage: number;
  color: string;
}

export interface MonthlyStats {
  month: number;
  year: number;
  total: number;
  stats: CategoryStats[];
}

export interface BalanceStats {
  // Income
  income_real: number; // Real income (excluding virtual)
  income_virtual: number; // Virtual income
  income: number; // Total income (real + virtual) - primary field

  // Expenses
  expense_real: number; // Real expenses (excluding virtual)
  expense_virtual: number; // Virtual expenses
  expense: number; // Total expenses (real + virtual) - primary field

  // Balance
  balance: number; // Total income - total expenses
}

/**
 * Categories API Client
 */
export const CategoriesAPI = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  },

  /**
   * Get categories by type (income/expense)
   */
  async getByType(type: "income" | "expense"): Promise<Category[]> {
    const response = await fetch(`/api/categories?type=${type}`);
    if (!response.ok) {
      throw new Error("Failed to fetch categories by type");
    }
    return response.json();
  },

  /**
   * Create new category
   */
  async create(
    name: string,
    color: string,
    type: "income" | "expense" = "expense"
  ): Promise<Category> {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, color, type }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to create category");
    }
    return result.result;
  },

  /**
   * Update category
   */
  async update(id: string, name: string, color: string): Promise<Category> {
    const response = await fetch("/api/categories", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, color }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to update category");
    }
    return result.result;
  },

  /**
   * Delete category
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(
      `/api/categories?id=${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to delete category");
    }
  },
};

/**
 * Transactions API Client
 */
export const TransactionsAPI = {
  /**
   * Get all transactions
   */
  async getAll(): Promise<Transaction[]> {
    const response = await fetch("/api/transactions");
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }
    return response.json();
  },

  /**
   * Get transactions with limit
   */
  async getWithLimit(limit: number): Promise<Transaction[]> {
    const response = await fetch(`/api/transactions?limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch transactions with limit");
    }
    return response.json();
  },

  /**
   * Get transactions with offset and limit (for infinite scroll)
   */
  async getWithPagination(
    limit: number,
    offset: number
  ): Promise<Transaction[]> {
    const response = await fetch(
      `/api/transactions?limit=${limit}&offset=${offset}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch transactions with pagination");
    }
    return response.json();
  },

  /**
   * Get transactions by month
   */
  async getByMonth(month: number, year: number): Promise<Transaction[]> {
    const response = await fetch(
      `/api/transactions?month=${month}&year=${year}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch transactions by month");
    }
    return response.json();
  },

  /**
   * Get all virtual transactions (not limited by time)
   */
  async getVirtualTransactions(): Promise<Transaction[]> {
    const response = await fetch("/api/transactions/virtual");
    if (!response.ok) {
      throw new Error("Failed to fetch virtual transactions");
    }
    return response.json();
  },

  /**
   * Create new transaction
   */
  async create(data: TransactionCreateData): Promise<Transaction> {
    // Convert created_at to UTC if provided
    const requestData = {
      ...data,
      created_at: data.created_at
        ? parseUserDateToUTC(data.created_at)
        : undefined,
    };

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to add transaction");
    }
    return result.result;
  },

  /**
   * Update transaction
   */
  async update(data: TransactionUpdateData): Promise<Transaction> {
    // Convert created_at to UTC if provided
    const requestData = {
      ...data,
      created_at: data.created_at
        ? parseUserDateToUTC(data.created_at)
        : data.created_at,
    };

    const response = await fetch("/api/transactions", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to update transaction");
    }
    return result.result;
  },

  /**
   * Delete transaction
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/transactions?id=${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to delete transaction");
    }
  },
};

/**
 * Stats API Client
 */
export const StatsAPI = {
  /**
   * Get category statistics for a specific month
   */
  async getCategoryStats(
    month: number,
    year: number
  ): Promise<CategoryStats[]> {
    const response = await fetch(`/api/stats?month=${month}&year=${year}`);
    if (!response.ok) {
      throw new Error("Failed to fetch category stats");
    }
    return response.json();
  },

  /**
   * Get overall financial statistics (income + expense + balance)
   */
  async getBalanceStats(month: number, year: number): Promise<BalanceStats> {
    const response = await fetch(
      `/api/stats/balance?month=${month}&year=${year}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch balance stats");
    }
    return response.json();
  },

  /**
   * Get historical monthly statistics
   */
  async getHistoricalStats(months: number): Promise<MonthlyStats[]> {
    const response = await fetch(`/api/stats?months=${months}`);
    if (!response.ok) {
      throw new Error("Failed to fetch historical stats");
    }
    return response.json();
  },
};

/**
 * Combined API client export
 */
export const API = {
  categories: CategoriesAPI,
  transactions: TransactionsAPI,
  stats: StatsAPI,
};

export default API;
