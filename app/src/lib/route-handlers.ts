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
): (handler: RouteHandler) => RouteHandler {
  return (handler: RouteHandler) => {
    return fns.reduceRight((acc, fn) => fn(acc), handler);
  };
}
