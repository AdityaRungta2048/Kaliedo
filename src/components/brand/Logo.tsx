import { motion } from 'framer-motion'
import { cx } from '@/lib/utils'

/**
 * The Kaleido mark: three facets rotated around a still centre. A kaleidoscope,
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
      {/* Three facets offset by 40°, not 120° — an equilateral triangle rotated
          by a third of a turn lands back on itself and the mark reads as one shape. */}
      <g transform="translate(32 32)">
        <path d="M0 -19 L16.5 9.5 L-16.5 9.5 Z" className="fill-ember" opacity="0.78" />
        <path d="M0 -19 L16.5 9.5 L-16.5 9.5 Z" className="fill-moss" opacity="0.78" transform="rotate(40)" />
        <path d="M0 -19 L16.5 9.5 L-16.5 9.5 Z" className="fill-amber" opacity="0.78" transform="rotate(80)" />
        <circle r="4.2" className="fill-ink" />
      </g>
    </motion.svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx('font-display text-[19px] font-semibold tracking-[-0.02em] text-ink', className)}>
      Kaleido
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
