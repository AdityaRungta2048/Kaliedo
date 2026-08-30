import { forwardRef, type ReactNode } from 'react'
import {
  ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps,
  type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native'
import Animated, {
  FadeIn, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withTiming,
} from 'react-native-reanimated'
import { Check } from 'lucide-react-native'
import { Link } from 'expo-router'
import { useTheme } from '@/theme/ThemeProvider'
import { FONT, RADIUS, SPRING_SNAPPY } from '@/theme/tokens'
import { AvatarArt } from './Art'
import { useApp } from '@/store/AppContext'
import type { User } from '@/lib/shared/types'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/** Every tappable surface in the app shares one press physics + one haptic. */
export const Tap = forwardRef<View, PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number; haptic?: false | 'light' | 'medium' }>(
  function Tap({ children, style, scaleTo = 0.96, haptic = 'light', onPressIn, onPress, ...rest }, ref) {
    const scale = useSharedValue(1)
    const { tap } = useApp()
    const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
    return (
      <AnimatedPressable
        ref={ref as never}
        style={[style, animated]}
        onPressIn={(e) => { scale.value = withSpring(scaleTo, SPRING_SNAPPY); onPressIn?.(e) }}
        onPressOut={() => { scale.value = withSpring(1, SPRING_SNAPPY) }}
        onPress={(e) => { if (haptic) tap(haptic); onPress?.(e) }}
        {...rest}
      >
        {children as ReactNode}
      </AnimatedPressable>
    )
  },
)

export function Txt({
  children, size = 14, weight = 'regular', color, style, family = 'sans', numberOfLines, center,
}: {
  children: ReactNode; size?: number; weight?: 'regular' | 'medium' | 'semi'
  color?: string; style?: StyleProp<TextStyle>; family?: 'sans' | 'display' | 'read'
  numberOfLines?: number; center?: boolean
}) {
  const { c } = useTheme()
  const fontFamily =
    family === 'display' ? FONT.display
    : family === 'read' ? FONT.read
    : weight === 'semi' ? FONT.sansSemi
    : weight === 'medium' ? FONT.sansMedium
    : FONT.sans
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily, fontSize: size, color: color ?? c.ink, textAlign: center ? 'center' : 'auto' }, style]}
    >
      {children}
    </Text>
  )
}

export function Button({
  label, onPress, variant = 'primary', size = 'md', icon, iconSide = 'left', disabled, loading, full, style,
}: {
  label: string; onPress: () => void
  variant?: 'primary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'; icon?: ReactNode; iconSide?: 'left' | 'right'
  disabled?: boolean; loading?: boolean
  full?: boolean; style?: StyleProp<ViewStyle>
}) {
  const { c } = useTheme()
  const h = size === 'sm' ? 34 : size === 'lg' ? 50 : 42
  const px = size === 'sm' ? 14 : size === 'lg' ? 26 : 18
  const fs = size === 'sm' ? 13 : size === 'lg' ? 16 : 14.5

  const bg = variant === 'primary' ? c.ink : variant === 'accent' ? c.ember : 'transparent'
  const fg = variant === 'primary' ? c.onInk : variant === 'accent' ? '#FFFFFF' : variant === 'ghost' ? c.muted : c.ink

  return (
    <Tap
      onPress={onPress} disabled={disabled || loading} haptic="medium"
      style={[
        {
          height: h, paddingHorizontal: px, borderRadius: RADIUS.pill,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: c.line,
          opacity: disabled ? 0.4 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
          flex: full ? 1 : undefined,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : iconSide === 'left' ? icon : null}
      <Text style={{ fontFamily: FONT.sansSemi, fontSize: fs, color: fg }}>{label}</Text>
      {!loading && iconSide === 'right' ? icon : null}
    </Tap>
  )
}

export function Avatar({ user, size = 40, ring = false, onPress }: { user: User; size?: number; ring?: boolean; onPress?: () => void }) {
  const { c } = useTheme()
  const inner = (
    <View style={{
      width: size, height: size, borderRadius: size / 2, overflow: 'hidden',
      borderWidth: ring ? 2 : 0, borderColor: c.ember, backgroundColor: c.raised,
    }}>
      <AvatarArt seed={user.avatar.seed} palette={user.avatar.palette} size={size} />
    </View>
  )
  if (onPress) return <Tap onPress={onPress} accessibilityLabel={`${user.name}'s profile`}>{inner}</Tap>
  return (
    <Link href={{ pathname: '/u/[handle]', params: { handle: user.handle } }} asChild>
      <Tap accessibilityLabel={`${user.name}'s profile`}>{inner}</Tap>
    </Link>
  )
}

export function Verified({ size = 15 }: { size?: number }) {
  const { c } = useTheme()
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: c.ember + '26', alignItems: 'center', justifyContent: 'center',
    }}>
      <Check size={size * 0.6} color={c.ember} strokeWidth={3.5} />
    </View>
  )
}

export function Chip({
  label, active, onPress, small,
}: { label: string; active?: boolean; onPress?: () => void; small?: boolean }) {
  const { c } = useTheme()
  const body = (
    <View style={{
      paddingHorizontal: small ? 9 : 11, paddingVertical: small ? 4 : 6,
      borderRadius: RADIUS.pill, borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: active ? c.ink : c.line,
      backgroundColor: active ? c.ink : 'transparent',
    }}>
      <Text style={{ fontFamily: FONT.sansMedium, fontSize: small ? 11.5 : 12.5, color: active ? c.onInk : c.muted }}>
        {label}
      </Text>
    </View>
  )
  return onPress ? <Tap onPress={onPress} scaleTo={0.93}>{body}</Tap> : body
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const { c } = useTheme()
  return (
    <View style={[{
      backgroundColor: c.surface, borderRadius: RADIUS.lg,
      borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
      padding: padded ? 16 : 0,
    }, style]}>
      {children}
    </View>
  )
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme()
  return <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: c.line }, style]} />
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <Txt family="display" size={17}>{children}</Txt>
      {action}
    </View>
  )
}

export function Label({ children }: { children: ReactNode }) {
  const { c } = useTheme()
  return (
    <Text style={{ fontFamily: FONT.sansSemi, fontSize: 11, letterSpacing: 1.3, color: c.faint, textTransform: 'uppercase' }}>
      {children}
    </Text>
  )
}

/** Shimmering skeleton — never a blank screen, never a spinner in a list. */
export function Skeleton({ w, h, radius = 8, style }: { w?: number | `${number}%`; h: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const { c, isDark } = useTheme()
  const o = useSharedValue(0.5)
  o.value = withRepeat(withTiming(1, { duration: 850 }), -1, true)
  const anim = useAnimatedStyle(() => ({ opacity: o.value }))
  return (
    <Animated.View
      style={[{ width: w ?? '100%', height: h, borderRadius: radius, backgroundColor: isDark ? c.line : '#E9E3D8' }, anim, style]}
    />
  )
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  const { c } = useTheme()
  return (
    <Animated.View entering={FadeIn.duration(320)} style={{ alignItems: 'center', paddingVertical: 64, paddingHorizontal: 28 }}>
      <View style={{
        width: 56, height: 56, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line, backgroundColor: c.surface, marginBottom: 16,
      }}>
        {icon}
      </View>
      <Txt family="display" size={19} center>{title}</Txt>
      <Txt size={14} color={c.muted} center style={{ marginTop: 6, lineHeight: 21, maxWidth: 280 }}>{body}</Txt>
      {action ? <View style={{ marginTop: 20 }}>{action}</View> : null}
    </Animated.View>
  )
}

export function Switch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { c } = useTheme()
  const x = useSharedValue(value ? 21 : 3)
  x.value = withSpring(value ? 21 : 3, SPRING_SNAPPY)
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))
  return (
    <Tap onPress={() => onChange(!value)} scaleTo={0.94} accessibilityRole="switch" accessibilityState={{ checked: value }}
      style={{ width: 46, height: 27, borderRadius: 999, backgroundColor: value ? c.ember : c.line, justifyContent: 'center' }}>
      <Animated.View style={[{ width: 21, height: 21, borderRadius: 999, backgroundColor: '#fff' }, knob]} />
    </Tap>
  )
}
