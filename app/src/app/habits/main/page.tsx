"use client";
import React from "react";
import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { Calendar, BarChart3, Settings, Flame } from "lucide-react";
import AppPageLayout from "@/app/_components/AppPageLayout";
import AppPageNav from "@/app/_components/AppPageNav";

const navigationCards = [
  {
    title: "Today",
    description: "Track your daily habits",
    icon: Flame,
    color: "#FFB01D",
    path: "/habits/today",
  },
  {
    title: "Stats",
    description: "View your progress and analytics",
    icon: BarChart3,
    color: "#4158D0",
    path: "/habits/stats",
  },
  {
    title: "Settings",
    description: "Manage archived habits and tokens",
    icon: Settings,
    color: "#6B7280",
    path: "/habits/settings",
  },
];

export default function HabitsMainPage() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <AppPageLayout
      header={
        <AppPageNav
          title="Habits"
          icon={<Calendar size={24} color={isDark ? "#5B7AFF" : "#4158D0"} />}
        />
      }
    >
      <Box sx={{ padding: "16px", paddingBottom: "80px" }}>
        <Typography
          sx={{
            fontSize: "28px",
            fontWeight: 700,
            color: theme.palette.text.primary,
            marginBottom: "8px",
          }}
        >
          Build Better Habits
        </Typography>

        <Typography
          sx={{
            fontSize: "16px",
            color: theme.palette.text.secondary,
            marginBottom: "32px",
          }}
        >
          Track your daily routines, build streaks, and achieve your goals
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navigationCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card
                key={card.path}
                onClick={() => router.push(card.path)}
                sx={{
                  cursor: "pointer",
                  borderRadius: "16px",
                  boxShadow: isDark ? "none" : "0px 1px 3px rgba(0, 0, 0, 0.1)",
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.05)"
                    : "none",
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  transition: "all 0.2s ease-out",
                  "&:hover": {
                    boxShadow: isDark
                      ? "none"
                      : "0px 4px 12px rgba(0, 0, 0, 0.15)",
                    backgroundColor: isDark ? "#334155" : "#FFFFFF",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                <CardContent sx={{ padding: "20px !important" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "12px",
                        backgroundColor: `${card.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={28} color={card.color} />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "20px",
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          marginBottom: "4px",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {card.description}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "#F9FAFB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "20px",
                        }}
                      >
                        →
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Feature Highlights */}
        <Box sx={{ marginTop: "40px" }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: theme.palette.text.secondary,
              marginBottom: "16px",
              letterSpacing: "0.5px",
            }}
          >
            FEATURES
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              {
                emoji: "✅",
                title: "Single-Tap Check-off",
                description: "Mark habits complete with one tap",
              },
              {
                emoji: "🔥",
                title: "Streak Tracking",
                description: "Build momentum with consecutive completions",
              },
              {
                emoji: "😊",
                title: "Mood Recording",
                description: "Track how you feel after each habit",
              },
              {
                emoji: "🛡️",
                title: "Streak Freeze Tokens",
                description: "Protect your streaks on tough days",
              },
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "#F9FAFB",
                }}
              >
                <Typography sx={{ fontSize: "32px" }}>
                  {feature.emoji}
                </Typography>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </AppPageLayout>
  );
}
