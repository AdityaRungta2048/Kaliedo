import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import type { Mix } from '@/lib/types'
import { rebalanceMix } from '@/lib/recommend'
import { useApp } from '@/store/AppContext'
import { Slider } from '@/components/ui/Primitives'
import { cx } from '@/lib/utils'
import { T_BASE } from '@/lib/motion'

const ROWS: { key: keyof Mix; label: string; note: string; tint: 'ember' | 'moss' | 'iris'; bar: string }[] = [
  { key: 'familiar', label: 'Familiar', note: 'What you already read', tint: 'ember', bar: 'bg-ember' },
  { key: 'related', label: 'Related', note: 'One step sideways', tint: 'moss', bar: 'bg-moss' },
  { key: 'explore', label: 'New', note: 'Things you have never asked for', tint: 'iris', bar: 'bg-iris' },
]

/** A single stacked bar that reads at a glance, before any numbers are involved. */
export function MixBar({ mix, height = 8 }: { mix: Mix; height?: number }) {
  return (
    <div className="flex w-full overflow-hidden rounded-full bg-ink/[0.07]" style={{ height }}>
      {ROWS.map((r) => (
        <motion.div
          key={r.key} className={cx(r.bar, 'h-full')}
          animate={{ width: `${mix[r.key]}%` }}
          transition={T_BASE}
        />
      ))}
    </div>
  )
}

export function MixControls({ compactHeader = false }: { compactHeader?: boolean }) {
  const { state, dispatch, toast } = useApp()
  const mix = state.mix

  const set = (key: keyof Mix, value: number) =>
    dispatch({ type: 'patch', patch: { mix: rebalanceMix(mix, key, value) } })

  return (
    <div className="space-y-5">
      {!compactHeader && (
        <div>
          <h3 className="font-display text-[17px] font-semibold text-ink">Your Kaleido mix</h3>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
            How much of your feed should feel like home, and how much should surprise you. Drag it and watch the feed rebuild.
          </p>
        </div>
      )}

      <MixBar mix={mix} height={10} />

      <div className="space-y-4">
        {ROWS.map((r) => (
          <div key={r.key}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="flex items-baseline gap-2">
                <span className={cx('h-2 w-2 shrink-0 translate-y-[-1px] rounded-full', r.bar)} />
                <span className="text-[14px] font-medium text-ink">{r.label}</span>
                <span className="text-[12px] text-faint">{r.note}</span>
              </span>
              <motion.span key={mix[r.key]} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-[13px] font-semibold tabular-nums text-ink">
                {mix[r.key]}%
              </motion.span>
            </div>
            <Slider value={mix[r.key]} onChange={(v) => set(r.key, v)} label={`${r.label} share`} tint={r.tint} />
          </div>
        ))}
      </div>

      <div className="border-t border-line pt-4">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[14px] font-medium text-ink">From people you follow</span>
          <span className="text-[13px] font-semibold tabular-nums text-ink">{state.socialFollowing}%</span>
        </div>
        <p className="mb-1 text-[12px] text-faint">The rest comes from writers you have not met yet.</p>
        <Slider
          value={state.socialFollowing} label="Share from accounts you follow" tint="amber"
          onChange={(v) => dispatch({ type: 'patch', patch: { socialFollowing: v } })}
        />
      </div>

      <button
        onClick={() => { dispatch({ type: 'patch', patch: { mix: { familiar: 60, related: 25, explore: 15 }, socialFollowing: 70 } }); toast('Mix reset to 60 / 25 / 15') }}
        className="inline-flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-ink"
      >
        <RotateCcw size={13} /> Reset to Kaleido's default
      </button>
    </div>
  )
}
