import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, MessageSquarePlus, Search, Send } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { USERS, userById } from '@/lib/shared/users'
import { timeAgo } from '@/lib/shared/utils'
import { RADIUS } from '@/theme/tokens'
import { Sheet } from '@/components/Sheets'
import { Avatar, EmptyState, Tap, Txt, Verified } from '@/components/UI'

export default function MessagesList() {
  const { state, dispatch, me, toast } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [newChat, setNewChat] = useState(false)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.conversations.filter((cv) => {
      if (!q) return true
      const u = userById(cv.userId)
      return u.name.toLowerCase().includes(q) || u.handle.includes(q) || cv.messages.some((m) => m.text?.toLowerCase().includes(q))
    })
  }, [state.conversations, query])

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingBottom: 4 }}>
        <Tap onPress={() => router.back()} accessibilityLabel="Back" style={{ padding: 10 }}>
          <ArrowLeft size={21} color={c.muted} />
        </Tap>
        <Txt family="display" size={21} style={{ flex: 1 }}>Messages</Txt>
        <Tap onPress={() => setNewChat(true)} accessibilityLabel="New conversation" style={{ padding: 10 }}>
          <MessageSquarePlus size={19} color={c.muted} />
        </Tap>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 9, height: 42, borderRadius: 999, paddingHorizontal: 14,
          backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
        }}>
          <Search size={15} color={c.faint} />
          <TextInput
            value={query} onChangeText={setQuery} placeholder="Search conversations" placeholderTextColor={c.faint}
            accessibilityLabel="Search conversations" style={{ flex: 1, fontSize: 14, color: c.ink }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <EmptyState icon={<Send size={20} color={c.faint} />} title="No conversations" body="Your conversations will appear here." />
        ) : (
          list.map((cv) => {
            const u = userById(cv.userId)
            const last = cv.messages[cv.messages.length - 1]
            const unread = cv.messages.some((m) => m.from === 'them' && !m.read)
            return (
              <Tap key={cv.id} onPress={() => router.push({ pathname: '/messages/[id]', params: { id: cv.id } })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: RADIUS.lg }}>
                <Avatar user={u} size={46} ring={unread} onPress={() => router.push({ pathname: '/messages/[id]', params: { id: cv.id } })} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Txt size={14} weight="semi" numberOfLines={1} style={{ flexShrink: 1 }}>{u.name}</Txt>
                    {u.verified && <Verified />}
                    <View style={{ flex: 1 }} />
                    <Txt size={11.5} color={c.faint}>{last ? timeAgo(last.minutesAgo) : ''}</Txt>
                  </View>
                  <Txt size={13} color={cv.typing ? c.ember : unread ? c.ink : c.muted} numberOfLines={1} style={{ marginTop: 2 }}
                    weight={unread ? 'medium' : 'regular'}>
                    {cv.typing ? 'typing…' : last?.text ?? (last?.art ? 'Sent an image' : 'Say hello')}
                  </Txt>
                </View>
                {unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.ember }} />}
              </Tap>
            )
          })
        )}
      </ScrollView>

      <Sheet open={newChat} onClose={() => setNewChat(false)} title="New conversation">
        <View style={{ paddingHorizontal: 10 }}>
          {USERS.filter((u) => u.id !== me.id).map((u) => (
            <Tap key={u.id}
              onPress={() => {
                dispatch({ type: 'startConversation', userId: u.id })
                setNewChat(false)
                toast(`Started a conversation with ${u.name.split(' ')[0]}`)
                setTimeout(() => router.push({ pathname: '/messages/[id]', params: { id: `cv_${u.id}` } }), 120)
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: RADIUS.md }}>
              <Avatar user={u} size={40} onPress={() => {}} />
              <View>
                <Txt size={14} weight="semi">{u.name}</Txt>
                <Txt size={12} color={c.faint}>@{u.handle}</Txt>
              </View>
            </Tap>
          ))}
        </View>
      </Sheet>
    </View>
  )
}
