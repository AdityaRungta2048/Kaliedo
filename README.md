# Kaleido

A social platform for people who write.

Posts arrive as **small blocks** — a name, a title, and the first two lines. Tap one and the
same card expands in place into the full piece. If the writer attached an image, it appears
**after** the writing, where they left it.

Underneath is Kaleido's idea: instead of hashtags and follower counts, the feed is composed
from a mix you can see and change — **60% familiar / 25% related / 15% new**, drawn roughly
**70/30** from people you follow versus writers you have not met.

This repository is the **visual and interactive prototype**. There is no backend, no auth, no
real recommendation model — every screen runs on local mock data.

It ships as two apps that share one brain:

| | | |
|---|---|---|
| **Web** | repository root | React + Vite, deploys to Vercel |
| **Mobile** | [`mobile/`](./mobile) | Expo + React Native, runs in Expo Go on Android and iOS |

Both import the same mock data, topic graph, feed composer and semantic search from
`src/lib` — see [mobile/README.md](./mobile/README.md) for how that is shared and how to
run the app on a phone.

---

## Running the web app

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build
```

Requires Node 18+.

## Deploying

See **[DEPLOY.md](./DEPLOY.md)** — how to get the web app on Vercel and a real `.apk` onto
an Android phone. Both run from your own machine: Expo builds the app in its cloud, and
Vercel deploys the site, with no CI in between.

---

## Where things live

```
mobile/           the native app (see mobile/README.md)
src/
  lib/
    posts.ts        32 written posts — the seed library
    users.ts        13 writers, including you
    social.ts       conversations and notifications
    topics.ts       the adjacency graph + the search lexicon
    recommend.ts    the feed composer (mix sampling, relevance labelling)
    search.ts       mock semantic search
    types.ts        domain types
    utils.ts        formatting, seeded PRNG
  store/
    AppContext.tsx  all mutable state, persisted to localStorage
    ViewerContext.tsx  the one post reader shared by every screen
  components/
    brand/          logo mark + the generated artwork system
    layout/         app shell, sidebar, bottom nav, top bar, demo mode
    ui/             buttons, avatars, chips, sheets, sliders, toasts, skeletons
    post/           the block, the expanding reader, likes/saves/comments/share
    feed/           block grid, feed switcher, mix controls
    profile/        follow button
  screens/          Onboarding, Home, Discover, Create, Activity, Messages, Profile, Settings
```

### Mock data

All of it is in `src/lib/`. To change what the prototype contains, edit `posts.ts` and
`users.ts` — nothing else needs to know.

### Artwork

Every image in the prototype is **drawn in code** (`components/brand/CoverArt.tsx`): six
motifs, five palettes, seeded so a given post always looks the same. Nothing is fetched, so
no image can ever fail to load. Uploading a real photo in the Create flow works too — it is
read with `FileReader` and rendered as a normal `<img>`.

---

## How the recommendation demo works

1. Each post is labelled **familiar / related / explore** relative to your interests, using the
   topic adjacency graph in `topics.ts`.
2. `buildFeed()` weaves a feed matching your mix percentages, then rebalances it toward the
   following/discovery split.
3. Dragging any slider re-runs the whole thing and the grid animates into its new order.

Search works the same way: `expandQuery()` maps natural language onto topic intents through a
lexicon and one hop of the adjacency graph, so *"best places to travel in winter"* finds a
field note from Iceland that contains none of those words.

## Demo mode

Press <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>, or use the sidebar button. Every dial that shapes the
experience — mix, feed mode, interests, theme — in one panel, live.

---

## Accessibility

Semantic landmarks and roles, labelled controls, visible focus rings, keyboard-navigable
throughout, and a full `prefers-reduced-motion` path that cuts animation to near zero.

## State

Everything you do is kept in `localStorage` under `kaleido.state.v1`. **Settings → Reset
prototype** clears it.
