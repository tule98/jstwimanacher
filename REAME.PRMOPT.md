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
