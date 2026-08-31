import { BellOff, Bookmark, EyeOff, Flag, Link2, UserMinus, UserPlus } from 'lucide-react-native'
import * as Clipboard from 'expo-clipboard'
import type { Post } from '@/lib/shared/types'
import { displayAuthor, isAnonymous } from '@/lib/shared/identity'
import { useApp } from '@/store/AppContext'
import { useTheme } from '@/theme/ThemeProvider'
import { MenuSheet } from './Sheets'

/** Every "…" in the app opens this. No dead affordances. */
export function PostMenu({ post, open, onClose }: { post: Post; open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useApp()
  const { c } = useTheme()
  const anon = isAnonymous(post)
  const author = displayAuthor(post)
  const following = state.following.includes(post.authorId)
  const saved = state.saves.includes(post.id)
  const muted = state.mutedTopics.includes(post.topics[0])
  const topic = post.topics[0]

  const items = [
    {
      icon: <Bookmark size={17} color={c.muted} />,
      label: saved ? 'Remove from saved' : 'Save for later',
      run: () => { dispatch({ type: 'toggleSave', id: post.id }); toast(saved ? 'Removed from saved' : 'Saved to your shelf', 'bookmark') },
    },
    {
      icon: <Link2 size={17} color={c.muted} />,
      label: 'Copy link',
      run: () => { void Clipboard.setStringAsync(`https://kaleido.app/p/${post.id}`); toast('Link copied') },
    },
    // No follow row on an anonymous post: naming the account would undo the point.
    ...(anon ? [] : [{
      icon: following ? <UserMinus size={17} color={c.muted} /> : <UserPlus size={17} color={c.muted} />,
      label: following ? `Unfollow ${author.name}` : `Follow ${author.name}`,
      run: () => { dispatch({ type: 'toggleFollow', id: post.authorId }); toast(following ? `Unfollowed ${author.name}` : `Following ${author.name}`) },
    }]),
    {
      icon: <EyeOff size={17} color={c.muted} />,
      label: 'Not interested',
      run: () => toast('Noted — you will see less like this'),
    },
    ...(topic ? [{
      icon: <BellOff size={17} color={c.muted} />,
      label: muted ? `Unmute ${topic}` : `Mute ${topic}`,
      run: () => { dispatch({ type: 'toggleMuteTopic', topic }); toast(muted ? `${topic} unmuted` : `${topic} muted`) },
    }] : []),
    {
      icon: <Flag size={17} color={c.muted} />,
      label: 'Report',
      run: () => toast('Report sent to review'),
    },
  ]

  return <MenuSheet open={open} onClose={onClose} title="Post options" items={items} />
}
