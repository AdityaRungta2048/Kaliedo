import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '@/store/AppContext'
import { useViewer } from '@/store/ViewerContext'
import { BottomNav, Sidebar } from './Navigation'
import { TopBar } from './TopBar'
import { DemoMode } from './DemoMode'
import { Toaster } from '@/components/ui/Toaster'
import { PostReaderLayer } from '@/components/post/PostReader'

export function AppShell() {
  const location = useLocation()
  const { setDemoOpen, reducedMotion } = useApp()
  const { openId, open, close } = useViewer()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('kaleida.sidebar') === 'collapsed')

  useEffect(() => {
    localStorage.setItem('kaleida.sidebar', collapsed ? 'collapsed' : 'expanded')
  }, [collapsed])

  // Demo mode is one shortcut away when presenting.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setDemoOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setDemoOpen])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [location.pathname])

  return (
    <div className="flex min-h-dvh bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 pb-[70px] lg:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav />
      <DemoMode />
      <Toaster />
      <PostReaderLayer postId={openId} onClose={close} onOpenPost={(id) => { close(); window.setTimeout(() => open(id), 220) }} />
    </div>
  )
}
