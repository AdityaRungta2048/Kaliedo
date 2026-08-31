import type { FeedMode, Mix, Post, Relevance, Topic } from './types'
import { ADJACENT } from './topics'

/** Where a post sits relative to what you already care about. */
export function relevanceOf(post: Post, interests: Topic[]): Relevance {
  if (post.topics.some((t) => interests.includes(t))) return 'familiar'
  const near = new Set<Topic>()
  interests.forEach((i) => (ADJACENT[i] ?? []).forEach((a) => near.add(a)))
  if (post.topics.some((t) => near.has(t))) return 'related'
  return 'explore'
}

export const RELEVANCE_COPY: Record<Relevance, { label: string; note: string }> = {
  familiar: { label: 'In your interests', note: 'Close to what you already read.' },
  related: { label: 'Next door', note: 'One step outside your usual reading.' },
  explore: { label: 'Something new', note: 'Chosen to widen the frame.' },
}

/** Deterministic shuffle so a feed is stable across renders but not sorted-looking. */
function seededOrder<T>(items: T[], seed: number): T[] {
  const arr = items.slice()
  let s = seed || 1
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export type FeedInput = {
  posts: Post[]
  interests: Topic[]
  following: Set<string>
  mode: FeedMode
  mix: Mix
  /** Share of the feed drawn from accounts you follow. */
  socialFollowing: number
  seed: number
  mutedTopics?: Set<Topic>
  /** When focused mode is on, nothing outside this topic reaches the feed. */
  focusNiche?: Topic | null
}

export type FeedItem = { post: Post; relevance: Relevance; fromFollowing: boolean }

/**
 * Kaleido's demo recommender. It is a sampler, not a model: it composes the feed
 * to the ratios you can see (and drag) in the UI, so the philosophy is legible.
 */
export function buildFeed(input: FeedInput): FeedItem[] {
  const { posts, interests, following, mode, mix, socialFollowing, seed, mutedTopics } = input

  const { focusNiche } = input

  let eligible = posts.filter((p) => !p.topics.some((t) => mutedTopics?.has(t)))

  // Focused mode is a hard filter, not a weighting — that is the whole promise.
  if (focusNiche) eligible = eligible.filter((p) => p.topics.includes(focusNiche))

  // Unsigned is a lens over the same engine, not a separate feed: anonymous posts
  // also appear in For you, so they compete for reach on the writing alone.
  if (mode === 'unsigned') eligible = eligible.filter((p) => p.anonymous === true)

  const tagged: FeedItem[] = eligible.map((p) => ({
    post: p,
    relevance: relevanceOf(p, interests),
    fromFollowing: following.has(p.authorId),
  }))

  if (focusNiche) {
    // Inside a niche there is no familiar/related/explore split to make; order
    // is all that is left to decide.
    return seededOrder(tagged, seed)
  }

  if (mode === 'following') {
    return seededOrder(tagged.filter((i) => i.fromFollowing), seed)
  }
  if (mode === 'explore') {
    const notFollowed = tagged.filter((i) => !i.fromFollowing)
    const rest = tagged.filter((i) => i.fromFollowing)
    return [...seededOrder(notFollowed, seed), ...seededOrder(rest, seed + 1)]
  }
  if (mode === 'nearby') {
    const near = tagged.filter((i) => i.relevance === 'related')
    const outer = tagged.filter((i) => i.relevance === 'explore')
    return [...seededOrder(near, seed), ...seededOrder(outer, seed + 2)]
  }

  // For You: interleave by the mix, honouring the following/discovery split.
  const buckets: Record<Relevance, FeedItem[]> = {
    familiar: seededOrder(tagged.filter((i) => i.relevance === 'familiar'), seed),
    related: seededOrder(tagged.filter((i) => i.relevance === 'related'), seed + 3),
    explore: seededOrder(tagged.filter((i) => i.relevance === 'explore'), seed + 5),
  }

  const total = tagged.length
  const wanted: Record<Relevance, number> = {
    familiar: Math.round((mix.familiar / 100) * total),
    related: Math.round((mix.related / 100) * total),
    explore: Math.round((mix.explore / 100) * total),
  }

  const out: FeedItem[] = []
  const order: Relevance[] = []
  // Build a repeating pattern that reflects the ratios, e.g. F F F R F F E ...
  const pattern = (['familiar', 'related', 'explore'] as Relevance[]).flatMap((r) =>
    Array.from({ length: Math.max(0, Math.round(mix[r] / 5)) }, () => r),
  )
  const woven = seededOrder(pattern, seed + 7)
  for (let i = 0; i < total * 2 && out.length < total; i++) {
    const r = woven[i % woven.length] ?? 'familiar'
    order.push(r)
    const bucket = buckets[r]
    if (bucket.length && wanted[r] > 0) {
      out.push(bucket.shift()!)
      wanted[r]--
    } else {
      const fallback = (['familiar', 'related', 'explore'] as Relevance[]).find((k) => buckets[k].length)
      if (!fallback) break
      out.push(buckets[fallback].shift()!)
    }
  }

  // Nudge the following/discovery balance without shuffling everything.
  const wantFollowed = Math.round((socialFollowing / 100) * out.length)
  const followed = out.filter((i) => i.fromFollowing)
  const discovered = out.filter((i) => !i.fromFollowing)
  const balanced: FeedItem[] = []
  let f = 0
  let d = 0
  for (let i = 0; i < out.length; i++) {
    const takeFollowed = f < wantFollowed && (d >= out.length - wantFollowed || (i * wantFollowed) % out.length < wantFollowed)
    if (takeFollowed && f < followed.length) balanced.push(followed[f++])
    else if (d < discovered.length) balanced.push(discovered[d++])
    else if (f < followed.length) balanced.push(followed[f++])
  }
  return balanced.length === out.length ? balanced : out
}

export function mixSummary(mix: Mix): string {
  return `${mix.familiar}% familiar · ${mix.related}% related · ${mix.explore}% new`
}

/** Keep the three sliders summing to 100 while the user drags one. */
export function rebalanceMix(mix: Mix, key: keyof Mix, value: number): Mix {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  const others = (Object.keys(mix) as (keyof Mix)[]).filter((k) => k !== key)
  const remaining = 100 - v
  const otherTotal = others.reduce((s, k) => s + mix[k], 0)
  const next = { ...mix, [key]: v } as Mix
  if (otherTotal === 0) {
    next[others[0]] = Math.round(remaining / 2)
    next[others[1]] = remaining - next[others[0]]
  } else {
    next[others[0]] = Math.round((mix[others[0]] / otherTotal) * remaining)
    next[others[1]] = remaining - next[others[0]]
  }
  return next
}
