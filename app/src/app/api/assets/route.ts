import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

// GET /api/assets - Lấy danh sách tất cả assets
export async function GET() {
  try {
    const assets = await databaseService.getAssets();
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

// POST /api/assets - Tạo asset mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const asset = await databaseService.createAsset({
      name,
      color: color || "#6366f1",
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}

// PUT /api/assets - Cập nhật asset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    const asset = await databaseService.updateAsset(id, {
      name,
      color,
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

// DELETE /api/assets - Xóa asset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    await databaseService.deleteAsset(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
