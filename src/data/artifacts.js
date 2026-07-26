/**
 * Artifacts — digital products, study resources, and frameworks.
 * Self-guided. Immediate download. No waiting.
 */

const artifacts = [
  {
    slug: 'master-guidebook',
    name: 'The Master Guidebook',
    tagline: 'A comprehensive step-by-step curriculum on internal stillness, assumption, and the dissolution of external effort.',
    price: '$87',
    formats: ['PDF', 'Notion Workspace'],
    overview: 'A complete self-guided course alternative — the framework for understanding and applying the mechanics of Being and state assumption.',
    features: [
      'Complete framework explaining the principles of Being and state assumption.',
      'Daily practical exercises, revision protocols, and reflection prompts.',
      'Curated reading guides and integration routines designed to replace complex "manifestation rituals."',
    ],
  },
  {
    slug: 'neville-study-notes',
    name: 'Neville Goddard Study Notes',
    tagline: 'The Law of Assumption, Feeling, and the Inner World.',
    price: '$19',
    formats: ['PDF'],
    category: 'author-notes',
    overview: 'High-density synthesis of Neville\'s complete corpus — the mechanics of imagination, the feeling of the wish fulfilled, and the practice of living from the end.',
  },
  {
    slug: 'seth-study-notes',
    name: 'Seth Materials Study Notes',
    tagline: 'Nature of Personal Reality and Multidimensional Consciousness.',
    price: '$19',
    formats: ['PDF'],
    category: 'author-notes',
    overview: 'Concise synthesis of the Seth books — beliefs as blueprints, the multidimensional self, and the mechanics of conscious reality construction.',
  },
  {
    slug: 'acim-study-notes',
    name: 'A Course in Miracles Study Notes',
    tagline: 'Forgiveness, Perception, and Inner Peace.',
    price: '$19',
    formats: ['PDF'],
    category: 'author-notes',
    overview: 'The Course\'s core architecture distilled: forgiveness as perceptual correction, the Holy Spirit as inner teacher, and the undoing of the ego\'s thought system.',
  },
  {
    slug: 'dispenza-study-notes',
    name: 'Joe Dispenza Study Notes',
    tagline: 'Overcoming the Old Self and Rewiring Awareness.',
    price: '$19',
    formats: ['PDF'],
    category: 'author-notes',
    overview: 'The neuroscience of transformation — heart-brain coherence, epigenetic change through sustained elevated states, and the biology of belief.',
  },
  {
    slug: 'bashar-study-notes',
    name: 'Bashar Study Notes',
    tagline: 'State of Being, Excitement, and Neutral Preference.',
    price: '$19',
    formats: ['PDF'],
    category: 'author-notes',
    overview: 'The Bashar transmission distilled: following excitement as the compass, the formula of "Act on your highest excitement with no insistence on the outcome," and neutral preference as freedom.',
  },

  // Bundle (computed)
];

export default artifacts;

/** The Complete Author Study Bundle: all 5 notes, save $38 */
export const bundle = {
  slug: 'author-study-bundle',
  name: 'The Complete Author Study Bundle',
  tagline: 'All 5 Metaphysical Author Study Notes in a single collection.',
  price: '$57',
  note: 'Buy 3, Get 2 Free — Save $38',
  formats: ['PDF'],
  overview: 'The entire library of Author Study Notes across Neville Goddard, Seth, A Course in Miracles, Joe Dispenza, and Bashar — five distinct systems, one unified understanding.',
};
