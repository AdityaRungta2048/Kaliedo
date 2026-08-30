import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { ArrowLeft, Bookmark, CalendarDays, MapPin, Settings as SettingsIcon, Share2 } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { USERS } from '@/lib/shared/users'
import { compact } from '@/lib/shared/utils'
import { RADIUS } from '@/theme/tokens'
import { PostBlock } from '@/components/PostBlock'
import { FollowButton } from '@/components/PostActions'
import { Avatar, Button, Chip, EmptyState, Tap, Txt, Verified } from '@/components/UI'

type Tab = 'posts' | 'saved' | 'interests'

export function ProfileScreen({ handle, self }: { handle?: string; self?: boolean }) {
  const { state, dispatch, me, toast } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('posts')

  const user = useMemo(() => {
    if (self) return me
    const found = USERS.find((u) => u.handle === handle)
    return found?.id === me.id ? me : found
  }, [self, handle, me])

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
        <EmptyState icon={<Bookmark size={22} color={c.faint} />} title="No such writer"
          body="That profile does not exist in the prototype."
          action={<Button label="Back to Discover" onPress={() => router.replace('/discover')} />} />
      </View>
    )
  }

  const isMe = user.id === me.id
  const posts = state.posts.filter((p) => p.authorId === user.id)
  const saved = state.posts.filter((p) => state.saves.includes(p.id))
  const shown = tab === 'saved' ? saved : posts

  const tabs: { id: Tab; label: string }[] = [
    { id: 'posts', label: isMe ? 'Your writing' : 'Writing' },
    ...(isMe ? [{ id: 'saved' as Tab, label: 'Saved' }] : []),
    { id: 'interests', label: 'Interests' },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      {!self && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 4 }}>
          <Tap onPress={() => router.back()} accessibilityLabel="Back" style={{ padding: 10 }}>
            <ArrowLeft size={21} color={c.muted} />
          </Tap>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{
          borderRadius: RADIUS.xl, padding: 18, marginTop: self ? 8 : 0,
          backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
        }}>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
            <Avatar user={user} size={72} onPress={() => {}} />
            <View style={{ flex: 1, paddingTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Txt family="display" size={21} numberOfLines={1} style={{ flexShrink: 1, letterSpacing: -0.4 }}>{user.name}</Txt>
                {user.verified && <Verified size={17} />}
              </View>
              <Txt size={13.5} color={c.muted}>@{user.handle}{user.pronouns ? ` · ${user.pronouns}` : ''}</Txt>
            </View>
          </View>

          <Txt family="read" size={15} style={{ marginTop: 14, lineHeight: 24 }}>{user.bio}</Txt>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
            {user.location ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MapPin size={12} color={c.faint} /><Txt size={12.5} color={c.faint}>{user.location}</Txt>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <CalendarDays size={12} color={c.faint} /><Txt size={12.5} color={c.faint}>Joined {user.joined}</Txt>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
            {[
              { label: 'Pieces', value: posts.length },
              { label: 'Readers', value: user.followers + (state.following.includes(user.id) && !isMe ? 1 : 0) },
              { label: 'Reading', value: isMe ? state.following.length : user.following },
            ].map((s) => (
              <Tap key={s.label} onPress={() => toast(`${compact(s.value)} ${s.label.toLowerCase()}`, 'info')} scaleTo={0.94}>
                <Txt family="display" size={18}>{compact(s.value)}</Txt>
                <Txt size={12} color={c.muted}>{s.label}</Txt>
              </Tap>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
            {isMe ? (
              <>
                <Button label="Edit profile" variant="outline" icon={<SettingsIcon size={14} color={c.ink} />} onPress={() => router.push('/settings')} full />
                <Button label="Share" variant="ghost" icon={<Share2 size={14} color={c.muted} />}
                  onPress={async () => { await Clipboard.setStringAsync(`https://kaleida.app/u/${user.handle}`); toast('Profile link copied') }} />
              </>
            ) : (
              <>
                <FollowButton userId={user.id} full />
                <Button label="Message" variant="outline" full
                  onPress={() => { dispatch({ type: 'startConversation', userId: user.id }); router.push('/messages') }} />
              </>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 4, marginTop: 18, borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.line }}>
          {tabs.map((t) => (
            <Tap key={t.id} onPress={() => setTab(t.id)} scaleTo={0.96}
              style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: tab === t.id ? c.ink : 'transparent' }}>
              <Txt size={13.5} weight="medium" color={tab === t.id ? c.ink : c.muted}>{t.label}</Txt>
            </Tap>
          ))}
        </View>

        <View style={{ marginTop: 18 }}>
          {tab === 'interests' ? (
            <Animated.View entering={FadeIn.duration(240)}>
              <Txt size={13.5} color={c.muted} style={{ marginBottom: 14, lineHeight: 21 }}>
                {isMe ? 'What Kaleida uses to compose your feed. Tap to follow or unfollow a topic.' : `What ${user.name.split(' ')[0]} reads and writes about.`}
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {user.interests.map((t) => (
                  <Chip key={t} label={t} active={state.followedTopics.includes(t)}
                    onPress={() => { dispatch({ type: 'toggleFollowTopic', topic: t }); toast(state.followedTopics.includes(t) ? `Unfollowed ${t}` : `Following ${t}`) }} />
                ))}
              </View>
            </Animated.View>
          ) : shown.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={22} color={c.faint} />}
              title={tab === 'saved' ? 'No saved posts' : 'Nothing published yet'}
              body={tab === 'saved' ? 'Save something worth coming back to.' : isMe ? 'Your first piece is one tap away.' : 'This writer has not published here yet.'}
              action={isMe && tab !== 'saved' ? <Button label="Write something" onPress={() => router.push('/create')} /> : undefined}
            />
          ) : (
            <View style={{ gap: 14 }}>
              {shown.map((p, i) => <PostBlock key={p.id} post={p} index={i} />)}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
