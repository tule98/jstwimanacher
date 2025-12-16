import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";
import { toUTC } from "@/lib/timezone";
import {
  compose,
  withAuth,
  withLog,
  type RouteHandler,
} from "@/lib/route-handlers";

const baseGET: RouteHandler = async (request) => {
  try {
    const { searchParams } = request.nextUrl;
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const onlyUnresolved = searchParams.get("onlyUnresolved") === "true";
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const bucketIdsParam =
      searchParams.get("bucketIds") ?? searchParams.get("bucket_ids");
    const bucketIds = bucketIdsParam
      ? bucketIdsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    if (month && year) {
      const transactions = await databaseService.getTransactionsByMonth(
        parseInt(month, 10),
        parseInt(year, 10)
      );
      return NextResponse.json(transactions);
    } else {
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      const offsetNum = offset ? parseInt(offset, 10) : undefined;
      const transactions = await databaseService.getTransactions(
        limitNum,
        offsetNum,
        {
          onlyUnresolved,
          search,
          categoryId,
          bucketIds,
        }
      );
      return NextResponse.json(transactions);
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
};

export const GET = compose(withLog, withAuth)(baseGET);

const basePOST: RouteHandler = async (request) => {
  try {
    const {
      amount,
      category_id,
      note,
      is_resolved,
      created_at,
      bucket_id,
      bucket_ids,
    } = await request.json();

    if (amount === undefined || !category_id) {
      return NextResponse.json(
        { error: "Số tiền và danh mục là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await databaseService.createTransaction({
      amount: parseFloat(amount),
      category_id,
      bucket_id,
      bucket_ids:
        bucket_ids && Array.isArray(bucket_ids) ? bucket_ids : undefined,
      note,
      is_resolved: is_resolved ?? true,
      created_at: created_at ? toUTC(created_at) : undefined,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
};

export const POST = compose(withLog, withAuth)(basePOST);

const basePUT: RouteHandler = async (request) => {
  try {
    const {
      id,
      amount,
      category_id,
      note,
      is_resolved,
      created_at,
      bucket_id,
      bucket_ids,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID của transaction là bắt buộc" },
        { status: 400 }
      );
    }

    const updateData: {
      amount?: number;
      category_id?: string;
      bucket_id?: string | null;
      bucket_ids?: string[];
      note?: string;
      is_resolved?: boolean;
      created_at?: string;
    } = {};

    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (category_id !== undefined) updateData.category_id = category_id;
    if (bucket_id !== undefined) updateData.bucket_id = bucket_id;
    if (bucket_ids !== undefined && Array.isArray(bucket_ids))
      updateData.bucket_ids = bucket_ids;
    if (note !== undefined) updateData.note = note;
    if (is_resolved !== undefined) updateData.is_resolved = is_resolved;
    if (created_at !== undefined) updateData.created_at = toUTC(created_at);

    const result = await databaseService.updateTransaction(id, updateData);

    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy giao dịch" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
};

export const PUT = compose(withLog, withAuth)(basePUT);

const baseDELETE: RouteHandler = async (request) => {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID của transaction là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await databaseService.deleteTransaction(id);

    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy giao dịch" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
};

export const DELETE = compose(withLog, withAuth)(baseDELETE);
