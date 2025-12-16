/**
 * Route handler utilities for composing API routes with middleware patterns
 * Provides HOC for authentication and error handling
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email?: string;
  };
}

export type RouteHandler = (
  request: AuthenticatedRequest
) => Promise<NextResponse>;

export type ErrorHandler = (error: unknown) => {
  status: number;
  message: string;
  details?: string;
};

/**
 * Creates a Supabase server client from the request
 */
export async function createSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {
          // Cookies are handled by the browser
        },
      },
    }
  );
}

/**
 * Default error handler
 */
export const defaultErrorHandler: ErrorHandler = (error) => {
  console.error("Route handler error:", error);

  if (error instanceof Error) {
    if (error.message.includes("Unauthorized")) {
      return { status: 401, message: "Unauthorized" };
    }
    if (error.message.includes("Not found")) {
      return { status: 404, message: "Not found" };
    }
    if (error.message.includes("Invalid")) {
      return { status: 400, message: "Bad request", details: error.message };
    }
  }

  return { status: 500, message: "Internal server error" };
};

/**
 * HOC that wraps a route handler with authentication
 * Injects authenticated user into request
 * Handles errors consistently
 */
export function withAuth(
  handler: RouteHandler,
  errorHandler: ErrorHandler = defaultErrorHandler
) {
  return async function authenticatedRouteHandler(
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      // Create Supabase client and verify authentication
      const supabase = await createSupabaseClient(request);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Attach user to request
      const authRequest = request as AuthenticatedRequest;
      authRequest.user = {
        id: user.id,
        email: user.email,
      };

      // Call handler with authenticated request
      return await handler(authRequest);
    } catch (error) {
      const errorInfo = errorHandler(error);

      return new NextResponse(
        JSON.stringify({
          message: errorInfo.message,
          ...(errorInfo.details && { details: errorInfo.details }),
        }),
        {
          status: errorInfo.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

/**
 * HOC for optional authentication (doesn't require user to be authenticated)
 * Injects user if authenticated, null otherwise
 */
export function withOptionalAuth(
  handler: (
    request: NextRequest,
    user: { id: string; email?: string } | null
  ) => Promise<NextResponse>,
  errorHandler: ErrorHandler = defaultErrorHandler
) {
  return async function optionalAuthRouteHandler(
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      // Create Supabase client and check authentication
      const supabase = await createSupabaseClient(request);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
          }
        : null;

      // Call handler with optional user
      return await handler(request, user);
    } catch (error) {
      const errorInfo = errorHandler(error);
      return new NextResponse(
        JSON.stringify({
          message: errorInfo.message,
          ...(errorInfo.details && { details: errorInfo.details }),
        }),
        {
          status: errorInfo.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

/**
 * HOC for request validation
 * Validates request body against provided schema
 */
export function withValidation<T>(
  schema: (data: unknown) => T,
  handler: (
    request: AuthenticatedRequest,
    validated: T
  ) => Promise<NextResponse>,
  errorHandler: ErrorHandler = defaultErrorHandler
) {
  return async function validatedRouteHandler(
    request: AuthenticatedRequest
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validated = schema(body);
      return await handler(request, validated);
    } catch (error) {
      const errorInfo = errorHandler(error);
      return new NextResponse(
        JSON.stringify({
          message: errorInfo.message,
          ...(errorInfo.details && { details: errorInfo.details }),
        }),
        {
          status: errorInfo.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

/**
 * Compose multiple HOCs in sequence
 * Usage: compose(
 *   (handler) => withAuth(handler),
 *   (handler) => withValidation(schema, handler)
 * )(actualHandler)
 */
export function compose(
  ...fns: Array<(handler: RouteHandler) => RouteHandler>
): (handler: RouteHandler) => (request: NextRequest) => Promise<NextResponse> {
  return (handler: RouteHandler) => {
    const composed = fns.reduceRight<RouteHandler>(
      (acc, fn) => fn(acc),
      handler
    );

    // Expose a NextRequest-compatible signature for Next typed route handlers
    return async function composedHandler(request: NextRequest) {
      return composed(request as AuthenticatedRequest);
    };
  };
}

/**
 * Utility: Truncate strings for logging
 */
function truncateForLog(input: string, max = 100): string {
  if (input.length <= max) return input;
  return input.slice(0, max) + "…";
}

/**
 * Utility: Safely read request body without consuming original stream
 */
async function readBodyPreview(request: NextRequest): Promise<string> {
  try {
    // Clone to avoid consuming the original body stream
    const cloned = request.clone();
    const text = await cloned.text();
    // Collapse whitespace to keep logs compact
    return truncateForLog(text.replace(/\s+/g, " ").trim());
  } catch {
    return "[unreadable body]";
  }
}

/**
 * Logs request query/body and truncated response for authenticated handlers
 * Use in compose(): compose(withLog, withAuth)(handler)
 */
export function withLog(handler: RouteHandler): RouteHandler {
  return async function loggedHandler(request: AuthenticatedRequest) {
    const start = Date.now();
    const method = request.method;
    const path = request.nextUrl.pathname;
    const query = request.nextUrl.searchParams.toString();
    const bodyPreview = await readBodyPreview(request);

    // Pre-log
    console.log(
      `[API] ${method} ${path}${query ? `?${query}` : ""} body=${bodyPreview}`
    );

    const response = await handler(request);

    let responsePreview = "";
    try {
      const cloned = response.clone();
      const text = await cloned.text();
      responsePreview = truncateForLog(text.replace(/\s+/g, " ").trim());
    } catch {
      responsePreview = "[unreadable response]";
    }

    const duration = Date.now() - start;
    console.log(
      `[API] ${method} ${path} -> ${response.status} in ${duration}ms res=${responsePreview}`
    );

    return response;
  };
}

/**
 * Logs request/response for plain NextRequest handlers
 * Useful for routes not using AuthenticatedRequest
 */
export function withLogRequest<ARGS extends unknown[] = []>(
  handler: (request: NextRequest, ...args: ARGS) => Promise<NextResponse>
) {
  return async function loggedNextHandler(
    request: NextRequest,
    ...args: ARGS
  ): Promise<NextResponse> {
    const start = Date.now();
    const method = request.method;
    const path = request.nextUrl.pathname;
    const query = request.nextUrl.searchParams.toString();
    const bodyPreview = await readBodyPreview(request);

    console.log(
      `[API] ${method} ${path}${query ? `?${query}` : ""} body=${bodyPreview}`
    );

    const response = await handler(request, ...args);

    let responsePreview = "";
    try {
      const text = await response.clone().text();
      responsePreview = truncateForLog(text.replace(/\s+/g, " ").trim());
    } catch {
      responsePreview = "[unreadable response]";
    }

    const duration = Date.now() - start;
    console.log(
      `[API] ${method} ${path} -> ${response.status} in ${duration}ms res=${responsePreview}`
    );

    return response;
  } as typeof handler;
}
