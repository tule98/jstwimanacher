/**
 * API Client Service
 * Client-side service for interacting with API endpoints
 */

import { UTCString, parseUserDateToUTC } from "@/lib/timezone";
import { httpClient } from "@/lib/http-client";

export interface Category {
  id: string;
  name: string;
  color: string;
  type: "income" | "expense";
}

export interface Bucket {
  id: string;
  name: string;
  is_default: boolean;
  created_at: UTCString;
  updated_at: UTCString;
}

export interface Asset {
  id: string;
  name: string;
  color: string;
  unit: string;
  created_at: UTCString;
}

export interface AssetCreateData {
  name: string;
  color: string;
  unit?: string;
}

export interface AssetUpdateData {
  id: string;
  name?: string;
  color?: string;
  unit?: string;
}

export interface AssetConversion {
  id: string;
  asset_id: string;
  transaction_id: string;
  conversion_type: "buy" | "sell";
  quantity: number;
  created_at: UTCString;
  updated_at: UTCString;
  asset: Asset;
  transaction: Transaction & { category: Category };
}

export interface AssetConversionCreateData {
  assetId: string;
  amount: number;
  quantity: number;
  categoryId: string;
  note?: string;
  conversionType: "buy" | "sell";
  created_at?: UTCString | string;
}

export interface AssetPortfolio {
  asset_id: string;
  asset_name: string;
  asset_color: string;
  buy_count: number;
  sell_count: number;
  total_invested: number;
  total_received: number;
  total_quantity: number;
  unit: string;
  current_status: "owned" | "sold";
}

export interface Transaction {
  id: string;
  amount: number;
  category_id: string;
  bucket_id?: string | null;
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
  bucket_id?: string | null;
  note?: string;
  is_virtual?: boolean; // Mark virtual transaction
  is_resolved?: boolean; // Mark transaction as resolved
  /** UTC ISO string - will be converted to UTC if provided, otherwise uses current UTC time */
  created_at?: UTCString | string;
}

export interface TransactionUpdateData {
  id: string;
  amount?: number;
  category_id?: string;
  bucket_id?: string | null;
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
    return httpClient.get<Category[]>("/api/categories");
  },

  /**
   * Get categories by type (income/expense)
   */
  async getByType(type: "income" | "expense"): Promise<Category[]> {
    return httpClient.get<Category[]>("/api/categories", { type });
  },

  /**
   * Create new category
   */
  async create(
    name: string,
    color: string,
    type: "income" | "expense" = "expense"
  ): Promise<Category> {
    const result = await httpClient.post<{ result: Category }>(
      "/api/categories",
      { name, color, type }
    );
    return result.result;
  },

  /**
   * Update category
   */
  async update(id: string, name: string, color: string): Promise<Category> {
    const result = await httpClient.put<{ result: Category }>(
      "/api/categories",
      { id, name, color }
    );
    return result.result;
  },

  /**
   * Delete category
   */
  async delete(id: string): Promise<void> {
    await httpClient.delete("/api/categories", { id });
  },
};

export const BucketsAPI = {
  async getAll(): Promise<Bucket[]> {
    return httpClient.get<Bucket[]>("/api/buckets");
  },

  async getSummary(
    bucketId: string
  ): Promise<{ income: number; expense: number }> {
    return httpClient.get<{ income: number; expense: number }>("/api/buckets", {
      summaryFor: bucketId,
    });
  },

  async create(name: string, is_default: boolean = false): Promise<Bucket> {
    const result = await httpClient.post<{ bucket: Bucket }>("/api/buckets", {
      name,
      is_default,
    });
    return result.bucket;
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
    return httpClient.get<Transaction[]>("/api/transactions");
  },

  /**
   * Get transactions with limit
   */
  async getWithLimit(limit: number): Promise<Transaction[]> {
    return httpClient.get<Transaction[]>("/api/transactions", { limit });
  },

  /**
   * Get transactions with offset and limit (for infinite scroll)
   */
  async getWithPagination(
    limit: number,
    offset: number,
    options?: {
      onlyUnresolved?: boolean;
      onlyVirtual?: boolean;
      search?: string;
      categoryId?: string;
      bucketId?: string;
    }
  ): Promise<Transaction[]> {
    return httpClient.get<Transaction[]>("/api/transactions", {
      limit,
      offset,
      ...(options?.onlyUnresolved && { onlyUnresolved: "true" }),
      ...(options?.onlyVirtual && { onlyVirtual: "true" }),
      ...(options?.search && { search: options.search }),
      ...(options?.categoryId && { categoryId: options.categoryId }),
      ...(options?.bucketId && { bucketId: options.bucketId }),
    });
  },

  /**
   * Get transactions by month
   */
  async getByMonth(month: number, year: number): Promise<Transaction[]> {
    return httpClient.get<Transaction[]>("/api/transactions", {
      month,
      year,
    });
  },

  /**
   * Get all virtual transactions (not limited by time)
   */
  async getVirtualTransactions(): Promise<Transaction[]> {
    return httpClient.get<Transaction[]>("/api/transactions/virtual");
  },

  /**
   * Get all unresolved transactions (not limited by time)
   */
  async getUnresolvedTransactions(): Promise<Transaction[]> {
    return httpClient.get<Transaction[]>("/api/transactions/unresolved");
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

    const result = await httpClient.post<{ result: Transaction }>(
      "/api/transactions",
      requestData
    );
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

    const result = await httpClient.put<{ result: Transaction }>(
      "/api/transactions",
      requestData
    );
    return result.result;
  },

  /**
   * Delete transaction
   */
  async delete(id: string): Promise<void> {
    await httpClient.delete("/api/transactions", { id });
  },
};

/**
 * Assets API Client
 */
export const AssetsAPI = {
  /**
   * Get all assets
   */
  async getAll(): Promise<Asset[]> {
    const response = await fetch("/api/assets");
    if (!response.ok) {
      throw new Error("Failed to fetch assets");
    }
    return response.json();
  },

  /**
   * Create new asset
   */
  async create(data: AssetCreateData): Promise<Asset> {
    const response = await fetch("/api/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to create asset");
    }
    return result;
  },

  /**
   * Update asset
   */
  async update(data: AssetUpdateData): Promise<Asset> {
    const response = await fetch("/api/assets", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to update asset");
    }
    return result;
  },

  /**
   * Delete asset
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/assets?id=${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to delete asset");
    }
  },

  /**
   * Get asset portfolio summary
   */
  async getPortfolio(): Promise<AssetPortfolio[]> {
    const response = await fetch("/api/assets/portfolio");
    if (!response.ok) {
      throw new Error("Failed to fetch asset portfolio");
    }
    return response.json();
  },
};

/**
 * Conversions API Client
 */
export const ConversionsAPI = {
  /**
   * Get all conversions
   */
  async getAll(): Promise<AssetConversion[]> {
    const response = await fetch("/api/conversions");
    if (!response.ok) {
      throw new Error("Failed to fetch conversions");
    }
    return response.json();
  },

  /**
   * Get conversions by asset ID
   */
  async getByAsset(assetId: string): Promise<AssetConversion[]> {
    const response = await fetch(`/api/conversions?asset_id=${assetId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch conversions for asset");
    }
    return response.json();
  },

  /**
   * Get conversions by type
   */
  async getByType(type: "buy" | "sell"): Promise<AssetConversion[]> {
    const response = await fetch(`/api/conversions?type=${type}`);
    if (!response.ok) {
      throw new Error("Failed to fetch conversions by type");
    }
    return response.json();
  },

  /**
   * Create new conversion
   * This creates both a transaction and a conversion in one operation
   */
  async create(data: AssetConversionCreateData): Promise<AssetConversion> {
    // Convert created_at to UTC if provided
    const requestData = {
      ...data,
      created_at: data.created_at
        ? parseUserDateToUTC(data.created_at)
        : undefined,
    };

    const response = await fetch("/api/conversions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to create conversion");
    }
    return result;
  },

  /**
   * Delete conversion
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/conversions?id=${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to delete conversion");
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

// --- Learning Word ---
export interface LearningWord {
  id: string;
  word: string;
  phonetic?: string;
  meaning?: string;
  added_at: UTCString;
  study_dates?: string[];
  is_mastered?: boolean;
}

export interface LearningWordCreateData {
  word: string;
  phonetic?: string;
  meaning?: string;
}

// --- Story Session ---
export interface StorySession {
  id: string;
  created_at: UTCString;
  words: string; // JSON array of LearningWord ids
  story_text: string;
  submitted_at?: UTCString;
  status: "draft" | "submitted";
}

export interface StorySessionCreateData {
  words: string[]; // Mảng ID của các từ đã chọn
  story_text: string; // Nội dung truyện
  status?: "draft" | "submitted"; // Trạng thái, mặc định là draft
}

export const LearningWordsAPI = {
  /**
   * Get all learning words
   */
  async getAll(): Promise<LearningWord[]> {
    const response = await fetch("/api/words");
    if (!response.ok) {
      throw new Error("Failed to fetch learning words");
    }
    return response.json();
  },

  /**
   * Create new learning word
   */
  async create(data: LearningWordCreateData): Promise<LearningWord> {
    const response = await fetch("/api/words", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to create learning word");
    }
    return result.result;
  },
};

export const StoryAPI = {
  /**
   * Get all story sessions
   */
  async getAll(): Promise<StorySession[]> {
    const response = await fetch("/api/stories");
    if (!response.ok) {
      throw new Error("Failed to fetch story sessions");
    }
    return response.json();
  },

  /**
   * Create new story session
   */
  async create(data: StorySessionCreateData): Promise<StorySession> {
    const response = await fetch("/api/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to create story session");
    }
    return result.result;
  },
};

/**
 * Combined API client export
 */
export const API = {
  categories: CategoriesAPI,
  transactions: TransactionsAPI,
  stats: StatsAPI,
  assets: AssetsAPI,
  conversions: ConversionsAPI,
  buckets: BucketsAPI,
  words: LearningWordsAPI,
  stories: StoryAPI,
};

export default API;
