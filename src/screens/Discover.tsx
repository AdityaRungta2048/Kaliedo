import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search, SearchX, Sparkles, X } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { useViewer } from '@/store/ViewerContext'
import { searchPosts, searchTopics, searchUsers } from '@/lib/search'
import { ADJACENT, ONBOARDING_TOPICS, tintFor } from '@/lib/topics'
import { USERS } from '@/lib/users'
import { compact, cx, excerpt } from '@/lib/utils'
import { PostBlock } from '@/components/post/PostBlock'
import { Avatar, EmptyState, Pressable, SectionHeading, Skeleton, TopicChip, VerifiedMark } from '@/components/ui/Primitives'
import { FollowButton } from '@/components/profile/FollowButton'

const SUGGESTIONS = [
  'best places to travel in winter',
  'beginner AI projects',
  'how to finish a draft',
  'cooking as a practice',
  'why games feel hard',
]

const TRENDING = ['Writing', 'AI', 'Photography', 'Startups', 'Philosophy', 'Food', 'Design', 'Music', 'Gaming', 'Travel', 'Nature', 'Fashion']

const TINT_BG: Record<string, string> = {
  ember: 'from-ember/18 to-ember/[0.04]', moss: 'from-moss/18 to-moss/[0.04]',
  amber: 'from-amber/18 to-amber/[0.04]', iris: 'from-iris/18 to-iris/[0.04]', ink: 'from-ink/10 to-ink/[0.03]',
}

export function Discover() {
  const { state } = useApp()
  const { openId, open } = useViewer()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [debounced, setDebounced] = useState(query)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (params.get('focus')) inputRef.current?.focus()
  }, [params])

  useEffect(() => {
    if (query !== debounced) setSearching(true)
    const t = window.setTimeout(() => { setDebounced(query); setSearching(false) }, 260)
    return () => window.clearTimeout(t)
  }, [query, debounced])

  useEffect(() => {
    const next = new URLSearchParams(params)
    if (debounced) next.set('q', debounced); else next.delete('q')
    next.delete('focus')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const results = useMemo(() => searchPosts(debounced, state.posts), [debounced, state.posts])
  const people = useMemo(() => searchUsers(debounced, USERS.filter((u) => u.id !== 'u_me')), [debounced])
  const topics = useMemo(() => searchTopics(debounced, ONBOARDING_TOPICS), [debounced])

  const seed = state.interests[0] ?? 'Writing'
  const chain = useMemo(() => {
    const out = [seed]
    let cur = seed
    const seen = new Set([seed])
    for (let i = 0; i < 4; i++) {
      const next = (ADJACENT[cur] ?? []).find((t) => !seen.has(t))
      if (!next) break
      out.push(next); seen.add(next); cur = next
    }
    return out
  }, [seed])

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pb-16 pt-5 sm:px-6 lg:pt-9">
      <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[34px]">
        What are you curious about?
      </h1>
      <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-muted">
        Search the way you would ask a friend. Kaleido reads for meaning, so the words do not have to match.
      </p>

      <div className="sticky top-[54px] z-20 -mx-4 mt-5 bg-canvas/92 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0 lg:py-3">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
          <input
            ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, topics, ideas…" aria-label="Search Kaleido"
            className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-11 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/30"
          />
          {query && (
            <Pressable onClick={() => setQuery('')} aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-faint hover:bg-ink/5 hover:text-ink">
              <X size={15} />
            </Pressable>
          )}
        </div>

        {!debounced && (
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onClick={() => setQuery(s)} className="chip shrink-0 hover:border-ink/40 hover:text-ink">
                <Sparkles size={11} className="text-ember" /> {s}
              </Pressable>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {debounced ? (
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-6">
            {searching ? (
              <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
            ) : results.length === 0 && people.length === 0 ? (
              <EmptyState
                icon={<SearchX size={22} />} title="We couldn't find that yet"
                body="Try a different idea — Kaleido works best with a whole thought rather than a keyword."
              />
            ) : (
              <div className="space-y-8">
                {topics.length > 0 && (
                  <section>
                    <SectionHeading>Topics that match</SectionHeading>
                    <div className="flex flex-wrap gap-1.5">
                      {topics.map((t) => <TopicChip key={t} topic={t} as="link" />)}
                    </div>
                  </section>
                )}

                {people.length > 0 && (
                  <section>
                    <SectionHeading>People</SectionHeading>
                    <ul className="space-y-3">
                      {people.slice(0, 4).map((u) => (
                        <li key={u.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
                          <Avatar user={u} size={42} />
                          <div className="min-w-0 flex-1">
                            <Link to={`/u/${u.handle}`} className="flex items-center gap-1 truncate text-[14px] font-semibold text-ink hover:underline">
                              {u.name} {u.verified && <VerifiedMark />}
                            </Link>
                            <p className="truncate text-[12.5px] text-muted">{u.bio}</p>
                          </div>
                          <FollowButton userId={u.id} size="sm" />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {results.length > 0 && (
                  <section>
                    <SectionHeading>
                      {results.length} {results.length === 1 ? 'piece' : 'pieces'}
                    </SectionHeading>
                    <ul className="space-y-3">
                      {results.slice(0, 12).map((hit, i) => (
                        <motion.li
                          key={hit.post.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="mb-1.5 flex items-center gap-1.5 pl-1 text-[11.5px] font-medium text-ember">
                            <Sparkles size={11} /> {hit.reason}
                          </div>
                          <PostBlock post={hit.post} expanded={openId === hit.post.id} onOpen={() => open(hit.post.id)} />
                        </motion.li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="browse" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-7 space-y-9">
            <section>
              <SectionHeading>Trending now</SectionHeading>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {TRENDING.map((t, i) => {
                  const count = state.posts.filter((p) => p.topics.includes(t)).length
                  return (
                    <motion.div key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}>
                      <Link
                        to={`/topic/${encodeURIComponent(t)}`}
                        className={cx('group relative flex h-[92px] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-gradient-to-br p-3.5 transition-shadow hover:shadow-lift',
                          TINT_BG[tintFor([t])])}
                      >
                        <span className="font-display text-[16px] font-semibold text-ink">{t}</span>
                        <span className="text-[11.5px] text-muted">{count} pieces this week</span>
                        <ArrowRight size={14} className="absolute right-3 top-3 text-faint transition-transform duration-300 group-hover:translate-x-0.5" />
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </section>

            <section>
              <SectionHeading>Because you read {seed}</SectionHeading>
              <p className="mb-4 max-w-[52ch] text-[13.5px] leading-relaxed text-muted">
                Kaleido walks outward from what you already like, one step at a time. Each step is still recognisable; five steps in, you are somewhere new.
              </p>
              <ol className="relative space-y-2 pl-6">
                <span className="absolute left-[9px] top-2 bottom-2 w-px bg-line" />
                {chain.map((t, i) => (
                  <motion.li key={t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }} className="relative">
                    <span className={cx('absolute -left-6 top-[15px] h-[9px] w-[9px] rounded-full ring-4 ring-canvas',
                      i === 0 ? 'bg-ember' : i < 3 ? 'bg-moss' : 'bg-iris')} />
                    <Link to={`/topic/${encodeURIComponent(t)}`}
                      className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:bg-ink/[0.03]">
                      <span>
                        <span className="block font-display text-[15.5px] font-semibold text-ink">{t}</span>
                        <span className="text-[12px] text-faint">
                          {i === 0 ? 'where you started' : i < 3 ? 'closely related' : 'a genuine detour'}
                        </span>
                      </span>
                      <ArrowRight size={15} className="text-faint" />
                    </Link>
                  </motion.li>
                ))}
              </ol>
            </section>

            <section>
              <SectionHeading>Writers worth following</SectionHeading>
              <div className="grid gap-3 sm:grid-cols-2">
                {USERS.filter((u) => u.id !== 'u_me').slice(0, 6).map((u) => (
                  <div key={u.id} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
                    <Avatar user={u} size={44} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/u/${u.handle}`} className="flex items-center gap-1 truncate text-[14px] font-semibold text-ink hover:underline">
                        {u.name} {u.verified && <VerifiedMark />}
                      </Link>
                      <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted">{excerpt([u.bio], 78)}</p>
                      <p className="mt-1 text-[11.5px] text-faint">{compact(u.followers)} readers</p>
                    </div>
                    <FollowButton userId={u.id} size="sm" />
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
