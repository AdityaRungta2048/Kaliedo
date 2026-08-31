import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import type { AlterEgo, AppNotification, Comment, Conversation, ExploreTab, FeedMode, Identity, Message, Mix, Post, ThemeChoice, Topic } from '@/lib/types'
import { nicheChangeState, suggestAlterEgoHandle } from '@/lib/identity'
import { POSTS } from '@/lib/posts'
import { USERS, ME_ID, userById } from '@/lib/users'
import { CONVERSATIONS, NOTIFICATIONS } from '@/lib/social'

const STORAGE_KEY = 'kaleido.state.v1'

type Persisted = {
  onboarded: boolean
  theme: ThemeChoice
  interests: Topic[]
  following: string[]
  likes: string[]
  saves: string[]
  followedTopics: Topic[]
  mutedTopics: Topic[]
  mix: Mix
  socialFollowing: number
  privateAccount: boolean
  activityStatus: boolean
  sensitiveFilter: boolean
  messagePermission: 'everyone' | 'following' | 'nobody'
  displayName: string
  bio: string
  /** One per account, or none. */
  alterEgo: AlterEgo | null
  activeIdentity: Identity
}

const DEFAULTS: Persisted = {
  onboarded: false,
  theme: 'system',
  interests: ['Writing', 'AI', 'Photography'],
  following: ['u_alex', 'u_sarah', 'u_maya', 'u_ife', 'u_jonas', 'u_noor'],
  likes: [],
  saves: ['p6'],
  followedTopics: ['Writing', 'AI'],
  mutedTopics: [],
  mix: { familiar: 60, related: 25, explore: 15 },
  socialFollowing: 70,
  privateAccount: false,
  activityStatus: true,
  sensitiveFilter: true,
  messagePermission: 'following',
  displayName: 'You',
  bio: 'Writing in public, badly, on purpose. Notes on craft and attention.',
  alterEgo: null,
  activeIdentity: 'main',
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Persisted>) }
  } catch {
    return DEFAULTS
  }
}

type Toast = { id: number; text: string; icon?: 'check' | 'heart' | 'bookmark' | 'info' }

type State = Persisted & {
  posts: Post[]
  conversations: Conversation[]
  notifications: AppNotification[]
  feedMode: FeedMode
  exploreTab: ExploreTab
  feedSeed: number
}

type Action =
  | { type: 'patch'; patch: Partial<Persisted> }
  | { type: 'toggleFollow'; id: string }
  | { type: 'toggleLike'; id: string }
  | { type: 'toggleSave'; id: string }
  | { type: 'toggleTopic'; topic: Topic }
  | { type: 'toggleFollowTopic'; topic: Topic }
  | { type: 'toggleMuteTopic'; topic: Topic }
  | { type: 'setMode'; mode: FeedMode }
  | { type: 'setExploreTab'; tab: ExploreTab }
  | { type: 'refresh' }
  | { type: 'addPost'; post: Post }
  | { type: 'addComment'; postId: string; comment: Comment }
  | { type: 'sendMessage'; conversationId: string; message: Message }
  | { type: 'reactMessage'; conversationId: string; messageId: string; emoji: string }
  | { type: 'startConversation'; userId: string }
  | { type: 'readConversation'; conversationId: string }
  | { type: 'readNotifications' }
  | { type: 'createAlterEgo'; ego: AlterEgo }
  | { type: 'changeNiche'; niche: Topic }
  | { type: 'setIdentity'; identity: Identity }
  | { type: 'discardAlterEgo' }
  | { type: 'revealPost'; postId: string }
  | { type: 'reset' }

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'patch': return { ...state, ...action.patch }
    case 'toggleFollow': return { ...state, following: toggle(state.following, action.id) }
    case 'toggleLike': return { ...state, likes: toggle(state.likes, action.id) }
    case 'toggleSave': return { ...state, saves: toggle(state.saves, action.id) }
    case 'toggleTopic': return { ...state, interests: toggle(state.interests, action.topic) }
    case 'toggleFollowTopic': return { ...state, followedTopics: toggle(state.followedTopics, action.topic) }
    case 'toggleMuteTopic': return { ...state, mutedTopics: toggle(state.mutedTopics, action.topic) }
    case 'setMode': return { ...state, feedMode: action.mode }
    case 'setExploreTab': return { ...state, exploreTab: action.tab }
    case 'refresh': return { ...state, feedSeed: state.feedSeed + 1 }
    case 'addPost': return { ...state, posts: [action.post, ...state.posts] }
    case 'addComment':
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.postId ? { ...p, comments: [...p.comments, action.comment] } : p)),
      }
    case 'sendMessage':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, messages: [...c.messages, action.message] } : c,
        ),
      }
    case 'reactMessage':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id !== action.conversationId ? c : {
            ...c,
            messages: c.messages.map((m) =>
              m.id !== action.messageId ? m
                : { ...m, reactions: m.reactions.includes(action.emoji) ? m.reactions.filter((e) => e !== action.emoji) : [...m.reactions, action.emoji] },
            ),
          },
        ),
      }
    case 'startConversation': {
      if (state.conversations.some((c) => c.userId === action.userId)) return state
      return { ...state, conversations: [{ id: `cv_${action.userId}`, userId: action.userId, messages: [] }, ...state.conversations] }
    }
    case 'readConversation':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, messages: c.messages.map((m) => ({ ...m, read: true })) } : c,
        ),
      }
    case 'readNotifications':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, unread: false })) }
    case 'createAlterEgo':
      return { ...state, alterEgo: action.ego, activeIdentity: 'alter' }
    case 'changeNiche': {
      // The cooldown is enforced here, not only in the interface, so no button
      // or stale render can slip a change through early.
      if (!state.alterEgo) return state
      if (state.alterEgo.niche === action.niche) return state
      if (!nicheChangeState(state.alterEgo).allowed) return state
      // The identity is named after its subject, so both follow the niche.
      return {
        ...state,
        alterEgo: {
          ...state.alterEgo,
          niche: action.niche,
          name: `${action.niche} only`,
          handle: suggestAlterEgoHandle(action.niche),
          nicheChangedAt: Date.now(),
        },
      }
    }
    case 'setIdentity':
      return { ...state, activeIdentity: action.identity === 'alter' && !state.alterEgo ? 'main' : action.identity }
    case 'discardAlterEgo':
      return { ...state, alterEgo: null, activeIdentity: 'main' }
    case 'revealPost':
      // One direction only. Nothing in the app can set `anonymous` back to true.
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId && p.anonymous && p.authorId === ME_ID
            ? { ...p, anonymous: false, revealedAt: Date.now() }
            : p),
      }
    case 'reset':
      return { ...state, ...DEFAULTS, posts: POSTS, conversations: CONVERSATIONS, notifications: NOTIFICATIONS, feedSeed: 1 }
    default: return state
  }
}

type Ctx = {
  state: State
  dispatch: React.Dispatch<Action>
  me: ReturnType<typeof userById>
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: ThemeChoice) => void
  toasts: Toast[]
  toast: (text: string, icon?: Toast['icon']) => void
  reducedMotion: boolean
  demoOpen: boolean
  setDemoOpen: (v: boolean) => void
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...load(),
    posts: POSTS,
    conversations: CONVERSATIONS,
    notifications: NOTIFICATIONS,
    feedMode: 'for-you' as FeedMode,
    exploreTab: 'nearby' as ExploreTab,
    feedSeed: 1,
  }))

  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [toasts, setToasts] = useState<Toast[]>([])
  const [demoOpen, setDemoOpen] = useState(false)
  const toastId = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onRm = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    rm.addEventListener('change', onRm)
    return () => { mq.removeEventListener('change', onChange); rm.removeEventListener('change', onRm) }
  }, [])

  const resolvedTheme: 'light' | 'dark' =
    state.theme === 'system' ? (systemDark ? 'dark' : 'light') : state.theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('theming')
    root.classList.toggle('dark', resolvedTheme === 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', resolvedTheme === 'dark' ? '#181615' : '#FDFBF7')
    const t = window.setTimeout(() => root.classList.remove('theming'), 600)
    return () => window.clearTimeout(t)
  }, [resolvedTheme])

  // Persist only the user-owned slice; mock content is always rehydrated fresh.
  useEffect(() => {
    const { posts: _p, conversations: _c, notifications: _n, feedMode: _f, exploreTab: _e, feedSeed: _s, ...persisted } = state
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)) } catch { /* private mode */ }
  }, [state])

  const toast = useCallback((text: string, icon: Toast['icon'] = 'check') => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, text, icon }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400)
  }, [])

  const setTheme = useCallback((t: ThemeChoice) => dispatch({ type: 'patch', patch: { theme: t } }), [])

  const me = useMemo(() => {
    const base = userById(ME_ID)
    return { ...base, name: state.displayName, bio: state.bio, interests: state.interests, following: state.following.length }
  }, [state.displayName, state.bio, state.interests, state.following.length])

  const value = useMemo<Ctx>(
    () => ({ state, dispatch, me, resolvedTheme, setTheme, toasts, toast, reducedMotion, demoOpen, setDemoOpen }),
    [state, me, resolvedTheme, setTheme, toasts, toast, reducedMotion, demoOpen],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export { USERS, ME_ID, userById }
