import { useState } from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useTheme } from '@/theme/ThemeProvider'
import { SPRING_SNAPPY } from '@/theme/tokens'

const KNOB = 22

/** A drag-anywhere slider. Reanimated drives the track on the UI thread. */
export function Slider({
  value, onChange, tint, accessibilityLabel,
}: { value: number; onChange: (v: number) => void; tint: string; accessibilityLabel: string }) {
  const { c } = useTheme()
  const [width, setWidth] = useState(0)
  const dragging = useSharedValue(0)
  const local = useSharedValue(value)
  local.value = value

  const commit = (v: number) => onChange(Math.max(0, Math.min(100, Math.round(v))))

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      dragging.value = withSpring(1, SPRING_SNAPPY)
      if (width > 0) runOnJS(commit)((e.x / width) * 100)
    })
    .onUpdate((e) => { if (width > 0) runOnJS(commit)((e.x / width) * 100) })
    .onFinalize(() => { dragging.value = withSpring(0, SPRING_SNAPPY) })

  const fill = useAnimatedStyle(() => ({ width: `${local.value}%` }))
  const knob = useAnimatedStyle(() => ({
    left: Math.max(0, Math.min(width - KNOB, (local.value / 100) * width - KNOB / 2)),
    transform: [{ scale: 1 + dragging.value * 0.15 }],
  }))

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={{ height: 34, justifyContent: 'center' }}
      >
        <View style={{ height: 7, borderRadius: 999, backgroundColor: c.line, overflow: 'hidden' }}>
          <Animated.View style={[{ height: '100%', borderRadius: 999, backgroundColor: tint }, fill]} />
        </View>
        <Animated.View
          style={[{
            position: 'absolute', width: KNOB, height: KNOB, borderRadius: 999,
            backgroundColor: c.ink, borderWidth: 3, borderColor: c.canvas,
          }, knob]}
        />
      </View>
    </GestureDetector>
  )
}
