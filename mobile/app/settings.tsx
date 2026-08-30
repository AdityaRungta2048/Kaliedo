import { useState, type ReactNode } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import {
  ArrowLeft, Ban, Bell, EyeOff, Lock, LogOut, Monitor, Moon, Palette,
  ShieldCheck, SlidersHorizontal, Sun, Tags, User, Vibrate,
} from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { ONBOARDING_TOPICS } from '@/lib/shared/topics'
import type { ThemeChoice } from '@/lib/shared/types'
import { RADIUS } from '@/theme/tokens'
import { MixControls } from '@/components/MixControls'
import { Sheet } from '@/components/Sheets'
import { Button, Chip, Divider, Switch, Tap, Txt } from '@/components/UI'

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  const { c } = useTheme()
  return (
    <View style={{
      borderRadius: RADIUS.lg, backgroundColor: c.surface, overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
    }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line,
      }}>
        {icon}
        <Txt size={11.5} weight="semi" color={c.faint} style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>{title}</Txt>
      </View>
      {children}
    </View>
  )
}

function Row({ label, hint, control, onPress }: { label: string; hint?: string; control?: ReactNode; onPress?: () => void }) {
  const { c } = useTheme()
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ flex: 1 }}>
        <Txt size={14.5} weight="medium">{label}</Txt>
        {hint ? <Txt size={12.5} color={c.muted} style={{ marginTop: 2, lineHeight: 18 }}>{hint}</Txt> : null}
      </View>
      {control}
    </View>
  )
  return onPress ? <Tap onPress={onPress}>{body}</Tap> : body
}

function TextRow({ label, value, onChange, prefix, editable = true }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; editable?: boolean }) {
  const { c } = useTheme()
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Txt size={12.5} weight="medium" color={c.muted}>{label}</Txt>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingHorizontal: 12,
        borderRadius: RADIUS.md, backgroundColor: c.canvas,
        borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
      }}>
        {prefix ? <Txt size={14.5} color={c.faint}>{prefix}</Txt> : null}
        <TextInput value={value} onChangeText={onChange} editable={editable} accessibilityLabel={label}
          style={{ flex: 1, height: 42, color: editable ? c.ink : c.faint, fontSize: 14.5 }} />
      </View>
    </View>
  )
}

const THEMES: { id: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
]

export default function Settings() {
  const { state, dispatch, me, toast } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [blocked, setBlocked] = useState(false)
  const [notInterested, setNotInterested] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingBottom: 4 }}>
        <Tap onPress={() => router.back()} accessibilityLabel="Back" style={{ padding: 10 }}>
          <ArrowLeft size={21} color={c.muted} />
        </Tap>
        <Txt family="display" size={22}>Settings</Txt>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Section title="Account" icon={<User size={15} color={c.muted} />}>
          <TextRow label="Display name" value={state.displayName} onChange={(v) => dispatch({ type: 'patch', patch: { displayName: v } })} />
          <TextRow label="Username" value={me.handle} prefix="@" editable={false} onChange={() => {}} />
          <TextRow label="Bio" value={state.bio} onChange={(v) => dispatch({ type: 'patch', patch: { bio: v } })} />
          <Row label="Email" hint="you@kaleida.app" control={<Button label="Change" variant="ghost" size="sm" onPress={() => toast('Verification email sent')} />} />
        </Section>

        <Section title="Privacy" icon={<Lock size={15} color={c.muted} />}>
          <Row label="Private account" hint="Only approved readers see your writing."
            control={<Switch value={state.privateAccount} onChange={(v) => { dispatch({ type: 'patch', patch: { privateAccount: v } }); toast(v ? 'Account is private' : 'Account is public') }} />} />
          <Row label="Show activity status" hint="Lets people see when you were last reading."
            control={<Switch value={state.activityStatus} onChange={(v) => dispatch({ type: 'patch', patch: { activityStatus: v } })} />} />
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Txt size={14.5} weight="medium">Who can message you</Txt>
            <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
              {(['everyone', 'following', 'nobody'] as const).map((v) => (
                <Chip key={v} label={v === 'following' ? 'People I follow' : v[0].toUpperCase() + v.slice(1)}
                  active={state.messagePermission === v}
                  onPress={() => dispatch({ type: 'patch', patch: { messagePermission: v } })} />
              ))}
            </View>
          </View>
          <Row label="Blocked accounts" hint="Nobody blocked yet." onPress={() => setBlocked(true)} control={<Ban size={16} color={c.faint} />} />
        </Section>

        <Section title="Content" icon={<Tags size={15} color={c.muted} />}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <Txt size={14.5} weight="medium">Your interests</Txt>
            <Txt size={12.5} color={c.muted} style={{ marginTop: 2 }}>These shape what Kaleida calls familiar.</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
              {ONBOARDING_TOPICS.map((t) => (
                <Chip key={t} label={t} active={state.interests.includes(t)} onPress={() => dispatch({ type: 'toggleTopic', topic: t })} />
              ))}
            </View>
          </View>
          <Row label="Not interested"
            hint={state.mutedTopics.length ? `${state.mutedTopics.length} topic${state.mutedTopics.length === 1 ? '' : 's'} muted` : 'Nothing muted yet.'}
            onPress={() => setNotInterested(true)} control={<EyeOff size={16} color={c.faint} />} />
          <Row label="Sensitive content" hint="Blur anything flagged before it reaches your feed."
            control={<Switch value={state.sensitiveFilter} onChange={(v) => dispatch({ type: 'patch', patch: { sensitiveFilter: v } })} />} />
        </Section>

        <Section title="Recommendations" icon={<SlidersHorizontal size={15} color={c.muted} />}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 18 }}>
            <MixControls />
          </View>
        </Section>

        <Section title="Appearance" icon={<Palette size={15} color={c.muted} />}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <Txt size={14.5} weight="medium">Theme</Txt>
            <Txt size={12.5} color={c.muted} style={{ marginTop: 2, marginBottom: 12 }}>Both themes are designed separately. Try them.</Txt>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {THEMES.map(({ id, label, Icon }) => {
                const active = state.theme === id
                return (
                  <Tap key={id} onPress={() => dispatch({ type: 'patch', patch: { theme: id } })} scaleTo={0.94}
                    accessibilityRole="radio" accessibilityState={{ selected: active }}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1, justifyContent: 'center',
                      paddingVertical: 11, borderRadius: RADIUS.md,
                      backgroundColor: active ? c.ink : 'transparent',
                      borderWidth: StyleSheet.hairlineWidth * 2, borderColor: active ? c.ink : c.line,
                    }}>
                    <Icon size={15} color={active ? c.onInk : c.muted} />
                    <Txt size={13} weight="medium" color={active ? c.onInk : c.muted}>{label}</Txt>
                  </Tap>
                )
              })}
            </View>
          </View>
          <Divider />
          <Row label="Haptics" hint="Small physical feedback on taps and likes."
            control={<Switch value={state.hapticsEnabled} onChange={(v) => dispatch({ type: 'patch', patch: { hapticsEnabled: v } })} />} />
        </Section>

        <Section title="Notifications" icon={<Bell size={15} color={c.muted} />}>
          {[['Replies to your writing', true], ['New followers', true], ['Mentions', true], ['Trending in your topics', false]].map(([label, def]) => (
            <Row key={String(label)} label={String(label)} control={<NotifSwitch initial={Boolean(def)} />} />
          ))}
        </Section>

        <Section title="About" icon={<ShieldCheck size={15} color={c.muted} />}>
          <Row label="Replay onboarding" onPress={() => dispatch({ type: 'patch', patch: { onboarded: false } })} control={<Vibrate size={16} color={c.faint} />} />
          <Row label="Reset prototype" hint="Clears likes, saves, follows and drafts."
            onPress={() => { dispatch({ type: 'reset' }); toast('Prototype reset') }} control={<LogOut size={16} color={c.faint} />} />
        </Section>

        <Txt size={12} color={c.faint} center style={{ marginTop: 4 }}>
          Kaleida · visual prototype · all data is local to this device
        </Txt>
      </ScrollView>

      <Sheet open={blocked} onClose={() => setBlocked(false)} title="Blocked accounts">
        <View style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
          <Txt size={14} color={c.muted} center>You have not blocked anyone.</Txt>
          <Txt size={12.5} color={c.faint} center style={{ marginTop: 6 }}>
            Blocked writers never appear in your feed, search, or messages.
          </Txt>
        </View>
      </Sheet>

      <Sheet open={notInterested} onClose={() => setNotInterested(false)} title="Not interested">
        <View style={{ paddingHorizontal: 18, paddingBottom: 24 }}>
          <Txt size={13.5} color={c.muted} style={{ marginBottom: 14 }}>Muted topics are removed from every feed. Tap to unmute.</Txt>
          {state.mutedTopics.length === 0 ? (
            <Txt size={13.5} color={c.faint} center style={{ paddingVertical: 28 }}>
              Nothing muted. Use “Show less” on any topic.
            </Txt>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {state.mutedTopics.map((t) => (
                <Chip key={t} label={t} active onPress={() => dispatch({ type: 'toggleMuteTopic', topic: t })} />
              ))}
            </View>
          )}
        </View>
      </Sheet>
    </View>
  )
}

function NotifSwitch({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial)
  return <Switch value={on} onChange={setOn} />
}
