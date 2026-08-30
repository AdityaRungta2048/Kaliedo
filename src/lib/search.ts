import type { Post, Topic, User } from './types'
import { expandQuery, tokenize } from './topics'

export type SearchHit = { post: Post; score: number; reason: string }

/**
 * A mock semantic search: query terms are expanded into topic intents through the
 * lexicon and the adjacency graph, so "best places to travel in winter" finds a
 * post that never uses any of those words.
 */
export function searchPosts(query: string, posts: Post[]): SearchHit[] {
  const q = query.trim()
  if (!q) return []
  const { terms, topics } = expandQuery(q)
  const hits: SearchHit[] = []

  for (const post of posts) {
    let score = 0
    const reasons: string[] = []
    const haystack = `${post.title} ${post.body.join(' ')} ${(post.concepts ?? []).join(' ')}`.toLowerCase()

    for (const term of terms) {
      if (post.title.toLowerCase().includes(term)) { score += 3.2; reasons.push('title match') }
      else if ((post.concepts ?? []).some((c) => c.includes(term))) { score += 2.1; reasons.push('closely related') }
      else if (haystack.includes(term)) score += 1.1
    }

    let topicScore = 0
    const matched: Topic[] = []
    for (const [topic, weight] of topics) {
      if (post.topics.includes(topic)) { topicScore += weight * 2.4; matched.push(topic) }
    }
    score += topicScore

    if (score <= 1.1) continue
    const reason = matched.length
      ? `Semantically close to ${matched.slice(0, 2).join(' and ')}`
      : reasons[0]
        ? `Matched on ${reasons[0]}`
        : 'Related to your search'
    hits.push({ post, score, reason })
  }

  hits.sort((a, b) => b.score - a.score)
  // Keep only results that are close to the best match — a long tail of weak
  // hits reads as a broken search, not a generous one.
  const top = hits[0]?.score ?? 0
  return hits.filter((h) => h.score >= Math.max(1.4, top * 0.34))
}

export function searchUsers(query: string, users: User[]): User[] {
  const terms = tokenize(query)
  if (!terms.length) return []
  return users
    .map((u) => {
      const hay = `${u.name} ${u.handle} ${u.bio} ${u.interests.join(' ')}`.toLowerCase()
      const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0)
      return { u, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.u)
}

export function searchTopics(query: string, topics: Topic[]): Topic[] {
  const terms = tokenize(query)
  if (!terms.length) return []
  const { topics: intents } = expandQuery(query)
  const direct = topics.filter((t) => terms.some((term) => t.toLowerCase().includes(term)))
  const semantic = Array.from(intents.entries()).sort((a, b) => b[1] - a[1]).map(([t]) => t)
  return Array.from(new Set([...direct, ...semantic])).filter((t) => topics.includes(t)).slice(0, 8)
}
