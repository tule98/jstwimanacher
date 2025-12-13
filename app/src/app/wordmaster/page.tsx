"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function WordmasterPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        return setEmail(data.user?.email ?? null);
      })
      .catch(() => setEmail(null));
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.replace("/sign-in");
  }, [router]);

  return (
    <div className="p-4">
      <Card sx={{ p: (t) => t.spacing(3), borderRadius: (t) => t.spacing(2) }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: (t) => t.spacing(2),
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <div>
              <Typography variant="h5">Wordmaster</Typography>
              <Typography variant="body2" color="text.secondary">
                Supabase-authenticated module scaffold. Build features here.
              </Typography>
            </div>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleSignOut}
              disabled={loading}
            >
              Sign out
            </Button>
          </Stack>
          <Divider />
          <Typography variant="body2" color="text.secondary">
            Signed in as {email ?? "loading..."}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
