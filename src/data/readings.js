/**
 * Directory — curated readings across spiritual, esoteric, and religious traditions.
 * Add or replace entries as your library grows.
 *
 * Fields:
 *   title       — work title
 *   author      — author name
 *   category    — tradition/category key (maps to display name below)
 *   note        — short description or why it matters
 *   link        — optional external URL (Amazon, publisher, reference)
 */

const readings = [
  // ── Eastern Traditions ─────────────────────
  {
    title: 'The Tao Te Ching',
    author: 'Lao Tzu',
    category: 'eastern',
    note: 'The foundational text of Taoism. 81 short chapters on the nature of the Way, wu-wei, and the paradox of action through non-action.',
    link: null,
  },
  {
    title: 'The Bhagavad Gita',
    author: 'Vyasa',
    category: 'eastern',
    note: 'A dialogue between Arjuna and Krishna on the battlefield of Kurukshetra — duty, devotion, and the yoga of action.',
    link: null,
  },
  {
    title: 'Zen Mind, Beginner\'s Mind',
    author: 'Shunryu Suzuki',
    category: 'eastern',
    note: 'A concise introduction to Zen practice and the posture of not-knowing that opens the door to insight.',
    link: null,
  },

  // ── Western Esotericism ────────────────────
  {
    title: 'The Kybalion',
    author: 'Three Initiates',
    category: 'esoteric',
    note: 'Seven Hermetic principles attributed to Hermes Trismegistus — mentalism, correspondence, vibration, polarity, rhythm, cause and effect, and gender.',
    link: null,
  },
  {
    title: 'The Secret Teachings of All Ages',
    author: 'Manly P. Hall',
    category: 'esoteric',
    note: 'An encyclopedic survey of esoteric symbolism, mystery schools, alchemy, and the Western inner tradition.',
    link: null,
  },
  {
    title: 'Corpus Hermeticum',
    author: 'Hermes Trismegistus (attrib.)',
    category: 'esoteric',
    note: 'The classical Hermetic texts that shaped Renaissance thought — dialogues on the divine mind, the cosmos, and the soul\'s ascent.',
    link: null,
  },

  // ── Mysticism & Contemplation ──────────────
  {
    title: 'The Cloud of Unknowing',
    author: 'Anonymous (14th c.)',
    category: 'mysticism',
    note: 'A medieval Christian guide to contemplative prayer — entering the darkness between you and God, where only love can reach.',
    link: null,
  },
  {
    title: 'The Interior Castle',
    author: 'St. Teresa of Ávila',
    category: 'mysticism',
    note: 'The soul as a crystal castle of seven mansions, each one deeper into union with the divine. A masterpiece of Christian mysticism.',
    link: null,
  },
  {
    title: 'The Masnavi',
    author: 'Rumi (Jalal al-Din)',
    category: 'mysticism',
    note: 'Six books of Sufi teaching stories, poetry, and metaphysical commentary — often called the "Quran in Persian."',
    link: null,
  },

  // ── Sacred Texts ───────────────────────────
  {
    title: 'The Upanishads',
    author: 'Various (800–200 BCE)',
    category: 'sacred',
    note: 'The philosophical core of the Vedas — inquiries into Brahman, Atman, and the nature of ultimate reality.',
    link: null,
  },
  {
    title: 'The Dhammapada',
    author: 'Buddha (attrib.)',
    category: 'sacred',
    note: '423 verses on ethics, mind training, and the path to liberation. The most accessible entry to the Pali canon.',
    link: null,
  },
  {
    title: 'The Nag Hammadi Library',
    author: 'Various (2nd–4th c.)',
    category: 'sacred',
    note: 'Gnostic gospels and texts discovered in Egypt in 1945 — the Gospel of Thomas, the Apocryphon of John, and others outside the canonical tradition.',
    link: null,
  },

  // ── Philosophy of Religion ─────────────────
  {
    title: 'The Perennial Philosophy',
    author: 'Aldous Huxley',
    category: 'philosophy',
    note: 'An anthology and argument for the common metaphysical core shared across the world\'s contemplative traditions.',
    link: null,
  },
  {
    title: 'The Varieties of Religious Experience',
    author: 'William James',
    category: 'philosophy',
    note: 'A psychological and philosophical study of mystical experience, conversion, and the felt texture of religious life.',
    link: null,
  },
  {
    title: 'I and Thou',
    author: 'Martin Buber',
    category: 'philosophy',
    note: 'The distinction between I-It (objectification) and I-Thou (relation) — a philosophy of dialogue that grounds authentic encounter.',
    link: null,
  },
];

export default readings;

export const categories = {
  eastern:     { name: 'Eastern Traditions',      description: 'Taoism, Buddhism, Hinduism, and the wisdom traditions of the East.' },
  esoteric:    { name: 'Western Esotericism',      description: 'Hermeticism, alchemy, mystery schools, and the Western inner tradition.' },
  mysticism:   { name: 'Mysticism & Contemplation', description: 'The direct path — contemplative practice, union, and the interior life.' },
  sacred:      { name: 'Sacred Texts',             description: 'Foundational scriptures and primary sources across traditions.' },
  philosophy:  { name: 'Philosophy of Religion',   description: 'Critical and comparative studies of religious experience and metaphysics.' },
};
