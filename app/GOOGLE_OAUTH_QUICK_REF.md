# Google OAuth Integration - Quick Reference

## ✅ Integration Complete

Your app now has Google OAuth fully integrated using Supabase Auth!

### Files Created/Updated

1. **[src/app/sign-in/page.tsx](src/app/sign-in/page.tsx)** - Enhanced sign-in page with error handling
2. **[src/app/auth/callback/route.ts](src/app/auth/callback/route.ts)** - OAuth callback handler (already existed)
3. **[src/app/auth/auth-code-error/page.tsx](src/app/auth/auth-code-error/page.tsx)** - Enhanced error page
4. **[src/lib/supabase/client.ts](src/lib/supabase/client.ts)** - Browser client (already existed)
5. **[src/lib/supabase/server.ts](src/lib/supabase/server.ts)** - Server client (already existed)
6. **[src/lib/auth-utils.ts](src/lib/auth-utils.ts)** - NEW: Auth utility functions
7. **[src/hooks/useAuth.ts](src/hooks/useAuth.ts)** - NEW: React auth hook
8. **[src/components/UserProfile.tsx](src/components/UserProfile.tsx)** - NEW: Example component

### Documentation

- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Complete setup guide with step-by-step instructions

## 🚀 Quick Start

### 1. Complete the Setup

Follow the instructions in [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) to:

1. Configure Google Cloud Console OAuth credentials
2. Enable Google provider in Supabase Dashboard
3. Ensure environment variables are set

### 2. Use in Your Components

**Client-side with hook:**

```tsx
import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return (
    <div>
      <p>Hello {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

**Server-side in Server Components:**

```tsx
import { getCurrentUserServer } from "@/lib/auth-utils";

export default async function MyServerComponent() {
  const user = await getCurrentUserServer();

  if (!user) return <div>Not signed in</div>;

  return <div>Hello {user.email}</div>;
}
```

**Server-side in API Routes:**

```tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ user });
}
```

## 📋 Available Auth Functions

### Client-side (`@/lib/auth-utils`)

- `signOut()` - Sign out and redirect to sign-in page
- `getCurrentUser()` - Get current user or null
- `isAuthenticated()` - Check if user is authenticated

### Server-side (`@/lib/auth-utils`)

- `getCurrentUserServer()` - Get current user in Server Components
- `isAuthenticatedServer()` - Check auth status server-side

### React Hook (`@/hooks/useAuth`)

```tsx
const { user, loading, signOut } = useAuth();
```

- `user` - Current user object or null
- `loading` - Loading state boolean
- `signOut` - Function to sign out

## 🔐 User Data Structure

Google OAuth provides these user fields:

```typescript
{
  id: string; // Unique user ID
  email: string; // User's email
  user_metadata: {
    full_name: string; // Full name from Google
    avatar_url: string; // Profile picture URL
    email: string; // Email (duplicate)
    email_verified: boolean; // Always true for Google
    iss: string; // Issuer
    name: string; // Full name
    picture: string; // Avatar URL (duplicate)
    provider_id: string; // Google user ID
    sub: string; // Subject identifier
  }
  app_metadata: {
    provider: "google";
    providers: ["google"];
  }
  created_at: string; // ISO timestamp
}
```

## 🎨 UI Components

### Sign In Button (Standalone)

```tsx
import { createBrowserClient } from "@/lib/supabase/client";

function SignInButton() {
  const handleSignIn = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return <button onClick={handleSignIn}>Sign in with Google</button>;
}
```

### User Profile Component

Use the example in [src/components/UserProfile.tsx](src/components/UserProfile.tsx)

```tsx
import { UserProfile } from "@/components/UserProfile";

export default function MyPage() {
  return <UserProfile />;
}
```

## 🛡️ Protecting Routes

### Option 1: Middleware (Recommended)

Your app already has middleware at [src/middleware.ts](src/middleware.ts) that handles `/api/supabase/*` routes.

To protect additional routes, extend it:

```typescript
export const config = {
  matcher: [
    "/api/supabase/:path*",
    "/protected/:path*", // Add protected routes
    "/dashboard/:path*",
  ],
};
```

### Option 2: Client-side Protection

```tsx
"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

### Option 3: Server-side Protection

```tsx
import { getCurrentUserServer } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/sign-in");
  }

  return <div>Protected content</div>;
}
```

## 🧪 Testing Checklist

- [ ] Google Cloud Console OAuth client created
- [ ] Client ID and Secret added to Supabase
- [ ] Redirect URIs configured in both Google and Supabase
- [ ] Environment variables set in `.env.local`
- [ ] Test sign-in flow on localhost
- [ ] Verify user data is accessible after sign-in
- [ ] Test sign-out functionality
- [ ] Test error page at `/auth/auth-code-error`
- [ ] Deploy to production and update URLs
- [ ] Test production sign-in flow

## 🔗 Navigation Flow

```
User visits → /sign-in
User clicks button → Google OAuth screen
User authorizes → Redirected to /auth/callback?code=xxx
Callback exchanges code → Session created
User redirected → / (home)

If error occurs → /auth/auth-code-error
```

## 📚 Related Documentation

- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Detailed setup instructions
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router Auth](https://supabase.com/docs/guides/auth/quickstarts/nextjs)

## ❓ Common Questions

**Q: Can I add other OAuth providers?**
A: Yes! Follow the same pattern for GitHub, Facebook, etc.

**Q: How do I store additional user data?**
A: Create a `profiles` table and use Supabase database triggers or API to sync.

**Q: How long do sessions last?**
A: Sessions auto-refresh and last indefinitely until sign-out.

**Q: Can I customize the redirect after sign-in?**
A: Yes! Use the `next` query parameter: `/sign-in?next=/dashboard`

**Q: How do I handle user roles/permissions?**
A: Use Supabase Row Level Security (RLS) policies or custom claims.
