import { BellOff, Bookmark, EyeOff, Flag, Link2, UserMinus, UserPlus } from 'lucide-react'
import type { Post } from '@/lib/types'
import { userById } from '@/lib/users'
import { useApp } from '@/store/AppContext'
import { Sheet } from '@/components/ui/Overlay'
import { Pressable } from '@/components/ui/Primitives'

/** Every "…" in the product opens this. No dead affordances. */
export function PostMenu({ post, open, onClose }: { post: Post; open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useApp()
  const author = userById(post.authorId)
  const following = state.following.includes(author.id)
  const saved = state.saves.includes(post.id)
  const topic = post.topics[0]

  const items = [
    {
      icon: Bookmark, label: saved ? 'Remove from saved' : 'Save for later',
      run: () => { dispatch({ type: 'toggleSave', id: post.id }); toast(saved ? 'Removed from saved' : 'Saved to your shelf', 'bookmark') },
    },
    {
      icon: Link2, label: 'Copy link',
      run: () => { navigator.clipboard?.writeText(`https://kaleida.app/p/${post.id}`).catch(() => {}); toast('Link copied') },
    },
    {
      icon: following ? UserMinus : UserPlus, label: following ? `Unfollow ${author.name}` : `Follow ${author.name}`,
      run: () => { dispatch({ type: 'toggleFollow', id: author.id }); toast(following ? `Unfollowed ${author.name}` : `Following ${author.name}`) },
    },
    {
      icon: EyeOff, label: 'Not interested',
      run: () => toast('Noted — you will see less like this'),
    },
    {
      icon: BellOff, label: topic ? `Mute ${topic}` : 'Mute topic',
      run: () => { if (topic) { dispatch({ type: 'toggleMuteTopic', topic }); toast(state.mutedTopics.includes(topic) ? `${topic} unmuted` : `${topic} muted`) } },
    },
    { icon: Flag, label: 'Report', run: () => toast('Report sent to review') },
  ]

  return (
    <Sheet open={open} onClose={onClose} title="Post options" size="sm">
      <ul className="px-3 pb-5">
        {items.map(({ icon: Icon, label, run }) => (
          <li key={label}>
            <Pressable
              onClick={(e) => { e.stopPropagation(); run(); onClose() }}
              className="flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left text-[14.5px] text-ink hover:bg-ink/[0.04]"
            >
              <Icon size={17} className="text-muted" strokeWidth={1.9} />
              {label}
            </Pressable>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
