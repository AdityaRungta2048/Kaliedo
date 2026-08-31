import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, CheckCheck, ImagePlus, MessageSquarePlus, Search, Send, Smile } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { userById, USERS } from '@/lib/users'
import type { Art, Message } from '@/lib/types'
import { useIsDesktop } from '@/lib/useMediaQuery'
import { cx, timeAgo } from '@/lib/utils'
import { CoverArt } from '@/components/brand/CoverArt'
import { Avatar, EmptyState, Pressable, VerifiedMark } from '@/components/ui/Primitives'
import { Sheet } from '@/components/ui/Overlay'
import { T_BASE } from '@/lib/motion'

const EMOJI = ['❤️', '🔥', '😄', '👏', '🤔', '💯']

const REPLIES = [
  'Say more about that.',
  'Agreed — and it is the part nobody writes down.',
  'Sending you something on this later tonight.',
  'That is the version I would publish.',
  'Ha. Painfully accurate.',
]

export function Messages() {
  const { state, dispatch, me, toast } = useApp()
  const isDesktop = useIsDesktop()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [newChat, setNewChat] = useState(false)

  useEffect(() => {
    if (isDesktop && !activeId && state.conversations.length) setActiveId(state.conversations[0].id)
  }, [isDesktop, activeId, state.conversations])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.conversations.filter((c) => {
      if (!q) return true
      const u = userById(c.userId)
      return u.name.toLowerCase().includes(q) || u.handle.includes(q) ||
        c.messages.some((m) => m.text?.toLowerCase().includes(q))
    })
  }, [state.conversations, query])

  const active = state.conversations.find((c) => c.id === activeId) ?? null

  const openConversation = (id: string) => {
    setActiveId(id)
    dispatch({ type: 'readConversation', conversationId: id })
  }

  const chatList = (
    <div className={cx('flex min-h-0 flex-col', isDesktop && 'w-[330px] shrink-0 border-r border-line')}>
      <div className="flex items-center gap-2 px-4 pb-3 pt-4 lg:px-5">
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">Messages</h1>
        <Pressable onClick={() => setNewChat(true)} aria-label="New conversation"
          className="ml-auto rounded-full p-2 text-muted hover:bg-ink/5 hover:text-ink">
          <MessageSquarePlus size={18} />
        </Pressable>
      </div>
      <div className="px-4 pb-3 lg:px-5">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" aria-label="Search conversations"
            className="h-10 w-full rounded-full border border-line bg-surface pl-9 pr-3 text-[14px] text-ink outline-none placeholder:text-faint focus:border-ink/30"
          />
        </div>
      </div>

      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-2 pb-4 lg:px-3">
        {list.length === 0 ? (
          <EmptyState icon={<Send size={20} />} title="No conversations" body="Your conversations will appear here." />
        ) : (
          <ul className="space-y-0.5">
            {list.map((c) => {
              const u = userById(c.userId)
              const last = c.messages[c.messages.length - 1]
              const unread = c.messages.some((m) => m.from === 'them' && !m.read)
              return (
                <li key={c.id}>
                  <Pressable
                    onClick={() => openConversation(c.id)}
                    className={cx('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors',
                      activeId === c.id ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.03]')}
                  >
                    <Avatar user={u} size={44} link={false} ring={unread} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] font-semibold text-ink">{u.name}</span>
                        {u.verified && <VerifiedMark />}
                        <span className="ml-auto shrink-0 text-[11.5px] text-faint">{last ? timeAgo(last.minutesAgo) : ''}</span>
                      </span>
                      <span className={cx('mt-0.5 block truncate text-[13px]', unread ? 'font-medium text-ink' : 'text-muted')}>
                        {c.typing ? <em className="text-ember">typing…</em> : last?.text ?? (last?.art ? 'Sent an image' : 'Say hello')}
                      </span>
                    </span>
                    {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-ember" />}
                  </Pressable>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )

  return (
    <div className={cx('mx-auto w-full', isDesktop ? 'flex h-dvh max-w-[1180px] overflow-hidden' : 'flex min-h-[calc(100dvh-124px)] flex-col')}>
      {(isDesktop || !active) && chatList}
      {isDesktop ? (
        <div className="h-full min-w-0 flex-1">
          {active ? <Conversation key={active.id} id={active.id} onBack={() => setActiveId(null)} /> :
            <EmptyState icon={<Send size={22} />} title="Pick a conversation" body="Or start a new one — the writers you follow are one tap away." />}
        </div>
      ) : (
        <AnimatePresence>
          {active && (
            <motion.div
              key={active.id} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={T_BASE}
              className="fixed inset-0 z-40 bg-canvas"
            >
              <Conversation id={active.id} onBack={() => setActiveId(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <Sheet open={newChat} onClose={() => setNewChat(false)} title="New conversation" size="sm">
        <ul className="px-3 pb-5">
          {USERS.filter((u) => u.id !== me.id).map((u) => (
            <li key={u.id}>
              <Pressable
                onClick={() => {
                  dispatch({ type: 'startConversation', userId: u.id })
                  setNewChat(false)
                  toast(`Started a conversation with ${u.name.split(' ')[0]}`)
                  window.setTimeout(() => setActiveId(`cv_${u.id}`), 60)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-ink/[0.04]"
              >
                <Avatar user={u} size={38} link={false} />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-ink">{u.name}</span>
                  <span className="block truncate text-[12px] text-faint">@{u.handle}</span>
                </span>
              </Pressable>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  )
}

function Conversation({ id, onBack }: { id: string; onBack: () => void }) {
  const { state, dispatch, toast } = useApp()
  const conversation = state.conversations.find((c) => c.id === id)!
  const user = userById(conversation.userId)
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [reactFor, setReactFor] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [conversation.messages.length, typing])

  const send = (text?: string, art?: Art) => {
    const body = text?.trim()
    if (!body && !art) return
    dispatch({
      type: 'sendMessage', conversationId: id,
      message: { id: `m_${Date.now()}`, from: 'me', text: body, art, minutesAgo: 0, reactions: [], read: true, replyToId: replyTo?.id },
    })
    setDraft('')
    setReplyTo(null)

    // The other side answers, because a dead chat is a dead prototype.
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      dispatch({
        type: 'sendMessage', conversationId: id,
        message: { id: `m_${Date.now() + 1}`, from: 'them', text: REPLIES[Math.floor(Math.random() * REPLIES.length)], minutesAgo: 0, reactions: [], read: true },
      })
    }, 1500 + Math.random() * 900)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface/95 px-3 py-2.5 backdrop-blur-md safe-top lg:px-5">
        <Pressable onClick={onBack} aria-label="Back" className="rounded-full p-2 text-muted hover:bg-ink/5 hover:text-ink lg:hidden">
          <ArrowLeft size={19} />
        </Pressable>
        <Avatar user={user} size={38} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[14.5px] font-semibold text-ink">{user.name} {user.verified && <VerifiedMark />}</p>
          <p className="truncate text-[12px] text-faint">{typing ? 'typing…' : state.activityStatus ? 'Active now' : `@${user.handle}`}</p>
        </div>
      </header>

      <div className="scroll-slim min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4 lg:px-6">
        {conversation.messages.length === 0 && (
          <p className="py-10 text-center text-[13.5px] text-muted">
            No messages yet. Say something worth reading.
          </p>
        )}
        <AnimatePresence initial={false}>
          {conversation.messages.map((m) => {
            const mine = m.from === 'me'
            const repliedTo = m.replyToId ? conversation.messages.find((x) => x.id === m.replyToId) : null
            return (
              <motion.div
                key={m.id} layout
                initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={T_BASE}
                className={cx('flex', mine ? 'justify-end' : 'justify-start')}
              >
                <div className={cx('group relative max-w-[78%] sm:max-w-[62%]')}>
                  {repliedTo && (
                    <p className={cx('mb-1 truncate rounded-lg border-l-2 border-ember/50 px-2 py-1 text-[11.5px] text-faint', mine ? 'text-right' : '')}>
                      {repliedTo.text ?? 'Image'}
                    </p>
                  )}
                  <div
                    onDoubleClick={() => dispatch({ type: 'reactMessage', conversationId: id, messageId: m.id, emoji: '❤️' })}
                    className={cx('relative rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed',
                      mine ? 'rounded-br-md bg-ink text-canvas' : 'rounded-bl-md border border-line bg-surface text-ink')}
                  >
                    {m.art && (
                      <span className="mb-2 block overflow-hidden rounded-xl">
                        <CoverArt art={m.art} />
                      </span>
                    )}
                    {m.text}
                    {m.reactions.length > 0 && (
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className={cx('absolute -bottom-2.5 flex gap-0.5 rounded-full border border-line bg-raised px-1.5 py-0.5 text-[11px] shadow-soft', mine ? 'right-2' : 'left-2')}
                      >
                        {m.reactions.join('')}
                      </motion.span>
                    )}
                  </div>
                  <div className={cx('mt-1.5 flex items-center gap-2 text-[11px] text-faint opacity-0 transition-opacity group-hover:opacity-100', mine ? 'justify-end' : '')}>
                    <button onClick={() => setReactFor(m.id)} className="hover:text-ink">React</button>
                    <button onClick={() => setReplyTo(m)} className="hover:text-ink">Reply</button>
                    <span>{timeAgo(m.minutesAgo)}</span>
                    {mine && (m.read ? <CheckCheck size={12} className="text-moss" /> : <Check size={12} />)}
                  </div>

                  <AnimatePresence>
                    {reactFor === m.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={cx('absolute z-10 flex gap-1 rounded-full border border-line bg-raised p-1.5 shadow-lift', mine ? 'right-0 -top-10' : 'left-0 -top-10')}
                      >
                        {EMOJI.map((e) => (
                          <button key={e} onClick={() => { dispatch({ type: 'reactMessage', conversationId: id, messageId: m.id, emoji: e }); setReactFor(null) }}
                            className="rounded-full px-1 text-[16px] transition-transform hover:scale-125">
                            {e}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-faint"
                    animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {replyTo && (
        <div className="flex items-center gap-2 border-t border-line bg-surface px-4 py-2 text-[12.5px] text-muted">
          <span className="truncate">Replying to “{replyTo.text ?? 'image'}”</span>
          <button onClick={() => setReplyTo(null)} className="ml-auto text-faint hover:text-ink">Cancel</button>
        </div>
      )}

      <footer className="flex shrink-0 items-end gap-2 border-t border-line bg-surface px-3 py-2.5 safe-bottom lg:px-5">
        <Pressable
          onClick={() => { send(undefined, { seed: Math.floor(Math.random() * 9999), motif: 'facets', palette: 'moss', ratio: '4:3' }); toast('Image sent') }}
          aria-label="Send an image" className="rounded-full p-2.5 text-muted hover:bg-ink/5 hover:text-ink"
        >
          <ImagePlus size={19} />
        </Pressable>
        <div className="relative flex-1">
          <textarea
            value={draft} onChange={(e) => setDraft(e.target.value)} rows={1} placeholder="Write a message…" aria-label="Message"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft) } }}
            className="max-h-28 min-h-[42px] w-full resize-none rounded-2xl border border-line bg-canvas py-2.5 pl-3.5 pr-10 text-[14.5px] text-ink outline-none placeholder:text-faint focus:border-ink/30"
          />
          <Pressable onClick={() => setDraft((d) => `${d}🙂`)} aria-label="Add emoji"
            className="absolute right-2.5 top-2.5 text-faint hover:text-ink">
            <Smile size={17} />
          </Pressable>
        </div>
        <Pressable onClick={() => send(draft)} disabled={!draft.trim()} aria-label="Send"
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-ink text-canvas transition-opacity disabled:opacity-30">
          <Send size={17} />
        </Pressable>
      </footer>
    </div>
  )
}
