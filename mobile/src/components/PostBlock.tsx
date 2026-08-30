import { memo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { Image as ImageIcon, Sparkles } from 'lucide-react-native'
import type { Post, Relevance } from '@/lib/shared/types'
import { userById } from '@/lib/shared/users'
import { RELEVANCE_COPY } from '@/lib/shared/recommend'
import { compact, excerpt, readTime, timeAgo } from '@/lib/shared/utils'
import { useTheme } from '@/theme/ThemeProvider'
import { RADIUS } from '@/theme/tokens'
import { useReader } from '@/store/ReaderContext'
import { Avatar, Chip, Tap, Txt, Verified } from './UI'
import { LikeButton, SaveButton } from './PostActions'

/**
 * The Kaleido block. Author, title, two lines of the opening, and the shape of
 * what is inside. Tapping it measures its position and hands that to the reader,
 * which grows out of exactly this rectangle.
 */
function PostBlockBase({ post, relevance, index = 0 }: { post: Post; relevance?: Relevance; index?: number }) {
  const { c } = useTheme()
  const router = useRouter()
  const { open, postId } = useReader()
  const ref = useRef<View>(null)
  const author = userById(post.authorId)
  const hidden = postId === post.id

  const tint = relevance === 'related' ? c.moss : relevance === 'explore' ? c.iris : c.ember

  const expand = () => {
    ref.current?.measureInWindow((x, y, width, height) => {
      open(post.id, { x, y, width, height })
    })
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(Math.min(index * 45, 320)).springify().damping(18)}
      style={{ opacity: hidden ? 0 : 1 }}
    >
      <View ref={ref} collapsable={false}>
        <Tap
          onPress={expand} scaleTo={0.985}
          accessibilityRole="button"
          accessibilityLabel={`Open ${post.title} by ${author.name}`}
          style={{
            backgroundColor: c.surface, borderRadius: RADIUS.lg,
            borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line, overflow: 'hidden',
          }}
        >
          <View style={{ padding: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <Avatar user={author} size={28} onPress={() => router.push({ pathname: '/u/[handle]', params: { handle: author.handle } })} />
              <Txt size={13.5} weight="semi" numberOfLines={1} style={{ flexShrink: 1 }}>{author.name}</Txt>
              {author.verified && <Verified />}
              <Txt size={12.5} color={c.faint}>· {timeAgo(post.minutesAgo)}</Txt>
            </View>

            <Txt family="display" size={19} style={{ marginTop: 11, lineHeight: 24 }}>{post.title}</Txt>

            <Txt family="read" size={14.5} color={c.muted} style={{ marginTop: 7, lineHeight: 22 }}>
              {excerpt(post.body, 128)}
            </Txt>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 }}>
              {post.topics.slice(0, 2).map((t) => (
                <Chip key={t} label={t} small onPress={() => router.push({ pathname: '/topic/[name]', params: { name: t } })} />
              ))}
              <View style={{ flex: 1 }} />
              {post.art || post.photo ? <ImageIcon size={12} color={c.faint} /> : null}
              <Txt size={11.5} color={c.faint}>{readTime(post.body)} min</Txt>
            </View>

            {relevance && relevance !== 'familiar' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 11 }}>
                <Sparkles size={11} color={tint} />
                <Txt size={11.5} weight="medium" color={tint}>{RELEVANCE_COPY[relevance].label}</Txt>
              </View>
            )}
          </View>

          <View style={{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, paddingVertical: 4,
            borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: c.line,
          }}>
            <LikeButton post={post} />
            <Txt size={12.5} weight="medium" color={c.muted} style={{ marginLeft: 10 }}>
              {compact(post.comments.length)} replies
            </Txt>
            <View style={{ flex: 1 }} />
            <SaveButton post={post} />
          </View>
        </Tap>
      </View>
    </Animated.View>
  )
}

export const PostBlock = memo(PostBlockBase)

export function PostBlockSkeletonList({ count = 5 }: { count?: number }) {
  const { c } = useTheme()
  return (
    <View style={{ gap: 14 }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{
          backgroundColor: c.surface, borderRadius: RADIUS.lg, padding: 15,
          borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <SkeletonBox w={28} h={28} radius={14} />
            <SkeletonBox w={120} h={11} />
          </View>
          <View style={{ marginTop: 13, gap: 8 }}>
            <SkeletonBox w="92%" h={17} />
            <SkeletonBox w="64%" h={17} />
          </View>
          <View style={{ marginTop: 13, gap: 7 }}>
            <SkeletonBox w="100%" h={11} />
            <SkeletonBox w="78%" h={11} />
          </View>
        </View>
      ))}
    </View>
  )
}

function SkeletonBox({ w, h, radius = 7 }: { w?: number | `${number}%`; h: number; radius?: number }) {
  const { c, isDark } = useTheme()
  return <View style={{ width: w ?? '100%', height: h, borderRadius: radius, backgroundColor: isDark ? c.line : '#E9E3D8' }} />
}
