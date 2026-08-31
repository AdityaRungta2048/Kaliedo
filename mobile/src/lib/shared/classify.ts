import { ADJACENT, LEXICON, tokenize } from './topics'
import type { Topic } from './types'

/**
 * Kaleido files a piece under topics by reading it. Writers never choose their
 * own tags, which is the point: on a platform where you pick your hashtags,
 * reach goes to whoever games the tags best rather than whoever writes best.
 * Taking the lever away puts everyone on the same footing.
 *
 * This is a lexicon-and-adjacency classifier standing in for a real embedding
 * model — deterministic, explainable, and good enough to demonstrate the idea.
 */

const TITLE_WEIGHT = 3
const NAME_WEIGHT = 2.5
const ADJACENCY_SPILL = 0.25
// One unambiguous term in the body is signal enough; ranking and the cap keep
// the result tidy rather than a strict threshold.
const MIN_SCORE = 0.9
const MAX_TOPICS = 4

/** A writing platform's safest default when a piece matches nothing else. */
const FALLBACK: Topic = 'Writing'

export function classifyTopics(title: string, body: string[] | string): Topic[] {
  const text = Array.isArray(body) ? body.join(' ') : body
  const scores = new Map<Topic, number>()
  const bump = (t: Topic, n: number) => scores.set(t, (scores.get(t) ?? 0) + n)

  const score = (source: string, weight: number) => {
    for (const token of tokenize(source)) {
      for (const topic of LEXICON[token] ?? []) bump(topic, weight)
      // A topic named outright counts for more than a word that merely implies it.
      for (const topic of Object.keys(ADJACENT)) {
        if (topic.toLowerCase() === token) bump(topic, weight * NAME_WEIGHT)
      }
    }
  }

  score(title, TITLE_WEIGHT)
  score(text, 1)

  // Let a strong signal lend a little weight to its neighbours, so a piece about
  // models also reads as programming without having to say the word.
  for (const [topic, value] of Array.from(scores)) {
    for (const near of ADJACENT[topic] ?? []) bump(near, value * ADJACENCY_SPILL)
  }

  const ranked = Array.from(scores.entries())
    .filter(([, v]) => v >= MIN_SCORE)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)

  if (ranked.length === 0) return [FALLBACK]
  return ranked.slice(0, MAX_TOPICS)
}
