import { db } from "@/db";
import {
  categories,
  transactions,
  buckets,
  transactionBuckets,
  assets,
  assetConversions,
  habits,
  habitJournalEntries,
  habitCompletions,
  streakFreezeTokens,
  tokenUsageLog,
  flashCards,
  type Category,
  type Transaction,
  type Bucket,
  type Asset,
  type AssetConversion,
  type NewCategory,
  type NewTransaction,
  type NewBucket,
  type NewAsset,
  type NewAssetConversion,
  type NewTransactionBucket,
  type Habit,
  type NewHabit,
  type HabitJournalEntry,
  type HabitCompletion,
  type NewHabitCompletion,
  type StreakFreezeToken,
  type NewStreakFreezeToken,
  type TokenUsageLog,
  type NewTokenUsageLog,
  type FlashCard,
  type NewFlashCard,
} from "@/db/schema";
import {
  eq,
  desc,
  asc,
  and,
  gte,
  lt,
  lte,
  sql,
  like,
  inArray,
} from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { nowUTC, getMonthBoundsUTC, toUTC, UTCString } from "@/lib/timezone";

type TransactionWithCategoryAndBuckets = Transaction & {
  category: Category;
  buckets: Bucket[];
};

export class DatabaseService {
  // Categories methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

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
    offset?: number,
    options?: {
      onlyUnresolved?: boolean;
      onlyVirtual?: boolean;
      search?: string;
      categoryId?: string;
      bucketIds?: string[];
    }
  ): Promise<TransactionWithCategoryAndBuckets[]> {
    const conditions = [];

    // Add filter conditions
    if (options?.onlyUnresolved) {
      conditions.push(eq(transactions.is_resolved, false));
    }

    if (options?.onlyVirtual) {
      conditions.push(eq(transactions.is_virtual, true));
    }

    // Add search condition
    if (options?.search && options.search.trim() !== "") {
      conditions.push(like(transactions.note, `%${options.search}%`));
    }

    // Add category filter
    if (options?.categoryId && options.categoryId !== "all") {
      conditions.push(eq(transactions.category_id, options.categoryId));
    }
    // New: filter by multiple bucket IDs via transaction_buckets join
    const bucketIds = options?.bucketIds?.filter((id) => id);
    const useBucketIds = Boolean(bucketIds && bucketIds.length > 0);
    if (useBucketIds && bucketIds) {
      conditions.push(inArray(transactionBuckets.bucket_id, bucketIds));
    }

    let query = db
      .select({
        transaction: transactions,
        category: categories,
        transactionBucket: transactionBuckets,
        bucket: buckets,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .leftJoin(
        transactionBuckets,
        eq(transactionBuckets.transaction_id, transactions.id)
      )
      .leftJoin(buckets, eq(transactionBuckets.bucket_id, buckets.id))
      .orderBy(desc(transactions.created_at))
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const result = await query;

    const transactionsMap = new Map<
      string,
      TransactionWithCategoryAndBuckets
    >();

    for (const row of result) {
      const transaction = row.transaction;
      if (!transaction) continue;

      const category = row.category;

      if (!category) continue;

      let existing = transactionsMap.get(transaction.id);
      if (!existing) {
        existing = {
          ...transaction,
          category,
          buckets: [],
        };
        transactionsMap.set(transaction.id, existing);
      }

      const bucket = row.bucket;
      if (bucket && !existing.buckets.some((b) => b.id === bucket.id)) {
        existing.buckets.push(bucket);
      }
    }

    return Array.from(transactionsMap.values());
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
    bucket_id?: string | null;
    bucket_ids?: string[]; // New field for multiple buckets
    note?: string;
    is_virtual?: boolean;
    is_resolved?: boolean;
    created_at?: string | UTCString;
  }): Promise<Transaction> {
    const now = nowUTC();

    // Determine which bucket IDs to use
    let bucketIdsToAssign: string[] = [];

    // If bucket_ids is provided (new way), use it
    if (data.bucket_ids && data.bucket_ids.length > 0) {
      bucketIdsToAssign = data.bucket_ids;
    } else if (data.bucket_id) {
      // If bucket_id is provided (old way), use it
      bucketIdsToAssign = [data.bucket_id];
    } else {
      // If no bucket specified, try to use default bucket
      const defaultBucket = await db
        .select()
        .from(buckets)
        .where(eq(buckets.is_default, true))
        .limit(1);
      if (defaultBucket && defaultBucket.length > 0) {
        bucketIdsToAssign = [defaultBucket[0].id];
      }
    }

    const newTransaction: NewTransaction = {
      id: uuidv4(),
      amount: Math.round(data.amount),
      category_id: data.category_id,
      bucket_id: bucketIdsToAssign[0] || undefined, // Keep for backward compatibility
      note: data.note,
      created_at: data.created_at ? toUTC(data.created_at) : now,
      updated_at: now,
      is_resolved: data.is_resolved ?? true,
      is_virtual: data.is_virtual || false,
    };

    const result = await db
      .insert(transactions)
      .values(newTransaction)
      .returning();

    const createdTransaction = result[0];

    // Create transaction bucket associations
    if (bucketIdsToAssign.length > 0) {
      const transactionBucketRecords = bucketIdsToAssign.map((bucketId) => ({
        id: uuidv4(),
        transaction_id: createdTransaction.id,
        bucket_id: bucketId,
        created_at: now,
        updated_at: now,
      }));

      await db.insert(transactionBuckets).values(transactionBucketRecords);
    }

    return createdTransaction;
  }

  async updateTransaction(
    id: string,
    data: Partial<{
      amount: number;
      category_id: string;
      bucket_id: string | null;
      bucket_ids?: string[]; // New field for multiple buckets
      note: string;
      is_resolved: boolean;
      is_virtual: boolean;
      created_at: string | UTCString;
    }>
  ): Promise<Transaction | null> {
    const now = nowUTC();
    const updateData: Partial<NewTransaction> = {
      updated_at: now,
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

    // Handle bucket_ids - update transaction_buckets table
    if (data.bucket_ids !== undefined) {
      // Delete existing associations
      await db
        .delete(transactionBuckets)
        .where(eq(transactionBuckets.transaction_id, id));

      // Create new associations
      if (data.bucket_ids.length > 0) {
        const transactionBucketRecords = data.bucket_ids.map((bucketId) => ({
          id: uuidv4(),
          transaction_id: id,
          bucket_id: bucketId,
          created_at: now,
          updated_at: now,
        }));
        await db.insert(transactionBuckets).values(transactionBucketRecords);
      }

      // Update bucket_id field with first bucket for backward compatibility
      updateData.bucket_id =
        data.bucket_ids.length > 0 ? data.bucket_ids[0] : null;
    } else if (data.bucket_id !== undefined) {
      // Old way - single bucket_id
      updateData.bucket_id = data.bucket_id;

      // Also update transaction_buckets table
      await db
        .delete(transactionBuckets)
        .where(eq(transactionBuckets.transaction_id, id));
      if (data.bucket_id) {
        const record: NewTransactionBucket = {
          id: uuidv4(),
          transaction_id: id,
          bucket_id: data.bucket_id,
          created_at: now,
          updated_at: now,
        };
        await db.insert(transactionBuckets).values(record);
      }
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

  // Transaction Buckets methods
  async getTransactionBuckets(transactionId: string): Promise<Bucket[]> {
    const result = await db
      .select({
        bucket: buckets,
      })
      .from(transactionBuckets)
      .leftJoin(buckets, eq(transactionBuckets.bucket_id, buckets.id))
      .where(eq(transactionBuckets.transaction_id, transactionId));

    return result
      .filter((row) => row.bucket !== null)
      .map((row) => row.bucket!);
  }

  async setTransactionBuckets(
    transactionId: string,
    bucketIds: string[]
  ): Promise<void> {
    const now = nowUTC();

    // Delete existing associations
    await db
      .delete(transactionBuckets)
      .where(eq(transactionBuckets.transaction_id, transactionId));

    // Create new associations
    if (bucketIds.length > 0) {
      const records = bucketIds.map((bucketId) => ({
        id: uuidv4(),
        transaction_id: transactionId,
        bucket_id: bucketId,
        created_at: now,
        updated_at: now,
      }));
      await db.insert(transactionBuckets).values(records);
    }
  }

  // Buckets methods
  async getBuckets(): Promise<Bucket[]> {
    const result = await db
      .select()
      .from(buckets)
      .orderBy(desc(buckets.created_at));
    return result;
  }

  async createBucket(
    name: string,
    is_default: boolean = false
  ): Promise<Bucket> {
    // If creating as default, unset other defaults
    if (is_default) {
      await db.update(buckets).set({ is_default: false });
    }

    const newBucket: NewBucket = {
      id: uuidv4(),
      name,
      is_default,
      created_at: nowUTC(),
      updated_at: nowUTC(),
    };

    const result = await db.insert(buckets).values(newBucket).returning();
    return result[0];
  }

  async getDefaultBucket(): Promise<Bucket | null> {
    const result = await db
      .select()
      .from(buckets)
      .where(eq(buckets.is_default, true))
      .limit(1);
    return result[0] || null;
  }

  async getBucketSummary(
    bucketId: string
  ): Promise<{ income: number; expense: number }> {
    const result = await db
      .select({
        type: categories.type,
        total: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactionBuckets)
      .leftJoin(
        transactions,
        eq(transactionBuckets.transaction_id, transactions.id)
      )
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(eq(transactionBuckets.bucket_id, bucketId))
      .groupBy(categories.type);

    let income = 0;
    let expense = 0;

    result.forEach((row) => {
      const amount = row.total || 0;
      if (row.type === "income") {
        income += amount;
      } else if (row.type === "expense") {
        expense += amount;
      }
    });

    return { income, expense };
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
          lt(transactions.created_at, end)
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

  // Assets methods
  async getAssets(): Promise<Asset[]> {
    return await db.select().from(assets).orderBy(desc(assets.created_at));
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const result = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);
    return result[0] || null;
  }

  async createAsset(data: {
    name: string;
    color?: string;
    unit?: string;
  }): Promise<Asset> {
    const newAsset: NewAsset = {
      id: uuidv4(),
      name: data.name,
      color: data.color || "#6366f1",
      unit: data.unit || "đơn vị",
      created_at: nowUTC(),
    };

    const result = await db.insert(assets).values(newAsset).returning();
    return result[0];
  }

  async updateAsset(
    id: string,
    data: Partial<{
      name: string;
      color: string;
      unit: string;
    }>
  ): Promise<Asset | null> {
    const result = await db
      .update(assets)
      .set(data)
      .where(eq(assets.id, id))
      .returning();

    return result[0] || null;
  }

  async deleteAsset(id: string): Promise<boolean> {
    // Check if asset has conversions
    const existingConversions = await db
      .select()
      .from(assetConversions)
      .where(eq(assetConversions.asset_id, id))
      .limit(1);

    if (existingConversions.length > 0) {
      throw new Error("Cannot delete asset with existing conversions");
    }

    const result = await db.delete(assets).where(eq(assets.id, id));
    return result.rowsAffected > 0;
  }

  // Asset Conversions methods
  async getAssetConversions(filters?: {
    assetId?: string;
    conversionType?: "buy" | "sell";
  }): Promise<
    (AssetConversion & {
      asset: Asset;
      transaction: Transaction & { category: Category };
    })[]
  > {
    // Build where conditions
    const conditions = [];

    if (filters?.assetId) {
      conditions.push(eq(assetConversions.asset_id, filters.assetId));
    }

    if (filters?.conversionType) {
      conditions.push(
        eq(assetConversions.conversion_type, filters.conversionType)
      );
    }

    const baseQuery = db
      .select()
      .from(assetConversions)
      .leftJoin(assets, eq(assetConversions.asset_id, assets.id))
      .leftJoin(
        transactions,
        eq(assetConversions.transaction_id, transactions.id)
      )
      .leftJoin(categories, eq(transactions.category_id, categories.id));

    const query =
      conditions.length > 0
        ? baseQuery.where(
            conditions.length === 1 ? conditions[0] : and(...conditions)
          )
        : baseQuery;

    const result = await query.orderBy(desc(assetConversions.created_at));

    return result.map((row) => ({
      ...row.asset_conversions,
      asset: row.assets!,
      transaction: {
        ...row.transactions!,
        category: row.categories!,
      },
    }));
  }

  async createAssetConversion(data: {
    assetId: string;
    transactionId: string;
    conversionType: "buy" | "sell";
    quantity: number;
  }): Promise<AssetConversion> {
    const newConversion: NewAssetConversion = {
      id: uuidv4(),
      asset_id: data.assetId,
      transaction_id: data.transactionId,
      conversion_type: data.conversionType,
      quantity: data.quantity,
      created_at: nowUTC(),
      updated_at: nowUTC(),
    };

    const result = await db
      .insert(assetConversions)
      .values(newConversion)
      .returning();

    return result[0];
  }

  async deleteAssetConversion(id: string): Promise<boolean> {
    const result = await db
      .delete(assetConversions)
      .where(eq(assetConversions.id, id));

    return result.rowsAffected > 0;
  }

  // Get assets portfolio summary
  async getAssetPortfolio(): Promise<
    {
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
    }[]
  > {
    const result = await db
      .select({
        asset_id: assets.id,
        asset_name: assets.name,
        asset_color: assets.color,
        asset_unit: assets.unit,
        conversion_type: assetConversions.conversion_type,
        transaction_amount: transactions.amount,
        quantity: assetConversions.quantity,
      })
      .from(assets)
      .leftJoin(assetConversions, eq(assets.id, assetConversions.asset_id))
      .leftJoin(
        transactions,
        eq(assetConversions.transaction_id, transactions.id)
      )
      .where(
        and(
          eq(transactions.is_resolved, true),
          eq(transactions.is_virtual, false)
        )
      );

    // Group and calculate portfolio data
    const portfolioMap = new Map<
      string,
      {
        asset_id: string;
        asset_name: string;
        asset_color: string;
        buy_count: number;
        sell_count: number;
        total_invested: number;
        total_received: number;
        total_quantity: number;
        unit: string;
      }
    >();

    result.forEach((row) => {
      if (!row.asset_id) return;

      const key = row.asset_id;
      if (!portfolioMap.has(key)) {
        portfolioMap.set(key, {
          asset_id: row.asset_id,
          asset_name: row.asset_name,
          asset_color: row.asset_color,
          buy_count: 0,
          sell_count: 0,
          total_invested: 0,
          total_received: 0,
          total_quantity: 0,
          unit: row.asset_unit || "đơn vị", // Get unit from asset
        });
      }

      const portfolio = portfolioMap.get(key)!;

      if (row.conversion_type === "buy") {
        portfolio.buy_count++;
        portfolio.total_invested += Math.abs(row.transaction_amount || 0);
        portfolio.total_quantity += row.quantity || 0;
      } else if (row.conversion_type === "sell") {
        portfolio.sell_count++;
        portfolio.total_received += Math.abs(row.transaction_amount || 0);
        portfolio.total_quantity -= row.quantity || 0;
      }
    });

    return Array.from(portfolioMap.values()).map((portfolio) => ({
      ...portfolio,
      current_status:
        portfolio.total_quantity > 0 ? "owned" : ("sold" as "owned" | "sold"),
    }));
  }

  // Heatmap methods
  async getHeatmapData(
    year: number,
    month?: number
  ): Promise<{ date: string; totalSpent: number }[]> {
    let startDate: Date;
    let endDate: Date;

    if (month !== undefined) {
      // Get data for a specific month
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
    } else {
      // Get data for entire year
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    }

    const startUTC = toUTC(startDate);
    const endUTC = toUTC(endDate);

    // Query transactions grouped by date
    const result = await db
      .select({
        date: sql<string>`DATE(${transactions.created_at})`.as("date"),
        totalSpent:
          sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE ${transactions.amount} END), 0)`.as(
            "totalSpent"
          ),
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.created_at, startUTC),
          lt(transactions.created_at, endUTC)
        )
      )
      .groupBy(sql`DATE(${transactions.created_at})`)
      .orderBy(sql`DATE(${transactions.created_at})`);

    return result;
  }

  // Habits methods
  async getHabits(
    includeEntries: boolean = true,
    month?: number,
    year?: number
  ): Promise<(Habit & { entries?: HabitJournalEntry[] })[]> {
    const result = await db
      .select()
      .from(habits)
      .where(and(eq(habits.status, "active"), eq(habits.is_archived, false)))
      .orderBy(asc(habits.order), desc(habits.created_at));
    if (!includeEntries) return result;

    // Calculate date range for journal entries
    let startStr: string;
    let endStr: string;

    if (month !== undefined && year !== undefined) {
      // Get entries for specific month/year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      startStr = startDate.toISOString().slice(0, 10);
      endStr = endDate.toISOString().slice(0, 10);
    } else {
      // Default to current month if not specified
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startStr = startDate.toISOString().slice(0, 10);
      endStr = endDate.toISOString().slice(0, 10);
    }

    const entries = await db
      .select()
      .from(habitJournalEntries)
      .where(
        and(
          gte(habitJournalEntries.entry_date, startStr),
          lte(habitJournalEntries.entry_date, endStr)
        )
      );

    return result.map((h) => ({
      ...h,
      entries: entries.filter((e) => e.habit_id === h.id),
    }));
  }

  async createHabit(data: {
    name: string;
    description?: string;
    frequency_type?: "daily" | "custom";
    frequency_days?: number[]; // 0-6 for days of week
    start_date?: string;
  }): Promise<Habit> {
    const newHabit: NewHabit = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      status: "active",
      frequency_type: data.frequency_type || "daily",
      frequency_days: data.frequency_days
        ? JSON.stringify(data.frequency_days)
        : null,
      start_date: data.start_date || new Date().toISOString().slice(0, 10),
      is_archived: false,
      created_at: nowUTC(),
      updated_at: nowUTC(),
    };
    const result = await db.insert(habits).values(newHabit).returning();
    return result[0];
  }

  async updateHabit(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      status: string;
      frequency_type: "daily" | "custom";
      frequency_days: number[];
    }>
  ): Promise<Habit | null> {
    const updateData: Partial<NewHabit> = {
      updated_at: nowUTC(),
    };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.status !== undefined)
      updateData.status = data.status as Habit["status"];
    if (data.frequency_type !== undefined)
      updateData.frequency_type = data.frequency_type;
    if (data.frequency_days !== undefined)
      updateData.frequency_days = JSON.stringify(data.frequency_days);

    const result = await db
      .update(habits)
      .set(updateData)
      .where(eq(habits.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteHabit(id: string): Promise<boolean> {
    // delete journal entries first (on cascade not set)
    await db
      .delete(habitJournalEntries)
      .where(eq(habitJournalEntries.habit_id, id));
    const result = await db.delete(habits).where(eq(habits.id, id));
    return result.rowsAffected > 0;
  }

  async updateHabitOrder(id: string, order: number): Promise<Habit | null> {
    const result = await db
      .update(habits)
      .set({ order })
      .where(eq(habits.id, id))
      .returning();
    return result[0] || null;
  }

  async archiveHabit(id: string): Promise<Habit | null> {
    const result = await db
      .update(habits)
      .set({ is_archived: true, updated_at: nowUTC() })
      .where(eq(habits.id, id))
      .returning();
    return result[0] || null;
  }

  async unarchiveHabit(id: string): Promise<Habit | null> {
    const result = await db
      .update(habits)
      .set({ is_archived: false, updated_at: nowUTC() })
      .where(eq(habits.id, id))
      .returning();
    return result[0] || null;
  }

  async getArchivedHabits(): Promise<Habit[]> {
    return await db
      .select()
      .from(habits)
      .where(eq(habits.is_archived, true))
      .orderBy(desc(habits.updated_at));
  }

  // Helper method to calculate and update streak for a habit
  private async updateHabitStreak(habitId: string): Promise<void> {
    // Get the habit
    const habit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, habitId))
      .limit(1);

    if (habit.length === 0) return;

    const habitData = habit[0];
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date(habitData.start_date);

    // Get all completions for this habit
    const completions = await db
      .select()
      .from(habitCompletions)
      .where(eq(habitCompletions.habit_id, habitId))
      .orderBy(desc(habitCompletions.completion_date));

    // Get token usage dates
    const tokenUsages = await db
      .select()
      .from(tokenUsageLog)
      .where(eq(tokenUsageLog.habit_id, habitId));

    const tokenUsedDates = tokenUsages.map((t) => t.freeze_date);

    const frequencyDays = habitData.frequency_days
      ? JSON.parse(habitData.frequency_days)
      : null;

    let streak = 0;
    const currentDate = new Date(today);

    // Helper function to check if habit is scheduled for a date
    const isScheduledForDate = (date: Date): boolean => {
      if (habitData.frequency_type === "daily") return true;
      if (!frequencyDays || frequencyDays.length === 0) return false;
      const dayOfWeek = date.getDay();
      return frequencyDays.includes(dayOfWeek);
    };

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      return date.toISOString().slice(0, 10);
    };

    // Check if today is scheduled and completed
    if (isScheduledForDate(currentDate)) {
      const todayCompletion = completions.find(
        (c) => c.completion_date === formatDate(currentDate)
      );
      if (todayCompletion) {
        streak++;
      }
    }

    // Go back day by day to count streak
    currentDate.setDate(currentDate.getDate() - 1);

    while (currentDate >= startDate) {
      const dateStr = formatDate(currentDate);

      if (!isScheduledForDate(currentDate)) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }

      const hasCompletion = completions.some(
        (c) => c.completion_date === dateStr
      );
      const hasToken = tokenUsedDates.includes(dateStr);

      if (hasCompletion || hasToken) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Update the habit's streak
    await db
      .update(habits)
      .set({ current_streak: streak, updated_at: nowUTC() })
      .where(eq(habits.id, habitId));
  }

  // Habit Completions methods
  async completeHabit(
    habitId: string,
    completionDate: string,
    moodEmoji?: string
  ): Promise<HabitCompletion> {
    const existing = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habit_id, habitId),
          eq(habitCompletions.completion_date, completionDate)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing completion
      const result = await db
        .update(habitCompletions)
        .set({ mood_emoji: moodEmoji, updated_at: nowUTC() })
        .where(eq(habitCompletions.id, existing[0].id))
        .returning();

      // Update streak after completion
      await this.updateHabitStreak(habitId);

      return result[0];
    }

    // Create new completion
    const newCompletion: NewHabitCompletion = {
      id: uuidv4(),
      habit_id: habitId,
      completion_date: completionDate,
      mood_emoji: moodEmoji,
      completed_at: nowUTC(),
      created_at: nowUTC(),
      updated_at: nowUTC(),
    };
    const result = await db
      .insert(habitCompletions)
      .values(newCompletion)
      .returning();

    // Update streak after completion
    await this.updateHabitStreak(habitId);

    return result[0];
  }

  async uncompleteHabit(
    habitId: string,
    completionDate: string
  ): Promise<boolean> {
    const result = await db
      .delete(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habit_id, habitId),
          eq(habitCompletions.completion_date, completionDate)
        )
      );

    // Update streak after uncompletion
    if (result.rowsAffected > 0) {
      await this.updateHabitStreak(habitId);
    }

    return result.rowsAffected > 0;
  }

  async getHabitCompletions(
    habitId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HabitCompletion[]> {
    const conditions = [eq(habitCompletions.habit_id, habitId)];

    if (startDate && endDate) {
      conditions.push(
        gte(habitCompletions.completion_date, startDate),
        lte(habitCompletions.completion_date, endDate)
      );
    }

    return await db
      .select()
      .from(habitCompletions)
      .where(and(...conditions))
      .orderBy(desc(habitCompletions.completion_date));
  }

  async getAllCompletionsInRange(
    startDate: string,
    endDate: string
  ): Promise<HabitCompletion[]> {
    return await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          gte(habitCompletions.completion_date, startDate),
          lte(habitCompletions.completion_date, endDate)
        )
      )
      .orderBy(desc(habitCompletions.completion_date));
  }

  // Streak Freeze Token methods
  async getOrCreateMonthlyTokens(
    month: number,
    year: number,
    userId: string = "default_user"
  ): Promise<StreakFreezeToken> {
    const existing = await db
      .select()
      .from(streakFreezeTokens)
      .where(
        and(
          eq(streakFreezeTokens.user_id, userId),
          eq(streakFreezeTokens.month, month),
          eq(streakFreezeTokens.year, year)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new token record for the month
    const newTokens: NewStreakFreezeToken = {
      id: uuidv4(),
      user_id: userId,
      total_tokens: 2,
      used_tokens: 0,
      month,
      year,
      created_at: nowUTC(),
      updated_at: nowUTC(),
    };
    const result = await db
      .insert(streakFreezeTokens)
      .values(newTokens)
      .returning();
    return result[0];
  }

  async useStreakFreezeToken(
    habitId: string,
    freezeDate: string,
    userId: string = "default_user"
  ): Promise<{ success: boolean; message: string }> {
    const date = new Date(freezeDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const tokens = await this.getOrCreateMonthlyTokens(month, year, userId);

    if (tokens.used_tokens >= tokens.total_tokens) {
      return { success: false, message: "No tokens available for this month" };
    }

    // Check if token already used for this habit on this date
    const existingUsage = await db
      .select()
      .from(tokenUsageLog)
      .where(
        and(
          eq(tokenUsageLog.habit_id, habitId),
          eq(tokenUsageLog.freeze_date, freezeDate)
        )
      )
      .limit(1);

    if (existingUsage.length > 0) {
      return {
        success: false,
        message: "Token already used for this habit on this date",
      };
    }

    // Log the token usage
    const newUsage: NewTokenUsageLog = {
      id: uuidv4(),
      habit_id: habitId,
      freeze_date: freezeDate,
      used_at: nowUTC(),
      token_record_id: tokens.id,
    };
    await db.insert(tokenUsageLog).values(newUsage);

    // Increment used tokens
    await db
      .update(streakFreezeTokens)
      .set({ used_tokens: tokens.used_tokens + 1, updated_at: nowUTC() })
      .where(eq(streakFreezeTokens.id, tokens.id));

    // Update streak after using token (token protects the streak)
    await this.updateHabitStreak(habitId);

    return { success: true, message: "Streak freeze token used successfully" };
  }

  async getTokenUsageForHabit(habitId: string): Promise<TokenUsageLog[]> {
    return await db
      .select()
      .from(tokenUsageLog)
      .where(eq(tokenUsageLog.habit_id, habitId))
      .orderBy(desc(tokenUsageLog.freeze_date));
  }

  async getCurrentMonthTokens(
    userId: string = "default_user"
  ): Promise<StreakFreezeToken> {
    const now = new Date();
    return await this.getOrCreateMonthlyTokens(
      now.getMonth() + 1,
      now.getFullYear(),
      userId
    );
  }

  // Flash Cards methods
  async getFlashCards(): Promise<FlashCard[]> {
    return await db
      .select()
      .from(flashCards)
      .orderBy(desc(flashCards.created_at));
  }

  async getFlashCard(id: string): Promise<FlashCard | null> {
    const result = await db
      .select()
      .from(flashCards)
      .where(eq(flashCards.id, id))
      .limit(1);
    return result[0] || null;
  }

  async createFlashCard(data: {
    word: string;
    phonetic?: string;
    meaning: string;
    example?: string;
  }): Promise<FlashCard> {
    const newCard: NewFlashCard = {
      id: uuidv4(),
      word: data.word,
      phonetic: data.phonetic,
      meaning: data.meaning,
      example: data.example,
      status: "not_learned",
      created_at: nowUTC(),
      updated_at: nowUTC(),
    };
    const result = await db.insert(flashCards).values(newCard).returning();
    return result[0];
  }

  async updateFlashCard(
    id: string,
    data: Partial<{
      word: string;
      phonetic: string;
      meaning: string;
      example: string;
      status: string;
    }>
  ): Promise<FlashCard | null> {
    const updateData: Partial<NewFlashCard> = {
      updated_at: nowUTC(),
    };
    if (data.word !== undefined) updateData.word = data.word;
    if (data.phonetic !== undefined) updateData.phonetic = data.phonetic;
    if (data.meaning !== undefined) updateData.meaning = data.meaning;
    if (data.example !== undefined) updateData.example = data.example;
    if (data.status !== undefined)
      updateData.status = data.status as FlashCard["status"];

    const result = await db
      .update(flashCards)
      .set(updateData)
      .where(eq(flashCards.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteFlashCard(id: string): Promise<boolean> {
    const result = await db.delete(flashCards).where(eq(flashCards.id, id));
    return result.rowsAffected > 0;
  }

  async migrateLegacyTransactionBuckets(options?: { dryRun?: boolean }) {
    const dryRun = options?.dryRun ?? true;

    const candidates = await db
      .select({
        transactionId: transactions.id,
        bucketId: transactions.bucket_id,
      })
      .from(transactions)
      .leftJoin(
        transactionBuckets,
        and(
          eq(transactionBuckets.transaction_id, transactions.id),
          eq(transactionBuckets.bucket_id, transactions.bucket_id)
        )
      )
      .where(
        sql`${transactions.bucket_id} IS NOT NULL AND ${transactionBuckets.id} IS NULL`
      );

    const rows = candidates
      .filter((row) => Boolean(row.bucketId))
      .map((row) => ({
        transactionId: row.transactionId,
        bucketId: row.bucketId as string,
      }));

    if (!dryRun && rows.length > 0) {
      const now = nowUTC();
      await db.insert(transactionBuckets).values(
        rows.map((row) => ({
          id: uuidv4(),
          transaction_id: row.transactionId,
          bucket_id: row.bucketId,
          created_at: now,
          updated_at: now,
        }))
      );
    }

    return {
      dryRun,
      candidates: rows.length,
      inserted: dryRun ? 0 : rows.length,
      records: rows,
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
