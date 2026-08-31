import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, TrendingUp, VenetianMask } from 'lucide-react'
import type { Post } from '@/lib/types'
import { anonPersona, canReveal, hasBigReach } from '@/lib/identity'
import { useApp } from '@/store/AppContext'
import { compact } from '@/lib/utils'
import { Button, Pressable } from '@/components/ui/Primitives'

/**
 * Shown to the author of an anonymous post, and only to them. Claiming is
 * permanent and the copy says so before the button does anything, because the
 * decision cannot be walked back.
 */
export function RevealPanel({ post }: { post: Post }) {
  const { state, dispatch, me, toast } = useApp()
  const [confirming, setConfirming] = useState(false)
  const liked = state.likes.includes(post.id) ? 1 : 0

  if (!canReveal(post, me.id)) return null

  const big = hasBigReach(post, liked)
  const persona = anonPersona(post.authorId)

  return (
    <div className="rounded-2xl border border-line bg-canvas">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <VenetianMask size={16} className="mt-0.5 shrink-0 text-muted" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink">Published as {persona.name}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            Only you know this is yours. You can put your real name on it whenever you like — but not the other way round.
          </p>

          {big && (
            <motion.p
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-medium text-ember"
            >
              <TrendingUp size={12} />
              {compact(post.likes + liked)} readers found this. Worth claiming?
            </motion.p>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {confirming ? (
              <motion.div
                key="confirm" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3"
              >
                <p className="mb-2.5 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink">
                  <ShieldCheck size={13} className="mt-0.5 shrink-0 text-ember" />
                  This is permanent. Once your name replaces {persona.name} on this piece, it cannot be made anonymous again.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm" variant="accent"
                    onClick={() => { dispatch({ type: 'revealPost', postId: post.id }); toast(`Published as ${me.name}`, 'check') }}
                  >
                    Yes, put my name on it
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Keep it anonymous</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3">
                <Pressable
                  onClick={() => setConfirming(true)}
                  className="btn h-8 border border-line px-3.5 text-[12.5px] text-ink hover:bg-ink/[0.04]"
                >
                  Claim as {me.name}
                </Pressable>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
