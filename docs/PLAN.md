# Phase 4 Orchestration Plan

## Overview
Phase 4 will be implemented strictly sequentially, pausing for user review and output demonstration after **each individual zone** before proceeding to the next.

## Step 1: Zone 3 — Baseline Engine
- **Logic (`metrics.ts`)**: Implement z-score calculation per post against the personal historical mean of all prior Resonance Index composite scores (using the 5 existing placeholder essays).
- **Threshold**: ±0.5 (ABOVE BASELINE / WITHIN RANGE / BELOW BASELINE). (Wait, the user spec says "AT BASELINE" but the main spec doc says "WITHIN RANGE". I will use "WITHIN RANGE" as defined in `OBSERVATORY_SPEC.md`, or maybe the user explicitly requested "AT BASELINE" in the prompt -> User wrote: `ABOVE BASELINE / AT BASELINE / BELOW BASELINE, threshold ±0.5`. I will use what the user prompt said: `AT BASELINE`).
- **UI (`index.astro`)**: Connect the generated data to the Baseline Engine card.
- **Action**: Pause and show exact output.

## Step 2: Zone 4 — Convergence Events
- **Logic (`metrics.ts`)**: Implement spike detection (signal value > mean by ≥1 std dev). A Convergence Event triggers when 3+ signals spike within a 48-hour window.
- **UI (`index.astro`)**: Connect the generated events to the Convergence Events card (displaying timestamp, triggered signals, essay slug, and the "Within 48 hours" required string).
- **Action**: Pause and show exact output.

## Step 3: Zone 9 — Audience Depth Index
- **Logic (`metrics.ts`)**: Categorize readers into four tiers based on scroll depth + return visit data (SURFACE <40%, ENGAGED 40-69%, DEEP 70-89%, IMMERSED ≥90%).
- **UI (`index.astro`)**: Render as a horizontal stacked bar per essay using only the strict Stilled brand palette (`#FAF9F6`, `#F0EDE4`, `#1A1A1A`, `#6B6560`, `#C8BCA8`, `#8B7355`). Use standard DOM elements instead of default charts. Adhere to typography rules (Cormorant Garamond display, Inter body, all-caps Inter labels at 0.12em).
- **Action**: Pause and show exact output.

## Step 4: Zone 10 — Intellectual Proximity Layer
- **Logic (`metrics.ts`)**: Generate placeholder session navigation paths indicating Adjacency pairs (Essay A → Essay B, count).
- **UI (`index.astro`)**: Render as a simple ranked list (no graph libraries).
- **Action**: Pause and show exact output.

## Step 5: State Update
- Update `STATE.xml` exactly to:
  - Phase 4 status: `built`
  - Phase 4 gate: `NOT MET`
  - Gate condition note: `Requires 10 published posts in consistent format for z-score statistical validity. Cannot be met until deployment.`

## Hard Rules Acknowledged
- All logic in `src/utils/metrics.ts`. No new files unless declared.
- SSR only.
- No localStorage.
- Do not touch `inject-tracking.mjs`.
- Do not touch `.env`.
- Do not mark the Phase 4 gate as met.
