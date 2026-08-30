import { useState } from 'react'
import { View } from 'react-native'
import { Check, Crosshair, Lock, Target } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { ONBOARDING_TOPICS } from '@/lib/shared/topics'
import { formatCooldown, nicheChangeState, suggestAlterEgoHandle } from '@/lib/shared/identity'
import type { Topic } from '@/lib/shared/types'
import { RADIUS } from '@/theme/tokens'
import { AvatarArt } from './Art'
import { Sheet } from './Sheets'
import { Button, Chip, Divider, Txt } from './UI'

/**
 * One alter ego, one niche. The cooldown is the point — an identity readers can
 * rely on — so the cost is stated before the choice, not after.
 */
export function FocusSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const ego = state.alterEgo
  const [picking, setPicking] = useState<Topic | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const cooldown = nicheChangeState(ego)

  const create = (niche: Topic) => {
    dispatch({
      type: 'createAlterEgo',
      ego: {
        handle: suggestAlterEgoHandle(niche), name: `${niche} only`, niche,
        createdAt: Date.now(), nicheChangedAt: null, avatarSeed: 400 + niche.length * 37,
      },
    })
    toast(`Focused on ${niche}`, 'check')
    setPicking(null); onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={ego ? 'Focused mode' : 'Create a focused identity'}>
      <View style={{ paddingHorizontal: 18, paddingBottom: 24, gap: 22 }}>
        {!ego ? (
          <>
            <View style={{
              flexDirection: 'row', gap: 11, padding: 14, borderRadius: RADIUS.lg,
              backgroundColor: c.canvas, borderWidth: 1, borderColor: c.line,
            }}>
              <Target size={16} color={c.ember} style={{ marginTop: 2 }} />
              <Txt size={13} color={c.muted} style={{ flex: 1, lineHeight: 20 }}>
                A second identity that reads one subject and nothing else. You get one, it carries its own name,
                and its feed is only the niche you pick.
              </Txt>
            </View>

            <View>
              <Txt family="display" size={16}>Pick your niche</Txt>
              <Txt size={12.5} color={c.muted} style={{ marginTop: 4, marginBottom: 12, lineHeight: 19 }}>
                You can change it once for free. After that, changing it waits a month — the constraint is what
                makes the identity worth following.
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ONBOARDING_TOPICS.map((t) => (
                  <Chip key={t} label={t} active={picking === t} onPress={() => setPicking(t)} />
                ))}
              </View>
            </View>

            <Button
              label={picking ? `Create “${picking} only”` : 'Pick a niche first'}
              variant="accent" size="lg" full disabled={!picking}
              onPress={() => picking && create(picking)}
            />
          </>
        ) : (
          <>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: RADIUS.lg,
              backgroundColor: c.canvas, borderWidth: 1, borderColor: c.line,
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden' }}>
                <AvatarArt seed={ego.avatarSeed} palette="iris" size={44} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt family="display" size={15.5} numberOfLines={1}>{ego.name}</Txt>
                <Txt size={12.5} color={c.muted} numberOfLines={1}>@{ego.handle} · reading only {ego.niche}</Txt>
              </View>
            </View>

            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Txt family="display" size={15.5}>Niche</Txt>
                {!cooldown.allowed && <Lock size={11} color={c.muted} />}
                <Txt size={12} weight="medium" color={cooldown.allowed ? c.moss : c.muted}>
                  {formatCooldown(cooldown)}
                </Txt>
              </View>

              {!cooldown.allowed && (
                <Txt size={12.5} color={c.muted} style={{
                  marginBottom: 12, lineHeight: 19, padding: 12, borderRadius: RADIUS.md,
                  backgroundColor: c.canvas, overflow: 'hidden',
                }}>
                  Locked until {new Date(cooldown.availableAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.
                  Readers followed this identity for one subject; it should not move under them.
                </Txt>
              )}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ONBOARDING_TOPICS.map((t) => {
                  const current = t === ego.niche
                  return (
                    <View key={t} style={{ opacity: !cooldown.allowed && !current ? 0.4 : 1 }}>
                      <Chip
                        label={current ? `✓ ${t}` : t} active={current}
                        onPress={cooldown.allowed && !current
                          ? () => { dispatch({ type: 'changeNiche', niche: t }); toast(`Focused on ${t}`, 'check') }
                          : undefined}
                      />
                    </View>
                  )
                })}
              </View>
            </View>

            <Divider />

            <View style={{ gap: 10 }}>
              <Button
                label={state.activeIdentity === 'alter' ? 'Leave focused mode' : `Read as ${ego.name}`}
                variant={state.activeIdentity === 'alter' ? 'outline' : 'primary'} full
                onPress={() => {
                  const next = state.activeIdentity === 'alter' ? 'main' : 'alter'
                  dispatch({ type: 'setIdentity', identity: next })
                  toast(next === 'alter' ? `Reading as ${ego.name}` : 'Back to your main feed')
                  onClose()
                }}
              />
              {confirmDiscard ? (
                <View style={{ gap: 10 }}>
                  <Txt size={12.5} color={c.muted} style={{ lineHeight: 19 }}>
                    Deleting the identity frees you to make a new one with any niche, immediately.
                  </Txt>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button label="Delete it" variant="accent" size="sm"
                      onPress={() => { dispatch({ type: 'discardAlterEgo' }); toast('Focused identity deleted'); setConfirmDiscard(false); onClose() }} />
                    <Button label="Keep it" variant="ghost" size="sm" onPress={() => setConfirmDiscard(false)} />
                  </View>
                </View>
              ) : (
                <Button label="Delete this identity" variant="ghost" size="sm" onPress={() => setConfirmDiscard(true)} />
              )}
            </View>
          </>
        )}
      </View>
    </Sheet>
  )
}

export { Crosshair }
