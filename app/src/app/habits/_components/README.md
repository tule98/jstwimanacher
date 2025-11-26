# Habit Journal with Mention Feature

## Overview
This feature allows users to mention habits in a rich text editor using Tiptap with `@` mention functionality.

## Route
- **Page**: `/habits`
- **Component**: `HabitLogInputWithTagInsertion.tsx`

## Features
1. **Tiptap Rich Text Editor**: Full-featured editor with basic formatting
2. **@ Mention System**: Type `@` to trigger habit mention dropdown
3. **Keyboard Navigation**: Use arrow keys to navigate mentions, Enter to select
4. **Visual Feedback**: Mentioned habits are highlighted with styled badges
5. **Material UI Integration**: Dropdown uses MUI components (Paper, List, etc.)

## Components

### HabitLogInputWithTagInsertion
Located at: `app/src/app/dashboard/habits/_components/HabitLogInputWithTagInsertion.tsx`

**Props:**
- `habits: Habit[]` - Array of available habits to mention
- `value?: string` - Initial HTML content (optional)
- `onChange?: (html: string) => void` - Callback when content changes
- `placeholder?: string` - Placeholder text (default: "Type @ to mention a habit...")

**Features:**
- Tiptap editor with Mention extension
- Custom dropdown component using Material UI
- Tippy.js for dropdown positioning
- Real-time search/filter as you type
- Keyboard shortcuts (Arrow Up/Down, Enter, Escape)

### MentionList
Internal dropdown component that displays filtered habits.

**Features:**
- Material UI List/ListItem components
- Keyboard navigation support
- Click selection
- Visual highlight for selected item
- Empty state message

## Usage

```tsx
import HabitLogInputWithTagInsertion from "@/app/dashboard/habits/_components/HabitLogInputWithTagInsertion";
import { useHabits } from "@/services/react-query/hooks/habits";

function MyComponent() {
  const [content, setContent] = useState("");
  const { data: habits } = useHabits({ includeLogs: false });

  return (
    <HabitLogInputWithTagInsertion
      habits={habits || []}
      value={content}
      onChange={setContent}
      placeholder="Write your journal entry..."
    />
  );
}
```

## How It Works

1. **Trigger**: User types `@` in the editor
2. **Filter**: Tiptap searches habits based on query text after `@`
3. **Display**: MentionList renders filtered results in a dropdown (via Tippy.js)
4. **Navigation**: User can use arrow keys or mouse to select
5. **Insert**: Selected habit is inserted as a mention node with custom styling
6. **Output**: Editor content includes HTML with `<span class="mention">` tags

## Styling

Mentions are styled with:
- Background: primary color
- Text: white
- Padding: 2px 6px
- Border radius: 4px
- Font weight: 500

Custom styles are in `tiptap-styles.css`.

## Dependencies

- `@tiptap/react`: Rich text editor framework
- `@tiptap/starter-kit`: Basic editor extensions
- `@tiptap/extension-mention`: Mention functionality
- `@tiptap/suggestion`: Suggestion dropdown system
- `tippy.js`: Tooltip/dropdown positioning library
- `@mui/material`: UI components for dropdown

## Demo Page

Visit `/habits` to see:
- Live editor with mention functionality
- List of available habits
- HTML output preview
- Usage instructions

## Future Enhancements (Not Implemented Yet)

- API integration to save journal entries
- Database schema for habit journals
- View past journal entries
- Filter journals by mentioned habits
- Rich text formatting toolbar
- Image/media support
- Markdown export
