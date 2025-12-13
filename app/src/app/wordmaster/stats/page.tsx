/**
 * Statistics & Analytics Page
 *
 * Path: /wordmaster/stats
 *
 * Displays:
 * - Memory level distribution (pie chart)
 * - Review history (line chart)
 * - Daily streak & progress
 * - Learning insights
 */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Stack,
  Paper,
  Typography,
  Skeleton,
  Fab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  useMemoryDecayStats,
  useMemoryDecayStatus,
} from "@/hooks/useMemoryDecay";
import { useGetUserProfile } from "@/services/react-query/profile.hooks";
import StatsCards from "./_components/StatsCards";
import MemoryLevelChart from "./_components/MemoryLevelChart";
import DecayTrendChart from "./_components/DecayTrendChart";
import ReviewHistoryChart from "./_components/ReviewHistoryChart";
import LearningInsights from "./_components/LearningInsights";

export default function StatsPage() {
  const router = useRouter();
  const { data: profile } = useGetUserProfile();
  const { data: stats, isLoading: statsLoading } = useMemoryDecayStats(
    profile?.id
  );
  const { data: decayStatus, isLoading: decayLoading } = useMemoryDecayStatus();

  const memoryDistribution = useMemo(() => {
    if (!stats?.memoryLevelDistribution) return null;

    const { mastered, strong, average, weak, veryWeak } =
      stats.memoryLevelDistribution;

    return [
      {
        name: "Mastered",
        value: mastered.count,
        percentage: mastered.percentage,
        color: "#10B981", // Green
      },
      {
        name: "Strong",
        value: strong.count,
        percentage: strong.percentage,
        color: "#3B82F6", // Blue
      },
      {
        name: "Average",
        value: average.count,
        percentage: average.percentage,
        color: "#F59E0B", // Amber
      },
      {
        name: "Weak",
        value: weak.count,
        percentage: weak.percentage,
        color: "#EF4444", // Red
      },
      {
        name: "Very Weak",
        value: veryWeak.count,
        percentage: veryWeak.percentage,
        color: "#DC2626", // Dark Red
      },
    ];
  }, [stats]);

  const isLoading = statsLoading || decayLoading;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)",
        py: 2,
        px: 2,
        position: "relative",
        paddingTop: "80px", // Space for fixed header
      }}
    >
      {/* Fixed Header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background:
            "linear-gradient(180deg, rgba(67, 24, 255, 0.1) 0%, transparent 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 100,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: 64,
        }}
      >
        {/* Back Button FAB */}
        <Fab
          size="small"
          onClick={() => router.push("/wordmaster")}
          sx={{
            background: "linear-gradient(135deg, #4318FF 0%, #6B8AFF 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#FFFFFF",
            width: 44,
            height: 44,
            "&:hover": {
              background: "linear-gradient(135deg, #5629FF 0%, #7B9AFF 100%)",
              boxShadow: "0 8px 24px rgba(67, 24, 255, 0.3)",
            },
            transition: "all 300ms ease-out",
            flexShrink: 0,
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </Fab>

        {/* Header Title */}
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            background: "linear-gradient(90deg, #4318FF 0%, #6B8AFF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          📊 Analytics
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ maxWidth: 390, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4, pt: 0 }}>
          <Typography
            variant="h4"
            sx={{
              color: "#FFFFFF",
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: "28px", md: "32px" },
              letterSpacing: "-0.5px",
            }}
          >
            Learning Analytics
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Track your vocabulary progress and memory retention
          </Typography>
        </Box>

        {/* Quick Stats Cards */}
        <StatsCards
          stats={stats}
          decayStatus={decayStatus}
          isLoading={isLoading}
        />

        {/* Charts Section */}
        <Stack spacing={3} sx={{ mt: 2, pb: 4 }}>
          {/* Memory Level Distribution */}
          <Paper
            sx={{
              p: 3,
              borderRadius: "28px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
              transition: "all 300ms ease-out",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.18)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#FFFFFF",
                fontSize: "20px",
                letterSpacing: "-0.3px",
              }}
            >
              📈 Memory Distribution
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                height={280}
                sx={{
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              />
            ) : memoryDistribution ? (
              <MemoryLevelChart data={memoryDistribution} />
            ) : null}
          </Paper>

          {/* Daily Decay Trend */}
          <Paper
            sx={{
              p: 3,
              borderRadius: "28px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
              transition: "all 300ms ease-out",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.18)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#FFFFFF",
                fontSize: "20px",
                letterSpacing: "-0.3px",
              }}
            >
              📉 Decay Trend (7 Days)
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                height={280}
                sx={{
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              />
            ) : decayStatus ? (
              <DecayTrendChart data={decayStatus.lastSevenDays.history} />
            ) : null}
          </Paper>

          {/* Review History */}
          <Paper
            sx={{
              p: 3,
              borderRadius: "28px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
              transition: "all 300ms ease-out",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.18)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#FFFFFF",
                fontSize: "20px",
                letterSpacing: "-0.3px",
              }}
            >
              🔄 Review History (30 Days)
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                height={280}
                sx={{
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              />
            ) : (
              <ReviewHistoryChart />
            )}
          </Paper>

          {/* Learning Insights */}
          <Paper
            sx={{
              p: 3,
              borderRadius: "28px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
              transition: "all 300ms ease-out",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.18)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#FFFFFF",
                fontSize: "20px",
                letterSpacing: "-0.3px",
              }}
            >
              💡 Learning Insights
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.08)",
                }}
              />
            ) : (
              <LearningInsights stats={stats} />
            )}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
