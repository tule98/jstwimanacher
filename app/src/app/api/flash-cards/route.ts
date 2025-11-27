import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function GET() {
  try {
    const data = await databaseService.getFlashCards();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, meaning } = body;

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    if (!meaning || typeof meaning !== "string") {
      return NextResponse.json(
        { error: "Meaning is required" },
        { status: 400 }
      );
    }

    const flashCard = await databaseService.createFlashCard({
      word,
      meaning,
    });
    return NextResponse.json(flashCard);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
