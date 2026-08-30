import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '@/store/AppContext'
import { useViewer } from '@/store/ViewerContext'
import { BottomNav, Sidebar } from './Navigation'
import { TopBar } from './TopBar'
import { DemoMode } from './DemoMode'
import { FocusSheet } from './FocusMode'
import { Toaster } from '@/components/ui/Toaster'
import { PostReaderLayer } from '@/components/post/PostReader'

export function AppShell() {
  const location = useLocation()
  const { setDemoOpen, reducedMotion } = useApp()
  const { openId, open, close } = useViewer()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('kaleido.sidebar') === 'collapsed')
  const [focusOpen, setFocusOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('kaleido.sidebar', collapsed ? 'collapsed' : 'expanded')
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
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} onOpenFocus={() => setFocusOpen(true)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenFocus={() => setFocusOpen(true)} />
        <main className="min-w-0 flex-1 pb-[70px] lg:pb-0">
          {/*
            Keyed on the path so each route mounts fresh and plays its entrance.
            Deliberately not wrapped in AnimatePresence: the exiting child holds
            an <Outlet />, whose content swaps to the next route mid-exit, so the
            exit never resolves and the replacement is never mounted — every
            click-through navigation ends up stuck at opacity 0. A one-way
            entrance is the whole effect anyway.
          */}
          <motion.div
            key={location.pathname}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <BottomNav />
      <DemoMode />
      <FocusSheet open={focusOpen} onClose={() => setFocusOpen(false)} />
      <Toaster />
      <PostReaderLayer postId={openId} onClose={close} onOpenPost={(id) => { close(); window.setTimeout(() => open(id), 220) }} />
    </div>
  )
}
