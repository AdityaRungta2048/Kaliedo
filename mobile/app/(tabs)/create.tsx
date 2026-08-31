import { useMemo, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { ArrowLeft, ArrowRight, Check, FileText, ImagePlus, Sparkles, Trash2, VenetianMask, X } from 'lucide-react-native'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { LEXICON, ONBOARDING_TOPICS, tintFor } from '@/lib/shared/topics'
import type { Art, ArtMotif, Post, PostKind } from '@/lib/shared/types'
import { readTime } from '@/lib/shared/utils'
import { RADIUS } from '@/theme/tokens'
import { AvatarArt, CoverArt } from '@/components/Art'
import { anonPersona } from '@/lib/shared/identity'
import { Avatar, Button, Chip, Label, Switch, Tap, Txt } from '@/components/UI'

const KINDS: { id: PostKind; label: string; blurb: string }[] = [
  { id: 'essay', label: 'Essay', blurb: 'Something with a beginning and an end' },
  { id: 'note', label: 'Note', blurb: 'A short thought, finished' },
  { id: 'field-note', label: 'Field note', blurb: 'Written somewhere, about being there' },
]

const MOTIFS: ArtMotif[] = ['facets', 'strata', 'orbit', 'weave', 'dunes', 'aperture']
const STEPS = ['Type', 'Write', 'Topics', 'Image', 'Preview']

/** Topics suggested from the writing itself, using the same lexicon the feed uses. */
function suggestTopics(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
  const score = new Map<string, number>()
  for (const w of words) for (const t of LEXICON[w] ?? []) score.set(t, (score.get(t) ?? 0) + 1)
  return Array.from(score.entries()).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 5)
}

export default function Create() {
  const { dispatch, me, toast } = useApp()
  const { c } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [kind, setKind] = useState<PostKind>('essay')
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [art, setArt] = useState<Art | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const persona = useMemo(() => anonPersona(me.id), [me.id])

  const paragraphs = useMemo(() => bodyText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean), [bodyText])
  const suggested = useMemo(() => suggestTopics(`${title} ${bodyText}`), [title, bodyText])

  const canAdvance =
    step === 1 ? title.trim().length > 2 && paragraphs.length > 0
    : step === 2 ? topics.length > 0
    : true

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) { toast('Photo access is off — a generated cover works too', 'info'); return }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })
    if (!res.canceled && res.assets[0]) { setPhoto(res.assets[0].uri); setArt(null) }
  }

  const publish = () => {
    setPublishing(true)
    const post: Post = {
      id: `p_new_${Date.now()}`,
      authorId: me.id, kind, title: title.trim(), body: paragraphs, topics,
      minutesAgo: 0, likes: 0, reposts: 0, comments: [],
      art: photo ? undefined : art ?? undefined,
      photo: photo ?? undefined,
      concepts: suggestTopics(bodyText),
      anonymous: anonymous || undefined,
    }
    setTimeout(() => {
      dispatch({ type: 'addPost', post })
      toast(anonymous ? 'Published anonymously' : 'Published to your feed', 'check')
      setStep(0); setTitle(''); setBodyText(''); setTopics([]); setArt(null); setPhoto(null); setPublishing(false); setAnonymous(false)
      router.push('/')
    }, 650)
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingBottom: 6 }}>
        <Tap onPress={() => (step === 0 ? router.push('/') : setStep(step - 1))} accessibilityLabel="Back" style={{ padding: 8 }}>
          <ArrowLeft size={21} color={c.muted} />
        </Tap>
        <View>
          <Txt family="display" size={19}>Write</Txt>
          <Txt size={12} color={c.faint}>Step {step + 1} of {STEPS.length} · {STEPS[step]}</Txt>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 16, paddingBottom: 4 }}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flex: 1, height: 3, borderRadius: 999, backgroundColor: i <= step ? c.ember : c.line }} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View key={step} entering={SlideInRight.duration(280)} exiting={SlideOutLeft.duration(180)}>
          {step === 0 && (
            <View style={{ gap: 12 }}>
              <Txt family="display" size={24} style={{ letterSpacing: -0.5 }}>What are you making?</Txt>
              {KINDS.map((k) => (
                <Tap key={k.id} onPress={() => { setKind(k.id); setStep(1) }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 15, padding: 16, borderRadius: RADIUS.lg,
                    backgroundColor: kind === k.id ? c.ink + '0A' : c.surface,
                    borderWidth: StyleSheet.hairlineWidth * 2, borderColor: kind === k.id ? c.ink : c.line,
                  }}>
                  <FileText size={20} color={c.muted} />
                  <View style={{ flex: 1 }}>
                    <Txt family="display" size={16}>{k.label}</Txt>
                    <Txt size={13} color={c.muted} style={{ marginTop: 2 }}>{k.blurb}</Txt>
                  </View>
                  <ArrowRight size={16} color={c.faint} />
                </Tap>
              ))}
            </View>
          )}

          {step === 1 && (
            <View>
              <TextInput
                value={title} onChangeText={setTitle} placeholder="A title worth tapping" placeholderTextColor={c.faint}
                accessibilityLabel="Title" multiline
                style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 26, lineHeight: 33, color: c.ink }}
              />
              <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: c.line, marginVertical: 16 }} />
              <TextInput
                value={bodyText} onChangeText={setBodyText} multiline accessibilityLabel="Body"
                placeholder={'Start anywhere. Leave a blank line between paragraphs.\n\nKaleido reads what you write to suggest topics — you can change all of them.'}
                placeholderTextColor={c.faint}
                style={{ fontFamily: 'Newsreader_400Regular', fontSize: 17, lineHeight: 28, color: c.ink, minHeight: 260, textAlignVertical: 'top' }}
              />
              <Txt size={12} color={c.faint} style={{ marginTop: 10 }}>
                {paragraphs.length} paragraph{paragraphs.length === 1 ? '' : 's'} · {readTime(paragraphs)} min read
              </Txt>
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: 22 }}>
              <View>
                <Txt family="display" size={22} style={{ letterSpacing: -0.4 }}>Topics</Txt>
                <Txt size={13.5} color={c.muted} style={{ marginTop: 4 }}>Kaleido read your draft and suggested these. Keep what fits.</Txt>
              </View>

              {suggested.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Sparkles size={11} color={c.ember} /><Label>Suggested from your writing</Label>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                    {suggested.map((t) => (
                      <Chip key={t} label={t} active={topics.includes(t)}
                        onPress={() => setTopics((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])} />
                    ))}
                  </View>
                </View>
              )}

              <View>
                <Label>All topics</Label>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                  {ONBOARDING_TOPICS.map((t) => (
                    <Chip key={t} label={t} active={topics.includes(t)}
                      onPress={() => setTopics((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])} />
                  ))}
                </View>
              </View>

              {topics.length > 0 && (
                <View style={{ padding: 14, borderRadius: RADIUS.lg, backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line }}>
                  <Label>On this piece</Label>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                    {topics.map((t) => (
                      <Tap key={t} onPress={() => setTopics((cur) => cur.filter((x) => x !== t))}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 5,
                          paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: c.ink,
                        }}>
                        <Txt size={12.5} weight="medium" color={c.onInk}>{t}</Txt>
                        <X size={11} color={c.onInk} />
                      </Tap>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View style={{ gap: 18 }}>
              <View>
                <Txt family="display" size={22} style={{ letterSpacing: -0.4 }}>An image, if you want one</Txt>
                <Txt size={13.5} color={c.muted} style={{ marginTop: 4, lineHeight: 20 }}>
                  It goes after your writing — readers meet the words first.
                </Txt>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Button label="Choose a photo" variant="outline" icon={<ImagePlus size={14} color={c.ink} />} onPress={() => void pickImage()} />
                <Button label="Generate a cover" variant="outline" icon={<Sparkles size={14} color={c.ink} />}
                  onPress={() => { setPhoto(null); setArt({ seed: Math.floor(Math.random() * 9999), motif: MOTIFS[Math.floor(Math.random() * MOTIFS.length)], palette: tintFor(topics), ratio: '4:3' }) }} />
                {(art || photo) && (
                  <Button label="Remove" variant="ghost" icon={<Trash2 size={14} color={c.muted} />} onPress={() => { setArt(null); setPhoto(null) }} />
                )}
              </View>

              {art || photo ? (
                <Animated.View entering={FadeIn.duration(280)} style={{ borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line }}>
                  {photo
                    ? <Image source={{ uri: photo }} style={{ width: '100%', aspectRatio: 4 / 3 }} resizeMode="cover" />
                    : art && <CoverArt art={art} width={340} />}
                </Animated.View>
              ) : (
                <View style={{
                  height: 150, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.line,
                }}>
                  <Txt size={13.5} color={c.faint}>Text-only is a perfectly good choice.</Txt>
                </View>
              )}
            </View>
          )}

          {step === 4 && (
            <View style={{ gap: 14 }}>
              <Txt family="display" size={22} style={{ letterSpacing: -0.4 }}>How it will look</Txt>
              <View style={{
                flexDirection: 'row', gap: 11, padding: 14, borderRadius: RADIUS.lg,
                backgroundColor: c.canvas, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line,
              }}>
                <VenetianMask size={17} color={c.muted} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Txt size={14} weight="medium" style={{ flex: 1 }}>Publish anonymously</Txt>
                    <Switch value={anonymous} onChange={setAnonymous} />
                  </View>
                  <Txt size={12.5} color={c.muted} style={{ marginTop: 5, lineHeight: 19 }}>
                    {anonymous
                      ? `This publishes as ${persona.name}, the handle all your anonymous writing shares. It still earns reach and replies, and appears in the normal feed alongside everything else. You can put your real name on it later — but a signed post can never be made anonymous.`
                      : 'Your name will appear on this piece. Turn this on if you would rather it stood on its own.'}
                  </Txt>
                  {anonymous && (
                    <Txt size={12} color={c.faint} style={{ marginTop: 7, lineHeight: 18 }}>
                      Worth knowing: because the handle is the same every time, someone reading enough of your
                      anonymous work on one subject could guess who you are.
                    </Txt>
                  )}
                </View>
              </View>

              <View style={{ padding: 18, borderRadius: RADIUS.lg, backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                  {anonymous ? (
                    <>
                      <View style={{ width: 30, height: 30, borderRadius: 15, overflow: 'hidden' }}>
                        <AvatarArt seed={persona.avatar.seed} palette={persona.avatar.palette} size={30} />
                      </View>
                      <VenetianMask size={13} color={c.muted} />
                      <Txt size={13.5} weight="semi">{persona.name}</Txt>
                    </>
                  ) : (
                    <>
                      <Avatar user={me} size={30} onPress={() => {}} />
                      <Txt size={13.5} weight="semi">{me.name}</Txt>
                    </>
                  )}
                  <Txt size={12.5} color={c.faint}>· now</Txt>
                </View>
                <Txt family="display" size={21} style={{ marginTop: 12, lineHeight: 27 }}>{title || 'Untitled'}</Txt>
                <View style={{ marginTop: 12, gap: 13 }}>
                  {paragraphs.map((p, i) => <Txt key={i} family="read" size={15.5} style={{ lineHeight: 26 }}>{p}</Txt>)}
                </View>
                {(art || photo) && (
                  <View style={{ marginTop: 18, borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line }}>
                    {photo ? <Image source={{ uri: photo }} style={{ width: '100%', aspectRatio: 4 / 3 }} resizeMode="cover" /> : art && <CoverArt art={art} width={300} />}
                  </View>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                  {topics.map((t) => <Chip key={t} label={t} small />)}
                </View>
              </View>
              <Txt size={12.5} color={c.faint} style={{ lineHeight: 19 }}>
                In the feed this shows as a block: your name, the title, and the first two lines. Readers tap it for the rest.
              </Txt>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
        backgroundColor: c.surface, borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: c.line,
      }}>
        {step > 0 && <Button label="Back" variant="ghost" onPress={() => setStep(step - 1)} />}
        <View style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <Button label="Continue" iconSide="right" icon={<ArrowRight size={14} color={c.onInk} />} disabled={!canAdvance} onPress={() => setStep(step + 1)} />
        ) : (
          <Button label={publishing ? 'Publishing…' : anonymous ? 'Publish anonymously' : 'Publish'} variant="accent" size="lg" loading={publishing}
            icon={<Check size={15} color="#fff" />} onPress={publish} />
        )}
      </View>
    </KeyboardAvoidingView>
  )
}
