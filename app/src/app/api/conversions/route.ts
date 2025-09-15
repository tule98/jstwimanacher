import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

// GET /api/conversions - Lấy danh sách asset conversions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("asset_id");
    const conversionType = searchParams.get("type");

    const conversions = await databaseService.getAssetConversions({
      assetId: assetId || undefined,
      conversionType: conversionType as "buy" | "sell" | undefined,
    });

    return NextResponse.json(conversions);
  } catch (error) {
    console.error("Error fetching conversions:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversions" },
      { status: 500 }
    );
  }
}

// POST /api/conversions - Tạo asset conversion mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      assetId,
      amount,
      quantity,
      categoryId,
      note,
      conversionType,
      created_at,
    } = body;

    if (!assetId || !amount || !quantity || !categoryId || !conversionType) {
      return NextResponse.json(
        {
          error:
            "Asset ID, amount, quantity, category ID, and conversion type are required",
        },
        { status: 400 }
      );
    }

    if (!["buy", "sell"].includes(conversionType)) {
      return NextResponse.json(
        { error: 'Conversion type must be "buy" or "sell"' },
        { status: 400 }
      );
    }

    // Create transaction based on conversion type
    // For buy: negative amount (expense)
    // For sell: positive amount (income)
    const transactionAmount = amount;

    // Get asset name and unit for the note
    const asset = await databaseService.getAssetById(assetId);
    const assetName = asset ? asset.name : "tài sản";
    const assetUnit = asset ? asset.unit : "đơn vị";

    // Create the transaction
    const transaction = await databaseService.createTransaction({
      amount: transactionAmount,
      category_id: categoryId,
      note:
        note ||
        `${
          conversionType === "buy" ? "Mua" : "Bán"
        } ${quantity} ${assetUnit} ${assetName}`,
      created_at: created_at || undefined,
    });

    // Create the conversion
    const conversion = await databaseService.createAssetConversion({
      assetId,
      transactionId: transaction.id,
      conversionType,
      quantity,
    });

    // Get the full conversion with related data
    const conversions = await databaseService.getAssetConversions({
      assetId: conversion.asset_id,
    });

    const fullConversion = conversions.find((c) => c.id === conversion.id);
    if (!fullConversion) {
      throw new Error("Failed to retrieve created conversion");
    }

    return NextResponse.json(fullConversion, { status: 201 });
  } catch (error) {
    console.error("Error creating conversion:", error);
    return NextResponse.json(
      { error: "Failed to create conversion" },
      { status: 500 }
    );
  }
}

// DELETE /api/conversions - Xóa asset conversion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Conversion ID is required" },
        { status: 400 }
      );
    }

    await databaseService.deleteAssetConversion(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversion:", error);
    return NextResponse.json(
      { error: "Failed to delete conversion" },
      { status: 500 }
    );
  }
}
