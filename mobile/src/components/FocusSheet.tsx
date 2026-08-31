import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Check, ChevronRight, Crosshair, Lock, Plus, Target, Trash2 } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { ONBOARDING_TOPICS } from '@/lib/shared/topics'
import { formatCooldown, nicheChangeState, suggestAlterEgoHandle } from '@/lib/shared/identity'
import type { Topic } from '@/lib/shared/types'
import { RADIUS } from '@/theme/tokens'
import { AvatarArt } from './Art'
import { Sheet } from './Sheets'
import { Avatar, Button, Chip, Divider, Label, Tap, Txt } from './UI'

type View_ = 'switch' | 'create' | 'manage'

/**
 * The account switcher. One main profile, at most one alter ego locked to a
 * single subject. Switching to the alter ego narrows the whole feed to its niche.
 */
export function FocusSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, me, toast } = useApp()
  const { c } = useTheme()
  const ego = state.alterEgo
  const [view, setView] = useState<View_>('switch')
  const [picking, setPicking] = useState<Topic | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const cooldown = nicheChangeState(ego)
  const onAlter = state.activeIdentity === 'alter' && ego !== null

  const close = () => {
    onClose()
    setTimeout(() => { setView('switch'); setPicking(null); setConfirmDiscard(false) }, 250)
  }

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

  const row = { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 12, borderRadius: RADIUS.lg } as const

  return (
    <Sheet
      open={open} onClose={close}
      title={view === 'create' ? 'New alter ego' : view === 'manage' ? 'Alter ego' : 'Switch account'}
    >
      <View style={{ paddingHorizontal: 8, paddingBottom: 24 }}>
        {view === 'switch' && (
          <>
            <View style={{ paddingHorizontal: 12, paddingBottom: 8, paddingTop: 2 }}><Label>Accounts</Label></View>
            <Tap onPress={() => switchTo('main')} style={[row, { backgroundColor: !onAlter ? c.ink + '10' : 'transparent' }]}>
              <Avatar user={me} size={42} onPress={() => switchTo('main')} />
              <View style={{ flex: 1 }}>
                <Txt size={14.5} weight="semi" numberOfLines={1}>Main profile</Txt>
                <Txt size={12.5} color={c.muted} numberOfLines={1}>@{me.handle} · everything you follow</Txt>
              </View>
              {!onAlter && <Check size={17} color={c.ink} strokeWidth={2.6} />}
            </Tap>

            <View style={{ paddingHorizontal: 12, paddingBottom: 8, paddingTop: 18 }}><Label>Alter egos</Label></View>
            {ego ? (
              <>
                <Tap onPress={() => switchTo('alter')} style={[row, { backgroundColor: onAlter ? c.iris + '1A' : 'transparent' }]}>
                  <View style={{ width: 42, height: 42, borderRadius: 21, overflow: 'hidden' }}>
                    <AvatarArt seed={ego.avatarSeed} palette="iris" size={42} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt size={14.5} weight="semi" numberOfLines={1}>{ego.name}</Txt>
                    <Txt size={12.5} color={c.muted} numberOfLines={1}>Topic: {ego.niche}</Txt>
                  </View>
                  {onAlter && <Check size={17} color={c.iris} strokeWidth={2.6} />}
                </Tap>

                <Tap onPress={() => setView('manage')} style={[row, { paddingVertical: 10 }]}>
                  <Crosshair size={16} color={c.muted} style={{ marginLeft: 13 }} />
                  <Txt size={13.5} color={c.muted} style={{ flex: 1 }}>Manage niche</Txt>
                  <Txt size={12} color={cooldown.allowed ? c.moss : c.faint}>{formatCooldown(cooldown)}</Txt>
                  <ChevronRight size={15} color={c.faint} />
                </Tap>
              </>
            ) : (
              <Tap onPress={() => setView('create')} style={row}>
                <View style={{
                  width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.line,
                }}>
                  <Plus size={17} color={c.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={14.5} weight="semi">Create an alter ego</Txt>
                  <Txt size={12.5} color={c.muted}>One subject, nothing else in the feed</Txt>
                </View>
                <ChevronRight size={16} color={c.faint} />
              </Tap>
            )}

            <Txt size={12} color={c.faint} style={{ paddingHorizontal: 12, paddingTop: 18, lineHeight: 18 }}>
              You get one alter ego. Its feed carries its niche and nothing else — that is the whole point of it.
            </Txt>
          </>
        )}

        {view === 'create' && (
          <View style={{ paddingHorizontal: 10, gap: 18 }}>
            <View style={{
              flexDirection: 'row', gap: 11, padding: 14, borderRadius: RADIUS.lg,
              backgroundColor: c.canvas, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
            }}>
              <Target size={16} color={c.ember} style={{ marginTop: 2 }} />
              <Txt size={13} color={c.muted} style={{ flex: 1, lineHeight: 20 }}>
                Pick the one subject this identity reads. You can change it once for free — after that, changing it
                waits a month, because readers follow an alter ego for its subject.
              </Txt>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ONBOARDING_TOPICS.map((t) => (
                <Chip key={t} label={t} active={picking === t} onPress={() => setPicking(t)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                label={picking ? `Create “${picking} only”` : 'Pick a niche'}
                variant="accent" disabled={!picking} onPress={() => picking && create(picking)}
              />
              <Button label="Back" variant="ghost" onPress={() => setView('switch')} />
            </View>
          </View>
        )}

        {view === 'manage' && ego && (
          <View style={{ paddingHorizontal: 10, gap: 16 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: RADIUS.lg,
              backgroundColor: c.canvas, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden' }}>
                <AvatarArt seed={ego.avatarSeed} palette="iris" size={44} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt family="display" size={15.5} numberOfLines={1}>{ego.name}</Txt>
                <Txt size={12.5} color={c.muted} numberOfLines={1}>@{ego.handle} · Topic: {ego.niche}</Txt>
              </View>
            </View>

            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Txt family="display" size={15.5}>Niche</Txt>
                {!cooldown.allowed && <Lock size={11} color={c.muted} />}
                <Txt size={12} weight="medium" color={cooldown.allowed ? c.moss : c.muted}>{formatCooldown(cooldown)}</Txt>
              </View>

              {!cooldown.allowed && (
                <View style={{
                  marginBottom: 12, padding: 12, borderRadius: RADIUS.md, backgroundColor: c.canvas,
                  borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                }}>
                  <Txt size={12.5} color={c.muted} style={{ lineHeight: 19 }}>
                    Locked until {new Date(cooldown.availableAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.
                    Readers followed this identity for one subject; it should not move under them.
                  </Txt>
                </View>
              )}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ONBOARDING_TOPICS.map((t) => {
                  const current = t === ego.niche
                  return (
                    <View key={t} style={{ opacity: !cooldown.allowed && !current ? 0.4 : 1 }}>
                      <Chip
                        label={current ? `✓ ${t}` : t} active={current}
                        onPress={cooldown.allowed && !current
                          ? () => { dispatch({ type: 'changeNiche', niche: t }); toast(`Now reading ${t}`, 'check') }
                          : undefined}
                      />
                    </View>
                  )
                })}
              </View>
            </View>

            <Divider />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Button label="Back" variant="ghost" onPress={() => setView('switch')} />
              <View style={{ flex: 1 }} />
              {confirmDiscard ? (
                <>
                  <Button label="Delete" variant="accent" size="sm"
                    onPress={() => { dispatch({ type: 'discardAlterEgo' }); toast('Alter ego deleted'); close() }} />
                  <Button label="Cancel" variant="ghost" size="sm" onPress={() => setConfirmDiscard(false)} />
                </>
              ) : (
                <Button label="Delete alter ego" variant="ghost" size="sm"
                  icon={<Trash2 size={13} color={c.muted} />} onPress={() => setConfirmDiscard(true)} />
              )}
            </View>
          </View>
        )}
      </View>
    </Sheet>
  )
}
