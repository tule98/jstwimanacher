import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    // Get key from environment variable
    const protectionKey = process.env.PROTECTION_KEY;
    const apiKey = process.env.API_KEY;

    if (!protectionKey) {
      return NextResponse.json(
        { error: "Protection key not configured" },
        { status: 500 }
      );
    }

    if (key === protectionKey) {
      // Create response with success
      const response = NextResponse.json({ success: true });

      // Set httpOnly cookie for API protection
      response.cookies.set({
        name: "api_key",
        value: apiKey,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
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
