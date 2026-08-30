import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useIsTablet } from '@/lib/useMediaQuery'
import { cx } from '@/lib/utils'
import { Pressable } from './Primitives'

function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [active])
}

function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [active, onClose])
}

export function Scrim({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }} onClick={onClick}
      className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[3px]"
    />
  )
}

/**
 * One overlay component, two personalities: a bottom sheet on touch-sized screens,
 * a centred dialog from a tablet up. Every sheet is drag-to-dismiss.
 */
export function Sheet({
  open, onClose, title, children, footer, size = 'md',
}: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode
  footer?: ReactNode; size?: 'sm' | 'md' | 'lg'
}) {
  const isTablet = useIsTablet()
  useLockScroll(open)
  useEscape(open, onClose)

  const maxW = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }[size]

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <Scrim onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className={cx(
              'fixed z-50 flex flex-col overflow-hidden bg-surface shadow-float',
              isTablet
                ? cx('left-1/2 top-1/2 w-[92vw] max-h-[85vh] rounded-3xl border border-line', maxW)
                : 'inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t border-line',
            )}
            style={isTablet ? { x: '-50%', y: '-50%' } : undefined}
            initial={isTablet ? { opacity: 0, scale: 0.96 } : { y: '100%' }}
            animate={isTablet ? { opacity: 1, scale: 1 } : { y: 0 }}
            exit={isTablet ? { opacity: 0, scale: 0.97 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            drag={isTablet ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => { if (info.offset.y > 110 || info.velocity.y > 700) onClose() }}
          >
            {!isTablet && <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-ink/15" />}
            {title && (
              <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
                <h2 className="font-display text-[17px] font-semibold text-ink">{title}</h2>
                <Pressable onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-ink/5 hover:text-ink">
                  <X size={18} />
                </Pressable>
              </div>
            )}
            <div className="scroll-slim min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <div className="shrink-0 border-t border-line bg-surface px-5 py-3 safe-bottom">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** Full-bleed overlay used by the post reader, which manages its own chrome. */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}

export { useLockScroll, useEscape }
