# Brainfuel 🧠⚡

**Beat the doom-scroll. Earn your screen time with your brain.**

Brainfuel is an iOS focus and self-control app. You choose the apps that distract
you (Instagram, TikTok, and so on). When you try to open one, Brainfuel blocks it
and gives you a short brain-game quiz. Pass it and you earn 15 minutes of access;
miss it and the app stays locked. When the 15 minutes are up, the block comes back
automatically.

It is a fun, gamified way to break compulsive app habits, built around quick
mental challenges instead of a guilt-trip.

## How it works

1. **Pick the apps to block** in Brainfuel.
2. **Open a blocked app** and Brainfuel intercepts it with a lock screen.
3. **Play a quick quiz** (1, 3, or 5 questions) to unlock.
4. **Pass** and you get 15 minutes. **Re-shielded** automatically afterward.

## Game categories

Original, brain-stimulating questions across several categories, backed by
cognitive-science research on what actually exercises the mind:

- **Memory** — working-memory and recall challenges
- **Math** — fresh mental arithmetic, generated every time
- **Puzzles** — logic, spatial reasoning, pattern recognition
- **Riddles** — lateral thinking and insight
- **Sequences** — find the rule in number and letter patterns
- **Wordplay** — anagrams, vocabulary, verbal reasoning

You choose a category or a random mix, and how many questions it takes to unlock.

## How the blocking works (Apple Screen Time API)

Brainfuel uses Apple's **Family Controls**, **ManagedSettings**, and
**DeviceActivity** frameworks to shield the apps you select and present a custom
shield screen. Your app selections stay private: iOS hands the app only opaque
tokens, so Brainfuel never sees which apps you picked. After a passed quiz, the
shield is lifted for 15 minutes and DeviceActivity re-applies it when the window
ends.

## Tech

- Expo (React Native, TypeScript)
- Apple Screen Time API via `react-native-device-activity`
- Firestore and StoreKit for accounts and subscriptions (3-day free trial)

## Status

In active development for iOS. Subscription-based with a 3-day free trial.
Android is planned after the iOS launch.
