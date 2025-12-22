"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress, Container } from "@mui/material";
import { createBrowserClient } from "@/lib/supabase/client";
import { WordsFeed } from "./_components/WordsFeed";
import { WordmasterLayout } from "./_components/WordmasterLayout";
import { ContentInputModal } from "./_components/ContentInputModal";

/**
 * Wordmaster vocabulary learning page
 * Features: Interactive flashcard feed, word extraction, memory tracking
 */
export default function WordmasterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/sign-in");
          return;
        }

        setUserId(user.id);

        // Check if modal should be open from URL
        const openModal = searchParams.get("addWords") === "true";
        if (openModal) {
          setShowAddModal(true);
        }
      } catch (error) {
        console.error("Failed to get user:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "rgba(67, 24, 255, 0.6)" }} />
      </Box>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <WordmasterLayout
      userId={userId}
      onAddWordClick={() => setShowAddModal(true)}
      onLogout={handleLogout}
    >
      <Container maxWidth="md">
        <WordsFeed userId={userId} />
      </Container>

      {/* Add Words Modal */}
      <ContentInputModal
        userId={userId}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          // Reset badge after 2 seconds
          setTimeout(() => setShowAddModal(false), 1500);
        }}
      />
    </WordmasterLayout>
  );
}
