# Wordmaster API Quick Reference

## Imports

```typescript
import {
  wordmasterDb,
  type Word,
  type UserWord,
  type UserSettings,
  type ExtractedWord,
  calculateMemoryIncrease,
  calculatePriorityScore,
  extractUniqueWords,
  tokenizeText,
} from "@/services/wordmaster";
```

## Database Operations

### Words

```typescript
// Get word by ID
const word = await wordmasterDb.getWord(wordId);

// Get word by text (case-insensitive)
const word = await wordmasterDb.getWordByText('serendipity');

// Create new word
const word = await wordmasterDb.createWord({
  word_text: 'serendipity',
  phonetic: '/ˌserənˈdɪpɪti/',
  definition: 'Finding something good by chance',
  part_of_speech: 'noun',
  example_sentence: 'It was pure serendipity.',
  word_length: 11,
  difficulty_level: 'very_hard',
});

// Get or create (returns existing if found)
const word = await wordmasterDb.getOrCreateWord({...});
```

### User Words

```typescript
// Get user's word progress
const userWord = await wordmasterDb.getUserWord(userId, wordId);

// Add word to user's vocabulary
const userWord = await wordmasterDb.createUserWord(userId, {
  word_id: wordId,
  memory_level: 0,
  is_quick_learner: false,
});

// Batch add words
const userWords = await wordmasterDb.addWordsToUser(userId, [wordId1, wordId2]);

// Update memory level
const updated = await wordmasterDb.updateUserWordMemory(userWordId, 25);
```

### Reviews (Interactions)

```typescript
// Create review record
const review = await wordmasterDb.createReview(userId, {
  word_id: wordId,
  user_word_id: userWordId,
  action_type: "marked_known",
  memory_before: 10,
  memory_after: 20,
  memory_change: 10,
});

// Get recent reviews (last 48 hours)
const reviews = await wordmasterDb.getRecentReviews(userId, wordId, 48);
```

### Settings

```typescript
// Get user settings (creates defaults if missing)
const settings = await wordmasterDb.getUserSettings(userId);

// Update settings
const updated = await wordmasterDb.updateUserSettings(userId, {
  daily_decay_rate: -2,
  daily_review_goal: 50,
  theme: "dark",
});
```

### Daily Stats

```typescript
// Get today's stats
const stats = await wordmasterDb.getTodayStats(userId);

// Get stats for date range
const stats = await wordmasterDb.getStatsDateRange(
  userId,
  "2025-12-01",
  "2025-12-13"
);

// Update daily stats
const updated = await wordmasterDb.updateDailyStats(userId, {
  words_reviewed: 15,
  daily_goal_achieved: true,
});
```

### Feed Queries

```typescript
// Get feed with defaults
const { words, total, hasMore } = await wordmasterDb.getFeedWords(userId);

// Advanced filtering & sorting
const { words, total, hasMore } = await wordmasterDb.getFeedWords(userId, {
  page: 0,
  limit: 50,
  memoryLevelFilter: "critical", // 'all' | 'critical' | 'learning' | 'reviewing' | 'well_known'
  difficultyFilter: "hard", // 'all' | 'easy' | 'medium' | 'hard' | 'very_hard'
  partOfSpeechFilter: "verb", // 'all' | 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase'
  sortBy: "priority", // 'priority' | 'memory_level' | 'word_length' | 'recently_added' | 'alphabetical'
});

// Iterate through pages
let page = 0;
let allWords = [];
let hasMore = true;

while (hasMore) {
  const result = await wordmasterDb.getFeedWords(userId, { page, limit: 50 });
  allWords.push(...result.words);
  hasMore = result.hasMore;
  page++;
}
```

### Statistics

```typescript
const stats = await wordmasterDb.getVocabularyStats(userId);
// Returns:
// {
//   totalVocabulary: 342,
//   masteredWords: 28,
//   activeLearning: 314,
//   criticalWords: 45,
//   averageMemoryLevel: 52,
// }
```

## Memory Logic

```typescript
import {
  calculateMemoryIncrease,
  calculateDailyDecay,
  estimateTimeToMastery,
  shouldMarkAsQuickLearner,
  getMemoryLevelClassification,
  calculatePriorityScore,
  calculateDifficultyLevel,
  calculateCurrentStreak,
  formatMemoryLevel,
} from "@/services/wordmaster";

// Calculate memory increase with quick learning detection
const result = await calculateMemoryIncrease(
  currentMemoryLevel, // Current level (0-100)
  recentReviews, // Array of ReviewHistory
  isQuickLearner, // Previously detected quick learner
  quickLearningEnabled // User setting
);

console.log(result);
// {
//   baseIncrease: 10,
//   bonusIncrease: 20,
//   totalIncrease: 30,
//   multiplier: 1.5,
//   reason: 'quick_learning_2x_within_24h_with_quick_learner_multiplier',
//   isQuickLearner: true,
//   newMemoryLevel: 40,
// }

// Apply daily decay
const { newLevel, decayAmount } = calculateDailyDecay(25, -1);
// { newLevel: 24, decayAmount: 1 }

// Estimate time to mastery
const estimate = estimateTimeToMastery(
  currentMemoryLevel, // 25
  avgGainPerDay, // 5
  dailyDecayRate // -1
);
// { estimatedDays: 20, estimatedDate: '2025-01-02', daysUntilForgotten: null }

// Check if should be marked quick learner
const isQuick = shouldMarkAsQuickLearner(recentReviews, 2); // Within 2 days

// Get classification
const level = getMemoryLevelClassification(25); // 'critical'

// Calculate priority for feed sorting
const priority = calculatePriorityScore(25, 11); // High priority

// Get difficulty
const difficulty = calculateDifficultyLevel(11); // 'very_hard'

// Get streak
const streak = calculateCurrentStreak(dailyStatsArray); // 5

// Pretty format
const display = formatMemoryLevel(25); // '🔴 25%'
```

## Text Processing

```typescript
import {
  tokenizeText,
  filterStopWords,
  extractPhrases,
  extractUniqueWords,
  extractWordsAndPhrases,
  estimatePartOfSpeech,
  detectLanguage,
  validateContentInput,
  deduplicateAgainstExisting,
  getExtractionStats,
} from "@/services/wordmaster";

// Tokenize text
const { words, sentences } = tokenizeText("Hello world! How are you?");

// Remove stop words
const meaningful = filterStopWords(["the", "quick", "brown", "fox"]);
// ['quick', 'brown', 'fox']

// Extract phrases
const phrases = extractPhrases(text, 2, 4); // 2-4 word phrases

// Extract unique words
const words = extractUniqueWords(text, {
  minWordLength: 3,
  maxWordLength: 15,
});

// Extract words AND phrases
const { words, phrases } = extractWordsAndPhrases(text, {
  minWordLength: 3,
  maxWordLength: 15,
  includePhrases: true,
});

// Estimate part of speech
const pos = estimatePartOfSpeech("running"); // 'verb'

// Detect language
const lang = detectLanguage(text); // 'en' or 'unknown'

// Validate input
const validation = validateContentInput(text, 5000);
if (!validation.valid) {
  console.error(validation.error);
}

// Remove duplicates vs existing vocabulary
const { newWords, duplicates } = deduplicateAgainstExisting(
  extractedWords,
  existingUserWords
);

// Get stats on extraction
const stats = getExtractionStats(extractedWords);
// {
//   totalCount: 150,
//   uniqueCount: 142,
//   difficultyBreakdown: { easy: 50, medium: 60, hard: 25, very_hard: 7 },
//   averageWordLength: 6.2,
//   partOfSpeechBreakdown: { noun: 60, verb: 40, ... },
// }
```

## Type Definitions

```typescript
// Core types
interface Word { ... }
interface UserWord { ... }
interface ReviewHistory { ... }
interface UserSettings { ... }
interface DailyStats { ... }
interface UserProfile { ... }

// Feed types
interface FeedWord {
  userWord: UserWord;
  word: Word;
  priorityScore: number;
}

interface FeedResponse {
  words: FeedWord[];
  total: number;
  hasMore: boolean;
  page: number;
}

// Extraction types
interface ExtractedWord { ... }
interface ExtractionPreview { ... }

// Memory types
interface MemoryUpdateResult { ... }
```

## Common Patterns

### Load and review a word

```typescript
const userId = "user-123";

// Get feed word
const { words } = await wordmasterDb.getFeedWords(userId, { limit: 1 });
const feedWord = words[0];

// User marks as known
const { newMemoryLevel, bonusIncrease, reason } = await calculateMemoryIncrease(
  feedWord.userWord.memory_level,
  await wordmasterDb.getRecentReviews(userId, feedWord.word.id),
  feedWord.userWord.is_quick_learner
);

// Update in database
await wordmasterDb.updateUserWordMemory(feedWord.userWord.id, newMemoryLevel);

// Log interaction
await wordmasterDb.createReview(userId, {
  word_id: feedWord.word.id,
  user_word_id: feedWord.userWord.id,
  action_type: "marked_known",
  memory_before: feedWord.userWord.memory_level,
  memory_after: newMemoryLevel,
  memory_change: newMemoryLevel - feedWord.userWord.memory_level,
});
```

### Extract and add words from content

```typescript
const userId = "user-123";
const content = "Paste song lyrics or article text here...";

// Validate
const validation = validateContentInput(content);
if (!validation.valid) throw new Error(validation.error);

// Extract words
const { words, phrases } = extractWordsAndPhrases(content);

// Prepare for database (still need Gemini enrichment for definitions)
const prepared = prepareExtractedWords([...words, ...phrases]);

// Create/get words in database
const dbWords = await Promise.all(
  prepared.map((w) =>
    wordmasterDb.getOrCreateWord({
      word_text: w.word_text,
      // Will need Gemini for: definition, example_sentence, phonetic
      definition: "To be filled by Gemini API",
      word_length: w.word_length,
      difficulty_level: w.difficulty_level,
    })
  )
);

// Add to user
const userWords = await wordmasterDb.addWordsToUser(
  userId,
  dbWords.map((w) => w.id)
);

return {
  totalAdded: userWords.length,
  difficulty: getExtractionStats(prepared).difficultyBreakdown,
};
```

---

## Error Handling

```typescript
import { WordmasterAPIError } from '@/services/wordmaster';

try {
  const word = await wordmasterDb.createWord({...});
} catch (error) {
  if (error instanceof WordmasterAPIError) {
    console.error(`${error.code}: ${error.message}`);
    console.log(error.details);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Database Connection

The `wordmasterDb` singleton is already initialized with a Supabase browser client. It handles:

- ✅ Authentication with valid JWT
- ✅ RLS policy enforcement
- ✅ Type safety for all queries
- ✅ Error handling

No additional setup needed beyond the database schema migration!
