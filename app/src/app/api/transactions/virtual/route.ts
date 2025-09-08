import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

/**
 * API endpoint for virtual transactions
 * GET /api/transactions/virtual - Get all virtual transactions
 */
export async function GET() {
  try {
    const virtualTransactions = await databaseService.getVirtualTransactions();
    return NextResponse.json(virtualTransactions);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
