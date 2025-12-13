# Google OAuth Setup Guide

Your Next.js app is now configured to use Google OAuth with Supabase Auth! Follow these steps to complete the setup.

## ✅ What's Already Done

- ✓ Supabase client helpers (`@/lib/supabase/client.ts` and `@/lib/supabase/server.ts`)
- ✓ OAuth callback route handler at `/auth/callback`
- ✓ Sign-in page with Google OAuth button at `/sign-in`
- ✓ Required packages installed (`@supabase/ssr`, `@supabase/supabase-js`)

## 📋 Setup Steps

### 1. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → OAuth consent screen**

   - Choose **External** user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

4. Navigate to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-production-domain.com
     ```
   - Add **Authorized redirect URIs**:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     https://your-production-domain.com/auth/callback
     ```
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**

### 2. Configure Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication → Providers**
3. Find **Google** in the list and enable it
4. Paste your **Google Client ID** and **Google Client Secret**
5. Under **Site URL**, add:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
6. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```
7. Click **Save**

### 3. Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase Dashboard under **Settings → API**.

### 4. Test the Integration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/sign-in`

3. Click "Continue with Google"

4. You should be redirected to Google's OAuth consent screen

5. After authorizing, you'll be redirected back to your app at `/` (home page)

## 🔧 How It Works

1. **User clicks "Continue with Google"** → Calls `supabase.auth.signInWithOAuth()`
2. **Supabase redirects to Google** → User authenticates with Google
3. **Google redirects back** → To `/auth/callback?code=xxx`
4. **Callback handler processes the code** → Exchanges it for a session using `exchangeCodeForSession()`
5. **User is redirected** → To home page (`/`) with active session

## 🔐 Accessing User Session

### Client-side (React components)

```typescript
import { createBrowserClient } from "@/lib/supabase/client";

export function MyComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <div>{user ? `Hello ${user.email}` : "Not logged in"}</div>;
}
```

### Server-side (Server Components, API Routes)

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function MyServerComponent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <div>{user ? `Hello ${user.email}` : "Not logged in"}</div>;
}
```

## 🚨 Common Issues

### "Nothing happens when clicking Sign in with Google"

- **Cause**: Redirect URI mismatch
- **Fix**: Ensure URLs in Google Cloud Console match exactly with Supabase callback URLs

### "Invalid redirect URI error"

- **Cause**: Missing redirect URL in Google Cloud Console
- **Fix**: Add all possible redirect URLs (localhost + production) to Google OAuth Client

### "User not authenticated after redirect"

- **Cause**: Callback handler not exchanging code properly
- **Fix**: Check `/auth/callback/route.ts` is properly handling the OAuth code

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Setup Guide](https://support.google.com/cloud/answer/6158849)
- [Supabase Next.js Auth Guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs)

## 🎉 Next Steps

Once Google OAuth is working:

- Add sign-out functionality
- Protect routes with auth middleware
- Store additional user data in your database
- Add user profile page
- Implement role-based access control
