import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summaryFor = searchParams.get("summaryFor");

    if (summaryFor) {
      const summary = await databaseService.getBucketSummary(summaryFor);
      return NextResponse.json(summary);
    }

    const buckets = await databaseService.getBuckets();
    return NextResponse.json(buckets);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, is_default } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    const bucket = await databaseService.createBucket(name, !!is_default);
    return NextResponse.json({ success: true, bucket });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
