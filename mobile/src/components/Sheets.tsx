import { useState, type ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  FadeIn, FadeInDown, runOnJS, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated'
import { Link2, Repeat2, Send, Share2, X } from 'lucide-react-native'
import * as Clipboard from 'expo-clipboard'
import type { Post } from '@/lib/shared/types'
import { userById } from '@/lib/shared/users'
import { compact, timeAgo } from '@/lib/shared/utils'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { CURVE, RADIUS, T_BASE } from '@/theme/tokens'
import { Avatar, Divider, Tap, Txt } from './UI'

/** One bottom sheet for the whole app: drag handle, scrim, spring, drag-to-dismiss. */
export function Sheet({
  open, onClose, title, children, footer, maxHeightRatio = 0.86,
}: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode
  footer?: ReactNode; maxHeightRatio?: number
}) {
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const y = useSharedValue(0)

  const close = () => { y.value = withTiming(0); onClose() }

  const drag = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((e) => { y.value = Math.max(0, e.translationY) })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 800) {
        y.value = withTiming(600, { duration: 200 }, (d) => { if (d) runOnJS(onClose)() })
      } else y.value = withTiming(0, T_BASE)
    })

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }))

  if (!open) return null

  return (
    <Modal transparent visible animationType="none" onRequestClose={close} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
        <Tap onPress={close} haptic={false} scaleTo={1} accessibilityLabel="Close"
          style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={FadeInDown.duration(300).easing(CURVE)}
          style={[{
            backgroundColor: c.surface,
            borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
            borderTopWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
            maxHeight: `${maxHeightRatio * 100}%`,
          }, sheet]}
        >
          <GestureDetector gesture={drag}>
            <View style={{ paddingTop: 10, paddingBottom: title ? 0 : 6 }}>
              <View style={{ alignSelf: 'center', width: 38, height: 4, borderRadius: 999, backgroundColor: c.line }} />
              {title ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10 }}>
                  <Txt family="display" size={17} style={{ flex: 1 }}>{title}</Txt>
                  <Tap onPress={close} accessibilityLabel="Close" style={{ padding: 6 }}>
                    <X size={18} color={c.muted} />
                  </Tap>
                </View>
              ) : null}
            </View>
          </GestureDetector>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingBottom: footer ? 8 : insets.bottom + 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          {footer ? (
            <View style={{
              borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: c.line,
              paddingHorizontal: 14, paddingTop: 10, paddingBottom: insets.bottom + 10,
            }}>
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export function MenuSheet({
  open, onClose, title, items,
}: { open: boolean; onClose: () => void; title: string; items: { icon: ReactNode; label: string; run: () => void }[] }) {
  const { c } = useTheme()
  return (
    <Sheet open={open} onClose={onClose} title={title} maxHeightRatio={0.7}>
      <View style={{ paddingHorizontal: 10 }}>
        {items.map((it) => (
          <Tap key={it.label} onPress={() => { it.run(); onClose() }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12, paddingVertical: 14, borderRadius: RADIUS.md }}>
            {it.icon}
            <Txt size={14.5} color={c.ink}>{it.label}</Txt>
          </Tap>
        ))}
      </View>
    </Sheet>
  )
}

export function CommentSheet({ post, open, onClose }: { post: Post; open: boolean; onClose: () => void }) {
  const { state, dispatch, me, toast } = useApp()
  const { c } = useTheme()
  const [draft, setDraft] = useState('')
  const live = state.posts.find((p) => p.id === post.id) ?? post

  const send = () => {
    const text = draft.trim()
    if (!text) return
    dispatch({ type: 'addComment', postId: post.id, comment: { id: `c_${Date.now()}`, authorId: me.id, text, minutesAgo: 0, likes: 0 } })
    setDraft('')
    toast('Reply posted')
  }

  return (
    <Sheet
      open={open} onClose={onClose}
      title={`${live.comments.length} ${live.comments.length === 1 ? 'reply' : 'replies'}`}
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <Avatar user={me} size={32} onPress={() => {}} />
          <TextInput
            value={draft} onChangeText={setDraft} placeholder="Add a reply…" placeholderTextColor={c.faint}
            multiline
            style={{
              flex: 1, minHeight: 40, maxHeight: 100, borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10,
              backgroundColor: c.canvas, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line, color: c.ink, fontSize: 14.5,
            }}
          />
          <Tap onPress={send} disabled={!draft.trim()} accessibilityLabel="Send reply"
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() ? 1 : 0.35 }}>
            <Send size={16} color={c.onInk} />
          </Tap>
        </View>
      }
    >
      <View style={{ paddingHorizontal: 18, paddingBottom: 8 }}>
        {live.comments.length === 0 ? (
          <Txt size={14} color={c.muted} center style={{ paddingVertical: 44 }}>
            No replies yet. Say the first useful thing.
          </Txt>
        ) : (
          live.comments.map((cm) => {
            const u = userById(cm.authorId)
            return (
              <View key={cm.id} style={{ flexDirection: 'row', gap: 11, paddingVertical: 11 }}>
                <Avatar user={u} size={32} onPress={() => {}} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7 }}>
                    <Txt size={13.5} weight="semi">{u.name}</Txt>
                    <Txt size={12} color={c.faint}>{timeAgo(cm.minutesAgo)}</Txt>
                  </View>
                  <Txt size={14} style={{ marginTop: 3, lineHeight: 21 }}>{cm.text}</Txt>
                  <Txt size={12} color={c.faint} style={{ marginTop: 5 }}>
                    {cm.likes > 0 ? `${compact(cm.likes)} likes` : 'Like'}
                  </Txt>
                </View>
              </View>
            )
          })
        )}
      </View>
    </Sheet>
  )
}

export function ShareSheet({ post, open, onClose }: { post: Post; open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const people = state.conversations.slice(0, 6).map((cv) => userById(cv.userId))

  const actions = [
    { icon: <Link2 size={16} color={c.muted} />, label: 'Copy link', run: async () => { await Clipboard.setStringAsync(`https://kaleido.app/p/${post.id}`); toast('Link copied') } },
    { icon: <Send size={16} color={c.muted} />, label: 'Send as message', run: () => toast('Opened in messages') },
    { icon: <Repeat2 size={16} color={c.muted} />, label: 'Repost', run: () => toast('Reposted to your followers') },
    { icon: <Share2 size={16} color={c.muted} />, label: 'Share outside', run: () => toast('Share sheet opened') },
  ]

  return (
    <Sheet open={open} onClose={onClose} title="Share this piece" maxHeightRatio={0.7}>
      <View style={{ paddingHorizontal: 18 }}>
        <Txt size={13.5} color={c.muted} numberOfLines={2}>“{post.title}”</Txt>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 16 }}>
          {people.map((u) => (
            <Tap key={u.id} onPress={() => { dispatch({ type: 'startConversation', userId: u.id }); toast(`Sent to ${u.name.split(' ')[0]}`); onClose() }}
              style={{ width: 62, alignItems: 'center', gap: 7 }}>
              <Avatar user={u} size={50} onPress={() => { dispatch({ type: 'startConversation', userId: u.id }); toast(`Sent to ${u.name.split(' ')[0]}`); onClose() }} />
              <Txt size={11.5} color={c.muted} numberOfLines={1}>{u.name.split(' ')[0]}</Txt>
            </Tap>
          ))}
        </ScrollView>

        <Divider style={{ marginVertical: 18 }} />

        <View style={{ gap: 8 }}>
          {actions.map((a) => (
            <Tap key={a.label} onPress={() => { void a.run(); onClose() }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.md,
                backgroundColor: c.canvas, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
              }}>
              {a.icon}
              <Txt size={14} weight="medium">{a.label}</Txt>
            </Tap>
          ))}
        </View>
      </View>
    </Sheet>
  )
}
