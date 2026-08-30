import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/** Where on screen the tapped block was, so the reader can grow out of it. */
export type Origin = { x: number; y: number; width: number; height: number }

type Reader = {
  postId: string | null
  origin: Origin | null
  open: (id: string, origin: Origin) => void
  close: () => void
}

const Ctx = createContext<Reader | null>(null)

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [postId, setPostId] = useState<string | null>(null)
  const [origin, setOrigin] = useState<Origin | null>(null)

  const open = useCallback((id: string, o: Origin) => { setOrigin(o); setPostId(id) }, [])
  const close = useCallback(() => setPostId(null), [])

  const value = useMemo(() => ({ postId, origin, open, close }), [postId, origin, open, close])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useReader(): Reader {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useReader must be used inside ReaderProvider')
  return ctx
}
