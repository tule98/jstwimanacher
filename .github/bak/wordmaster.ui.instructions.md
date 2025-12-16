---
applyTo: "**"
---

# Mobile App Design Style Guide

## Color Palette

### Primary Colors

- Deep Purple (#4318FF)
- Electric Blue (#6B8AFF)
- Sunset Orange (#FF6B35)
- Vibrant gradient transitions from purple to orange

### Glassmorphic Surfaces

- White overlay at 15% opacity
- Backdrop blur between 20-40px
- White border at 20% opacity
- Very subtle shadows with low intensity

### Dark Mode

- Background: Near black (#1A1A1A to #0F0F0F)
- Card surface: White at 5% opacity
- Text primary: Pure white
- Text secondary: White at 70% opacity

## Typography

### Font Selection

- Primary: SF Pro Display (iOS) / Roboto (Android)
- Fallback: System default fonts

### Size Scale

- Hero numbers: 96-120px, weight 700
- Large headings: 32-40px, weight 600
- Card titles: 20-24px, weight 600
- Body text: 15-17px, weight 400
- Captions: 12-14px, weight 400
- Small labels: 11px, weight 500

### Text Color Rules

- Primary text: Pure white on colored backgrounds
- Secondary text: White at 60-80% opacity
- Maintain high contrast for readability

## Card System

### Glass Card Properties

- Background: White at 15% opacity with heavy blur
- Border radius: 24-32px
- Border: 1px white at 20% opacity
- Internal padding: 20-24px
- Minimal drop shadow

### Card Dimensions

- Small widgets: 160×140px
- Medium widgets: 340×160px
- Large cards: Full width × 200px minimum
- Detail cards: Full width with flexible height

### Card Hierarchy

- Primary metrics receive largest visual emphasis
- Secondary info displayed in grid layouts
- Action cards for calls-to-action
- Content cards for educational material

## Spacing System

### Base Unit

- All spacing uses 4px increments

### Spacing Scale

- 4px: Tight spacing
- 8px: Icon-text gaps
- 12px: Card internal spacing
- 16px: Element separation
- 24px: Card group separation
- 32px: Major section breaks
- 48px: Screen margins

### Layout Spacing

- Screen edge padding: 16-20px
- Gap between cards: 12-16px
- 2-column grid gap: 12px
- Maximum content width: 390px

## Interactive Elements

### Button Styles

- Primary: White background, colored text, 20px radius, subtle shadow
- Glass: White at 20% opacity, blur effect, subtle border
- Padding: 12-28px vertical and horizontal
- Font weight: 600

### Navigation

- Bottom navigation height: 80px
- Icon size: 24×24px
- Active state: Filled background with shadow
- Inactive state: 60% opacity

### Card Interactions

- Subtle 3D tilt on interaction
- Blur and opacity shifts
- Minimal shadow intensity changes
- Gradient color transitions

## Iconography

### Icon Guidelines

- Style: Rounded with filled active states
- Size range: 20-48px
- Stroke width: 2px for outlined versions
- Colors: Theme-matched or white

### Icon Usage

- Fire emoji for calories and energy
- Heart for health metrics
- Sleep emoji for rest tracking
- Charts for analytics
- Home icon for navigation

### Custom Graphics

- Use 3D rendered elements
- Integrate emoji as design components
- Combine with glassmorphic backgrounds

## Motion & Animation

### Timing

- Standard interactions: 200-400ms
- Easing: Ease-out for entrances, ease-in-out for transitions
- Use spring physics for natural movement

### Key Animations

- Card entry: Fade with upward slide (300ms)
- Swipe gesture: Follow finger with 3D rotation
- Number changes: Smooth counting animation
- Chart reveal: Staggered element entrance
- Button press: Scale to 95% (150ms)

### Micro-interactions

- Haptic feedback on press
- Subtle bounce on tap
- Smooth color transitions (300ms)
- Loading shimmer effects

## Layout Patterns

### Dashboard Structure

- Header with greeting and profile: 80px
- Hero metric display: 200px
- Quick stats grid (2×2): 300px
- Action cards: Full width, variable height
- Bottom navigation: 80px fixed

### Detail View Structure

- Floating back button: 48px top-left
- Visual header with icon: 200px
- Primary metric display: 120px
- Supporting data grid (2 columns): 100px
- Visualization area: 200px full width
- Bottom navigation: 80px fixed

### Flashcard Pattern

- 3D tilt perspective effect
- Full card draggable area
- Content centered vertically and horizontally
- Progress indicator at top: 4px height

## Data Visualization

### Chart Styling

- Background: Glassmorphic card
- Data elements: Vibrant gradient fills
- Grid lines: Subtle white at 10% opacity
- Labels: Small secondary text
- Animation: Staggered reveal on load

### Progress Indicators

- Circular: Gradient stroke
- Linear: Rounded ends with gradient fill
- Numeric: Large display with goal fraction

### Visualization Colors

- Primary data: Purple to blue gradient
- Secondary data: Orange to pink gradient
- Tertiary data: Cyan to teal gradient

## Responsive Behavior

### Target Sizes

- Mobile design target: 375-428px
- Tablet scaling: 768px+
- Desktop maximum: 1200px centered

### Scaling Rules

- Maintain consistent screen padding
- Scale fonts proportionally for larger screens
- Expand cards horizontally, cap height
- Use 3-column grid on tablet vs 2-column mobile

## Accessibility

### Contrast Requirements

- Body text: Minimum 4.5:1
- Large text: Minimum 3:1
- Test against all background types

### Touch Targets

- Minimum size: 44×44px
- Spacing between targets: 8px minimum
- Active area extends beyond visual bounds

### Motion Sensitivity

- Respect reduced motion preferences
- Provide instant transitions as fallback

### Text Readability

- Support dynamic type sizing
- Avoid text over complex gradients
- Clear size and weight hierarchy

## Best Practices

### Performance

- Optimize backdrop blur effects
- Lazy load heavy chart libraries
- Compress gradient assets
- Maintain 60fps animations

### Cross-Platform

- Test glassmorphism on all platforms
- Provide fallback solid backgrounds
- Use platform-appropriate navigation
- Respect system font preferences

### Design Quality

- Keep glass effects subtle
- Ensure text readability everywhere
- Test on physical devices
- Use semantic structure
- Maintain consistent spacing rhythm
