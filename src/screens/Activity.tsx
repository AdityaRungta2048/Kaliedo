import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AtSign, BellOff, Heart, MessageCircle, TrendingUp, UserPlus } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { useViewer } from '@/store/ViewerContext'
import { userById } from '@/lib/users'
import type { NotificationKind } from '@/lib/types'
import { cx, timeAgo } from '@/lib/utils'
import { Avatar, EmptyState, Pressable, Skeleton } from '@/components/ui/Primitives'
import { FollowButton } from '@/components/profile/FollowButton'

const FILTERS: { id: 'all' | NotificationKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mention', label: 'Mentions' },
  { id: 'follow', label: 'Follows' },
  { id: 'like', label: 'Likes' },
  { id: 'comment', label: 'Replies' },
]

const ICONS: Record<NotificationKind, { icon: typeof Heart; tint: string }> = {
  like: { icon: Heart, tint: 'text-ember bg-ember/12' },
  comment: { icon: MessageCircle, tint: 'text-iris bg-iris/12' },
  follow: { icon: UserPlus, tint: 'text-moss bg-moss/12' },
  mention: { icon: AtSign, tint: 'text-amber bg-amber/12' },
  trending: { icon: TrendingUp, tint: 'text-ember bg-ember/12' },
}

export function Activity() {
  const { state, dispatch } = useApp()
  const { open } = useViewer()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | NotificationKind>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 480)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => dispatch({ type: 'readNotifications' }), 1400)
    return () => window.clearTimeout(t)
  }, [dispatch])

  const items = useMemo(
    () => (filter === 'all' ? state.notifications : state.notifications.filter((n) => n.kind === filter)),
    [state.notifications, filter],
  )

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-5 sm:px-6 lg:pt-9">
      <h1 className="font-display text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">Activity</h1>

      <div className="sticky top-[54px] z-20 -mx-4 mt-4 flex gap-1 overflow-x-auto bg-canvas/92 px-4 py-2.5 no-scrollbar backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={cx('relative shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors', filter === f.id ? 'text-canvas' : 'text-muted hover:text-ink')}>
            {filter === f.id && <motion.span layoutId="activity-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <ul className="mt-3 space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1"><Skeleton className="h-3 w-3/4" /><Skeleton className="mt-2 h-3 w-1/3" /></div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <EmptyState icon={<BellOff size={22} />} title="You're all caught up" body="Nothing new in this category. Go and write something instead." />
      ) : (
        <ul className="mt-3 space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((n, i) => {
              const actor = n.actorId ? userById(n.actorId) : null
              const { icon: Icon, tint } = ICONS[n.kind]
              return (
                <motion.li
                  key={n.id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.32, delay: Math.min(i * 0.035, 0.3), ease: [0.22, 1, 0.36, 1] }}
                >
                  <Pressable
                    onClick={() => { if (n.postId) open(n.postId); else if (actor) navigate(`/u/${actor.handle}`) }}
                    className={cx('flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors hover:bg-ink/[0.03]',
                      n.unread ? 'border-ember/25 bg-ember/[0.04]' : 'border-line bg-surface')}
                  >
                    <span className="relative shrink-0">
                      {actor ? <Avatar user={actor} size={38} link={false} /> : <span className={cx('flex h-[38px] w-[38px] items-center justify-center rounded-full', tint)}><Icon size={17} /></span>}
                      {actor && (
                        <span className={cx('absolute -bottom-0.5 -right-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full ring-2 ring-surface', tint)}>
                          <Icon size={10} strokeWidth={2.6} />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] leading-snug text-ink">
                        {actor && <span className="font-semibold">{actor.name} </span>}
                        <span className="text-ink/80">{n.text}</span>
                      </span>
                      <span className="mt-0.5 block text-[12px] text-faint">{timeAgo(n.minutesAgo)} ago</span>
                    </span>
                    {n.kind === 'follow' && actor && <span onClick={(e) => e.stopPropagation()}><FollowButton userId={actor.id} size="sm" /></span>}
                    {n.unread && n.kind !== 'follow' && <span className="h-2 w-2 shrink-0 rounded-full bg-ember" />}
                  </Pressable>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
