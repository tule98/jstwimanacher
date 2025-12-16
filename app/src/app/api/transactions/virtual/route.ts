import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";
import {
  compose,
  withAuth,
  withLog,
  type RouteHandler,
} from "@/lib/route-handlers";

/**
 * API endpoint for virtual transactions
 * GET /api/transactions/virtual - Get all virtual transactions
 */
const baseGET: RouteHandler = async (request) => {
  try {
    const virtualTransactions = await databaseService.getVirtualTransactions();
    return NextResponse.json(virtualTransactions);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
};

export const GET = compose(withLog, withAuth)(baseGET);
