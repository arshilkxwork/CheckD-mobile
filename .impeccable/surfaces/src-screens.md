---
version: 1
slug: "src-screens"
primary_target: "src/screens"
related_targets: ["App.tsx","src/navigation/RootNavigator.tsx"]
---

# App shell and core screens

Scope: every screen of the mobile app (onboarding, Home, Circle, Create, History, You, and their detail stacks). Mode: Operate. Audience: partners first. Job: set a nudge, confirm one, glance whether someone is OK. Constraints: Expo SDK 57, one look on iOS and Android, light and dark following the system with a manual override, Reduce Motion respected, existing AppContext API and behavior unchanged.

## Direction contract

THESIS: Opening the app should feel like stepping into a quiet greenhouse at dawn. It refuses the category default of a bright checklist with red overdue badges; status is told in calm tones, and only Done gets a moment.

OWN-WORLD: Mist & Forest. Light: misty sage-white ground over a pre-blurred leaf backdrop, frosted white glass panels with a bright hairline edge, deep green-black ink, muted sage accent. Dark: forest night green ground, smoked glass at 6–10% white, pale lichen-sage accent with dark ink on it. Instrument Serif for titles and names; the platform sans for everything else. Thin Ionicons outline icons in round glass wells. Soft offset shadows only.

STORY: The user sees who needs a nudge today and what is still waiting, taps Done or sends a new nudge in two taps, and leaves reassured.

FIRST VIEWPORT: Home. A large serif greeting with the user's name, top left. To its right, a round glass bell button. Below: a glass "Today" panel (progress ring of done / total, the next pending nudge with its Done button), then "For you" and "Waiting on" lists. A floating glass tab bar with a centered sage + button.

FORM: Pinned by the user's references (botanical frosted glass, light and dark), which beats the roll; seed key e1788fb9, assigned candidate 5 translated into the pinned world. Signature interaction: the Done moment (check fills from center, ripple ring, success haptic, card glides into Done today via layout transition). Motion grammar: large titles collapse into a frosted inline header on scroll; the backdrop parallaxes at 0.3x; press feedback springs to 0.97; first-mount list stagger capped at 6 items.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
