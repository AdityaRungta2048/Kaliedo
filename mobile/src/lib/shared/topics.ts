import type { ArtPalette, Topic } from './types'

/** The interests offered at onboarding, in display order. */
export const ONBOARDING_TOPICS: Topic[] = [
  'Writing', 'AI', 'Technology', 'Startups', 'Photography', 'Travel',
  'Fitness', 'Music', 'Food', 'Gaming', 'Fashion', 'Design',
  'Books', 'Philosophy', 'Science', 'Nature', 'Film', 'Business',
]

/**
 * Kaleido's adjacency graph. This is what makes "related" mean something:
 * a topic is near another when readers of one tend to be curious about the other.
 */
export const ADJACENT: Record<Topic, Topic[]> = {
  Writing: ['Books', 'Philosophy', 'Design', 'Film', 'Craft'],
  Books: ['Writing', 'Philosophy', 'History', 'Film'],
  Philosophy: ['Books', 'Psychology', 'Science', 'Writing'],
  Psychology: ['Philosophy', 'Science', 'Health', 'Writing'],
  AI: ['Programming', 'Technology', 'Startups', 'Science', 'Research'],
  Programming: ['AI', 'Technology', 'Design', 'Craft'],
  Technology: ['AI', 'Programming', 'Startups', 'Design'],
  Startups: ['Business', 'Technology', 'AI', 'Design'],
  Business: ['Startups', 'Technology', 'Writing'],
  Design: ['Technology', 'Photography', 'Fashion', 'Craft', 'Writing'],
  Photography: ['Design', 'Travel', 'Nature', 'Film', 'Craft'],
  Film: ['Photography', 'Writing', 'Music', 'Books'],
  Travel: ['Photography', 'Food', 'Nature', 'Culture'],
  Nature: ['Travel', 'Photography', 'Science', 'Health'],
  Food: ['Travel', 'Craft', 'Health', 'Culture'],
  Fitness: ['Health', 'Nature', 'Psychology'],
  Health: ['Fitness', 'Food', 'Psychology', 'Science'],
  Music: ['Film', 'Writing', 'Craft', 'Culture'],
  Gaming: ['Technology', 'Design', 'Film', 'Programming'],
  Fashion: ['Design', 'Photography', 'Culture'],
  Science: ['AI', 'Nature', 'Philosophy', 'Research'],
  Research: ['Science', 'AI', 'Writing'],
  Culture: ['Music', 'Travel', 'Fashion', 'Books'],
  Craft: ['Writing', 'Design', 'Food', 'Music'],
  History: ['Books', 'Culture', 'Philosophy'],
  Lifestyle: ['Health', 'Food', 'Design'],
}

export const TOPIC_TINT: Record<string, ArtPalette> = {
  Writing: 'ember', Books: 'ember', Philosophy: 'iris', Psychology: 'iris',
  AI: 'iris', Programming: 'iris', Technology: 'iris', Research: 'iris',
  Startups: 'amber', Business: 'amber', Design: 'amber', Fashion: 'amber',
  Photography: 'moss', Travel: 'moss', Nature: 'moss', Food: 'moss',
  Fitness: 'moss', Health: 'moss', Film: 'ember', Music: 'ember',
  Gaming: 'iris', Science: 'moss', Culture: 'ember', Craft: 'amber',
  History: 'amber', Lifestyle: 'moss',
}

export function tintFor(topics: Topic[]): ArtPalette {
  for (const t of topics) if (TOPIC_TINT[t]) return TOPIC_TINT[t]
  return 'ink'
}

export function adjacentTo(topics: Topic[]): Set<Topic> {
  const out = new Set<Topic>()
  for (const t of topics) for (const a of ADJACENT[t] ?? []) if (!topics.includes(a)) out.add(a)
  return out
}

/**
 * Natural-language terms mapped onto Kaleido's topics. This is what lets a search
 * for "best places to travel in winter" surface posts that never use those words.
 */
export const LEXICON: Record<string, Topic[]> = {
  // Work, hiring and company life
  hiring: ['Startups', 'Business'], hire: ['Startups', 'Business'], interview: ['Business', 'Psychology'],
  interviews: ['Business', 'Psychology'], candidate: ['Business'], team: ['Business', 'Startups'],
  teams: ['Business', 'Startups'], colleague: ['Business'], career: ['Business'], job: ['Business'],
  raised: ['Startups', 'Business'], valuation: ['Startups', 'Business'], round: ['Startups'],
  investor: ['Startups', 'Business'], economics: ['Business'], moat: ['Startups', 'Business'],
  studio: ['Gaming', 'Design'], studios: ['Gaming', 'Design'], indie: ['Gaming', 'Culture'],
  greenlight: ['Gaming', 'Film'], playtesting: ['Gaming', 'Design'], player: ['Gaming'], players: ['Gaming'],

  // Type and making
  letter: ['Design', 'Craft'], letters: ['Design', 'Craft'], alphabet: ['Design'], lowercase: ['Design'],
  typeface: ['Design'], glyph: ['Design'], kerning: ['Design'], serif: ['Design'], tracking: ['Design'],
  drew: ['Design', 'Craft'], redrew: ['Design', 'Craft'], drawing: ['Design', 'Craft'],
  tailor: ['Fashion', 'Craft'], tailoring: ['Fashion', 'Craft'], sleeve: ['Fashion'], garment: ['Fashion'],
  fabric: ['Fashion', 'Craft'], sew: ['Craft', 'Fashion'], stitch: ['Craft', 'Fashion'], fit: ['Fashion'],
  showroom: ['Fashion', 'Business'], coat: ['Fashion'], coats: ['Fashion'],

  // Research and measurement
  benchmark: ['Research', 'AI'], benchmarks: ['Research', 'AI'], metric: ['Research', 'Science'],
  metrics: ['Research', 'Science'], score: ['Research'], retrieval: ['AI', 'Research'],
  evaluation: ['Research', 'AI'], optimise: ['Research', 'Programming'], optimize: ['Research', 'Programming'],
  system: ['Technology', 'Programming'], systems: ['Technology', 'Programming'],
  embeddings: ['AI', 'Programming'], dataset: ['AI', 'Science'],

  // Kitchens, service, bodies
  kitchen: ['Food', 'Craft'], restaurant: ['Food', 'Culture'], chef: ['Food', 'Craft'],
  dough: ['Food', 'Craft'], baking: ['Food', 'Craft'], salt: ['Food'], onions: ['Food'], pan: ['Food'],
  injury: ['Fitness', 'Health'], marathon: ['Fitness'], trail: ['Fitness', 'Nature'],
  travel: ['Travel'], trip: ['Travel'], places: ['Travel'], destination: ['Travel'],
  wander: ['Travel'], abroad: ['Travel'], city: ['Travel', 'Culture'], road: ['Travel'],
  winter: ['Travel', 'Nature'], snow: ['Nature', 'Travel'], cold: ['Nature'],
  mountain: ['Nature', 'Travel'], sea: ['Nature'], forest: ['Nature'], hike: ['Nature', 'Fitness'],
  ai: ['AI'], ml: ['AI'], 'machine': ['AI'], learning: ['AI'], model: ['AI'], models: ['AI'],
  llm: ['AI'], neural: ['AI'], agent: ['AI'], agents: ['AI'], gpt: ['AI'], prompt: ['AI'],
  beginner: ['Programming', 'AI'], project: ['Programming', 'Startups'], projects: ['Programming', 'Startups'],
  code: ['Programming'], coding: ['Programming'], programming: ['Programming'], software: ['Programming', 'Technology'],
  build: ['Programming', 'Startups'], engineer: ['Programming', 'Technology'], python: ['Programming'],
  startup: ['Startups'], startups: ['Startups'], founder: ['Startups', 'Business'], funding: ['Startups', 'Business'],
  company: ['Business'], product: ['Startups', 'Design'], business: ['Business'], revenue: ['Business'],
  write: ['Writing'], writing: ['Writing'], writer: ['Writing'], essay: ['Writing'], essays: ['Writing'],
  draft: ['Writing'], prose: ['Writing'], sentence: ['Writing'], words: ['Writing'], story: ['Writing', 'Film'],
  block: ['Writing', 'Psychology'], edit: ['Writing'], editing: ['Writing'], notebook: ['Writing', 'Craft'],
  book: ['Books'], books: ['Books'], reading: ['Books'], read: ['Books'], novel: ['Books'], library: ['Books'],
  photo: ['Photography'], photos: ['Photography'], photography: ['Photography'], camera: ['Photography'],
  light: ['Photography'], film: ['Film', 'Photography'], lens: ['Photography'], portrait: ['Photography'],
  design: ['Design'], typography: ['Design'], interface: ['Design', 'Technology'], ux: ['Design'],
  music: ['Music'], song: ['Music'], album: ['Music'], sound: ['Music'], listen: ['Music'],
  food: ['Food'], cook: ['Food'], cooking: ['Food'], recipe: ['Food'], bread: ['Food'],
  fitness: ['Fitness'], run: ['Fitness'], running: ['Fitness'], training: ['Fitness'], strength: ['Fitness'],
  sleep: ['Health'], health: ['Health'], habit: ['Health', 'Psychology'], habits: ['Health', 'Psychology'],
  focus: ['Psychology', 'Writing'], attention: ['Psychology'], mind: ['Psychology', 'Philosophy'],
  meaning: ['Philosophy'], philosophy: ['Philosophy'], think: ['Philosophy'], thinking: ['Philosophy'],
  game: ['Gaming'], games: ['Gaming'], gaming: ['Gaming'],
  fashion: ['Fashion'], style: ['Fashion', 'Design'], clothes: ['Fashion'], wardrobe: ['Fashion'],
  science: ['Science'], research: ['Research', 'Science'], paper: ['Research'], data: ['Science', 'AI'],
  craft: ['Craft'], making: ['Craft'], hands: ['Craft'], workshop: ['Craft'],
  morning: ['Lifestyle', 'Writing'], routine: ['Lifestyle', 'Health'], slow: ['Lifestyle'], quiet: ['Lifestyle'],
}

const STOP = new Set([
  'the','a','an','of','for','to','in','on','and','or','best','how','what','why','is','are',
  'my','i','me','with','at','it','that','this','you','your','do','does','can','some','good','about',
])

export function tokenize(q: string): string[] {
  return q.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w))
}

/** Expand a raw query into weighted topic intents — the mock "semantic" step. */
export function expandQuery(q: string): { terms: string[]; topics: Map<Topic, number> } {
  const terms = tokenize(q)
  const topics = new Map<Topic, number>()
  const bump = (t: Topic, w: number) => topics.set(t, (topics.get(t) ?? 0) + w)
  for (const term of terms) {
    const direct = LEXICON[term]
    if (direct) direct.forEach((t) => bump(t, 1))
    // Stem-ish fallback: "travelling" -> "travel"
    if (!direct) {
      for (const key of Object.keys(LEXICON)) {
        if (term.startsWith(key) && key.length >= 4) LEXICON[key].forEach((t) => bump(t, 0.7))
      }
    }
    const asTopic = Object.keys(ADJACENT).find((t) => t.toLowerCase() === term)
    if (asTopic) bump(asTopic, 1.4)
  }
  // Second hop: nearby topics get partial credit so results feel curious, not literal.
  for (const [t, w] of Array.from(topics)) {
    for (const a of ADJACENT[t] ?? []) bump(a, w * 0.28)
  }
  return { terms, topics }
}
