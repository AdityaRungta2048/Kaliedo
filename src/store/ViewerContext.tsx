import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type Viewer = { openId: string | null; open: (id: string) => void; close: () => void }

const ViewerCtx = createContext<Viewer | null>(null)

/** One reader for the whole app, so a post can be opened from any screen. */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = useCallback((id: string) => setOpenId(id), [])
  const close = useCallback(() => setOpenId(null), [])
  const value = useMemo(() => ({ openId, open, close }), [openId, open, close])
  return <ViewerCtx.Provider value={value}>{children}</ViewerCtx.Provider>
}

export function useViewer(): Viewer {
  const ctx = useContext(ViewerCtx)
  if (!ctx) throw new Error('useViewer must be used inside ViewerProvider')
  return ctx
}
