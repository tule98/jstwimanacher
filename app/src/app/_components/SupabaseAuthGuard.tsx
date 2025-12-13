"use client";
import React, { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SupabaseAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const supabase = createBrowserClient();
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      setAuthenticated(hasSession);
      setLoading(false);
      if (!hasSession) {
        router.replace("/sign-in");
      }
    };
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const hasSession = !!session;
        setAuthenticated(hasSession);
        if (!hasSession) {
          router.replace("/sign-in");
        }
      }
    );
    void init();
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) return null;
  if (!authenticated) return null;
  return <>{children}</>;
}
