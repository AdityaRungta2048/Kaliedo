import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { AvatarArt } from '@/components/brand/CoverArt'
import type { User } from '@/lib/types'
import { cx } from '@/lib/utils'
import { T_BASE, T_FAST } from '@/lib/motion'

const PRESS = { scale: 0.96 }

/** Every tappable thing in Kaleido uses the same press physics. */
export const Pressable = forwardRef<HTMLButtonElement, HTMLMotionProps<'button'>>(
  function Pressable({ className, children, ...rest }, ref) {
    return (
      <motion.button
        ref={ref} whileTap={PRESS} transition={T_FAST}
        className={cx('outline-none', className)} {...rest}
      >
        {children}
      </motion.button>
    )
  },
)

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: BtnProps) {
  const sizes = { sm: 'h-8 px-3 text-[13px]', md: 'h-9 px-4 text-[13.5px]', lg: 'h-11 px-6 text-[15px]' }
  const variants = {
    primary: 'bg-ink text-canvas hover:opacity-90',
    accent: 'bg-ember text-white hover:brightness-110',
    outline: 'border border-line text-ink hover:bg-ink/[0.04]',
    ghost: 'text-muted hover:text-ink hover:bg-ink/[0.05]',
  }
  return (
    <Pressable className={cx('btn', sizes[size], variants[variant], className)} {...(rest as object)}>
      {children}
    </Pressable>
  )
}

export function Avatar({
  user, size = 40, ring = false, className, link = true,
}: { user: User; size?: number; ring?: boolean; className?: string; link?: boolean }) {
  const inner = (
    <span
      className={cx('relative block overflow-hidden rounded-full bg-raised', ring && 'ring-2 ring-ember/70 ring-offset-2 ring-offset-surface', className)}
      style={{ width: size, height: size }}
    >
      <AvatarArt seed={user.avatar.seed} palette={user.avatar.palette} />
    </span>
  )
  if (!link) return inner
  return (
    <Link to={`/u/${user.handle}`} aria-label={`${user.name}'s profile`} className="shrink-0 rounded-full" onClick={(e) => e.stopPropagation()}>
      {inner}
    </Link>
  )
}

export function VerifiedMark({ className }: { className?: string }) {
  return (
    <span title="Verified writer" className={cx('inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-ember/15 text-ember', className)}>
      <Check size={9} strokeWidth={3.5} />
    </span>
  )
}

export function TopicChip({
  topic, active = false, onClick, size = 'md', as = 'button',
}: { topic: string; active?: boolean; onClick?: () => void; size?: 'sm' | 'md'; as?: 'button' | 'link' }) {
  const cls = cx(
    'chip transition-all duration-200',
    size === 'sm' ? 'px-2 py-[3px] text-[11.5px]' : 'px-2.5 py-1 text-[12px]',
    active ? 'border-ink bg-ink text-canvas' : 'hover:border-ink/40 hover:text-ink',
  )
  if (as === 'link') {
    return (
      <Link to={`/topic/${encodeURIComponent(topic)}`} className={cls} onClick={(e) => e.stopPropagation()}>
        {topic}
      </Link>
    )
  }
  return (
    <Pressable type="button" className={cls} onClick={(e) => { e.stopPropagation(); onClick?.() }}>
      {topic}
    </Pressable>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cx('relative overflow-hidden rounded-lg bg-ink/[0.06] dark:bg-ink/[0.08]', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-ink/[0.07] to-transparent" />
    </div>
  )
}

export function EmptyState({
  icon, title, body, action,
}: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-6 py-20 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-faint">
        {icon}
      </div>
      <h3 className="font-display text-[19px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-[30ch] text-[14px] leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-[17px] font-semibold tracking-[-0.01em] text-ink">{children}</h2>
      {action}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cx('relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-300', checked ? 'bg-ember' : 'bg-ink/15')}
    >
      <motion.span
        layout transition={T_FAST}
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-soft"
        style={{ left: checked ? 23 : 3 }}
      />
    </button>
  )
}

export function Slider({
  value, onChange, label, tint = 'ember',
}: { value: number; onChange: (v: number) => void; label: string; tint?: 'ember' | 'moss' | 'amber' | 'iris' }) {
  const tintClass = { ember: 'bg-ember', moss: 'bg-moss', amber: 'bg-amber', iris: 'bg-iris' }[tint]
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[7px] -translate-y-1/2 overflow-hidden rounded-full bg-ink/[0.09]">
        <motion.div
          className={cx('h-full rounded-full', tintClass)}
          animate={{ width: `${value}%` }} transition={T_BASE}
        />
      </div>
      <input
        type="range" min={0} max={100} value={value} aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="relative h-7 w-full cursor-pointer appearance-none bg-transparent
          [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-canvas
          [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:shadow-soft
          [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-canvas [&::-moz-range-thumb]:bg-ink"
      />
    </div>
  )
}
