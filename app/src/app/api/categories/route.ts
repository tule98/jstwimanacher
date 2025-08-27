import { NextResponse } from "next/server";
import { CategoriesService } from "@/services/googleSheets/googleSheetsService";

export async function GET() {
  try {
    const categories = await CategoriesService.getAll();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: "Tên danh mục và màu sắc là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await CategoriesService.add(name, color);
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
    const { name, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: "Tên danh mục và màu sắc là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await CategoriesService.update(name, color);
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
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Tên danh mục là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await CategoriesService.delete(name);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
