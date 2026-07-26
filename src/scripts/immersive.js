/**
 * Stilled. — Immersive Engine v2
 * Cuberto mouse-follower for cursor + Lenis smooth scroll + GSAP ScrollTrigger.
 * Modern 2025 stack: purpose-built cursor library, not custom CSS hacks.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MouseFollower from 'mouse-follower';

gsap.registerPlugin(ScrollTrigger);
MouseFollower.registerGSAP(gsap);

// ── Cuberto Cursor ────────────────────────
let cursor;
function initCursor() {
  // Native cursor hidden via class on <html>
  if (window.matchMedia('(pointer: fine)').matches) {
    document.documentElement.classList.add('has-custom-cursor');
  }
  if (window.matchMedia('(pointer: coarse)').matches) return;

  cursor = new MouseFollower({
    speed: 0.6,
    ease: 'expo.out',
    skewing: 2,
    hideOnLeave: true,
    stateDetection: {
      '-pointer': 'a, button, [data-magnetic], [data-cursor-pointer]',
      '-hidden': 'iframe, [data-cursor-hidden]',
      '-text': '[data-cursor-text]',
      '-exclusion': '[data-cursor-exclusion]',
    },
  });
}

// ── Lenis Smooth Scroll ───────────────────
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ── Split Text Reveal ─────────────────────
// DISABLED: text-splitting destroys whitespace between words/characters.
// Re-enable only when fixed to preserve inter-word spacing.
function initSplitText() {
  // Intentionally disabled — restore readable baseline text.
  return;
}

// ── Horizontal Pin ────────────────────────
function initHorizontalPin() {
  const container = document.querySelector('[data-horizontal-pin]');
  if (!container) return;
  const track = container.querySelector('[data-horizontal-track]');
  if (!track) return;
  const cards = track.querySelectorAll(':scope > *');
  if (cards.length < 2) return;
  const totalScroll = (cards.length - 1) * window.innerWidth * 0.65;
  gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth + 80),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      pin: true,
      start: 'top top',
      end: () => `+=${totalScroll}`,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
}

// ── Image Clip Reveals ────────────────────
function initImageReveals() {
  document.querySelectorAll('[data-reveal-clip]').forEach((el) => {
    const direction = el.getAttribute('data-reveal-clip') || 'up';
    const clipMap = { up: 'inset(100% 0% 0% 0%)', left: 'inset(0% 0% 0% 100%)', right: 'inset(0% 100% 0% 0%)' };
    el.style.clipPath = clipMap[direction] || clipMap.up;
    el.style.webkitClipPath = el.style.clipPath;
    el.style.transition = 'clip-path 1.2s cubic-bezier(0.16,1,0.3,1)';
    ScrollTrigger.create({
      trigger: el, start: 'top 85%',
      onEnter: () => { el.style.clipPath = 'inset(0% 0% 0% 0%)'; el.style.webkitClipPath = 'inset(0% 0% 0% 0%)'; },
      once: true,
    });
  });
}

// ── Parallax ──────────────────────────────
function initParallax() {
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
    gsap.to(el, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

// ── Init + Lifecycle ────────────────────────
let initialized = false;

function init() {
  // Guard against double-init on first load
  // (DOMContentLoaded fires, then astro:page-load also fires)
  if (initialized) return;
  initialized = true;

  initCursor();
  initLenis();
  initSplitText();
  initHorizontalPin();
  initImageReveals();
  initParallax();
}

function reset() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
  ScrollTrigger.refresh();
  if (cursor) { cursor.destroy(); cursor = null; }
  if (lenis) { lenis.destroy(); lenis = null; }
  initialized = false;
}

// First load
document.addEventListener('DOMContentLoaded', init);

// ViewTransitions: clean up old, init fresh
document.addEventListener('astro:after-swap', () => {
  reset();
  init();
});
