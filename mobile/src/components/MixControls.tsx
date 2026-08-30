import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { RotateCcw } from 'lucide-react-native'
import type { Mix } from '@/lib/shared/types'
import { rebalanceMix } from '@/lib/shared/recommend'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { Divider, Tap, Txt } from './UI'
import { Slider } from './Slider'

function Segment({ pct, color }: { pct: number; color: string }) {
  const w = useSharedValue(pct)
  w.value = withSpring(pct, { damping: 26, stiffness: 220 })
  const anim = useAnimatedStyle(() => ({ width: `${w.value}%` }))
  return <Animated.View style={[{ height: '100%', backgroundColor: color }, anim]} />
}

/** The whole recommendation philosophy, readable at a glance before any numbers. */
export function MixBar({ mix, height = 9 }: { mix: Mix; height?: number }) {
  const { c } = useTheme()
  return (
    <View style={{ flexDirection: 'row', height, borderRadius: 999, overflow: 'hidden', backgroundColor: c.line }}>
      <Segment pct={mix.familiar} color={c.ember} />
      <Segment pct={mix.related} color={c.moss} />
      <Segment pct={mix.explore} color={c.iris} />
    </View>
  )
}

export function MixControls() {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const mix = state.mix

  const rows = [
    { key: 'familiar' as const, label: 'Familiar', note: 'What you already read', color: c.ember },
    { key: 'related' as const, label: 'Related', note: 'One step sideways', color: c.moss },
    { key: 'explore' as const, label: 'New', note: 'Never asked for', color: c.iris },
  ]

  return (
    <View style={{ gap: 18 }}>
      <MixBar mix={mix} height={10} />

      <View style={{ gap: 14 }}>
        {rows.map((r) => (
          <View key={r.key}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r.color }} />
              <Txt size={14} weight="medium">{r.label}</Txt>
              <Txt size={12} color={c.faint} numberOfLines={1} style={{ flex: 1 }}>{r.note}</Txt>
              <Txt size={13} weight="semi">{mix[r.key]}%</Txt>
            </View>
            <Slider
              value={mix[r.key]} tint={r.color} accessibilityLabel={`${r.label} share`}
              onChange={(v) => dispatch({ type: 'patch', patch: { mix: rebalanceMix(mix, r.key, v) } })}
            />
          </View>
        ))}
      </View>

      <Divider />

      <View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 }}>
          <Txt size={14} weight="medium" style={{ flex: 1 }}>From people you follow</Txt>
          <Txt size={13} weight="semi">{state.socialFollowing}%</Txt>
        </View>
        <Txt size={12} color={c.faint} style={{ marginBottom: 2 }}>The rest comes from writers you have not met yet.</Txt>
        <Slider
          value={state.socialFollowing} tint={c.amber} accessibilityLabel="Share from accounts you follow"
          onChange={(v) => dispatch({ type: 'patch', patch: { socialFollowing: v } })}
        />
      </View>

      <Tap
        onPress={() => { dispatch({ type: 'patch', patch: { mix: { familiar: 60, related: 25, explore: 15 }, socialFollowing: 70 } }); toast('Mix reset to 60 / 25 / 15') }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}
      >
        <RotateCcw size={13} color={c.muted} />
        <Txt size={13} weight="medium" color={c.muted}>Reset to Kaleida's default</Txt>
      </Tap>
    </View>
  )
}
