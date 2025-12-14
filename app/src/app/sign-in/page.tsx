"use client";
import React, { useCallback, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button, Card, CardContent, Typography } from "@mui/material";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const handleGoogle = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });
    if (error) {
      console.error("OAuth error:", error);
    }
    setLoading(false);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card sx={{ p: (t) => t.spacing(4), borderRadius: (t) => t.spacing(2) }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: (t) => t.spacing(3),
          }}
        >
          <Typography variant="h5">Sign in to continue</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
