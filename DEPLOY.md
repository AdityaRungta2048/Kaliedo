# Deploying Kaleido

Everything below runs **from your own machine**. Expo builds the app in its cloud, so you
don't need Android Studio, a Mac, or a Play Store account — but you trigger it yourself
and watch it happen.

> **Node 22 or newer is required.** `eas-cli` depends on a package that refuses to install
> on Node 20. Check with `node -v`; if it's older, get 22 LTS from
> [nodejs.org](https://nodejs.org) first. This is the single most likely thing to trip you up.

---

## Put the app on your Android phone

### One-time setup

```bash
cd mobile
npm install
npx eas-cli login          # sign up free at expo.dev first
npx eas-cli init           # creates the Expo project and links this folder
```

`eas init` asks you to confirm the project name (`kaleido`) and then writes your project
ID into `app.json`. Commit that change — it's how updates find your app later.

### Build the APK

```bash
npx eas-cli build --platform android --profile preview
```

The `preview` profile in `eas.json` is set to produce an installable `.apk`.

On the first build EAS asks:

> *Generate a new Android Keystore?*

Say **yes**. It creates the signing key, stores it on your Expo account, and reuses it for
every future build. You never deal with it again.

The build then runs on Expo's servers — roughly **10–20 minutes** on the free tier. You can
close the terminal; progress is at [expo.dev](https://expo.dev) under your project's
**Builds** tab.

### Install it

When it finishes you get a URL and a QR code. Open either **on your phone**, download the
`.apk`, and tap it. Android will warn about installing outside the Play Store and ask you
to allow your browser to install apps — that's expected and you only grant it once.

Kaleido is now a real app on your home screen. No computer, no dev server, no Expo Go.

---

## Push updates without rebuilding

Once the app is installed, changing JavaScript doesn't need a new APK:

```bash
cd mobile
npm run sync                                    # pull the latest shared code from the web app
npx eas-cli update --branch preview -m "what changed"
```

Your phone picks it up the next time you open the app. Seconds, not twenty minutes.

Rebuild the APK **only** when native dependencies change — a new `expo-*` package, or an
Expo SDK upgrade. Editing screens, styling, mock data or the recommendation logic never
needs one.

---

## Just want a quick look first?

```bash
cd mobile
npm install
npx expo start --tunnel
```

Install **Expo Go** from the Play Store and scan the QR code. This runs off your computer,
so it stops when you close the terminal — good for a look, not for daily use. Skip it if
you're going to build the APK anyway.

---

## The web app deploys itself

The repository is connected to Vercel, so **every push to `main` builds and goes live
automatically**. There is nothing to run. Watch a deploy at
[vercel.com/dashboard](https://vercel.com/dashboard); it takes about a minute.

Vercel builds with the settings it detected — framework **Vite**, build `npm run build`,
output `dist` — and `vercel.json` routes every path to `index.html` so the client-side
router handles deep links and refreshes.

### Deploying by hand instead

Only needed if you want to ship something that is not committed, or to roll back:

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Troubleshooting

**`The engine "node" is incompatible` / eas-cli won't install** — you're on Node 20 or
older. Install Node 22.

**`eas: command not found`** — use `npx eas-cli <command>`, or install it globally with
`npm i -g eas-cli`.

**Build fails on `npm run sync`** — that script copies `src/lib` from the web app into
`mobile/src/lib/shared`. Run it from inside `mobile/`, with the full repo checked out.

**Update doesn't reach the phone** — updates only apply to a build made *after* the project
was linked, and only within the same `--branch`. Rebuild once if you linked the project
after your last APK.
