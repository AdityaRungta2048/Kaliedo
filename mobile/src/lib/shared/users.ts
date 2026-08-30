import type { User } from './types'

export const ME_ID = 'u_me'

export const USERS: User[] = [
  {
    id: ME_ID, handle: 'you', name: 'You', pronouns: 'they/them',
    bio: 'Writing in public, badly, on purpose. Notes on craft and attention.',
    location: 'Somewhere with good light',
    interests: ['Writing', 'AI', 'Photography'],
    followers: 428, following: 212, avatar: { seed: 7, palette: 'ember' }, joined: 'March 2025',
  },
  {
    id: 'u_alex', handle: 'alexmorgan', name: 'Alex Morgan', pronouns: 'he/him', verified: true,
    bio: 'Essays about attention, craft, and the slow parts of making things. Two paragraphs a day.',
    location: 'Lisbon',
    interests: ['Writing', 'Philosophy', 'Books', 'Craft'],
    followers: 84200, following: 318, avatar: { seed: 12, palette: 'ember' }, joined: 'January 2024',
  },
  {
    id: 'u_sarah', handle: 'sarahchen', name: 'Sarah Chen', pronouns: 'she/her', verified: true,
    bio: 'Research engineer. I write about models the way other people write about weather.',
    location: 'Seattle',
    interests: ['AI', 'Research', 'Programming', 'Science'],
    followers: 61400, following: 204, avatar: { seed: 23, palette: 'iris' }, joined: 'August 2023',
  },
  {
    id: 'u_rahul', handle: 'rahulmehta', name: 'Rahul Mehta', pronouns: 'he/him',
    bio: 'Building a small software company in public. Notes on decisions, not advice.',
    location: 'Bengaluru',
    interests: ['Startups', 'Business', 'Technology', 'Writing'],
    followers: 23900, following: 512, avatar: { seed: 31, palette: 'amber' }, joined: 'May 2024',
  },
  {
    id: 'u_maya', handle: 'mayapatel', name: 'Maya Patel', pronouns: 'she/her', verified: true,
    bio: 'Photographer. I mostly write about waiting.',
    location: 'Reykjavík / Mumbai',
    interests: ['Photography', 'Travel', 'Nature', 'Design'],
    followers: 112000, following: 189, avatar: { seed: 44, palette: 'moss' }, joined: 'February 2023',
  },
  {
    id: 'u_daniel', handle: 'danielkim', name: 'Daniel Kim', pronouns: 'he/him',
    bio: 'Game designer. Systems, feedback loops, and why difficulty is a love language.',
    location: 'Seoul',
    interests: ['Gaming', 'Design', 'Technology', 'Film'],
    followers: 47300, following: 401, avatar: { seed: 55, palette: 'iris' }, joined: 'November 2023',
  },
  {
    id: 'u_olivia', handle: 'oliviasmith', name: 'Olivia Smith', pronouns: 'she/her',
    bio: 'Cooking, mostly. Writing about the parts of a kitchen nobody photographs.',
    location: 'Portland',
    interests: ['Food', 'Craft', 'Lifestyle', 'Writing'],
    followers: 38600, following: 277, avatar: { seed: 66, palette: 'moss' }, joined: 'June 2024',
  },
  {
    id: 'u_noor', handle: 'noorhaddad', name: 'Noor Haddad', pronouns: 'she/her', verified: true,
    bio: 'Translator. Travel notes in two languages, neither of them finished.',
    location: 'Beirut',
    interests: ['Travel', 'Books', 'Culture', 'Writing'],
    followers: 29100, following: 340, avatar: { seed: 77, palette: 'ember' }, joined: 'April 2024',
  },
  {
    id: 'u_tomas', handle: 'tomasvidal', name: 'Tomás Vidal', pronouns: 'he/him',
    bio: 'Listening notes. One record at a time, written down before I forget.',
    location: 'Buenos Aires',
    interests: ['Music', 'Film', 'Culture', 'Writing'],
    followers: 15800, following: 623, avatar: { seed: 88, palette: 'ember' }, joined: 'September 2024',
  },
  {
    id: 'u_ife', handle: 'ifeadeyemi', name: 'Ife Adeyemi', pronouns: 'she/her', verified: true,
    bio: 'Type designer. Obsessed with the space between letters and the space between drafts.',
    location: 'Lagos',
    interests: ['Design', 'Craft', 'Writing', 'Technology'],
    followers: 52700, following: 145, avatar: { seed: 99, palette: 'amber' }, joined: 'July 2023',
  },
  {
    id: 'u_greta', handle: 'gretal', name: 'Greta Lindqvist', pronouns: 'she/her',
    bio: 'Long runs, short entries. Nature writing for people who are out of breath.',
    location: 'Gothenburg',
    interests: ['Nature', 'Fitness', 'Health', 'Photography'],
    followers: 19400, following: 158, avatar: { seed: 111, palette: 'moss' }, joined: 'January 2025',
  },
  {
    id: 'u_jonas', handle: 'jonasweber', name: 'Jonas Weber', pronouns: 'he/him',
    bio: 'Philosophy without the seminar. Thinking out loud about how we pay attention.',
    location: 'Berlin',
    interests: ['Philosophy', 'Psychology', 'Books', 'Science'],
    followers: 33500, following: 96, avatar: { seed: 122, palette: 'iris' }, joined: 'October 2023',
  },
  {
    id: 'u_priya', handle: 'priyanair', name: 'Priya Nair', pronouns: 'she/her',
    bio: 'Clothes as language. Culture writing with a tape measure.',
    location: 'London',
    interests: ['Fashion', 'Culture', 'Design', 'Photography'],
    followers: 41200, following: 388, avatar: { seed: 133, palette: 'amber' }, joined: 'December 2023',
  },
]

export const USER_BY_ID: Record<string, User> = Object.fromEntries(USERS.map((u) => [u.id, u]))

export function userById(id: string): User {
  return USER_BY_ID[id] ?? USERS[0]
}
