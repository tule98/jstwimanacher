/**
 * Wordmaster Supabase Client & Database Operations
 * Type-safe wrapper around Supabase operations for the Wordmaster module
 */

import { createBrowserClient } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Word,
  UserWord,
  ReviewHistory,
  UserSettings,
  DailyStats,
  UserProfile,
  CreateWordInput,
  CreateUserWordInput,
  CreateReviewHistoryInput,
  FeedWord,
  MemoryLevelFilter,
  DifficultyLevel,
  PartOfSpeech,
} from "./types";

class WordmasterSupabaseClient {
  private supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

  private async getSupabase() {
    // Check if we're on the server
    if (typeof window === "undefined") {
      // Server-side: create a new server client for each call
      return await createSupabaseServerClient();
    }

    // Client-side: reuse singleton
    if (!this.supabaseClient) {
      this.supabaseClient = createBrowserClient();
    }
    return this.supabaseClient;
  }

  private async getClient() {
    return await this.getSupabase();
  }

  // ============= USER PROFILES =============

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await (await this.getClient())
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  async createUserProfile(
    userId: string,
    profile: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await (
        await this.getClient()
      )
        .from("user_profiles")
        .insert({
          user_id: userId,
          display_name: profile.display_name,
          timezone: profile.timezone || "UTC",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating user profile:", error);
      return null;
    }
  }

  // ============= WORDS =============

  async getWord(wordId: string): Promise<Word | null> {
    try {
      const { data, error } = await (await this.getClient())
        .from("words")
        .select("*")
        .eq("id", wordId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching word:", error);
      return null;
    }
  }

  async getWordByText(wordText: string): Promise<Word | null> {
    try {
      const { data, error } = await (await this.getClient())
        .from("words")
        .select("*")
        .eq("word_text_lower", wordText.toLowerCase())
        .single();

      if (error?.code === "PGRST116") return null; // Not found
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching word by text:", error);
      return null;
    }
  }

  async createWord(word: CreateWordInput): Promise<Word | null> {
    try {
      const { data, error } = await (
        await this.getClient()
      )
        .from("words")
        .insert({
          word_text: word.word_text,
          word_text_lower: word.word_text.toLowerCase(),
          phonetic: word.phonetic,
          definition: word.definition,
          part_of_speech: word.part_of_speech,
          example_sentence: word.example_sentence,
          meaning_vi: word.meaning_vi,
          topic: word.topic,
          word_length: word.word_length,
          difficulty_level: word.difficulty_level,
          language: word.language || "en",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating word:", error);
      return null;
    }
  }

  async getOrCreateWord(word: CreateWordInput): Promise<Word | null> {
    // Try to find existing word
    const existingWord = await this.getWordByText(word.word_text);
    if (existingWord) return existingWord;

    // Create new word if doesn't exist
    return this.createWord(word);
  }

  // ============= USER_WORDS =============

  async getUserWord(userId: string, wordId: string): Promise<UserWord | null> {
    try {
      const { data, error } = await (await this.getClient())
        .from("user_words")
        .select("*")
        .eq("user_id", userId)
        .eq("word_id", wordId)
        .single();

      if (error?.code === "PGRST116") return null; // Not found
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user word:", error);
      return null;
    }
  }

  async createUserWord(
    userId: string,
    input: CreateUserWordInput
  ): Promise<UserWord | null> {
    try {
      const { data, error } = await (
        await this.getClient()
      )
        .from("user_words")
        .insert({
          user_id: userId,
          word_id: input.word_id,
          memory_level: input.memory_level || 0,
          is_quick_learner: input.is_quick_learner || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating user word:", error);
      return null;
    }
  }

  async addWordsToUser(userId: string, wordIds: string[]): Promise<UserWord[]> {
    try {
      const { data, error } = await (
        await this.getClient()
      )
        .from("user_words")
        .insert(
          wordIds.map((wordId) => ({
            user_id: userId,
            word_id: wordId,
            memory_level: 0,
          }))
        )
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error adding words to user:", error);
      return [];
    }
  }

  async updateUserWordMemory(
    userWordId: string,
    newMemoryLevel: number
  ): Promise<UserWord | null> {
    try {
      const { data, error } = await (
        await this.getClient()
      )
        .from("user_words")
        .update({
          memory_level: Math.min(101, Math.max(0, newMemoryLevel)), // Allow up to 101
          last_memory_update_at: new Date().toISOString(),
          last_reviewed_at: new Date().toISOString(), // Track when word was reviewed for decay calculation
        })
        .eq("id", userWordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating user word memory:", error);
      return null;
    }
  }

  // ============= REVIEW_HISTORY =============

  async createReview(
    userId: string,
    review: CreateReviewHistoryInput
  ): Promise<ReviewHistory | null> {
    try {
      const { data, error } = await (
        await this.getClient()
      )
        .from("review_history")
        .insert({
          user_id: userId,
          ...review,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating review:", error);
      return null;
    }
  }

  async getRecentReviews(
    userId: string,
    wordId: string,
    hoursBack: number = 48
  ): Promise<ReviewHistory[]> {
    try {
      const cutoffTime = new Date(
        Date.now() - hoursBack * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await (await this.getClient())
        .from("review_history")
        .select("*")
        .eq("user_id", userId)
        .eq("word_id", wordId)
        .gt("reviewed_at", cutoffTime)
        .order("reviewed_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
      return [];
    }
  }

  // ============= USER_SETTINGS =============

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await (await this.getClient())
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error?.code === "PGRST116") {
        // Settings don't exist, create defaults
        return this.createDefaultUserSettings(userId);
      }
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }
  }

  private async createDefaultUserSettings(
    userId: string
  ): Promise<UserSettings | null> {
    try {
      const { data, error } = await (
        await this.getClient()
      )
        .from("user_settings")
        .insert({
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating default settings:", error);
      return null;
    }
  }

  async updateUserSettings(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<UserSettings | null> {
    try {
      const { data, error } = await (await this.getClient())
        .from("user_settings")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating user settings:", error);
      return null;
    }
  }

  // ============= DAILY_STATS =============

  async getTodayStats(userId: string): Promise<DailyStats | null> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await (await this.getClient())
        .from("daily_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("stat_date", today)
        .single();

      if (error?.code === "PGRST116") return null; // Not found
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching today stats:", error);
      return null;
    }
  }

  async getStatsDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyStats[]> {
    try {
      const { data, error } = await (await this.getClient())
        .from("daily_stats")
        .select("*")
        .eq("user_id", userId)
        .gte("stat_date", startDate)
        .lte("stat_date", endDate)
        .order("stat_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching stats range:", error);
      return [];
    }
  }

  async updateDailyStats(
    userId: string,
    updates: Partial<DailyStats>
  ): Promise<DailyStats | null> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await (await this.getClient())
        .from("daily_stats")
        .update(updates)
        .eq("user_id", userId)
        .eq("stat_date", today)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating daily stats:", error);
      return null;
    }
  }

  // ============= FEED QUERIES =============

  async getFeedWords(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      memoryLevelFilter?: MemoryLevelFilter;
      difficultyFilter?: DifficultyLevel | "all";
      partOfSpeechFilter?: PartOfSpeech | "all";
      sortBy?:
        | "priority"
        | "memory_level"
        | "word_length"
        | "recently_added"
        | "alphabetical";
    } = {}
  ): Promise<{ words: FeedWord[]; total: number; hasMore: boolean }> {
    try {
      const {
        page = 0,
        limit = 50,
        memoryLevelFilter = "all",
        difficultyFilter = "all",
        partOfSpeechFilter = "all",
        sortBy = "priority",
      } = options;

      let query = (await this.getClient())
        .from("user_words")
        .select(
          `
          *,
          word:words(*)
        `,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .eq("is_archived", false)
        .lt("memory_level", 100);

      // Apply memory level filter
      if (memoryLevelFilter === "critical") {
        query = query.lt("memory_level", 20);
      } else if (memoryLevelFilter === "learning") {
        query = query.gte("memory_level", 20).lt("memory_level", 51);
      } else if (memoryLevelFilter === "reviewing") {
        query = query.gte("memory_level", 51).lt("memory_level", 81);
      } else if (memoryLevelFilter === "well_known") {
        query = query.gte("memory_level", 81);
      }

      // Apply difficulty filter
      if (difficultyFilter !== "all") {
        query = query.eq("word.difficulty_level", difficultyFilter);
      }

      // Apply part of speech filter
      if (partOfSpeechFilter !== "all") {
        query = query.eq("word.part_of_speech", partOfSpeechFilter);
      }

      // Apply sorting
      if (sortBy === "memory_level") {
        query = query.order("memory_level", { ascending: true });
      } else if (sortBy === "word_length") {
        query = query.order("word.word_length", { ascending: false });
      } else if (sortBy === "recently_added") {
        query = query.order("first_added_at", { ascending: false });
      } else if (sortBy === "alphabetical") {
        query = query.order("word.word_text", { ascending: true });
      } else {
        // Default: priority (requires calculation on client)
        query = query.order("memory_level", { ascending: true });
      }

      const { data, error, count } = await query.range(
        page * limit,
        (page + 1) * limit - 1
      );

      if (error) throw error;

      const feedWords: FeedWord[] = (data || []).map((uw) => ({
        userWord: uw,
        word: uw.word,
        priorityScore: this.calculatePriorityScore(
          uw.memory_level,
          uw.word.word_length
        ),
      }));

      return {
        words: feedWords,
        total: count || 0,
        hasMore: (count || 0) > (page + 1) * limit,
      };
    } catch (error) {
      console.error("Error fetching feed words:", error);
      return { words: [], total: 0, hasMore: false };
    }
  }

  private calculatePriorityScore(
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

  // ============= VOCABULARY STATS =============

  async getVocabularyStats(userId: string) {
    try {
      const { data, error } = await (await this.getClient())
        .from("user_words")
        .select("memory_level", { count: "exact" })
        .eq("user_id", userId)
        .lt("memory_level", 100);

      if (error) throw error;

      const words = data || [];
      const totalVocabulary = words.length;
      const critical = words.filter((w) => w.memory_level < 20).length;
      const mastered =
        (
          await (await this.getClient())
            .from("user_words")
            .select("id", { count: "exact" })
            .eq("user_id", userId)
            .eq("memory_level", 100)
        ).count || 0;

      const avgMemory =
        words.length > 0
          ? Math.round(
              words.reduce((sum, w) => sum + w.memory_level, 0) / words.length
            )
          : 0;

      return {
        totalVocabulary,
        masteredWords: mastered,
        activeLearning: totalVocabulary,
        criticalWords: critical,
        averageMemoryLevel: avgMemory,
      };
    } catch (error) {
      console.error("Error fetching vocabulary stats:", error);
      return {
        totalVocabulary: 0,
        masteredWords: 0,
        activeLearning: 0,
        criticalWords: 0,
        averageMemoryLevel: 0,
      };
    }
  }
}

export const wordmasterDb = new WordmasterSupabaseClient();
