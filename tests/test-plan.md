# Brainfuel QA Test Plan

**Project:** Brainfuel (iOS app, Expo Go compatible)
**QA Author:** QA Team
**Date:** 2026-06-03
**Scope:** Frontend UI/UX, Backend logic, Integration, Edge Cases

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Frontend Tests](#2-frontend-tests)
   - 2.1 [App Launch & Expo Go Compatibility](#21-app-launch--expo-go-compatibility)
   - 2.2 [Screen Rendering & Navigation](#22-screen-rendering--navigation)
   - 2.3 [Button States & Interactivity](#23-button-states--interactivity)
   - 2.4 [Visual Polish & Gamification](#24-visual-polish--gamification)
   - 2.5 [Unlock Quiz Flow](#25-unlock-quiz-flow)
   - 2.6 [Settings Screens](#26-settings-screens)
   - 2.7 [Onboarding & Shortcuts Setup Flow](#27-onboarding--shortcuts-setup-flow)
3. [Backend Tests](#3-backend-tests)
   - 3.1 [getQuiz: Count Correctness](#31-getquiz--count-correctness)
   - 3.2 [getQuiz: Category Filtering](#32-getquiz--category-filtering)
   - 3.3 [Question Shuffling](#33-question-shuffling)
   - 3.4 [Answer Correctness & answerIndex Validity](#34-answer-correctness--answerindex-validity)
   - 3.5 [Math Question Generator](#35-math-question-generator)
   - 3.6 [Deep Link Parser](#36-deep-link-parser)
   - 3.7 [15-Minute Unlock Window Tracker](#37-15-minute-unlock-window-tracker)
   - 3.8 [Storage / AsyncStorage Stubs](#38-storage--asyncstorage-stubs)
   - 3.9 [Subscription / StoreKit Stubs](#39-subscription--storekit-stubs)
   - 3.10 [Firestore Service Layer Stubs](#310-firestore-service-layer-stubs)
4. [Integration Tests](#4-integration-tests)
   - 4.1 [Module Exports & Import Paths](#41-module-exports--import-paths)
   - 4.2 [Deep-Link Interruption Routing](#42-deep-link-interruption-routing)
   - 4.3 [Correct Quiz -> Unlock Flow](#43-correct-quiz---unlock-flow)
   - 4.4 [Wrong Answer -> Access Denied Flow](#44-wrong-answer---access-denied-flow)
   - 4.5 [Timer Expiry -> Re-prompt Flow](#45-timer-expiry---re-prompt-flow)
5. [Bug-Hunting Checklist](#5-bug-hunting-checklist)
6. [Edge Cases](#6-edge-cases)
7. [Test Execution Notes & How to Test Each Area](#7-test-execution-notes--how-to-test-each-area)

---

## 1. Test Environment Setup

| Item | Requirement |
|------|-------------|
| Device | iPhone (physical preferred) or iOS Simulator >= iOS 16 |
| Expo Go version | Latest from App Store |
| Node / Expo SDK | As specified in package.json (latest SDK) |
| Deep link testing | Use `npx uri-scheme open` or Safari address bar |
| Unit test runner | Jest + `@testing-library/react-native` |
| TypeScript check | `tsc --noEmit` must pass with 0 errors |
| Linter | `eslint` must pass with 0 errors |

**Pre-test checklist:**
- [ ] `npm install` (or `yarn`) completes without errors
- [ ] `npx expo start` launches dev server without errors
- [ ] Expo Go can scan QR code and load the bundle
- [ ] `tsc --noEmit` reports 0 TypeScript errors
- [ ] `.env` / config files are present (or stubs exist) so app does not crash on import

---

## 2. Frontend Tests

### 2.1 App Launch & Expo Go Compatibility

- [ ] App loads in Expo Go without a red error screen
- [ ] No "native module not found" errors (confirms no custom native modules were accidentally added)
- [ ] Bundle compiles in under 60 seconds on first load
- [ ] Hot reload (pressing `r`) works without a full restart
- [ ] No console warnings about deprecated Expo APIs
- [ ] App does not crash on cold launch (fresh Expo Go session, cleared cache)
- [ ] App does not crash when launched via deep link (e.g., `brainfuel://block?app=instagram`)

### 2.2 Screen Rendering & Navigation

**Screens expected to exist:**
- Home / Dashboard
- Quiz Screen
- Quiz Result Screen (success state)
- Quiz Result Screen (failure state)
- Settings: App Blocking List
- Settings: Game Category Picker
- Settings: Question Count Picker
- Onboarding / Shortcuts Setup Guide
- Paywall / Subscription Screen (stub)

**Checks per screen:**
- [ ] Every expected screen renders without a blank white view
- [ ] No "undefined is not an object" runtime crashes during navigation
- [ ] Back navigation (header back button or swipe) works on every screen that should support it
- [ ] Tab bar or stack navigation is consistent; active tab is highlighted correctly
- [ ] Deep-link navigation (`brainfuel://block?app=<name>`) lands on Quiz Screen, not Home
- [ ] Navigating Home -> Settings -> Back returns to Home without state loss
- [ ] Navigating through the quiz and back to Home resets quiz state (no stale answers)
- [ ] Orientation: app is usable in portrait; no layout breaks in portrait mode

### 2.3 Button States & Interactivity

- [ ] Every visible button responds to tap (no dead / zero-opacity overlay buttons)
- [ ] All buttons show a pressed/highlighted state (opacity change, scale, or color shift)
- [ ] Buttons are not double-tappable in a way that triggers duplicate actions (e.g., submitting quiz twice)
- [ ] Answer option buttons disable after one is selected (prevents changing answer)
- [ ] "Start Quiz" button is not tappable again while quiz is loading
- [ ] "Unlock" / "Try Again" buttons on result screen navigate to the correct next destination
- [ ] Settings toggle switches respond immediately and persist after leaving and re-entering the screen
- [ ] "Add to Shortcuts" / "Set Up Automation" button either opens Shortcuts or shows copy-link instructions
- [ ] Subscription CTA button on paywall stub renders and is tappable (even if billing is not wired up)

### 2.4 Visual Polish & Gamification

- [ ] App has a consistent color palette (not default React Native grey)
- [ ] Typography uses a custom or styled font (not only system default)
- [ ] Quiz screen has a visible timer or progress indicator (question x of n)
- [ ] Correct answer feedback is visually distinct (e.g., green highlight, checkmark, success animation)
- [ ] Wrong answer feedback is visually distinct (e.g., red highlight, shake animation, X icon)
- [ ] Result screen (success) feels rewarding, distinct from result screen (failure)
- [ ] Category icons or illustrations are present for Memory, Math, Puzzles, Riddles
- [ ] App icon and splash screen are not the default Expo placeholder
- [ ] No layout overflow or text clipping on standard iPhone screen sizes (375pt, 390pt, 430pt widths)
- [ ] Safe-area insets are respected (content not hidden behind notch or home indicator)
- [ ] Loading states (spinner or skeleton) are shown while quiz questions are fetched/generated

### 2.5 Unlock Quiz Flow

**Setup: launch app via deep link `brainfuel://block?app=instagram` (or equivalent)**

- [ ] Quiz screen receives and displays the target app name ("You tried to open Instagram")
- [ ] Correct number of questions is shown (matches user setting: 1, 3, or 5)
- [ ] Questions display question text clearly
- [ ] Each question shows exactly 4 answer options (or the documented number)
- [ ] Selecting an answer highlights it visually
- [ ] "Next" / "Submit" progresses to the next question
- [ ] After the last question, result screen is shown
- [ ] **All correct:** success state displayed, unlock timer starts, user can proceed to target app
- [ ] **Any wrong (3-question quiz):** failure state displayed, access denied message shown
- [ ] **Any wrong (5-question quiz):** failure state displayed, access denied message shown
- [ ] **All wrong:** failure state displayed, access denied message shown
- [ ] "Back" during quiz prompts confirmation or disallows (no silent quiz abort)
- [ ] Quiz does not show the same question twice in a single session
- [ ] After successful unlock, a 15-minute countdown or indicator is visible somewhere in the UI
- [ ] After 15 minutes have passed, re-opening the blocked app triggers quiz again (not auto-unlock)

### 2.6 Settings Screens

**App Blocking List:**
- [ ] List of popular apps is shown (Instagram, TikTok, Twitter/X, YouTube, etc.)
- [ ] Toggle next to each app saves the blocked/unblocked state
- [ ] State persists after closing and reopening the app
- [ ] Adding a custom app (if feature exists) saves and appears in the list

**Game Category Picker:**
- [ ] All four categories are shown: Memory, Math, Puzzles, Riddles
- [ ] "Random" option is available and is the default
- [ ] Selecting a category persists after leaving the screen
- [ ] Category change takes effect on the next quiz (not mid-quiz)

**Question Count Picker:**
- [ ] Options 1, 3, 5 are shown
- [ ] Default is 3
- [ ] Selecting a count persists after leaving the screen
- [ ] Count change takes effect on the next quiz

### 2.7 Onboarding & Shortcuts Setup Flow

- [ ] Onboarding screen appears on first launch (not on subsequent launches)
- [ ] Step-by-step instructions for creating a Shortcuts automation are shown
- [ ] Instructions reference the correct deep-link URL format for Brainfuel
- [ ] Screenshots or diagrams illustrating the Shortcuts steps are present (or clearly placeholder-marked)
- [ ] "I've set it up" / "Done" button marks onboarding complete and navigates to Home
- [ ] User can re-access setup instructions from Settings

---

## 3. Backend Tests

> Backend logic (services, data, utilities) should be tested with Jest unit tests that run entirely in Node; no device required.

### 3.1 getQuiz: Count Correctness

| Input count | Expected output length |
|-------------|------------------------|
| 1 | 1 question |
| 3 | 3 questions |
| 5 | 5 questions |

- [ ] `getQuiz({ count: 1 })` returns array of length 1
- [ ] `getQuiz({ count: 3 })` returns array of length 3
- [ ] `getQuiz({ count: 5 })` returns array of length 5
- [ ] `getQuiz({ count: 0 })` returns empty array or throws a documented error (not a crash)
- [ ] `getQuiz({ count: 6 })` throws/returns error (6 is not a valid count)
- [ ] Passing no count argument uses the default (3)

### 3.2 getQuiz: Category Filtering

- [ ] `getQuiz({ category: 'memory' })` returns only Memory questions
- [ ] `getQuiz({ category: 'math' })` returns only Math questions
- [ ] `getQuiz({ category: 'puzzles' })` returns only Puzzles questions
- [ ] `getQuiz({ category: 'riddles' })` returns only Riddles questions
- [ ] `getQuiz({ category: 'random' })` returns questions (may be mixed or single-category, but must not throw)
- [ ] `getQuiz({ category: 'invalid_category' })` throws or returns documented error (not silent wrong data)
- [ ] Each question object has a `category` field matching the requested category

### 3.3 Question Shuffling

- [ ] Calling `getQuiz` multiple times with the same params returns questions in different orders (run 10x, expect at least 2 distinct orderings; probability of all same is astronomically low)
- [ ] Answer options within a single question are shuffled (correct answer is not always index 0)
- [ ] After shuffling answer options, `answerIndex` still points to the correct answer
- [ ] Shuffling does not duplicate questions within a single quiz result
- [ ] Shuffling does not modify the underlying question pool (source array is not mutated)

### 3.4 Answer Correctness & answerIndex Validity

For every question in every category pool:
- [ ] `answerIndex` is an integer in the range `[0, options.length - 1]`
- [ ] `options[answerIndex]` is the correct answer as a string
- [ ] No question has `answerIndex = null` or `answerIndex = undefined`
- [ ] No question has duplicate option strings within its own options array
- [ ] Every question has at least 2 options (4 expected; flag if fewer)
- [ ] Question text (`question` field) is a non-empty string
- [ ] Write a Jest test that iterates the entire question pool and asserts all of the above

### 3.5 Math Question Generator

- [ ] Generated question string is a valid arithmetic expression (e.g., "What is 7 + 8?")
- [ ] The answer in `options[answerIndex]` equals the actual computed result of the expression
- [ ] Addition: `a + b` result matches `a + b` (test 20+ generated questions)
- [ ] Subtraction: `a - b` result is never negative if spec says non-negative (confirm spec intent)
- [ ] Multiplication: `a * b` result is correct
- [ ] Division (if present): result is an integer (no floating-point answers exposed to user)
- [ ] Wrong options are plausibly close to the correct answer (not obviously wrong like 999 for 7+8)
- [ ] Wrong options are distinct from each other and from the correct answer
- [ ] Generator does not produce the same question twice in one quiz session
- [ ] Generator handles edge cases: operands of 0, operands of 1, large numbers within displayed range

### 3.6 Deep Link Parser

- [ ] `parseDeepLink('brainfuel://block?app=instagram')` returns `{ screen: 'quiz', app: 'instagram' }`
- [ ] `parseDeepLink('brainfuel://block?app=tiktok')` returns `{ screen: 'quiz', app: 'tiktok' }`
- [ ] `parseDeepLink('brainfuel://quiz')` (no app param) returns a documented structure or error (not crash)
- [ ] `parseDeepLink('brainfuel://')` (empty path) handles gracefully
- [ ] `parseDeepLink('')` (empty string) does not throw unhandled exception
- [ ] `parseDeepLink(null)` does not throw unhandled exception
- [ ] App name from deep link is normalized (e.g., lowercased) before use
- [ ] Unknown app names from deep link do not crash the quiz screen (fallback label shown)
- [ ] Deep link with extra unknown params does not crash (params are ignored or passed through safely)

### 3.7 15-Minute Unlock Window Tracker

- [ ] `startUnlockWindow('instagram')` records a timestamp for the given app
- [ ] `isUnlocked('instagram')` returns `true` immediately after `startUnlockWindow('instagram')`
- [ ] `isUnlocked('instagram')` returns `false` if window has not been started
- [ ] `isUnlocked('instagram')` returns `false` after 15 minutes have elapsed (mock `Date.now`)
- [ ] `isUnlocked('instagram')` returns `true` at exactly 14:59 minutes elapsed
- [ ] `isUnlocked('instagram')` returns `false` at exactly 15:00 minutes elapsed
- [ ] `isUnlocked('tiktok')` returns `false` even if `instagram` is currently unlocked (per-app tracking)
- [ ] `clearUnlockWindow('instagram')` causes `isUnlocked('instagram')` to return `false`
- [ ] Unlock window data persists across app backgrounding (stored in AsyncStorage, not just memory)
- [ ] Multiple apps can be unlocked simultaneously (each has its own timer)

### 3.8 Storage / AsyncStorage Stubs

- [ ] `saveSettings(settings)` does not throw
- [ ] `loadSettings()` returns the value previously saved by `saveSettings`
- [ ] `loadSettings()` returns a sensible default object when no settings are stored yet
- [ ] `saveSettings` and `loadSettings` use the correct AsyncStorage key (no key collision with other data)
- [ ] `saveBlockedApps(apps)` / `loadBlockedApps()` round-trips correctly
- [ ] `saveUnlockWindows(windows)` / `loadUnlockWindows()` round-trips correctly
- [ ] Corrupt/unparseable stored JSON is caught; `loadSettings` returns defaults instead of crashing
- [ ] Stubs export the same function signatures as the planned real implementation (no shape drift)

### 3.9 Subscription / StoreKit Stubs

- [ ] `getSubscriptionStatus()` stub returns a defined shape: `{ isSubscribed: boolean, trialActive: boolean, trialEndsAt: Date | null }`
- [ ] `startFreeTrial()` stub does not throw and returns a documented response
- [ ] `purchaseSubscription()` stub does not throw and returns a documented response
- [ ] `restorePurchases()` stub does not throw
- [ ] Stub functions are clearly marked (e.g., `// STUB: replace with StoreKit`) so they are not shipped
- [ ] Premium-gated features in the UI read from `getSubscriptionStatus()`; no hardcoded `true` bypasses

### 3.10 Firestore Service Layer Stubs

- [ ] `getUserProfile(userId)` stub returns a documented user shape without throwing
- [ ] `updateUserSettings(userId, settings)` stub does not throw
- [ ] `logQuizResult(userId, result)` stub does not throw
- [ ] All Firestore stub functions are typed with TypeScript interfaces matching the planned schema
- [ ] Firestore service module exports are named exports (not default) so tree-shaking works
- [ ] No Firestore SDK calls are made at import time (lazy initialization only)

---

## 4. Integration Tests

### 4.1 Module Exports & Import Paths

- [ ] Every import in a frontend screen file resolves to an existing backend/service file (no `Cannot find module` errors at runtime or `tsc`)
- [ ] `getQuiz` is importable from the path used in the Quiz Screen component
- [ ] `parseDeepLink` / `isUnlocked` / `startUnlockWindow` are importable from the path used in the deep-link handler
- [ ] Settings service functions are importable from the path used in Settings screens
- [ ] Subscription stub functions are importable from the path used in Paywall/Home screens
- [ ] No circular imports between frontend screens and backend services (check with `madge --circular`)
- [ ] TypeScript generic types / interfaces defined in backend are importable in frontend without re-declaration

### 4.2 Deep-Link Interruption Routing

**Manual test (device or simulator):**
1. [ ] With app closed, open Safari and navigate to `brainfuel://block?app=instagram`. Expo Go should launch Brainfuel and land on Quiz Screen
2. [ ] With app in background, trigger same URL; app should foreground and navigate to Quiz Screen
3. [ ] With app in foreground on Home screen, trigger deep link; should navigate to Quiz Screen without restarting
4. [ ] Quiz Screen receives `app=instagram` and displays the correct app label
5. [ ] Triggering the deep link a second time while quiz is in progress: either queues it or shows the active quiz (does not silently drop or crash)
6. [ ] A Shortcuts automation (if set up on device) correctly fires the deep link when the target app is opened

### 4.3 Correct Quiz -> Unlock Flow

1. [ ] Complete a quiz with all correct answers
2. [ ] Success screen appears with a congratulatory message
3. [ ] A 15-minute unlock window is recorded for the target app
4. [ ] `isUnlocked('instagram')` returns `true` in the service layer immediately after
5. [ ] A deep-link back to the target app is triggered (or instructions to proceed are shown)
6. [ ] Re-triggering the deep link within 15 minutes bypasses the quiz and goes directly to the app
7. [ ] The UI shows remaining unlock time (countdown or "unlocked until HH:MM")

### 4.4 Wrong Answer -> Access Denied Flow

1. [ ] Answer at least one question incorrectly
2. [ ] Failure screen appears with an access-denied message
3. [ ] No unlock window is started (`isUnlocked` returns `false`)
4. [ ] User is NOT redirected to the target app
5. [ ] "Try Again" on failure screen re-triggers the quiz (new question set, re-shuffled)
6. [ ] Repeated failures do not accumulate unlock windows (idempotent)
7. [ ] Failure screen does not show a back-swipe path that bypasses the block

### 4.5 Timer Expiry -> Re-prompt Flow

1. [ ] After a successful unlock, mock the clock forward 16 minutes
2. [ ] Trigger the deep link again
3. [ ] Quiz Screen appears (not bypassed)
4. [ ] A new quiz is presented (not the previous quiz replay)

---

## 5. Bug-Hunting Checklist

### Crash / Fatal Errors
- [ ] App does not crash when AsyncStorage is empty on first launch
- [ ] App does not crash if Firestore stub throws (error boundary present)
- [ ] App does not crash on rapid navigation (fast tapping between screens)
- [ ] App does not crash if deep link arrives before the navigator is mounted
- [ ] App does not crash on device rotation (if rotation is not locked)
- [ ] App does not crash if question pool for a category is empty (defensive check)

### Logic Bugs
- [ ] `answerIndex` is never off-by-one after shuffling options
- [ ] Count=1 quiz does not show a "2 of 1" progress indicator
- [ ] Partial credit is not accidentally given (any wrong answer = fail, not majority-correct)
- [ ] Unlock timer does not reset when app is backgrounded and foregrounded
- [ ] Unlock timer correctly uses wall-clock time (not CPU time); survives phone lock/sleep

### UI Bugs
- [ ] Keyboard does not obscure input fields on the Settings screen (if any text inputs exist)
- [ ] Long app names do not overflow or truncate oddly in the blocked-apps list
- [ ] Long question text does not push answer buttons off-screen
- [ ] Answer option text does not wrap in a way that makes options hard to distinguish
- [ ] Pressing "Try Again" immediately after a failure does not show the previous quiz's result momentarily

### State / Memory Bugs
- [ ] Re-entering settings does not double-register event listeners
- [ ] Deep-link event listener is cleaned up on component unmount (no zombie listeners)
- [ ] `setTimeout` / `setInterval` for the unlock timer is cleared when the component unmounts
- [ ] Quiz state is fully reset between quiz sessions (no leftover selected answers)

---

## 6. Edge Cases

| Scenario | Expected Behavior | How to Test |
|----------|-------------------|-------------|
| Count = 1 (single question quiz) | Exactly 1 question, result shown immediately after answering | Set count to 1 in settings, trigger quiz |
| All 5 questions wrong | Failure screen, no unlock, no partial access | Answer every option wrong in a 5-question quiz |
| Unknown app in deep link (e.g., `app=unknownapp`) | Graceful fallback label ("a distracting app"), quiz proceeds | Trigger `brainfuel://block?app=unknownapp` |
| No app param in deep link (`brainfuel://quiz`) | Fallback label shown, quiz proceeds or error shown | Trigger `brainfuel://quiz` |
| Random category selected, count = 1 | Single question returned, category is any valid one | Repeat 20x; verify no crash, valid category |
| User blocks 0 apps | Settings saved, no Shortcuts needed, no interruptions | Toggle all apps off in settings |
| User blocks all available apps | All listed apps have active automations possible | Toggle all apps on |
| Quiz triggered while previous unlock is still active | Quiz re-shown (timer should have expired) OR bypass shown if still in window | Trigger quiz twice within 15 min |
| Very fast answer selection (tap spam) | Only one answer registered per question | Rapidly tap multiple answers |
| App backgrounded mid-quiz | Quiz state preserved when app returns to foreground | Background app, wait, foreground |
| Subscription stub returns `isSubscribed: false` | Paywall shown or feature gated as documented | Set stub to return false |
| Subscription stub returns `isSubscribed: true` | Full access, no paywall | Set stub to return true |
| Device has no internet (Firestore stub) | Stub returns local data; no crash | Disable Wi-Fi and launch app |
| Math generator with operand 0 | Valid question and answer (e.g., "5 + 0 = 5") | Inspect generator output for 0-operand cases |

---

## 7. Test Execution Notes & How to Test Each Area

### Unit Tests (Jest)
- Location: `tests/` or co-located `__tests__/` directories
- Run: `npx jest` (or `yarn jest`)
- Coverage target: 80% line coverage on service/utility files
- Key files to cover: `getQuiz`, math generator, `parseDeepLink`, unlock window tracker, storage stubs

```bash
npx jest --coverage
```

### TypeScript Type Check
```bash
npx tsc --noEmit
```
- Must pass with 0 errors before any PR merge

### Manual Device / Simulator Testing

**Deep link testing (simulator):**
```bash
npx uri-scheme open "brainfuel://block?app=instagram" --ios
```

**Deep link testing (physical device via Safari):**
- Navigate to `brainfuel://block?app=instagram` in Safari address bar

**Shortcuts automation (physical device only):**
1. Open Shortcuts app
2. Create Personal Automation: "When I open Instagram"
3. Action: "Open URL" -> `brainfuel://block?app=instagram`
4. Verify Brainfuel launches and quiz appears

### Visual Regression
- Take screenshots on iPhone SE (375pt), iPhone 15 (390pt), iPhone 15 Plus (430pt)
- Compare against design mockups for layout consistency

### State Persistence
- Kill and relaunch app after changing settings
- Verify settings are preserved

### Timer Mocking (Unit Tests)
- Use `jest.useFakeTimers()` to test unlock window expiry
- Advance time with `jest.advanceTimersByTime(15 * 60 * 1000)`

### Import Path Validation
```bash
npx madge --circular src/
```
- Zero circular dependencies required

---

## Sign-Off Criteria

The build is ready for internal beta when ALL of the following pass:

- [ ] `tsc --noEmit`: 0 errors
- [ ] `npx jest`: all unit tests pass, 80%+ coverage on services
- [ ] App loads in Expo Go on physical iOS device without crashing
- [ ] Full quiz flow (correct answers) completes and shows success screen
- [ ] Full quiz flow (wrong answer) shows failure screen with no bypass
- [ ] Deep link routing lands on Quiz Screen with correct app label
- [ ] Settings (app list, category, count) persist across app restarts
- [ ] All buttons show pressed state; no dead buttons
- [ ] No layout overflow on iPhone SE (smallest supported screen)
- [ ] Subscription and Firestore stubs are clearly marked and do not ship hardcoded `true` bypasses
