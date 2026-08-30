# Kaleida — mobile

The native Kaleida app: Expo + React Native + TypeScript, sharing its data layer and
recommendation logic with the web app in the repository root.

Same product, rebuilt for touch. Posts are compact blocks; tapping one measures its
position on screen and grows *that rectangle* into a full-screen reader, then shrinks it
back when you drag down. Any image the writer attached comes after the writing.

---

## Run it on your phone

```bash
cd mobile
npm install
npx expo start
```

Install **Expo Go** from the Play Store, open it, and scan the QR code in your terminal.
Your phone and computer must be on the same Wi-Fi. If they aren't (or your network blocks
device-to-device traffic), use a tunnel instead:

```bash
npx expo start --tunnel
```

`npm start` runs the shared-code sync first, so prefer it over `npx expo start` after
pulling changes.

## Put it on Expo so it opens without a dev server

```bash
npm install -g eas-cli
eas login
eas init                       # links this app to your Expo account
eas update --branch preview --message "Kaleida prototype"
```

That publishes the JS bundle to Expo's servers. Anyone with the link can open it in Expo
Go — no terminal, no cable. Re-run `eas update` to push a new version.

## Build a real APK you can install

```bash
eas build --profile preview --platform android
```

`preview` is configured in `eas.json` to produce an installable `.apk`. EAS builds it in
the cloud and gives you a download link. Use `--profile production` for an `.aab` to
upload to the Play Store.

---

## Structure

```
mobile/
  app/                     expo-router file-based routes
    _layout.tsx            providers, fonts, onboarding gate
    onboarding.tsx
    (tabs)/                Home · Discover · Write · Activity · You
    messages/              conversation list + thread
    u/[handle].tsx         any writer's profile
    topic/[name].tsx       topic page
    settings.tsx
  src/
    components/            UI kit, post block, reader, sheets, artwork
    store/                 app state (AsyncStorage) + reader state
    theme/                 palette tokens and the theme provider
    lib/shared/            GENERATED — copied from ../../src/lib
  scripts/sync-shared.mjs  the copier
  assets/                  icon, adaptive icon, splash
```

### Shared code

`src/lib/shared/` is **generated**. The mock data, topic graph, recommendation composer and
semantic search live in the web app at `../src/lib` and are copied here so both apps run
byte-identical logic. Edit the originals, then:

```bash
npm run sync
```

`npm start`, `npm run android` and `npm run typecheck` all run the sync first.

### Artwork

Every cover image and avatar is drawn with `react-native-svg` from a seeded generator
(`src/components/Art.tsx`) — the same six motifs and five palettes as the web app. Nothing
is downloaded, so no image can fail to load. Real photos work too: the Write flow reads
them with `expo-image-picker` and renders them as an ordinary `<Image>`.

### Fonts

Fraunces, Newsreader and Inter are bundled locally via `@expo-google-fonts`, imported by
subpath so only the five faces the app uses end up in the bundle.

### Native touches

Haptics on every meaningful tap (togglable in Settings), spring physics on press, drag-to-
dismiss on the reader and every sheet, pull-to-refresh on the feed, and a tab bar whose
icon lifts and indicator morphs on select.

## State

Everything you do is stored on the device with AsyncStorage under `kaleida.state.v1`.
**Settings → Reset prototype** clears it.
