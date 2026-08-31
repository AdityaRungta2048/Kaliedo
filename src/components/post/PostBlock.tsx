import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { EllipsisVertical, ImageIcon, Sparkles, VenetianMask } from 'lucide-react'
import type { Post, Relevance } from '@/lib/types'
import { displayAuthor, isAnonymous } from '@/lib/identity'
import { RELEVANCE_COPY } from '@/lib/recommend'
import { compact, cx, excerpt, readTime, timeAgo } from '@/lib/utils'
import { Avatar, Pressable, TopicChip, VerifiedMark } from '@/components/ui/Primitives'
import { LikeButton, SaveButton } from './Interactions'
import { PostMenu } from './PostMenu'

export const blockLayoutId = (id: string) => `block-${id}`

const RELEVANCE_TINT: Record<Relevance, string> = {
  familiar: 'text-ember',
  related: 'text-moss',
  explore: 'text-iris',
}

/**
 * The Kaleido block. Deliberately small: a name, a title, two lines of the
 * opening, and the shape of what is inside. Clicking expands it in place.
 */
function PostBlockBase({
  post, relevance, expanded, onOpen, index = 0,
}: {
  post: Post
  relevance?: Relevance
  expanded: boolean
  onOpen: () => void
  index?: number
}) {
  const anon = isAnonymous(post)
  const author = displayAuthor(post)
  const [menuOpen, setMenuOpen] = useState(false)
  const mins = readTime(post.body)

  return (
    <motion.article
      layoutId={expanded ? undefined : blockLayoutId(post.id)}
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: expanded ? 0 : 1, y: 0 }}
      transition={{
        opacity: { duration: 0.42, delay: Math.min(index * 0.035, 0.35), ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.42, delay: Math.min(index * 0.035, 0.35), ease: [0.22, 1, 0.36, 1] },
        layout: { type: 'spring', stiffness: 260, damping: 30 },
      }}
      style={{ borderRadius: 18 }}
      className={cx(
        'grain group relative cursor-pointer overflow-hidden border border-line bg-surface',
        'transition-shadow duration-300 hover:shadow-lift',
        expanded && 'pointer-events-none',
      )}
      onClick={onOpen}
      role="button" tabIndex={expanded ? -1 : 0}
      aria-label={`Open “${post.title}” by ${author.name}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
    >
      {/* A hairline of the post's own colour — the only chrome the block gets. */}
      <span className={cx('absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-ember transition-transform duration-500 group-hover:scale-x-100')} />

      <div className="p-4 sm:p-[18px]">
        <header className="flex items-center gap-2.5 pr-5">
          <Avatar user={author} size={30} link={!anon} />
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {anon ? (
              <span className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-ink">
                <VenetianMask size={13} className="shrink-0 text-muted" />
                {author.name}
              </span>
            ) : (
              <Link
                to={`/u/${author.handle}`} onClick={(e) => e.stopPropagation()}
                className="truncate text-[13.5px] font-semibold text-ink hover:underline"
              >
                {author.name}
              </Link>
            )}
            {!anon && author.verified && <VerifiedMark />}
            <span className="shrink-0 whitespace-nowrap text-[12.5px] text-faint">· {timeAgo(post.minutesAgo)}</span>
          </div>
          <Pressable
            onClick={(e) => { e.stopPropagation(); setMenuOpen(true) }}
            aria-label="Post options"
            className="absolute right-2.5 top-3 rounded-full p-1 text-faint opacity-0 transition-opacity hover:bg-ink/5 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
          >
            <EllipsisVertical size={15} />
          </Pressable>
        </header>

        <h3 className="mt-3 font-display text-[19px] font-semibold leading-[1.24] tracking-[-0.015em] text-ink sm:text-[20px]">
          {post.title}
        </h3>

        <p className="mt-2 font-read text-[14.5px] leading-[1.6] text-muted">
          {excerpt(post.body, 132)}
        </p>

        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {post.topics.slice(0, 2).map((t) => <TopicChip key={t} topic={t} size="sm" as="link" />)}
          <span className="ml-auto flex items-center gap-2 text-[11.5px] text-faint">
            {post.art && <ImageIcon size={12} aria-label="Includes an image" />}
            {mins} min
          </span>
        </div>

        {relevance && relevance !== 'familiar' && (
          <div className={cx('mt-3 flex items-center gap-1.5 text-[11.5px] font-medium', RELEVANCE_TINT[relevance])}>
            <Sparkles size={11} />
            {RELEVANCE_COPY[relevance].label}
          </div>
        )}
      </div>

      <footer className="flex items-center gap-1 border-t border-line px-3 py-2">
        <LikeButton post={post} />
        <span className="flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[12.5px] font-medium text-muted">
          {compact(post.comments.length)} replies
        </span>
        <span className="ml-auto"><SaveButton post={post} /></span>
      </footer>

      <PostMenu post={post} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </motion.article>
  )
}

export const PostBlock = memo(PostBlockBase)
