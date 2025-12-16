---
applyTo: "**"
---

# Timezone Handling Instructions

## Overview

This document defines the timezone processing strategy for the jstwi application:

- **Database Storage**: All dates/times stored in UTC (Timezone 0)
- **Client Display**: All dates/times displayed in user's local timezone
- **User Timezone**: Auto-detected on first page load, stored in Supabase `user_profiles.timezone`
- **Default Timezone**: `Asia/Ho_Chi_Minh` (GMT+7) for fallback

## Core Principles

### 1. **UTC Storage Contract**

All date/time values written to the database **MUST be in UTC ISO 8601 format** (`YYYY-MM-DDTHH:mm:ss.sssZ`).

**Rule**: No exceptions. Every API route that writes to date columns must convert user input to UTC before storage.

**Example**:

```typescript
// ❌ WRONG - Stores local time
db.insert(todos).values({ due_date: new Date().toISOString() });

// ✅ CORRECT - Converts to UTC first
const utcDate = toDateTimeUTC(userInputDate);
db.insert(todos).values({ due_date: utcDate });
```

### 2. **Client-Side Display Conversion**

All dates read from the database are in UTC. Convert to user timezone before displaying.

**Rule**: Use timezone-aware formatting utilities. Never use `.toLocaleDateString()` or raw date objects directly.

**Example**:

```typescript
// ❌ WRONG - May display in system timezone, not user timezone
<span>{new Date(dbDate).toLocaleDateString()}</span>

// ✅ CORRECT - Uses user timezone from context
<span>{formatDateForDisplay(dbDate, userTimezone)}</span>
```

### 3. **User Timezone Management**

**Storage**: User timezone preference is stored in `user_profiles.timezone` (Supabase).

**Auto-Detection**: On first page load, detect user's timezone via `navigator.timeZone` and store it (one-time operation).

**Access**: Via `useUserTimezone()` hook which provides timezone string and functions.

**Fallback**: If user has no timezone preference or detection fails, default to `Asia/Ho_Chi_Minh`.

### 4. **API Route Patterns**

#### Input (User → Server)

1. Client sends local user input (e.g., "2025-01-15 14:30")
2. Include `timezone` in request or fetch from session
3. Server converts to UTC using `toDateTimeUTC(input, timezone)`
4. Store UTC in database

**Example**:

```typescript
// POST /api/todos
export async function POST(req: Request) {
  const { title, due_date, timezone } = await req.json();

  const utcDueDate = toDateTimeUTC(due_date, timezone);

  await db.insert(todos).values({
    title,
    due_date: utcDueDate,
  });
}
```

#### Output (Server → Client)

1. Query returns UTC dates from database
2. Format using `formatDateForDisplay(utcDate, timezone)` before sending, OR
3. Send raw UTC to client, let client format using `useUserTimezone()` hook

**Recommendation**: Let client format to avoid round-trip conversions.

**Example**:

```typescript
// GET /api/todos
export async function GET() {
  const todos = await db.select().from(todos);

  // Return raw UTC - client will format
  return Response.json(todos);
}

// Client component
const { timezone } = useUserTimezone();
<span>{formatDateForDisplay(todo.due_date, timezone)}</span>;
```

### 5. **Timezone Conversion Functions**

All functions are in `lib/timezone.ts` and handle timezone awareness. **Always use these instead of raw date methods.**

#### Core Functions

| Function                                            | Input                        | Output                        | Usage                                   |
| --------------------------------------------------- | ---------------------------- | ----------------------------- | --------------------------------------- |
| `toDateTimeUTC(dateInput, timezone)`                | Local date string + timezone | UTC ISO string                | Converting user input to storage format |
| `formatDateForDisplay(utcDateString, timezone)`     | UTC ISO string + timezone    | `dd/MM/yyyy` in user TZ       | Display date only                       |
| `formatDateTimeForDisplay(utcDateString, timezone)` | UTC ISO string + timezone    | `dd/MM/yyyy HH:mm` in user TZ | Display date + time                     |
| `getMonthBoundariesInUTC(year, month)`              | Year, month                  | `{ start, end }` in UTC       | Querying date ranges                    |
| `parseUserInput(input, timezone)`                   | User input string + timezone | Date object in user TZ        | Parsing form inputs                     |

#### Usage Examples

**Example 1: Todo Due Date Input**

```typescript
// Component
const { timezone } = useUserTimezone();
const handleSave = (dueDate: string) => {
  // dueDate is from user input (e.g., "2025-01-15")
  const utcDate = toDateTimeUTC(dueDate, timezone);
  await api.post("/api/todos", { due_date: utcDate });
};

// Display
<span>{formatDateForDisplay(todo.due_date, timezone)}</span>;
```

**Example 2: Habit Journal Entry**

```typescript
// API route - input conversion
export async function POST(req: Request) {
  const { entry_date, timezone } = await req.json();
  const utcDate = toDateTimeUTC(entry_date, timezone);

  await db.insert(habitJournalEntries).values({
    entry_date: utcDate,
  });
}

// Component - display
const { timezone } = useUserTimezone();
{
  habitEntries.map((entry) => (
    <div key={entry.id}>{formatDateForDisplay(entry.entry_date, timezone)}</div>
  ));
}
```

**Example 3: Transaction Date Range Query**

```typescript
// API route - query by month
export async function GET(req: Request) {
  const { year, month, timezone } = new URL(req.url).searchParams;

  const { start, end } = getMonthBoundariesInUTC(year, month);

  const transactions = await db
    .select()
    .from(transactions)
    .where(
      and(gte(transactions.created_at, start), lt(transactions.created_at, end))
    );

  return Response.json(transactions);
}
```

### 6. **React Hook: useUserTimezone**

Provides timezone context and formatting utilities throughout the app.

**Location**: `hooks/useUserTimezone.ts`

**Features**:

- Auto-detects timezone on first page load
- Stores preference in Supabase `user_profiles.timezone`
- Provides timezone string for all conversions
- Provides formatting helper functions

**Usage**:

```typescript
import { useUserTimezone } from "@/hooks/useUserTimezone";

export function MyComponent() {
  const { timezone, formatDate, formatDateTime } = useUserTimezone();

  return (
    <div>
      <span>{formatDate(utcDateString)}</span>
      <span>{formatDateTime(utcDateTimeString)}</span>
    </div>
  );
}
```

### 7. **Cron Job Timezone Behavior**

**Current Behavior**: Daily cron job runs at **2 AM UTC** (~9 PM Vietnam time).

**Important**: This is a **fixed UTC time**, NOT per-user. All users experience cron execution at the same UTC moment.

**Implication**:

- Users in different timezones trigger at different local times
- Example: 2 AM UTC = 9 PM (previous day) Vietnam / 8 PM India / 9 AM Singapore

**When to Change**:

- If per-user cron execution by local time becomes requirement, this requires separate scheduler per user or queue system
- Current implementation is suitable for read-heavy operations (memory decay, daily stats)
- Future enhancement: Add `cron_timezone` to user preferences and process cron queue per timezone window

**Documentation**: Always document cron timing as UTC in code comments:

```typescript
// Runs daily at 2 AM UTC (9 PM Vietnam time by default)
schedule.scheduleJob("0 2 * * *", async () => {
  // Process habit decay, stats, etc.
});
```

### 8. **Implementation Checklist**

When adding timezone-aware date handling to a feature:

- [ ] Identify all date columns used in the feature
- [ ] For API inputs: Add `timezone` parameter or fetch from session
- [ ] For API inputs: Convert to UTC using `toDateTimeUTC()` before storing
- [ ] For API outputs: Return raw UTC, let client format
- [ ] For components: Use `useUserTimezone()` hook
- [ ] For display: Use `formatDateForDisplay()` or `formatDateTimeForDisplay()`
- [ ] For input forms: Parse user input using `parseUserInput()` with timezone
- [ ] Test in different timezones (change system timezone or use test timezone in hook)
- [ ] Document timezone assumptions in code comments

### 9. **Database Schema Guidelines**

**Date Column Types**:

- `text` (ISO 8601 UTC format) - Recommended for most cases
- Use `DEFAULT (datetime('now'))` for auto-timestamps in SQL (produces UTC)

**Example**:

```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  due_date TEXT, -- UTC ISO 8601
  created_at TEXT DEFAULT (datetime('now')), -- UTC
  updated_at TEXT DEFAULT (datetime('now')),
  ...
);
```

### 10. **Common Pitfalls to Avoid**

❌ **Pitfall 1**: Mixing local and UTC times

```typescript
// WRONG - inconsistent storage
const date1 = new Date().toISOString(); // UTC
const date2 = new Date().toString(); // Local
```

❌ **Pitfall 2**: Using system timezone for storage

```typescript
// WRONG - ties data to system, breaks on server migration
const date = new Date().toLocaleString();
```

❌ **Pitfall 3**: Forgetting timezone in calculations

```typescript
// WRONG - loses timezone context
const nextDay = new Date(dbDate).setDate(new Date(dbDate).getDate() + 1);
```

❌ **Pitfall 4**: Displaying UTC as local

```typescript
// WRONG - shows UTC time in user's local UI
<span>{new Date(utcDate).toLocaleTimeString()}</span>
```

✅ **Solution**: Always use timezone utilities

```typescript
// CORRECT
const utcDate = toDateTimeUTC(userInput, timezone);
const formatted = formatDateForDisplay(utcDate, timezone);
```

### 11. **Testing Timezone Logic**

**Approach**: Use `useUserTimezone` hook's `_testSetTimezone()` method to override timezone in tests.

```typescript
import { useUserTimezone } from "@/hooks/useUserTimezone";

export function TestComponent() {
  const { _testSetTimezone, formatDate } = useUserTimezone();

  // For testing different timezones
  _testSetTimezone("America/New_York");
  const formatted = formatDate("2025-01-15T15:00:00Z");
  // Output will be in New York timezone
}
```

---

## Summary

| Concept            | Rule                                                    |
| ------------------ | ------------------------------------------------------- |
| **Storage**        | Always UTC ISO 8601                                     |
| **Display**        | Always user timezone via formatting utilities           |
| **Auto-Detection** | On first page load, stored in Supabase                  |
| **Default**        | Asia/Ho_Chi_Minh (GMT+7)                                |
| **Conversions**    | Use `lib/timezone.ts` utilities, never raw Date methods |
| **Cron Jobs**      | Fixed UTC time, document as UTC in comments             |
| **API Inputs**     | Convert to UTC before storage                           |
| **API Outputs**    | Return UTC, format on client                            |
