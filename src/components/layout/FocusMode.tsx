import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Crosshair, Lock, Target, UserRound } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { ONBOARDING_TOPICS } from '@/lib/topics'
import { formatCooldown, nicheChangeState, suggestAlterEgoHandle } from '@/lib/identity'
import type { Topic } from '@/lib/types'
import { cx } from '@/lib/utils'
import { Sheet } from '@/components/ui/Overlay'
import { AvatarArt } from '@/components/brand/CoverArt'
import { Button, Pressable } from '@/components/ui/Primitives'

/**
 * Focused mode: one alter ego, one niche, nothing else in the feed. The cooldown
 * is the feature — an identity readers can rely on — so the interface explains
 * the cost before the choice, not after.
 */
export function FocusSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useApp()
  const ego = state.alterEgo
  const [picking, setPicking] = useState<Topic | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const cooldown = nicheChangeState(ego)

  const create = (niche: Topic) => {
    dispatch({
      type: 'createAlterEgo',
      ego: {
        handle: suggestAlterEgoHandle(niche),
        name: `${niche} only`,
        niche,
        createdAt: Date.now(),
        nicheChangedAt: null,
        avatarSeed: 400 + niche.length * 37,
      },
    })
    toast(`Focused on ${niche}`, 'check')
    setPicking(null)
    onClose()
  }

  const change = (niche: Topic) => {
    if (!cooldown.allowed) return
    dispatch({ type: 'changeNiche', niche })
    toast(`Focused on ${niche}`, 'check')
    setPicking(null)
  }

  return (
    <Sheet open={open} onClose={onClose} title={ego ? 'Focused mode' : 'Create a focused identity'} size="md">
      <div className="space-y-6 px-5 pb-8">
        {!ego ? (
          <>
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4">
              <Target size={16} className="mt-0.5 shrink-0 text-ember" />
              <p className="text-[13px] leading-relaxed text-muted">
                A second identity that reads one subject and nothing else. You get one, it carries its own name,
                and its feed is only the niche you pick.
              </p>
            </div>

            <div>
              <h3 className="mb-1 font-display text-[16px] font-semibold text-ink">Pick your niche</h3>
              <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
                You can change it once for free. After that, changing it waits a month — the constraint is what makes
                the identity worth following.
              </p>
              <div className="flex flex-wrap gap-2">
                {ONBOARDING_TOPICS.map((t) => (
                  <Pressable
                    key={t} onClick={() => setPicking(t)}
                    className={cx('chip px-3 py-1.5 text-[13px]', picking === t ? 'border-ink bg-ink text-canvas' : 'hover:text-ink')}
                  >
                    {picking === t && <Check size={12} strokeWidth={3} />} {t}
                  </Pressable>
                ))}
              </div>
            </div>

            <Button variant="accent" size="lg" disabled={!picking} onClick={() => picking && create(picking)}>
              Create {picking ? `“${picking} only”` : 'identity'}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-canvas p-4">
              <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                <AvatarArt seed={ego.avatarSeed} palette="iris" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[15.5px] font-semibold text-ink">{ego.name}</p>
                <p className="truncate text-[12.5px] text-muted">@{ego.handle} · reading only {ego.niche}</p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-display text-[15.5px] font-semibold text-ink">Niche</h3>
                <span className={cx('flex items-center gap-1.5 text-[12px] font-medium', cooldown.allowed ? 'text-moss' : 'text-muted')}>
                  {!cooldown.allowed && <Lock size={11} />}
                  {formatCooldown(cooldown)}
                </span>
              </div>

              {!cooldown.allowed && (
                <p className="mb-3 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[12.5px] leading-relaxed text-muted">
                  Your niche is locked until{' '}
                  <span className="font-medium text-ink">
                    {new Date(cooldown.availableAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                  </span>
                  . Readers followed this identity for one subject; it should not move under them.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {ONBOARDING_TOPICS.map((t) => {
                  const current = t === ego.niche
                  return (
                    <Pressable
                      key={t} onClick={() => cooldown.allowed && !current && change(t)}
                      disabled={!cooldown.allowed || current}
                      className={cx(
                        'chip px-3 py-1.5 text-[13px] transition-opacity',
                        current ? 'border-ember bg-ember/10 text-ember' : 'hover:text-ink',
                        !cooldown.allowed && !current && 'opacity-40',
                      )}
                    >
                      {current && <Check size={12} strokeWidth={3} />} {t}
                    </Pressable>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 border-t border-line pt-5">
              <Button
                variant={state.activeIdentity === 'alter' ? 'outline' : 'primary'}
                onClick={() => {
                  const next = state.activeIdentity === 'alter' ? 'main' : 'alter'
                  dispatch({ type: 'setIdentity', identity: next })
                  toast(next === 'alter' ? `Reading as ${ego.name}` : 'Back to your main feed')
                  onClose()
                }}
              >
                {state.activeIdentity === 'alter' ? 'Leave focused mode' : `Read as ${ego.name}`}
              </Button>

              <AnimatePresence mode="wait" initial={false}>
                {confirmDiscard ? (
                  <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                    <p className="text-[12.5px] leading-relaxed text-muted">
                      Deleting the identity frees you to make a new one with any niche, immediately.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="accent" onClick={() => { dispatch({ type: 'discardAlterEgo' }); toast('Focused identity deleted'); setConfirmDiscard(false); onClose() }}>
                        Delete it
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDiscard(false)}>Keep it</Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDiscard(true)}>Delete this identity</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}

/** The control that opens the sheet — shows which identity is currently reading. */
export function IdentityChip({ onOpen, collapsed = false }: { onOpen: () => void; collapsed?: boolean }) {
  const { state, me } = useApp()
  const focused = state.activeIdentity === 'alter' && state.alterEgo
  const ego = state.alterEgo

  return (
    <Pressable
      onClick={onOpen}
      title={focused ? `Focused on ${ego?.niche}` : 'Focused mode'}
      className={cx(
        'flex items-center rounded-xl text-[13.5px] font-medium transition-colors',
        collapsed ? 'h-10 w-10 justify-center' : 'h-10 gap-3.5 px-3.5',
        focused ? 'bg-iris/10 text-iris' : 'text-muted hover:bg-ink/[0.04] hover:text-ink',
      )}
    >
      {focused ? <Crosshair size={18} strokeWidth={2.1} /> : <UserRound size={18} strokeWidth={1.9} />}
      {!collapsed && (focused ? `Focused · ${ego?.niche}` : 'Focused mode')}
      {!collapsed && !focused && me && null}
    </Pressable>
  )
}
