import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { ONBOARDING_TOPICS } from '@/lib/topics'
import { cx } from '@/lib/utils'
import { LogoMark } from '@/components/brand/Logo'
import { MixBar } from '@/components/feed/MixControls'
import { Button } from '@/components/ui/Primitives'

const EASE = [0.22, 1, 0.36, 1] as const

export function Onboarding() {
  const { state, dispatch, reducedMotion } = useApp()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n) }
  const finish = () => dispatch({ type: 'patch', patch: { onboarded: true } })

  const variants = {
    enter: (d: number) => (reducedMotion ? { opacity: 0 } : { opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => (reducedMotion ? { opacity: 0 } : { opacity: 0, x: d * -40 }),
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-canvas">
      {/* A slow kaleidoscope behind everything — the only ambient motion in the product. */}
      <motion.div
        aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-[0.09]"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 200 200"><g transform="translate(100 100)">
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d="M0 -90 L78 45 L-78 45 Z" transform={`rotate(${i * 60})`}
              className={i % 3 === 0 ? 'fill-ember' : i % 3 === 1 ? 'fill-moss' : 'fill-amber'} />
          ))}
        </g></svg>
      </motion.div>

      <header className="flex items-center justify-between px-6 pt-8 safe-top">
        <LogoMark size={30} animate />
        {step < 3 && (
          <button onClick={finish} className="text-[13.5px] font-medium text-muted transition-colors hover:text-ink">Skip</button>
        )}
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-[520px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.4, ease: EASE }}
            >
              {step === 0 && (
                <div>
                  <h1 className="font-display text-[38px] font-semibold leading-[1.06] tracking-[-0.035em] text-ink sm:text-[52px]">
                    Meet Kaleida.
                  </h1>
                  <p className="mt-5 max-w-[38ch] font-read text-[17px] leading-relaxed text-muted sm:text-[19px]">
                    A place for people who write. Posts arrive as small blocks — a name, a title, a line or two. Open one and it expands into the whole piece.
                  </p>
                  <p className="mt-4 max-w-[38ch] font-read text-[17px] leading-relaxed text-muted sm:text-[19px]">
                    No hashtag games. Kaleida reads for meaning and learns what you are actually curious about.
                  </p>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h1 className="font-display text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[42px]">
                    Tell us what you love
                  </h1>
                  <p className="mt-3 text-[15px] text-muted">Pick at least three. You can change them any time.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {ONBOARDING_TOPICS.map((t, i) => {
                      const active = state.interests.includes(t)
                      return (
                        <motion.button
                          key={t} onClick={() => dispatch({ type: 'toggleTopic', topic: t })}
                          initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.35), ease: EASE }}
                          whileTap={{ scale: 0.94 }}
                          className={cx('rounded-full border px-4 py-2 text-[14px] font-medium transition-colors duration-200',
                            active ? 'border-ink bg-ink text-canvas' : 'border-line text-muted hover:border-ink/40 hover:text-ink')}
                        >
                          {active && <Check size={12} className="mr-1.5 inline" strokeWidth={3} />}
                          {t}
                        </motion.button>
                      )
                    })}
                  </div>
                  <p className="mt-5 text-[13px] text-faint">{state.interests.length} selected</p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h1 className="font-display text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[42px]">
                    Discover beyond your bubble
                  </h1>
                  <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted">
                    Most feeds narrow over time. Kaleida holds a deliberate share open for things you did not ask for.
                  </p>
                  <div className="mt-7 rounded-2xl border border-line bg-surface p-5">
                    <MixBar mix={{ familiar: 60, related: 25, explore: 15 }} height={11} />
                    <ul className="mt-5 space-y-3.5">
                      {[
                        { pct: 60, label: 'Familiar', note: 'What you already read', dot: 'bg-ember' },
                        { pct: 25, label: 'Related', note: 'One step sideways', dot: 'bg-moss' },
                        { pct: 15, label: 'New', note: 'Things nobody predicted for you', dot: 'bg-iris' },
                      ].map((r, i) => (
                        <motion.li key={r.label}
                          initial={reducedMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.15 + i * 0.12, ease: EASE }}
                          className="flex items-baseline gap-3"
                        >
                          <span className={cx('h-2 w-2 shrink-0 translate-y-[-1px] rounded-full', r.dot)} />
                          <span className="w-11 font-display text-[17px] font-semibold tabular-nums text-ink">{r.pct}%</span>
                          <span>
                            <span className="block text-[14.5px] font-medium text-ink">{r.label}</span>
                            <span className="block text-[12.5px] text-muted">{r.note}</span>
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-4 text-[13px] text-faint">You can drag these any time, from the feed or from Settings.</p>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="mb-7 flex justify-center">
                    <LogoMark size={64} />
                  </motion.div>
                  <h1 className="font-display text-[34px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">
                    Your Kaleida is ready.
                  </h1>
                  <p className="mx-auto mt-4 max-w-[34ch] text-[15.5px] leading-relaxed text-muted">
                    Built around {state.interests.slice(0, 3).join(', ')}
                    {state.interests.length > 3 ? ` and ${state.interests.length - 3} more` : ''}.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="px-6 pb-10 safe-bottom">
        <div className="mx-auto flex w-full max-w-[520px] items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <button key={i} onClick={() => i <= step && go(i)} aria-label={`Step ${i + 1}`}
                className={cx('h-1.5 rounded-full transition-all duration-300', i === step ? 'w-6 bg-ink' : 'w-1.5 bg-ink/20')} />
            ))}
          </div>
          <span className="flex-1" />
          {step < 3 ? (
            <Button size="lg" onClick={() => go(step + 1)} disabled={step === 1 && state.interests.length < 3}>
              Continue <ArrowRight size={15} />
            </Button>
          ) : (
            <Button size="lg" variant="accent" onClick={finish}>Start reading <ArrowRight size={15} /></Button>
          )}
        </div>
      </footer>
    </div>
  )
}
