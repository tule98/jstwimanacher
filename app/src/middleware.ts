import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isLocalhost = (hostname: string) => {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
};

export async function middleware(request: NextRequest) {
  // Auth routes: handle Supabase cookies but don't require authentication
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return await handleAuthRoute(request);
  }
  // Supabase-prefixed API: verify via Supabase session, bypass api_key
  if (request.nextUrl.pathname.startsWith("/api/supabase/")) {
    return await handleSupabaseRoute(request);
  }
  // Allow verify-key endpoint to pass through (bootstrap endpoint for authentication)
  if (request.nextUrl.pathname === "/api/verify-key") {
    return NextResponse.next();
  }

  // Allow cron endpoints to pass through (Vercel Cron verification handled internally)
  if (request.nextUrl.pathname.startsWith("/api/cron/")) {
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
    if (!apiKeyFromCookie && !isLocalhost(request.nextUrl.hostname)) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate cookie value
    if (apiKeyFromCookie !== apiKey && !isLocalhost(request.nextUrl.hostname)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

async function handleAuthRoute(request: NextRequest) {
  const { createServerClient } = await import("@supabase/ssr");

  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          } catch {
            // Handle errors during cookie setting
          }
        },
      },
    }
  );

  // Refresh session for cookie management but don't require auth
  await supabase.auth.getUser();

  return response;
}

async function handleSupabaseRoute(request: NextRequest) {
  const { createServerClient } = await import("@supabase/ssr");

  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          } catch {
            // Handle errors during cookie setting
          }
        },
      },
    }
  );

  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ["/api/:path*", "/auth/:path*"],
};
