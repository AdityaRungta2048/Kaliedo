import { useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { Inbox, Mail, Search, SlidersHorizontal } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { buildFeed, type FeedItem } from '@/lib/shared/recommend'
import type { FeedMode } from '@/lib/shared/types'
import { RADIUS } from '@/theme/tokens'
import { PostBlock, PostBlockSkeletonList } from '@/components/PostBlock'
import { MixBar, MixControls } from '@/components/MixControls'
import { Sheet } from '@/components/Sheets'
import { Button, EmptyState, Tap, Txt } from '@/components/UI'
import { LogoMark } from '@/components/Art'

const MODES: { id: FeedMode; label: string; blurb: string }[] = [
  { id: 'for-you', label: 'For you', blurb: 'Composed from your mix' },
  { id: 'following', label: 'Following', blurb: 'Only people you follow' },
  { id: 'explore', label: 'Explore', blurb: 'Writers you don’t follow yet' },
  { id: 'nearby', label: 'Next door', blurb: 'One step outside your interests' },
]

export default function Home() {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const listRef = useRef<FlatList<FeedItem>>(null)
  const [mixOpen, setMixOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const first = useRef(true)

  const unreadMsgs = state.conversations.filter((cv) => cv.messages.some((m) => m.from === 'them' && !m.read)).length

  const feed = useMemo(
    () => buildFeed({
      posts: state.posts,
      interests: state.interests,
      following: new Set(state.following),
      mode: state.feedMode,
      mix: state.mix,
      socialFollowing: state.socialFollowing,
      seed: state.feedSeed,
      mutedTopics: new Set(state.mutedTopics),
    }),
    [state.posts, state.interests, state.following, state.feedMode, state.mix, state.socialFollowing, state.feedSeed, state.mutedTopics],
  )

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => { setLoading(false); first.current = false }, first.current ? 520 : 240)
    return () => clearTimeout(t)
  }, [state.feedMode, state.feedSeed])

  const changeMode = (m: FeedMode) => {
    if (m === state.feedMode) return
    dispatch({ type: 'setMode', mode: m })
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
  }

  const activeMode = MODES.find((m) => m.id === state.feedMode)

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingBottom: 10,
      }}>
        <LogoMark size={26} colors={{ ink: c.ink }} />
        <Txt family="display" size={19} style={{ flex: 1, letterSpacing: -0.3 }}>Kaleido</Txt>
        <Tap onPress={() => router.push('/discover')} accessibilityLabel="Search" style={{ padding: 8 }}>
          <Search size={20} color={c.muted} />
        </Tap>
        <Tap onPress={() => router.push('/messages')} accessibilityLabel="Messages" style={{ padding: 8 }}>
          <View>
            <Mail size={20} color={c.muted} />
            {unreadMsgs > 0 && (
              <View style={{
                position: 'absolute', right: -1, top: -1, width: 8, height: 8, borderRadius: 999,
                backgroundColor: c.ember, borderWidth: 1.5, borderColor: c.canvas,
              }} />
            )}
          </View>
        </Tap>
      </View>

      <View style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Four modes do not fit beside the mix pill on a small phone, so they scroll. */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }} contentContainerStyle={{ gap: 4, alignItems: 'center', paddingRight: 4 }}
        >
          {MODES.map((m) => {
            const active = m.id === state.feedMode
            return (
              <Tap
                key={m.id} onPress={() => changeMode(m.id)} scaleTo={0.94}
                accessibilityRole="tab" accessibilityState={{ selected: active }}
                style={{
                  paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999,
                  backgroundColor: active ? c.ink : 'transparent',
                }}
              >
                <Txt size={13} weight={active ? 'semi' : 'medium'} color={active ? c.onInk : c.muted}>{m.label}</Txt>
              </Tap>
            )
          })}
        </ScrollView>
        <Tap
          onPress={() => setMixOpen(true)} accessibilityLabel="Adjust your mix"
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 7,
            paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999,
            borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
          }}
        >
          <SlidersHorizontal size={13} color={c.muted} />
          <View style={{ width: 26 }}><MixBar mix={state.mix} height={5} /></View>
        </Tap>
      </View>

      {loading ? (
        <Animated.View exiting={FadeOut.duration(160)} style={{ paddingHorizontal: 16 }}>
          <PostBlockSkeletonList count={4} />
        </Animated.View>
      ) : (
        <Animated.View key={`${state.feedMode}-${state.feedSeed}`} entering={FadeIn.duration(240)} style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={feed}
            keyExtractor={(it) => it.post.id}
            renderItem={({ item, index }) => (
              <PostBlock post={item.post} relevance={item.relevance} index={index} />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, gap: 14 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={9}
            removeClippedSubviews
            ListHeaderComponent={
              activeMode ? (
                <Txt size={12} color={c.faint} style={{ marginBottom: 12 }}>
                  {activeMode.blurb} · {feed.length} pieces
                </Txt>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                icon={<Inbox size={22} color={c.faint} />}
                title="Nothing here yet"
                body={state.feedMode === 'following'
                  ? 'Nobody you follow published today. Explore is a good place to fix that.'
                  : 'Widen your mix or add an interest and this will fill up.'}
                action={<Button label="Open Explore" onPress={() => changeMode('explore')} />}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                tintColor={c.ember}
                colors={[c.ember]}
                progressBackgroundColor={c.surface}
                onRefresh={() => {
                  setRefreshing(true)
                  dispatch({ type: 'refresh' })
                  toast('Feed refreshed', 'info')
                  setTimeout(() => setRefreshing(false), 550)
                }}
              />
            }
          />
        </Animated.View>
      )}

      <Sheet open={mixOpen} onClose={() => setMixOpen(false)} title="Your Kaleido mix">
        <View style={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 20 }}>
          <Txt size={13.5} color={c.muted} style={{ lineHeight: 21, marginBottom: 18 }}>
            How much of your feed should feel like home, and how much should surprise you. Drag it and the feed rebuilds.
          </Txt>
          <MixControls />
        </View>
      </Sheet>
    </View>
  )
}
