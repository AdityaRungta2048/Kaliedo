import { Sparkles } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { Sheet } from '@/components/ui/Overlay'
import { MixControls } from '@/components/feed/MixControls'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { FEED_MODES } from '@/components/feed/FeedSwitcher'
import { Button, Pressable } from '@/components/ui/Primitives'
import { ONBOARDING_TOPICS } from '@/lib/topics'
import { cx } from '@/lib/utils'

/**
 * Demo mode: every dial that shapes the experience, in one place, for showing
 * Kaleido to someone across a table. Opened with the sidebar button or ⌘K / Ctrl+K.
 */
export function DemoMode() {
  const { demoOpen, setDemoOpen, state, dispatch, toast } = useApp()

  return (
    <Sheet open={demoOpen} onClose={() => setDemoOpen(false)} title="Demo mode" size="lg">
      <div className="space-y-7 px-5 pb-8">
        <p className="flex items-start gap-2.5 rounded-2xl border border-line bg-canvas p-3.5 text-[13px] leading-relaxed text-muted">
          <Sparkles size={15} className="mt-0.5 shrink-0 text-ember" />
          Everything here is live. Change a dial and the feed behind this panel recomposes — useful when you are explaining Kaleido to someone.
        </p>

        <section>
          <h3 className="label-xs mb-3">Recommendation mix</h3>
          <MixControls compactHeader />
        </section>

        <section>
          <h3 className="label-xs mb-3">Feed mode</h3>
          <div className="flex flex-wrap gap-2">
            {FEED_MODES.map((m) => (
              <Pressable key={m.id} onClick={() => dispatch({ type: 'setMode', mode: m.id })}
                className={cx('chip px-3 py-1.5 text-[13px]', state.feedMode === m.id ? 'border-ink bg-ink text-canvas' : 'hover:text-ink')}>
                {m.label}
              </Pressable>
            ))}
          </div>
        </section>

        <section>
          <h3 className="label-xs mb-3">Interests driving the feed</h3>
          <div className="flex flex-wrap gap-1.5">
            {ONBOARDING_TOPICS.map((t) => (
              <Pressable key={t} onClick={() => dispatch({ type: 'toggleTopic', topic: t })}
                className={cx('chip', state.interests.includes(t) ? 'border-ember bg-ember/10 text-ember' : 'hover:text-ink')}>
                {t}
              </Pressable>
            ))}
          </div>
        </section>

        <section>
          <h3 className="label-xs mb-3">Appearance</h3>
          <ThemeSwitcher withLabels />
        </section>

        <section className="flex flex-wrap gap-2 border-t border-line pt-5">
          <Button variant="outline" onClick={() => { dispatch({ type: 'refresh' }); toast('Feed reshuffled') }}>
            Reshuffle feed
          </Button>
          <Button variant="outline" onClick={() => { dispatch({ type: 'patch', patch: { onboarded: false } }); setDemoOpen(false) }}>
            Replay onboarding
          </Button>
          <Button variant="ghost" onClick={() => { dispatch({ type: 'reset' }); toast('Prototype reset'); setDemoOpen(false) }}>
            Reset everything
          </Button>
        </section>
      </div>
    </Sheet>
  )
}
