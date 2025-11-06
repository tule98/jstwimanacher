import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow verify-key endpoint to pass through (bootstrap endpoint for authentication)
  if (request.nextUrl.pathname === "/api/verify-key") {
    return NextResponse.next();
  }

  // Check if request is to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const apiKeyFromCookie = request.cookies.get("api_key")?.value;
    const apiKey = process.env.API_KEY;

    // Check if API_KEY is configured
    if (!apiKey) {
      console.error("API_KEY not configured in environment");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check if cookie exists
    if (!apiKeyFromCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate cookie value
    if (apiKeyFromCookie !== apiKey) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: "/api/:path*",
};
