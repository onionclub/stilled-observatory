/**
 * YouTube video library — transcripts and thumbnail showcase.
 *
 * Fields:
 *   id          — YouTube video ID (from the URL: youtube.com/watch?v=ID)
 *   title       — video title
 *   date        — publish date
 *   duration    — human-readable duration
 *   thumbnail   — optional override (defaults to YouTube's maxresdefault)
 *   transcript  — full transcript text (paragraphs separated by blank lines)
 *   topics      — array of topic tags
 */

const videos = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'The Architecture of Assumption — How Feeling Creates Reality',
    date: '2026-07-20',
    duration: '24:18',
    topics: ['Law of Assumption', 'Neville Goddard', 'Feeling'],
    transcript: `There is a moment before every shift — a silence before the structure changes — that most people miss because they are looking at the circumstances instead of the architecture beneath them.

What I want to show you today is that the mechanism of assumption is not a metaphor. It is not a visualization exercise. It is not wishful thinking dressed in spiritual language. It is the literal operating system of experience.

Neville Goddard called it "living in the end." The Seth material calls it "the framework of beliefs." Reality Transurfing calls it "the space of variations." Different vocabularies for the same architecture: what you accept as true at the deepest level of your being becomes the structure of your experience. Not eventually. Not if the universe agrees. Immediately — in the only place reality is ever constructed, which is the present moment of consciousness.

But here is what most people miss: you cannot fake this. You cannot say the words and feel the doubt and expect the structure to shift. The subconscious does not respond to performance. It responds to conviction — the kind that lives in your body, not just your thoughts.

Today I want to walk through three examples from the archive that demonstrate this with almost clinical precision.`,
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'The Watcher and the Wound — Detaching From the Story That Keeps You Stuck',
    date: '2026-07-13',
    duration: '31:42',
    topics: ['Non-Duality', 'Identity', 'Inner Work'],
    transcript: `There is a version of you that is not the story. It was there before the story began, and it will be there after the story dissolves.

Most people spend decades trying to fix the character in the story — heal the wound, resolve the trauma, understand the pattern — without ever stepping outside the narrative frame to ask who is doing the watching.

This is not a bypass. I am not saying your pain is not real. I am saying the one who witnesses the pain is not the same as the one who suffers it, and the distinction is the most important thing you will ever learn about how consciousness actually works.

The watcher does not need healing. The watcher was never wounded. The watcher is the awareness in which the entire drama of wounding and healing plays out. When you learn to rest there — even for a moment — something shifts that no amount of analysis could touch.

Today I want to explore this through a lens that draws from A Course in Miracles, the Heart Sutra, and a series of direct experiences shared by people who have touched this shift and come back to describe it.`,
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Why Manifestation Fails — The Three Hidden Blocks No One Talks About',
    date: '2026-06-28',
    duration: '28:05',
    topics: ['Manifestation', 'Shadow Work', 'Self-Concept'],
    transcript: `If you have tried every technique and the shift still has not happened, this video is for you.

I am not going to give you another technique. I am going to show you the three blocks that make all techniques fail — not because the techniques are wrong, but because they are being applied to a structure that cannot hold them.

The first block is identification with the old state. You say you want change, but your sense of self is woven through the very conditions you claim to want to escape. Letting go of the problem would mean letting go of who you have been — and the self does not surrender its identity easily.

The second block is what I call the "checking reflex." Every time you look at your reality for proof that your practice is working, you reaffirm that it has not worked yet. The act of checking is the act of reinstalling the old state. You cannot look for evidence of change from within the state that has not changed.

The third block is the most subtle and the most devastating: you are trying to manifest from lack. The feeling that drives the desire is the feeling of not having. And the universe — or more precisely, the framework of consciousness that constructs experience — does not distinguish between "I want this" and "I do not have this." The feeling is the same. The architecture responds to feeling, not to words.

Let me walk you through each of these with examples from the archive and show you how to recognize which block is active for you right now.`,
  },
];

export default videos;
