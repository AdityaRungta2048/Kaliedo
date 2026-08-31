import type { AlterEgo, Post, Topic, User } from './types'
import { ANON_ID, ANON_USER, userById } from './users'

/** One month, in milliseconds. */
export const NICHE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000

export type NicheChangeState =
  | { allowed: true; free: boolean }
  | { allowed: false; availableAt: number; daysLeft: number }

/**
 * The first niche change after creating an alter ego is free — people need one
 * chance to correct a bad pick. Every change after that waits a month, so the
 * identity means something to the readers who follow it.
 */
export function nicheChangeState(ego: AlterEgo | null, now = Date.now()): NicheChangeState {
  if (!ego) return { allowed: true, free: true }
  if (ego.nicheChangedAt === null) return { allowed: true, free: true }
  const availableAt = ego.nicheChangedAt + NICHE_COOLDOWN_MS
  if (now >= availableAt) return { allowed: true, free: false }
  return { allowed: false, availableAt, daysLeft: Math.max(1, Math.ceil((availableAt - now) / 86_400_000)) }
}

export function formatCooldown(state: NicheChangeState): string {
  if (state.allowed) return state.free ? 'One free change left' : 'You can change your niche now'
  const d = state.daysLeft
  return `${d} ${d === 1 ? 'day' : 'days'} until you can change it again`
}

/**
 * Every anonymous post wears the same face. Giving each author a stable handle
 * would have made revealing a single post unmask all their other anonymous work
 * retroactively — one identity for everyone is what keeps the reveal per-post.
 */

/** Who the interface should show as the author. Never leaks the real one. */
export function displayAuthor(post: Post): User {
  return post.anonymous ? ANON_USER : userById(post.authorId)
}

export function isAnonymous(post: Post): boolean {
  return post.anonymous === true
}

/** Only the real author may claim a post, and only while it is still anonymous. */
export function canReveal(post: Post, meId: string): boolean {
  return post.anonymous === true && post.authorId === meId
}

/**
 * A signed post can never be hidden after the fact — by then people have already
 * seen the name, so the promise would be false.
 */
export function canAnonymise(): false {
  return false
}

/** Past this, an anonymous post is doing well enough that claiming it is worth offering. */
export const REACH_THRESHOLD = 2000

export function hasBigReach(post: Post, extraLikes = 0): boolean {
  return post.likes + extraLikes + post.reposts * 2 >= REACH_THRESHOLD
}

export function suggestAlterEgoHandle(niche: Topic): string {
  return `${niche.toLowerCase().replace(/[^a-z0-9]/g, '')}.anon`
}

export { ANON_ID, ANON_USER }
