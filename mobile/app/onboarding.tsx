import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeIn, FadeInDown, SlideInRight, SlideOutLeft,
  useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing,
} from 'react-native-reanimated'
import Svg, { G, Path } from 'react-native-svg'
import { ArrowRight, Check } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { ONBOARDING_TOPICS } from '@/lib/shared/topics'
import { RADIUS } from '@/theme/tokens'
import { MixBar } from '@/components/MixControls'
import { LogoMark } from '@/components/Art'
import { Button, Tap, Txt } from '@/components/UI'

/** The only ambient motion in the product: a very slow kaleidoscope turn. */
function Backdrop() {
  const r = useSharedValue(0)
  r.value = withRepeat(withTiming(360, { duration: 90000, easing: Easing.linear }), -1, false)
  const anim = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }))
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', right: -110, top: -110, opacity: 0.09 }, anim]}>
      <Svg width={380} height={380} viewBox="0 0 200 200">
        <G transform="translate(100 100)">
          {Array.from({ length: 6 }, (_, i) => (
            <Path key={i} d="M0 -90 L78 45 L-78 45 Z" transform={`rotate(${i * 60})`}
              fill={i % 3 === 0 ? '#D14A28' : i % 3 === 1 ? '#2F7D6B' : '#BE8A20'} />
          ))}
        </G>
      </Svg>
    </Animated.View>
  )
}

export default function Onboarding() {
  const { state, dispatch } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState(0)

  const finish = () => dispatch({ type: 'patch', patch: { onboarded: true } })

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <Backdrop />

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 14 }}>
        <LogoMark size={30} colors={{ ink: c.ink }} />
        <View style={{ flex: 1 }} />
        {step < 3 && (
          <Tap onPress={finish} style={{ padding: 8 }}>
            <Txt size={13.5} weight="medium" color={c.muted}>Skip</Txt>
          </Tap>
        )}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 24 }} showsVerticalScrollIndicator={false}>
        <Animated.View key={step} entering={SlideInRight.duration(340)} exiting={SlideOutLeft.duration(200)}>
          {step === 0 && (
            <View>
              <Txt family="display" size={40} style={{ lineHeight: 45, letterSpacing: -1.2 }}>Meet Kaleido.</Txt>
              <Txt family="read" size={18} color={c.muted} style={{ marginTop: 22, lineHeight: 29 }}>
                A place for people who write. Posts arrive as small blocks — a name, a title, a line or two. Tap one and it expands into the whole piece.
              </Txt>
              <Txt family="read" size={18} color={c.muted} style={{ marginTop: 16, lineHeight: 29 }}>
                No hashtag games. Kaleido reads for meaning and learns what you are actually curious about.
              </Txt>
            </View>
          )}

          {step === 1 && (
            <View>
              <Txt family="display" size={32} style={{ lineHeight: 38, letterSpacing: -0.9 }}>Tell us what you love</Txt>
              <Txt size={15} color={c.muted} style={{ marginTop: 10 }}>Pick at least three. You can change them any time.</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 24 }}>
                {ONBOARDING_TOPICS.map((t, i) => {
                  const active = state.interests.includes(t)
                  return (
                    <Animated.View key={t} entering={FadeInDown.duration(300).delay(Math.min(i * 28, 340))}>
                      <Tap onPress={() => dispatch({ type: 'toggleTopic', topic: t })} scaleTo={0.93}
                        accessibilityState={{ selected: active }}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 6,
                          paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
                          backgroundColor: active ? c.ink : 'transparent',
                          borderWidth: 1.4, borderColor: active ? c.ink : c.line,
                        }}>
                        {active && <Check size={12} color={c.onInk} strokeWidth={3} />}
                        <Txt size={14} weight="medium" color={active ? c.onInk : c.muted}>{t}</Txt>
                      </Tap>
                    </Animated.View>
                  )
                })}
              </View>
              <Txt size={13} color={c.faint} style={{ marginTop: 20 }}>{state.interests.length} selected</Txt>
            </View>
          )}

          {step === 2 && (
            <View>
              <Txt family="display" size={32} style={{ lineHeight: 38, letterSpacing: -0.9 }}>Discover beyond your bubble</Txt>
              <Txt size={15} color={c.muted} style={{ marginTop: 10, lineHeight: 23 }}>
                Most feeds narrow over time. Kaleido holds a deliberate share open for things you did not ask for.
              </Txt>
              <View style={{
                marginTop: 26, padding: 20, borderRadius: RADIUS.lg,
                backgroundColor: c.surface, borderWidth: 1, borderColor: c.line,
              }}>
                <MixBar mix={{ familiar: 60, related: 25, explore: 15 }} height={11} />
                <View style={{ marginTop: 20, gap: 16 }}>
                  {[
                    { pct: 60, label: 'Familiar', note: 'What you already read', color: c.ember },
                    { pct: 25, label: 'Related', note: 'One step sideways', color: c.moss },
                    { pct: 15, label: 'New', note: 'Things nobody predicted for you', color: c.iris },
                  ].map((r, i) => (
                    <Animated.View key={r.label} entering={FadeInDown.duration(360).delay(160 + i * 110)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r.color }} />
                      <Txt family="display" size={17} style={{ width: 46 }}>{r.pct}%</Txt>
                      <View>
                        <Txt size={14.5} weight="medium">{r.label}</Txt>
                        <Txt size={12.5} color={c.muted}>{r.note}</Txt>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </View>
              <Txt size={13} color={c.faint} style={{ marginTop: 16 }}>
                You can drag these any time, from the feed or from Settings.
              </Txt>
            </View>
          )}

          {step === 3 && (
            <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center' }}>
              <LogoMark size={72} colors={{ ink: c.ink }} />
              <Txt family="display" size={34} center style={{ marginTop: 28, lineHeight: 40, letterSpacing: -1 }}>
                Your Kaleido is ready.
              </Txt>
              <Txt size={15.5} color={c.muted} center style={{ marginTop: 14, lineHeight: 24, maxWidth: 300 }}>
                Built around {state.interests.slice(0, 3).join(', ')}
                {state.interests.length > 3 ? ` and ${state.interests.length - 3} more` : ''}.
              </Txt>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 22, paddingBottom: insets.bottom + 22, paddingTop: 8,
      }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <Tap key={i} onPress={() => { if (i <= step) setStep(i) }} haptic={false}
              style={{ width: i === step ? 24 : 6, height: 6, borderRadius: 999, backgroundColor: i === step ? c.ink : c.line }} />
          ))}
        </View>
        <View style={{ flex: 1 }} />
        {step < 3 ? (
          <Button label="Continue" size="lg" iconSide="right" icon={<ArrowRight size={15} color={c.onInk} />}
            disabled={step === 1 && state.interests.length < 3} onPress={() => setStep(step + 1)} />
        ) : (
          <Button label="Start reading" size="lg" variant="accent" iconSide="right" icon={<ArrowRight size={15} color="#fff" />} onPress={finish} />
        )}
      </View>
    </View>
  )
}
