---
name: Pingkin
description: Calm, glassy reminders that keep checking in until it's done.
colors:
  light-ground: "#E9EFE8"
  light-ink: "#18241C"
  light-ink-secondary: "#4B5C50"
  light-ink-tertiary: "#64766A"
  light-sage: "#4C7D59"
  light-sage-text: "#3B6847"
  light-amber: "#9C6427"
  light-clay: "#9E4F3F"
  dark-ground: "#0D1813"
  dark-ink: "#E6EEE7"
  dark-ink-secondary: "#A8BAAD"
  dark-ink-tertiary: "#86998B"
  dark-lichen: "#B6D3A3"
  dark-on-lichen: "#10201A"
  dark-amber: "#E6BA80"
  dark-clay: "#E5A291"
typography:
  display:
    fontFamily: "Instrument Serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: "48px"
    letterSpacing: "-0.6px"
  large-title:
    fontFamily: "Instrument Serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: "42px"
    letterSpacing: "-0.4px"
  title:
    fontFamily: "Instrument Serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "34px"
  title2:
    fontFamily: "Instrument Serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: "28px"
  headline:
    fontFamily: "system-ui"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "22px"
  body:
    fontFamily: "system-ui"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "23px"
  footnote:
    fontFamily: "system-ui"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  caption:
    fontFamily: "system-ui"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.2px"
rounded:
  sm: "12px"
  md: "16px"
  lg: "22px"
  xl: "28px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  xxxl: "32px"
components:
  button-primary-light:
    backgroundColor: "{colors.light-sage}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    height: "50px"
    padding: "0 24px"
  button-primary-dark:
    backgroundColor: "{colors.dark-lichen}"
    textColor: "{colors.dark-on-lichen}"
    rounded: "{rounded.full}"
    height: "50px"
    padding: "0 24px"
  chip:
    rounded: "20px"
    height: "40px"
    padding: "0 16px"
  icon-button:
    rounded: "{rounded.full}"
    size: "44px"
  glass-card:
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Pingkin

## Overview

**Creative North Star: "Mist & Forest"**

Opening the app should feel like stepping into a quiet greenhouse: morning mist in light mode, a forest at night in dark mode. Every screen sits on one pre-blurred botanical backdrop (`assets/backdrop-light.jpg`, `assets/backdrop-dark.jpg`) that drifts slower than the content. Content lives on frosted glass panels with a bright hairline edge. Titles and names are set in a soft serif; everything else uses the phone's own font, so the app reads as native with a gentle voice on top.

The system is deliberately quiet. Status is told in muted tones (sage for done, amber for waiting, clay for missed), never red badges or alarms, because the product is accountability without nagging. One moment gets real choreography: tapping Done. The check fills from its centre, a ripple goes out, the phone gives a success haptic, and the row glides into "Done today".

The user chose this world from their own references: frosted botanical glass, a misty sage light mode, a deep forest-green dark mode, and a serif like the "Leafora" reference.

**Key Characteristics:**
- One shared blurred-leaf backdrop per appearance, with 0.25x scroll parallax
- Frosted glass panels: translucent fill, bright hairline edge, soft offset shadow
- Serif (Instrument Serif) for titles, names and numbers; system sans for UI
- Thin Ionicons outline icons in round tinted wells; no emoji in the interface
- Large titles that collapse into a frosted inline bar on scroll
- Light and dark are first-class, following the system unless set in the You tab

## Colors

Restrained: two neutral grounds, one green accent per appearance, and two muted status tones. Category and relationship colours are soft tints, never fills.

### Primary
- **Sage** (#4C7D59, light): primary buttons, the Done fill, progress rings, the active tab, selected chips. White text on it.
- **Lichen** (#B6D3A3, dark): the same roles at night. A pale green with dark ink on it (#10201A), like Leafora's "Get Started" button.

### Secondary
- **Amber** (#9C6427 light, #E6BA80 dark): waiting, snoozed and running-low states, always on a 14–17% tint of itself.
- **Clay** (#9E4F3F light, #E5A291 dark): missed nudges and destructive actions (remove, reset, delete). It is never alarm-red.

### Neutral
- **Morning Mist** (#E9EFE8): the light ground under the backdrop.
- **Forest Night** (#0D1813): the dark ground.
- **Deep Green Ink** (#18241C) / **Pale Leaf Ink** (#E6EEE7): primary text.
- **Moss Grey** (#4B5C50 / #A8BAAD): secondary text and meta lines.
- **Lichen Grey** (#64766A / #86998B): tertiary text, placeholders and chevrons.
- **Glass**: rgba(255,255,255,0.52) light, 0.055 dark; **Strong glass**: 0.74 light, 0.095 dark; **Glass edge**: rgba(255,255,255,0.9) light, 0.11 dark.

### Named Rules
**The Calm Status Rule.** State colour is told with a tinted well or tag (fg plus a 14% bg of the same hue), never a solid red or orange block. Missed is clay, waiting is amber, done is sage.

**The One Green Rule.** Sage (light) or lichen (dark) is the only saturated fill on a screen. Category tints (lilac medicine, sky water, moss movement, honey homework, clay check-in) stay at 14–15% behind their icons.

## Typography

**Display Font:** Instrument Serif (bundled via @expo-google-fonts/instrument-serif, regular and italic)
**Body Font:** the platform face (SF Pro on iOS, Roboto on Android), with no fontFamily set

**Character:** A soft, slightly condensed serif gives titles, names and numbers a handwritten-card warmth. The platform sans keeps controls native and Dynamic Type friendly.

### Hierarchy
- **Display** (400, 44/48, -0.6): the receiver's nudge title, onboarding name, big times and streak numbers.
- **Large Title** (400, 36/42): top-level screen titles and the Home greeting. The italic accent line (the user's name) uses the serif italic in the accent text colour.
- **Title** (400, 28/34): profile names, stats, sheet success states.
- **Title 2** (400, 22/28): section headings and card titles.
- **Headline** (600, 17/22): row titles and button labels.
- **Body / Callout** (400, 16/23 and 15/21): reading text.
- **Footnote** (400, 13/18): meta lines ("For Sarah · 9:00 PM · Daily").
- **Caption** (500, 12/16, +0.2): tags, tab labels, small counts.

### Named Rules
**The Serif-For-People Rule.** People's names, screen titles and counts take the serif; controls, labels and meta never do.

## Layout

A single column with a 20px side gutter on every screen. Lists use 10px gaps between glass rows. Sections open with a Title 2 heading, 24px above and 12px below. Top-level screens reserve 112px plus the safe-area inset at the bottom for the floating tab bar. Focused tasks (Create, Add someone, the receiver screen) hide the tab bar and pin their primary action to the bottom safe area. Horizontal chip and avatar rails bleed to the screen edge (−20px margins) and scroll.

## Elevation & Depth

Depth comes from translucency first and shadow second. Glass panels carry a soft, offset, low-opacity shadow tinted with deep green (light) or black (dark). Android elevation is kept at 0, because elevation draws through translucent fills. Real backdrop blur (expo-blur) is used only for chrome content scrolls under: the collapsing top bar, the tab bar and sheets. On Android those use a near-opaque tinted fill instead.

### Shadow Vocabulary
- **Soft** (offset 0 6, blur 18, opacity 0.09 light / 0.32 dark): every glass panel at rest.
- **Lifted** (offset 0 14, blur 32, opacity ×1.3): hero panels (Today, featured person, streak), the tab bar.
- **Accent** (offset 0 8, blur 18, sage-tinted in light): primary buttons and the create button only.

### Named Rules
**The Glass-Has-A-Job Rule.** Glass groups content over the backdrop. Glass is never nested inside glass, and blur is reserved for chrome that content passes under.

## Shapes

Soft, rounded and pebble-like. Panels use 22px corners (28–36px for heroes and sheets). Buttons, chips, tags and icon buttons are full pills or circles. Icon wells are circles. Dividers are hairlines inset to align with row text.

## Components

### Buttons
- **Shape:** full pill; 40 / 50 / 56px heights for sm / md / lg.
- **Primary:** sage fill with white label (light), lichen fill with dark label (dark); accent shadow; success-tap haptic.
- **Glass:** strong-glass fill, hairline glass edge, ink label.
- **Quiet:** text only, in accent text colour.
- **Danger:** clay label on a clay tint, for remove, reset and delete only.
- **Press:** every pressable settles to 0.97 scale and springs back (Tap primitive).

### Chips
- **Style:** 40px pill, strong glass with a hairline edge, optional 16px leading icon.
- **State:** selected chips fill with the accent and switch to on-accent text.

### Cards / Containers
- **Corner Style:** 22px (lg), 28px (xl) for heroes.
- **Background:** glass, or strong glass for emphasis and unread items.
- **Border:** 1px glass edge.
- **Internal Padding:** 16px; heroes 20px.

### Inputs / Fields
- **Style:** strong-glass panel (16–20px radius) holding a borderless TextInput; selection and caret in the accent.
- **Focus:** the native caret only; no glow rings.

### Navigation
- **Tab bar:** a floating glass pill (68px, 16px side margins), four tabs (Home, Circle, History, You) around a 52px accent "+" circle. The active tab gets a filled icon, accent label, and a soft accent pill that slides between tabs on a spring.
- **Top bar:** transparent at rest. It fades to frosted glass with a hairline once the large title tucks under (scroll offset ~52). The inline title rises 8px as it fades in. Back and close are 44px glass circles.

### Done Check (signature)
A 44px (rows) or 104px (receiver screen) circle with a faint ring. On tap: success haptic, accent fill springs from the centre, the tick pops from 0.4 to 1, and one ripple ring expands to 1.9x and fades. After 480ms the nudge is completed and the list reflows with a layout transition. With Reduce Motion on, it fills in 120ms with no ripple.

### Today Panel
A strong-glass hero with an 84px progress ring (done / total, serif numerals), a streak tag and an "Up next" line. As it scrolls away it settles back to 0.95 scale and 0.55 opacity.

## Do's and Don'ts

### Do:
- **Do** start every screen from the `Screen` scaffold (`src/ui/Screen.tsx`) so the backdrop, parallax and collapsing header stay consistent.
- **Do** use `Txt` variants and `theme.c` tokens; never hard-code a hex in a screen.
- **Do** put state in tinted tags and wells (Calm Status Rule).
- **Do** keep tap targets at 44px or more and give icon-only buttons an accessibilityLabel.
- **Do** gate every entrance, parallax and ripple on `useReducedMotion()`.

### Don't:
- **Don't** use emoji as interface icons. Emoji belong only to user content (cheers, bios).
- **Don't** nest glass in glass or add blur to content panels.
- **Don't** use solid red, alarm badges or guilt copy for missed or overdue states.
- **Don't** set a serif on controls or meta text.
- **Don't** add Android `elevation` to translucent panels.
