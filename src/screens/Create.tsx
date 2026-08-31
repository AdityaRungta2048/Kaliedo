import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, FileText, ImagePlus, Sparkles, Trash2, VenetianMask } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { tintFor } from '@/lib/topics'
import { classifyTopics } from '@/lib/classify'
import type { Art, ArtMotif, Post, PostKind } from '@/lib/types'
import { cx, readTime } from '@/lib/utils'
import { CoverArt } from '@/components/brand/CoverArt'
import { Avatar, Button, Pressable, Switch } from '@/components/ui/Primitives'
import { AvatarArt } from '@/components/brand/CoverArt'
import { ANON_USER } from '@/lib/identity'
import { T_BASE } from '@/lib/motion'

const KINDS: { id: PostKind; label: string; blurb: string }[] = [
  { id: 'essay', label: 'Essay', blurb: 'Something with a beginning and an end' },
  { id: 'note', label: 'Note', blurb: 'A short thought, finished' },
  { id: 'field-note', label: 'Field note', blurb: 'Written somewhere, about being there' },
]

const MOTIFS: ArtMotif[] = ['facets', 'strata', 'orbit', 'weave', 'dunes', 'aperture']

const STEPS = ['Type', 'Write', 'Image', 'Preview']

export function Create() {
  const { dispatch, me, toast } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [kind, setKind] = useState<PostKind>('essay')
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [art, setArt] = useState<Art | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const paragraphs = useMemo(() => bodyText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean), [bodyText])
  // Kaleido reads the piece and files it. The writer never picks, so nobody can
  // buy reach with better tags.
  const topics = useMemo(() => classifyTopics(title, paragraphs), [title, paragraphs])

  const go = (next: number) => { setDir(next > step ? 1 : -1); setStep(next) }

  const canAdvance =
    step === 1 ? title.trim().length > 2 && paragraphs.length > 0 : true

  const publish = () => {
    setPublishing(true)
    const post: Post = {
      id: `p_new_${Date.now()}`,
      authorId: me.id, kind, title: title.trim(),
      body: paragraphs, topics, minutesAgo: 0, likes: 0, reposts: 0, comments: [],
      art: photo ? undefined : art ?? undefined,
      photo: photo ?? undefined,
      concepts: topics.map((t) => t.toLowerCase()),
      anonymous: anonymous || undefined,
    }
    window.setTimeout(() => {
      dispatch({ type: 'addPost', post })
      toast(anonymous ? 'Published anonymously' : 'Published to your feed', 'check')
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

              {paragraphs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-2xl border border-line bg-canvas p-4"
                >
                  <p className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                    <Sparkles size={13} className="text-ember" /> Kaleido is filing this under
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {topics.map((t) => (
                      <motion.span key={t} layout transition={T_BASE} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="chip">
                        {t}
                      </motion.span>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-faint">
                    Topics come from what you wrote, not from tags you choose. Nobody on Kaleido can buy reach with
                    better hashtags, so keep writing and they will settle.
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {step === 2 && (
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

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">How it will look</h2>

              <div className="rounded-2xl border border-line bg-canvas">
                <div className="flex items-start gap-3 p-4">
                  <VenetianMask size={17} className="mt-0.5 shrink-0 text-muted" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="flex-1 text-[14px] font-medium text-ink">Publish anonymously</p>
                      <Switch checked={anonymous} onChange={setAnonymous} label="Publish anonymously" />
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                      {anonymous
                        ? 'This publishes as Anonymous — the same name every anonymous post carries, so nothing links this piece to anything else you have written. It still earns reach, replies and saves, and appears in the normal feed alongside everything else. You can put your real name on it later; a signed post can never be made anonymous.'
                        : 'Your name will appear on this piece. Turn this on before publishing if you would rather it stood on its own.'}
                    </p>
                  </div>
                </div>
              </div>

              <article className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center gap-2.5">
                  {anonymous ? (
                    <>
                      <span className="h-[30px] w-[30px] overflow-hidden rounded-full">
                        <AvatarArt seed={ANON_USER.avatar.seed} palette={ANON_USER.avatar.palette} />
                      </span>
                      <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
                        <VenetianMask size={13} className="text-muted" /> Anonymous
                      </span>
                    </>
                  ) : (
                    <>
                      <Avatar user={me} size={30} link={false} />
                      <span className="text-[13.5px] font-semibold text-ink">{me.name}</span>
                    </>
                  )}
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
                <p className="mt-2.5 text-[11.5px] text-faint">Filed by Kaleido from your writing</p>
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
              {publishing ? 'Publishing…' : anonymous ? 'Publish anonymously' : 'Publish'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
