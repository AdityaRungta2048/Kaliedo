import type { Post } from './types'

/**
 * Kaleida's seed library. Every entry is written prose — the block shows the
 * opening, the reader shows the whole thing, and any image comes last.
 */
export const POSTS: Post[] = [
  {
    id: 'p1', authorId: 'u_alex', kind: 'essay', minutesAgo: 34,
    title: 'The first sentence is a door, not a thesis',
    body: [
      'I spent four years believing an opening line had to announce what the piece was about. It made every draft sound like a memo written by someone who did not want to be there.',
      'The fix was small and slightly embarrassing. I started writing the first sentence last. Once the piece knew what it was, the door practically hung itself — a detail, a contradiction, a small refusal. Something that makes the reader lean forward rather than nod along.',
      'A thesis tells you where you are going. A door only promises there is a room. Readers, it turns out, would much rather be let into a room.',
      'So now the rule is: no summarising up front. Earn the summary by the end, if you still want it. Most of the time you will find you no longer do.',
    ],
    topics: ['Writing', 'Craft'], likes: 3142, reposts: 208,
    concepts: ['openings', 'drafting', 'editing', 'structure'],
    art: { seed: 101, motif: 'strata', palette: 'ember', ratio: '4:3', caption: 'Draft seventeen, finally.' },
    comments: [
      { id: 'c1', authorId: 'u_ife', text: 'The door / thesis distinction is going straight into my studio notes.', minutesAgo: 20, likes: 46 },
      { id: 'c2', authorId: 'u_noor', text: 'Writing the opening last works in translation too. You cannot pick a register until you know the ending.', minutesAgo: 12, likes: 31 },
      { id: 'c3', authorId: 'u_jonas', text: 'There is a whole essay in "earn the summary".', minutesAgo: 6, likes: 12 },
    ],
  },
  {
    id: 'p2', authorId: 'u_sarah', kind: 'essay', minutesAgo: 78,
    title: 'What a model actually forgets between turns',
    body: [
      'People describe context windows like memory, and then get surprised when the thing behaves like a very well-read stranger who has just walked into the room.',
      'It is closer to a desk than a mind. Everything on the desk is available at once, in full detail, with no decay. Everything off the desk does not exist — not faintly, not "somewhere", not recoverable with a nudge. The cliff is total.',
      'This is why the best prompts read like a good handover note. You are not reminding someone. You are briefing a competent replacement who started this morning.',
      'Once I started writing them that way, half of my so-called reasoning failures turned out to be missing paperwork.',
    ],
    topics: ['AI', 'Research', 'Programming'], likes: 5820, reposts: 941,
    concepts: ['context', 'memory', 'prompting', 'llm', 'beginner'],
    art: { seed: 202, motif: 'weave', palette: 'iris', ratio: '16:9', caption: 'Attention, drawn badly on a whiteboard.' },
    comments: [
      { id: 'c4', authorId: 'u_rahul', text: '"Missing paperwork" is the most accurate description of our eval failures I have read.', minutesAgo: 40, likes: 128 },
      { id: 'c5', authorId: 'u_daniel', text: 'The desk metaphor holds for game AI too. No decay, just presence or absence.', minutesAgo: 22, likes: 54 },
    ],
  },
  {
    id: 'p3', authorId: 'u_maya', kind: 'field-note', minutesAgo: 120,
    title: 'Waiting for the light in Vík',
    body: [
      'Three hours on black sand for eleven minutes of usable light. The wind took my lens cloth somewhere into the Atlantic and I let it go.',
      'I have stopped calling this patience. Patience implies you would rather be elsewhere. This is closer to attendance — you show up, the weather does whatever it wants, and occasionally the two of you agree.',
      'The frame below is the last one before the cloud closed. I did not change a thing in it.',
    ],
    topics: ['Photography', 'Travel', 'Nature'], likes: 8934, reposts: 402,
    concepts: ['iceland', 'winter', 'cold', 'landscape', 'light', 'places'],
    art: { seed: 303, motif: 'dunes', palette: 'moss', ratio: '3:4', caption: 'Vík í Mýrdal, 16:42.' },
    comments: [
      { id: 'c6', authorId: 'u_greta', text: 'Attendance. Yes. That is exactly the word for the running version of this too.', minutesAgo: 60, likes: 210 },
      { id: 'c7', authorId: 'u_alex', text: 'Eleven minutes is a whole career if you are there for them.', minutesAgo: 44, likes: 96 },
    ],
  },
  {
    id: 'p4', authorId: 'u_rahul', kind: 'note', minutesAgo: 165,
    title: 'We killed our best-performing feature',
    body: [
      'It had the highest engagement numbers in the product and it made people slightly worse at the thing they came to us for. Both were true. We shipped it anyway for eight months.',
      'The meeting where we removed it took nine minutes. Nobody argued. Everyone had been carrying it privately.',
      'Retention dipped four percent for three weeks and then came back higher than before. I do not think that is a law of nature. I think we just got to stop apologising for our own product.',
    ],
    topics: ['Startups', 'Business', 'Design'], likes: 2470, reposts: 388,
    concepts: ['product', 'metrics', 'decisions', 'founder', 'company'],
    comments: [
      { id: 'c8', authorId: 'u_ife', text: 'Nine minutes because the decision was made months earlier, everywhere except the calendar.', minutesAgo: 90, likes: 174 },
    ],
  },
  {
    id: 'p5', authorId: 'u_ife', kind: 'essay', minutesAgo: 200,
    title: 'Kerning is an argument about time',
    body: [
      'A tight setting reads fast and slightly anxious. Loose reads unhurried, sometimes to the point of smugness. Neither is correct. Both are a claim about how much of the reader\'s day you deserve.',
      'When someone tells me a paragraph "feels wrong" and cannot say why, nine times in ten it is spacing, not the words. We fix the sentence for an hour when the fix was two units of tracking.',
      'This is my whole argument for why writers should learn a little typography. Not to become designers. To stop blaming the prose for the page.',
    ],
    topics: ['Design', 'Writing', 'Craft'], likes: 4021, reposts: 512,
    concepts: ['typography', 'typeface', 'letters', 'reading', 'layout'],
    art: { seed: 404, motif: 'facets', palette: 'amber', ratio: '4:3', caption: 'Tracking tests, 8pt to 14pt.' },
    comments: [
      { id: 'c9', authorId: 'u_alex', text: 'Stop blaming the prose for the page. Framing that.', minutesAgo: 120, likes: 302 },
      { id: 'c10', authorId: 'u_priya', text: 'Same logic as tailoring. The cloth is rarely the problem.', minutesAgo: 95, likes: 88 },
    ],
  },
  {
    id: 'p6', authorId: 'u_jonas', kind: 'essay', minutesAgo: 260,
    title: 'Attention is not a resource, it is a relationship',
    body: [
      'The economic metaphor has eaten the whole conversation. We speak of spending attention, budgeting it, having it stolen. All of that assumes a fixed quantity sitting in a vault behind your eyes.',
      'But anyone who has read for six hours without noticing knows the supply is not fixed. Attention expands toward things that answer back. It collapses around things that only take.',
      'Which suggests the real question is not how much you have. It is what you are in conversation with. A feed that never answers will drain you at any budget.',
      'I am aware of the irony of publishing this here. Ask me about it in the comments — I would like the argument.',
    ],
    topics: ['Philosophy', 'Psychology', 'Writing'], likes: 6733, reposts: 1204,
    concepts: ['focus', 'mind', 'meaning', 'thinking', 'distraction'],
    comments: [
      { id: 'c11', authorId: 'u_sarah', text: 'The "answers back" criterion is doing a lot of work and I think it holds.', minutesAgo: 150, likes: 411 },
      { id: 'c12', authorId: 'u_jonas', text: 'It is, and I am not sure it survives contact with a really good novel, which answers back very slowly.', minutesAgo: 140, likes: 199 },
    ],
  },
  {
    id: 'p7', authorId: 'u_olivia', kind: 'note', minutesAgo: 320,
    title: 'Salt earlier than you think',
    body: [
      'Almost every home cook I have watched salts at the end, tastes, panics, and adds more. The dish ends up salty on the surface and flat underneath.',
      'Salt at each stage instead — the onions, the liquid, the finish. Small amounts. The food seasons from the inside and you need less in total.',
      'It is the cooking equivalent of editing as you go. Nobody can rescue a bland stew in the last two minutes, and nobody can rescue a bland draft in the last paragraph.',
    ],
    topics: ['Food', 'Craft'], likes: 3388, reposts: 274,
    concepts: ['cooking', 'kitchen', 'recipe', 'technique'],
    art: { seed: 505, motif: 'orbit', palette: 'moss', ratio: '1:1', caption: 'Tuesday, onions, patience.' },
    comments: [
      { id: 'c13', authorId: 'u_noor', text: 'The editing parallel is unfairly good.', minutesAgo: 180, likes: 121 },
    ],
  },
  {
    id: 'p8', authorId: 'u_daniel', kind: 'essay', minutesAgo: 380,
    title: 'Difficulty is a form of respect',
    body: [
      'Easy games assume you will leave. They hand you everything early because they do not trust you to stay long enough to earn it.',
      'A hard game makes a wager: that you are the kind of person who will come back. That is a compliment, delivered as an obstacle.',
      'The failure mode is not difficulty, it is opacity. Punishing is fine. Confusing is contempt. The player should always be able to say, out loud, what they did wrong.',
      'Everything I know about writing tutorials I learned from watching people rage-quit level two.',
    ],
    topics: ['Gaming', 'Design', 'Technology'], likes: 7112, reposts: 866,
    concepts: ['games', 'player', 'systems', 'feedback'],
    art: { seed: 606, motif: 'facets', palette: 'iris', ratio: '16:9', caption: 'Failure states, mapped.' },
    comments: [
      { id: 'c14', authorId: 'u_daniel', text: 'To be clear: I still rage-quit level two. Regularly. In my own games.', minutesAgo: 300, likes: 540 },
    ],
  },
  {
    id: 'p9', authorId: 'u_noor', kind: 'essay', minutesAgo: 440,
    title: 'Some words only exist in the walk between two houses',
    body: [
      'There is a verb in the dialect my grandmother used that means to visit someone without warning, at an hour when they will definitely feed you. English has to rent four clauses to say it.',
      'Translation is mostly grief management. You accept the loss, then decide which loss to take. Rhythm or precision. Register or literal sense. You cannot keep them all and pretending otherwise makes flat, careful, dead sentences.',
      'The compensation is that you sometimes find a word in the other direction. Something English does in one syllable that takes my grandmother\'s language a whole afternoon.',
    ],
    topics: ['Books', 'Culture', 'Writing', 'Travel'], likes: 4590, reposts: 623,
    concepts: ['language', 'translation', 'grandmother', 'dialect', 'reading'],
    comments: [
      { id: 'c15', authorId: 'u_alex', text: '"Translation is mostly grief management" — I will be thinking about that all week.', minutesAgo: 320, likes: 288 },
    ],
  },
  {
    id: 'p10', authorId: 'u_greta', kind: 'field-note', minutesAgo: 500,
    title: 'Twenty-one kilometres in the dark',
    body: [
      'Left at five. The trail was ice for the first eight and then, without any announcement, it was just wet leaves and the sound of my own breathing.',
      'Cold running does something strange to time. The first half hour is negotiation. After that the body stops filing complaints and you get a rare, clean, unfurnished mind.',
      'Saw two deer at the turn. Neither of us moved for maybe fifteen seconds. Best part of the week.',
    ],
    topics: ['Fitness', 'Nature', 'Health'], likes: 2144, reposts: 96,
    concepts: ['running', 'winter', 'cold', 'training', 'forest', 'morning'],
    art: { seed: 707, motif: 'dunes', palette: 'moss', ratio: '16:9', caption: '05:48, still dark.' },
    comments: [
      { id: 'c16', authorId: 'u_maya', text: 'Unfurnished mind. Stealing that for a caption.', minutesAgo: 400, likes: 143 },
    ],
  },
  {
    id: 'p11', authorId: 'u_tomas', kind: 'note', minutesAgo: 560,
    title: 'The record I keep failing to describe',
    body: [
      'Fourth attempt at writing about this album and every draft turns into a list of adjectives. Warm. Spacious. Patient. Useless words that could describe a hotel lobby.',
      'What actually happens is this: the bass enters ninety seconds late, and until it does, you do not know you have been waiting.',
      'That is the whole review. Everything else was me trying to sound like a critic.',
    ],
    topics: ['Music', 'Writing', 'Culture'], likes: 1893, reposts: 154,
    concepts: ['album', 'listening', 'sound', 'review'],
    comments: [],
  },
  {
    id: 'p12', authorId: 'u_priya', kind: 'essay', minutesAgo: 620,
    title: 'Nobody actually wants a capsule wardrobe',
    body: [
      'They want the feeling of having decided. The thirty-item list is a proxy for a settled mind, which is why the lists keep getting rewritten by people who already own everything on them.',
      'Clothes are a language and languages resist minimalism. You can get by with three hundred words. You will just sound like someone getting by.',
      'Buy less, sure. But buy less the way a writer cuts — for rhythm, not for a target word count.',
    ],
    topics: ['Fashion', 'Culture', 'Design'], likes: 5240, reposts: 719,
    concepts: ['wardrobe', 'style', 'clothes', 'minimalism'],
    art: { seed: 808, motif: 'weave', palette: 'amber', ratio: '3:4', caption: 'Six coats, one decision.' },
    comments: [
      { id: 'c17', authorId: 'u_ife', text: '"Cut for rhythm, not for a word count" applies to type specimens too.', minutesAgo: 500, likes: 167 },
    ],
  },
]

POSTS.push(
  {
    id: 'p13', authorId: 'u_sarah', kind: 'note', minutesAgo: 700,
    title: 'A weekend project that teaches more than a course',
    body: [
      'Build something that reads your own writing back to you. Not a chatbot. A tool that takes a folder of your drafts and tells you which sentences you reuse.',
      'It is two hundred lines. You will learn embeddings, chunking, and similarity by needing them, which is the only way any of it sticks.',
      'The output is also genuinely humbling. I say "the interesting thing is" roughly once every four hundred words.',
    ],
    topics: ['AI', 'Programming', 'Writing'], likes: 4410, reposts: 802,
    concepts: ['beginner', 'projects', 'embeddings', 'build', 'python', 'learn'],
    comments: [
      { id: 'c18', authorId: 'u_rahul', text: 'Ran this on two years of company updates. I have used the word "excited" 311 times. Devastating.', minutesAgo: 500, likes: 622 },
    ],
  },
  {
    id: 'p14', authorId: 'u_alex', kind: 'note', minutesAgo: 760,
    title: 'On finishing things that are still slightly wrong',
    body: [
      'The last ten percent of a piece is not polish, it is grief. You are giving up on the version that existed in your head, which was perfect because it was never written down.',
      'Publish it slightly wrong. The wrongness is legible only to you, and a finished imperfect thing teaches you more in a week than a perfect unfinished one teaches in a year.',
    ],
    topics: ['Writing', 'Psychology'], likes: 9120, reposts: 1841,
    concepts: ['finishing', 'perfectionism', 'draft', 'publish', 'block'],
    comments: [
      { id: 'c19', authorId: 'u_greta', text: 'Same with races. The plan dies at kilometre one.', minutesAgo: 600, likes: 245 },
      { id: 'c20', authorId: 'u_olivia', text: 'Grief, not polish. That reframe just unblocked a piece I have sat on since May.', minutesAgo: 540, likes: 310 },
    ],
  },
  {
    id: 'p15', authorId: 'u_maya', kind: 'field-note', minutesAgo: 830,
    title: 'A city is easiest to photograph on its worst weather day',
    body: [
      'Everyone shoots the golden hour and gets postcards. Go out in flat grey drizzle and the city stops performing.',
      'People walk differently. Colours behave. Neon does something in wet air that it refuses to do when it is dry.',
      'I have never made a picture I liked at noon in July. Not once in eleven years.',
    ],
    topics: ['Photography', 'Travel', 'Design'], likes: 6420, reposts: 388,
    concepts: ['city', 'winter', 'rain', 'street', 'light', 'places'],
    art: { seed: 909, motif: 'strata', palette: 'ink', ratio: '4:3', caption: 'Tuesday, no sun, finally something.' },
    comments: [],
  },
  {
    id: 'p16', authorId: 'u_rahul', kind: 'essay', minutesAgo: 900,
    title: 'Hiring the person who asks the boring question',
    body: [
      'In interviews everyone performs vision. The candidate I hire is the one who says, forty minutes in, "wait, who actually owns this decision today?"',
      'Vision is cheap and abundant and mostly a personality trait. The instinct to locate where a system is vague is rare and it compounds.',
      'Two of the best people I have worked with asked a version of that question in their first hour. Neither of them had a portfolio worth mentioning.',
    ],
    topics: ['Startups', 'Business', 'Psychology'], likes: 3860, reposts: 597,
    concepts: ['hiring', 'team', 'company', 'founder', 'decisions'],
    comments: [
      { id: 'c21', authorId: 'u_sarah', text: 'The research equivalent: the person who asks what the baseline is before anyone has said the word.', minutesAgo: 700, likes: 288 },
    ],
  },
  {
    id: 'p17', authorId: 'u_jonas', kind: 'note', minutesAgo: 980,
    title: 'Boredom is a skill we let atrophy',
    body: [
      'I gave myself twenty minutes a day of doing nothing. No walk, no audio, no window shopping for thoughts. Just sitting.',
      'Week one was unbearable. Week three, ideas started arriving unannounced, mostly the ones I had been trying to force at a desk.',
      'I do not think boredom generates ideas. I think it stops interrupting the ones already in progress.',
    ],
    topics: ['Philosophy', 'Psychology', 'Health'], likes: 5560, reposts: 981,
    concepts: ['focus', 'attention', 'habits', 'quiet', 'mind', 'slow'],
    comments: [],
  },
  {
    id: 'p18', authorId: 'u_olivia', kind: 'essay', minutesAgo: 1060,
    title: 'The bread failed for six weeks and then it did not',
    body: [
      'Nothing changed. Same flour, same oven, same hands. Somewhere in week seven my fingers started knowing when the dough was done, and I could not tell you what they know.',
      'This is the part of craft that no recipe survives contact with. You can write down four hundred grams. You cannot write down "until it feels like an earlobe" and expect it to transmit.',
      'So the recipe is a scaffold for a conversation your hands have with the material. Six weeks of bad bread is not failure, it is the conversation starting.',
    ],
    topics: ['Food', 'Craft', 'Writing'], likes: 7830, reposts: 1104,
    concepts: ['bread', 'baking', 'kitchen', 'practice', 'hands'],
    art: { seed: 1010, motif: 'orbit', palette: 'amber', ratio: '4:3', caption: 'Loaf 41. The first good one.' },
    comments: [
      { id: 'c22', authorId: 'u_ife', text: 'Every apprenticeship in every discipline, in four paragraphs.', minutesAgo: 900, likes: 402 },
    ],
  },
  {
    id: 'p19', authorId: 'u_daniel', kind: 'note', minutesAgo: 1140,
    title: 'Playtesting rule: never explain, just watch',
    body: [
      'The moment you say "oh, you have to press the shoulder button" the test is over. You have just patched the player instead of the game.',
      'Sit on your hands. Write down the exact second they get confused. That timestamp is worth more than the entire feedback form afterwards.',
    ],
    topics: ['Gaming', 'Design', 'Craft'], likes: 4290, reposts: 733,
    concepts: ['games', 'testing', 'players', 'ux', 'interface'],
    comments: [],
  },
  {
    id: 'p20', authorId: 'u_noor', kind: 'field-note', minutesAgo: 1220,
    title: 'Winter is the honest season for a coastal town',
    body: [
      'Everything built for visitors is shut. What remains is the actual place: three cafés, a hardware shop, and the specific way people greet each other when there is no one to perform for.',
      'I go in January now, deliberately. The light is short and low and every conversation lasts twice as long.',
      'If you want to know somewhere, arrive when it would rather you did not.',
    ],
    topics: ['Travel', 'Culture', 'Writing'], likes: 6710, reposts: 890,
    concepts: ['winter', 'travel', 'places', 'town', 'cold', 'off-season', 'destination'],
    art: { seed: 1111, motif: 'dunes', palette: 'ink', ratio: '16:9', caption: 'January, harbour, nobody.' },
    comments: [
      { id: 'c23', authorId: 'u_maya', text: 'The off-season is the only season. Fight me.', minutesAgo: 1000, likes: 312 },
    ],
  },
  {
    id: 'p21', authorId: 'u_ife', kind: 'note', minutesAgo: 1300,
    title: 'I redrew the same letter for nine days',
    body: [
      'Lowercase g. The double-storey kind, which is the most opinionated shape in the alphabet.',
      'Day one it was competent. Day nine it had a slight forward lean and one thin joint that makes the whole face feel like it is mid-sentence.',
      'Nobody will consciously notice. Everyone will feel it. That gap is the entire job.',
    ],
    topics: ['Design', 'Craft'], likes: 5980, reposts: 641,
    concepts: ['typography', 'letters', 'drawing', 'type'],
    art: { seed: 1212, motif: 'facets', palette: 'ember', ratio: '1:1', caption: 'g, versions 1 through 34.' },
    comments: [],
  },
  {
    id: 'p22', authorId: 'u_sarah', kind: 'essay', minutesAgo: 1400,
    title: 'Benchmarks measure the map, not the terrain',
    body: [
      'A number that goes up is enormously comforting and almost never the thing you care about. We optimised a retrieval score for a month and shipped a system users found worse.',
      'The reason was mundane. The benchmark rewarded finding the right document. Users wanted the right sentence, and would rather see three sentences than one perfect page.',
      'Now every metric gets a paired question written next to it: what would a person say out loud if this number were perfect and the product still felt bad?',
    ],
    topics: ['AI', 'Research', 'Science'], likes: 6120, reposts: 1320,
    concepts: ['evaluation', 'metrics', 'research', 'data', 'model'],
    comments: [
      { id: 'c24', authorId: 'u_jonas', text: 'Goodhart, but with a usable remedy attached. Rare.', minutesAgo: 1200, likes: 388 },
    ],
  },
  {
    id: 'p23', authorId: 'u_greta', kind: 'note', minutesAgo: 1480,
    title: 'The mile you do not want to run',
    body: [
      'There is always one. Usually the third. Nothing hurts, nothing is wrong, the body simply files a formal objection to the entire enterprise.',
      'I have learned to treat it as weather. You do not negotiate with weather. You keep going and eventually it is not raining.',
    ],
    topics: ['Fitness', 'Health', 'Psychology'], likes: 2980, reposts: 210,
    concepts: ['running', 'training', 'habits', 'discipline'],
    comments: [],
  },
  {
    id: 'p24', authorId: 'u_tomas', kind: 'essay', minutesAgo: 1560,
    title: 'Listening to one album a week instead of everything',
    body: [
      'Infinite access made me a tourist in my own taste. Thirty seconds, skip, forty seconds, skip, and at the end of a year I could not name a record that had changed me.',
      'So: one album, seven days, no shuffle. By Thursday you start hearing the arrangement. By Sunday you are humming a bass line you did not consciously register on Monday.',
      'It is the difference between meeting a hundred people and having one friend.',
    ],
    topics: ['Music', 'Culture', 'Psychology'], likes: 8410, reposts: 1512,
    concepts: ['album', 'listening', 'attention', 'sound', 'slow'],
    art: { seed: 1313, motif: 'orbit', palette: 'iris', ratio: '1:1', caption: 'Week 14.' },
    comments: [
      { id: 'c25', authorId: 'u_alex', text: 'Doing this with books next year. One a fortnight, no exceptions.', minutesAgo: 1300, likes: 297 },
    ],
  },
  {
    id: 'p25', authorId: 'u_priya', kind: 'field-note', minutesAgo: 1650,
    title: 'What the tailor said about my sleeve',
    body: [
      '"You do not want it shorter. You want to be able to see your hands." He was right, and no amount of measuring would have found it.',
      'Fit is not dimensions. Fit is a set of intentions about how you move through a room, expressed in centimetres.',
    ],
    topics: ['Fashion', 'Craft', 'Design'], likes: 3120, reposts: 288,
    concepts: ['tailoring', 'clothes', 'style', 'craft'],
    comments: [],
  },
  {
    id: 'p26', authorId: 'u_alex', kind: 'essay', minutesAgo: 1740,
    title: 'Write the version you would send a friend',
    body: [
      'Everything I have written that people actually forwarded started as a message to one specific person who I knew would push back.',
      'The audience of one does two things. It kills the throat-clearing, because your friend would tell you to get on with it. And it lets you assume context, which is where all the good compression lives.',
      'When it is done, I strip the name off the top. Nothing else needs to change.',
    ],
    topics: ['Writing', 'Craft', 'Psychology'], likes: 11200, reposts: 2410,
    concepts: ['audience', 'drafting', 'voice', 'essay', 'letters'],
    comments: [
      { id: 'c26', authorId: 'u_noor', text: 'The name at the top is a load-bearing wall you get to remove at the end. Lovely.', minutesAgo: 1500, likes: 508 },
      { id: 'c27', authorId: 'u_tomas', text: 'This is why liner notes are better than reviews.', minutesAgo: 1400, likes: 176 },
    ],
  },
  {
    id: 'p27', authorId: 'u_daniel', kind: 'note', minutesAgo: 1830,
    title: 'Small studios ship weirder things and that is the point',
    body: [
      'Nobody with a hundred million dollars is going to greenlight a game about being a postal worker in a town with no roads.',
      'The economics of small teams are brutal but they buy exactly one thing: the ability to be specific. Specificity is the only real moat in a medium this crowded.',
    ],
    topics: ['Gaming', 'Startups', 'Culture'], likes: 4740, reposts: 690,
    concepts: ['indie', 'games', 'studio', 'company'],
    comments: [],
  },
  {
    id: 'p28', authorId: 'u_jonas', kind: 'essay', minutesAgo: 1920,
    title: 'You are allowed to change your mind quietly',
    body: [
      'Public revision has become a genre — the long thread, the accounting, the apology. It is exhausting and it makes changing your mind expensive, which means people do it less.',
      'Most updates deserve no announcement. You simply hold the new view and act on it. The record of your thinking is the work, not a changelog about the work.',
    ],
    topics: ['Philosophy', 'Writing', 'Culture'], likes: 7020, reposts: 1180,
    concepts: ['opinion', 'thinking', 'mind', 'discourse'],
    comments: [
      { id: 'c28', authorId: 'u_rahul', text: 'Applies to strategy documents word for word.', minutesAgo: 1700, likes: 233 },
    ],
  },
  {
    id: 'p29', authorId: 'u_maya', kind: 'note', minutesAgo: 2010,
    title: 'Carry the smaller camera',
    body: [
      'The best body I own has produced my worst year of pictures, because it lives in a cupboard and my hands are not big enough to forget it is there.',
      'The camera you actually have on you beats the camera that is technically better. This is the least romantic and most true thing in photography.',
    ],
    topics: ['Photography', 'Craft'], likes: 5330, reposts: 447,
    concepts: ['camera', 'gear', 'lens', 'practice'],
    art: { seed: 1414, motif: 'aperture', palette: 'moss', ratio: '1:1', caption: 'The one that lives in a coat pocket.' },
    comments: [],
  },
  {
    id: 'p30', authorId: 'u_olivia', kind: 'note', minutesAgo: 2100,
    title: 'Cook the same dish for a month',
    body: [
      'Pick one thing. Make it thirty times. By the end you will have opinions about the pan, the heat, the order, and about yourself.',
      'Variety is how you avoid getting good at anything. This is true of kitchens, sentences and, I suspect, people.',
    ],
    topics: ['Food', 'Craft', 'Lifestyle'], likes: 3910, reposts: 402,
    concepts: ['cooking', 'practice', 'repetition', 'recipe'],
    comments: [],
  },
  {
    id: 'p31', authorId: 'u_sarah', kind: 'note', minutesAgo: 2200,
    title: 'Read the paper backwards',
    body: [
      'Limitations first, then results, then method, then abstract last. The abstract is marketing and it will frame everything you read after it.',
      'Going backwards, I catch overclaims roughly three times as often. It also takes less time, because half of them do not survive the limitations section.',
    ],
    topics: ['Research', 'Science', 'AI'], likes: 6890, reposts: 1470,
    concepts: ['paper', 'reading', 'research', 'science', 'method'],
    comments: [
      { id: 'c29', authorId: 'u_greta', text: 'Doing this with recipe blogs. Ingredients first, life story never.', minutesAgo: 2000, likes: 918 },
    ],
  },
  {
    id: 'p32', authorId: 'u_noor', kind: 'note', minutesAgo: 2320,
    title: 'Keep a notebook you are willing to ruin',
    body: [
      'Beautiful notebooks stay empty. Mine is cheap, the cover is bent, and there is a coffee ring on page forty that I now use as a bookmark.',
      'The permission to write badly has to be built into the object. Nothing precious ever holds a first draft.',
    ],
    topics: ['Writing', 'Craft', 'Lifestyle'], likes: 8240, reposts: 1330,
    concepts: ['notebook', 'journal', 'draft', 'habits', 'morning'],
    art: { seed: 1515, motif: 'weave', palette: 'ember', ratio: '3:4', caption: 'Page forty, with bookmark.' },
    comments: [],
  },
)
