import { NextResponse } from "next/server";
import {
  compose,
  withAuth,
  withLog,
  type RouteHandler,
} from "@/lib/route-handlers";
import { wordmasterDb } from "@/services/wordmaster/supabase-client";

interface UpdateMemoryLevelBody {
  userWordId: string;
  memoryLevel: number;
}

const basePOST: RouteHandler = async (request) => {
  const body = (await request.json()) as UpdateMemoryLevelBody;
  const { userWordId, memoryLevel } = body;

  // Validate input
  if (!userWordId || typeof memoryLevel !== "number") {
    return NextResponse.json(
      { error: "userWordId and memoryLevel are required" },
      { status: 400 }
    );
  }

  // Validate memory level range (0-101)
  if (memoryLevel < 0 || memoryLevel > 101) {
    return NextResponse.json(
      { error: "Memory level must be between 0 and 101" },
      { status: 400 }
    );
  }

  try {
    const updatedUserWord = await wordmasterDb.updateUserWordMemory(
      userWordId,
      memoryLevel
    );

    if (!updatedUserWord) {
      return NextResponse.json(
        { error: "User word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        userWord: updatedUserWord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Failed to update memory level:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update memory level",
      },
      { status: 500 }
    );
  }
};

export const POST = compose(withLog, withAuth)(basePOST);
