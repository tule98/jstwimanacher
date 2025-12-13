# Flashcard App - Functional Requirements Document

## 1. Overview

A vocabulary learning web application that automatically extracts words and phrases from user-provided content (songs, paragraphs, topics) and presents them in an intelligent feed based on memory decay. The app uses a simple memory level system (0-100) that naturally decays over time, encouraging consistent review.

**Tech Stack:**

- Frontend: Next.js (React)
- Backend: Supabase
- Design: Mobile-first responsive design

---

## 2. Core Features

### 2.1 Content Input & Processing

**2.1.1 Input Types**
Users can input content through multiple formats:

- **Song Lyrics**: Paste or type song lyrics
- **Paragraph/Article**: Any text content
- **Topic/Keywords**: Enter a topic for vocabulary extraction
- **Manual Word Entry**: Direct word input (single word or phrase)

**2.1.2 Content Input Interface**

- Simple text area for pasting/typing content
- Character counter (optional, max 5000 characters)
- "Process" button to extract vocabulary
- No content library - content is processed and discarded after extraction
- Focus on immediate vocabulary extraction

**2.1.3 Text Processing & Extraction**
When content is submitted:

- Parse and tokenize the input text
- Extract meaningful words:
  - Individual words (nouns, verbs, adjectives, adverbs)
  - Common phrases (2-4 word combinations)
- Filter out:
  - Common stop words (the, a, an, is, are, was, were, etc.)
  - Words user has already mastered (memory level = 100)
  - Duplicate words within the same input
- Language detection: English (primary focus)

**2.1.4 Word Enrichment**
For each extracted word/phrase, automatically generate or fetch:

- **Phonetic Transcription**: IPA (International Phonetic Alphabet) or simplified phonetics (e.g., /həˈloʊ/ for "hello")
- **Definition**: Primary meaning in clear, simple language
- **Part of Speech**: Noun, verb, adjective, adverb, etc.
- **Example Sentence**: Generate contextual example using the word
- **Difficulty Level**: Calculated based on word length:
  - **Easy**: 1-4 letters
  - **Medium**: 5-7 letters
  - **Hard**: 8-10 letters
  - **Very Hard**: 11+ letters
- **Word Length**: Character count for sorting/filtering

**2.1.5 Extraction Preview**
After processing, show user:

- Total number of words/phrases extracted
- List preview with difficulty distribution
- Option to remove specific words before adding to feed
- "Add to Feed" confirmation button
- All extracted words start at memory level 0

---

### 2.2 Memory Level System

**2.2.1 Memory Level Mechanics**

- **Initial State**: New word starts at memory level 0
- **Maximum Level**: 100 (considered "mastered")
- **Daily Decay**: Memory level automatically decreases by 1 point per day
- **No Manual Boost**: System automatically adjusts based on user interaction patterns
- **Decay Stops**: When memory level reaches 0 or word is reviewed

**2.2.2 Memory Level Ranges & States**

- **0-20**: Critical (forgotten/new) - Appears very frequently in feed
- **21-50**: Learning - Appears regularly
- **51-80**: Reviewing - Appears occasionally
- **81-99**: Well-known - Appears rarely
- **100**: Mastered - Archived (removed from active feed)

**2.2.3 Automatic Memory Increase**
The system intelligently increases memory based on interaction patterns:

**Quick Learning Boost**:

- If user marks word as "known" 2 times within 24 hours: +20 points
- If user marks word as "known" 3 times within 48 hours: +30 points
- If user consistently marks word correctly in short time: accelerated learning

**Standard Review**:

- Each time user marks "I know this": +10 points
- Each time user views and doesn't mark "need review": +5 points

**Smart Acceleration**:
For words that user demonstrates quick understanding:

- Track time between first exposure and consistent correct marking
- If < 2 days: Apply 1.5x multiplier to memory gains
- If < 1 day: Apply 2x multiplier to memory gains
- This helps familiar words reach mastery faster

Example: User already knows the word "cat" from previous exposure

- First review: +10 (memory = 10)
- Second review 1 hour later: +20 bonus (memory = 40)
- Third review 2 hours later: +30 bonus (memory = 70)
- Fourth review next day: +30 (memory = 100, mastered)

Memory level cannot exceed 100 or go below 0.

---

### 2.3 Words Feed (Main Learning Interface)

**2.3.1 Feed Algorithm**
The feed pulls words based on priority scoring:

**Priority Score Formula**:

```
Priority Score = (100 - memory_level) × urgency_multiplier × length_factor

Where:
- Lower memory level = Higher priority
- urgency_multiplier:
  * 3.0 if memory_level < 20 (critical)
  * 1.5 if memory_level 20-50 (learning)
  * 1.0 if memory_level 51-80 (reviewing)
  * 0.3 if memory_level 81-99 (well-known)

- length_factor (based on difficulty):
  * Easy words (1-4 letters): 0.8
  * Medium words (5-7 letters): 1.0
  * Hard words (8-10 letters): 1.2
  * Very Hard words (11+ letters): 1.5
```

This ensures:

- Forgotten words appear most frequently
- Harder/longer words get slightly more exposure
- Well-known words appear occasionally for maintenance

**2.3.2 Feed Display**
Infinite scroll feed showing flashcards one at a time:

**Card Front (Default View)**:

- Word/phrase in large, readable font (32-40pt)
- Phonetic transcription below word (smaller, gray text)
- Memory level indicator: Progress bar (0-100) with color coding:
  - Red (0-20)
  - Orange (21-50)
  - Yellow (51-80)
  - Light Green (81-99)
  - Gold/Green (100)
- Difficulty badge (Easy/Medium/Hard/Very Hard) - small chip/tag
- Card number in session (e.g., "Card 15/50")

**Card Back (Flip View)**:

- Definition in clear, readable text
- Part of speech tag (Noun, Verb, etc.)
- Example sentence using the word
- Last reviewed date (e.g., "Last seen: 2 days ago")

**2.3.3 Feed Interactions**

**Primary Actions**:

- **Tap Card**: Flip to reveal back (definition, example)
- **Swipe Right / Tap "I Know This"**:
  - Mark word as known
  - +10 memory points (or more if quick learning detected)
  - Card exits feed, next card appears
  - Visual feedback: green checkmark animation
- **Swipe Left / Tap "Need Review"**:
  - Keep memory level unchanged
  - Word reappears sooner in feed (higher priority temporarily)
  - Visual feedback: card slides back into deck
- **Tap "Skip"** (optional button):
  - No memory change
  - Move to next card without affecting priority
  - Useful for words user wants to think about

**Secondary Actions**:

- **Pull down to refresh**: Recalculate feed priority and load new cards
- **Tap memory bar**: See detailed memory history graph (optional)

**2.3.4 Feed Filters & Sorting**
Top of feed has filter chips/buttons:

**Filter by Memory Level**:

- All (default)
- Critical (0-20) - urgent review needed
- Learning (21-50)
- Reviewing (51-80)
- Well-known (81-99)

**Filter by Difficulty**:

- All (default)
- Easy (1-4 letters)
- Medium (5-7 letters)
- Hard (8-10 letters)
- Very Hard (11+ letters)

**Filter by Part of Speech**:

- All (default)
- Nouns
- Verbs
- Adjectives
- Adverbs
- Phrases

**Sort Options**:

- Priority (default) - algorithm-based
- Memory Level (lowest first)
- Word Length (longest first)
- Recently Added
- Alphabetical

**2.3.5 Daily Learning Goal**

- Top banner shows: "15/30 words reviewed today"
- Progress bar for daily goal
- Customizable in settings (default: 30 words/day)
- Notification when goal achieved
- Goal resets at midnight

**2.3.6 Feed Session Flow**

1. User opens app → Feed loads with highest priority words
2. Multiple cards displayed in scrollable vertical list
3. User scrolls down to browse through words
4. For each card visible:
   - Card shows front side (word + phonetics + memory bar)
   - User taps to flip → Sees definition and example
   - User interacts:
     - Swipe right → "I know this" (+10 memory, card stays but updates)
     - Swipe left → "Need review" (card stays, reappears higher in next session)
     - Continue scrolling → No action taken
5. Scroll to bottom → Automatically loads next 20 cards (infinite scroll)
6. User can exit anytime, progress is auto-saved
7. When daily goal reached, celebration banner appears at top without interrupting scroll

---

### 2.4 Statistics & Progress Tracking

**2.4.1 Dashboard Overview**
Main stats displayed on home screen or dedicated stats tab:

**Current Status**:

- **Total Vocabulary**: Count of all words in learning (memory > 0)
- **Mastered Words**: Count of words at memory level 100
- **Active Learning**: Words currently in learning phase (memory 1-99)
- **Critical Words**: Words needing urgent review (memory < 20)
- **Average Memory Level**: Overall health of vocabulary (0-100 average)

**Today's Activity**:

- Words reviewed today (count)
- Memory points gained today (sum)
- Daily goal progress (visual progress bar)
- Current streak (consecutive days of reviewing)

**2.4.2 Memory Health Visualization**
Pie chart or bar graph showing distribution:

- Critical (0-20): X words
- Learning (21-50): Y words
- Reviewing (51-80): Z words
- Well-known (81-99): W words
- Mastered (100): V words

Color-coded for quick understanding.

**2.4.3 Progress Over Time**
Line graph showing:

- **X-axis**: Days (last 7, 30, or 90 days)
- **Y-axis**: Average memory level or total words reviewed
- Multiple lines (optional):
  - Average memory level trend
  - Words reviewed per day
  - New words added per day
  - Words mastered per day

**2.4.4 Vocabulary Growth**
Cumulative graph:

- Total words learned over time
- Milestone markers (100 words, 500 words, 1000 words)
- Growth rate indicator (words per week)

**2.4.5 Word-Level Detail Statistics**
When user taps a specific word, show detailed stats:

- Current memory level (large number with progress bar)
- Days since first added
- Total times reviewed
- Last reviewed date
- Memory level history (mini line graph showing ups and downs)
- Time to mastery prediction (e.g., "~15 days to reach 100")
- Quick actions: Reset memory, Mark as mastered, Remove word

**2.4.6 Difficulty Level Statistics**
Breakdown by word length/difficulty:

- Easy words: X mastered / Y total
- Medium words: X mastered / Y total
- Hard words: X mastered / Y total
- Very Hard words: X mastered / Y total

Helps user understand their strength areas.

**2.4.7 Insights & Recommendations**
Smart suggestions based on data:

- "You have 15 critical words! Review now to prevent forgetting."
- "Great job! 5 words reached mastery this week."
- "Your average memory level increased by 12 points this month!"
- "Consider reviewing harder words (8+ letters) more often."
- "You're on a 7-day streak! Keep it up!"

**2.4.8 Milestones & Achievements**
Track and celebrate:

- First word mastered
- 10, 50, 100, 500, 1000 words mastered
- 7, 30, 100 day learning streak
- 1000, 5000, 10000 words reviewed
- Perfect week (hit daily goal every day)

Display as badges or achievement cards.

---

### 2.5 Settings & Preferences

**2.5.1 Memory System Settings**

- **Daily Decay Rate**: Default -1, adjustable from 0 to -3
  - 0 = No decay (words don't forget)
  - -1 = Standard decay (1 point per day)
  - -2 = Fast decay (challenging mode)
  - -3 = Very fast decay (expert mode)
- **Quick Learning Detection**: Enable/disable automatic memory boost for fast learners
- **Auto-Archive Mastered Words**: Toggle to automatically hide words at level 100

**2.5.2 Feed Settings**

- **Daily Review Goal**: Set target (10, 20, 30, 50, 100 words)
- **Cards Per Session**: Limit feed to X cards before showing summary (optional)
- **Default Sort Order**: Priority, Memory Level, Word Length, Alphabetical
- **Auto-Flip Cards**: Automatically flip to definition after X seconds (0 = manual only)
- **Swipe Sensitivity**: Adjust swipe distance threshold

**2.5.3 Display Settings**

- **Show Phonetics**: Toggle phonetic display on/off
- **Show Difficulty Badge**: Toggle difficulty indicator
- **Card Animation Speed**: Fast, Medium, Slow
- **Theme**: Light, Dark, Auto
- **Font Size**: Small, Medium, Large for better readability

**2.5.4 Word Extraction Settings**

- **Minimum Word Length**: Extract words with at least X letters (default: 3)
- **Maximum Word Length**: Extract words up to X letters (default: 15)
- **Include Phrases**: Toggle 2-4 word phrase extraction
- **Auto-Remove Stop Words**: Toggle automatic filtering of common words

**2.5.5 Notification Settings**

- **Daily Reminder**: Enable/disable daily review notification
- **Reminder Time**: Set preferred time (e.g., 9:00 AM)
- **Critical Words Alert**: Notify when words drop below 20
- **Milestone Notifications**: Notify on achievements
- **Goal Completion**: Notify when daily goal reached

---

## 3. Key Algorithms

### 3.1 Feed Priority Algorithm (Supabase Query)

```sql
SELECT w.*, uw.memory_level, uw.last_reviewed_at
FROM words w
JOIN user_words uw ON w.id = uw.word_id
WHERE uw.user_id = $user_id
  AND uw.memory_level < 100
ORDER BY (
  (100 - uw.memory_level) *
  CASE
    WHEN uw.memory_level < 20 THEN 3.0
    WHEN uw.memory_level BETWEEN 20 AND 50 THEN 1.5
    WHEN uw.memory_level BETWEEN 51 AND 80 THEN 1.0
    ELSE 0.3
  END *
  CASE
    WHEN w.word_length <= 4 THEN 0.8
    WHEN w.word_length BETWEEN 5 AND 7 THEN 1.0
    WHEN w.word_length BETWEEN 8 AND 10 THEN 1.2
    ELSE 1.5
  END
) DESC
LIMIT 100;
```

### 3.2 Memory Increase Logic (Next.js API Route)

```
On "Mark as Known" Action:

  base_increase = 10 points

  // Check for quick learning pattern
  recent_reviews = get_reviews_last_48_hours(user_id, word_id)

  if recent_reviews.count == 1 AND time_since_last < 24h:
    bonus = 20
    reason = "Quick learning detected (2nd correct in 24h)"

  elif recent_reviews.count == 2 AND time_since_first < 48h:
    bonus = 30
    reason = "Rapid mastery (3rd correct in 48h)"

  elif recent_reviews.count >= 3 AND all_marked_known:
    bonus = 40
    reason = "Exceptional recall (4+ correct consistently)"

  else:
    bonus = 0

  total_increase = base_increase + bonus

  // Apply multiplier for words user already knows well
  if is_quick_learner flag is true:
    total_increase = total_increase * 1.5

  new_memory_level = min(100, current_memory_level + total_increase)

  update_user_word(memory_level = new_memory_level)
  log_review_action(action_type = "marked_known", memory_change = total_increase)

  // Check if word reached mastery
  if new_memory_level == 100:
    trigger_notification("Word mastered!", word_text)
    if auto_archive_mastered:
      archive_word(word_id)
```

### 3.3 Daily Memory Decay (Supabase Edge Function - Cron Job)

```
Schedule: Daily at 00:00 UTC

For each user:

  decay_rate = get_user_setting(user_id, "daily_decay_rate") // default -1

  For each word in user_words WHERE memory_level > 0:

    // Skip if reviewed today
    if last_memory_update_at >= today_start:
      continue

    // Apply decay
    new_level = max(0, memory_level + decay_rate)

    update_user_word(
      memory_level = new_level,
      updated_at = now()
    )

    // Track critical words
    if new_level < 20 AND previous_level >= 20:
      add_to_critical_list(user_id, word_id)

    // Track forgotten words
    if new_level == 0 AND previous_level > 0:
      add_to_forgotten_list(user_id, word_id)

  // Send notifications if needed
  if critical_list.count >= 10:
    send_notification(user_id, "10+ words need urgent review!")

  if forgotten_list.count > 0:
    send_notification(user_id, f"{forgotten_list.count} words forgotten")

  // Update daily stats
  calculate_and_save_daily_stats(user_id, today)
```

### 3.4 Text Processing & Extraction Pipeline (Next.js API Route)

```
Input: Raw text content (song lyrics, paragraph, topic)

Step 1: Clean & Tokenize
  - Convert to lowercase
  - Remove special characters (keep apostrophes for contractions)
  - Split into sentences using NLTK or similar
  - Split sentences into word tokens

Step 2: Filter Stop Words
  - Load stop words list (the, a, an, is, are, was, were, etc.)
  - Remove tokens in stop words list
  - Keep meaningful words: nouns, verbs, adjectives, adverbs

Step 3: Extract Phrases (if enabled)
  - Scan for 2-4 word combinations
  - Use n-gram extraction
  - Filter by common collocation patterns
  - Keep idiomatic expressions (e.g., "give up", "look forward to")

Step 4: Calculate Difficulty
  For each word:
    word_length = len(word_text)

    if word_length <= 4:
      difficulty = "easy"
    elif word_length <= 7:
      difficulty = "medium"
    elif word_length <= 10:
      difficulty = "hard"
    else:
      difficulty = "very_hard"

Step 5: Enrich Words (API call or database lookup)
  For each unique word:
    - Fetch or generate phonetic transcription (IPA)
    - Fetch definition from dictionary API
    - Determine part of speech using NLP tagging
    - Generate example sentence (template-based or AI)

  Use caching to avoid redundant API calls

Step 6: Deduplication
  - Check against Words master table (exact match on word_text)
  - If exists: reuse existing word_id
  - If new: insert into Words table

  - Check against User_Words table
  - If user already learning this word: skip or merge
  - If user mastered (memory = 100): skip

Step 7: Save to Database
  For each new word for user:
    INSERT INTO user_words (
      user_id,
      word_id,
      memory_level = 0,
      first_added_at = now(),
      created_at = now()
    )

Output: List of word objects with enriched data, ready for feed
```

---

## 4. User Flows

### 4.1 First-Time Learning Flow

1. User opens app (assumes auth is complete)
2. Welcome screen: "Let's build your vocabulary!"
3. Prompt: "Add your first content - paste a song, paragraph, or topic"
4. User pastes song lyrics
5. Tap "Process" button
6. Loading screen: "Extracting vocabulary..." (3-5 seconds)
7. Preview screen shows:
   - "Found 47 words!"
   - Difficulty breakdown: 15 easy, 20 medium, 10 hard, 2 very hard
   - Scrollable list of words with remove option
8. User taps "Add to Feed"
9. Success message: "47 words added! Start learning now?"
10. Opens Words Feed showing scrollable list of cards (all at memory level 0)
11. Tutorial overlay (first time only):
    - "Scroll to browse your words"
    - "Tap any card to flip and see definition"
    - "Swipe right if you know it, left if you need review"
12. User starts scrolling and reviewing cards

### 4.2 Daily Learning Flow

1. User receives notification: "12 critical words need review!"
2. Opens app → Lands on Words Feed
3. Daily goal banner: "0/30 words reviewed today"
4. Feed displays scrollable list of cards (shows 2-3 cards in viewport initially)
5. User scrolls through feed, each card shows:
   - Front: Word + phonetics + memory bar
   - Difficulty badge: "Medium"
6. User taps first card to flip → Sees definition and example
7. User knows this word → Swipe right on the card
8. Animation: Green checkmark overlay, +10 memory points
9. Card updates in place (new memory level: 25)
10. User continues scrolling to next cards
11. Some cards user just scrolls past (no action needed)
12. Some cards user flips and swipes (marks known or needs review)
13. Daily goal updates in real-time: "8/30", "15/30", etc.
14. User scrolls to bottom → More cards load automatically
15. After reviewing 30 word interactions:
16. Celebration banner appears at top: "Daily goal achieved! 🎉"
    - Shows: "+320 memory points gained"
    - "3 words reached mastery!"
17. User can continue scrolling to review more, or navigate away

### 4.3 Content Addition Flow

1. User taps "+" button (floating action button or nav bar)
2. Modal appears: "Add new content"
3. Tabs: Song | Paragraph | Topic | Manual
4. User selects "Paragraph" tab
5. Large text area with placeholder: "Paste or type your content here..."
6. User pastes article text (500 words)
7. Character count shows: "2,450 / 5,000 characters"
8. Tap "Extract Words" button
9. Processing screen with progress indicator
10. Preview screen:
    - "Extracted 82 words and 15 phrases"
    - Grouped by difficulty (collapsible sections)
    - Checkboxes to include/exclude specific words
11. User reviews and unticks 3 words they don't want
12. Tap "Add 79 Words to Feed"
13. Confirmation: "79 new words added! They'll appear in your feed."
14. Automatically returns to feed, scrolls to top where new words are prioritized

### 4.4 Statistics Review Flow

1. User taps "Stats" tab in bottom navigation
2. Dashboard loads showing:
   - Total vocabulary: 342 words
   - Mastered: 28 words (100 memory level)
   - Average memory: 47/100
   - Today: 15 words reviewed
3. User scrolls down to see:
   - Memory health pie chart (visual distribution)
   - Progress over time line graph (last 30 days)
   - Current streak: 7 days 🔥
4. User taps on "Critical Words: 12"
5. Drills down to list of critical words (memory < 20)
6. Each word shows mini card with memory level
7. User taps specific word: "procrastination"
8. Word detail page opens:
   - Current memory: 18/100
   - Last reviewed: 3 days ago
   - Times reviewed: 8
   - Memory history graph (showing decline)
   - Prediction: "Will reach 0 in ~18 days without review"
9. Quick action button: "Review Now"
10. Tapping opens feed filtered to just this word
11. User reviews and marks known → Memory jumps to 28
12. Returns to stats, word moved to "Learning" category

### 4.5 Memory Decay & Recovery Flow

1. User stops using app for 5 days
2. Background job runs daily:
   - Day 1: All words decay by -1 (342 words affected)
   - Day 2: All words decay by -1 (15 words now critical, <20)
   - Day 3: All words decay by -1 (28 words now critical)
   - Day 4: Notification sent: "28 critical words need review!"
   - Day 5: All words decay by -1 (5 words reach 0 - forgotten)
3. User returns and opens app
4. Dashboard shows alarming stats:
   - Critical words: 35
   - Average memory: 42/100 (was 47)
   - Words forgotten: 5
5. Banner message: "Welcome back! Your vocabulary needs attention."
6. User taps "Review Critical Words" button
7. Feed loads with filter applied, showing scrollable list of critical words only
8. User scrolls through, flipping and marking cards as known
9. Spends 15 minutes reviewing, marks 25 words as known
10. Memory levels increase:
    - Most words: +10 points (now 25-30 range)
    - 3 words show quick learning: +20 bonus (now 35-40)
11. User scrolls back to top, switches filter to "All" to see overall progress
12. Critical count dropped from 35 to 10
13. Encouraging banner appears: "Great work! Keep it up tomorrow!"
