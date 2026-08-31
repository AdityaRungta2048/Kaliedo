import { useState } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, FadeIn, FadeOut } from 'react-native-reanimated'
import { Bookmark, Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { T_BASE, T_FAST } from '@/theme/tokens'
import { compact } from '@/lib/shared/utils'
import type { Post } from '@/lib/shared/types'
import { Tap, Txt } from './UI'

/** Eight short strokes outward — a spark, not confetti. */
function Burst({ show }: { show: boolean }) {
  const { c } = useTheme()
  if (!show) return null
  return (
    <View style={{ position: 'absolute', left: 8, top: 8, width: 0, height: 0 }} pointerEvents="none">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <Animated.View
            key={i}
            entering={FadeIn.duration(1)} exiting={FadeOut.duration(200)}
            style={{
              position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: c.ember,
              transform: [{ translateX: Math.cos(a) * 15 }, { translateY: Math.sin(a) * 15 }],
              opacity: 0.9,
            }}
          />
        )
      })}
    </View>
  )
}

export function LikeButton({ post, showCount = true }: { post: Post; showCount?: boolean }) {
  const { state, dispatch, tap } = useApp()
  const { c } = useTheme()
  const liked = state.likes.includes(post.id)
  const [burst, setBurst] = useState(false)
  const s = useSharedValue(1)
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }))

  return (
    <Tap
      haptic={false}
      onPress={() => {
        if (!liked) {
          tap('medium')
          setBurst(true); setTimeout(() => setBurst(false), 420)
          s.value = withSequence(withTiming(1.35, T_BASE), withTiming(1, T_FAST))
        } else tap('light')
        dispatch({ type: 'toggleLike', id: post.id })
      }}
      accessibilityLabel={liked ? 'Unlike' : 'Like'} accessibilityState={{ selected: liked }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 }}
    >
      <View>
        <Burst show={burst} />
        <Animated.View style={anim}>
          <Heart size={17} color={liked ? c.ember : c.muted} fill={liked ? c.ember : 'transparent'} strokeWidth={2} />
        </Animated.View>
      </View>
      {showCount && (
        <Txt size={12.5} weight="medium" color={liked ? c.ember : c.muted}>
          {compact(post.likes + (liked ? 1 : 0))}
        </Txt>
      )}
    </Tap>
  )
}

export function SaveButton({ post, withLabel }: { post: Post; withLabel?: boolean }) {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const saved = state.saves.includes(post.id)
  const y = useSharedValue(0)
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }))

  return (
    <Tap
      haptic="medium"
      onPress={() => {
        y.value = withSequence(withTiming(-5, { duration: 110 }), withTiming(0, T_BASE))
        dispatch({ type: 'toggleSave', id: post.id })
        toast(saved ? 'Removed from saved' : 'Saved to your shelf', 'bookmark')
      }}
      accessibilityLabel={saved ? 'Remove from saved' : 'Save'} accessibilityState={{ selected: saved }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 }}
    >
      <Animated.View style={anim}>
        <Bookmark size={17} color={saved ? c.amber : c.muted} fill={saved ? c.amber : 'transparent'} strokeWidth={2} />
      </Animated.View>
      {withLabel && <Txt size={12.5} weight="medium" color={saved ? c.amber : c.muted}>{saved ? 'Saved' : 'Save'}</Txt>}
    </Tap>
  )
}

export function RepostButton({ post }: { post: Post }) {
  const { toast } = useApp()
  const { c } = useTheme()
  const [done, setDone] = useState(false)
  const r = useSharedValue(0)
  const anim = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }))
  return (
    <Tap
      haptic="medium"
      onPress={() => { r.value = withTiming(done ? 0 : 360, T_BASE); setDone(!done); toast(done ? 'Repost removed' : 'Reposted to your followers') }}
      accessibilityLabel="Repost"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 }}
    >
      <Animated.View style={anim}><Repeat2 size={18} color={done ? c.moss : c.muted} strokeWidth={2} /></Animated.View>
      <Txt size={12.5} weight="medium" color={done ? c.moss : c.muted}>{compact(post.reposts + (done ? 1 : 0))}</Txt>
    </Tap>
  )
}

export function CommentButton({ post, onPress }: { post: Post; onPress: () => void }) {
  const { c } = useTheme()
  return (
    <Tap onPress={onPress} accessibilityLabel="Open replies"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 }}>
      <MessageCircle size={17} color={c.muted} strokeWidth={2} />
      <Txt size={12.5} weight="medium" color={c.muted}>{compact(post.comments.length)}</Txt>
    </Tap>
  )
}

export function ShareButton({ onPress }: { onPress: () => void }) {
  const { c } = useTheme()
  return (
    <Tap onPress={onPress} accessibilityLabel="Share"
      style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
      <Share2 size={16} color={c.muted} strokeWidth={2} />
    </Tap>
  )
}

export function FollowButton({ userId, size = 'md', full }: { userId: string; size?: 'sm' | 'md'; full?: boolean }) {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const following = state.following.includes(userId)

  return (
    <Tap
      haptic="medium"
      onPress={() => { dispatch({ type: 'toggleFollow', id: userId }); toast(following ? 'Unfollowed' : 'Following') }}
      accessibilityLabel={following ? 'Unfollow' : 'Follow'} accessibilityState={{ selected: following }}
      style={{
        height: size === 'sm' ? 32 : 38,
        paddingHorizontal: size === 'sm' ? 13 : 18,
        borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5,
        backgroundColor: following ? 'transparent' : c.ink,
        borderWidth: following ? 1.2 : 0, borderColor: c.line,
        flex: full ? 1 : undefined,
      }}
    >
      <Animated.View key={String(following)} entering={FadeIn.duration(200)}>
        <Txt size={size === 'sm' ? 12.5 : 13.5} weight="semi" color={following ? c.muted : c.onInk}>
          {following ? 'Following' : 'Follow'}
        </Txt>
      </Animated.View>
    </Tap>
  )
}
