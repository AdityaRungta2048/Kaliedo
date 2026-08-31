import type { AlterEgo, ArtPalette, Post, Topic, User } from './types'
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
 * Anonymous personas are named, not numbered — a handle readers can recognise
 * across posts is what lets an anonymous writer build something worth revealing.
 * The trade-off is linkability: a persona that posts often on one subject can be
 * guessed at. The interface says so before anyone's first anonymous post.
 */
const PERSONA_WORDS = [
  'Inkwell', 'Lantern', 'Harbour', 'Meridian', 'Vellum', 'Aperture', 'Thistle',
  'Quarry', 'Ember', 'Lattice', 'Almanac', 'Beacon', 'Cinder', 'Driftwood',
  'Foxglove', 'Granite', 'Juniper', 'Kestrel', 'Marginalia', 'Nocturne',
  'Orchard', 'Palimpsest', 'Quill', 'Ravine', 'Sable', 'Tessera', 'Umber', 'Verso',
]

const PERSONA_PALETTES: ArtPalette[] = ['ink', 'iris', 'moss', 'ember', 'amber']

/** FNV-1a. Small, stable, and enough to scatter ids across the word list. */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/**
 * One persona per person, stable for as long as they stay anonymous.
 *
 * In a real product the mapping lives on the server and nothing else can compute
 * it. Here it is derived from the author id, which the prototype already ships to
 * the client — so this is the shape of the feature, not its privacy guarantee.
 */
export function anonPersona(realUserId: string): User {
  const h = hash(`kaleido:anon:${realUserId}`)
  const word = PERSONA_WORDS[h % PERSONA_WORDS.length]
  const number = 10 + ((h >>> 8) % 89)
  return {
    id: `anon_${(h >>> 0).toString(36)}`,
    handle: `${word.toLowerCase()}${number}`,
    name: `${word} ${number}`,
    bio: 'Writing without a name for now.',
    interests: [],
    followers: 0,
    following: 0,
    avatar: { seed: (h >>> 4) % 9973, palette: PERSONA_PALETTES[(h >>> 16) % PERSONA_PALETTES.length] },
    joined: '—',
  }
}

/** Who the interface should show as the author. Never leaks the real one. */
export function displayAuthor(post: Post): User {
  return post.anonymous ? anonPersona(post.authorId) : userById(post.authorId)
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
