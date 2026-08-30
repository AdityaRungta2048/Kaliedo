import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Bookmark } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { USERS } from '@/lib/shared/users'
import { compact } from '@/lib/shared/utils'
import { RADIUS } from '@/theme/tokens'
import { PostBlock } from '@/components/PostBlock'
import { FollowButton } from '@/components/PostActions'
import { Avatar, Button, EmptyState, Label, Tap, Txt } from '@/components/UI'

export default function TopicScreen() {
  const { name = '' } = useLocalSearchParams<{ name: string }>()
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const posts = state.posts.filter((p) => p.topics.includes(name))
  const writers = USERS.filter((u) => u.interests.includes(name) && u.id !== 'u_me').slice(0, 5)
  const following = state.followedTopics.includes(name)
  const muted = state.mutedTopics.includes(name)

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <Tap onPress={() => router.back()} accessibilityLabel="Back" style={{ padding: 10 }}>
          <ArrowLeft size={21} color={c.muted} />
        </Tap>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{
          borderRadius: RADIUS.xl, padding: 20,
          backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
        }}>
          <Label>Topic</Label>
          <Txt family="display" size={29} style={{ marginTop: 4, letterSpacing: -0.7 }}>{name}</Txt>
          <Txt size={14} color={c.muted} style={{ marginTop: 6 }}>
            {posts.length} pieces · {compact(writers.length * 8400 + 2100)} readers
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <Button
              label={following ? 'Following topic' : 'Follow topic'}
              variant={following ? 'outline' : 'primary'}
              onPress={() => { dispatch({ type: 'toggleFollowTopic', topic: name }); toast(following ? `Unfollowed ${name}` : `Following ${name}`) }}
            />
            <Button
              label={muted ? 'Unmute' : 'Show less'} variant="ghost"
              onPress={() => { dispatch({ type: 'toggleMuteTopic', topic: name }); toast(muted ? `${name} unmuted` : `${name} muted`) }}
            />
          </View>
        </View>

        {writers.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Label>Writers in {name}</Label>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 10 }}>
              {writers.map((u) => (
                <View key={u.id} style={{
                  width: 158, alignItems: 'center', gap: 9, padding: 16, borderRadius: RADIUS.lg,
                  backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                }}>
                  <Avatar user={u} size={46} />
                  <Txt size={13.5} weight="semi" numberOfLines={1}>{u.name}</Txt>
                  <FollowButton userId={u.id} size="sm" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ marginTop: 26 }}>
          <Label>Latest in {name}</Label>
          <View style={{ marginTop: 12, gap: 14 }}>
            {posts.length === 0 ? (
              <EmptyState icon={<Bookmark size={22} color={c.faint} />} title="Quiet in here"
                body="Nobody has published in this topic yet. Yours could be the first." />
            ) : (
              posts.map((p, i) => <PostBlock key={p.id} post={p} index={i} />)
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
