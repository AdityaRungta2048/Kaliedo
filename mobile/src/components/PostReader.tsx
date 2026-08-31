import { useEffect, useMemo, useState } from 'react'
import { Dimensions, Image, Modal, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Extrapolation, FadeIn, interpolate, runOnJS, useAnimatedStyle,
  useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { ArrowLeft, ChevronDown, Sparkles, TrendingUp, VenetianMask } from 'lucide-react-native'
import type { Post } from '@/lib/shared/types'
import { userById } from '@/lib/shared/users'
import { anonPersona, canReveal, displayAuthor, hasBigReach, isAnonymous } from '@/lib/shared/identity'
import { relevanceOf, RELEVANCE_COPY } from '@/lib/shared/recommend'
import { excerpt, readTime, timeAgo } from '@/lib/shared/utils'
import { useApp } from '@/store/AppContext'
import { useReader, type Origin } from '@/store/ReaderContext'
import { useTheme } from '@/theme/ThemeProvider'
import { RADIUS } from '@/theme/tokens'
import { Avatar, Button, Card, Chip, Divider, Label, Tap, Txt, Verified } from './UI'
import { CoverArt } from './Art'
import { CommentButton, FollowButton, LikeButton, RepostButton, SaveButton, ShareButton } from './PostActions'
import { CommentSheet, ShareSheet } from './Sheets'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

/**
 * The block, expanded. There is no navigation here: the card's measured rectangle
 * is animated up to full screen, its compact face cross-fades out, and the article
 * fades in. Dragging down runs the whole thing in reverse, back into the feed.
 */
export function PostReader({ post, origin, onClose }: { post: Post; origin: Origin; onClose: () => void }) {
  const { c } = useTheme()
  const { state, dispatch, me, toast } = useApp()
  const [confirmReveal, setConfirmReveal] = useState(false)
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [comments, setComments] = useState(false)
  const [share, setShare] = useState(false)
  const [why, setWhy] = useState(false)

  const anon = isAnonymous(post)
  const author = displayAuthor(post)
  const relevance = relevanceOf(post, state.interests)
  const progress = useSharedValue(0)
  const dragY = useSharedValue(0)

  useEffect(() => {
    progress.value = withSpring(1, { damping: 24, stiffness: 210, mass: 0.85 })
  }, [progress])

  const dismiss = () => {
    dragY.value = withTiming(0, { duration: 140 })
    progress.value = withTiming(0, { duration: 260 }, (done) => { if (done) runOnJS(onClose)() })
  }

  const related = useMemo(
    () => state.posts.filter((p) => p.id !== post.id && p.topics.some((t) => post.topics.includes(t))).slice(0, 3),
    [state.posts, post],
  )

  // Drag the whole sheet down to send it home.
  const drag = Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetY(-12)
    .onUpdate((e) => { dragY.value = Math.max(0, e.translationY) })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        progress.value = withTiming(0, { duration: 260 }, (done) => { if (done) runOnJS(onClose)() })
        dragY.value = withTiming(0, { duration: 260 })
      } else {
        dragY.value = withSpring(0, { damping: 22, stiffness: 260 })
      }
    })

  const box = useAnimatedStyle(() => {
    const p = progress.value
    const shrink = interpolate(dragY.value, [0, 400], [0, 0.12], Extrapolation.CLAMP)
    return {
      left: interpolate(p, [0, 1], [origin.x, 0]),
      top: interpolate(p, [0, 1], [origin.y, 0]) + dragY.value,
      width: interpolate(p, [0, 1], [origin.width, SCREEN_W]),
      height: interpolate(p, [0, 1], [origin.height, SCREEN_H]),
      borderRadius: interpolate(p, [0, 1], [RADIUS.lg, 0]) + shrink * 200,
      transform: [{ scale: 1 - shrink }],
    }
  })

  const scrim = useAnimatedStyle(() => ({
    opacity: progress.value * interpolate(dragY.value, [0, 300], [1, 0.2], Extrapolation.CLAMP),
  }))

  // The compact face lingers just long enough to read as the same object.
  const ghost = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.35], [1, 0], Extrapolation.CLAMP) }))
  const article = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0.25, 0.75], [0, 1], Extrapolation.CLAMP) }))

  return (
    <Modal transparent visible animationType="none" onRequestClose={dismiss} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }, scrim]} />

      <Animated.View style={[{ position: 'absolute', overflow: 'hidden', backgroundColor: c.surface }, box]}>
        {/* The card face we grew out of, fading away. */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { padding: 15 }, ghost]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.raised }} />
            <Txt size={13.5} weight="semi">{author.name}</Txt>
          </View>
          <Txt family="display" size={19} style={{ marginTop: 11, lineHeight: 24 }}>{post.title}</Txt>
          <Txt family="read" size={14.5} color={c.muted} style={{ marginTop: 7, lineHeight: 22 }}>
            {excerpt(post.body, 128)}
          </Txt>
        </Animated.View>

        <Animated.View style={[{ flex: 1 }, article]}>
          <GestureDetector gesture={drag}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              paddingTop: insets.top + 8, paddingBottom: 10, paddingHorizontal: 12,
              borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line,
              backgroundColor: c.surface,
            }}>
              <Tap onPress={dismiss} accessibilityLabel="Close" style={{ padding: 8 }}>
                <ArrowLeft size={21} color={c.muted} />
              </Tap>
              <Avatar
                user={author} size={30}
                onPress={anon ? () => {} : () => { dismiss(); setTimeout(() => router.push({ pathname: '/u/[handle]', params: { handle: author.handle } }), 260) }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                {anon && <VenetianMask size={13} color={c.muted} />}
                <Txt size={13.5} weight="semi" numberOfLines={1} style={{ flexShrink: 1 }}>{author.name}</Txt>
                {!anon && author.verified && <Verified />}
              </View>
              {!anon && <FollowButton userId={author.id} size="sm" />}
            </View>
          </GestureDetector>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Txt size={11} weight="semi" color={c.ember} style={{ letterSpacing: 1.3, textTransform: 'uppercase' }}>
                {post.kind.replace('-', ' ')}
              </Txt>
              <Txt size={12.5} color={c.faint}>· {timeAgo(post.minutesAgo)} ago · {readTime(post.body)} min read</Txt>
            </View>

            <Txt family="display" size={30} style={{ lineHeight: 36, letterSpacing: -0.6 }}>{post.title}</Txt>

            <View style={{ marginTop: 20, gap: 16 }}>
              {post.body.map((para, i) => (
                <Animated.View key={i} entering={FadeIn.duration(300).delay(220 + i * 55)}>
                  <Txt family="read" size={17} style={{ lineHeight: 29 }}>{para}</Txt>
                </Animated.View>
              ))}
            </View>

            {/* The image sits after the writing, where the author left it. */}
            {(post.art || post.photo) && (
              <Animated.View entering={FadeIn.duration(360).delay(320)} style={{ marginTop: 26 }}>
                <View style={{ borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line }}>
                  {post.photo
                    ? <Image source={{ uri: post.photo }} style={{ width: SCREEN_W - 40, height: (SCREEN_W - 40) * 0.75 }} resizeMode="cover" />
                    : post.art && <CoverArt art={post.art} width={SCREEN_W - 40} />}
                </View>
                {post.art?.caption && (
                  <Txt size={12.5} color={c.faint} center style={{ marginTop: 9 }}>{post.art.caption}</Txt>
                )}
              </Animated.View>
            )}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 24 }}>
              {post.topics.map((t) => (
                <Chip key={t} label={t} onPress={() => { dismiss(); setTimeout(() => router.push({ pathname: '/topic/[name]', params: { name: t } }), 260) }} />
              ))}
            </View>

            {canReveal(post, me.id) && (
              <Card style={{ marginTop: 20, padding: 14 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <VenetianMask size={16} color={c.muted} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Txt size={13} weight="medium">Published as {anonPersona(post.authorId).name}</Txt>
                    <Txt size={12.5} color={c.muted} style={{ marginTop: 4, lineHeight: 19 }}>
                      Only you know this is yours. You can put your real name on it whenever you like — but not the other way round.
                    </Txt>
                    {hasBigReach(post, state.likes.includes(post.id) ? 1 : 0) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9 }}>
                        <TrendingUp size={12} color={c.ember} />
                        <Txt size={12.5} weight="medium" color={c.ember}>Doing well. Worth claiming?</Txt>
                      </View>
                    )}
                    {confirmReveal ? (
                      <View style={{ marginTop: 12, gap: 10 }}>
                        <Txt size={12.5} style={{ lineHeight: 19 }}>
                          This is permanent. Once your name is on it, it cannot be made anonymous again.
                        </Txt>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Button
                            label="Yes, claim it" variant="accent" size="sm"
                            onPress={() => { dispatch({ type: 'revealPost', postId: post.id }); toast(`Published as ${me.name}`, 'check'); setConfirmReveal(false) }}
                          />
                          <Button label="Keep it anonymous" variant="ghost" size="sm" onPress={() => setConfirmReveal(false)} />
                        </View>
                      </View>
                    ) : (
                      <View style={{ marginTop: 12, alignItems: 'flex-start' }}>
                        <Button label={`Claim as ${me.name}`} variant="outline" size="sm" onPress={() => setConfirmReveal(true)} />
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            )}

            <Card style={{ marginTop: 20, padding: 0 }}>
              <Tap onPress={() => setWhy((w) => !w)} haptic={false}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 9, padding: 14 }}>
                <Sparkles size={15} color={c.ember} />
                <Txt size={13} weight="medium" style={{ flex: 1 }}>Why you're seeing this</Txt>
                <ChevronDown size={16} color={c.faint} style={{ transform: [{ rotate: why ? '180deg' : '0deg' }] }} />
              </Tap>
              {why && (
                <Animated.View entering={FadeIn.duration(220)} style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
                  <Txt size={13.5} color={c.muted} style={{ lineHeight: 21 }}>
                    {RELEVANCE_COPY[relevance].note} You read a lot around {state.interests.slice(0, 3).join(', ')}.
                  </Txt>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {post.topics.map((t) => <Chip key={t} label={t} small />)}
                  </View>
                  <Txt size={12.5} color={c.faint} style={{ lineHeight: 19 }}>
                    Kaleido matched this on meaning, not hashtags — {RELEVANCE_COPY[relevance].label.toLowerCase()} in your current mix.
                  </Txt>
                </Animated.View>
              )}
            </Card>

            {related.length > 0 && (
              <View style={{ marginTop: 28 }}>
                <Divider style={{ marginBottom: 18 }} />
                <Label>Keep reading</Label>
                <View style={{ gap: 8, marginTop: 12 }}>
                  {related.map((r) => (
                    <Tap key={r.id} onPress={() => { dismiss() }}
                      style={{
                        flexDirection: 'row', gap: 11, padding: 12, borderRadius: RADIUS.md,
                        backgroundColor: c.canvas, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                      }}>
                      <Avatar user={displayAuthor(r)} size={26} onPress={() => {}} />
                      <View style={{ flex: 1 }}>
                        <Txt family="display" size={14.5} numberOfLines={1}>{r.title}</Txt>
                        <Txt size={12.5} color={c.muted} numberOfLines={1} style={{ marginTop: 2 }}>{excerpt(r.body, 64)}</Txt>
                      </View>
                    </Tap>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 8,
            borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: c.line, backgroundColor: c.surface,
          }}>
            <LikeButton post={post} />
            <CommentButton post={post} onPress={() => setComments(true)} />
            <RepostButton post={post} />
            <ShareButton onPress={() => setShare(true)} />
            <View style={{ flex: 1 }} />
            <SaveButton post={post} withLabel />
          </View>
        </Animated.View>
      </Animated.View>

      <CommentSheet post={post} open={comments} onClose={() => setComments(false)} />
      <ShareSheet post={post} open={share} onClose={() => setShare(false)} />
    </Modal>
  )
}

export function ReaderLayer() {
  const { postId, origin, close } = useReader()
  const { state, dispatch, me, toast } = useApp()
  const [confirmReveal, setConfirmReveal] = useState(false)
  const post = postId ? state.posts.find((p) => p.id === postId) : null
  if (!post || !origin) return null
  return <PostReader key={post.id} post={post} origin={origin} onClose={close} />
}
