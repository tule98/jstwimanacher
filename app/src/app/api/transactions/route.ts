import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";
import { toUTC } from "@/lib/timezone";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (month && year) {
      // Nếu có tham số month và year, lấy transactions theo tháng
      const transactions = await databaseService.getTransactionsByMonth(
        parseInt(month, 10),
        parseInt(year, 10)
      );
      return NextResponse.json(transactions);
    } else {
      // Nếu không có tham số month/year, lấy transactions với limit và offset tùy chọn
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      const offsetNum = offset ? parseInt(offset, 10) : undefined;
      const transactions = await databaseService.getTransactions(
        limitNum,
        offsetNum
      );
      return NextResponse.json(transactions);
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { amount, category_id, note, is_virtual, created_at } =
      await request.json();

    if (amount === undefined || !category_id) {
      return NextResponse.json(
        { error: "Số tiền và danh mục là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await databaseService.createTransaction({
      amount: parseFloat(amount),
      category_id,
      note,
      is_virtual: is_virtual || false,
      created_at: created_at ? toUTC(created_at) : undefined,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const {
      id,
      amount,
      category_id,
      note,
      is_resolved,
      is_virtual,
      created_at,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID của transaction là bắt buộc" },
        { status: 400 }
      );
    }

    // Chỉ cập nhật các trường được cung cấp
    const updateData: {
      amount?: number;
      category_id?: string;
      note?: string;
      is_resolved?: boolean;
      is_virtual?: boolean;
      created_at?: string;
    } = {};

    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (category_id !== undefined) updateData.category_id = category_id;
    if (note !== undefined) updateData.note = note;
    if (is_resolved !== undefined) updateData.is_resolved = is_resolved;
    if (is_virtual !== undefined) updateData.is_virtual = is_virtual;
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
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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
}
