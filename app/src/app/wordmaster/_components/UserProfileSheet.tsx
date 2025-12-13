"use client";

import { Box, Stack, Button, Typography, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

interface UserProfileSheetProps {
  userId: string;
  onLogout: () => Promise<void>;
}

export function UserProfileSheet({ onLogout }: UserProfileSheetProps) {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
      } catch (error) {
        console.error("Failed to get user:", error);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={0} sx={{ padding: "24px" }}>
      {/* User Info Section */}
      <Box sx={{ marginBottom: "24px" }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "12px",
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          Account
        </Typography>

        <Box
          sx={{
            padding: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "12px",
              marginBottom: "4px",
            }}
          >
            Email
          </Typography>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 500,
              wordBreak: "break-all",
            }}
          >
            {email || "Loading..."}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 2 }} />

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="outlined"
        fullWidth
        sx={{
          borderColor: "#EF4444",
          color: "#EF4444",
          textTransform: "none",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 600,
          marginTop: "8px",
          "&:hover": {
            background: "rgba(239, 68, 68, 0.1)",
            borderColor: "#FF5555",
          },
          "&:disabled": {
            borderColor: "rgba(239, 68, 68, 0.5)",
            color: "rgba(239, 68, 68, 0.5)",
          },
        }}
      >
        {isLoading ? "Logging out..." : "🚪 Logout"}
      </Button>

      {/* Spacing for bottom padding on mobile */}
      <Box sx={{ height: "8px" }} />
    </Stack>
  );
}
