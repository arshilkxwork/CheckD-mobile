# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

One shared visual language on iOS and Android (Expo / React Native). What adapts per OS is the native affordances: back gestures and hardware back, haptics, safe areas, notification permission flow, and system light/dark mode.

## Users

Partners and couples first: two people who look out for each other and want small daily things done (medication, water, vitamins, routines) without one of them having to ask, remind, or worry. Secondary audiences are adult children caring for parents, parents nudging kids, and friends keeping each other consistent.

## Product Purpose

Pingkin (working name; formerly CheckD / Chekd) turns reminders into small acts of care. Someone sets a nudge for a person they care about (or for themselves). The nudge pings at the set time and keeps pinging at a chosen interval until the recipient taps Done; then the pings stop and the sender learns it's done. Success is less worrying and less nagging: tasks get done, and the relationship feels supported, not policed.

## Positioning

It isn't a to-do list. Its mechanism is persistent, gentle follow-up that only stops on confirmation, plus the sender being told when it's done. That replaces nagging between two people with a quiet, shared signal.

## Operating Context

- Opened briefly and often: to set a nudge, confirm one from a notification, or glance at whether someone is OK.
- The key moment is the notification, with its Done and Snooze buttons. The app itself is calm and secondary to it.
- Used at all hours, including late evening medication reminders, so both light and dark appearances matter.

## Capabilities and Constraints

- Nudges have a recipient (a person or yourself), a category (medicine, water, exercise, homework, check-in, custom), a time, a repeat (once, daily, weekdays, weekends, weekly), and a follow-up interval (5–60 min).
- States: pending, snoozed, completed, missed. History, streaks, and insights are derived from them.
- Also includes: people/circle with relationship types, Care Cabinet (medications, supply, refills, dose logs), routine templates, cheers (reactions), in-app notifications, privacy and notification preferences, and quiet hours.
- Data is currently on-device only (AsyncStorage) with local notifications. A Node/Express + Postgres backend exists in `checkd-backend/` but isn't wired in, and nudges don't reach another person's phone yet.
- Proof types other than one-tap (photo, note, voice) are not built and are shown as "Soon".

## Brand Commitments

- Voice: warm, gentle, never alarming or guilt-inducing. "A little reminder from someone who cares." Accountability without nagging.
- Taglines from the source copy: "Set it. Ping it. Get it done." and "Less worrying. Less nagging. More caring."
- The name "Pingkin" is a working name and may change. Keep the name in one place (`app.json` → `expo.name`).

## Evidence on Hand

No real users, testimonials, ratings, or usage statistics exist. Never fabricate them. Sample people and nudges (`src/data/`) are opt-in demo content only.

## Product Principles

1. Care over control: every reminder, status, and missed state should read as support, never surveillance or blame.
2. The notification is the product: one tap to Done, from anywhere, has to stay effortless.
3. Calm by default: opening the app should lower the user's heart rate, not raise it.
4. Honest state: show what is actually true (on-device only, what's pending, what was missed) without decoration that misleads.

## Accessibility & Inclusion

Used by older parents as a secondary audience: text must stay legible, tap targets generous, and status never conveyed by colour alone. Respect the OS reduce-motion setting.
