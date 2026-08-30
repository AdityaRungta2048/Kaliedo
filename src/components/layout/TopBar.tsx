import { Link, useNavigate } from 'react-router-dom'
import { Mail, Search } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { LogoMark, Wordmark } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ui/ThemeSwitcher'
import { Pressable } from '@/components/ui/Primitives'

export function TopBar() {
  const { state } = useApp()
  const navigate = useNavigate()
  const unread = state.conversations.filter((c) => c.messages.some((m) => m.from === 'them' && !m.read)).length

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[rgb(var(--k-nav))]/95 backdrop-blur-2xl safe-top lg:hidden">
      <div className="flex h-[54px] items-center gap-2 px-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Kaleida home">
          <LogoMark size={26} />
          <Wordmark className="text-[18px]" />
        </Link>
        <div className="ml-auto flex items-center gap-0.5">
          <ThemeToggle />
          <Pressable onClick={() => navigate('/discover?focus=1')} aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
            <Search size={19} />
          </Pressable>
          <Pressable onClick={() => navigate('/messages')} aria-label="Messages"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
            <Mail size={19} />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full bg-ember ring-2 ring-[rgb(var(--k-nav))]" />}
          </Pressable>
        </div>
      </div>
    </header>
  )
}
