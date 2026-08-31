import { View } from 'react-native'
import { Sparkles } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { ONBOARDING_TOPICS } from '@/lib/shared/topics'
import type { FeedMode } from '@/lib/shared/types'
import { RADIUS } from '@/theme/tokens'
import { MixControls } from './MixControls'
import { Sheet } from './Sheets'
import { Button, Chip, Divider, Label, Txt } from './UI'

const MODES: { id: FeedMode; label: string }[] = [
  { id: 'for-you', label: 'For you' },
  { id: 'explore', label: 'Explore' },
]

const THEMES = ['light', 'dark', 'system'] as const

/**
 * Every dial that shapes the experience, in one place, for showing Kaleido to
 * someone across a table. Mirrors the panel the web app opens with ⌘K.
 */
export function DemoMode({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()

  return (
    <Sheet open={open} onClose={onClose} title="Demo mode">
      <View style={{ paddingHorizontal: 18, paddingBottom: 28, gap: 24 }}>
        <View style={{
          flexDirection: 'row', gap: 11, padding: 14, borderRadius: RADIUS.lg,
          backgroundColor: c.canvas, borderWidth: 1, borderColor: c.line,
        }}>
          <Sparkles size={15} color={c.ember} style={{ marginTop: 2 }} />
          <Txt size={13} color={c.muted} style={{ flex: 1, lineHeight: 20 }}>
            Everything here is live. Change a dial and the feed behind this panel recomposes.
          </Txt>
        </View>

        <View>
          <Label>Recommendation mix</Label>
          <View style={{ marginTop: 12 }}><MixControls /></View>
        </View>

        <Divider />

        <View>
          <Label>Feed</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {MODES.map((m) => (
              <Chip
                key={m.id} label={m.label} active={state.feedMode === m.id}
                onPress={() => dispatch({ type: 'setMode', mode: m.id })}
              />
            ))}
          </View>
        </View>

        <View>
          <Label>Interests driving the feed</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
            {ONBOARDING_TOPICS.map((t) => (
              <Chip
                key={t} label={t} active={state.interests.includes(t)}
                onPress={() => dispatch({ type: 'toggleTopic', topic: t })}
              />
            ))}
          </View>
        </View>

        <View>
          <Label>Appearance</Label>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {THEMES.map((t) => (
              <Chip
                key={t} label={t[0].toUpperCase() + t.slice(1)} active={state.theme === t}
                onPress={() => dispatch({ type: 'patch', patch: { theme: t } })}
              />
            ))}
          </View>
        </View>

        <Divider />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Button label="Reshuffle feed" variant="outline"
            onPress={() => { dispatch({ type: 'refresh' }); toast('Feed reshuffled') }} />
          <Button label="Replay onboarding" variant="outline"
            onPress={() => { dispatch({ type: 'patch', patch: { onboarded: false } }); onClose() }} />
          <Button label="Reset everything" variant="ghost"
            onPress={() => { dispatch({ type: 'reset' }); toast('Prototype reset'); onClose() }} />
        </View>
      </View>
    </Sheet>
  )
}
