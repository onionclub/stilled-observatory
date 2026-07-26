/**
 * Counsel — written consultations, mentorship, and study resources.
 * Asynchronous, essay-style. No live calls required.
 */

const services = [
  {
    slug: 'single-inquiry',
    name: 'The Single Inquiry',
    tagline: 'One situation. One written response. One shift in perspective.',
    price: '$97',
    overview: 'A single, focused written consultation for when you need deep clarity on a specific challenge, desire, or internal block.',
    features: [
      'Submission of 1 structured context letter (up to 750 words) detailing your situation and up to 3 specific questions.',
      '1 comprehensive, custom essay-style response providing deep analysis, perspective shift, and practical integration steps.',
      'Delivered via email within 3 business days.',
    ],
  },
  {
    slug: 'three-letter-series',
    name: 'The 3-Letter Series',
    tagline: 'Three exchanges over 60 days. A short arc of sustained correspondence.',
    price: '$217',
    badge: 'Most Popular',
    overview: 'A multi-letter correspondence package designed for ongoing integration, allowing you to reflect, apply insights, and write back as your situation evolves.',
    note: 'Save $74 — effective rate of $72 per letter.',
    features: [
      '3 full written exchanges (up to 750 words and 3 questions per submission).',
      'Use your letters at your own pace over a 60-day period.',
      'Ideal for tracking progress through an internal transition or deep mindset shift.',
    ],
  },
  {
    slug: 'monthly-rhythm',
    name: 'The Monthly Rhythm',
    tagline: 'Steady, quiet accountability. An async retainer for sustained integration.',
    price: '$397 / month',
    badge: 'Limited — 8 Clients',
    overview: 'An ambient, structured monthly mentorship designed to accompany you through daily integration without the performance pressure or friction of live calls.',
    features: [
      '4 Main Deep-Dive Letters: 1 primary exchange per week focusing on core concepts, self-concept work, and active revision.',
      '4 Mid-Week Check-Ins: 1 brief touchpoint per week to refine application, answer quick questions, and keep alignment.',
      'Structured cadence: predictable schedule (e.g., client writes Monday, response delivered Wednesday; client checks in Friday, response delivered Saturday).',
    ],
  },
];

export default services;

export const addOns = [
  {
    slug: 'rush-delivery',
    name: '24-Hour Rush Delivery',
    price: '+$67',
    description: 'Guarantees your written response is delivered within 24 hours of submission.',
  },
  {
    slug: 'audio-reflection',
    name: 'Audio Voice Reflection',
    price: '+$47',
    description: 'Adds a 5–7 minute personalized audio voice memo alongside your written letter, elaborating on key themes with direct spoken cadence.',
  },
];

export function getServiceBySlug(slug) {
  return services.find(s => s.slug === slug) || null;
}
