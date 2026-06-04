# Real iOS Blocking: Setup & Testing Guide

This sets up genuine app blocking with Apple's Screen Time / Family Controls API
(a shield the user cannot swipe past), replacing the bypassable Shortcuts flow.

Your situation: **Windows (no Mac) + paid Apple Developer account.** That means
**EAS cloud builds**, and the **Family Controls entitlement approval from Apple
is the bottleneck** (days to weeks). Submit the requests in Phase 0 today, then do
everything else while you wait.

There is no same-day path to testing this from Windows. The wait is on Apple, not
on code.

---

## Development vs Distribution entitlement (read first)

There are two variants of the Family Controls entitlement:

- **Development** lets you test on your own device. Apple allows it WITHOUT the
  request form. The catch on your setup: EAS's automatic credentials do not add
  this entitlement, so you would have to hand-create a development provisioning
  profile that includes `com.apple.developer.family-controls` and feed it to EAS.
  Doable but fiddly without a Mac, and a known EAS pain point.
- **Distribution** is required for TestFlight / App Store, and in practice is the
  clean way to get EAS building. It needs the request form, takes about 3 weeks,
  and must be submitted once per bundle ID (4 total).

Recommendation: **submit the 4 distribution requests today** (you need them
anyway and they are the long pole). We can attempt the development path in
parallel if you want to try testing sooner.

## Phase 0: The bottleneck, step by step

### Step 1: Sign in and get your Team ID
1. Go to developer.apple.com/account and sign in.
2. On the Membership page, confirm the Apple Developer Program is active.
3. Copy the 10-character **Team ID**.
4. Paste it into `app.json`, replacing **both** `REPLACE_WITH_YOUR_APPLE_TEAM_ID`
   (one under `ios`, one under the `react-native-device-activity` plugin).

### Step 2: Create the App Group
1. Certificates, Identifiers & Profiles -> **Identifiers** -> the blue "+".
2. Choose **App Groups** -> Continue.
3. Description: `Brainfuel Group`. Identifier: `group.com.brainfuel.app`.
4. Continue -> Register.

### Step 3: Create the 4 App IDs
Do this four times, once for each bundle ID:

- `com.brainfuel.app`
- `com.brainfuel.app.ActivityMonitor`
- `com.brainfuel.app.ShieldAction`
- `com.brainfuel.app.ShieldConfiguration`

For each:
1. Identifiers -> "+" -> **App IDs** -> Continue -> type **App** -> Continue.
2. Description (e.g. "Brainfuel", "Brainfuel ActivityMonitor"). Bundle ID:
   **Explicit**, paste the exact id above.
3. In Capabilities, check **App Groups** (then Configure -> select
   `group.com.brainfuel.app`) and check **Family Controls**.
4. Register.

### Step 4: Submit the Family Controls request form (4 times)
Form: developer.apple.com/contact/request/family-controls-distribution (signed in).
Submit it **once per bundle ID** (same Apple ID, different bundle ID each time).

What it asks and what to put:
- Your name, email, and team (auto-filled).
- App name: `Brainfuel`.
- A website or GitHub URL describing the app. Provide a real one; vague or
  missing context is the main reason requests get rejected. A one-page site or a
  public GitHub README is enough.
- The bundle ID for this submission.
- How you use the entitlement. Suggested text:

  > Brainfuel is a focus and self-control app. Users select distracting apps with
  > FamilyActivityPicker. We shield those apps with ManagedSettings
  > (ApplicationShield) and show a custom ShieldConfiguration. To regain access,
  > the user opens Brainfuel and completes a short brain-training quiz; on success
  > we remove the shield for 15 minutes and use DeviceActivity to automatically
  > re-shield afterward. Extensions: DeviceActivityMonitor (scheduling),
  > ShieldConfiguration (custom lock screen), ShieldAction (button handling). App
  > selections stay private via opaque tokens.

Reuse the same description for all 4; only the bundle ID changes. Approval takes
about 3 weeks and varies; you get an email per request.

### Step 5: After approval
1. For each of the 4 App IDs, confirm **Family Controls** is enabled (it reflects
   the granted entitlement).
2. EAS builds will now sign successfully (see Phase 2).

---

## Phase 1: Set up EAS (do now, in parallel with the wait)

You can do all of this on Windows.

```bash
npm install -g eas-cli
eas login
eas build:configure          # generates iOS credentials
eas device:create            # register your iPhone for internal-distribution installs
```

`eas.json` is already in the repo with a `development` profile (dev client,
internal distribution).

---

## Phase 2: After Apple approves (build + test)

1. In the Apple portal, add the **Family Controls** capability (Development and
   Distribution) to each of the 4 App IDs.

2. Build the dev client (cloud build, no Mac needed):
   ```bash
   eas build --profile development --platform ios
   ```
   EAS runs prebuild, which generates the 3 native extensions from the
   `react-native-device-activity` plugin.

3. Install the build on your iPhone from the EAS link/QR.

4. Start the bundler and connect the dev build (this replaces the Expo Go flow):
   ```bash
   npx expo start --dev-client
   ```

5. In the app: **Blocked Apps -> Try real iOS blocking (beta)**, then:
   - Grant Screen Time permission.
   - Pick apps in the system picker.
   - Tap "Block selected apps".
   - Open a blocked app: you should see the Brainfuel shield.
   - Tap "Test a 15-minute unlock" to confirm the shield lifts and re-applies.

---

## Known gotchas

- **Expo Go no longer runs the blocking feature.** The native module is guarded,
  so the rest of the app (games, quiz, settings) still loads in Expo Go and the
  blocking screen shows a "needs a dev build" notice. Only the dev build can
  exercise real blocking.
- **EAS provisioning for Family Controls (Development)** sometimes needs a
  development (not ad-hoc) provisioning profile. If a build fails on the
  entitlement, set the iOS credentials to use a development profile.
  Reference: github.com/expo/eas-cli issues #2715 and #3185.
- Real blocking requires a **physical device** (iOS 15.1+). It does not work on
  the simulator.

---

## What still needs verifying on the first dev build

The native blocking calls live in `src/services/screenTimeBlocking.ts`. They
follow `react-native-device-activity`'s documented API but were written on
Windows and could not be run here. On the first dev build, confirm against the
installed library's TypeScript types (search the file for `VERIFY ON DEVICE`):

- The exact "clear shield" call in `unblockAllApps()`.
- The re-block scheduling in `unlockForMinutes()` (the `startMonitoring` schedule
  shape and the `configureActions` callback name).

The shield's button cannot launch the quiz directly; the quiz runs inside
Brainfuel, and on a pass the app calls `unlockForMinutes(15)` to lift the shield.
