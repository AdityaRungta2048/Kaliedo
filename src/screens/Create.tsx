import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, FileText, ImagePlus, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { LEXICON, ONBOARDING_TOPICS, tintFor } from '@/lib/topics'
import type { Art, ArtMotif, Post, PostKind } from '@/lib/types'
import { cx, readTime } from '@/lib/utils'
import { CoverArt } from '@/components/brand/CoverArt'
import { Avatar, Button, Pressable, TopicChip } from '@/components/ui/Primitives'

const KINDS: { id: PostKind; label: string; blurb: string }[] = [
  { id: 'essay', label: 'Essay', blurb: 'Something with a beginning and an end' },
  { id: 'note', label: 'Note', blurb: 'A short thought, finished' },
  { id: 'field-note', label: 'Field note', blurb: 'Written somewhere, about being there' },
]

const MOTIFS: ArtMotif[] = ['facets', 'strata', 'orbit', 'weave', 'dunes', 'aperture']

/** Topics suggested from the writing itself — the same lexicon the feed uses. */
function suggestTopics(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
  const score = new Map<string, number>()
  for (const w of words) {
    for (const t of LEXICON[w] ?? []) score.set(t, (score.get(t) ?? 0) + 1)
  }
  return Array.from(score.entries()).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 5)
}

const STEPS = ['Type', 'Write', 'Topics', 'Image', 'Preview']

export function Create() {
  const { dispatch, me, toast } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [kind, setKind] = useState<PostKind>('essay')
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [customTopic, setCustomTopic] = useState('')
  const [art, setArt] = useState<Art | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const paragraphs = useMemo(() => bodyText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean), [bodyText])
  const suggested = useMemo(() => suggestTopics(`${title} ${bodyText}`), [title, bodyText])

  const go = (next: number) => { setDir(next > step ? 1 : -1); setStep(next) }

  const canAdvance =
    step === 0 ? true :
    step === 1 ? title.trim().length > 2 && paragraphs.length > 0 :
    step === 2 ? topics.length > 0 :
    true

  const publish = () => {
    setPublishing(true)
    const post: Post = {
      id: `p_new_${Date.now()}`,
      authorId: me.id, kind, title: title.trim(),
      body: paragraphs, topics, minutesAgo: 0, likes: 0, reposts: 0, comments: [],
      art: photo ? undefined : art ?? undefined,
      photo: photo ?? undefined,
      concepts: suggestTopics(bodyText),
    }
    window.setTimeout(() => {
      dispatch({ type: 'addPost', post })
      toast('Published to your feed', 'check')
      navigate('/')
    }, 700)
  }

  const pickFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setPhoto(String(reader.result)); setArt(null) }
    reader.readAsDataURL(file)
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-4 sm:px-6 lg:pt-8">
      <header className="flex items-center gap-3">
        <Pressable onClick={() => (step === 0 ? navigate(-1) : go(step - 1))} aria-label="Back"
          className="rounded-full p-2 text-muted hover:bg-ink/5 hover:text-ink">
          <ArrowLeft size={19} />
        </Pressable>
        <div>
          <h1 className="font-display text-[19px] font-semibold tracking-[-0.02em] text-ink">Write</h1>
          <p className="text-[12px] text-faint">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
        </div>
      </header>

      <div className="mt-4 flex gap-1.5">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => i < step && go(i)} aria-label={`Step ${i + 1}: ${s}`}
            className="h-1 flex-1 overflow-hidden rounded-full bg-ink/[0.08]" disabled={i > step}>
            <motion.span className="block h-full rounded-full bg-ember" initial={false}
              animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step} custom={dir}
          initial={{ opacity: 0, x: dir * 26 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -26 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink">What are you making?</h2>
              {KINDS.map((k) => (
                <Pressable key={k.id} onClick={() => { setKind(k.id); go(1) }}
                  className={cx('flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors',
                    kind === k.id ? 'border-ink bg-ink/[0.04]' : 'border-line bg-surface hover:bg-ink/[0.02]')}>
                  <FileText size={20} className="text-muted" />
                  <span className="flex-1">
                    <span className="block font-display text-[16px] font-semibold text-ink">{k.label}</span>
                    <span className="block text-[13px] text-muted">{k.blurb}</span>
                  </span>
                  <ArrowRight size={16} className="text-faint" />
                </Pressable>
              ))}
            </div>
          )}

          {step === 1 && (
            <div>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A title worth clicking" aria-label="Title"
                className="w-full bg-transparent font-display text-[26px] font-semibold leading-tight tracking-[-0.025em] text-ink outline-none placeholder:text-faint/60 sm:text-[32px]"
              />
              <div className="my-4 h-px bg-line" />
              <textarea
                value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={12} aria-label="Body"
                placeholder={'Start anywhere. Leave a blank line between paragraphs.\n\nKaleido reads what you write to suggest topics — you can change all of them.'}
                className="prose-kaleido w-full resize-none bg-transparent outline-none placeholder:text-faint/60"
              />
              <p className="mt-2 text-[12px] text-faint">
                {paragraphs.length} paragraph{paragraphs.length === 1 ? '' : 's'} · {readTime(paragraphs)} min read
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">Topics</h2>
                <p className="mt-1 text-[13.5px] text-muted">Kaleido read your draft and suggested these. Keep what fits.</p>
              </div>

              {suggested.length > 0 && (
                <section>
                  <p className="label-xs mb-2 flex items-center gap-1.5"><Sparkles size={11} className="text-ember" /> Suggested from your writing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggested.map((t) => (
                      <TopicChip key={t} topic={t} active={topics.includes(t)}
                        onClick={() => setTopics((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])} />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <p className="label-xs mb-2">All topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {ONBOARDING_TOPICS.map((t) => (
                    <TopicChip key={t} topic={t} active={topics.includes(t)}
                      onClick={() => setTopics((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])} />
                  ))}
                </div>
              </section>

              <section>
                <p className="label-xs mb-2">Add your own</p>
                <div className="flex gap-2">
                  <input
                    value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="e.g. Bookbinding" aria-label="Custom topic"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customTopic.trim()) {
                        setTopics((c) => [...new Set([...c, customTopic.trim()])]); setCustomTopic('')
                      }
                    }}
                    className="h-10 flex-1 rounded-xl border border-line bg-surface px-3.5 text-[14px] text-ink outline-none placeholder:text-faint focus:border-ink/30"
                  />
                  <Button variant="outline" onClick={() => { if (customTopic.trim()) { setTopics((c) => [...new Set([...c, customTopic.trim()])]); setCustomTopic('') } }}>
                    <Plus size={14} /> Add
                  </Button>
                </div>
              </section>

              {topics.length > 0 && (
                <section className="rounded-2xl border border-line bg-surface p-4">
                  <p className="label-xs mb-2">On this piece</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((t) => (
                      <span key={t} className="chip border-ink bg-ink text-canvas">
                        {t}
                        <button onClick={() => setTopics((c) => c.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="ml-0.5">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">An image, if you want one</h2>
                <p className="mt-1 text-[13.5px] text-muted">It goes after your writing — readers meet the words first.</p>
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => fileRef.current?.click()}><ImagePlus size={14} /> Upload an image</Button>
                <Button variant="outline" onClick={() => { setPhoto(null); setArt({ seed: Math.floor(Math.random() * 9999), motif: MOTIFS[Math.floor(Math.random() * MOTIFS.length)], palette: tintFor(topics), ratio: '4:3' }) }}>
                  <Sparkles size={14} /> Generate a cover
                </Button>
                {(art || photo) && (
                  <Button variant="ghost" onClick={() => { setArt(null); setPhoto(null) }}><Trash2 size={14} /> Remove</Button>
                )}
              </div>

              {(art || photo) ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-line">
                  {photo ? <img src={photo} alt="Your upload" className="block w-full" /> : art && <CoverArt art={art} />}
                </motion.div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line text-[13.5px] text-faint">
                  Text-only is a perfectly good choice.
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">How it will look</h2>

              <article className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center gap-2.5">
                  <Avatar user={me} size={30} link={false} />
                  <span className="text-[13.5px] font-semibold text-ink">{me.name}</span>
                  <span className="text-[12.5px] text-faint">· now</span>
                </div>
                <h3 className="mt-3 font-display text-[21px] font-semibold leading-tight tracking-[-0.02em] text-ink">{title || 'Untitled'}</h3>
                <div className="prose-kaleido mt-3 text-[15px]">
                  {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
                {(art || photo) && (
                  <figure className="mt-5 overflow-hidden rounded-xl border border-line">
                    {photo ? <img src={photo} alt="" className="block w-full" /> : art && <CoverArt art={art} />}
                  </figure>
                )}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {topics.map((t) => <span key={t} className="chip">{t}</span>)}
                </div>
              </article>

              <p className="text-[12.5px] text-faint">
                In the feed this shows as a block: your name, the title, and the first two lines. Readers open it to get the rest.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-[58px] z-20 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-xl safe-bottom lg:sticky lg:bottom-0 lg:mt-8 lg:rounded-2xl lg:border lg:px-4">
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          {step > 0 && <Button variant="ghost" onClick={() => go(step - 1)}>Back</Button>}
          <span className="flex-1" />
          {step < STEPS.length - 1 ? (
            <Button onClick={() => go(step + 1)} disabled={!canAdvance}>
              Continue <ArrowRight size={14} />
            </Button>
          ) : (
            <Button variant="accent" size="lg" onClick={publish} disabled={publishing}>
              {publishing ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Sparkles size={15} /></motion.span> : <Check size={15} />}
              {publishing ? 'Publishing…' : 'Publish'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
