import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, Crosshair, Lock, Plus, Target, Trash2 } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { ONBOARDING_TOPICS } from '@/lib/topics'
import { formatCooldown, nicheChangeState, suggestAlterEgoHandle } from '@/lib/identity'
import type { Topic } from '@/lib/types'
import { cx } from '@/lib/utils'
import { Sheet } from '@/components/ui/Overlay'
import { AvatarArt } from '@/components/brand/CoverArt'
import { Avatar, Button, Pressable } from '@/components/ui/Primitives'

type View = 'switch' | 'create' | 'manage'

/**
 * The account switcher. One main profile, at most one alter ego, and the alter
 * ego is locked to a single subject — switching to it narrows the whole feed to
 * that niche. Changing the niche is deliberately expensive after the first time,
 * so the cost is stated on the row itself rather than discovered later.
 */
export function FocusSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, me, toast } = useApp()
  const ego = state.alterEgo
  const [view, setView] = useState<View>('switch')
  const [picking, setPicking] = useState<Topic | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const cooldown = nicheChangeState(ego)
  const onAlter = state.activeIdentity === 'alter' && ego !== null

  const close = () => { onClose(); setTimeout(() => { setView('switch'); setPicking(null); setConfirmDiscard(false) }, 250) }

  const create = (niche: Topic) => {
    dispatch({
      type: 'createAlterEgo',
      ego: {
        handle: suggestAlterEgoHandle(niche), name: `${niche} only`, niche,
        createdAt: Date.now(), nicheChangedAt: null, avatarSeed: 400 + niche.length * 37,
      },
    })
    toast(`Switched to ${niche} only`, 'check')
    close()
  }

  const switchTo = (identity: 'main' | 'alter') => {
    dispatch({ type: 'setIdentity', identity })
    toast(identity === 'alter' ? `Reading as ${ego?.name}` : 'Back to your main profile')
    close()
  }

  return (
    <Sheet open={open} onClose={close} title={view === 'create' ? 'New alter ego' : view === 'manage' ? 'Alter ego' : 'Switch account'} size="md">
      <div className="px-3 pb-7">
        <AnimatePresence mode="wait" initial={false}>
          {view === 'switch' && (
            <motion.div key="switch" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
              <p className="label-xs px-3 pb-2 pt-1">Accounts</p>
              <Pressable
                onClick={() => switchTo('main')}
                className={cx('flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
                  !onAlter ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.03]')}
              >
                <Avatar user={me} size={42} link={false} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold text-ink">Main profile</span>
                  <span className="block truncate text-[12.5px] text-muted">@{me.handle} · everything you follow</span>
                </span>
                {!onAlter && <Check size={17} className="shrink-0 text-ink" strokeWidth={2.6} />}
              </Pressable>

              <p className="label-xs px-3 pb-2 pt-5">Alter egos</p>
              {ego ? (
                <>
                  <Pressable
                    onClick={() => switchTo('alter')}
                    className={cx('flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
                      onAlter ? 'bg-iris/10' : 'hover:bg-ink/[0.03]')}
                  >
                    <span className="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-full">
                      <AvatarArt seed={ego.avatarSeed} palette="iris" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold text-ink">{ego.name}</span>
                      <span className="block truncate text-[12.5px] text-muted">Topic: {ego.niche}</span>
                    </span>
                    {onAlter && <Check size={17} className="shrink-0 text-iris" strokeWidth={2.6} />}
                  </Pressable>

                  <Pressable
                    onClick={() => setView('manage')}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[13.5px] text-muted transition-colors hover:bg-ink/[0.03] hover:text-ink"
                  >
                    <Crosshair size={16} className="ml-[13px]" />
                    <span className="flex-1">Manage niche</span>
                    <span className={cx('text-[12px]', cooldown.allowed ? 'text-moss' : 'text-faint')}>{formatCooldown(cooldown)}</span>
                    <ChevronRight size={15} className="text-faint" />
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onClick={() => setView('create')}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-ink/[0.03]"
                >
                  <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-dashed border-line text-muted">
                    <Plus size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold text-ink">Create an alter ego</span>
                    <span className="block text-[12.5px] text-muted">One subject, nothing else in the feed</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-faint" />
                </Pressable>
              )}

              <p className="px-3 pt-5 text-[12px] leading-relaxed text-faint">
                You get one alter ego. Its feed carries its niche and nothing else — that is the whole point of it.
              </p>
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }} className="px-2">
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4">
                <Target size={16} className="mt-0.5 shrink-0 text-ember" />
                <p className="text-[13px] leading-relaxed text-muted">
                  Pick the one subject this identity reads. You can change it once for free — after that, changing it
                  waits a month, because readers follow an alter ego for its subject.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ONBOARDING_TOPICS.map((t) => (
                  <Pressable key={t} onClick={() => setPicking(t)}
                    className={cx('chip px-3 py-1.5 text-[13px]', picking === t ? 'border-ink bg-ink text-canvas' : 'hover:text-ink')}>
                    {picking === t && <Check size={12} strokeWidth={3} />} {t}
                  </Pressable>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="accent" disabled={!picking} onClick={() => picking && create(picking)}>
                  Create {picking ? `“${picking} only”` : 'alter ego'}
                </Button>
                <Button variant="ghost" onClick={() => setView('switch')}>Back</Button>
              </div>
            </motion.div>
          )}

          {view === 'manage' && ego && (
            <motion.div key="manage" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }} className="px-2">
              <div className="mb-4 flex items-center gap-3.5 rounded-2xl border border-line bg-canvas p-4">
                <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                  <AvatarArt seed={ego.avatarSeed} palette="iris" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15.5px] font-semibold text-ink">{ego.name}</p>
                  <p className="truncate text-[12.5px] text-muted">@{ego.handle} · Topic: {ego.niche}</p>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-display text-[15.5px] font-semibold text-ink">Niche</h3>
                <span className={cx('flex items-center gap-1.5 text-[12px] font-medium', cooldown.allowed ? 'text-moss' : 'text-muted')}>
                  {!cooldown.allowed && <Lock size={11} />}
                  {formatCooldown(cooldown)}
                </span>
              </div>

              {!cooldown.allowed && (
                <p className="mb-3 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[12.5px] leading-relaxed text-muted">
                  Locked until{' '}
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
                      key={t} disabled={!cooldown.allowed || current}
                      onClick={() => { dispatch({ type: 'changeNiche', niche: t }); toast(`Now reading ${t}`, 'check') }}
                      className={cx('chip px-3 py-1.5 text-[13px] transition-opacity',
                        current ? 'border-ember bg-ember/10 text-ember' : 'hover:text-ink',
                        !cooldown.allowed && !current && 'opacity-40')}
                    >
                      {current && <Check size={12} strokeWidth={3} />} {t}
                    </Pressable>
                  )
                })}
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-line pt-5">
                <Button variant="ghost" onClick={() => setView('switch')}>Back</Button>
                <span className="flex-1" />
                <AnimatePresence mode="wait" initial={false}>
                  {confirmDiscard ? (
                    <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Button size="sm" variant="accent" onClick={() => { dispatch({ type: 'discardAlterEgo' }); toast('Alter ego deleted'); close() }}>
                        Delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDiscard(false)}>Cancel</Button>
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDiscard(true)}>
                        <Trash2 size={13} /> Delete alter ego
                      </Button>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Sheet>
  )
}

/** Sidebar control: shows which account is currently reading. */
export function IdentityChip({ onOpen, collapsed = false }: { onOpen: () => void; collapsed?: boolean }) {
  const { state, me } = useApp()
  const ego = state.alterEgo
  const onAlter = state.activeIdentity === 'alter' && ego

  return (
    <Pressable
      onClick={onOpen}
      title={onAlter ? `${ego!.name} · Topic: ${ego!.niche}` : 'Switch account'}
      className={cx('flex items-center rounded-xl text-[13.5px] font-medium transition-colors',
        collapsed ? 'h-10 w-10 justify-center' : 'h-11 gap-2.5 px-2',
        onAlter ? 'bg-iris/10 text-iris' : 'text-muted hover:bg-ink/[0.04] hover:text-ink')}
    >
      {onAlter ? (
        <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
          <AvatarArt seed={ego!.avatarSeed} palette="iris" />
        </span>
      ) : (
        <Avatar user={me} size={28} link={false} />
      )}
      {!collapsed && (
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {onAlter ? ego!.name : 'Main profile'}
          </span>
          <span className="block truncate text-[11.5px] text-muted">
            {onAlter ? `Topic: ${ego!.niche}` : 'Switch account'}
          </span>
        </span>
      )}
      {!collapsed && <ChevronRight size={15} className="shrink-0 text-faint" />}
    </Pressable>
  )
}
