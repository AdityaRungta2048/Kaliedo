import { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { AtSign, BellOff, Heart, MessageCircle, TrendingUp, UserPlus } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { userById } from '@/lib/shared/users'
import type { NotificationKind } from '@/lib/shared/types'
import { timeAgo } from '@/lib/shared/utils'
import { RADIUS } from '@/theme/tokens'
import { FollowButton } from '@/components/PostActions'
import { Avatar, EmptyState, Skeleton, Tap, Txt } from '@/components/UI'

const FILTERS: { id: 'all' | NotificationKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mention', label: 'Mentions' },
  { id: 'follow', label: 'Follows' },
  { id: 'like', label: 'Likes' },
  { id: 'comment', label: 'Replies' },
]

const ICON: Record<NotificationKind, typeof Heart> = {
  like: Heart, comment: MessageCircle, follow: UserPlus, mention: AtSign, trending: TrendingUp,
}

export default function Activity() {
  const { state, dispatch } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | NotificationKind>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'readNotifications' }), 1600)
    return () => clearTimeout(t)
  }, [dispatch])

  const tint: Record<NotificationKind, string> = {
    like: c.ember, comment: c.iris, follow: c.moss, mention: c.amber, trending: c.ember,
  }

  const items = useMemo(
    () => (filter === 'all' ? state.notifications : state.notifications.filter((n) => n.kind === filter)),
    [state.notifications, filter],
  )

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <Txt family="display" size={26} style={{ paddingHorizontal: 16, paddingTop: 8, letterSpacing: -0.5 }}>Activity</Txt>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginTop: 12 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
        {FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <Tap key={f.id} onPress={() => setFilter(f.id)} scaleTo={0.94}
              style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, backgroundColor: active ? c.ink : 'transparent' }}>
              <Txt size={13} weight={active ? 'semi' : 'medium'} color={active ? c.onInk : c.muted}>{f.label}</Txt>
            </Tap>
          )
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28, gap: 8 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          Array.from({ length: 6 }, (_, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.lg,
              backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
            }}>
              <Skeleton w={38} h={38} radius={19} />
              <View style={{ flex: 1, gap: 7 }}>
                <Skeleton w="76%" h={11} />
                <Skeleton w="32%" h={10} />
              </View>
            </View>
          ))
        ) : items.length === 0 ? (
          <EmptyState icon={<BellOff size={22} color={c.faint} />} title="You're all caught up"
            body="Nothing new in this category. Go and write something instead." />
        ) : (
          items.map((n, i) => {
            const actor = n.actorId ? userById(n.actorId) : null
            const Icon = ICON[n.kind]
            return (
              <Animated.View key={n.id} entering={FadeInDown.duration(320).delay(Math.min(i * 40, 300))}>
                <Tap
                  onPress={() => { if (actor) router.push({ pathname: '/u/[handle]', params: { handle: actor.handle } }) }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: RADIUS.lg,
                    backgroundColor: n.unread ? c.ember + '0F' : c.surface,
                    borderWidth: StyleSheet.hairlineWidth * 2, borderColor: n.unread ? c.ember + '40' : c.line,
                  }}
                >
                  <View>
                    {actor
                      ? <Avatar user={actor} size={38} onPress={() => router.push({ pathname: '/u/[handle]', params: { handle: actor.handle } })} />
                      : <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: tint[n.kind] + '22' }}>
                          <Icon size={17} color={tint[n.kind]} />
                        </View>}
                    {actor && (
                      <View style={{
                        position: 'absolute', right: -3, bottom: -3, width: 19, height: 19, borderRadius: 999,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: tint[n.kind] + '33', borderWidth: 2, borderColor: c.surface,
                      }}>
                        <Icon size={9} color={tint[n.kind]} strokeWidth={2.8} />
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Txt size={14} style={{ lineHeight: 20 }}>
                      {actor ? <Txt size={14} weight="semi">{actor.name} </Txt> : null}
                      {n.text}
                    </Txt>
                    <Txt size={12} color={c.faint} style={{ marginTop: 2 }}>{timeAgo(n.minutesAgo)} ago</Txt>
                  </View>

                  {n.kind === 'follow' && actor
                    ? <FollowButton userId={actor.id} size="sm" />
                    : n.unread ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.ember }} /> : null}
                </Tap>
              </Animated.View>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}
