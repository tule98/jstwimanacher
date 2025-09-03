import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "income" | "expense" | null;

    const categories = await databaseService.getAllCategories();

    if (type) {
      const filteredCategories = categories.filter((cat) => cat.type === type);
      return NextResponse.json(filteredCategories);
    } else {
      return NextResponse.json(categories);
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
    const { name, color, type = "expense" } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: "Tên danh mục và màu sắc là bắt buộc" },
        { status: 400 }
      );
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "Loại danh mục phải là 'income' hoặc 'expense'" },
        { status: 400 }
      );
    }

    const result = await databaseService.createCategory(name, color, type);
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
    const { id, name, color } = await request.json();

    if (!id || !name || !color) {
      return NextResponse.json(
        { error: "ID, tên danh mục và màu sắc là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await databaseService.updateCategory(id, name, color);

    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy danh mục" },
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
        { error: "ID danh mục là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await databaseService.deleteCategory(id);

    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy danh mục hoặc danh mục có giao dịch" },
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
