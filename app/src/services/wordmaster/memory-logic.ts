/**
 * Wordmaster Memory System Logic
 * Handles memory level calculations, quick learning detection, and decay
 */

import type { ReviewHistory } from "./types";

export interface MemoryUpdateResult {
  baseIncrease: number;
  bonusIncrease: number;
  totalIncrease: number;
  multiplier: number;
  reason: string;
  isQuickLearner: boolean;
  newMemoryLevel: number;
}

/**
 * Calculate memory increase when user marks a word as known
 * Includes quick learning detection and bonus multipliers
 */
export async function calculateMemoryIncrease(
  currentMemoryLevel: number,
  recentReviews: ReviewHistory[],
  isQuickLearner: boolean,
  quickLearningEnabled: boolean = true
): Promise<MemoryUpdateResult> {
  const baseIncrease = 10;
  let bonusIncrease = 0;
  let multiplier = 1;
  let reason = "standard_review";
  let detectedQuickLearner = isQuickLearner;

  if (!quickLearningEnabled) {
    return {
      baseIncrease,
      bonusIncrease: 0,
      totalIncrease: baseIncrease,
      multiplier: 1,
      reason: "standard_review_disabled_quick_learning",
      isQuickLearner: false,
      newMemoryLevel: Math.min(100, currentMemoryLevel + baseIncrease),
    };
  }

  // Count recent "marked_known" actions
  const knownCount = recentReviews.filter(
    (r) => r.action_type === "marked_known"
  ).length;

  // Quick learning pattern detection
  if (knownCount === 1) {
    // 2nd correct within 24 hours
    const timeSinceFirst =
      Date.now() -
      new Date(recentReviews[recentReviews.length - 1].reviewed_at).getTime();
    const hoursSinceFirst = timeSinceFirst / (1000 * 60 * 60);

    if (hoursSinceFirst < 24) {
      bonusIncrease = 20;
      reason = "quick_learning_2x_within_24h";
      detectedQuickLearner = true;
    }
  } else if (knownCount === 2) {
    // 3rd correct within 48 hours
    const timeSinceFirst =
      Date.now() -
      new Date(recentReviews[recentReviews.length - 1].reviewed_at).getTime();
    const hoursSinceFirst = timeSinceFirst / (1000 * 60 * 60);

    if (hoursSinceFirst < 48) {
      bonusIncrease = 30;
      reason = "quick_learning_3x_within_48h";
      detectedQuickLearner = true;
    }
  } else if (knownCount >= 3) {
    // 4+ correct consistently
    const allMarkedKnown = recentReviews.every(
      (r) => r.action_type === "marked_known"
    );
    if (allMarkedKnown) {
      bonusIncrease = 40;
      reason = "exceptional_recall_4plus_correct";
      detectedQuickLearner = true;
    }
  }

  // Apply multiplier for known quick learners
  if (detectedQuickLearner && isQuickLearner) {
    multiplier = 1.5;
    reason += "_with_quick_learner_multiplier";
  }

  const totalIncrease = Math.round((baseIncrease + bonusIncrease) * multiplier);
  const newMemoryLevel = Math.min(100, currentMemoryLevel + totalIncrease);

  return {
    baseIncrease,
    bonusIncrease,
    totalIncrease,
    multiplier,
    reason,
    isQuickLearner: detectedQuickLearner,
    newMemoryLevel,
  };
}

/**
 * Apply daily memory decay to all user words
 * Called via cron job at 00:00 UTC
 */
export function calculateDailyDecay(
  currentMemoryLevel: number,
  decayRate: number = -1
): { newLevel: number; decayAmount: number } {
  const decayAmount = Math.abs(decayRate);
  const newLevel = Math.max(0, currentMemoryLevel + decayRate);

  return {
    newLevel,
    decayAmount,
  };
}

/**
 * Get time estimate to reach mastery (memory level 100)
 */
export function estimateTimeToMastery(
  currentMemoryLevel: number,
  avgMemoryGainPerDay: number,
  dailyDecayRate: number = -1
): {
  estimatedDays: number;
  estimatedDate: string;
  daysUntilForgotten: number | null;
} {
  if (currentMemoryLevel >= 100) {
    return {
      estimatedDays: 0,
      estimatedDate: new Date().toISOString().split("T")[0],
      daysUntilForgotten: null,
    };
  }

  // Net daily progress = gain - decay
  const netDailyProgress = avgMemoryGainPerDay + dailyDecayRate;

  // If net progress is zero or negative, word can't be mastered with current patterns
  if (netDailyProgress <= 0) {
    const daysUntilForgotten = Math.floor(
      currentMemoryLevel / Math.abs(dailyDecayRate)
    );
    return {
      estimatedDays: -1,
      estimatedDate: "Not achievable",
      daysUntilForgotten,
    };
  }

  const remainingPoints = 100 - currentMemoryLevel;
  const estimatedDays = Math.ceil(remainingPoints / netDailyProgress);
  const estimatedDate = new Date(
    Date.now() + estimatedDays * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  return {
    estimatedDays,
    estimatedDate,
    daysUntilForgotten: null,
  };
}

/**
 * Detect if a word should be marked for quick learning bonus
 */
export function shouldMarkAsQuickLearner(
  recentReviews: ReviewHistory[],
  timeWindowDays: number = 2
): boolean {
  if (recentReviews.length < 2) return false;

  const knownReviews = recentReviews.filter(
    (r) => r.action_type === "marked_known"
  );
  if (knownReviews.length < 2) return false;

  const oldestReview = new Date(
    knownReviews[knownReviews.length - 1].reviewed_at
  ).getTime();
  const newestReview = new Date(knownReviews[0].reviewed_at).getTime();
  const timeElapsed = (newestReview - oldestReview) / (1000 * 60 * 60 * 24);

  return timeElapsed <= timeWindowDays && knownReviews.length >= 2;
}

/**
 * Get memory level classification
 */
export function getMemoryLevelClassification(
  memoryLevel: number
): "critical" | "learning" | "reviewing" | "well_known" | "mastered" {
  if (memoryLevel >= 100) return "mastered";
  if (memoryLevel >= 81) return "well_known";
  if (memoryLevel >= 51) return "reviewing";
  if (memoryLevel >= 21) return "learning";
  return "critical";
}

/**
 * Calculate priority score for feed algorithm
 * Formula: (100 - memory_level) × urgency_multiplier × length_factor
 */
export function calculatePriorityScore(
  memoryLevel: number,
  wordLength: number
): number {
  let urgencyMultiplier: number;
  if (memoryLevel < 20) {
    urgencyMultiplier = 3.0;
  } else if (memoryLevel <= 50) {
    urgencyMultiplier = 1.5;
  } else if (memoryLevel <= 80) {
    urgencyMultiplier = 1.0;
  } else {
    urgencyMultiplier = 0.3;
  }

  let lengthFactor: number;
  if (wordLength <= 4) {
    lengthFactor = 0.8;
  } else if (wordLength <= 7) {
    lengthFactor = 1.0;
  } else if (wordLength <= 10) {
    lengthFactor = 1.2;
  } else {
    lengthFactor = 1.5;
  }

  return (100 - memoryLevel) * urgencyMultiplier * lengthFactor;
}

/**
 * Determine difficulty level based on word length
 */
export function calculateDifficultyLevel(
  wordLength: number
): "easy" | "medium" | "hard" | "very_hard" {
  if (wordLength <= 4) return "easy";
  if (wordLength <= 7) return "medium";
  if (wordLength <= 10) return "hard";
  return "very_hard";
}

/**
 * Calculate streak based on daily stats
 */
export function calculateCurrentStreak(
  dailyStatsArray: Array<{ daily_goal_achieved: boolean; stat_date: string }>
): number {
  if (!dailyStatsArray.length) return 0;

  // Sort by date descending (most recent first)
  const sorted = [...dailyStatsArray].sort(
    (a, b) => new Date(b.stat_date).getTime() - new Date(a.stat_date).getTime()
  );

  let streak = 0;
  let currentDate = new Date();

  for (const stat of sorted) {
    const statDate = new Date(stat.stat_date);
    const daysDiff = Math.floor(
      (currentDate.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If stat is from today or yesterday, and goal was achieved
    if (daysDiff === streak && stat.daily_goal_achieved) {
      streak++;
      currentDate = statDate;
    } else if (daysDiff > streak) {
      // Gap in streak
      break;
    }
  }

  return streak;
}

/**
 * Format memory level with visual indicator
 */
export function formatMemoryLevel(level: number): string {
  const percentage = Math.round(level);
  const classification = getMemoryLevelClassification(level);

  const indicators = {
    critical: "🔴",
    learning: "🟠",
    reviewing: "🟡",
    well_known: "🟢",
    mastered: "🏆",
  };

  return `${indicators[classification]} ${percentage}%`;
}
