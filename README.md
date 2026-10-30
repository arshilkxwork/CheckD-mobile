# Pingkin

Reminders for the people you care about that keep pinging until someone taps Done.

Expo SDK 57, React Navigation, everything stored on the device with AsyncStorage.
The Express/Postgres server in `checkd-backend/` isn't wired in yet. Until it is,
nudges for other people remind *you* to check in with them on this phone.

## Run it

```bash
npm install
npx expo start --go
```

Scan the QR code with Expo Go. Local notifications work in Expo Go, so the
whole reminder flow can be tried there. (`--go` is needed because
`expo-dev-client` is installed; without it the QR code targets a development
build made with `eas build --profile development`.) In the app, Me → Notifications →
Test ping sends one in 5 seconds.

## How reminders work

`src/services/reminders.ts` turns each nudge into scheduled local notifications:
one at the due time, then one every *reminder interval* until it's done (12 by
default, or the nudge's `maxReminders`). Follow-ups are held back during quiet
hours. The next three occurrences of a repeating nudge are queued too, so pings
still arrive if the app isn't opened for a few days.

iOS keeps at most 64 pending notifications per app, so the schedule is capped at
the 60 soonest pings and rebuilt from scratch whenever a nudge changes or the
app comes to the foreground.

The notification's **Done** and **Snooze** buttons open the app and update the
nudge, which cancels the remaining pings.

## Build for phones

One-time setup:

```bash
npm install -g eas-cli
eas login
eas init
```

`eas init` creates the project on expo.dev and writes its ID into `app.json`.

Installable test builds (Android APK, plus an ad hoc iOS build for registered devices):

```bash
eas build --profile preview --platform all
```

Store builds and submission:

```bash
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

iOS needs an Apple Developer account ($99/year), and Google Play needs a
developer account ($25 once). EAS asks for them and manages the signing keys.

Before the first store build, check these in `app.json`:

- `ios.bundleIdentifier` / `android.package` are set to
  `com.arshilkhan.pingkin`. They can't change after the first release.
- `name` / `slug` / `scheme`: the app name is "Pingkin".

On Android 12+, reminders fire at the exact minute only if the user allows
"Alarms & reminders" for the app in system settings. Otherwise Android may
deliver them a few minutes late while the phone is idle.
