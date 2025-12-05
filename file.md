must follow:
use react-query for data fetching and state management.
use material ui for ui components and styling.
use lucide icons for icons, don't use material ui icons.
pay attention on light and dark mode support.

# Feature Overview

Change the dashboard layout to hide the topbar and drawernav when in mobile view.
Mobile view only show bottom navigation bar for navigation.

<!--  -->

# Feature descriptions

A transaction can be belong to multiple buckets.

# Database changes

Create a new table `transaction_buckets` to represent the many-to-many relationship between transactions and buckets.
Table: transaction_buckets

- id (primary key)
- transaction_id (foreign key to transactions.id)
- bucket_id (foreign key to buckets.id)
- created_at (timestamp)
- updated_at (timestamp)

# Data migration

1. Create the `transaction_buckets` table in the database.
2. For each transaction in the `transactions` table, if it has a `bucket_id`, create a corresponding entry in the `transaction_buckets` table linking the transaction to the bucket.

# API Implementation Changes

## Update transaction creation and update endpoints to handle multiple buckets

- POST `/api/transactions`
  - Request Body: Add a new field `bucket_ids` (array of bucket IDs)
- PUT `/api/transactions/:id`
  - Request Body: Add a new field `bucket_ids` (array of bucket IDs)
- GET `/api/stats/bucket/${bucketId}/balance`
  - Update the logic to calculate the balance by summing amounts from the `transaction_buckets` table for the specified bucket ID.
- GET `/api/transactions`
  - Update payload to filter by multiple bucket IDs if provided.

# UI Changes

## Update transaction form to support multiple bucket selection

- Update the transaction creation and update forms to allow selecting multiple buckets using a multi-select autocomplete component from Material UI.
- Update the transaction list view to display all associated buckets for each transaction.

<!--  -->

# Feature overview

Change the layout to dashboard style layout.

The dashboard layout will have a sidebar on the left side with navigation links to different sections of the application.
The main content area will be on the right side, displaying the selected section's content.

# Changes

## Layout

Create a new layout component `DashboardLayout.tsx` that includes:

- A sidebar with navigation links
  - Sidebar will have sections: Logo, Navigation links, User profile at the bottom.
- A main content area to display the selected section's content.

# Scopes

- Whole application will use the new dashboard layout.

# Notes

- Keep the current mobile layout structure with BottomNav

<!--  -->

# Feature Overview

Use debounce when searching for transaction.

When user type in the search input field, wait for 500ms after the last keystroke before sending the search request to the server.

# Changes

## Hooks

Add a new hook `useDebounce`: to debounce a value.

## Frontend routes

/transactions

<!--  -->

# Feature

Add module flash card to the Navigation bar.
The flash card module will have the following features:

- A list of flash cards
- A button to add a new flash card
- A button to edit a flash card
- A button to delete a flash card
- A button to shuffle the flash cards
- A card will have status: not learned, learning, learned, mastered.
- A card will have a button to toggle the status.
- A card will have a button to edit the flash card.
- A card will have a button to delete the flash card.
- A card will have a button to shuffle the flash cards.

# API Implementation Details

POST `/api/flash-cards`
GET `/api/flash-cards`
PUT `/api/flash-cards/:id`
DELETE `/api/flash-cards/:id`

# Database table

flash_cards table:

- id (primary key)
- word (string)
- meaning (string)
- status (enum: not learned, learning, learned, mastered)
- created_at (timestamp)
- updated_at (timestamp)

<!--  -->

# Feature overview

Mention the day of the habit right in the text editor.

# Note

Build a parser to parse multiple habit mentions in the text editor. Each mention should be a separate node in the tiptap editor.
Preview the upcoming data to save to the database.

<!--  -->

# Feature descriptions

Mention habit inside text area with tag insertion using Tiptap editor. Mention Dropdown Menu in tiptap editor.

# Route: `/habits`

# New component

HabitLogInputWithTagInsertion.tsx

# UI only, not implemented API or database yet.

<!--  -->

# Feature Overview

Habit log input with tag insertion using Tiptap editor.

# User Interface

When I type a colon `:` in the habit log input field, a dropdown menu appears showing a list of my habits as tags.

I can click on a tag from the dropdown menu to insert it into the habit log at the current cursor position.

When I hit submit button, the habit log with the inserted tags is saved to the database.

# Implementation Details

1. Integrate Tiptap editor into the habit log input field.
2. Fetch the list of habits from the database to populate the dropdown menu.
3. Implement the dropdown menu that appears when typing `:` and allows selecting a habit tag.
4. Handle the insertion of the selected habit tag into the Tiptap editor at the current cursor position.
5. Ensure that the habit log with tags is correctly saved to the database upon submission

# API Implementation Details

POST `/api/habits/:id/habit-logs`
GET `/api/habits/:id/habit-logs`

# Database table

habit_logs table: Log of habits
For schema details, refer to the schema.ts

# Library and Tools

Use Tiptap for rich text editing.
Use react-query for data fetching and state management.

<!--  -->

# Feature Overview

Habit tracking dashboard.

# Route: `/dashboard/habits`

# User Interface

A button allow creating a new habit
A list of activate habits displayed in a card format, showing the habit name, description, and status (active/inactive).
Each habit card has an edit button to modify the habit details and a toggle button to activate/de

In the card format, showing a contribution graph for each habit, visualizing the completion status over time (e.g., days/weeks).

# Database

habits table:

- id (primary key)
- name (string)
- description (string)
- created_at (timestamp)
- updated_at (timestamp)
- status (enum: active, inactive)

habit_logs table:

- id (primary key)
- habit_id (foreign key to habits.id)
- date (date)
- completed (boolean)
- created_at (timestamp)
- updated_at (timestamp)

# API Implementation Details

GET `/api/habits`
POST `/api/habits`
PUT `/api/habits/:id`
DELETE `/api/habits/:id`

# Library and Tools

Use react-query for data fetching and state management.
Use Material UI for UI components and styling.

<!--  -->

# Feature Overview

Heatmap visualization for data analysis.

I want to create a heatmap for visualizing money spent by day of the week.

The user can select and view by month or year.

Each cell in the heatmap represents a day, with color intensity indicating the amount of money spent on that day.
The saturation of the color increases with the amount spent, providing a quick visual cue for high and low spending days. Primary colors used are shades of green, with lighter shades for lower amounts and darker shades for higher amounts.

Total of a day is calculated by summing up all transactions for that day and displaying the total amount spent in that cell.

The total heatmap view will be display inside a dialog when user click a button on the main dashboard.

# API Implementation Details

POST `/api/heatmap`
Request Body:

```json
{
  "year": 2023,
  "month": 5
}
```

Response Body:

```json
{
  "heatmapData": [
    {
      "date": "2023-05-01",
      "totalSpent": 150.0
    },
    {
      "date": "2023-05-02",
      "totalSpent": 75.5
    }
    // ... more days
  ]
}
```

<!--  -->

# Feature Overview

View bucket list.

# User Interface

A page at `/buckets` that displays a list of bucket items. The list displayed in grid format with 4 columns.
Each bucket item displays the following information:

- Name
- Is default bucket
  A button to add a new bucket item at the first item of the list.

# UI Implementation Details

Use lucide icons. Don't use Material UI icons.
Use material UI components to create the bucket list page.
Don't use shadcn UI components, tailwindcss for this page.

# API Implementation Details

Use HttpClient for making API requests.
Use react-query to fetch the bucket list from the backend API endpoint `/api/buckets`.
Create a separate file for holding API definition for bucket related operations in src/services/api/buckets.ts
Create a separate file for holding react-query hooks for bucket related operations in src/services/react-query/hooks/buckets.ts. Query keys put right inside this file as well. If there are mutation operations, create separate files for mutation hooks as well.

<!--  -->

# Feature Overview

Google authentication for user login.

# User Interface

When user visit the root path `/`, if not authenticated, user will be route to /login for authentication.

The login page only have a button to sign in with Google account.

# Implementation Details

1. Create a login page at `/login` with a "Sign in with Google" button.
2. Use NextAuth.js with Google provider for authentication.
3. Configure NextAuth.js in `pages/api/auth/[...nextauth].js` with Google client ID and secret.
4. Protect routes by checking authentication status, redirect unauthenticated users to `/login`.
5. After successful login, redirect users to the home page `/`.

<!--  -->

# Feature Overview

Change the UI system from Shadcn UI to Material UI.
The application will use Material UI components for all UI elements and layouts.

# Implementation Details

1. Install Material UI packages, follow the latest Material UI installation guide.
2. Keep the existing folder structure, don't replace the old structure for backward compatibility.
3. Setup theming and global styles using Material UI's ThemeProvider.
