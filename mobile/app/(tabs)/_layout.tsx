import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Tabs } from 'expo-router'
import { Bell, Compass, House, PenLine, User } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { FONT, SPRING_SNAPPY } from '@/theme/tokens'

const ITEMS = [
  { name: 'index', label: 'Home', Icon: House },
  { name: 'discover', label: 'Discover', Icon: Compass },
  { name: 'create', label: 'Write', Icon: PenLine },
  { name: 'activity', label: 'Activity', Icon: Bell },
  { name: 'profile', label: 'You', Icon: User },
] as const

/**
 * Icon and label are drawn together in the icon slot rather than using the
 * navigator's own label, which collapses its text box under a custom font.
 * One movement on select: the icon lifts, the label firms up, a bar morphs in.
 */
function TabItem({ Icon, label, focused, badge }: { Icon: typeof House; label: string; focused: boolean; badge?: number }) {
  const { c } = useTheme()
  const s = useSharedValue(focused ? 1.1 : 1)
  s.value = withSpring(focused ? 1.1 : 1, SPRING_SNAPPY)
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }))

  return (
    <View style={{ alignItems: 'center', justifyContent: 'flex-start', width: 60, paddingTop: 2 }}>
      {focused && (
        <View style={{
          position: 'absolute', top: -9, width: 28, height: 2.5,
          borderRadius: 999, backgroundColor: c.ember,
        }} />
      )}
      <View style={{ height: 24, justifyContent: 'center' }}>
        <Animated.View style={anim}>
          <Icon size={21} color={focused ? c.ink : c.faint} strokeWidth={focused ? 2.3 : 1.9} />
        </Animated.View>
        {badge ? (
          <View style={{
            position: 'absolute', right: -5, top: -1, width: 9, height: 9, borderRadius: 999,
            backgroundColor: c.ember, borderWidth: 2, borderColor: c.surface,
          }} />
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: focused ? FONT.sansSemi : FONT.sansMedium,
          fontSize: 10.5, lineHeight: 15, marginTop: 3,
          color: focused ? c.ink : c.faint,
        }}
      >
        {label}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  const { c } = useTheme()
  const { state } = useApp()
  const insets = useSafeAreaInsets()
  const unread = state.notifications.filter((n) => n.unread).length

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          borderTopColor: c.line,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 0,
        },
        tabBarItemStyle: { paddingTop: 10 },
      }}
    >
      {ITEMS.map(({ name, label, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarAccessibilityLabel: label,
            tabBarIcon: ({ focused }) => (
              <TabItem Icon={Icon} label={label} focused={focused} badge={name === 'activity' ? unread : undefined} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
