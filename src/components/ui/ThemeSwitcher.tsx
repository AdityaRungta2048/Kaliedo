import { motion } from 'framer-motion'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import type { ThemeChoice } from '@/lib/types'
import { cx } from '@/lib/utils'
import { T_BASE, T_SLOW } from '@/lib/motion'

const OPTIONS: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

export function ThemeSwitcher({ withLabels = false }: { withLabels?: boolean }) {
  const { state, setTheme } = useApp()
  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-full border border-line bg-canvas p-1">
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = state.theme === id
        return (
          <button
            key={id} role="radio" aria-checked={active} aria-label={label} title={label}
            onClick={() => setTheme(id)}
            className={cx('relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
              active ? 'text-canvas' : 'text-muted hover:text-ink')}
          >
            {active && (
              <motion.span layoutId="theme-pill" className="absolute inset-0 rounded-full bg-ink"
                transition={T_BASE} />
            )}
            <Icon size={14} className="relative" strokeWidth={2.1} />
            {withLabels && <span className="relative">{label}</span>}
          </button>
        )
      })}
    </div>
  )
}

/** One-tap toggle for the top bar; long-press territory belongs in Settings. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useApp()
  const next = resolvedTheme === 'dark' ? 'light' : 'dark'
  return (
    <button
      onClick={() => setTheme(next)} aria-label={`Switch to ${next} theme`}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <motion.span key={resolvedTheme} initial={{ rotate: -70, opacity: 0, scale: 0.7 }} animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={T_SLOW}>
        {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
      </motion.span>
    </button>
  )
}
