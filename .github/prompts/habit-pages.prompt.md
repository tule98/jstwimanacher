---
agent: agent
---

# Mobile-First Design Specification for Habit Tracking Application

## 1. Information Architecture & Navigation

### Primary Navigation Structure

```
┌─────────────────────────────┐
│   Bottom Tab Navigation     │
├─────────────────────────────┤
│ Today | Stats | Profile     │
└─────────────────────────────┘
```

**Navigation Flow**:

- **Today Tab** (Home): Primary habit tracking interface
- **Stats Tab**: Analytics and historical data visualization
- **Profile Tab**: Settings, archived habits, and account management

---

## 2. Page Specifications

### 2.1 Today Page (Home/Primary Screen)

**Purpose**: Central hub for daily habit tracking and completion

**Layout Structure**:

```
┌─────────────────────────────────┐
│ Header                          │
│ ┌─────────────────────────────┐ │
│ │ Date & Streak Summary       │ │
│ │ Token Counter               │ │
│ └─────────────────────────────┘ │
│                                 │
│ Active Habits List              │
│ ┌─────────────────────────────┐ │
│ │ HabitCard (Pending)         │ │
│ │ HabitCard (Completed)       │ │
│ │ HabitCard (Pending)         │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [+ Add New Habit] Button        │
└─────────────────────────────────┘
```

**Component Composition**:

1. **Header Section**

   - Current date display (large, readable)
   - Daily summary stats: "3/5 habits completed"
   - Streak freeze tokens: Icon with count badge
   - Scrolls away on list scroll to maximize content space

2. **HabitCard Component** (Pending State)

   - Habit name (truncated if long)
   - Current streak number with fire emoji
   - Frequency indicator (daily/specific days)
   - Large tap area for check-off action
   - Visual hierarchy: Name > Streak > Frequency

3. **HabitCard Component** (Completed State)

   - Dimmed/muted appearance
   - Checkmark indicator
   - Selected mood emoji displayed
   - Streak number (updated)
   - Tap to view/edit mood emoji

4. **Empty State**

   - Illustration/icon
   - "Start building your first habit"
   - Direct CTA to create habit

5. **Floating Action Button (FAB)**
   - Fixed position (bottom-right)
   - "+" icon for quick habit creation
   - Appears above bottom navigation

**Interaction Flows**:

- **Flow 1: Complete a Habit**

  1. User taps on pending HabitCard
  2. Card animates (scale/color shift)
  3. Mood emoji selector modal slides up from bottom
  4. User selects emoji (or skips)
  5. Modal dismisses, card transitions to completed state
  6. Streak increments with celebratory micro-animation

- **Flow 2: Use Streak Freeze Token**
  1. User long-presses on HabitCard OR taps token icon
  2. Confirmation modal appears
  3. "Use token to protect this streak?"
  4. User confirms
  5. Token decrements, visual indicator on habit
  6. Toast notification confirms action

**Screen States**:

- **Loading**: Skeleton screens for habit cards
- **Empty**: No habits created yet
- **Partial Completion**: Mix of completed/pending
- **All Complete**: Celebratory banner at top
- **Error**: Retry banner if sync fails

---

### 2.2 Habit Creation/Edit Modal

**Purpose**: Streamlined habit setup and modification

**Layout Structure**:

```
┌─────────────────────────────────┐
│ [X]              [Save]         │
│                                 │
│ Habit Details                   │
│ ┌─────────────────────────────┐ │
│ │ Name Input                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Description (Optional)      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Frequency                       │
│ ┌─────────────────────────────┐ │
│ │ [Daily] [Custom Days]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Custom Days Selector            │
│ [M] [T] [W] [T] [F] [S] [S]    │
│                                 │
│ Start Date                      │
│ [Today] [Pick Date]             │
└─────────────────────────────────┘
```

**Component Composition**:

1. **Modal Container**

   - Full-screen on mobile (slide-up animation)
   - Dismissible with swipe-down gesture
   - Close button (top-left)
   - Save button (top-right, enabled when valid)

2. **Form Section**

   - Name input field (character limit: 50)
   - Description textarea (optional, character limit: 200)
   - Auto-focus on name field when modal opens

3. **Frequency Selector**

   - Toggle buttons: "Daily" / "Custom Days"
   - When custom selected, day picker appears below
   - Day picker: 7 circular buttons (M-S)
   - Multi-select interaction
   - Minimum 1 day must be selected

4. **Start Date Selector**
   - Default: Today
   - "Pick Date" opens date picker
   - Cannot select past dates
   - Shows selected date when not today

**Validation**:

- Name is required
- At least one frequency day selected (if custom)
- Real-time validation feedback
- Disabled save button until valid

**Interaction Flows**:

- **Flow 1: Create New Habit**

  1. User taps FAB or "Add Habit" button
  2. Modal slides up from bottom
  3. User enters habit name
  4. User optionally adds description
  5. User selects frequency (daily by default)
  6. User confirms or modifies start date
  7. User taps "Save"
  8. Modal dismisses, new habit appears in list
  9. Success toast notification

- **Flow 2: Edit Existing Habit**
  1. User taps habit card (long-press or menu)
  2. Context menu appears: "Edit" / "Archive" / "Delete"
  3. User taps "Edit"
  4. Modal opens with pre-filled data
  5. User modifies fields
  6. User taps "Save"
  7. Changes reflect immediately in list

---

### 2.3 Mood Emoji Selector Modal

**Purpose**: Quick emotional state capture after habit completion

**Layout Structure**:

```
┌─────────────────────────────────┐
│                                 │
│   How did you feel?             │
│                                 │
│   😊  😐  😴  ⚡  😰            │
│                                 │
│   [Skip]                        │
└─────────────────────────────────┘
```

**Component Composition**:

1. **Bottom Sheet Modal**

   - Slides up from bottom (partial screen)
   - Semi-transparent backdrop
   - Dismissible by tapping backdrop or skip

2. **Emoji Grid**

   - 5-8 large, tappable emoji buttons
   - Grid layout (3-4 per row on mobile)
   - Emojis: 😊 Happy, 😐 Neutral, 😴 Tired, ⚡ Energized, 😰 Stressed, 😤 Frustrated, 🎯 Focused, 😌 Calm

3. **Skip Option**
   - Text link at bottom
   - Allows dismissing without selection

**Interaction Flow**:

1. Modal appears immediately after habit check-off
2. User taps an emoji
3. Modal dismisses with fade animation
4. Emoji appears on completed habit card
5. Data saved with timestamp

**Alternative Interaction**:

- User taps "Skip"
- Modal dismisses without emoji
- Habit remains checked but no mood recorded

---

### 2.4 Stats Page

**Purpose**: Visualize progress, patterns, and achievements

**Layout Structure**:

```
┌─────────────────────────────────┐
│ Header                          │
│ ┌─────────────────────────────┐ │
│ │ Time Range Selector         │ │
│ │ [Week] [Month] [Year]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Overall Stats Card              │
│ ┌─────────────────────────────┐ │
│ │ Completion Rate: 85%        │ │
│ │ Longest Streak: 42 days     │ │
│ │ Total Completions: 234      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Habit-Specific Breakdown        │
│ ┌─────────────────────────────┐ │
│ │ HabitStatsCard              │ │
│ │ HabitStatsCard              │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Mood Insights Card              │
│ ┌─────────────────────────────┐ │
│ │ Most Common Mood: 😊        │ │
│ │ Mood Distribution Chart     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Component Composition**:

1. **Time Range Selector**

   - Segmented control: Week / Month / Year / All Time
   - Filters all stats below
   - Sticky header (remains visible on scroll)

2. **Overall Stats Card**

   - Summary metrics in large text
   - Completion rate (percentage with progress ring)
   - Longest streak (with fire emoji)
   - Total completions count
   - Card has subtle elevation/shadow

3. **HabitStatsCard Component**

   - Habit name
   - Mini calendar heatmap (last 30 days)
   - Current streak
   - Completion rate for period
   - Average mood emoji (if available)
   - Tappable to expand to detailed view

4. **Mood Insights Card**
   - Pie chart or bar chart of mood distribution
   - Most frequent mood highlighted
   - Correlation insights (e.g., "You felt most energized on Mondays")

**Interaction Flows**:

- **Flow 1: View Time-Based Stats**

  1. User navigates to Stats tab
  2. Default view: Current week
  3. User taps different time range
  4. All cards update with animation
  5. Charts re-render smoothly

- **Flow 2: Drill Down on Habit**
  1. User taps on HabitStatsCard
  2. Detailed modal/page opens
  3. Shows: Full calendar view, streak history graph, mood timeline
  4. User can swipe through habits
  5. Back button returns to stats overview

**Screen States**:

- **Loading**: Skeleton components for cards
- **Empty**: "Start tracking to see stats"
- **Insufficient Data**: "Keep tracking for insights" (needs 7+ days)
- **Error**: Retry button if data fails to load

---

### 2.5 Profile Page

**Purpose**: User settings, account management, and archived habits

**Layout Structure**:

```
┌─────────────────────────────────┐
│ Profile Header                  │
│ ┌─────────────────────────────┐ │
│ │ User Avatar                 │ │
│ │ Token Balance: 2/2          │ │
│ └─────────────────────────────┘ │
│                                 │
│ Settings List                   │
│ ┌─────────────────────────────┐ │
│ │ > Archived Habits           │ │
│ │ > Notifications             │ │
│ │ > Data & Privacy            │ │
│ │ > Theme Settings            │ │
│ │ > About                     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Sign Out]                      │
└─────────────────────────────────┘
```

**Component Composition**:

1. **Profile Header**

   - User avatar (optional photo)
   - Token balance prominently displayed
   - Monthly reset countdown (small text)

2. **Settings List**

   - List of navigation items
   - Chevron indicators for navigation
   - Grouped logically (Habits, Preferences, Account)

3. **Archived Habits Section** (Separate Page)
   - List of archived habits with data
   - Shows final streak, total completions
   - Actions: Reactivate / Permanently Delete

**Interaction Flows**:

- **Flow 1: View Archived Habits**

  1. User taps "Archived Habits"
  2. New page loads with archived list
  3. User can tap habit for details
  4. User can reactivate or delete
  5. Confirmation modal for destructive actions

- **Flow 2: Manage Notifications**
  1. User taps "Notifications"
  2. Settings page with toggles
  3. Daily reminder time picker
  4. Encouragement notifications toggle

---

## 3. Cross-Cutting Component Specifications

### 3.1 Confirmation Modal Component

**Purpose**: Prevent accidental destructive actions

**Structure**:

- Title (e.g., "Delete habit?")
- Description text explaining consequence
- Two buttons: "Cancel" (secondary) / "Confirm" (primary/destructive)
- Used for: deleting habits, using streak freeze tokens

---

### 3.2 Toast Notification Component

**Purpose**: Provide lightweight feedback for user actions

**Types**:

- Success (green): "Habit completed! 🎉"
- Info (blue): "Streak saved with token"
- Error (red): "Failed to sync. Retry?"
- Appears at top or bottom
- Auto-dismisses after 3-4 seconds
- Swipeable to dismiss

---

### 3.3 Loading States

**Patterns**:

- **Skeleton Screens**: For habit cards, stats cards
- **Spinners**: For button actions (save, delete)
- **Progress Bars**: For data sync operations
- **Shimmer Effect**: On skeleton screens for polish

---

## 4. Key User Flows

### Flow A: First-Time User Experience

1. User opens app (no account yet)
2. Onboarding carousel (3 screens): Core concept, streak system, mood tracking
3. "Get Started" button
4. Create first habit (modal opens)
5. User completes form, saves
6. Lands on Today page with one habit
7. Completion tooltip appears: "Tap to complete"

### Flow B: Daily Check-In Ritual

1. User opens app
2. Sees Today page with pending habits
3. Completes first habit → emoji selector
4. Selects mood → card updates with animation
5. Repeats for other habits
6. Last habit completion triggers celebration
7. Banner: "All done for today! 🎉"

### Flow C: Streak Recovery

1. User misses a day, streak breaks
2. Opens app next day
3. Sees broken streak notice (subtle, non-shaming)
4. Token indicator reminds of availability
5. User can choose to use token retroactively (if within 24h)
6. Or accepts reset and continues fresh

### Flow D: Habit Management

1. User long-presses habit card
2. Context menu: Edit / Archive / Delete
3. Selects "Archive"
4. Confirmation modal appears
5. User confirms
6. Habit removed from Today view
7. Toast: "Habit archived. Find it in Profile > Archived"

---

## 5. Responsive & Accessibility Considerations

### Mobile-First Breakpoints

- **Small phones** (320-375px): Single column, compact spacing
- **Standard phones** (375-414px): Optimal layout, primary target
- **Large phones/small tablets** (414-768px): Slightly larger touch targets

### Touch Targets

- Minimum 44x44px for all interactive elements
- Generous padding around HabitCards
- Swipe gestures for secondary actions

### Accessibility

- High contrast mode support
- Large text support (dynamic type)
- Screen reader labels for all interactive elements
- Haptic feedback for completions
- Keyboard navigation for modals

---

## 6. State Management Considerations

### Local State (Per Screen)

- Modal open/closed states
- Form input values
- Selected time ranges on Stats page

### Global State (App-Wide)

- Active habits list
- Completion records
- Streak data
- Token balance
- User preferences

### Offline-First Strategy

- All completions saved locally first
- Background sync when connection available
- Conflict resolution (last-write-wins)
- Sync status indicator in UI

---

## 7. Animation & Transition Specifications

### Key Animations

1. **Habit Completion**: Scale up + color shift + checkmark fade-in (300ms)
2. **Streak Increment**: Number count-up animation (500ms)
3. **Modal Entry**: Slide-up from bottom (250ms ease-out)
4. **Modal Exit**: Slide-down (200ms ease-in)
5. **List Reordering**: Smooth position transitions (300ms)
6. **Celebration**: Confetti or pulse effect on full completion

### Micro-interactions

- Button press: Subtle scale (95%)
- Card hover/focus: Elevation increase
- Swipe-to-delete: Follow finger with resistance
- Pull-to-refresh: Custom habit-themed animation

---

## 8. Future Scalability Considerations

### Designed for Growth

- **Habit Categories**: Add grouping/filtering when users have 10+ habits
- **Social Features**: Architecture supports adding friend streaks, challenges
- **Insights**: Stats page can accommodate ML-driven recommendations
- **Gamification**: Token system can expand to rewards/achievements
- **Premium Features**: Modular design allows gating advanced analytics

### Component Reusability

- HabitCard used in multiple contexts (Today, Stats, Archive)
- Modal container reusable for various forms
- Stats cards composable for different metrics
- Consistent design language enables rapid feature addition

---

This specification provides a comprehensive mobile-first blueprint for implementing all core and primary functionality features. The design prioritizes simplicity, speed, and positive reinforcement while maintaining the flexibility to scale with additional features. Each component and flow has been considered for optimal user experience on mobile devices while respecting the psychological aspects of habit formation and maintenance.
