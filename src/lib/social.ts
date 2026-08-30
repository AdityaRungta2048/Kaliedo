import type { AppNotification, Conversation } from './types'

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'cv1', userId: 'u_alex',
    messages: [
      { id: 'm1', from: 'them', text: 'Read your piece on revision twice. The middle section is the strongest thing you have published.', minutesAgo: 180, reactions: [], read: true },
      { id: 'm2', from: 'me', text: 'That middle section is the part I nearly cut, obviously.', minutesAgo: 172, reactions: ['😄'], read: true },
      { id: 'm3', from: 'them', text: 'It always is. Keep the thing you are embarrassed by — that is usually the only part that is actually yours.', minutesAgo: 168, reactions: ['🔥'], read: true },
      { id: 'm4', from: 'them', text: 'Are you publishing on Thursday? I want to link to it.', minutesAgo: 24, reactions: [], read: false },
    ],
  },
  {
    id: 'cv2', userId: 'u_sarah',
    messages: [
      { id: 'm5', from: 'them', text: 'The retrieval demo is up. Two hundred lines, exactly as advertised.', minutesAgo: 400, reactions: [], read: true },
      { id: 'm6', from: 'me', text: 'Running it on my drafts now. Bracing myself.', minutesAgo: 390, reactions: [], read: true },
      { id: 'm7', from: 'them', text: 'Report back with your most repeated phrase. Mine was "it turns out".', minutesAgo: 385, reactions: ['😭'], read: true },
    ],
    typing: true,
  },
  {
    id: 'cv3', userId: 'u_maya',
    messages: [
      { id: 'm8', from: 'them', text: 'Sending you the frame from Vík before it goes up anywhere else.', minutesAgo: 300, reactions: [], read: true },
      { id: 'm9', from: 'them', art: { seed: 303, motif: 'dunes', palette: 'moss', ratio: '4:3' }, minutesAgo: 299, reactions: ['😍'], read: true },
      { id: 'm10', from: 'me', text: 'The horizon line is doing something illegal here. Print it.', minutesAgo: 290, reactions: [], read: true },
    ],
  },
  {
    id: 'cv4', userId: 'u_rahul',
    messages: [
      { id: 'm11', from: 'me', text: 'Did you actually ship the removal or is it still behind a flag?', minutesAgo: 700, reactions: [], read: true },
      { id: 'm12', from: 'them', text: 'Shipped. Fully. No flag, no rollback plan, which I do not recommend as a general practice.', minutesAgo: 695, reactions: ['👏'], read: true },
    ],
  },
  {
    id: 'cv5', userId: 'u_ife',
    messages: [
      { id: 'm13', from: 'them', text: 'Do you want the g with the flat ear or the one that leans? Genuinely torn.', minutesAgo: 1200, reactions: [], read: true },
      { id: 'm14', from: 'me', text: 'The one that leans. It reads like someone mid-thought.', minutesAgo: 1180, reactions: ['💯'], read: true },
    ],
  },
  {
    id: 'cv6', userId: 'u_noor',
    messages: [
      { id: 'm15', from: 'them', text: 'January trip is confirmed. Three cafés, one hardware shop, as promised.', minutesAgo: 2000, reactions: [], read: true },
    ],
  },
  {
    id: 'cv7', userId: 'u_greta',
    messages: [
      { id: 'm16', from: 'them', text: 'Five tomorrow if the ice holds. No pressure, but the deer were there again.', minutesAgo: 2600, reactions: [], read: true },
    ],
  },
]

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', kind: 'like', actorId: 'u_alex', postId: 'p1', text: 'liked your reply on “The first sentence is a door”', minutesAgo: 8, unread: true },
  { id: 'n2', kind: 'follow', actorId: 'u_ife', text: 'started following you', minutesAgo: 26, unread: true },
  { id: 'n3', kind: 'comment', actorId: 'u_sarah', postId: 'p13', text: 'replied: “send me the repo when it is less embarrassing”', minutesAgo: 47, unread: true },
  { id: 'n4', kind: 'trending', text: 'Your note is being read across Writing right now', minutesAgo: 92, unread: true },
  { id: 'n5', kind: 'mention', actorId: 'u_jonas', postId: 'p6', text: 'mentioned you in “Attention is not a resource”', minutesAgo: 140, unread: false },
  { id: 'n6', kind: 'like', actorId: 'u_maya', text: 'and 214 others liked your field note', minutesAgo: 210, unread: false },
  { id: 'n7', kind: 'follow', actorId: 'u_tomas', text: 'started following you', minutesAgo: 320, unread: false },
  { id: 'n8', kind: 'comment', actorId: 'u_olivia', postId: 'p18', text: 'replied: “six weeks of bad bread is the whole lesson”', minutesAgo: 480, unread: false },
  { id: 'n9', kind: 'mention', actorId: 'u_rahul', text: 'mentioned you in a note about shipping quietly', minutesAgo: 700, unread: false },
  { id: 'n10', kind: 'like', actorId: 'u_daniel', text: 'liked your comment on playtesting', minutesAgo: 900, unread: false },
  { id: 'n11', kind: 'follow', actorId: 'u_priya', text: 'started following you', minutesAgo: 1400, unread: false },
  { id: 'n12', kind: 'trending', text: 'Writing is having a busy week — 3 new voices you might like', minutesAgo: 1800, unread: false },
]
