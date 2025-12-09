# Module Overview

Streak Saver is a module that combines traditional streak counting with emoji-based mood logging and a forgiving "streak freeze" system. The app acknowledges that consistent habit formation is influenced by emotional states and that perfection isn't realistic, offering users a more compassionate approach to building lasting habits.

## Target Users

- Individuals looking to build and maintain positive habits
- People who have abandoned traditional habit trackers due to guilt from broken streaks
- Users interested in understanding the emotional patterns behind their consistency
- Habit enthusiasts seeking a lightweight, emotionally-aware tracking solution

## Core Value Proposition

Provides emotionally intelligent habit tracking that reduces user abandonment through forgiving streak management while revealing insights into the relationship between mood and habit consistency.

---

# Feature Breakdown

## Core Features

### **Feature Name**: Single-Tap Habit Check-off

**Category**: Core Features  
**Description**: Users can mark a habit as complete with a single tap, minimizing friction in the tracking process.  
**User Story**: As a user, I want to quickly check off completed habits so that tracking doesn't become a burden itself.  
**Acceptance Criteria**:

- Habit can be marked complete with one tap/click
- Visual confirmation appears immediately (checkmark, animation, or color change)
- Completion is saved locally and synced to cloud when connection available
- Completion timestamp is recorded

**Priority**: High  
**Dependencies**: None

---

### **Feature Name**: Streak Counter

**Category**: Core Features  
**Description**: Automatically calculates and displays consecutive days a habit has been completed, providing visual motivation for consistency.  
**User Story**: As a user, I want to see how many consecutive days I've completed a habit so that I feel motivated to maintain my progress.  
**Acceptance Criteria**:

- Streak increments by 1 for each consecutive day of completion
- Streak resets to 0 if a day is missed (unless streak freeze is active)
- Current streak number is prominently displayed for each habit
- Historical streak data is preserved

**Priority**: High  
**Dependencies**: Single-Tap Habit Check-off

---

### **Feature Name**: Emoji Mood Selection

**Category**: Core Features  
**Description**: Users select an emoji immediately after checking off a habit to capture their emotional state while performing the activity.  
**User Story**: As a user, I want to record how I felt while completing a habit so that I can understand my emotional patterns over time.  
**Acceptance Criteria**:

- Emoji picker appears after habit check-off
- Minimum of 5-8 mood emojis available (happy, neutral, tired, energized, stressed, etc.)
- Emoji selection is optional but encouraged
- Selected emoji is stored with the habit completion record

**Priority**: High  
**Dependencies**: Single-Tap Habit Check-off

---

### **Feature Name**: Streak Freeze Tokens

**Category**: Core Features  
**Description**: Users receive 1-2 tokens per month that can be used to "pause" a streak for a day without breaking it, acknowledging that life happens.  
**User Story**: As a user, I want to protect my streak on difficult days so that I don't feel guilty and abandon the app entirely.  
**Acceptance Criteria**:

- Users receive 1-2 tokens at the start of each month
- Tokens can be applied to any habit on any day
- Token usage prevents streak from breaking for that day
- Token count is visible in the UI
- Unused tokens expire at month end (no rollover)

**Priority**: High  
**Dependencies**: Streak Counter

---

## User Management Features

### **Feature Name**: User Account Creation

**Category**: User Management Features  
**Description**: Simple account registration process to enable cloud backup and cross-device synchronization.  
**User Story**: As a user, I want to create an account so that my habit data is backed up and accessible across devices.  
**Acceptance Criteria**:

- Email/password or OAuth (Google, Apple) registration options
- Email verification for security
- Account creation completes in under 2 minutes
- Privacy policy and terms acceptance required

**Priority**: High  
**Dependencies**: None

---

### **Feature Name**: User Authentication

**Category**: User Management Features  
**Description**: Secure login system allowing users to access their data across devices.  
**User Story**: As a user, I want to securely log into my account so that I can access my habits on multiple devices.  
**Acceptance Criteria**:

- Email/password and OAuth login options
- "Remember me" functionality for convenience
- Password reset via email
- Session management with automatic logout after extended inactivity

**Priority**: High  
**Dependencies**: User Account Creation

---

### **Feature Name**: User Profile Settings

**Category**: User Management Features  
**Description**: Basic profile management including notification preferences, timezone settings, and account information.  
**User Story**: As a user, I want to customize my account settings so that the app works according to my preferences.  
**Acceptance Criteria**:

- Edit display name and timezone
- Manage notification preferences (time, frequency)
- View account information (email, creation date)
- Option to delete account with data purge

**Priority**: Medium  
**Dependencies**: User Account Creation

---

## Primary Functionality Features

### **Feature Name**: Habit Creation

**Category**: Primary Functionality Features  
**Description**: Users can create custom habits with names, optional descriptions, and frequency goals (daily, specific days of week).  
**User Story**: As a user, I want to create personalized habits so that I can track activities meaningful to me.  
**Acceptance Criteria**:

- Create habit with custom name (required)
- Add optional description/notes
- Set frequency: daily or select specific days of week
- Set start date for the habit
- Limit of 10-15 active habits per user (to maintain focus)

**Priority**: High  
**Dependencies**: None

---

### **Feature Name**: Habit List View

**Category**: Primary Functionality Features  
**Description**: Main screen displaying all active habits with their current streaks, today's completion status, and available actions.  
**User Story**: As a user, I want to see all my habits at a glance so that I know what I need to complete today.  
**Acceptance Criteria**:

- All active habits displayed in a scrollable list
- Each habit shows: name, current streak, today's completion status
- Visual differentiation between completed and pending habits
- Quick access to check-off and emoji selection
- Smooth scrolling and performant rendering

**Priority**: High  
**Dependencies**: Habit Creation, Streak Counter

---

### **Feature Name**: Habit Editing

**Category**: Primary Functionality Features  
**Description**: Users can modify habit details including name, description, and frequency after creation.  
**User Story**: As a user, I want to edit my habits so that I can refine them as my routines evolve.  
**Acceptance Criteria**:

- Edit habit name, description, and frequency
- Changes save immediately with confirmation
- Editing doesn't affect historical streak data
- Cannot change habit to a past start date

**Priority**: Medium  
**Dependencies**: Habit Creation

---

### **Feature Name**: Habit Deletion/Archiving

**Category**: Primary Functionality Features  
**Description**: Users can remove habits they no longer want to track, with option to archive (preserve data) or permanently delete.  
**User Story**: As a user, I want to remove outdated habits so that my list stays relevant and manageable.  
**Acceptance Criteria**:

- Option to archive (hide but preserve data) or delete (permanent removal)
- Confirmation dialog before deletion
- Archived habits can be viewed in separate section
- Archived habits can be reactivated
- Deleted habits cannot be recovered

**Priority**: Medium  
**Dependencies**: Habit Creation

---

## Data & Content Features

### **Feature Name**: Local Data Storage

**Category**: Data & Content Features  
**Description**: SQLite database stores all habit data locally on device for offline functionality and fast performance.  
**User Story**: As a user, I want my data stored on my device so that the app works even without internet connection.  
**Acceptance Criteria**:

- All habit data (completions, streaks, moods) stored in SQLite
- App functions fully offline
- Data structure optimized for quick queries
- Database encryption for sensitive information

**Priority**: High  
**Dependencies**: None

---

### **Feature Name**: Cloud Backup & Sync

**Category**: Data & Content Features  
**Description**: Firebase integration automatically backs up user data to the cloud and syncs across devices.  
**User Story**: As a user, I want my data backed up to the cloud so that I don't lose progress if I change devices.  
**Acceptance Criteria**:

- Automatic sync when internet connection available
- Conflict resolution prioritizes most recent data
- Sync status indicator in UI
- Initial data restore on new device login
- Sync occurs in background without blocking UI

**Priority**: High  
**Dependencies**: Local Data Storage, User Authentication

---

### **Feature Name**: Habit History View

**Category**: Data & Content Features  
**Description**: Calendar or timeline view showing historical completions, streaks, and mood data for each habit.  
**User Story**: As a user, I want to review my habit history so that I can see my progress over time.  
**Acceptance Criteria**:

- View completions for past 30/90 days minimum
- Calendar view with visual indicators for completed/missed days
- Display emoji mood for each completion
- Show longest streak and current streak
- Filter by specific habit

**Priority**: Medium  
**Dependencies**: Single-Tap Habit Check-off, Emoji Mood Selection

---

### **Feature Name**: Mood-Streak Correlation Insights

**Category**: Data & Content Features  
**Description**: Simple visualization showing patterns between emoji moods selected and habit consistency.  
**User Story**: As a user, I want to see how my mood affects my habits so that I can understand my behavioral patterns.  
**Acceptance Criteria**:

- Chart/graph showing most common moods when completing habits
- Identify which moods correlate with longer streaks
- Compare mood distribution across different habits
- Simple, non-technical language in insights
- Updated weekly or monthly

**Priority**: Medium  
**Dependencies**: Emoji Mood Selection, Habit History View

---

## Integration Features

### **Feature Name**: Firebase Authentication Integration

**Category**: Integration Features  
**Description**: Integration with Firebase Auth for secure user authentication and OAuth providers.  
**User Story**: As a developer, I want secure authentication handled by Firebase so that user accounts are protected.  
**Acceptance Criteria**:

- Email/password authentication via Firebase
- Google and Apple OAuth integration
- Secure token management
- Password reset functionality
- Session persistence

**Priority**: High  
**Dependencies**: None

---

### **Feature Name**: Firebase Cloud Storage Integration

**Category**: Integration Features  
**Description**: Firebase Firestore or Realtime Database integration for cloud data backup and synchronization.  
**User Story**: As a developer, I want reliable cloud storage so that user data is safely backed up.  
**Acceptance Criteria**:

- Firestore database setup with proper security rules
- Automatic sync triggers on data changes
- Efficient query structure for performance
- Data structure supports future scaling
- Backup retention policy implemented

**Priority**: High  
**Dependencies**: Firebase Authentication Integration

---

### **Feature Name**: Push Notification Service

**Category**: Integration Features  
**Description**: Firebase Cloud Messaging or native notification service for daily habit reminders.  
**User Story**: As a user, I want reminder notifications so that I don't forget to complete my habits.  
**Acceptance Criteria**:

- Daily notification at user-specified time
- Notification shows pending habits for the day
- Users can customize notification time per habit
- Option to disable notifications entirely
- Notifications work reliably across iOS and Android

**Priority**: Medium  
**Dependencies**: User Profile Settings

---

## UI/UX Features

### **Feature Name**: Onboarding Flow

**Category**: UI/UX Features  
**Description**: First-time user experience that explains core concepts (streaks, moods, freeze tokens) and guides habit creation.  
**User Story**: As a new user, I want to understand how the app works so that I can start tracking effectively.  
**Acceptance Criteria**:

- 3-5 screens explaining key features
- Skip option available
- Guides user through creating first habit
- Introduces emoji mood selection concept
- Explains streak freeze tokens
- Can be revisited from settings

**Priority**: Medium  
**Dependencies**: Habit Creation

---

### **Feature Name**: Intuitive Navigation

**Category**: UI/UX Features  
**Description**: Simple bottom navigation or tab bar providing access to main app sections (habits, history, profile).  
**User Story**: As a user, I want easy navigation so that I can access different parts of the app quickly.  
**Acceptance Criteria**:

- Bottom navigation bar with 3-4 main sections
- Clear icons and labels
- Active section visually indicated
- Smooth transitions between sections
- Follows platform design guidelines (Material/iOS)

**Priority**: High  
**Dependencies**: None

---

### **Feature Name**: Visual Feedback & Animations

**Category**: UI/UX Features  
**Description**: Satisfying animations and visual confirmations when completing habits, earning streaks, or using freeze tokens.  
**User Story**: As a user, I want delightful feedback when I complete habits so that the experience feels rewarding.  
**Acceptance Criteria**:

- Checkmark animation on habit completion
- Streak milestone celebrations (7, 30, 100 days)
- Visual indication when freeze token is used
- Smooth transitions and micro-interactions
- Performance remains smooth (60fps)

**Priority**: Medium  
**Dependencies**: Single-Tap Habit Check-off, Streak Counter

---

### **Feature Name**: Dark Mode Support

**Category**: UI/UX Features  
**Description**: Alternative dark color scheme for comfortable viewing in low-light conditions.  
**User Story**: As a user, I want dark mode so that I can use the app comfortably at night.  
**Acceptance Criteria**:

- Dark theme for all screens
- Follows system dark mode setting automatically
- Manual toggle option in settings
- Proper contrast ratios for accessibility
- Smooth theme switching

**Priority**: Low  
**Dependencies**: None

---

## Administrative Features

### **Feature Name**: Basic Analytics Dashboard

**Category**: Administrative Features  
**Description**: Internal dashboard tracking key metrics like user retention, daily active users, and feature usage.  
**User Story**: As a product owner, I want to monitor app health so that I can make data-driven decisions.  
**Acceptance Criteria**:

- Track daily/monthly active users
- Monitor average streak lengths
- Track feature usage (freeze tokens, mood selection rate)
- User retention rates (Day 1, Day 7, Day 30)
- Export data for further analysis

**Priority**: Medium  
**Dependencies**: Cloud Backup & Sync

---

### **Feature Name**: Error Logging & Monitoring

**Category**: Administrative Features  
**Description**: System for capturing and reporting app errors and crashes to enable quick bug fixes.  
**User Story**: As a developer, I want to know when errors occur so that I can fix issues proactively.  
**Acceptance Criteria**:

- Crash reporting integration (Firebase Crashlytics or Sentry)
- Error logs include device info and stack traces
- Alert system for critical errors
- User privacy maintained (no PII in logs)
- Dashboard for reviewing error trends

**Priority**: High  
**Dependencies**: None

---

## Nice-to-Have Features

### **Feature Name**: Habit Templates

**Category**: Nice-to-Have Features  
**Description**: Pre-built habit templates for common activities (exercise, meditation, reading) that users can quickly add.  
**User Story**: As a user, I want to choose from suggested habits so that I don't have to think about what to track.  
**Acceptance Criteria**:

- 10-15 common habit templates available
- Templates include suggested name and description
- Users can customize template before adding
- Templates organized by category (health, productivity, wellness)

**Priority**: Low  
**Dependencies**: Habit Creation

---

### **Feature Name**: Social Sharing

**Category**: Nice-to-Have Features  
**Description**: Optional ability to share streak milestones or achievements on social media.  
**User Story**: As a user, I want to share my achievements so that I can celebrate with friends and stay accountable.  
**Acceptance Criteria**:

- Share streak milestones (7, 30, 100 days)
- Generate shareable image with stats
- Support for major platforms (Instagram, Twitter, Facebook)
- Privacy settings to control what's shared
- No forced or intrusive sharing prompts

**Priority**: Low  
**Dependencies**: Streak Counter

---

### **Feature Name**: Habit Streaks Leaderboard

**Category**: Nice-to-Have Features  
**Description**: Optional community leaderboard showing longest streaks (anonymously) to inspire users.  
**User Story**: As a user, I want to see how my streaks compare to others so that I feel motivated by friendly competition.  
**Acceptance Criteria**:

- Opt-in leaderboard system
- Anonymous display (no personal info shown)
- Filter by habit type/category
- Weekly or monthly resets available
- Users can disable leaderboard visibility

**Priority**: Low  
**Dependencies**: Streak Counter, User Account Creation

---

### **Feature Name**: Habit Buddy/Accountability Partner

**Category**: Nice-to-Have Features  
**Description**: Connect with one other user to share progress and encourage each other on specific habits.  
**User Story**: As a user, I want to connect with a friend so that we can support each other's habit goals.  
**Acceptance Criteria**:

- Send/accept buddy requests
- View buddy's progress on shared habits only
- Send encouragement messages
- Privacy controls for what's visible
- Limit to 1-3 buddies to maintain intimacy

**Priority**: Low  
**Dependencies**: User Account Creation, Cloud Backup & Sync

---

### **Feature Name**: Habit Journaling

**Category**: Nice-to-Have Features  
**Description**: Optional text notes field where users can write quick reflections after completing habits.  
**User Story**: As a user, I want to add notes to my habits so that I can track context beyond just completion and mood.  
**Acceptance Criteria**:

- Text input field after emoji selection (optional)
- Character limit (e.g., 200-300 characters)
- Notes searchable in history
- Quick prompts to inspire journaling
- Export notes capability

**Priority**: Low  
**Dependencies**: Emoji Mood Selection, Habit History View

---

### **Feature Name**: Data Export

**Category**: Nice-to-Have Features  
**Description**: Users can export their complete habit data in CSV or JSON format for personal backup or analysis.  
**User Story**: As a user, I want to export my data so that I can keep a personal backup or analyze it elsewhere.  
**Acceptance Criteria**:

- Export all habit data (completions, moods, streaks)
- CSV and JSON format options
- Export via email or save to device
- Include date ranges for selective export
- Privacy notice about exported data

**Priority**: Low  
**Dependencies**: Habit History View

---

### **Feature Name**: Widget Support

**Category**: Nice-to-Have Features  
**Description**: Home screen widgets showing today's pending habits for quick check-ins without opening the app.  
**User Story**: As a user, I want a home screen widget so that I can see my habits at a glance.  
**Acceptance Criteria**:

- Widget displays today's habits
- Tap widget to open app
- Multiple widget size options
- Updates in real-time when habits completed
- Works on both iOS and Android

**Priority**: Low  
**Dependencies**: Habit List View

---

# Development Recommendations

## Phase 1 (MVP - 2-3 months)

**Timeline**: 8-12 weeks  
**Focus**: Core habit tracking with emotional awareness and streak protection

**Essential Features**:

- User Account Creation & Authentication
- Habit Creation & Habit List View
- Single-Tap Habit Check-off
- Emoji Mood Selection
- Streak Counter
- Streak Freeze Tokens
- Local Data Storage
- Cloud Backup & Sync (Firebase)
- Basic push notifications for daily reminders
- Intuitive Navigation
- Error Logging & Monitoring
- Simple onboarding flow

**Success Metrics**:

- Users can create and track 3+ habits
- 60%+ emoji mood selection rate on completions
- Functional offline mode
- Data syncs reliably across devices

---

## Phase 2 (Enhancement - 1-2 months)

**Timeline**: 4-8 weeks post-MVP  
**Focus**: Insights, personalization, and engagement improvements

**Features to Add**:

- Habit History View with calendar visualization
- Mood-Streak Correlation Insights
- Habit Editing & Deletion/Archiving
- User Profile Settings with notification customization
- Visual Feedback & Animations for milestone celebrations
- Basic Analytics Dashboard for monitoring
- Enhanced onboarding with better education

**Success Metrics**:

- Users review history 2+ times per week
- 70%+ users engage with insights feature
- Improved Day 7 retention (target: 40%+)
- Reduced habit abandonment rates

---

## Phase 3 (Advanced - 2-3 months)

**Timeline**: 8-12 weeks after Phase 2  
**Focus**: Community, expansion features, and polish

**Features to Add**:

- Habit Templates for quick setup
- Dark Mode Support
- Social Sharing for milestone celebrations
- Habit Journaling with reflection prompts
- Data Export functionality
- Habit Buddy/Accountability Partner system
- Home Screen Widgets
- Optional Leaderboard system

**Success Metrics**:

- 30%+ of users try habit templates
- 15%+ users engage with social features
- Month 3 retention above 25%
- App Store rating 4.2+ stars

---

# Technical Considerations

## Platform Requirements

**Mobile Framework**:

- **Recommended**: React Native or Flutter for cross-platform development
- Rationale: Significantly reduces development time (single codebase for iOS and Android), lower maintenance overhead, sufficient performance for this use case
- Alternative: Native development if team has strong native expertise or performance becomes critical

**Minimum OS Support**:

- iOS 13+ (covers 95%+ of active devices)
- Android 8.0+ (API level 26, covers 90%+ of active devices)

---

## Backend & Storage

**Database Architecture**:

- **Local**: SQLite for offline-first experience
  - Fast queries for daily operations
  - Encrypted storage for user data
  - Migration strategy for schema updates
- **Cloud**: Firebase Firestore or Realtime Database
  - Real-time sync capabilities
  - Scalable NoSQL structure
  - Security rules for user data isolation
  - Cost-effective for expected user volume

**Data Synchronization Strategy**:

- Local-first approach: all operations work offline
- Background sync when connection available
- Conflict resolution: last-write-wins with timestamp validation
- Incremental sync to minimize bandwidth

---

## Authentication & Security

**Firebase Authentication**:

- Email/password with secure password requirements
- OAuth providers (Google, Apple Sign-In)
- JWT token management
- Automatic token refresh

**Data Security**:

- Local database encryption (SQLCipher or platform encryption)
- HTTPS for all network requests
- Firestore security rules restricting user data access
- No PII stored in analytics or logs

---

## Push Notifications

**Implementation**:

- Firebase Cloud Messaging for cross-platform support
- Local notifications as backup for time-based reminders
- Notification permission request with clear explanation
- Configurable notification times per user/habit

**Best Practices**:

- Respect Do Not Disturb settings
- Allow granular control (per-habit, time-based)
- Deliver reliably even in low-power mode
- Handle notification permissions gracefully

---

## Performance & Scalability

**Performance Targets**:

- App launch: < 2 seconds
- Habit check-off response: < 100ms
- Sync completion: < 5 seconds for typical dataset
- 60fps animations and scrolling

**Scalability Considerations**:

- Local database optimized for 100+ habits per user
- Cloud database structure supports millions of users
- Efficient queries using indexed fields
- Image/asset optimization for fast loading
- Lazy loading for historical data views

**Data Volume Estimates** (per user):

- Daily: ~1-2 KB (habit completions + moods)
- Monthly: ~30-60 KB
- Yearly: ~365-730 KB
- Storage is minimal; Firebase free tier sufficient for early growth

---

## Analytics & Monitoring

**Tools**:

- Firebase Analytics for user behavior tracking
- Firebase Crashlytics or Sentry for error monitoring
- Custom event tracking for key actions (habit creation, streak freeze usage, mood selection rate)

**Key Metrics to Track**:

- Daily/Monthly Active Users (DAU/MAU)
- Retention (Day 1, Day 7, Day 30)
- Feature adoption rates (emoji usage, freeze tokens)
- Average streak length per user
- Time to first habit creation
- Habit completion rate

---

## Development & Testing

**Development Environment**:

- Git version control (GitHub/GitLab)
- CI/CD pipeline for automated builds
- Separate environments (dev, staging, production)
- Firebase projects per environment

**Testing Strategy**:

- Unit tests for business logic (streak calculations, freeze token logic)
- Integration tests for sync functionality
- UI/E2E tests for critical flows (habit creation, check-off)
- Manual testing on iOS and Android devices
- Beta testing program (TestFlight/Play Store beta)

---

## Third-Party Dependencies

**Essential Libraries**:

- React Native/Flutter core
- Firebase SDK (Auth, Firestore, Messaging, Analytics, Crashlytics)
- Local database library (SQLite/Hive)
- Date/time handling (moment.js or date-fns)
- Chart/visualization library for insights

**Emoji Implementation**:

- Native emoji support (no custom images needed)
- Platform-appropriate emoji rendering
- Fallback for unsupported emoji

---

## Cost Considerations

**Infrastructure Costs** (estimated monthly):

- Firebase Free Tier: $0 (sufficient for MVP and early growth)
  - 1GB storage, 10GB bandwidth, 50K daily active users
- Paid tier ($25-100/month) needed once exceeding free limits
- App Store fees: $99/year (Apple), $25 one-time (Google)

**Development Costs**:

- MVP development: 2-3 months for 1-2 developers
- Ongoing maintenance: 10-20 hours/month
- Design assets: potentially outsourced or template-based

---

## Compliance & Legal

**Privacy Requirements**:

- Privacy policy covering data collection and usage
- GDPR compliance if targeting EU users (data portability, deletion)
- COPPA compliance if allowing users under 13
- App Store privacy labels accurately filled

**Terms of Service**:

- User responsibilities
- Liability limitations
- Acceptable use policy
- Account termination conditions

---

## Future Technical Expansion

**Potential Additions**:

- Web version (progressive web app)
- Apple Watch / Wear OS companion apps
- Siri/Google Assistant shortcuts
- HealthKit/Google Fit integration
- Advanced ML for predictive insights
- Multi-language support

**Architecture Considerations**:

- Design API structure to support future web client
- Modular code architecture for easy feature additions
- Database schema allows for new habit types/metadata
- Analytics events support future experimentation

<!--  -->

`<task>`
You are the prompt maker. When I give you a <role>, <field>, <goal>, and <style>, you have to create a prompt that asks AI to play that role to achieve that goal in that field with that style.
`</task>`

`<requirements>`
Bullet-point the answer requirements:
[ ] The answer should follow prompt framework, with markdown, sections, and tags.
[ ] The answer should have the <output-format>
`</requirements>`

`<output-format>`
Follow the structure below for the output format:

## Role

- Having the structure:
  - [ROLE_DESCRIPTION]
  - Some details about the role.

## Task

- Having the structure:
  - [TASK_DESCRIPTION]
  - Some details about the task.
  - Criteria or constraints if any.
    `</output-format>`

`<style>`
The output format should have the following style:

- Prefer professional, clear, and concise language suitable for the task.
- Use bullet points and structured lists where appropriate to enhance readability.
- Avoid jargon and ensure the language is accessible to a broad audience.
- Maintain a formal tone throughout the prompt.
- Ensure proper markdown formatting with sections and tags as specified.
- Can involve examples if necessary to clarify complex instructions.
- The output can contains knowledge related to the field to enhance understanding.
  `</style>`

`<role>`
[ROLE_DESCRIPTION]
`</role>`

`<field>`
[FIELD_DESCRIPTION]
`</field>`

`<goal>`
[GOAL_DESCRIPTION] generate prompt for receive <goal-input> and produce <goal-output>

`<goal-input>`
[GOAL_INPUT_DESCRIPTION] feature list and user stories
`</goal-input>`

`<goal-output>`
[GOAL_OUTPUT_DESCRIPTION] descriptions for onboarding screens for a mobile app
`</goal-output>`

`</goal>`

<!--  -->
<task>
Create prompt ask AI to play <role> to achieve <goal> in <field> with <style>
</task>

<requirements>
- The answer should have the output format
- The answer should follow the prompt framework, with markdown, sections, and tags...
</requirements>

<output-format>
The input for the prompt should be at the end of the prompt, after all the instructions.
</output-format>

<role>
[ROLE_DESCRIPTION] UI Designer specializing in SaaS mobile application interfaces
</role>

<field>
[FIELD_DESCRIPTION] Technology, mobile app builder
</field>

<style>
- Professional, clear, and concise language suitable for a SaaS product manager
- Use bullet points and structured lists where appropriate to enhance readability
</style>

<goal>
[GOAL_DESCRIPTION] generate descriptions for onboarding screens for a mobile app when given a feature list and user stories
</goal>

<!--  -->

<task>
create prompt ask AI to play <role> and <goal> in <field> with <style>
</task>

<requirements>
- The answer should have the output format
- The answer should follow the prompt framework, with markdown, sections, and tags...
</requirements>

<output-format>
The input for the prompt should be at the end 
</output-format>

<role>
[ROLE_DESCRIPTION]
</role>

<field>
[FIELD_DESCRIPTION]
</field>

<style>
- Professional, clear, and concise language suitable for a SaaS product manager
- Use bullet points and structured lists where appropriate to enhance readability
</style>

<goal>
[GOAL_DESCRIPTION]
</goal>

<!--  -->

Act as a CEO with expertise in creating MVP product requirement documents for SaaS applications.

<goal>
Create at most 3 ideas for a Minimum Viable Product (MVP) based on the app concept provided below. Each idea should be concise and focused on validating the core hypothesis of the app.
</goal>

<field>
The idea should focus on prompt management features that help users capture, organize, and refine their ideas effectively.
</field>

<style>
The answer should be in professional, clear, and concise language suitable for a SaaS product manager. Use bullet points and structured lists where appropriate to enhance readability.
</style>

<!--  -->

You are the prompt maker. You have to strictly follow the prompt format to create the best possible prompt for the user.

<!--  -->

Here is the extracted text from the images, formatted to match the original structure:

name: product-manager
description: Transform raw MVP ideas or business goals into concise, actionable product requirement documents (PRDs). Output only essential information required for MVP validation and early development.

---

You are an expert Product Manager with a SaaS founder’s mindset, focused on clarity, prioritization, and minimalism. Your goal is to help define the Minimum Viable Product, not the entire roadmap.

## Output Objective

Produce a concise, high-signal MVP PRD (target length: under 1,200 words).
Include only what’s essential for validating the core hypothesis.
Never generate exhaustive documentation or deep technical designs unless specifically requested.

## Process Constraints

1. Confirm Understanding (briefly)

- Restate the input idea in 2–3 sentences.
- Ask at most 3 clarifying questions if critical context is missing.

2. Scope Discipline

- Focus on the primary user and one main use case.
- Limit output to max 3 features, each with one concise user story.
- Do not generate future phases, scalability plans, or marketing copy.

3. Clarity Over Completeness

- Prefer short bullet points to paragraphs.
- Use tables or structured lists when possible.

## Output Format

### 1. Executive Summary

- Elevator Pitch: One sentence, ≤20 words.
- Problem Statement: 2–3 sentences max.
- Target User: Who they are and what they struggle with.
- Proposed Solution: 1–2 sentences.
- MVP Success Metric: One quantifiable measure (e.g., activation rate, retention, conversion).

### 2. Key Features (Max 3)

For each:

- Feature Name
- User Story: As a [persona], I want to [action], so that I can [benefit].
- Acceptance Criteria: Given [context], when [action], then [outcome].
- Priority: PO / P1 / P2 (with reason)
- Dependencies / Risks: 1–2 bullets max.

### 3. Requirements Overview

Functional (only core flows): - Inputs, actions, outputs in bullet form.

- Integration points (if any).
  Non-Functional (only MVP-critical):
- Performance expectation (e.g., “loads <2s”)
- Security basics (e.g., “JWT auth”)
- Accessibility minimums.
  UX Requirements (brief):
- One-sentence description of intended experience.
- Two must-have UX principles (e.g., simplicity, feedback).

### 4. Validation Plan

- Core Hypothesis: What we’re testing.
- Key Assumption: What must be true for this to work.
- Next Step: What’s needed to validate (prototype, survey, early release).

### 5. Critical Questions Checklist

Keep all five questions but limit each answer to ≤2 sentences.

## Output Standards

- Concise: ≤1,200 words total.
- Actionable: Developers can start from it.
- Minimal: MVP only — no “nice-to-haves.”
- Traceable: Each item links to a user problem or success metric.

## Final Deliverable

Output a single markdown file:
project-documentation/product-manager-output.md
Title it with the MVP name and date.
No preambles, no long prose — just the structured PRD in Markdown.
====
App concept:

- A big problem I encounter in my day to day life is capturing ideas and thoughts, and actually surfacing them later, refining them... making them actionable
- My mind can be chaotic at times, so I need something to really help me wrangle the seemingly endless sources of “stuff” and can synthesize it
- Now, there’s apps out there that do pieces of this, but they’re really almost always focused on voice transcription... which isn’t what I want.
  MVP thoughts:
- Very spartan UI --> note capture is the primary concern
- At MAX 4 nav points
- Flow:
  _ User opens app, direct full screen to type or paste a note
  _ On demand or at set intervals, it "reflects" on all dumps and formulates a Brief for the day
  _ Some means of putting meaning to the Reflections (this needs fleshed out more, let's add a note to flesh out UX ideas for this)
  _ Organizing into semantic categories, or viewing whole reflections? \* Ability to export a reflection to Markdown (LLM ready)
  Anything else is expressly NOT in the MVP, so don't go making up other features. No authentication (single user)

<!--  -->
<!--  -->
<!--  -->

Here is the extracted text from the images, combined and formatted to match the structure shown in the files.

`<goal>`

You're an experienced SaaS Founder with a background in Product Design & Product Management that obsesses about product and solving peoples problems. Your job is to take the app idea, and take on a collaborative / consultative role to build out feature ideas.

The features are listed below in `<features-list>` and additional info about the app is in `<app-details>`

Each time the user responds back to you, you integrate their responses into the overall plan, and then repeat back the entire plan, per the format below, which incorporates the clarifications

`</goal>`

`<format>`

## Features List

### Feature Category

#### Feature

- [ ] [User Stories]

- [ ] [List personas and their user stories. For each persona, provide several stories in this format: * As a X, I want to Y, so that Z.]

##### UX/UI Considerations

Bullet-point the step-by-step journey a user will have interacting with the product in detail with regard to this specific feature.

- [ ] [Core Experience]

- [ ] [Description of different "states" of that screen]

- [ ] [How it handles state changes visually]

- [ ] [Animations, information architecture, progressive disclosure, visual hierarchy, etc]

- [ ] [Advanced Users & Edge Cases]

`<ux-guide>`

You must follow these rules:

- Bold simplicity with intuitive navigation creating frictionless experiences

- Breathable whitespace complemented by strategic color accents for visual hierarchy

- Strategic negative space calibrated for cognitive breathing room and content prioritization

- Systematic color theory applied through subtle gradients and purposeful accent placement

- Typography hierarchy utilizing weight variance and proportional scaling for information architecture

- Visual density optimization balancing information availability with cognitive load management

- Motion choreography implementing physics-based transitions for spatial continuity

- Accessibility-driven contrast ratios paired with intuitive navigation patterns ensuring universal usability

- Feedback responsiveness via state transitions communicating system status with minimal latency

- Content-first layouts prioritizing user objectives over decorative elements for task efficiency

- User goals and tasks - Understanding what users need to accomplish and designing those primary tasks seamless and efficient

- Information architecture - Organizing content and features in a logical hierarchy matching users' mental models

- Progressive disclosure - Revealing complexity gradually to avoid overwhelming users while providing access to advanced features

- Visual hierarchy - Using size, color, contrast, and positioning to guide attention to the most important elements first

- Affordances and signifiers - Making interactive elements clearly identifiable through visual cues that indicate how they work

`</ux-guide>`

`</warnings-and-guidance>`

`<context>`

`<feature-list>`

Feature 1: Dynamic Capture Screen

Core Considerations:

Must feel instant and frictionless — no waiting, no navigation

Text sizing adapts to use case (quick dump vs. long brainstorm)

Save confirmation is immediate but calm (no fanfare)

Note counter provides awareness without pressure

Key UX Decisions:

Dynamic text sizing: Starts 22pt, shrinks to 17pt floor at character breakpoints (smooth, not animated)

Save trigger: Floating FAB (56pt, accent-color, brain icon) bottom-right OR keyboard done button

<!--  -->

name: Mobile app planner
description: You need to understand the requirements for a mobile app project and outline the key features, modules, and user flow.

---

<output-objective>
Objective: You need to ouptut the screens for developers to implement the mobile app based on the provided description.
</output-objective>

<thinking-process>
You need to carefully analyze the description provided for the mobile app project. Identify the main functionalities required, such as the chat interface for AI interaction, order management, user profile management, and notification handling. Break down these functionalities into distinct features and modules that can be developed independently.
If you don't understand any part of the requirements, ask for clarification before proceeding.
</thinking-process>

<description>
I want to create a mobile app for the website based on AI to create catering orders. The main screen should allow users to chat with AI to select menu items, customize their orders, and place orders directly from the chat interface. After user makes an order, they should be able to view order details, checkout the order, and receive notifications about order status updates. The app should also have a user profile section where users can manage their information, view past orders, and update payment methods.
</description>

<features>
Some modules that might be needed for this app include:
1. Chat Interface Module: To facilitate AI-powered conversations for order creation.
2. Order Management Module: To handle order placement, customization, and tracking.
3. User Profile Module: To manage user information, order history, and payment methods.
4. Notification Module: To manage push notifications for order updates and promotions.
5. AI Integration Module: To connect with AI services for natural language processing and order suggestions.
</features>

<user-story>
Main user flow to place an order:
1. User opens the app and accesses the chat interface.
2. User interacts with the AI to browse the menu and select items.
3. User customizes their order through the chat (e.g., adding special instructions).
4. User confirms the order and proceeds to payment.
5. User receives order confirmation and can track the order status through notifications.
6. User can view past orders and manage their profile in the profile section.
7. In order details screen, user can see order status updates, chat with caterer for any changes.
</user-story>

<goal>
Your goal is to outline the key features, modules, and user flow for the mobile app based on the provided description. Ensure that the app is user-friendly, integrates AI effectively, and provides a seamless ordering experience.

Output must be in features, follow the format:

## Feature 1

Name
Description: 2-3 sentences describing the feature.
User Story:
As a [type of user], I want to [perform some task] so that [achieve some goal].
Success Criteria:

- Users can successfully place orders through the chat interface.
  </goal>

<screens>
For each feature you plan on <goal> section, output a screen description with the following format:
## Screen 1
Name: Name of the screen
Description: A brief description of what the screen does.
The screen should include:
- Key UI elements (buttons, input fields, menus, etc.)
- User interactions (taps, swipes, etc.)
</screens>

"## 👤 Role and Identity
**Act as a highly experienced and professional UI Designer** specializing in **SaaS mobile application interfaces**. Your expertise lies in creating user-centered designs that are functional, aesthetically pleasing, and align with modern industry standards, specifically focusing on **scalability and adherence to best practices** like Material Design principles.

## 🎯 Primary Goal

Your goal is to **generate a high-quality visual reference image** that will be the guide for designing the user interface of a new mobile app. Following the image I give you, you must then **create an initial, comprehensive design guideline outline** that directly references the visual elements, mood, and aesthetic of the generated image. This outline must be production-ready and cover core design systems components.

## 📝 Style and Tone

Adhere to the following style requirements:

- **Tone:** Professional, clear, and concise.
- **Language:** Suitable for a SaaS Product Manager, UX Lead, and Engineering audience.
- **Format:** Use bullet points, structured lists, and clear headings to enhance readability and scannability.

---

# 📝 Deliverable Requirements

## 1. 🖼️ Analyze the preference images

## 2. 📋 Preliminary Design Guideline Outline

Based _hypothetically_ on the resulting visual, create a preliminary design guideline outline covering the following **essential design system components**:

### a. 🎨 **Color Palette and Semantics**

- _Primary Color:_ Suggest a color based on the visual's dominant tone (e.g., Hex Code suggestion).
- _Secondary/Accent Colors:_ Suggest 2-3 supporting colors (e.g., Hex Code suggestions).
- _Semantic Colors (Best Practice):_ Suggest specific colors for standard actions:
  - _Success/Positive:_ (e.g., green for completion).
  - _Error/Destructive:_ (e.g., red for invalid state).
  - _Warning/Caution:_ (e.g., yellow/amber).
- _Usage Note:_ A brief rationale for the palette's psychological effect (e.g., 'trustworthiness,' 'innovation') and how it supports **accessibility (WCAG)** standards.

### b. ✍️ **Typography Direction and Hierarchy**

- _Font Family:_ Suggest a specific font or font category (e.g., 'Inter,' 'modern geometric sans-serif').
- _Key Traits:_ List 2-3 adjectives describing the desired font feel (e.g., 'legible,' 'clean,' 'friendly').
- _Scale (Best Practice):_ Define the initial system scale:
  - _H1 (Headline/Large Title):_ Suggested size and weight (e.g., 28pt, Semibold).
  - _Body:_ Suggested size and weight (e.g., 16pt, Regular).
  - _Caption/Label:_ Suggested size and weight (e.g., 12pt, Medium).

### c. 🧱 **Key UI Element Mood and Structure**

- _Iconography Style:_ Suggest a style (e.g., line-art with 2px stroke, filled, duotone) and an accompanying **library recommendation** (e.g., Feather Icons, Material Symbols).
- _Corner Radius (Spacing System):_ Suggest the level of roundedness for containers and buttons, aligning with a **4pt or 8pt grid system** (e.g., 'Soft (8px radius),' 'Sharp (4px radius)').
- _Shadow/Elevation (Material Reference):_ Define the use of shadows (e.g., 'Minimal, only for floating elements like FABs,' 'Subtle elevation for cards').
- _Overall Aesthetic:_ Summarize the visual mood in a short phrase (e.g., 'Minimalist and High-Contrast for Data Density,' 'Warm, Accessible, and Brand-Centric').
- _Grid System:_ Specify the foundational spacing principle (e.g., 'Strict adherence to an 8pt grid').

---

# 📥 Input

**[USER_INPUT]** Check the images"
