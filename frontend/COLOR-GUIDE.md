# EcoFinds Color Palette Guide

## Color Palette
Our standardized color palette creates a cohesive, sustainable marketplace brand experience for pre-owned goods:

### Primary Colors
- **Primary (#124170)** - Dark blue for headers, primary actions, and main text
- **Secondary (#26667F)** - Medium blue for secondary elements and accents
- **Accent (#67C090)** - Green for success states, highlights, and sustainable marketplace elements
- **Background (#DDF4E7)** - Light green for page backgrounds and subtle areas

### Usage Guidelines

#### Primary (#124170)
- Main navigation text
- Primary buttons
- Important headings
- Call-to-action elements
- Focus states

#### Secondary (#26667F)
- Secondary buttons
- Subheadings
- Supporting text elements
- Hover states

#### Accent (#67C090)
- Success messages
- Sustainability badges
- Positive actions
- Highlights and emphasis
- Online status indicators

#### Background (#DDF4E7)
- Page backgrounds
- Section backgrounds
- Subtle container backgrounds

## CSS Classes Available

### Background Colors
```css
.bg-primary     /* #124170 */
.bg-secondary   /* #26667F */
.bg-accent      /* #67C090 */
.bg-main        /* #DDF4E7 */
```

### Text Colors
```css
.text-primary   /* #124170 */
.text-secondary /* #26667F */
.text-accent    /* #67C090 */
```

### Border Colors
```css
.border-primary   /* #124170 */
.border-secondary /* #26667F */
.border-accent    /* #67C090 */
```

### Button Styles
```css
.btn-primary    /* Primary button with #124170 background */
.btn-secondary  /* Secondary button with #26667F background */
.btn-accent     /* Accent button with #67C090 background */
.btn-outline    /* Outlined button with primary color */
.btn-glass      /* Glass effect button for overlays */
```

### Gradient Classes
```css
.gradient-main     /* Light background gradient */
.gradient-primary  /* Primary to secondary gradient */
.gradient-accent   /* Accent color gradient */
.gradient-text     /* Text gradient effect */
```

### Special Effects
```css
.glass          /* Glass morphism effect */
.card           /* Standard card styling */
.card-elevated  /* Elevated card with more shadow */
```

## Component Color Usage

### Navigation
- Background: `glass` effect or `bg-white`
- Brand text: `gradient-text`
- Links: `text-gray-700` with `hover:text-primary`

### Buttons
- Primary actions: `btn-primary`
- Secondary actions: `btn-secondary` or `btn-outline`
- Success actions: `btn-accent`

### Cards and Containers
- Main containers: `card` or `card-elevated`
- Background sections: `bg-main` or `gradient-main`

### Status Indicators
- Success: `bg-accent` or `text-accent`
- Error: Standard red colors (bg-red-500, text-red-600)
- Warning: Standard yellow/orange colors
- Info: `bg-secondary` or `text-secondary`

## Accessibility Notes
- All color combinations meet WCAG AA contrast requirements
- Never rely solely on color to convey information
- Include icons or text labels alongside color coding
- Test with color blindness simulators

## Brand Consistency
- Always use the defined hex values
- Maintain the eco-friendly, sustainable theme
- Use the accent green for positive, environmental actions
- Keep the overall feel calm and trustworthy with the blue tones
- Focus on the circular economy and extending product lifecycles