---
applyTo: "**"
---

# Route Handlers: Auth + Logging Composition

These instructions standardize how to compose API route handlers with authentication and request/response logging. Use the helpers in `app/src/lib/route-handlers.ts` to ensure consistent behavior across all APIs.

## Core Concepts

- **withAuth**: Enforces authenticated access, injects `request.user`.
- **withLog**: Logs method, path, query string, request body (preview), response body (preview, max 100 chars), and duration.
- **withLogRequest**: Logging for plain Next.js `NextRequest` handlers (no `request.user`).
- **compose(...)**: Builds a wrapped handler by applying higher-order functions right-to-left.

Order matters: use `compose(withLog, withAuth)` so `withAuth` runs first and `withLog` wraps the result (outermost) to capture the final response status/body.

## Usage Patterns

### 1) Authenticated Handlers (Preferred)

For routes that require authentication and use `AuthenticatedRequest`:

```ts
import { NextResponse } from "next/server";
import {
  compose,
  withAuth,
  withLog,
  type RouteHandler,
} from "@/lib/route-handlers";

const baseGET: RouteHandler = async (request) => {
  // request.user is available here
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);

  // ... do work, return JSON
  return NextResponse.json({ page, userId: request.user.id });
};

export const GET = compose(withLog, withAuth)(baseGET);
```

Notes:

- Define a `base` handler typed as `RouteHandler` (it expects `AuthenticatedRequest`).
- Export wrapped consts (`export const GET = ...`) instead of named functions for clarity and consistency.

### 2) Public or Mixed-Auth Handlers

Use `withLogRequest` for routes that do not enforce auth or use `withOptionalAuth` if you need user info when available.

```ts
import { NextRequest, NextResponse } from "next/server";
import { withLogRequest, withOptionalAuth } from "@/lib/route-handlers";

export const GET = withLogRequest(async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  return NextResponse.json({ q });
});

// Optional auth example
export const POST = withLogRequest(async function POST(request: NextRequest) {
  const body = await request.json();
  // ... public logic or custom auth inside
  return NextResponse.json({ ok: true, body });
});
```

### 3) Validation + Auth + Logging

When validation is needed, chain using `compose()` (right-to-left application):

```ts
import {
  compose,
  withAuth,
  withLog,
  withValidation,
  type RouteHandler,
} from "@/lib/route-handlers";

function schema(input: unknown) {
  const data = input as { name?: string };
  if (!data.name) throw new Error("Invalid: name required");
  return { name: data.name };
}

const basePOST: RouteHandler = async (request) => {
  // body already validated by withValidation
  return NextResponse.json({ ok: true });
};

export const POST = compose(
  withLog,
  (h) => withValidation(schema, h),
  withAuth
)(basePOST);
```

## Logging Details

- **Query**: Derived from `request.nextUrl.searchParams`.
- **Body preview**: `request.clone().text()`; whitespace collapsed; truncated to 100 chars.
- **Response preview**: `response.clone().text()`; whitespace collapsed; truncated to 100 chars.
- **Duration**: Measured in milliseconds.

Example console lines:

```
[API] GET /api/items?page=2 body={"filter":"recent"}
[API] GET /api/items -> 200 in 14ms res={"items":[...]}
```

## Migration Guide

1. Replace named functions with wrapped const exports.
   - Before: `export async function GET(request: NextRequest) { ... }`
   - After: `export const GET = withLogRequest(async (request) => { ... });`
2. For authenticated routes, define a `base` handler typed as `RouteHandler` and export with `compose(withLog, withAuth)(base)`.
3. Keep request parsing in the base handler; wrappers will handle auth/logging.
4. Avoid reading the request body multiple times without cloning: wrappers already clone for logging.

## Examples in Repo

- Public logging: [app/src/app/api/habits/route.ts](app/src/app/api/habits/route.ts)
- Auth + logging: adapt pattern above (use `compose(withLog, withAuth)`)
- Timezone preference route (public log): [app/src/app/api/user/timezone/route.ts](app/src/app/api/user/timezone/route.ts)

## Best Practices

- Place `withLog` as the outermost wrapper via `compose(withLog, ...)`.
- Mask or omit secrets in responses; logging truncates to 100 chars but still avoid sensitive data.
- Prefer returning `NextResponse.json(...)` so response body is clonable and readable for logs.
- Keep handlers small and pure; push DB/service calls into `services/`.
- Use `withValidation` for schema validation to keep handlers clean.
