import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AtSign, Ban, Bell, EyeOff, Lock, LogOut, Mail, Palette, ShieldCheck, SlidersHorizontal, Tags, User,
} from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { ONBOARDING_TOPICS } from '@/lib/topics'
import { cx } from '@/lib/utils'
import { MixControls } from '@/components/feed/MixControls'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { Button, Pressable, Switch, TopicChip } from '@/components/ui/Primitives'
import { Sheet } from '@/components/ui/Overlay'

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface">
      <h2 className="flex items-center gap-2.5 border-b border-line px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-faint">
        <span className="text-muted">{icon}</span>{title}
      </h2>
      <div className="divide-y divide-line">{children}</div>
    </section>
  )
}

function Row({ label, hint, control, onClick }: { label: string; hint?: string; control?: ReactNode; onClick?: () => void }) {
  const content = (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-medium text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{hint}</p>}
      </div>
      {control}
    </div>
  )
  return onClick ? (
    <Pressable onClick={onClick} className="block w-full text-left transition-colors hover:bg-ink/[0.03]">{content}</Pressable>
  ) : content
}

function TextRow({ label, value, onChange, prefix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <div className="px-5 py-3.5">
      <label className="block text-[12.5px] font-medium text-muted">{label}</label>
      <div className="mt-1.5 flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3">
        {prefix && <span className="text-[14.5px] text-faint">{prefix}</span>}
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="h-10 flex-1 bg-transparent text-[14.5px] text-ink outline-none" />
      </div>
    </div>
  )
}

export function Settings() {
  const { state, dispatch, me, toast, setDemoOpen } = useApp()
  const navigate = useNavigate()
  const [blocked, setBlocked] = useState(false)
  const [notInterested, setNotInterested] = useState(false)

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 px-4 pb-16 pt-5 sm:px-6 lg:pt-9">
      <h1 className="font-display text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">Settings</h1>

      <Section title="Account" icon={<User size={15} />}>
        <TextRow label="Display name" value={state.displayName} onChange={(v) => dispatch({ type: 'patch', patch: { displayName: v } })} />
        <TextRow label="Username" value={me.handle} prefix="@" onChange={() => toast('Usernames are fixed in the prototype', 'info')} />
        <TextRow label="Bio" value={state.bio} onChange={(v) => dispatch({ type: 'patch', patch: { bio: v } })} />
        <Row label="Email" hint="you@kaleido.app" control={<Button variant="ghost" onClick={() => toast('Verification email sent')}><Mail size={14} /> Change</Button>} />
        <Row label="Password" hint="Last changed 3 months ago" control={<Button variant="ghost" onClick={() => toast('Password reset link sent')}>Update</Button>} />
      </Section>

      <Section title="Privacy" icon={<Lock size={15} />}>
        <Row label="Private account" hint="Only approved readers see your writing."
          control={<Switch label="Private account" checked={state.privateAccount} onChange={(v) => { dispatch({ type: 'patch', patch: { privateAccount: v } }); toast(v ? 'Account is private' : 'Account is public') }} />} />
        <Row label="Show activity status" hint="Lets people see when you were last reading."
          control={<Switch label="Activity status" checked={state.activityStatus} onChange={(v) => dispatch({ type: 'patch', patch: { activityStatus: v } })} />} />
        <div className="px-5 py-3.5">
          <p className="text-[14.5px] font-medium text-ink">Who can message you</p>
          <div className="mt-2.5 flex gap-1.5">
            {(['everyone', 'following', 'nobody'] as const).map((v) => (
              <button key={v} onClick={() => dispatch({ type: 'patch', patch: { messagePermission: v } })}
                className={cx('relative rounded-full px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors',
                  state.messagePermission === v ? 'text-canvas' : 'text-muted hover:text-ink')}>
                {state.messagePermission === v && <motion.span layoutId="msg-perm" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="relative">{v === 'following' ? 'People I follow' : v}</span>
              </button>
            ))}
          </div>
        </div>
        <Row label="Blocked accounts" hint="Nobody blocked yet." onClick={() => setBlocked(true)} control={<Ban size={16} className="text-faint" />} />
      </Section>

      <Section title="Content" icon={<Tags size={15} />}>
        <div className="px-5 py-4">
          <p className="text-[14.5px] font-medium text-ink">Your interests</p>
          <p className="mt-0.5 text-[12.5px] text-muted">These shape what Kaleido calls familiar.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ONBOARDING_TOPICS.map((t) => (
              <TopicChip key={t} topic={t} active={state.interests.includes(t)} onClick={() => dispatch({ type: 'toggleTopic', topic: t })} />
            ))}
          </div>
        </div>
        <Row label="Not interested" hint={state.mutedTopics.length ? `${state.mutedTopics.length} topic${state.mutedTopics.length === 1 ? '' : 's'} muted` : 'Nothing muted yet.'}
          onClick={() => setNotInterested(true)} control={<EyeOff size={16} className="text-faint" />} />
        <Row label="Sensitive content" hint="Blur anything flagged before it reaches your feed."
          control={<Switch label="Sensitive content" checked={state.sensitiveFilter} onChange={(v) => dispatch({ type: 'patch', patch: { sensitiveFilter: v } })} />} />
      </Section>

      <Section title="Recommendations" icon={<SlidersHorizontal size={15} />}>
        <div className="px-5 py-5"><MixControls compactHeader /></div>
      </Section>

      <Section title="Appearance" icon={<Palette size={15} />}>
        <div className="px-5 py-4">
          <p className="text-[14.5px] font-medium text-ink">Theme</p>
          <p className="mb-3 mt-0.5 text-[12.5px] text-muted">Both themes are designed separately. Try them.</p>
          <ThemeSwitcher withLabels />
        </div>
      </Section>

      <Section title="Notifications" icon={<Bell size={15} />}>
        {[
          ['Replies to your writing', true],
          ['New followers', true],
          ['Mentions', true],
          ['Trending in your topics', false],
        ].map(([label, def]) => (
          <Row key={String(label)} label={String(label)} control={<NotifSwitch label={String(label)} initial={Boolean(def)} />} />
        ))}
      </Section>

      <Section title="About" icon={<ShieldCheck size={15} />}>
        <Row label="Demo mode" hint="Every dial that shapes this prototype, in one panel." onClick={() => setDemoOpen(true)} control={<SlidersHorizontal size={16} className="text-faint" />} />
        <Row label="Replay onboarding" onClick={() => dispatch({ type: 'patch', patch: { onboarded: false } })} control={<AtSign size={16} className="text-faint" />} />
        <Row label="Reset prototype" hint="Clears likes, saves, follows and drafts."
          onClick={() => { dispatch({ type: 'reset' }); toast('Prototype reset') }} control={<LogOut size={16} className="text-faint" />} />
      </Section>

      <p className="pt-2 text-center text-[12px] text-faint">Kaleido · visual prototype · all data is local to this browser</p>

      <Sheet open={blocked} onClose={() => setBlocked(false)} title="Blocked accounts" size="sm">
        <div className="px-5 pb-8 pt-2 text-center text-[14px] text-muted">
          <p>You have not blocked anyone.</p>
          <p className="mt-1 text-[12.5px] text-faint">Blocked writers never appear in your feed, search, or messages.</p>
        </div>
      </Sheet>

      <Sheet open={notInterested} onClose={() => setNotInterested(false)} title="Not interested" size="sm">
        <div className="px-5 pb-8">
          <p className="mb-3 text-[13.5px] text-muted">Muted topics are removed from every feed. Tap to unmute.</p>
          {state.mutedTopics.length === 0 ? (
            <p className="py-8 text-center text-[13.5px] text-faint">Nothing muted. Use “Show less of this” on any post or topic.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {state.mutedTopics.map((t) => (
                <TopicChip key={t} topic={t} active onClick={() => dispatch({ type: 'toggleMuteTopic', topic: t })} />
              ))}
            </div>
          )}
          <Button variant="outline" className="mt-5 w-full" onClick={() => navigate('/discover')}>Find new topics</Button>
        </div>
      </Sheet>
    </div>
  )
}

function NotifSwitch({ label, initial }: { label: string; initial: boolean }) {
  const [on, setOn] = useState(initial)
  return <Switch label={label} checked={on} onChange={setOn} />
}
