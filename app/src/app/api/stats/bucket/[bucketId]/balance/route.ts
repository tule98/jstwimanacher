import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bucketId: string }> }
) {
  try {
    const { bucketId } = await params;

    if (!bucketId) {
      return NextResponse.json(
        { error: "Bucket ID is required" },
        { status: 400 }
      );
    }

    const balance = await databaseService.getBucketSummary(bucketId);
    return NextResponse.json(balance);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
