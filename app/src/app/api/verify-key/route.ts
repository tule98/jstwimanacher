import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    // Lấy key từ environment variable
    const protectionKey = process.env.PROTECTION_KEY;

    if (!protectionKey) {
      return NextResponse.json(
        { error: "Protection key not configured" },
        { status: 500 }
      );
    }

    if (key === protectionKey) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid key" }, { status: 401 });
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
