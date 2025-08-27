import { NextResponse } from "next/server";
import { TransactionsService } from "@/services/googleSheets/googleSheetsService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (month && year) {
      // Nếu có tham số month và year, lấy transactions theo tháng
      const transactions = await TransactionsService.getByMonth(
        parseInt(month, 10),
        parseInt(year, 10)
      );
      return NextResponse.json(transactions);
    } else {
      // Nếu không có tham số, lấy tất cả transactions
      const transactions = await TransactionsService.getAll();
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
    const { amount, category_name, note } = await request.json();

    if (amount === undefined || !category_name) {
      return NextResponse.json(
        { error: "Số tiền và danh mục là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await TransactionsService.add(
      parseFloat(amount),
      category_name,
      note || ""
    );

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
    const { index, amount, category_name, note } = await request.json();

    if (index === undefined) {
      return NextResponse.json(
        { error: "Index của transaction là bắt buộc" },
        { status: 400 }
      );
    }

    // Chỉ cập nhật các trường được cung cấp
    const updateData: {
      amount?: number;
      category_name?: string;
      note?: string;
    } = {};

    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (category_name !== undefined) updateData.category_name = category_name;
    if (note !== undefined) updateData.note = note;

    const result = await TransactionsService.update(
      parseInt(index, 10),
      updateData
    );

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
    const index = searchParams.get("index");

    if (!index) {
      return NextResponse.json(
        { error: "Index của transaction là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await TransactionsService.delete(parseInt(index, 10));

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
