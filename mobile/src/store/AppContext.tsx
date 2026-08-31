import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'
import type { AlterEgo, AppNotification, Comment, Conversation, ExploreTab, FeedMode, Identity, Message, Mix, Post, ThemeChoice, Topic } from '@/lib/shared/types'
import { nicheChangeState, suggestAlterEgoHandle } from '@/lib/shared/identity'
import { POSTS } from '@/lib/shared/posts'
import { CONVERSATIONS, NOTIFICATIONS } from '@/lib/shared/social'
import { USERS, userById } from '@/lib/shared/users'

const KEY = 'kaleido.state.v1'
export const ME_ID = 'u_me'

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
  hapticsEnabled: boolean
  messagePermission: 'everyone' | 'following' | 'nobody'
  displayName: string
  bio: string
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
  hapticsEnabled: true,
  messagePermission: 'following',
  displayName: 'You',
  bio: 'Writing in public, badly, on purpose. Notes on craft and attention.',
  alterEgo: null,
  activeIdentity: 'main',
}

type State = Persisted & {
  posts: Post[]
  conversations: Conversation[]
  notifications: AppNotification[]
  feedMode: FeedMode
  exploreTab: ExploreTab
  feedSeed: number
  hydrated: boolean
}

type Action =
  | { type: 'hydrate'; patch: Partial<Persisted> }
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

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate': return { ...state, ...action.patch, hydrated: true }
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
      return { ...state, posts: state.posts.map((p) => (p.id === action.postId ? { ...p, comments: [...p.comments, action.comment] } : p)) }
    case 'sendMessage':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, messages: [...c.messages, action.message] } : c),
      }
    case 'reactMessage':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id !== action.conversationId ? c : {
            ...c,
            messages: c.messages.map((m) =>
              m.id !== action.messageId ? m
                : { ...m, reactions: m.reactions.includes(action.emoji) ? m.reactions.filter((e) => e !== action.emoji) : [...m.reactions, action.emoji] }),
          }),
      }
    case 'startConversation':
      return state.conversations.some((c) => c.userId === action.userId)
        ? state
        : { ...state, conversations: [{ id: `cv_${action.userId}`, userId: action.userId, messages: [] }, ...state.conversations] }
    case 'readConversation':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, messages: c.messages.map((m) => ({ ...m, read: true })) } : c),
      }
    case 'readNotifications':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, unread: false })) }
    case 'createAlterEgo':
      return { ...state, alterEgo: action.ego, activeIdentity: 'alter' }
    case 'changeNiche': {
      // Cooldown enforced in the reducer, not only in the interface.
      if (!state.alterEgo) return state
      if (state.alterEgo.niche === action.niche) return state
      if (!nicheChangeState(state.alterEgo).allowed) return state
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
      // One direction only.
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId && p.anonymous && p.authorId === ME_ID
            ? { ...p, anonymous: false, revealedAt: Date.now() }
            : p),
      }
    case 'reset':
      return { ...state, ...DEFAULTS, onboarded: true, posts: POSTS, conversations: CONVERSATIONS, notifications: NOTIFICATIONS, feedSeed: 1 }
    default: return state
  }
}

type Toast = { id: number; text: string; icon?: 'check' | 'heart' | 'bookmark' | 'info' }

type Ctx = {
  state: State
  dispatch: React.Dispatch<Action>
  me: ReturnType<typeof userById>
  toasts: Toast[]
  toast: (text: string, icon?: Toast['icon']) => void
  tap: (kind?: 'light' | 'medium' | 'success') => void
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    ...DEFAULTS,
    posts: POSTS,
    conversations: CONVERSATIONS,
    notifications: NOTIFICATIONS,
    feedMode: 'for-you' as FeedMode,
    exploreTab: 'nearby' as ExploreTab,
    feedSeed: 1,
    hydrated: false,
  })
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  useEffect(() => {
    let alive = true
    AsyncStorage.getItem(KEY)
      .then((raw) => { if (alive) dispatch({ type: 'hydrate', patch: raw ? JSON.parse(raw) : {} }) })
      .catch(() => { if (alive) dispatch({ type: 'hydrate', patch: {} }) })
    return () => { alive = false }
  }, [])

  // Only the user-owned slice is persisted; mock content rehydrates fresh.
  useEffect(() => {
    if (!state.hydrated) return
    const { posts, conversations, notifications, feedMode, exploreTab, feedSeed, hydrated, ...persisted } = state
    void posts; void conversations; void notifications; void feedMode; void exploreTab; void feedSeed; void hydrated
    AsyncStorage.setItem(KEY, JSON.stringify(persisted)).catch(() => {})
  }, [state])

  const tap = useCallback((kind: 'light' | 'medium' | 'success' = 'light') => {
    if (!state.hapticsEnabled || Platform.OS === 'web') return
    if (kind === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    else void Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light)
  }, [state.hapticsEnabled])

  const toast = useCallback((text: string, icon: Toast['icon'] = 'check') => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, text, icon }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200)
  }, [])

  const me = useMemo(() => {
    const base = userById(ME_ID)
    return { ...base, name: state.displayName, bio: state.bio, interests: state.interests, following: state.following.length }
  }, [state.displayName, state.bio, state.interests, state.following.length])

  const value = useMemo<Ctx>(() => ({ state, dispatch, me, toasts, toast, tap }), [state, me, toasts, toast, tap])
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export { USERS, userById }
