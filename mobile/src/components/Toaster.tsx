import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import { Bookmark, Check, Heart, Info } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { Txt } from './UI'
import { CURVE } from '@/theme/tokens'

const ICONS = { check: Check, heart: Heart, bookmark: Bookmark, info: Info }

export function Toaster() {
  const { toasts } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 78, alignItems: 'center', gap: 8 }}
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.icon ?? 'check']
        return (
          <Animated.View
            key={t.id}
            entering={FadeInDown.duration(260).easing(CURVE)}
            exiting={FadeOutDown.duration(180)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 9,
              backgroundColor: c.raised, borderRadius: 999,
              paddingHorizontal: 16, paddingVertical: 11,
              borderWidth: 1, borderColor: c.line,
              shadowColor: c.shadow, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <Icon size={15} color={c.ember} strokeWidth={2.4} />
            <Txt size={13.5} weight="medium">{t.text}</Txt>
          </Animated.View>
        )
      })}
    </View>
  )
}
