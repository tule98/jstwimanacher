import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get all unresolved transactions regardless of time
    const unresolvedTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        category_id: transactions.category_id,
        note: transactions.note,
        created_at: transactions.created_at,
        updated_at: transactions.updated_at,
        is_resolved: transactions.is_resolved,
        is_virtual: transactions.is_virtual,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          type: categories.type,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.category_id, categories.id))
      .where(eq(transactions.is_resolved, false))
      .orderBy(transactions.created_at);

    return NextResponse.json(unresolvedTransactions);
  } catch (error) {
    console.error("Error fetching unresolved transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch unresolved transactions" },
      { status: 500 }
    );
  }
}
