import { motion } from 'framer-motion'
import { cx } from '@/lib/utils'

/**
 * The Kaleida mark: three facets rotated around a still centre. A kaleidoscope,
 * reduced to the smallest number of parts that still turns.
 */
export function LogoMark({ size = 28, className, animate = false }: { size?: number; className?: string; animate?: boolean }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 64 64" className={cx('shrink-0', className)} aria-hidden="true"
      initial={animate ? { rotate: -25, opacity: 0, scale: 0.8 } : false}
      animate={animate ? { rotate: 0, opacity: 1, scale: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 140, damping: 16 }}
    >
      <rect width="64" height="64" rx="15" className="fill-ink" />
      <g transform="translate(32 32)">
        <path d="M0 -17 L14.7 8.5 L-14.7 8.5 Z" className="fill-ember" />
        <path d="M0 -17 L14.7 8.5 L-14.7 8.5 Z" className="fill-moss" opacity="0.9" transform="rotate(120)" />
        <path d="M0 -17 L14.7 8.5 L-14.7 8.5 Z" className="fill-amber" opacity="0.9" transform="rotate(240)" />
        <circle r="4.6" className="fill-canvas" />
      </g>
    </motion.svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx('font-display text-[19px] font-semibold tracking-[-0.02em] text-ink', className)}>
      Kaleida
    </span>
  )
}

export function LogoLockup({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      <Wordmark />
    </span>
  )
}
