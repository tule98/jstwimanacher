import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * POST /api/migration/add-streak - Run migration to add current_streak column
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirm } = body;

    if (confirm !== "yes") {
      return NextResponse.json(
        { error: "Please confirm migration by sending { confirm: 'yes' }" },
        { status: 400 }
      );
    }

    console.log(
      "🚀 Running migration: add current_streak column to habits table"
    );

    // Add the current_streak column
    await db.run(
      sql`ALTER TABLE habits ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0`
    );

    console.log("✅ Migration completed successfully!");

    return NextResponse.json({
      success: true,
      message:
        "Migration completed: current_streak column added to habits table",
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
