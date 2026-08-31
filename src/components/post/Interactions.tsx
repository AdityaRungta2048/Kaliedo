import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, Heart, Link2, MessageCircle, Repeat2, Send, Share2, Sparkles } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { userById } from '@/lib/users'
import type { Post, Relevance } from '@/lib/types'
import { RELEVANCE_COPY } from '@/lib/recommend'
import { compact, cx, timeAgo } from '@/lib/utils'
import { Avatar, Pressable } from '@/components/ui/Primitives'
import { Sheet } from '@/components/ui/Overlay'
import { EASE, T_SLOW } from '@/lib/motion'

/** The burst is eight short strokes — a spark, not confetti. */
function Burst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <span className="pointer-events-none absolute inset-0">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            return (
              <motion.span
                key={i} className="absolute left-1/2 top-1/2 h-[3px] w-[3px] rounded-full bg-ember"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * 15, y: Math.sin(a) * 15, opacity: 0, scale: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
              />
            )
          })}
        </span>
      )}
    </AnimatePresence>
  )
}

export function LikeButton({ post, showCount = true }: { post: Post; showCount?: boolean }) {
  const { state, dispatch } = useApp()
  const liked = state.likes.includes(post.id)
  const [burst, setBurst] = useState(false)

  return (
    <Pressable
      onClick={(e) => {
        e.stopPropagation()
        if (!liked) { setBurst(true); window.setTimeout(() => setBurst(false), 460) }
        dispatch({ type: 'toggleLike', id: post.id })
      }}
      aria-pressed={liked} aria-label={liked ? 'Unlike' : 'Like'}
      className={cx('group relative flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[12.5px] font-medium transition-colors',
        liked ? 'text-ember' : 'text-muted hover:text-ember')}
    >
      <span className="relative flex items-center justify-center">
        <Burst show={burst} />
        <motion.span animate={liked ? { scale: [1, 1.28, 1] } : { scale: 1 }} transition={{ duration: 0.3, times: [0, 0.4, 1], ease: EASE }}>
          <Heart size={16} strokeWidth={2} fill={liked ? 'currentColor' : 'none'} />
        </motion.span>
      </span>
      {showCount && (
        <motion.span key={String(liked)} initial={{ y: liked ? 6 : -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }} className="tabular-nums">
          {compact(post.likes + (liked ? 1 : 0))}
        </motion.span>
      )}
    </Pressable>
  )
}

export function SaveButton({ post, withLabel = false }: { post: Post; withLabel?: boolean }) {
  const { state, dispatch, toast } = useApp()
  const saved = state.saves.includes(post.id)
  return (
    <Pressable
      onClick={(e) => {
        e.stopPropagation()
        dispatch({ type: 'toggleSave', id: post.id })
        toast(saved ? 'Removed from saved' : 'Saved to your shelf', 'bookmark')
      }}
      aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save'}
      className={cx('flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[12.5px] font-medium transition-colors',
        saved ? 'text-amber' : 'text-muted hover:text-ink')}
    >
      <motion.span animate={saved ? { y: [0, -4, 0] } : {}} transition={{ duration: 0.28, ease: EASE }}>
        <Bookmark size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
      </motion.span>
      {withLabel && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(saved)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16 }}>
            {saved ? 'Saved' : 'Save'}
          </motion.span>
        </AnimatePresence>
      )}
    </Pressable>
  )
}

export function RepostButton({ post }: { post: Post }) {
  const { toast } = useApp()
  const [done, setDone] = useState(false)
  return (
    <Pressable
      onClick={(e) => { e.stopPropagation(); setDone((d) => !d); toast(done ? 'Repost removed' : 'Reposted to your followers') }}
      aria-pressed={done} aria-label="Repost"
      className={cx('flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[12.5px] font-medium transition-colors', done ? 'text-moss' : 'text-muted hover:text-moss')}
    >
      <motion.span animate={done ? { rotate: 360 } : { rotate: 0 }} transition={T_SLOW}>
        <Repeat2 size={17} strokeWidth={2} />
      </motion.span>
      <span className="tabular-nums">{compact(post.reposts + (done ? 1 : 0))}</span>
    </Pressable>
  )
}

export function CommentButton({ post, onOpen }: { post: Post; onOpen: () => void }) {
  return (
    <Pressable
      onClick={(e) => { e.stopPropagation(); onOpen() }} aria-label="Open replies"
      className="flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
    >
      <MessageCircle size={16} strokeWidth={2} />
      <span className="tabular-nums">{compact(post.comments.length)}</span>
    </Pressable>
  )
}

export function ShareSheet({ post, open, onClose }: { post: Post; open: boolean; onClose: () => void }) {
  const { state, toast, dispatch } = useApp()
  const people = state.conversations.slice(0, 6).map((c) => userById(c.userId))

  return (
    <Sheet open={open} onClose={onClose} title="Share this piece" size="md">
      <div className="px-5 pb-6">
        <p className="mb-4 text-[13.5px] text-muted">“{post.title}”</p>

        <div className="mb-5 flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {people.map((u) => (
            <Pressable
              key={u.id} onClick={() => { dispatch({ type: 'startConversation', userId: u.id }); toast(`Sent to ${u.name.split(' ')[0]}`, 'check'); onClose() }}
              className="flex w-[64px] shrink-0 flex-col items-center gap-2"
            >
              <Avatar user={u} size={52} link={false} />
              <span className="w-full truncate text-center text-[11.5px] text-muted">{u.name.split(' ')[0]}</span>
            </Pressable>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Link2, label: 'Copy link', run: () => { navigator.clipboard?.writeText(`https://kaleido.app/p/${post.id}`).catch(() => {}); toast('Link copied') } },
            { icon: Send, label: 'Send as message', run: () => toast('Opened in messages') },
            { icon: Repeat2, label: 'Repost', run: () => toast('Reposted to your followers') },
            { icon: Share2, label: 'Share outside', run: () => toast('Share sheet opened') },
          ].map(({ icon: Icon, label, run }) => (
            <Pressable key={label} onClick={() => { run(); onClose() }} className="flex items-center gap-3 rounded-xl border border-line bg-canvas px-3.5 py-3 text-left text-[13.5px] font-medium text-ink hover:bg-ink/[0.03]">
              <Icon size={16} className="text-muted" /> {label}
            </Pressable>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

export function CommentSheet({ post, open, onClose }: { post: Post; open: boolean; onClose: () => void }) {
  const { state, dispatch, me, toast } = useApp()
  const [draft, setDraft] = useState('')
  const live = state.posts.find((p) => p.id === post.id) ?? post

  const send = () => {
    const text = draft.trim()
    if (!text) return
    dispatch({
      type: 'addComment', postId: post.id,
      comment: { id: `c_${Date.now()}`, authorId: me.id, text, minutesAgo: 0, likes: 0 },
    })
    setDraft('')
    toast('Reply posted')
  }

  return (
    <Sheet
      open={open} onClose={onClose} title={`${live.comments.length} ${live.comments.length === 1 ? 'reply' : 'replies'}`} size="md"
      footer={
        <div className="flex items-end gap-2">
          <Avatar user={me} size={32} link={false} />
          <textarea
            value={draft} onChange={(e) => setDraft(e.target.value)} rows={1} placeholder="Add a reply…"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            className="max-h-28 min-h-[38px] flex-1 resize-none rounded-2xl border border-line bg-canvas px-3.5 py-2 text-[14px] text-ink outline-none placeholder:text-faint focus:border-ink/30"
          />
          <Pressable onClick={send} disabled={!draft.trim()} aria-label="Send reply"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-ink text-canvas disabled:opacity-30">
            <Send size={15} />
          </Pressable>
        </div>
      }
    >
      <div className="px-5 pb-4">
        {live.comments.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-muted">No replies yet. Say the first useful thing.</p>
        ) : (
          <ul className="space-y-4 py-1">
            <AnimatePresence initial={false}>
              {live.comments.map((c) => {
                const u = userById(c.authorId)
                return (
                  <motion.li key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <Avatar user={u} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13.5px] font-semibold text-ink">{u.name}</span>
                        <span className="text-[12px] text-faint">{timeAgo(c.minutesAgo)}</span>
                      </div>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-ink/85">{c.text}</p>
                      <button onClick={() => toast('Reply liked', 'heart')} className="mt-1.5 text-[12px] text-faint transition-colors hover:text-ember">
                        {c.likes > 0 ? `${compact(c.likes)} likes` : 'Like'}
                      </button>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </Sheet>
  )
}

export function WhyThisPost({ post, relevance }: { post: Post; relevance: Relevance }) {
  const { state } = useApp()
  const [open, setOpen] = useState(false)
  const overlap = post.topics.filter((t) => state.interests.includes(t))
  const copy = RELEVANCE_COPY[relevance]

  return (
    <div className="rounded-2xl border border-line bg-canvas">
      <Pressable onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left">
        <Sparkles size={15} className="text-ember" />
        <span className="flex-1 text-[13px] font-medium text-ink">Why you're seeing this</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-faint">▾</motion.span>
      </Pressable>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              <p className="text-[13.5px] leading-relaxed text-muted">
                {copy.note} You read a lot around{' '}
                <span className="font-medium text-ink">{state.interests.slice(0, 3).join(', ')}</span>.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {post.topics.map((t) => (
                  <span key={t} className={cx('chip', overlap.includes(t) && 'border-ember/40 text-ember')}>{t}</span>
                ))}
              </div>
              <p className="text-[12.5px] text-faint">
                Kaleido matched this on meaning, not hashtags — {copy.label.toLowerCase()} in your current mix.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
