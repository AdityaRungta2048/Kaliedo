import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { FeedItem } from '@/lib/recommend'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { PostBlock } from '@/components/post/PostBlock'
import { Skeleton } from '@/components/ui/Primitives'

/**
 * Column-balanced masonry. Real DOM columns rather than CSS multi-column, so the
 * blocks can animate their layout when the feed recomposes.
 */
export function BlockGrid({
  items, openId, onOpen, transitionKey,
}: { items: FeedItem[]; openId: string | null; onOpen: (id: string) => void; transitionKey: string }) {
  const wide = useMediaQuery('(min-width: 1280px)')
  const medium = useMediaQuery('(min-width: 700px)')
  const columnCount = wide ? 3 : medium ? 2 : 1

  const columns = useMemo(() => {
    const cols: FeedItem[][] = Array.from({ length: columnCount }, () => [])
    items.forEach((item, i) => cols[i % columnCount].push(item))
    return cols
  }, [items, columnCount])

  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3.5 sm:gap-4"
    >
      {columns.map((col, ci) => (
        <div key={ci} className="flex min-w-0 flex-1 flex-col gap-3.5 sm:gap-4">
          {col.map((item, ri) => (
            <PostBlock
              key={item.post.id}
              post={item.post}
              relevance={item.relevance}
              expanded={openId === item.post.id}
              index={ri * columnCount + ci}
              onOpen={() => onOpen(item.post.id)}
            />
          ))}
        </div>
      ))}
    </motion.div>
  )
}

export function BlockGridSkeleton({ count = 6 }: { count?: number }) {
  const wide = useMediaQuery('(min-width: 1280px)')
  const medium = useMediaQuery('(min-width: 700px)')
  const columnCount = wide ? 3 : medium ? 2 : 1
  const cols: number[][] = Array.from({ length: columnCount }, () => [])
  Array.from({ length: count }).forEach((_, i) => cols[i % columnCount].push(i))

  return (
    <div className="flex items-start gap-3.5 sm:gap-4">
      {cols.map((col, ci) => (
        <div key={ci} className="flex min-w-0 flex-1 flex-col gap-3.5 sm:gap-4">
          {col.map((i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-[18px]">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-[30px] w-[30px] rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="mt-3.5 h-5 w-[92%]" />
              <Skeleton className="mt-2 h-5 w-[64%]" />
              <Skeleton className="mt-3.5 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-[80%]" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
