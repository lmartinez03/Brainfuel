# Brainfuel — React Native (Expo + TypeScript)

A faithful React Native port of the Brainfuel gamified app-blocker design.
Built with **only** React Native primitives + the four allowed libraries.

---

## 🎨 Color palette (theme.ts → `colors`)

| Token  | Hex       | Use |
|--------|-----------|-----|
| ink    | `#2b1a10` | borders, text, hard shadows |
| bg     | `#ffbf57` | app background (warm orange) |
| bg2    | `#ffd089` | lighter orange |
| paper  | `#fffaf2` | card surface (warm white) |
| coral  | `#ff5630` | primary accent / screen-time hero |
| pink   | `#ff4d6d` | play button / highlights |
| purple | `#7b3ff2` | blocked / lock screen |
| yellow | `#ffd23f` | coins / minutes / accents |
| teal   | `#2fbf9e` | success / brain XP |
| blue   | `#3f9bff` | info |
| muted  | `#9a8470` | muted text |
| white  | `#ffffff` | — |

**Gradients** (`theme.ts → gradients`, for `expo-linear-gradient`):
app icons Scrollr `#ff6f91→#ff3d6e`, Loopz `#ffb24d→#ff7a3c`, Chattr `#ffd23f→#ffae18`,
Pulse `#7b6cff→#5a3ff2`, Snapz `#3fd0ff→#3f9bff`; mascot face `#ffd9cb→#ff8f78`.

**Radii**: 12 / 16 / 18 / 22 / 100(pill).  **Spacing**: 6 / 10 / 12 / 15 / 18 / 24.
**Sticker look**: 3px ink border + a hard (0-blur) offset shadow drawn as a layered View (sm 3 / md 4 / lg 6 px).

## 🔤 Fonts

Design intent is **Baloo 2** (chunky — headings & big numbers) + **Nunito** (rounded — body).
To keep the code runnable with *only* the allowed libraries (no font loader), font families are
**not** applied — the chunky look is approximated with heavy `fontWeight` (700/800/900).
`theme.ts → fonts` documents where to plug the real families in once you load them.

## 🧩 Icons
All icons use **Ionicons** from `@expo/vector-icons` (e.g. `home`, `ban`, `stats-chart`, `person`,
`cart`, `flame`, `play`, `time`, `flash`, `close`, `chevron-back`, `chevron-forward`, `add`).

---

## 📁 Files produced

**Root**
- `App.tsx` — state + simple state-driven navigation + overlays
- `theme.ts` — all colors, gradients, radii, spacing, sticker + font tokens
- `data.ts` — apps, trivia, shop items, weekly stats, badges, types, initial state

**Screens** (`/screens`)
- `HomeScreen.tsx` — dashboard: mascot, screen-time hero, stats, locked apps, play CTA
- `BlockedScreen.tsx` — manage blocked apps (toggles) + shield hero
- `StatsScreen.tsx` — weekly bar chart, brain level/XP, stat grid, most-tempting app
- `ShopScreen.tsx` — "Minute Market", spend minutes (buy/own/can't-afford states)
- `StreaksScreen.tsx` — streak flame, weekly grid, longest streak / freezes
- `ProfileScreen.tsx` — the **You** tab: avatar, badges, settings list
- `GameScreen.tsx` — playable 3-question trivia **+ win/result with confetti**
- `LockScreen.tsx` — full-screen interception when a blocked app is opened

**Components** (`/components`)
- `Sticker.tsx` — bordered card with hard offset shadow (the core surface)
- `Button.tsx` — chunky sticker button (press-into-shadow), color variants
- `Chip.tsx` — pill with border + shadow
- `Toggle.tsx` — on/off switch
- `Bubble.tsx` — mascot speech bubble (+ tail)
- `Mascot.tsx` — "Noodle" the brain buddy, 7 expressions, from RN primitives
- `Confetti.tsx` — Animated falling confetti (no extra libs)
- `AppIcon.tsx` — gradient app tile
- `TopBar.tsx` — brand + streak + shop (minutes) row
- `TabBar.tsx` — bottom nav with raised, fully-opaque center Play button

---

## ▶️ Run it

Drop the folder into an Expo (TypeScript) project so `App.tsx` is the entry, then:

```bash
npx expo install expo-linear-gradient @expo/vector-icons react-native-safe-area-context
npx expo start
```

These are the **only** dependencies used (besides `react` / `react-native`).

## 🧭 Notes
- **Navigation** is a lightweight state machine in `App.tsx` (tabs + overlays) to honor the
  "no extra libraries" rule. Swap in React Navigation later by mapping each screen 1:1.
- **Hard shadows**: RN can't do zero-blur offset box-shadows portably, so `Sticker`/`Button`/`Chip`
  render a duplicate offset View behind the content — visually identical to the web design.
- **State** (minutes, streak, XP, blocked apps, shop purchases) lives in `App.tsx` and flows down
  as props; the earn (quiz win → +min) and spend (shop) loops are wired and working.
