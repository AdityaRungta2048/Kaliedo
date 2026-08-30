import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, CalendarDays, LayoutGrid, MapPin, Rows3, Settings, Share2 } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { useViewer } from '@/store/ViewerContext'
import { USERS } from '@/lib/users'
import { compact, cx, excerpt, timeAgo } from '@/lib/utils'
import { PostBlock } from '@/components/post/PostBlock'
import { CoverArt } from '@/components/brand/CoverArt'
import { Avatar, Button, EmptyState, Pressable, TopicChip, VerifiedMark } from '@/components/ui/Primitives'
import { FollowButton } from '@/components/profile/FollowButton'

type Tab = 'posts' | 'saved' | 'interests'

export function Profile({ self = false }: { self?: boolean }) {
  const { handle } = useParams()
  const navigate = useNavigate()
  const { state, dispatch, me, toast } = useApp()
  const { openId, open } = useViewer()
  const [tab, setTab] = useState<Tab>('posts')
  const [layout, setLayout] = useState<'list' | 'grid'>('list')

  const user = useMemo(() => {
    if (self) return me
    const found = USERS.find((u) => u.handle === handle)
    return found?.id === me.id ? me : found
  }, [self, handle, me])

  if (!user) return <Navigate to="/discover" replace />

  const isMe = user.id === me.id
  const posts = state.posts.filter((p) => p.authorId === user.id)
  const saved = state.posts.filter((p) => state.saves.includes(p.id))
  const shown = tab === 'saved' ? saved : posts

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 pb-16 pt-4 sm:px-6 lg:pt-8">
      <header className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex items-start gap-4 sm:gap-6">
          <Avatar user={user} size={76} link={false} className="sm:!h-[92px] sm:!w-[92px]" />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 font-display text-[21px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[26px]">
              {user.name} {user.verified && <VerifiedMark className="!h-[18px] !w-[18px]" />}
            </h1>
            <p className="text-[13.5px] text-muted">@{user.handle}{user.pronouns ? ` · ${user.pronouns}` : ''}</p>
            <div className="mt-3 hidden items-center gap-2 sm:flex">
              {isMe ? (
                <>
                  <Button variant="outline" onClick={() => navigate('/settings')}><Settings size={14} /> Edit profile</Button>
                  <Button variant="ghost" onClick={() => { navigator.clipboard?.writeText(`https://kaleida.app/u/${user.handle}`).catch(() => {}); toast('Profile link copied') }}>
                    <Share2 size={14} /> Share
                  </Button>
                </>
              ) : (
                <>
                  <FollowButton userId={user.id} />
                  <Button variant="outline" onClick={() => { dispatch({ type: 'startConversation', userId: user.id }); navigate('/messages') }}>Message</Button>
                  <Button variant="ghost" onClick={() => { navigator.clipboard?.writeText(`https://kaleida.app/u/${user.handle}`).catch(() => {}); toast('Profile link copied') }}>
                    <Share2 size={14} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-[58ch] font-read text-[15px] leading-relaxed text-ink/85">{user.bio}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-faint">
          {user.location && <span className="flex items-center gap-1.5"><MapPin size={12} /> {user.location}</span>}
          <span className="flex items-center gap-1.5"><CalendarDays size={12} /> Joined {user.joined}</span>
        </div>

        <div className="mt-4 flex gap-6">
          {[
            { label: 'Pieces', value: posts.length },
            { label: 'Readers', value: user.followers + (state.following.includes(user.id) && !isMe ? 1 : 0) },
            { label: 'Reading', value: isMe ? state.following.length : user.following },
          ].map((s) => (
            <button
              key={s.label} onClick={() => toast(`${compact(s.value)} ${s.label.toLowerCase()}`, 'info')}
              className="text-left transition-opacity hover:opacity-70"
            >
              <span className="block font-display text-[18px] font-semibold tabular-nums text-ink">{compact(s.value)}</span>
              <span className="text-[12px] text-muted">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 sm:hidden">
          {isMe ? (
            <Button variant="outline" className="flex-1" onClick={() => navigate('/settings')}>Edit profile</Button>
          ) : (
            <>
              <FollowButton userId={user.id} full />
              <Button variant="outline" className="flex-1" onClick={() => { dispatch({ type: 'startConversation', userId: user.id }); navigate('/messages') }}>Message</Button>
            </>
          )}
        </div>
      </header>

      <nav className="sticky top-[54px] z-20 -mx-4 mt-5 flex items-center gap-1 border-b border-line bg-canvas/92 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0">
        {([
          { id: 'posts' as Tab, label: isMe ? 'Your writing' : 'Writing' },
          ...(isMe ? [{ id: 'saved' as Tab, label: 'Saved' }] : []),
          { id: 'interests' as Tab, label: 'Interests' },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cx('relative px-3 py-3 text-[13.5px] font-medium transition-colors', tab === t.id ? 'text-ink' : 'text-muted hover:text-ink')}>
            {t.label}
            {tab === t.id && <motion.span layoutId="profile-tab" className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          </button>
        ))}
        {tab !== 'interests' && (
          <div className="ml-auto flex gap-0.5 pb-1">
            {([['list', Rows3], ['grid', LayoutGrid]] as const).map(([id, Icon]) => (
              <Pressable key={id} onClick={() => setLayout(id)} aria-label={`${id} view`} aria-pressed={layout === id}
                className={cx('rounded-lg p-2 transition-colors', layout === id ? 'bg-ink/[0.07] text-ink' : 'text-faint hover:text-ink')}>
                <Icon size={16} />
              </Pressable>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-5">
        {tab === 'interests' ? (
          <section>
            <p className="mb-4 max-w-[52ch] text-[13.5px] leading-relaxed text-muted">
              {isMe ? 'What Kaleida uses to compose your feed. Tap to follow or unfollow a topic.' : `What ${user.name.split(' ')[0]} reads and writes about.`}
            </p>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((t) => (
                <TopicChip
                  key={t} topic={t} active={state.followedTopics.includes(t)}
                  onClick={() => { dispatch({ type: 'toggleFollowTopic', topic: t }); toast(state.followedTopics.includes(t) ? `Unfollowed ${t}` : `Following ${t}`) }}
                />
              ))}
            </div>
          </section>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={22} />}
            title={tab === 'saved' ? 'No saved posts' : 'Nothing published yet'}
            body={tab === 'saved' ? 'Save something worth coming back to.' : isMe ? 'Your first piece is one button away.' : 'This writer has not published here yet.'}
            action={tab !== 'saved' && isMe ? <Button onClick={() => navigate('/create')}>Write something</Button> : undefined}
          />
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {shown.map((p, i) => (
              <motion.button
                key={p.id} onClick={() => open(p.id)}
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
                className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-3 text-left"
              >
                {p.art && <span className="absolute inset-0 opacity-25 transition-opacity group-hover:opacity-40"><CoverArt art={p.art} /></span>}
                <span className="relative font-display text-[14px] font-semibold leading-snug text-ink line-clamp-3">{p.title}</span>
                <span className="relative text-[11px] text-muted">{excerpt(p.body, 42)}</span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {shown.map((p, i) => (
              <PostBlock key={p.id} post={p} index={i} expanded={openId === p.id} onOpen={() => open(p.id)} />
            ))}
          </div>
        )}
      </div>

      {tab === 'posts' && shown.length > 0 && (
        <p className="mt-6 text-center text-[12px] text-faint">
          Last published {timeAgo(Math.min(...shown.map((p) => p.minutesAgo)))} ago
        </p>
      )}
    </div>
  )
}

export function TopicPage() {
  const { topic = '' } = useParams()
  const name = decodeURIComponent(topic)
  const { state, dispatch, toast } = useApp()
  const { openId, open } = useViewer()
  const posts = state.posts.filter((p) => p.topics.includes(name))
  const writers = USERS.filter((u) => u.interests.includes(name) && u.id !== 'u_me').slice(0, 4)
  const following = state.followedTopics.includes(name)

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 pb-16 pt-5 sm:px-6 lg:pt-9">
      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="label-xs">Topic</p>
        <h1 className="mt-1 font-display text-[30px] font-semibold tracking-[-0.025em] text-ink">{name}</h1>
        <p className="mt-2 text-[14px] text-muted">{posts.length} pieces · {compact(writers.length * 8400 + 2100)} readers</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant={following ? 'outline' : 'primary'}
            onClick={() => { dispatch({ type: 'toggleFollowTopic', topic: name }); toast(following ? `Unfollowed ${name}` : `Following ${name}`) }}
          >
            {following ? 'Following topic' : 'Follow topic'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => { dispatch({ type: 'toggleMuteTopic', topic: name }); toast(state.mutedTopics.includes(name) ? `${name} unmuted` : `${name} muted`) }}
          >
            {state.mutedTopics.includes(name) ? 'Unmute' : 'Show less of this'}
          </Button>
        </div>
      </div>

      {writers.length > 0 && (
        <section className="mt-6">
          <h2 className="label-xs mb-3">Writers in {name}</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {writers.map((u) => (
              <div key={u.id} className="flex w-[168px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center">
                <Avatar user={u} size={46} />
                <span className="truncate text-[13.5px] font-semibold text-ink">{u.name}</span>
                <FollowButton userId={u.id} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-7">
        <h2 className="label-xs mb-3">Latest in {name}</h2>
        {posts.length === 0 ? (
          <EmptyState icon={<Bookmark size={22} />} title="Quiet in here" body="Nobody has published in this topic yet. Yours could be the first." />
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {posts.map((p, i) => <PostBlock key={p.id} post={p} index={i} expanded={openId === p.id} onOpen={() => open(p.id)} />)}
          </div>
        )}
      </section>
    </div>
  )
}
