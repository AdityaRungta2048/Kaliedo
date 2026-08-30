import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, EllipsisVertical, Share2, X } from 'lucide-react'
import type { Post } from '@/lib/types'
import { userById } from '@/lib/users'
import { useApp } from '@/store/AppContext'
import { relevanceOf } from '@/lib/recommend'
import { useIsTablet } from '@/lib/useMediaQuery'
import { cx, excerpt, readTime, timeAgo } from '@/lib/utils'
import { Avatar, Pressable, TopicChip, VerifiedMark } from '@/components/ui/Primitives'
import { CoverArt } from '@/components/brand/CoverArt'
import { FollowButton } from '@/components/profile/FollowButton'
import { CommentButton, CommentSheet, LikeButton, RepostButton, SaveButton, ShareSheet, WhyThisPost } from './Interactions'
import { PostMenu } from './PostMenu'
import { blockLayoutId } from './PostBlock'

/**
 * The expanded block. Same element, more room: the card morphs open, the writing
 * arrives, and any image sits at the end where the author left it.
 */
export function PostReader({ post, onClose, onOpenPost }: { post: Post; onClose: () => void; onOpenPost: (id: string) => void }) {
  const { state, reducedMotion } = useApp()
  const isTablet = useIsTablet()
  const author = userById(post.authorId)
  const [comments, setComments] = useState(false)
  const [share, setShare] = useState(false)
  const [menu, setMenu] = useState(false)
  const relevance = relevanceOf(post, state.interests)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  const related = useMemo(() => {
    return state.posts
      .filter((p) => p.id !== post.id && p.topics.some((t) => post.topics.includes(t)))
      .slice(0, 3)
  }, [state.posts, post])

  const reveal = reducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
        onClick={onClose} className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[2px]"
      />

      {/* Centred with flexbox, never a CSS transform — Framer owns transform during the morph. */}
      <div className="pointer-events-none fixed inset-0 z-[71] flex items-center justify-center sm:p-6">
      <motion.article
        layoutId={blockLayoutId(post.id)}
        style={{ borderRadius: isTablet ? 26 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className={cx(
          'pointer-events-auto flex flex-col overflow-hidden border-line bg-surface shadow-float',
          isTablet ? 'max-h-[90vh] w-[min(760px,92vw)] border' : 'h-full w-full',
        )}
        drag={isTablet ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.35 }}
        onDragEnd={(_, info) => { if (info.offset.y > 130 || info.velocity.y > 800) onClose() }}
      >
        <header className="flex shrink-0 items-center gap-2.5 border-b border-line bg-surface/95 px-3 py-2.5 backdrop-blur-md sm:px-5 safe-top">
          <Pressable onClick={onClose} aria-label="Close reader" className="rounded-full p-2 text-muted hover:bg-ink/5 hover:text-ink">
            {isTablet ? <X size={18} /> : <ArrowLeft size={19} />}
          </Pressable>
          <Avatar user={author} size={30} />
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <Link to={`/u/${author.handle}`} onClick={onClose} className="truncate text-[13.5px] font-semibold text-ink hover:underline">
              {author.name}
            </Link>
            {author.verified && <VerifiedMark />}
          </div>
          <FollowButton userId={author.id} size="sm" />
          <Pressable onClick={() => setMenu(true)} aria-label="Post options" className="rounded-full p-2 text-muted hover:bg-ink/5 hover:text-ink">
            <EllipsisVertical size={17} />
          </Pressable>
        </header>

        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <motion.div {...reveal} className="mx-auto w-full max-w-reader px-5 py-7 sm:px-8 sm:py-9">
            <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-faint">
              <span className="uppercase tracking-[0.14em] text-ember">{post.kind.replace('-', ' ')}</span>
              <span>·</span><span>{timeAgo(post.minutesAgo)} ago</span>
              <span>·</span><span>{readTime(post.body)} min read</span>
            </div>

            <h1 className="font-display text-[30px] font-semibold leading-[1.14] tracking-[-0.025em] text-ink sm:text-[38px]">
              {post.title}
            </h1>

            <div className="prose-kaleida mt-6">
              {post.body.map((para, i) => (
                <motion.p
                  key={i}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  {para}
                </motion.p>
              ))}
            </div>

            {/* The image lives here, after the writing — never before it. */}
            {(post.art || post.photo) && (
              <motion.figure
                initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <div className="overflow-hidden rounded-2xl border border-line bg-canvas">
                  {post.photo
                    ? <img src={post.photo} alt={post.title} loading="lazy" className="block w-full" />
                    : post.art && <CoverArt art={post.art} />}
                </div>
                {(post.art?.caption) && (
                  <figcaption className="mt-2.5 text-center text-[12.5px] text-faint">{post.art.caption}</figcaption>
                )}
              </motion.figure>
            )}

            <div className="mt-7 flex flex-wrap gap-1.5">
              {post.topics.map((t) => <TopicChip key={t} topic={t} as="link" />)}
            </div>

            <div className="mt-6"><WhyThisPost post={post} relevance={relevance} /></div>

            {related.length > 0 && (
              <section className="mt-8 border-t border-line pt-6">
                <h2 className="label-xs mb-3">Keep reading</h2>
                <ul className="space-y-2">
                  {related.map((r) => {
                    const ra = userById(r.authorId)
                    return (
                      <li key={r.id}>
                        <Pressable
                          onClick={() => onOpenPost(r.id)}
                          className="flex w-full items-start gap-3 rounded-xl border border-line bg-canvas p-3 text-left transition-colors hover:bg-ink/[0.03]"
                        >
                          <Avatar user={ra} size={28} link={false} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[14.5px] font-semibold text-ink">{r.title}</span>
                            <span className="mt-0.5 block truncate text-[12.5px] text-muted">{excerpt(r.body, 70)}</span>
                          </span>
                        </Pressable>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </motion.div>
        </div>

        <footer className="flex shrink-0 items-center gap-1 border-t border-line bg-surface px-4 py-2.5 safe-bottom sm:px-6">
          <LikeButton post={post} />
          <CommentButton post={post} onOpen={() => setComments(true)} />
          <RepostButton post={post} />
          <Pressable onClick={() => setShare(true)} aria-label="Share"
            className="flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[12.5px] font-medium text-muted hover:text-ink">
            <Share2 size={15} />
          </Pressable>
          <span className="ml-auto"><SaveButton post={post} withLabel /></span>
        </footer>
      </motion.article>
      </div>

      <CommentSheet post={post} open={comments} onClose={() => setComments(false)} />
      <ShareSheet post={post} open={share} onClose={() => setShare(false)} />
      <PostMenu post={post} open={menu} onClose={() => setMenu(false)} />
    </>
  )
}

export function PostReaderLayer({ postId, onClose, onOpenPost }: { postId: string | null; onClose: () => void; onOpenPost: (id: string) => void }) {
  const { state } = useApp()
  const post = postId ? state.posts.find((p) => p.id === postId) : null
  return (
    <AnimatePresence>
      {post && <PostReader key={post.id} post={post} onClose={onClose} onOpenPost={onOpenPost} />}
    </AnimatePresence>
  )
}
