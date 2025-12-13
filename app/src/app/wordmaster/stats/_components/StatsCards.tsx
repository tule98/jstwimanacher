/**
 * Stats Cards Component
 *
 * Displays quick overview metrics:
 * - Total words being learned
 * - Mastered words count & percentage
 * - Words needing review
 * - Daily streak
 */

import { Box, Paper, Typography, Skeleton, Stack } from "@mui/material";

interface StatsCardsProps {
  stats: any;
  decayStatus: any;
  isLoading: boolean;
}

export default function StatsCards({
  stats,
  decayStatus,
  isLoading,
}: StatsCardsProps) {
  const cards = [
    {
      label: "Total Words",
      value: stats?.decayMetrics?.totalWords ?? 0,
      subtext: "Being learned",
      icon: "📚",
      color: "#6B8AFF",
    },
    {
      label: "Mastered",
      value: stats?.memoryLevelDistribution?.mastered?.count ?? 0,
      subtext: `${
        stats?.memoryLevelDistribution?.mastered?.percentage ?? 0
      }% of total`,
      icon: "✅",
      color: "#10B981",
    },
    {
      label: "Need Review",
      value: stats?.decayMetrics?.eligibleForDecay ?? 0,
      subtext: "Not reviewed in 24h",
      icon: "⟲",
      color: "#F59E0B",
    },
    {
      label: "Reviewed Today",
      value: decayStatus?.today?.wordsReviewed ?? 0,
      subtext: "Words reviewed today",
      icon: "🔄",
      color: "#4318FF",
    },
  ];

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        mb: 4,
        flexWrap: "wrap",
        justifyContent: { xs: "center", sm: "flex-start" },
      }}
    >
      {cards.map((card, idx) => (
        <Paper
          key={idx}
          sx={{
            p: 3,
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 8px)",
              md: "1 1 calc(25% - 8px)",
            },
            minWidth: "140px",
            transition: "all 300ms ease-out",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.18)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              transform: "translateY(-2px)",
            },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative gradient corner */}
          <Box
            sx={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${card.color}30 0%, transparent 100%)`,
              zIndex: 0,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* Icon */}
            <Typography sx={{ fontSize: "32px", mb: 1.5 }}>
              {card.icon}
            </Typography>

            {/* Value */}
            {isLoading ? (
              <Skeleton width="70%" height={36} sx={{ mb: 1 }} />
            ) : (
              <Typography
                sx={{
                  fontWeight: 700,
                  color: card.color,
                  fontSize: "32px",
                  lineHeight: 1,
                  mb: 1,
                }}
              >
                {card.value}
              </Typography>
            )}

            {/* Label */}
            <Typography
              sx={{
                fontWeight: 600,
                color: "#FFFFFF",
                fontSize: "14px",
                mb: 0.5,
              }}
            >
              {card.label}
            </Typography>

            {/* Subtext */}
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "12px",
                lineHeight: 1.4,
              }}
            >
              {card.subtext}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
