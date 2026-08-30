import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, Check, Heart, Info } from 'lucide-react'
import { useApp } from '@/store/AppContext'

const ICONS = { check: Check, heart: Heart, bookmark: Bookmark, info: Info }

export function Toaster() {
  const { toasts } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[86px] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-8">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.icon ?? 'check']
          return (
            <motion.div
              key={t.id} layout
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-line bg-raised px-4 py-2.5 shadow-lift"
            >
              <Icon size={15} className="text-ember" strokeWidth={2.4} />
              <span className="text-[13.5px] font-medium text-ink">{t.text}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
