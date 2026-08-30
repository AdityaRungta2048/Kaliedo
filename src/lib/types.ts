export type Topic = string

export type ArtMotif = 'facets' | 'strata' | 'orbit' | 'weave' | 'dunes' | 'aperture'
export type ArtPalette = 'ember' | 'moss' | 'amber' | 'iris' | 'ink'
export type ArtRatio = '4:3' | '16:9' | '1:1' | '3:4'

/** A deterministic, code-drawn cover image. No network, never a broken <img>. */
export type Art = {
  seed: number
  motif: ArtMotif
  palette: ArtPalette
  ratio: ArtRatio
  caption?: string
}

export type User = {
  id: string
  handle: string
  name: string
  bio: string
  pronouns?: string
  location?: string
  verified?: boolean
  interests: Topic[]
  followers: number
  following: number
  avatar: { seed: number; palette: ArtPalette }
  joined: string
}

export type Comment = {
  id: string
  authorId: string
  text: string
  minutesAgo: number
  likes: number
}

export type PostKind = 'essay' | 'note' | 'field-note'

export type Post = {
  id: string
  /** Always the real author. Hidden from the interface while `anonymous` is set. */
  authorId: string
  kind: PostKind
  title: string
  /** Paragraphs. The block shows the opening; the reader shows all of it. */
  body: string[]
  topics: Topic[]
  /** Rendered after the writing, always. */
  art?: Art
  photo?: string
  minutesAgo: number
  likes: number
  reposts: number
  comments: Comment[]
  /** Extra retrieval terms for the mock semantic search. */
  concepts?: string[]
  /** Published without a name. One-way: a signed post can never become anonymous. */
  anonymous?: boolean
  /** Set when the author claimed an anonymous post. Claiming is permanent. */
  revealedAt?: number
}

/**
 * A second, single-subject identity. One per account, locked to one niche —
 * the point is the constraint, so changing it is deliberately expensive.
 */
export type AlterEgo = {
  handle: string
  name: string
  niche: Topic
  createdAt: number
  /** null until the first change, which is free. Every later change waits out the cooldown. */
  nicheChangedAt: number | null
  avatarSeed: number
}

export type Identity = 'main' | 'alter'

export type Relevance = 'familiar' | 'related' | 'explore'

export type FeedMode = 'for-you' | 'following' | 'explore' | 'nearby'

export type Mix = { familiar: number; related: number; explore: number }

export type Message = {
  id: string
  from: 'me' | 'them'
  text?: string
  art?: Art
  minutesAgo: number
  reactions: string[]
  replyToId?: string
  read: boolean
}

export type Conversation = {
  id: string
  userId: string
  messages: Message[]
  typing?: boolean
}

export type NotificationKind = 'like' | 'comment' | 'follow' | 'mention' | 'trending'

export type AppNotification = {
  id: string
  kind: NotificationKind
  actorId?: string
  postId?: string
  text: string
  minutesAgo: number
  unread: boolean
}

export type ThemeChoice = 'light' | 'dark' | 'system'
