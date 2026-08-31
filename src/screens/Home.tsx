import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUp, Crosshair, Inbox, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { useViewer } from '@/store/ViewerContext'
import { buildFeed } from '@/lib/recommend'
import { USERS } from '@/lib/users'
import { ADJACENT } from '@/lib/topics'
import { useIsDesktop } from '@/lib/useMediaQuery'
import { compact, cx } from '@/lib/utils'
import { BlockGrid, BlockGridSkeleton } from '@/components/feed/BlockGrid'
import { EXPLORE_TABS, FEED_MODES, FeedSwitcher } from '@/components/feed/FeedSwitcher'
import { MixBar, MixControls } from '@/components/feed/MixControls'
import { Sheet } from '@/components/ui/Overlay'
import { Avatar, Button, EmptyState, Pressable, SectionHeading, TopicChip, VerifiedMark } from '@/components/ui/Primitives'
import { FollowButton } from '@/components/profile/FollowButton'
import { T_BASE } from '@/lib/motion'

export function Home() {
  const { state, dispatch, reducedMotion, toast } = useApp()
  const { openId, open } = useViewer()
  const isDesktop = useIsDesktop()
  const [mixOpen, setMixOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showTop, setShowTop] = useState(false)
  const pull = useMotionValue(0)
  const pullOpacity = useTransform(pull, [0, 70], [0, 1])
  const pullRotate = useTransform(pull, [0, 90], [0, 320])
  const firstLoad = useRef(true)

  const focused = state.activeIdentity === 'alter' && state.alterEgo !== null

  const feed = useMemo(
    () => buildFeed({
      posts: state.posts,
      interests: state.interests,
      following: new Set(state.following),
      mode: state.feedMode,
      exploreTab: state.exploreTab,
      mix: state.mix,
      socialFollowing: state.socialFollowing,
      seed: state.feedSeed,
      mutedTopics: new Set(state.mutedTopics),
      focusNiche: focused ? state.alterEgo!.niche : null,
    }),
    [state.posts, state.interests, state.following, state.feedMode, state.exploreTab, state.mix, state.socialFollowing, state.feedSeed, state.mutedTopics, focused, state.alterEgo],
  )

  // A short, honest skeleton on first paint and whenever the feed re-composes.
  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => { setLoading(false); firstLoad.current = false }, firstLoad.current ? 620 : 260)
    return () => window.clearTimeout(t)
  }, [state.feedMode, state.exploreTab, state.feedSeed])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const suggested = USERS.filter((u) => u.id !== 'u_me' && !state.following.includes(u.id)).slice(0, 3)
  const nearbyTopics = useMemo(() => {
    const near = new Set<string>()
    state.interests.forEach((i) => (ADJACENT[i] ?? []).forEach((a) => near.add(a)))
    return Array.from(near).slice(0, 8)
  }, [state.interests])

  const activeMode = FEED_MODES.find((m) => m.id === state.feedMode)

  return (
    <div className="mx-auto flex w-full max-w-[1180px] gap-8 px-4 pb-16 pt-3 sm:px-6 lg:pt-6">
      <div className="min-w-0 flex-1">
        <div className="sticky top-[54px] z-20 -mx-4 mb-4 bg-canvas/90 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0 lg:py-3">
          {focused ? (
            <div className="flex items-center gap-3 rounded-full border border-iris/30 bg-iris/[0.07] px-3.5 py-2">
              <Crosshair size={14} className="shrink-0 text-iris" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                {state.alterEgo!.name}
                <span className="ml-1.5 font-normal text-muted">· Topic: {state.alterEgo!.niche}</span>
              </span>
              <Pressable
                onClick={() => { dispatch({ type: 'setIdentity', identity: 'main' }); toast('Back to your main feed') }}
                aria-label="Leave focused mode"
                className="shrink-0 rounded-full p-1 text-muted hover:text-ink"
              >
                <X size={14} />
              </Pressable>
            </div>
          ) : (
          <div className="flex items-center gap-3">
            <FeedSwitcher mode={state.feedMode} onChange={(m) => dispatch({ type: 'setMode', mode: m })} />
            <Pressable
              onClick={() => setMixOpen(true)} aria-label="Adjust your mix"
              className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
            >
              <SlidersHorizontal size={13} />
              <span className="hidden sm:inline">Your mix</span>
              <span className="w-12"><MixBar mix={state.mix} height={5} /></span>
            </Pressable>
          </div>
          )}
          {!focused && state.feedMode === 'explore' && (
            <div role="tablist" aria-label="Explore scope" className="mt-2.5 flex w-fit gap-0.5 rounded-full border border-line p-0.5">
              {EXPLORE_TABS.map((tab) => {
                const active = state.exploreTab === tab.id
                return (
                  <button
                    key={tab.id} role="tab" aria-selected={active}
                    onClick={() => dispatch({ type: 'setExploreTab', tab: tab.id })}
                    className={cx('relative rounded-full px-3.5 py-1 text-[12.5px] font-medium transition-colors',
                      active ? 'text-canvas' : 'text-muted hover:text-ink')}
                  >
                    {active && (
                      <motion.span layoutId="explore-scope" className="absolute inset-0 rounded-full bg-ink"
                        transition={T_BASE} />
                    )}
                    <span className="relative">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.p
              key={focused ? 'focused' : `${activeMode?.id}-${state.exploreTab}`} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="mt-2 text-[12px] text-faint"
            >
              {focused
                ? `Nothing outside ${state.alterEgo!.niche} reaches this feed · ${feed.length} pieces`
                : state.feedMode === 'explore'
                  ? `${EXPLORE_TABS.find((t) => t.id === state.exploreTab)?.blurb} · ${feed.length} pieces`
                  : `${activeMode?.blurb ?? ''} · ${feed.length} pieces`}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Pull to refresh — mobile only, spring-loaded. */}
        <motion.div
          drag={isDesktop || reducedMotion ? false : 'y'}
          dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.5, bottom: 0 }}
          style={{ y: pull }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80) { dispatch({ type: 'refresh' }); toast('Feed refreshed', 'info') }
          }}
        >
          <motion.div style={{ opacity: pullOpacity }} className="pointer-events-none -mt-8 mb-2 flex justify-center">
            <motion.span style={{ rotate: pullRotate }} className="text-ember"><Sparkles size={17} /></motion.span>
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <BlockGridSkeleton count={6} />
              </motion.div>
            ) : feed.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState
                  icon={<Inbox size={22} />}
                  title="Nothing here yet"
                  body={focused
                    ? `Nobody has published in ${state.alterEgo!.niche} yet. Focused mode shows this niche and nothing else.`
                    : state.feedMode === 'explore' && state.exploreTab === 'following'
                      ? 'Nobody you follow has published today. Next door is a good place to find someone new.'
                      : 'Widen your mix or add an interest and this will fill up.'}
                  action={focused
                    ? <Button onClick={() => dispatch({ type: 'setIdentity', identity: 'main' })}>Leave focused mode</Button>
                    : state.feedMode === 'explore'
                      ? <Button onClick={() => dispatch({ type: 'setExploreTab', tab: 'nearby' })}>Open Next door</Button>
                      : <Button onClick={() => dispatch({ type: 'setMode', mode: 'explore' })}>Open Explore</Button>}
                />
              </motion.div>
            ) : (
              <BlockGrid
                key={`${state.feedMode}-${state.exploreTab}-${state.feedSeed}`}
                transitionKey={`${state.feedMode}-${state.exploreTab}-${state.feedSeed}`}
                items={feed} openId={openId} onOpen={open}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop rail — the reason desktop is not just a stretched phone. */}
      <aside className="hidden w-[300px] shrink-0 lg:block">
        <div className="sticky top-6 space-y-5">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <SectionHeading action={<button onClick={() => setMixOpen(true)} className="text-[12.5px] font-medium text-ember hover:underline">Adjust</button>}>
              Your mix
            </SectionHeading>
            <MixBar mix={state.mix} height={9} />
            <ul className="mt-3.5 space-y-1.5 text-[13px]">
              {[
                { label: 'Familiar', v: state.mix.familiar, dot: 'bg-ember' },
                { label: 'Related', v: state.mix.related, dot: 'bg-moss' },
                { label: 'New', v: state.mix.explore, dot: 'bg-iris' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-2 text-muted">
                  <span className={cx('h-1.5 w-1.5 rounded-full', r.dot)} />
                  {r.label}
                  <span className="ml-auto font-semibold tabular-nums text-ink">{r.v}%</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <SectionHeading>Writers to read</SectionHeading>
            <ul className="space-y-3.5">
              {suggested.map((u) => (
                <li key={u.id} className="flex items-center gap-3">
                  <Avatar user={u} size={38} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/u/${u.handle}`} className="flex items-center gap-1 truncate text-[13.5px] font-semibold text-ink hover:underline">
                      {u.name} {u.verified && <VerifiedMark />}
                    </Link>
                    <p className="truncate text-[12px] text-faint">{compact(u.followers)} readers</p>
                  </div>
                  <FollowButton userId={u.id} size="sm" />
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <SectionHeading>Next door to you</SectionHeading>
            <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
              Because you read {state.interests.slice(0, 2).join(' and ')}.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {nearbyTopics.map((t) => <TopicChip key={t} topic={t} as="link" size="sm" />)}
            </div>
          </section>

          <p className="px-1 text-[11.5px] leading-relaxed text-faint">
            Kaleido prototype · press <kbd className="rounded border border-line px-1 py-0.5 font-sans text-[10.5px]">⌘K</kbd> for demo mode
          </p>
        </div>
      </aside>

      <Sheet open={mixOpen} onClose={() => setMixOpen(false)} title="Your Kaleido mix" size="md">
        <div className="px-5 pb-8"><MixControls compactHeader /></div>
      </Sheet>

      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })}
            aria-label="Back to top"
            className="fixed bottom-[78px] right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-raised text-ink shadow-lift lg:bottom-8 lg:right-8"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
