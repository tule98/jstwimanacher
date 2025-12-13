"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // User is authenticated, redirect to wordmaster
          router.push("/wordmaster");
        } else {
          // User is not authenticated, redirect to sign-in
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/sign-in");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
