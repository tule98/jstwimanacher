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

      {/* Action Buttons */}
      <Box
        sx={{
          width: "fit-content",
          background:
            "linear-gradient(180deg, rgba(67, 24, 255, 0.1) 0%, transparent 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "none",
          borderRadius: "8px",
          display: "flex",
          position: "fixed",
          top: "8px",
          right: "12px",
          zIndex: 101,
        }}
      >
        {/* Stats Button */}
        <Link href="/wordmaster/stats">
          <IconButton
            sx={{
              borderColor: "#6B8AFF",
              color: "#6B8AFF",
              border: "1px solid #6B8AFF",
              borderRadius: "8px",
              "&:hover": {
                background: "rgba(107, 138, 255, 0.1)",
                borderColor: "#7B9AFF",
              },
            }}
          >
            <BarChart3 size={20} />
          </IconButton>
        </Link>
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

      {/* Bottom FAB Bar */}
      <BottomFABBar
        userId={userId}
        onAddWordClick={onAddWordClick}
        onLogout={onLogout}
      />
    </Box>
  );
}
