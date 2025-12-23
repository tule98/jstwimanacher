# Route Handler Composition Pattern - Quick Reference

## 📚 Overview

All Wordmaster API routes now use a **compose pattern with HOCs (Higher-Order Components)** for clean, maintainable code.

---

## 🚀 Quick Start

### Basic Authenticated Route

```typescript
import { NextResponse } from "next/server";
import { withAuth, type AuthenticatedRequest } from "@/lib/route-handlers";

async function handleMyEndpoint(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  const userId = request.user.id; // ✅ User is pre-authenticated
  const body = await request.json();

  // ... business logic

  return new NextResponse(JSON.stringify({ data: "result" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST = withAuth(handleMyEndpoint);
```

---

## 🔧 Available HOCs

### 1. `withAuth` - Enforce Authentication

```typescript
export const POST = withAuth(handleMyRoute);
```

- ✅ Verifies session
- ✅ Injects user into request
- ✅ Returns 401 if unauthorized
- ✅ Handles errors automatically

### 2. `withOptionalAuth` - Optional Authentication

```typescript
async function handler(request: NextRequest, user: User | null) {
  // user is null if not authenticated
}

export const POST = withOptionalAuth(handler);
```

- ✅ Checks auth but doesn't require it
- ✅ User context optional

### 3. `compose` - Chain Multiple HOCs

```typescript
export const POST = compose(
  (handler) => withAuth(handler),
  (handler) => withValidation(schema, handler),
  (handler) => withRateLimit(handler)
)(handleMyRoute);
```

---

## 📋 Request/Response Types

### AuthenticatedRequest

```typescript
interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string; // User ID from Supabase
    email?: string; // Optional email
  };
}
```

### ErrorHandler

```typescript
type ErrorHandler = (error: unknown) => {
  status: number; // HTTP status code
  message: string; // Error message
  details?: string; // Optional details
};
```

---

## 🎯 Usage Examples

### Example 1: Extract Words

```typescript
async function handleExtractWords(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  const { id: userId } = request.user;
  const { content } = await request.json();

  // Validate, extract, return

  return new NextResponse(JSON.stringify(preview), { status: 200 });
}

export const POST = withAuth(handleExtractWords);
```

### Example 2: Custom Error Handling

```typescript
const myErrorHandler: ErrorHandler = (error) => {
  if (error.message.includes("Not found")) {
    return { status: 404, message: "Resource not found" };
  }
  return { status: 500, message: "Internal error" };
};

export const POST = withAuth(handleMyRoute, myErrorHandler);
```

### Example 3: Public Endpoint (Optional Auth)

```typescript
async function handlePublicRoute(
  request: NextRequest,
  user: User | null
): Promise<NextResponse> {
  if (user) {
    // Personalized response
  } else {
    // Generic response
  }
}

export const GET = withOptionalAuth(handlePublicRoute);
```

---

## 🔐 Security Features

| Feature                | Benefit                        |
| ---------------------- | ------------------------------ |
| Automatic auth check   | Can't forget to authenticate   |
| Type-safe user access  | IDE catches errors             |
| Centralized validation | Consistent security            |
| User isolation         | Can't access other users' data |
| Error sanitization     | No info leakage                |

---

## ❌ Common Mistakes to Avoid

❌ **Don't**: Create Supabase client manually

```typescript
// ❌ Wrong - auth already handled by withAuth
const supabase = createServerClient(...);
const { data: { session } } = await supabase.auth.getSession();
```

✅ **Do**: Use pre-authenticated request

```typescript
// ✅ Right - user already available
const userId = request.user.id;
```

---

❌ **Don't**: Manually handle errors

```typescript
// ❌ Wrong - withAuth handles this
try {
  // ...
} catch (error) {
  return new NextResponse(JSON.stringify({ error }), { status: 500 });
}
```

✅ **Do**: Let HOC handle errors

```typescript
// ✅ Right - withAuth catches and formats errors
// Just throw errors, HOC will handle them
if (!valid) throw new Error("Invalid input");
```

---

❌ **Don't**: Check auth manually

```typescript
// ❌ Wrong - withAuth already checks
const { session } = await supabase.auth.getSession();
if (!session) return unauthorized();
```

✅ **Do**: Trust the HOC

```typescript
// ✅ Right - withAuth guarantees user exists
const userId = request.user.id; // Always available
```

---

## 📈 Code Reduction

Using composition pattern reduces code by **25-30%**:

| Route               | Before | After | Saved    |
| ------------------- | ------ | ----- | -------- |
| extract-words       | 160    | 117   | 43 (27%) |
| enrich-words        | 196    | 157   | 39 (20%) |
| add-extracted-words | 151    | 108   | 43 (28%) |

---

## 🔗 Related Files

- [lib/route-handlers.ts](lib/route-handlers.ts) - Main implementation
- [extract-words/route.ts](app/src/app/api/supabase/extract-words/route.ts) - Example usage
- [enrich-words/route.ts](app/src/app/api/supabase/enrich-words/route.ts) - Example usage
- [add-extracted-words/route.ts](app/src/app/api/supabase/add-extracted-words/route.ts) - Example usage

---

## 🚀 Ready to Use!

All Wordmaster API routes now follow this pattern. When adding new endpoints, follow the same structure for consistency.

For detailed implementation, see [REFACTORING_ROUTE_HANDLERS.md](REFACTORING_ROUTE_HANDLERS.md).
