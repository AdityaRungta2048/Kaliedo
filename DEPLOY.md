# Deploying Kaleida

Both apps deploy from **GitHub Actions**, so the only thing you ever paste is a secret
into GitHub's own settings page. Never share a token in chat or commit one to the repo.

Everything below is one-time setup. After it, every push deploys.

---

## Get the app onto your Android phone

This is the one that matters most: it produces a real `.apk` you install once and then
open from your home screen, with no computer involved.

### 1. Create an Expo account

Sign up at [expo.dev](https://expo.dev). Free.

### 2. Create an access token

[expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) → **Create
token**. Copy it — it is shown once.

### 3. Create the project

On [expo.dev](https://expo.dev) → **Create a project**, name it `kaleida`. Copy two things
from the project page:

- the **Project ID** (a UUID)
- your **account name** (the owner slug, e.g. `adityarungta`)

### 4. Add three secrets to GitHub

Repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|---|---|
| `EXPO_TOKEN` | the access token from step 2 |
| `EAS_PROJECT_ID` | the project UUID from step 3 |
| `EXPO_OWNER` | your Expo account name from step 3 |

### 5. Build it

Repository → **Actions → Build Android app → Run workflow**, leave the profile on
`preview`, and run it. It takes roughly 10–20 minutes on EAS's free queue.

When it finishes, open the run and the **summary** contains a download link. Open that
link on your phone, download the `.apk`, and install it. Android will ask you to allow
installing from your browser — that is expected for an app outside the Play Store.

### 6. Updating it later

Once the app is installed, the **Publish mobile update** workflow runs automatically on
every push that touches `mobile/` or `src/lib/`. Your phone picks up the new JavaScript
the next time you open the app. No rebuild, no reinstall.

Rebuild the `.apk` only when native dependencies change.

### Just want to try it right now?

If you have Node installed, skip all of the above:

```bash
cd mobile
npm install
npx expo start --tunnel
```

Install **Expo Go** from the Play Store and scan the QR code. This runs off your computer,
so it stops working when you close the terminal — good for a look, not for daily use.

---

## Get the web app online

### Fastest path — no tokens at all

Go to [vercel.com/new](https://vercel.com/new), import `AdityaRungta2048/Kaliedo`, and
accept the detected settings:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

Vercel then redeploys on every push by itself. `vercel.json` already routes all paths to
`index.html` for the client-side router. **For most people this is the right choice** —
the GitHub Actions workflow below only adds value if you want the deploy gated behind CI.

### Via GitHub Actions instead

If you would rather deploy from CI, add three secrets:

| Name | Where to find it |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel project → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General |

The **Deploy web to Vercel** workflow then runs on every push and prints the live URL in
the run summary. The project must already exist on Vercel — create it once with the import
above, or with `vercel link` locally.

---

## What the workflows do

| Workflow | Trigger | Result |
|---|---|---|
| `deploy-web.yml` | push (non-mobile changes) | typecheck, build, deploy to Vercel production |
| `build-android.yml` | manual | an installable `.apk` on EAS |
| `publish-update.yml` | push touching `mobile/` or `src/lib/` | OTA update to installed apps |

All three typecheck before shipping, and the mobile ones re-sync the shared data layer
from `src/lib` first, so the phone can never drift from the web app.
