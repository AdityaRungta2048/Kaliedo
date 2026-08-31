import { motion } from 'framer-motion'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, Compass, Home, Mail, PenLine, Settings, SlidersHorizontal, User as UserIcon,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { LogoMark, Wordmark } from '@/components/brand/Logo'
import { Pressable } from '@/components/ui/Primitives'
import { IdentityChip } from './FocusMode'
import { cx } from '@/lib/utils'
import { T_BASE, T_FAST } from '@/lib/motion'

export const PRIMARY_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/messages', label: 'Messages', icon: Mail },
  { to: '/activity', label: 'Activity', icon: Bell },
  { to: '/create', label: 'Write', icon: PenLine },
]

export function Sidebar({ collapsed, onToggle, onOpenFocus }: { collapsed: boolean; onToggle: () => void; onOpenFocus: () => void }) {
  const { state, me, setDemoOpen } = useApp()
  const unread = state.notifications.filter((n) => n.unread).length
  const unreadMsgs = state.conversations.filter((c) => c.messages.some((m) => m.from === 'them' && !m.read)).length

  const badge = (label: string) => (label === 'Activity' ? unread : label === 'Messages' ? unreadMsgs : 0)

  return (
    <aside
      className={cx(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-300 ease-kaleido lg:flex',
        collapsed ? 'w-[76px]' : 'w-[248px]',
      )}
    >
      <div className={cx('flex h-[62px] items-center', collapsed ? 'justify-center px-2' : 'gap-2.5 px-5')}>
        <NavLink to="/" aria-label="Kaleido home" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          {!collapsed && <Wordmark />}
        </NavLink>
      </div>

      <nav className={cx('flex flex-1 flex-col gap-1 pt-2', collapsed ? 'px-2.5' : 'px-3')}>
        {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} title={label}
            className={({ isActive }) => cx(
              'group relative flex items-center rounded-xl text-[14.5px] font-medium transition-colors duration-200',
              collapsed ? 'h-11 justify-center' : 'h-11 gap-3.5 px-3.5',
              isActive ? 'text-ink' : 'text-muted hover:bg-ink/[0.04] hover:text-ink',
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-xl bg-ink/[0.06]"
                    transition={T_BASE} />
                )}
                <span className="relative">
                  <Icon size={19} strokeWidth={isActive ? 2.3 : 1.9} />
                  {badge(label) > 0 && (
                    <span className="absolute -right-1.5 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-ember px-1 text-[9.5px] font-bold text-white">
                      {badge(label)}
                    </span>
                  )}
                </span>
                {!collapsed && <span className="relative">{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        <div className="my-3 h-px bg-line" />

        <NavLink to={`/u/${me.handle}`} title="Profile"
          className={({ isActive }) => cx(
            'flex items-center rounded-xl text-[14.5px] font-medium transition-colors',
            collapsed ? 'h-11 justify-center' : 'h-11 gap-3.5 px-3.5',
            isActive ? 'bg-ink/[0.06] text-ink' : 'text-muted hover:bg-ink/[0.04] hover:text-ink',
          )}
        >
          <UserIcon size={19} strokeWidth={1.9} />
          {!collapsed && 'Profile'}
        </NavLink>
        <NavLink to="/settings" title="Settings"
          className={({ isActive }) => cx(
            'flex items-center rounded-xl text-[14.5px] font-medium transition-colors',
            collapsed ? 'h-11 justify-center' : 'h-11 gap-3.5 px-3.5',
            isActive ? 'bg-ink/[0.06] text-ink' : 'text-muted hover:bg-ink/[0.04] hover:text-ink',
          )}
        >
          <Settings size={19} strokeWidth={1.9} />
          {!collapsed && 'Settings'}
        </NavLink>
      </nav>

      <div className={cx('flex flex-col gap-2 border-t border-line py-3', collapsed ? 'items-center px-2' : 'px-3')}>
        <IdentityChip onOpen={onOpenFocus} collapsed={collapsed} />
        <div className="h-px bg-line" />

        <Pressable onClick={() => setDemoOpen(true)} title="Demo mode"
          className={cx('flex items-center rounded-xl text-[13.5px] font-medium text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink',
            collapsed ? 'h-10 w-10 justify-center' : 'h-10 gap-3.5 px-3.5')}
        >
          <SlidersHorizontal size={18} strokeWidth={1.9} />
          {!collapsed && 'Demo mode'}
        </Pressable>

        <Pressable onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cx('flex items-center rounded-xl text-[13.5px] font-medium text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink',
            collapsed ? 'h-10 w-10 justify-center' : 'h-10 gap-3.5 px-3.5')}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && 'Collapse'}
        </Pressable>

      </div>
    </aside>
  )
}

const MOBILE_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/create', label: 'Write', icon: PenLine },
  { to: '/activity', label: 'Activity', icon: Bell },
  { to: '/profile', label: 'You', icon: UserIcon },
]

export function BottomNav() {
  const { state } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const unread = state.notifications.filter((n) => n.unread).length

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[rgb(var(--k-nav))]/97 backdrop-blur-2xl safe-bottom lg:hidden"
    >
      <ul className="flex items-stretch">
        {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => {
          const active = end ? location.pathname === to : location.pathname.startsWith(to)
          return (
            <li key={to} className="flex-1">
              <button
                onClick={() => navigate(to)} aria-current={active ? 'page' : undefined}
                className="relative flex h-[58px] w-full flex-col items-center justify-center gap-[3px]"
              >
                {active && (
                  <motion.span layoutId="bottom-indicator"
                    className="absolute top-0 h-[2.5px] w-8 rounded-full bg-ember"
                    transition={T_FAST} />
                )}
                <motion.span
                  animate={{ scale: active ? 1.1 : 1, y: active ? -1 : 0 }}
                  transition={T_FAST}
                  className={cx('relative', active ? 'text-ink' : 'text-faint')}
                >
                  <Icon size={21} strokeWidth={active ? 2.3 : 1.85} />
                  {label === 'Activity' && unread > 0 && (
                    <span className="absolute -right-1.5 -top-1 h-[7px] w-[7px] rounded-full bg-ember ring-2 ring-[rgb(var(--k-nav))]" />
                  )}
                </motion.span>
                <motion.span
                  animate={{ opacity: active ? 1 : 0.65, fontWeight: active ? 600 : 500 }}
                  className={cx('text-[10.5px] leading-none', active ? 'text-ink' : 'text-faint')}
                >
                  {label}
                </motion.span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
