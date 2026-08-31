import { useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { Crosshair, Inbox, Mail, Search, SlidersHorizontal, X } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { buildFeed, type FeedItem } from '@/lib/shared/recommend'
import type { ExploreTab, FeedMode } from '@/lib/shared/types'
import { RADIUS } from '@/theme/tokens'
import { PostBlock, PostBlockSkeletonList } from '@/components/PostBlock'
import { MixBar, MixControls } from '@/components/MixControls'
import { Sheet } from '@/components/Sheets'
import { FocusSheet } from '@/components/FocusSheet'
import { Button, EmptyState, Tap, Txt } from '@/components/UI'
import { LogoMark } from '@/components/Art'

const MODES: { id: FeedMode; label: string; blurb: string }[] = [
  { id: 'for-you', label: 'For you', blurb: 'Composed from your mix' },
  { id: 'explore', label: 'Explore', blurb: 'Beyond the people you already read' },
]

/** Explore's inner scope, the way Reels splits discovery from people you follow. */
const EXPLORE_TABS: { id: ExploreTab; label: string; blurb: string }[] = [
  { id: 'nearby', label: 'Next door', blurb: 'Writers you don’t follow, nearest interests first' },
  { id: 'following', label: 'Following', blurb: 'Discovery narrowed to people you read' },
]

export default function Home() {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const listRef = useRef<FlatList<FeedItem>>(null)
  const [mixOpen, setMixOpen] = useState(false)
  const [focusOpen, setFocusOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const first = useRef(true)

  const unreadMsgs = state.conversations.filter((cv) => cv.messages.some((m) => m.from === 'them' && !m.read)).length

  const focused = state.activeIdentity === 'alter' && state.alterEgo !== null

  const feed = useMemo(
    () => buildFeed({
      posts: state.posts,
      interests: state.interests,
      following: new Set(state.following),
      mode: state.feedMode,
      exploreTab: state.exploreTab,
      mix: state.mix,
      socialFollowing: state.socialFollowing,
      seed: state.feedSeed,
      mutedTopics: new Set(state.mutedTopics),
      focusNiche: focused ? state.alterEgo!.niche : null,
    }),
    [state.posts, state.interests, state.following, state.feedMode, state.exploreTab, state.mix, state.socialFollowing, state.feedSeed, state.mutedTopics, focused, state.alterEgo],
  )

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => { setLoading(false); first.current = false }, first.current ? 520 : 240)
    return () => clearTimeout(t)
  }, [state.feedMode, state.exploreTab, state.feedSeed])

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
        <Tap onPress={() => setFocusOpen(true)} accessibilityLabel="Focused mode" style={{ padding: 8 }}>
          <Crosshair size={20} color={focused ? c.iris : c.muted} />
        </Tap>
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

      {focused ? (
        <View style={{
          marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 13, paddingVertical: 10,
          borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 9,
          backgroundColor: c.iris + '14', borderWidth: 1, borderColor: c.iris + '4D',
        }}>
          <Crosshair size={14} color={c.iris} />
          <Txt size={13} weight="medium" numberOfLines={1} style={{ flex: 1 }}>
            Focused · {state.alterEgo!.niche} only
          </Txt>
          <Tap
            onPress={() => { dispatch({ type: 'setIdentity', identity: 'main' }); toast('Back to your main feed') }}
            accessibilityLabel="Leave focused mode" style={{ padding: 2 }}
          >
            <X size={15} color={c.muted} />
          </Tap>
        </View>
      ) : (
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
      )}

      {!focused && state.feedMode === 'explore' && (
        <View style={{
          flexDirection: 'row', gap: 3, alignSelf: 'flex-start', marginLeft: 16, marginBottom: 10,
          padding: 3, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
        }}>
          {EXPLORE_TABS.map((tab) => {
            const active = state.exploreTab === tab.id
            return (
              <Tap
                key={tab.id} onPress={() => dispatch({ type: 'setExploreTab', tab: tab.id })} scaleTo={0.94}
                accessibilityRole="tab" accessibilityState={{ selected: active }}
                style={{ paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? c.ink : 'transparent' }}
              >
                <Txt size={12.5} weight={active ? 'semi' : 'medium'} color={active ? c.onInk : c.muted}>{tab.label}</Txt>
              </Tap>
            )
          })}
        </View>
      )}

      {loading ? (
        <Animated.View exiting={FadeOut.duration(160)} style={{ paddingHorizontal: 16 }}>
          <PostBlockSkeletonList count={4} />
        </Animated.View>
      ) : (
        <Animated.View key={`${state.feedMode}-${state.exploreTab}-${state.feedSeed}`} entering={FadeIn.duration(240)} style={{ flex: 1 }}>
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
              <Txt size={12} color={c.faint} style={{ marginBottom: 12 }}>
                {focused
                  ? `Nothing outside ${state.alterEgo!.niche} reaches this feed · ${feed.length} pieces`
                  : state.feedMode === 'explore'
                    ? `${EXPLORE_TABS.find((t) => t.id === state.exploreTab)?.blurb} · ${feed.length} pieces`
                    : `${activeMode?.blurb ?? ''} · ${feed.length} pieces`}
              </Txt>
            }
            ListEmptyComponent={
              <EmptyState
                icon={<Inbox size={22} color={c.faint} />}
                title="Nothing here yet"
                body={focused
                  ? `Nobody has published in ${state.alterEgo!.niche} yet. Focused mode shows this niche and nothing else.`
                  : state.feedMode === 'explore' && state.exploreTab === 'following'
                    ? 'Nobody you follow has published today. Next door is a good place to find someone new.'
                    : 'Widen your mix or add an interest and this will fill up.'}
                action={focused
                  ? <Button label="Leave focused mode" onPress={() => dispatch({ type: 'setIdentity', identity: 'main' })} />
                  : state.feedMode === 'explore'
                    ? <Button label="Open Next door" onPress={() => dispatch({ type: 'setExploreTab', tab: 'nearby' })} />
                    : <Button label="Open Explore" onPress={() => changeMode('explore')} />}
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

      <FocusSheet open={focusOpen} onClose={() => setFocusOpen(false)} />

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
