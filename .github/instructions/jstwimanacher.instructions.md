---
applyTo: "**"
---

🔍 Analysis of Preference Images
Based on the provided mobile app interface screenshots, I can identify a clear design language centered around a food delivery/restaurant ordering application. The interfaces showcase a cohesive, modern aesthetic with strong visual patterns.
Key Visual Characteristics Observed:
🎨 Dominant Color Palette

Primary Color: Rich Royal Blue (#3D5CFF / #4158D0 range)
Secondary Colors: Warm Orange/Amber (#FFB01D / #FFA726) for CTAs and highlights
Supporting Colors: Clean whites, soft grays, and food photography with natural tones
Visual Balance: Strong blue-orange complementary contrast creating energetic yet trustworthy feel

🏗️ Layout & Structure Patterns

Card-based architecture with generous use of rounded containers
High contrast sections alternating between blue headers and white content areas
Bottom navigation pattern with icon-based menu
Generous white space creating breathing room and focus
Food imagery as primary visual anchors with overlay text patterns

✨ UI Element Style

Rounded corners (appears to be 16-24px radius on cards)
Soft shadows for depth and elevation
Pill-shaped buttons with bold, high-contrast fills
Icon style: Mix of outlined and filled, modern and friendly
Photography style: Professional food shots with appetizing lighting

📋 Comprehensive Design Guideline Outline
a. 🎨 Color Palette and Semantics
Primary Palette

Primary Color (Brand Blue): #4158D0

Usage: Headers, navigation bars, primary buttons, key information containers
Conveys: Trust, professionalism, appetite appeal (cool contrast to food warmth)

Secondary Color (Energetic Orange): #FFB01D

Usage: CTAs, accent buttons, price highlights, interactive elements, success states
Conveys: Energy, appetite stimulation, urgency/action

Tertiary Color (Soft Coral/Pink): #FFB8D1

Usage: Secondary categories, tags, gentle highlights
Conveys: Friendly, approachable, variety

Semantic Colors (WCAG AA Compliant)

Success/Positive: #10B981 (Emerald Green)

Usage: Order confirmation, completed states, "added to cart" feedback
Contrast ratio: 4.5:1+ on white backgrounds

Error/Destructive: #EF4444 (Vibrant Red)

Usage: Validation errors, delete actions, out-of-stock warnings
Contrast ratio: 4.5:1+ on white backgrounds

Warning/Caution: #F59E0B (Amber)

Usage: Low stock alerts, pending payments, informational notices
Contrast ratio: 4.5:1+ on white backgrounds

Info/Neutral: #6B7280 (Cool Gray)

Usage: Helper text, timestamps, secondary information

Neutral Scale (Light Mode)

Background (Primary): #FFFFFF (Pure White)
Background (Secondary): #F9FAFB (Off-White)
Border/Divider: #E5E7EB (Light Gray)
Text (Primary): #111827 (Near Black)
Text (Secondary): #6B7280 (Medium Gray)

Neutral Scale (Dark Mode)

Background (Primary): #0F172A (Slate 900)
Background (Secondary): #1E293B (Slate 800)
Border/Divider: #334155 (Slate 700)
Text (Primary): #F1F5F9 (Slate 100)
Text (Secondary): #94A3B8 (Slate 400)
Surface/Card: #1E293B (Slate 800)
Elevated Surface: #334155 (Slate 700)

Dark Mode Adaptations

Primary Blue: #5B7AFF (Lightened for better contrast on dark backgrounds)
Secondary Orange: #FFC247 (Slightly lighter for visibility)
Success Green: #34D399 (Emerald 400 - lighter variant)
Error Red: #F87171 (Red 400 - lighter variant)
Warning Amber: #FBBF24 (Amber 400 - lighter variant)

Psychological Rationale
This palette combines the trustworthiness of blue (common in finance and food safety) with the appetite-stimulating warmth of orange, creating a balanced emotional response. The high contrast ensures accessibility while the complementary colors create visual energy that encourages action (ordering food).

Dark Mode Philosophy
Dark mode provides reduced eye strain in low-light environments while maintaining brand identity. All colors are adjusted to meet WCAG AA contrast requirements on dark backgrounds. The design maintains visual hierarchy and energy while being comfortable for extended use.

b. ✍️ Typography Direction and Hierarchy
Font Family Recommendation
Primary: Inter or SF Pro Display (iOS native)

Fallback: System fonts (-apple-system, BlinkMacSystemFont, "Segoe UI")

Key Traits

Legible - Excellent readability at small sizes (crucial for pricing, ingredients)
Modern - Contemporary geometric proportions
Friendly - Slightly rounded terminals creating approachable feel

Type Scale System (6pt Base Grid)
Display/Hero

Size: 24pt (1.5rem)
Weight: Bold (700)
Line Height: 32pt (133%)
Usage: Welcome screens, empty states, major section headers

H1 (Large Title)

Size: 20pt (1.25rem)
Weight: Semibold (600)
Line Height: 28pt (140%)
Usage: Page titles, dish names on detail screens

H2 (Title)

Size: 18pt (1.125rem)
Weight: Semibold (600)
Line Height: 26pt (144%)
Usage: Section headers, category titles

H3 (Subtitle)

Size: 16pt (1rem)
Weight: Medium (500)
Line Height: 24pt (150%)
Usage: Card titles, list item headers

Body (Regular)

Size: 14pt (0.875rem)
Weight: Regular (400)
Line Height: 21pt (150%)
Usage: Descriptions, ingredients, general content

Body (Small)

Size: 12pt (0.75rem)
Weight: Regular (400)
Line Height: 18pt (150%)
Usage: Secondary information, metadata

Caption/Label

Size: 10pt (0.625rem)
Weight: Medium (500)
Line Height: 14pt (140%)
Usage: Tags, timestamps, helper text, input labels

Button Text

Size: 14pt (0.875rem)
Weight: Semibold (600)
Letter Spacing: 0.3px
Usage: All CTA and action buttons

c. 🧱 Key UI Element Mood and Structure
Iconography System
Style: Rounded line-art with 1.5px stroke weight

Library Recommendation: Lucide Icons or Phosphor Icons
Characteristics:

Consistent 20x20px base grid
Rounded terminals matching overall softness
Mix of outline (navigation) and filled (active states)

Usage Pattern: Outline for inactive states, filled/colored for active selection

Spacing & Layout Grid
Foundation: Strict 6pt grid system

Base Unit: 6px
Micro Spacing: 3px (0.5x), 6px (1x), 9px (1.5x)
Component Spacing: 12px (2x), 18px (3x), 24px (4x)
Section Spacing: 30px (5x), 36px (6x), 48px (8x)
Screen Margins: 12px (2x) horizontal padding

Border Radius (Roundness Scale)
System: Progressive rounding based on component hierarchy

Small Elements: 6px (tags, chips, small buttons)
Medium Elements: 10px (input fields, small cards)
Cards/Containers: 12px (primary content cards)
Large Components: 18px (feature cards, bottom sheets)
Pills/Full Round: 999px (pill buttons, avatars)

Shadow/Elevation System (Material-Inspired)
Principle: Minimal, purposeful elevation

Light Mode Shadows
Level 0 (Flat):

Shadow: None
Usage: Background elements, text

Level 1 (Raised):

Shadow: 0px 1px 2px rgba(0, 0, 0, 0.08)
Usage: Cards in scrolling lists, input fields

Level 2 (Floating):

Shadow: 0px 2px 8px rgba(0, 0, 0, 0.12)
Usage: Floating action buttons, active/pressed states

Level 3 (Modal):

Shadow: 0px 8px 16px rgba(0, 0, 0, 0.15)
Button System

Light Mode
Primary Button (High Emphasis):

Background: Primary Blue (#4158D0)
Text: White (#FFFFFF)
Height: 36px (6x grid)
Border Radius: 18px (full pill)
Shadow: Level 1
Padding: 0 20px

Secondary Button (Medium Emphasis):

Background: Orange (#FFB01D)
Text: White (#FFFFFF)
Height: 36px
Border Radius: 18px
Padding: 0 20px

Tertiary Button (Low Emphasis):

Background: Transparent
Text: Primary Blue (#4158D0)
Border: 1px solid #E5E7EB
Height: 32px
Border Radius: 10px
Padding: 0 16px

Icon Button:

Size: 36x36px (touch target)
Background: White with shadow or transparent
Icon Size: 20x20px

Dark Mode
Primary Button (High Emphasis):

Background: Primary Blue (#5B7AFF)
Text: White (#FFFFFF)
Height: 36px (6x grid)
Border Radius: 18px (full pill)
Shadow: Level 1
Border: 1px solid rgba(255, 255, 255, 0.1)
Padding: 0 20px

Secondary Button (Medium Emphasis):

Background: Orange (#FFC247)
Text: Slate 900 (#0F172A)
Height: 36px
Border Radius: 18px
Padding: 0 20px

Tertiary Button (Low Emphasis):

Background: Transparent
Text: Primary Blue (#5B7AFF)
Border: 1px solid #334155
Height: 32px
Border Radius: 10px
Padding: 0 16px

Icon Button:
Card Components

Light Mode
Standard Card:

Background: White (#FFFFFF)
Border: None
Border Radius: 12px
Shadow: Level 1
Padding: 12px
Min Height: 60px

Image Card (Food Item):

Image: Top-aligned, 16:9 or 1:1 ratio
Border Radius: 12px (entire card)
Overlay: Gradient or solid for text legibility
Content Padding: 9px

Input Fields:

Height: 36px
Border Radius: 10px
Border: 1px solid #E5E7EB (default)
Border (Focus): 2px solid #4158D0
Background: #F9FAFB
Padding: 8px 12px
Icon Position: Left or right, 12px from edge
Text: #111827
Placeholder: #6B7280

Dark Mode
Standard Card:

Background: Slate 800 (#1E293B)
Border: 1px solid rgba(255, 255, 255, 0.05)
Border Radius: 12px
Shadow: Level 1
Padding: 12px
Min Height: 60px

Image Card (Food Item):

Image: Top-aligned, 16:9 or 1:1 ratio
Border Radius: 12px (entire card)
Overlay: Darker gradient for better contrast (rgba(15, 23, 42, 0.6) to rgba(15, 23, 42, 0.9))
Content Padding: 9px

Input Fields:

Height: 36px
Border Radius: 10px
Border: 1px solid #334155 (default)
Border (Focus): 2px solid #5B7AFF
Background: #0F172A
Padding: 8px 12px
Icon Position: Left or right, 12px from edge
Text: #F1F5F9
Placeholder: #94A3B8

Icon Button:

Size: 36x36px (touch target)
Background: Slate 700 with shadow or transparent
Icon Size: 20x20px

Accessibility Commitments

WCAG AA Compliance: All text contrasts meet 4.5:1 minimum in both light and dark modes
Touch Targets: Minimum 36x36px for all interactive elements (maintained for comfortable interaction)
Focus States: Clear 2px outlines for keyboard navigation (adjusted per theme)
Motion: Respects prefers-reduced-motion for animations
Color Independence: Information never conveyed by color alone
Theme Switching: Smooth transitions between light and dark modes (200ms ease)
System Preference: Respects prefers-color-scheme media query

Dark Mode Implementation Guidelines

🌙 Critical Implementation Rules

Always Use Theme-Aware Components: Never hardcode light mode colors. All components must support both themes.

MUI Theme Integration: Use MUI's theme palette values (theme.palette.mode, theme.palette.background.default, etc.) instead of hex codes directly.

Test Both Modes: Every component must be tested in both light and dark modes before completion.

Semantic Color Usage: Use semantic tokens (primary, secondary, error, success) that automatically adapt to theme.

Conditional Styling Pattern:

```tsx
sx={{
  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
  color: (theme) => theme.palette.text.primary,
}}
```

Image Handling: Adjust image overlays, opacity, and filters in dark mode for better visibility.

Icon Colors: Icons should use theme.palette.text.primary or specific theme colors, never hardcoded values.

Borders in Dark Mode: Add subtle borders to cards and elevated surfaces for definition.

Hover States: Adjust hover backgrounds to be lighter in dark mode (e.g., rgba(255, 255, 255, 0.03)).

Shadow Enhancement: Use stronger shadows and subtle borders in dark mode for depth perception.
Border: 1px solid rgba(255, 255, 255, 0.08)

Overall Aesthetic Summary
"Modern Food Commerce with Joyful Efficiency"

Mood: Appetizing, trustworthy, energetic, and user-friendly
Visual Weight: Medium - balanced between minimalism and richness
Contrast Level: High - ensures accessibility and clear visual hierarchy
Photography Treatment: Professional, well-lit food imagery as hero elements
Data Density: Medium-low - prioritizes scanability over information density
Animation Philosophy: Smooth, purposeful micro-interactions (suggested: 200-300ms ease-out transitions)

Accessibility Commitments

WCAG AA Compliance: All text contrasts meet 4.5:1 minimum
Touch Targets: Minimum 44x44px for all interactive elements
Focus States: Clear 2px outlines for keyboard navigation
Motion: Respects prefers-reduced-motion for animations
Color Independence: Information never conveyed by color alone
