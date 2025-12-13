/**
 * Learning Insights Component
 *
 * Displays actionable insights and recommendations
 * based on learning statistics and patterns
 */

import { Box, Paper, Typography, LinearProgress, Chip } from "@mui/material";

interface InsightCardProps {
  icon: string;
  title: string;
  description: string;
  action: string;
  color: string;
}

function InsightCard({
  icon,
  title,
  description,
  action,
  color,
}: InsightCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderLeft: `4px solid ${color}`,
        background: `${color}08`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Typography variant="h5">{icon}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {description}
          </Typography>
          <Chip label={action} size="small" variant="outlined" />
        </Box>
      </Box>
    </Paper>
  );
}

interface DecayMetrics {
  totalWords?: number;
  eligibleForDecay?: number;
}

interface MemoryBucket {
  count?: number;
}

interface MemoryDistribution {
  mastered?: MemoryBucket;
  veryWeak?: MemoryBucket;
}

interface LearningStats {
  decayMetrics?: DecayMetrics;
  memoryLevelDistribution?: MemoryDistribution;
}

interface LearningInsightsProps {
  stats: LearningStats | null;
}

export default function LearningInsights({ stats }: LearningInsightsProps) {
  if (!stats) {
    return null;
  }

  const totalWords = stats.decayMetrics?.totalWords ?? 0;
  const masteredCount = stats.memoryLevelDistribution?.mastered?.count ?? 0;
  const weakCount = stats.memoryLevelDistribution?.veryWeak?.count ?? 0;
  const eligibleForDecay = stats.decayMetrics?.eligibleForDecay ?? 0;

  const masteredPercentage =
    totalWords > 0 ? (masteredCount / totalWords) * 100 : 0;
  const decayPercentage =
    totalWords > 0 ? (eligibleForDecay / totalWords) * 100 : 0;

  // Generate insights based on data
  const insights: InsightCardProps[] = [];

  // Insight 1: Mastery progress
  if (masteredPercentage < 30) {
    insights.push({
      icon: "📚",
      title: "Keep learning!",
      description: `You've mastered ${masteredCount} words (${Math.round(
        masteredPercentage
      )}%). Continue reviewing to reach mastery on more words.`,
      action: "Start reviewing",
      color: "#3B82F6",
    });
  } else if (masteredPercentage < 70) {
    insights.push({
      icon: "🎯",
      title: "Great progress!",
      description: `You're halfway there with ${masteredCount} mastered words. Keep up the momentum!`,
      action: "Continue learning",
      color: "#10B981",
    });
  } else {
    insights.push({
      icon: "🏆",
      title: "You're a master!",
      description: `Impressive! You've mastered ${masteredCount} words (${Math.round(
        masteredPercentage
      )}%). Focus on maintaining your knowledge.`,
      action: "Review weekly",
      color: "#F59E0B",
    });
  }

  // Insight 2: Memory decay
  if (decayPercentage > 50) {
    insights.push({
      icon: "⚠️",
      title: "Many words need review",
      description: `${eligibleForDecay} words haven't been reviewed recently and are losing memory strength. Time for a review session!`,
      action: "Start review session",
      color: "#EF4444",
    });
  } else if (decayPercentage > 20) {
    insights.push({
      icon: "⟲",
      title: "Maintenance time",
      description: `${eligibleForDecay} words need a refresh. A quick review session will help reinforce them.`,
      action: "Review weak words",
      color: "#F59E0B",
    });
  } else {
    insights.push({
      icon: "✅",
      title: "You're keeping up!",
      description:
        "Great job maintaining your vocabulary! Your reviews are keeping memory fresh.",
      action: "Well done",
      color: "#10B981",
    });
  }

  // Insight 3: Weak words
  if (weakCount > 5) {
    insights.push({
      icon: "🔄",
      title: "Struggling with some words",
      description: `You have ${weakCount} words with very low memory (0-20%). Consider using spaced repetition for these.`,
      action: "Focus on weak words",
      color: "#EF4444",
    });
  }

  // Insight 4: Daily habits
  insights.push({
    icon: "⚡",
    title: "Daily practice matters",
    description:
      "Daily 10-minute review sessions are more effective than long cramming sessions. Consistency builds strong memory!",
    action: "Set a reminder",
    color: "#6B8AFF",
  });

  return (
    <Box>
      {/* Progress bar: Mastery progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            📈 Mastery Progress
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(masteredPercentage)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={masteredPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e5e7eb",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: "linear-gradient(90deg, #10B981 0%, #059669 100%)",
            },
          }}
        />
      </Box>

      {/* Progress bar: Review status */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            🔄 Review Status
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {100 - Math.round(decayPercentage)}% up to date
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={100 - decayPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e5e7eb",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: "linear-gradient(90deg, #3B82F6 0%, #1E40AF 100%)",
            },
          }}
        />
      </Box>

      {/* Insights grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: (theme) => theme.spacing(2),
        }}
      >
        {insights.map((insight, idx) => (
          <Box key={idx}>
            <InsightCard {...insight} />
          </Box>
        ))}
      </Box>

      {/* Tips section */}
      <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e5e7eb" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          💡 Pro Tips
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: (theme) => theme.spacing(1.5),
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              • Review words right after learning for 70% better retention
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              • Space out reviews over days, weeks, months (spaced repetition)
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              • Practice with real sentences, not just definitions
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              • The forgetting curve: Review after 1d, 3d, 7d, 14d, 30d
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
