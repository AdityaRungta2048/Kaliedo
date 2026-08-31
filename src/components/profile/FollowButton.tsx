import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { userById } from '@/lib/users'
import { cx } from '@/lib/utils'
import { Pressable } from '@/components/ui/Primitives'
import { T_BASE } from '@/lib/motion'

/** Follow → Following is a transition, not a text swap. */
export function FollowButton({ userId, size = 'md', full = false }: { userId: string; size?: 'sm' | 'md'; full?: boolean }) {
  const { state, dispatch, toast } = useApp()
  const following = state.following.includes(userId)
  const user = userById(userId)

  return (
    <Pressable
      onClick={(e) => {
        e.stopPropagation()
        dispatch({ type: 'toggleFollow', id: userId })
        toast(following ? `Unfollowed ${user.name}` : `Following ${user.name}`)
      }}
      aria-pressed={following}
      className={cx(
        'btn relative overflow-hidden border transition-colors duration-300',
        size === 'sm' ? 'h-8 px-3.5 text-[12.5px]' : 'h-9 px-5 text-[13.5px]',
        full && 'flex-1',
        following ? 'border-line bg-transparent text-muted hover:border-ember/40 hover:text-ember' : 'border-ink bg-ink text-canvas',
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(following)}
          initial={{ y: following ? 14 : -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: following ? -14 : 14, opacity: 0 }}
          transition={T_BASE}
          className="flex items-center gap-1.5"
        >
          {following ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
          {following ? 'Following' : 'Follow'}
        </motion.span>
      </AnimatePresence>
    </Pressable>
  )
}
