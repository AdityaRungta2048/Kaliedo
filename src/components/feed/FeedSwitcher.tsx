import { motion } from 'framer-motion'
import type { ExploreTab, FeedMode } from '@/lib/types'
import { cx } from '@/lib/utils'

export const FEED_MODES: { id: FeedMode; label: string; blurb: string }[] = [
  { id: 'for-you', label: 'For you', blurb: 'Composed from your mix' },
  { id: 'following', label: 'Following', blurb: 'Only people you follow' },
  { id: 'explore', label: 'Explore', blurb: 'Beyond the people you already read' },
  { id: 'unsigned', label: 'Unsigned', blurb: 'Written without a name' },
]

/** Explore's inner scope, the way Reels splits discovery from the people you follow. */
export const EXPLORE_TABS: { id: ExploreTab; label: string; blurb: string }[] = [
  { id: 'nearby', label: 'Next door', blurb: 'Writers you don’t follow, nearest interests first' },
  { id: 'following', label: 'Following', blurb: 'Discovery narrowed to people you read' },
]

export function FeedSwitcher({ mode, onChange }: { mode: FeedMode; onChange: (m: FeedMode) => void }) {
  return (
    <div role="tablist" aria-label="Feed mode" className="flex gap-1 overflow-x-auto no-scrollbar">
      {FEED_MODES.map((m) => {
        const active = m.id === mode
        return (
          <button
            key={m.id} role="tab" aria-selected={active} title={m.blurb}
            onClick={() => onChange(m.id)}
            className={cx(
              'relative shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors duration-200',
              active ? 'text-canvas' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId="feed-pill" className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
