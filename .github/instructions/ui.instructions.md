---
applyTo: "**"
---

🎨 Overall UI Style Guide – Material-UI Only

This guide ensures a consistent visual system using Material-UI exclusively, acting as a "design compass" to keep your UI clean and predictable.

⚠️ **IMPORTANT: All UI must use Material-UI (MUI) components exclusively. Do NOT mix Tailwind CSS classes with MUI components.**

🎯 Visual Identity
🎨 Color System

• Primary Blue (#1b42d8) – The hero color
– Use theme.palette.primary.main in MUI components
– Primary dark variant for hover states
– Ensure high contrast between text and background

• Secondary Color (#f2d0c9) – Supporting accent color
– Use theme.palette.secondary.main for secondary actions
– Good for backgrounds and states

Tip: Reference colors via `theme.palette.primary.main` and `theme.palette.secondary.main` in MUI sx props, never hardcode colors.

📐 Layout & Spacing

• Use MUI Box and Stack components for layout
– Box: Single-element layout container with sx props
– Stack: Multi-element layout with direction, spacing, alignment
– Apply spacing via sx prop: `sx={{ mt: 2, mb: 3, p: 2 }}`
• Dense spacing approach
– Use MUI spacing units (1 unit = 8px)
– Smaller margins and compact padding
• Always use sx prop for responsive design
– Example: `sx={{ display: { xs: 'none', md: 'flex' } }}`

🟦 Shape & Components (Zero Border Radius)

• All components have zero border-radius globally (shape.borderRadius: 0)
• Use MUI components exclusively:
– **Buttons**: `<Button variant="contained" | "outlined" | "text">`
– **Cards**: `<Card><CardContent>...</CardContent></Card>`
– **Inputs**: `<TextField />`
– **Typography**: `<Typography variant="h6" | "body1" | etc>`
– **Layout**: `<Box>`, `<Stack>`, `<Grid>`
– **Dialogs**: `<Dialog><DialogTitle><DialogContent><DialogActions>`
– **Tabs**: `<Tabs><Tab>` with fullWidth variant
– **Floating Action**: `<Fab color="primary">`
– **Navigation**: `<Paper>` with Stack for nav bars

🧱 MUI Component Patterns

**Button Examples:**

```tsx
// Primary button
<Button variant="contained" color="primary">Action</Button>

// Outlined button
<Button variant="outlined" color="primary">Secondary</Button>

// With icon
<Button startIcon={<IconComponent />}>Label</Button>
```

**Box/Stack Examples:**

```tsx
// Container with spacing
<Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper' }}>
  Content
</Box>

// Flex layout
<Stack direction="row" spacing={2} justifyContent="space-between">
  <Item />
  <Item />
</Stack>

// Responsive display
<Box sx={{ display: { xs: 'none', md: 'block' } }}>
  Desktop only
</Box>
```

**Typography Examples:**

```tsx
// Heading
<Typography variant="h6" sx={{ fontWeight: 600 }}>
  Title
</Typography>

// Body text with theme color
<Typography color="text.secondary">
  Subtitle
</Typography>
```

🧭 Interaction & State Management

• Use MUI's color system for states
– Use theme.palette.primary/secondary/error/warning/success
– Apply via color prop or sx prop: `sx={{ color: 'primary.main' }}`
• Keep animations subtle using MUI transitions
• Provide immediate feedback with contrast changes
• Form validation uses TextField error prop
• Loading states use CircularProgress component

⚠️ Common Mistakes to Avoid

1. ❌ Don't mix Tailwind classes with MUI components

   ```tsx
   // WRONG
   <Button className="p-4 mt-2">Click</Button>

   // CORRECT
   <Button sx={{ p: 2, mt: 1 }}>Click</Button>
   ```

2. ❌ Don't hardcode colors

   ```tsx
   // WRONG
   <Box sx={{ bgcolor: '#1b42d8' }}>Content</Box>

   // CORRECT
   <Box sx={{ bgcolor: 'primary.main' }}>Content</Box>
   ```

3. ❌ Don't use custom button elements

   ```tsx
   // WRONG
   <button className="...">Click</button>

   // CORRECT
   <Button variant="contained">Click</Button>
   ```

4. ❌ Don't use div for layout

   ```tsx
   // WRONG
   <div className="flex gap-4">...</div>

   // CORRECT
   <Stack direction="row" spacing={2}>...</Stack>
   ```

📋 Implementation Checklist

When creating or updating UI components:

- [ ] Use only MUI components (Button, Box, Stack, TextField, etc.)
- [ ] Replace all Tailwind classes with sx props
- [ ] Use theme colors via theme.palette references
- [ ] Apply responsive design via sx media queries
- [ ] Ensure zero border-radius consistency
- [ ] Use Typography for all text elements
- [ ] Use Stack/Box for layout instead of divs
- [ ] Test on both desktop (md+) and mobile (xs-sm) viewports
