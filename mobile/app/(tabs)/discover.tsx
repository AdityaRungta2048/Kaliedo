import { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { ArrowRight, Search, SearchX, Sparkles, X } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { searchPosts, searchTopics, searchUsers } from '@/lib/shared/search'
import { ADJACENT, ONBOARDING_TOPICS } from '@/lib/shared/topics'
import { USERS } from '@/lib/shared/users'
import { compact } from '@/lib/shared/utils'
import { RADIUS } from '@/theme/tokens'
import { PostBlock } from '@/components/PostBlock'
import { FollowButton } from '@/components/PostActions'
import { Avatar, Chip, EmptyState, Label, SectionTitle, Skeleton, Tap, Txt, Verified } from '@/components/UI'

const SUGGESTIONS = [
  'best places to travel in winter',
  'beginner AI projects',
  'how to finish a draft',
  'cooking as a practice',
]

const TRENDING = ['Writing', 'AI', 'Photography', 'Startups', 'Philosophy', 'Food', 'Design', 'Music', 'Gaming', 'Travel']

export default function Discover() {
  const { state } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (query !== debounced) setSearching(true)
    const t = setTimeout(() => { setDebounced(query); setSearching(false) }, 260)
    return () => clearTimeout(t)
  }, [query, debounced])

  const results = useMemo(() => searchPosts(debounced, state.posts), [debounced, state.posts])
  const people = useMemo(() => searchUsers(debounced, USERS.filter((u) => u.id !== 'u_me')), [debounced])
  const topics = useMemo(() => searchTopics(debounced, ONBOARDING_TOPICS), [debounced])

  const seed = state.interests[0] ?? 'Writing'
  const chain = useMemo(() => {
    const out = [seed]; let cur = seed; const seen = new Set([seed])
    for (let i = 0; i < 4; i++) {
      const next = (ADJACENT[cur] ?? []).find((t) => !seen.has(t))
      if (!next) break
      out.push(next); seen.add(next); cur = next
    }
    return out
  }, [seed])

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Txt family="display" size={27} style={{ marginTop: 8, lineHeight: 33, letterSpacing: -0.6 }}>
          What are you curious about?
        </Txt>
        <Txt size={14} color={c.muted} style={{ marginTop: 8, lineHeight: 21 }}>
          Search the way you would ask a friend. Kaleido reads for meaning, so the words do not have to match.
        </Txt>

        <View style={{ marginTop: 18 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            height: 48, borderRadius: 999, paddingHorizontal: 16,
            backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
          }}>
            <Search size={17} color={c.faint} />
            <TextInput
              value={query} onChangeText={setQuery}
              placeholder="Search people, topics, ideas…" placeholderTextColor={c.faint}
              accessibilityLabel="Search Kaleido"
              style={{ flex: 1, fontSize: 15, color: c.ink }}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Tap onPress={() => setQuery('')} accessibilityLabel="Clear search" style={{ padding: 4 }}>
                <X size={16} color={c.faint} />
              </Tap>
            )}
          </View>
        </View>

        {!debounced && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <Tap key={s} onPress={() => setQuery(s)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
                  borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                }}>
                <Sparkles size={11} color={c.ember} />
                <Txt size={12.5} weight="medium" color={c.muted}>{s}</Txt>
              </Tap>
            ))}
          </ScrollView>
        )}

        {debounced ? (
          <View style={{ marginTop: 24 }}>
            {searching ? (
              <View style={{ gap: 12 }}>
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} h={96} radius={RADIUS.lg} />)}
              </View>
            ) : results.length === 0 && people.length === 0 ? (
              <EmptyState
                icon={<SearchX size={22} color={c.faint} />}
                title="We couldn't find that yet"
                body="Try a different idea — Kaleido works best with a whole thought rather than a keyword."
              />
            ) : (
              <View style={{ gap: 28 }}>
                {topics.length > 0 && (
                  <View>
                    <SectionTitle>Topics that match</SectionTitle>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {topics.map((t) => (
                        <Chip key={t} label={t} onPress={() => router.push({ pathname: '/topic/[name]', params: { name: t } })} />
                      ))}
                    </View>
                  </View>
                )}

                {people.length > 0 && (
                  <View>
                    <SectionTitle>People</SectionTitle>
                    <View style={{ gap: 10 }}>
                      {people.slice(0, 4).map((u) => (
                        <View key={u.id} style={{
                          flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13,
                          borderRadius: RADIUS.lg, backgroundColor: c.surface,
                          borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                        }}>
                          <Avatar user={u} size={42} />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <Txt size={14} weight="semi" numberOfLines={1} style={{ flexShrink: 1 }}>{u.name}</Txt>
                              {u.verified && <Verified />}
                            </View>
                            <Txt size={12.5} color={c.muted} numberOfLines={1}>{u.bio}</Txt>
                          </View>
                          <FollowButton userId={u.id} size="sm" />
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {results.length > 0 && (
                  <View>
                    <SectionTitle>{results.length} {results.length === 1 ? 'piece' : 'pieces'}</SectionTitle>
                    <View style={{ gap: 14 }}>
                      {results.slice(0, 12).map((hit, i) => (
                        <View key={hit.post.id}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6, paddingLeft: 3 }}>
                            <Sparkles size={11} color={c.ember} />
                            <Txt size={11.5} weight="medium" color={c.ember}>{hit.reason}</Txt>
                          </View>
                          <PostBlock post={hit.post} index={i} />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(280)} style={{ marginTop: 28, gap: 32 }}>
            <View>
              <SectionTitle>Trending now</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {TRENDING.map((t, i) => {
                  const count = state.posts.filter((p) => p.topics.includes(t)).length
                  return (
                    <Animated.View key={t} entering={FadeInDown.duration(320).delay(Math.min(i * 35, 280))} style={{ width: '47.6%' }}>
                      <Tap
                        onPress={() => router.push({ pathname: '/topic/[name]', params: { name: t } })}
                        style={{
                          height: 88, borderRadius: RADIUS.lg, padding: 13, justifyContent: 'flex-end',
                          backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                        }}
                      >
                        <ArrowRight size={14} color={c.faint} style={{ position: 'absolute', right: 12, top: 12 }} />
                        <Txt family="display" size={16}>{t}</Txt>
                        <Txt size={11.5} color={c.muted} style={{ marginTop: 2 }}>{count} pieces this week</Txt>
                      </Tap>
                    </Animated.View>
                  )
                })}
              </View>
            </View>

            <View>
              <SectionTitle>Because you read {seed}</SectionTitle>
              <Txt size={13.5} color={c.muted} style={{ marginBottom: 16, lineHeight: 21 }}>
                Kaleido walks outward from what you already like, one step at a time. Five steps in, you are somewhere new.
              </Txt>
              <View style={{ gap: 8 }}>
                {chain.map((t, i) => (
                  <Animated.View key={t} entering={FadeInDown.duration(340).delay(i * 80)}>
                    <Tap
                      onPress={() => router.push({ pathname: '/topic/[name]', params: { name: t } })}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        borderRadius: RADIUS.md, padding: 14,
                        backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                      }}
                    >
                      <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: i === 0 ? c.ember : i < 3 ? c.moss : c.iris }} />
                      <View style={{ flex: 1 }}>
                        <Txt family="display" size={15.5}>{t}</Txt>
                        <Txt size={12} color={c.faint} style={{ marginTop: 1 }}>
                          {i === 0 ? 'where you started' : i < 3 ? 'closely related' : 'a genuine detour'}
                        </Txt>
                      </View>
                      <ArrowRight size={15} color={c.faint} />
                    </Tap>
                  </Animated.View>
                ))}
              </View>
            </View>

            <View>
              <SectionTitle>Writers worth following</SectionTitle>
              <View style={{ gap: 10 }}>
                {USERS.filter((u) => u.id !== 'u_me').slice(0, 6).map((u) => (
                  <View key={u.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13,
                    borderRadius: RADIUS.lg, backgroundColor: c.surface,
                    borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
                  }}>
                    <Avatar user={u} size={44} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Txt size={14} weight="semi" numberOfLines={1} style={{ flexShrink: 1 }}>{u.name}</Txt>
                        {u.verified && <Verified />}
                      </View>
                      <Txt size={12.5} color={c.muted} numberOfLines={2} style={{ lineHeight: 17 }}>{u.bio}</Txt>
                      <Txt size={11.5} color={c.faint} style={{ marginTop: 3 }}>{compact(u.followers)} readers</Txt>
                    </View>
                    <FollowButton userId={u.id} size="sm" />
                  </View>
                ))}
              </View>
            </View>

            <Label>Kaleido prototype · all data is local to this device</Label>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  )
}
