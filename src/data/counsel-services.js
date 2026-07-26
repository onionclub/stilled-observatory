/**
 * Counsel services — email counseling offerings.
 * Each service is a tier of email-based counseling/consulting.
 *
 * Fields:
 *   slug       — URL-safe identifier
 *   name       — display name
 *   tagline    — one-line hook
 *   price      — human-readable price string
 *   features   — array of deliverables/features
 *   badge      — optional label (e.g. "Most Popular")
 */

const services = [
  {
    slug: 'single-reflection',
    name: 'Single Reflection',
    tagline: 'One exchange. One question. One honest answer.',
    price: '$60',
    features: [
      'You send one email — up to 500 words — detailing your situation, question, or impasse.',
      'A single written response within 72 hours. No templates. No scripts. A direct, forensic reply.',
      'Best for: a decision you are circling, a paradox you cannot resolve, a moment that demands clarity.',
    ],
  },
  {
    slug: 'three-part-inquiry',
    name: 'Three‑Part Inquiry',
    tagline: 'Three exchanges over two weeks. A short arc of sustained attention.',
    price: '$150',
    badge: 'Most Requested',
    features: [
      'Opening email (up to 800 words) — you lay out the terrain.',
      'Written response within 72 hours, followed by your reply and a second written response.',
      'A third and final exchange to consolidate, refine, or pivot.',
      'Best for: navigating a transition, untangling a layered problem, testing a framework against your life.',
    ],
  },
  {
    slug: 'sustained-counsel',
    name: 'Sustained Counsel',
    tagline: 'Eight exchanges over one month. A container for something that needs time.',
    price: '$400',
    features: [
      'Up to eight email exchanges across four weeks. Paced to your rhythm.',
      'Each response is a full session of attention — not a rushed reply between meetings.',
      'Includes one 30‑minute voice or video call at the midpoint, if useful.',
      'Best for: a season of reconstruction, a creative or existential threshold, sustained accompaniment through difficulty.',
    ],
  },
];

export default services;

export function getServiceBySlug(slug) {
  return services.find(s => s.slug === slug) || null;
}
