import { NextResponse } from "next/server";
import {
  assessDataMigration,
  runFullMigration,
  validateMigration,
  backupData,
} from "@/lib/migration";

/**
 * API endpoint cho data migration to UTC
 * GET /api/migration - Assess current data
 * POST /api/migration - Execute migration
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "assess":
        const report = await assessDataMigration();
        return NextResponse.json(report);

      case "validate":
        const validation = await validateMigration();
        return NextResponse.json(validation);

      case "backup":
        await backupData();
        return NextResponse.json({
          success: true,
          message: "Backup completed",
        });

      default:
        // Default: return assessment
        const defaultReport = await assessDataMigration();
        return NextResponse.json(defaultReport);
    }
  } catch (error) {
    console.error("Migration API error:", error);
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, executeForReal } = await request.json();

    if (action === "migrate") {
      const result = await runFullMigration(executeForReal === true);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'migrate'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Migration execution error:", error);
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
