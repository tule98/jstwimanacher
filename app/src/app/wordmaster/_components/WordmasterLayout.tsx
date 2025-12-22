"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Box, AppBar, IconButton } from "@mui/material";
import { BookOpen, BarChart3 } from "lucide-react";
import { BottomFABBar } from "./BottomFABBar";

interface WordmasterLayoutProps {
  children: ReactNode;
  userId: string;
  onAddWordClick: () => void;
  onLogout: () => Promise<void>;
}

/**
 * Layout wrapper for wordmaster pages
 * Contains header with navigation and bottom FAB bar
 */
export function WordmasterLayout({
  children,
  userId,
  onAddWordClick,
  onLogout,
}: WordmasterLayoutProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          width: "fit-content",
          left: "12px",
          top: 8,
          padding: "8px 16px",
          background:
            "linear-gradient(180deg, rgba(67, 24, 255, 0.1) 0%, transparent 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "none",
          zIndex: 100,
        }}
      >
        {/* Logo/Title */}
        <Box
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(90deg, #4318FF 0%, #6B8AFF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <BookOpen size={24} />
          Wordmaster
        </Box>
      </AppBar>

      {/* Action Buttons - Top Right */}
      <Box
        sx={{
          width: "fit-content",
          background:
            "linear-gradient(180deg, rgba(67, 24, 255, 0.1) 0%, transparent 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "none",
          borderRadius: "36px",
          display: "flex",
          position: "fixed",
          top: "8px",
          right: "12px",
          gap: 1,
          padding: "8px",
          zIndex: 101,
        }}
      >
        {/* Stats Button */}
        <Link href="/wordmaster/stats">
          <IconButton
            sx={{
              width: 32,
              height: 32,
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              transition: "all 200ms ease-out",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                transform: "scale(1.05)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            <BarChart3 size={16} />
          </IconButton>
        </Link>

        {/* Bottom FAB Bar Controls */}
        <BottomFABBar
          userId={userId}
          onAddWordClick={onAddWordClick}
          onLogout={onLogout}
        />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          paddingTop: "64px", // Account for fixed header
          background: "linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
