/\*\*

- Path Routing Library Usage Examples
-
- This document shows how to use the centralized paths library
- for navigation throughout the app.
  \*/

// ============================================================================
// Basic Imports
// ============================================================================

import { HABITS, STORIES, HOME } from "@/lib/paths";
import { useRouter } from "next/navigation";

// ============================================================================
// Next.js useRouter Examples
// ============================================================================

export function NavigationExamples() {
const router = useRouter();

// Simple navigation
const goHome = () => router.push(HOME);
const goToHabits = () => router.push(HABITS.ROOT);
const goToTransactions = () => router.push(TRANSACTIONS.ROOT);

// Dynamic paths (e.g., story details)
const goToStoryDetail = (storyId: string) => {
router.push(STORIES.DETAIL(storyId));
};

// Replace navigation (replaces history entry)
const replaceWithHabits = () => router.replace(HABITS.ROOT);

// Refresh and navigate
const refreshAndGo = () => {
router.refresh();
router.push(HABITS.STATS);
};

return null;
}

// ============================================================================
// React Query Navigation Examples
// ============================================================================

import { useMutation } from "@tanstack/react-query";

export function MutationNavigationExample() {
const router = useRouter();

const createHabit = useMutation({
mutationFn: async (data: any) => {
// API call
return data;
},
onSuccess: () => {
router.push(HABITS.ROOT);
},
});

const createStory = useMutation({
mutationFn: async (data: any) => {
// API call
return data;
},
onSuccess: (data) => {
// Navigate to newly created story
router.push(STORIES.DETAIL(data.id));
},
});

return null;
}

// ============================================================================
// Link Component Examples
// ============================================================================

import Link from "next/link";

export function LinkExamples() {
return (

<div>
<Link href={HOME}>Home</Link>
<Link href={HABITS.ROOT}>Habits</Link>
<Link href={HABITS.SETTINGS}>Habit Settings</Link>
<Link href={FLASH_CARDS.ROOT}>Flash Cards</Link>
<Link href={STORIES.NEW}>Create Story</Link>
<Link href={TRANSACTIONS.ROOT}>Transactions</Link>
</div>
);
}

// ============================================================================
// Navigation Guards/Redirects
// ============================================================================

import { redirect } from "next/navigation";

export function redirectExample(condition: boolean) {
if (condition) {
redirect(HABITS.ROOT);
}
}

// ============================================================================
// Type Safety
// ============================================================================

// All paths are typed, providing autocomplete and type checking
function navigateSafely(path: typeof HABITS[keyof typeof HABITS]) {
const router = useRouter();
router.push(path); // TypeScript ensures only valid habit paths
}

// ============================================================================
// Module Organization Reference
// ============================================================================

/\*
Available Modules:

HABITS

- ROOT: "/habits"
- SETTINGS: "/habits/settings"
- STATS: "/habits/stats"
- MAIN: "/habits/main"

STORIES

- ROOT: "/stories"
- NEW: "/stories/new"
- DETAIL(id): "/stories/{id}" - Dynamic path
- WORDS: "/stories/words"

TRANSACTIONS

- ROOT: "/transactions"

BUCKETS

- ROOT: "/buckets"

FLASH_CARDS

- ROOT: "/flash-cards"

TODOS

- ROOT: "/todos"

STATS

- ROOT: "/stats"

CONFIG

- ROOT: "/config"

CONVERSIONS

- ROOT: "/conversions"

NOXON

- ROOT: "/noxon"

HOME

- "/" - Application home
  \*/
