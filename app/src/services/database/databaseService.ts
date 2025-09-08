import { db } from "@/db";
import {
  categories,
  transactions,
  type Category,
  type Transaction,
  type NewCategory,
  type NewTransaction,
} from "@/db/schema";
import { eq, desc, and, gte, lt, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { nowUTC, getMonthBoundsUTC, toUTC, UTCString } from "@/lib/timezone";

export class DatabaseService {
  // Categories methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(
    name: string,
    color: string,
    type: "expense" | "income" = "expense"
  ): Promise<Category> {
    const newCategory: NewCategory = {
      id: uuidv4(),
      name,
      color,
      type,
    };

    const result = await db.insert(categories).values(newCategory).returning();
    return result[0];
  }

  async updateCategory(
    id: string,
    name: string,
    color: string
  ): Promise<Category | null> {
    const result = await db
      .update(categories)
      .set({ name, color })
      .where(eq(categories.id, id))
      .returning();

    return result[0] || null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    // Check if category has transactions
    const existingTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.category_id, id))
      .limit(1);

    if (existingTransactions.length > 0) {
      throw new Error("Cannot delete category with existing transactions");
    }

    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowsAffected > 0;
  }

  // Transactions methods
  async getAllTransactions(): Promise<
    (Transaction & { category: Category })[]
  > {
    const result = await db
      .select()
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .orderBy(desc(transactions.created_at));

    return result.map((row) => ({
      ...row.transactions,
      category: row.categories!,
    }));
  }

  async getTransactions(
    limit?: number,
    offset?: number
  ): Promise<(Transaction & { category: Category })[]> {
    const baseQuery = db
      .select()
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .orderBy(desc(transactions.created_at));

    if (offset !== undefined) {
      baseQuery.offset(offset);
    }

    if (limit !== undefined) {
      baseQuery.limit(limit);
    }

    const result = await baseQuery;

    return result.map((row) => ({
      ...row.transactions,
      category: row.categories!,
    }));
  }

  async getTransactionsByMonth(
    month: number,
    year: number
  ): Promise<(Transaction & { category: Category })[]> {
    const { start, end } = getMonthBoundsUTC(month, year);

    const result = await db
      .select()
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(
        and(
          gte(transactions.created_at, start),
          lt(transactions.created_at, end)
        )
      )
      .orderBy(desc(transactions.created_at));

    return result.map((row) => ({
      ...row.transactions,
      category: row.categories!,
    }));
  }

  async createTransaction(data: {
    amount: number;
    category_id: string;
    note?: string;
    is_virtual?: boolean;
    created_at?: string | UTCString;
  }): Promise<Transaction> {
    const now = nowUTC();
    const newTransaction: NewTransaction = {
      id: uuidv4(),
      amount: Math.round(data.amount),
      category_id: data.category_id,
      note: data.note,
      created_at: data.created_at ? toUTC(data.created_at) : now,
      updated_at: now,
      is_resolved: true,
      is_virtual: data.is_virtual || false,
    };

    const result = await db
      .insert(transactions)
      .values(newTransaction)
      .returning();
    return result[0];
  }

  async updateTransaction(
    id: string,
    data: Partial<{
      amount: number;
      category_id: string;
      note: string;
      is_resolved: boolean;
      is_virtual: boolean;
      created_at: string | UTCString;
    }>
  ): Promise<Transaction | null> {
    const updateData: Partial<NewTransaction> = {
      updated_at: nowUTC(),
    };

    if (data.amount !== undefined) {
      updateData.amount = Math.round(data.amount);
    }
    if (data.category_id !== undefined) {
      updateData.category_id = data.category_id;
    }
    if (data.note !== undefined) {
      updateData.note = data.note;
    }
    if (data.is_resolved !== undefined) {
      updateData.is_resolved = data.is_resolved;
    }
    if (data.is_virtual !== undefined) {
      updateData.is_virtual = data.is_virtual;
    }
    if (data.created_at !== undefined) {
      updateData.created_at = toUTC(data.created_at);
    }

    const result = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    return result[0] || null;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.rowsAffected > 0;
  }

  // Get all virtual transactions (not limited by time)
  async getVirtualTransactions(): Promise<
    (Transaction & { category: Category })[]
  > {
    const result = await db
      .select()
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(eq(transactions.is_virtual, true))
      .orderBy(desc(transactions.created_at));

    return result.map((row) => ({
      ...row.transactions,
      category: row.categories!,
    }));
  }

  // Statistics methods
  async getCategoryStats(
    month: number,
    year: number
  ): Promise<
    {
      category_name: string;
      category_id: string;
      total: number;
      percentage: number;
      color: string;
    }[]
  > {
    const { start, end } = getMonthBoundsUTC(month, year);

    const result = await db
      .select({
        category_id: categories.id,
        category_name: categories.name,
        color: categories.color,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(
        and(
          gte(transactions.created_at, start),
          lt(transactions.created_at, end),
          eq(categories.type, "expense")
        )
      )
      .groupBy(categories.id, categories.name, categories.color);

    const totalAmount = result.reduce((sum, item) => sum + item.total, 0);

    return result.map((item) => ({
      category_name: item.category_name || "Unknown",
      category_id: item.category_id || "",
      total: item.total,
      percentage: totalAmount > 0 ? (item.total / totalAmount) * 100 : 0,
      color: item.color || "#000000",
    }));
  }

  async getMonthlyBalance(
    month: number,
    year: number
  ): Promise<{
    income_real: number;
    income_virtual: number;
    income: number;
    expense_real: number;
    expense_virtual: number;
    expense: number;
    balance: number;
  }> {
    const { start, end } = getMonthBoundsUTC(month, year);

    // Get real transactions for the specific month
    const realResult = await db
      .select({
        type: categories.type,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(
        and(
          gte(transactions.created_at, start),
          lt(transactions.created_at, end),
          eq(transactions.is_virtual, false)
        )
      )
      .groupBy(categories.type);

    // Get virtual transactions (all time, not limited by month)
    const virtualResult = await db
      .select({
        type: categories.type,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(eq(transactions.is_virtual, true))
      .groupBy(categories.type);

    let income_real = 0;
    let expense_real = 0;
    let income_virtual = 0;
    let expense_virtual = 0;

    // Process real transactions
    realResult.forEach((item) => {
      const amount = item.total || 0;
      if (item.type === "income") {
        income_real += amount;
      } else if (item.type === "expense") {
        expense_real += amount;
      }
    });

    // Process virtual transactions
    virtualResult.forEach((item) => {
      const amount = item.total || 0;
      if (item.type === "income") {
        income_virtual += amount;
      } else if (item.type === "expense") {
        expense_virtual += amount;
      }
    });

    const income_total = income_real + income_virtual;
    const expense_total = expense_real + expense_virtual;

    return {
      income_real,
      income_virtual,
      income: income_total,
      expense_real,
      expense_virtual,
      expense: expense_total,
      balance: income_total - expense_total,
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
