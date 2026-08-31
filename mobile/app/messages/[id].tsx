import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Check, CheckCheck, ImagePlus, Send, Smile } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { userById } from '@/lib/shared/users'
import type { Art, Message } from '@/lib/shared/types'
import { timeAgo } from '@/lib/shared/utils'
import { CURVE, RADIUS } from '@/theme/tokens'
import { CoverArt } from '@/components/Art'
import { Avatar, EmptyState, Tap, Txt, Verified } from '@/components/UI'

const EMOJI = ['❤️', '🔥', '😄', '👏', '🤔', '💯']

const REPLIES = [
  'Say more about that.',
  'Agreed — and it is the part nobody writes down.',
  'Sending you something on this later tonight.',
  'That is the version I would publish.',
  'Ha. Painfully accurate.',
]

function Dot({ delay }: { delay: number }) {
  const { c } = useTheme()
  const y = useSharedValue(0)
  useEffect(() => {
    y.value = withRepeat(withTiming(-3, { duration: 420 }), -1, true)
  }, [y])
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }))
  void delay
  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.faint }, anim]} />
}

export default function Conversation() {
  const { id = '' } = useLocalSearchParams<{ id: string }>()
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [reactFor, setReactFor] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  const conversation = state.conversations.find((cv) => cv.id === id)

  useEffect(() => {
    if (conversation) dispatch({ type: 'readConversation', conversationId: id })
  }, [id, conversation, dispatch])

  if (!conversation) {
    return (
      <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
        <EmptyState icon={<Send size={20} color={c.faint} />} title="Conversation not found" body="It may have been reset." />
      </View>
    )
  }

  const user = userById(conversation.userId)

  const send = (text?: string, art?: Art) => {
    const body = text?.trim()
    if (!body && !art) return
    dispatch({
      type: 'sendMessage', conversationId: id,
      message: { id: `m_${Date.now()}`, from: 'me', text: body, art, minutesAgo: 0, reactions: [], read: true, replyToId: replyTo?.id },
    })
    setDraft(''); setReplyTo(null)
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      dispatch({
        type: 'sendMessage', conversationId: id,
        message: { id: `m_${Date.now() + 1}`, from: 'them', text: REPLIES[Math.floor(Math.random() * REPLIES.length)], minutesAgo: 0, reactions: [], read: true },
      })
    }, 1500 + Math.random() * 800)
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line,
      }}>
        <Tap onPress={() => router.back()} accessibilityLabel="Back" style={{ padding: 8 }}>
          <ArrowLeft size={21} color={c.muted} />
        </Tap>
        <Avatar user={user} size={38} onPress={() => router.push({ pathname: '/u/[handle]', params: { handle: user.handle } })} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Txt size={14.5} weight="semi" numberOfLines={1} style={{ flexShrink: 1 }}>{user.name}</Txt>
            {user.verified && <Verified />}
          </View>
          <Txt size={12} color={c.faint}>{typing ? 'typing…' : state.activityStatus ? 'Active now' : `@${user.handle}`}</Txt>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 16, gap: 4 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {conversation.messages.length === 0 && (
          <Txt size={13.5} color={c.muted} center style={{ paddingVertical: 40 }}>
            No messages yet. Say something worth reading.
          </Txt>
        )}

        {conversation.messages.map((m) => {
          const mine = m.from === 'me'
          const repliedTo = m.replyToId ? conversation.messages.find((x) => x.id === m.replyToId) : null
          return (
            <Animated.View key={m.id} entering={FadeInDown.duration(260).easing(CURVE)}
              style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: m.reactions.length ? 14 : 6 }}>
              {repliedTo && (
                <Txt size={11.5} color={c.faint} numberOfLines={1} style={{ maxWidth: '76%', marginBottom: 3, paddingHorizontal: 8 }}>
                  ↩ {repliedTo.text ?? 'Image'}
                </Txt>
              )}
              <Tap
                onLongPress={() => setReactFor(reactFor === m.id ? null : m.id)}
                onPress={() => setReactFor(null)}
                haptic={false} scaleTo={0.98}
                style={{
                  maxWidth: '80%',
                  backgroundColor: mine ? c.ink : c.surface,
                  borderWidth: mine ? 0 : StyleSheet.hairlineWidth * 2, borderColor: c.line,
                  borderRadius: RADIUS.lg,
                  borderBottomRightRadius: mine ? 6 : RADIUS.lg,
                  borderBottomLeftRadius: mine ? RADIUS.lg : 6,
                  paddingHorizontal: 14, paddingVertical: 10,
                }}
              >
                {m.art && (
                  <View style={{ marginBottom: 8, borderRadius: RADIUS.sm, overflow: 'hidden' }}>
                    <CoverArt art={m.art} width={200} />
                  </View>
                )}
                {m.text ? <Txt size={14.5} color={mine ? c.onInk : c.ink} style={{ lineHeight: 21 }}>{m.text}</Txt> : null}
              </Tap>

              {m.reactions.length > 0 && (
                <Animated.View entering={FadeIn.duration(200)} style={{
                  flexDirection: 'row', marginTop: -8, marginHorizontal: 10,
                  backgroundColor: c.raised, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
                  borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                }}>
                  <Txt size={11}>{m.reactions.join('')}</Txt>
                </Animated.View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingHorizontal: 6 }}>
                <Tap onPress={() => setReplyTo(m)} haptic={false} style={{ paddingVertical: 2 }}>
                  <Txt size={11} color={c.faint}>Reply</Txt>
                </Tap>
                <Txt size={11} color={c.faint}>{timeAgo(m.minutesAgo)}</Txt>
                {mine && (m.read ? <CheckCheck size={12} color={c.moss} /> : <Check size={12} color={c.faint} />)}
              </View>

              {reactFor === m.id && (
                <Animated.View entering={FadeIn.duration(160)} style={{
                  flexDirection: 'row', gap: 4, marginTop: 6,
                  backgroundColor: c.raised, borderRadius: 999, padding: 6,
                  borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                }}>
                  {EMOJI.map((e) => (
                    <Tap key={e} onPress={() => { dispatch({ type: 'reactMessage', conversationId: id, messageId: m.id, emoji: e }); setReactFor(null) }}
                      style={{ paddingHorizontal: 4 }}>
                      <Txt size={17}>{e}</Txt>
                    </Tap>
                  ))}
                </Animated.View>
              )}
            </Animated.View>
          )
        })}

        {typing && (
          <Animated.View entering={FadeIn.duration(200)} style={{
            flexDirection: 'row', gap: 5, alignSelf: 'flex-start',
            backgroundColor: c.surface, borderRadius: RADIUS.lg, borderBottomLeftRadius: 6,
            paddingHorizontal: 14, paddingVertical: 12,
            borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
          }}>
            {[0, 1, 2].map((i) => <Dot key={i} delay={i * 140} />)}
          </Animated.View>
        )}
      </ScrollView>

      {replyTo && (
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8,
          backgroundColor: c.surface, borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: c.line,
        }}>
          <Txt size={12.5} color={c.muted} numberOfLines={1} style={{ flex: 1 }}>Replying to “{replyTo.text ?? 'image'}”</Txt>
          <Tap onPress={() => setReplyTo(null)}><Txt size={12.5} color={c.faint}>Cancel</Txt></Tap>
        </View>
      )}

      <View style={{
        flexDirection: 'row', alignItems: 'flex-end', gap: 8,
        paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 8,
        backgroundColor: c.surface, borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: c.line,
      }}>
        <Tap
          onPress={() => { send(undefined, { seed: Math.floor(Math.random() * 9999), motif: 'facets', palette: 'moss', ratio: '4:3' }); toast('Image sent') }}
          accessibilityLabel="Send an image" style={{ padding: 10 }}
        >
          <ImagePlus size={20} color={c.muted} />
        </Tap>
        <View style={{ flex: 1, position: 'relative' }}>
          <TextInput
            value={draft} onChangeText={setDraft} placeholder="Write a message…" placeholderTextColor={c.faint}
            accessibilityLabel="Message" multiline
            style={{
              minHeight: 42, maxHeight: 110, borderRadius: RADIUS.lg,
              paddingLeft: 14, paddingRight: 38, paddingTop: 11, paddingBottom: 11,
              backgroundColor: c.canvas, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
              color: c.ink, fontSize: 14.5,
            }}
          />
          <Tap onPress={() => setDraft((d) => `${d}🙂`)} accessibilityLabel="Add emoji"
            style={{ position: 'absolute', right: 8, top: 10, padding: 4 }}>
            <Smile size={17} color={c.faint} />
          </Tap>
        </View>
        <Tap onPress={() => send(draft)} disabled={!draft.trim()} accessibilityLabel="Send"
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() ? 1 : 0.35 }}>
          <Send size={17} color={c.onInk} />
        </Tap>
      </View>
    </KeyboardAvoidingView>
  )
}
