---
name: observatory-spec
description: >
  The complete production specification for The Observatory — the private admin
  dashboard for Stilled. Use this skill when deciding what to build, how a zone
  should work, what data source to use, what logic governs a calculation, or
  whether a proposed build decision is in-spec. This is the blueprint. When in
  doubt, this document wins.
---

# THE OBSERVATORY — PRODUCTION SPECIFICATION SKILL
## The Blueprint — Read Before Building Any Zone, Feature, or Logic

---

## 1. WHAT THE OBSERVATORY IS

A solo-operator private admin dashboard. One user. No team. No collaborators. Every design and security decision reflects this constraint.

**Purpose:** Surface whether intellectual work is landing — not just being seen. Measures read depth, return visits, and conversion behavior. Rewards quality publishing, not frequency or virality.

**URL:** Private URL, gated by Cloudflare Zero Trust before Ghost login is reached.

**The public Stilled site is separate.** The Observatory is a completely separate interface. No changes to the public frontend are made as part of Observatory work.

---

## 2. INFRASTRUCTURE STACK

| Component | Service | Cost |
|---|---|---|
| CMS / Backend | Ghost CMS on Hetzner (or DigitalOcean) | ~$4-6/month |
| Security gate | Cloudflare Zero Trust in front of Ghost admin URL | Free tier |
| Analytics | Plausible Analytics | $9/month |
| Video data | YouTube Analytics API | Free |
| Product sales | Gumroad (external, no integration needed yet) | — |
| Total at completion | — | ~$20-25/month |

---

## 3. HARD RULES — NON-NEGOTIABLE

Read these before writing any logic or persistence code:

1. **No localStorage for any persistence.** The scratchpad and all user data persist server-side through Ghost member metadata only.
2. **No gamification.** No streak counters. No congratulatory language. No behavioral nudges.
3. **No dark mode toggle.**
4. **No color-coded urgency.** No red alerts, no green success indicators.
5. **Phase gates are hard stops.** Do not begin the next phase until the gate condition is met.
6. **Verbatim copy strings must appear exactly as specified** in Section 9 of STILLED_BRAND.md. Do not paraphrase.
7. **SE Asian Diaspora is a named column** in the 3AM Map. Never group it into "Other."
8. **The scratchpad Ghost member** (scratchpad@stilled.xyz) must be hidden from all public member lists, newsletter sends, and analytics zones.
9. **Intelligence Gap Indicator must surface stale data honestly.** Never display cached data silently without flagging staleness.
10. **The Resonance Index ranks by composite score, not raw views.** Never use pageview count as the primary ranking signal.

---

## 4. THE ELEVEN ZONES

### Zone 1 — AI Situational Brief
- **Position:** Top of dashboard, full width, first element on load
- **Data sources:** Ghost, Plausible, YouTube API (all four)
- **Format:** 3-5 plain sentences. No headers, no bullets, no markdown.
- **Tone:** Analyst field report. Plain declarative sentences. No motivational language. No praise.
- **Update:** Generated fresh on each login
- **Phase:** Phase 5

### Zone 2 — Resonance Index
- **Position:** Primary content zone, below AI Brief
- **Data sources:** Ghost (subscriber conversion), Plausible (scroll depth, time on page, return visits)
- **Format:** Ranked list. Each entry: essay title + composite score bar + qualitative tag
- **Composite score:** Equal weight across scroll depth, average read time, return visit rate, subscriber conversion
- **Qualitative tags (one per essay):**
  - DEEP READING — scroll depth and read time are dominant signals
  - RETURN VISITS — return visit rate is dominant signal
  - CONVERSION — subscriber conversion is dominant signal
- **Update:** Daily recalculation
- **Phase:** Phase 3

### Zone 3 — Baseline Engine
- **Position:** Adjacent to or below Resonance Index
- **Data sources:** Ghost (post metadata: format, publish day), Plausible (historical performance)
- **Format:** Labeled list, 3-4 essays, with flag badges
- **Logic:** Z-score comparison against personal historical average for same format type and day of week
- **Flag labels:**
  - ABOVE BASELINE — >1 standard deviation above average
  - WITHIN RANGE — within 1 standard deviation
  - BELOW BASELINE — >1 standard deviation below average
- **Holding message:** "Baseline data is still building. Minimum 10 essays per format required."
- **Required subline:** "Compared against your personal historical average for this format and day of week. Threshold: ±1 standard deviation (z-score)."
- **Update:** Daily
- **Phase:** Phase 4

### Zone 4 — Convergence Events
- **Position:** Visually elevated, distinct from standard data zones. Alert rail.
- **Data sources:** All four (Ghost, Plausible, YouTube API, scroll tracking)
- **Format:** Alert cards. 1-3 cards maximum visible at once.
- **Trigger:** Three or more of the following spike on the same essay within 48 hours:
  - Scroll depth above essay's own previous average
  - Return visits increase (same reader returning within 48 hours)
  - Newsletter click rate rises above average
  - YouTube referral traffic to associated essay increases
  - New subscribers whose entry point was this essay
- **Required card elements:**
  - Essay title (bold)
  - Signals that fired (listed)
  - "Within 48 hours" — this string is required on every card
  - Verdict line (forensic tone, e.g. "This piece landed.")
- **Visual treatment:** Subtle left accent border or warmer background fill. Never red/green urgency colors.
- **Update:** Checked every 6 hours
- **Phase:** Phase 4

### Zone 5 — Publication Heatmap
- **Position:** Full-width zone, below primary zones
- **Data sources:** Ghost (publish dates), Resonance Index composite score
- **Format:** GitHub-style full-year calendar grid
- **Cell intensity:** Reflects Resonance Index composite score — not the mere fact of publication
- **Scale:** 5 intensity levels mapped to Resonance score quintiles. Empty cell = no publication.
- **Below grid:** 7-day cadence label, 30-day trend line
- **Prohibited:** No streak counter. No "days since last post." No gamification of any kind.
- **Update:** Daily
- **Phase:** Phase 2

### Zone 6 — Traffic Sources
- **Position:** Secondary zone
- **Data sources:** Plausible (referral source breakdown)
- **Format:** Simple breakdown list: YouTube / Direct / Search / Referral / Other
- **Below breakdown:** "New subscribers this week: [N]"
- **Update:** Weekly refresh
- **Phase:** Phase 2

### Zone 7 — YouTube Intelligence Feed
- **Position:** Secondary zone
- **Data sources:** YouTube Analytics API, Plausible (essay scroll depth), Ghost (paper download events)
- **Format:** Per-video rows with three sub-metrics:
  1. Retention curve overlaid against essay scroll depth map
  2. Commentary-to-Paper Bridge Rate — "[N]% of commentary readers opened the paper."
  3. Subscriber conversion — "[N] video viewers became subscribers."
- **Update:** Daily
- **Phase:** Phase 3

### Zone 8 — The 3AM Map
- **Position:** Prominent zone, above-average vertical space
- **Data sources:** Plausible (time of visit, geographic region, scroll depth per session)
- **Format:** Dual-axis heatmap grid
- **Y-axis (rows):** 24 hours in 3-hour blocks — 12AM / 3AM / 6AM / 9AM / 12PM / 3PM / 6PM / 9PM
- **X-axis (columns):** 5 geographic regions — North America East / North America West / Europe / SE Asian Diaspora / Other
- **Cell value:** Read depth (scroll depth + time on page). NOT visit count.
- **Cell shading:** 5-level intensity scale. Light (#FAF9F6) to dark (#1A1A1A or warm charcoal variant)
- **Required legend:** "Cell intensity = read depth (scroll + time on page)"
- **SE Asian Diaspora is a named column.** Never grouped into Other.
- **Update:** Weekly
- **Phase:** Phase 2

### Zone 9 — Audience Depth Index
- **Position:** Secondary zone
- **Data sources:** Ghost (member reading history)
- **Format:** Four tier breakdown + Tier 4 archetype portrait
- **Tiers:**
  - Tier 1: 1 essay read
  - Tier 2: 2-5 essays read
  - Tier 3: 6-10 essays read
  - Tier 4: 10+ essays read
- **Tier 4 portrait shows:** Average essays before subscribing, most common discovery path, average time from first visit to subscription
- **No individual reader data.** Aggregate patterns only.
- **Update:** Weekly
- **Phase:** Phase 4

### Zone 10 — Intellectual Proximity Layer
- **Position:** Secondary zone, may be collapsed by default
- **Data sources:** Plausible (session navigation paths, next-page events)
- **Format:** Per essay: "Readers next opened →" + 2-3 essay titles with frequency counts
- **Logic:** Track which essay readers navigate to next within the same session
- **This is audience intelligence, not a recommendation engine.** No algorithmic suggestions.
- **Update:** Weekly
- **Phase:** Phase 4

### Zone 11 — Intelligence Gap Indicator
- **Position:** Slim bar, persistent, always visible. Bottom of UI.
- **Data sources:** Status ping to all four data source APIs
- **Format:** Four status indicators. Each shows: source name, status (Live / Stale / Unavailable), timestamp of last successful sync
- **Four sources:** Ghost CMS / Plausible Analytics / YouTube Analytics API / Scroll tracking script
- **Honesty principle:** Stale data must surface a visible notice in affected zones. Never display cached data silently.
- **Update:** Every 5 minutes
- **Phase:** Phase 5 (wired) — Phase 1 (static placeholder)

---

## 5. PERSISTENT ELEMENTS

### Security Bar (always visible)
- Cloudflare Zero Trust session status (Active / Expired)
- Timestamp of last successful login
- Session invalidation button (force logout, one click)
- Present on every view including Writing Room

### Writing Room
- Accessed via persistent "New Post" / "Writing Room" button
- Replaces zone grid — does not navigate away
- Full-width, distraction-free editor
- Ghost Admin API for publishing — never an iframe of Koenig editor

**Collapsible drawer contains:**
| Field | Spec |
|---|---|
| YouTube URL | Associates video with post for Zone 7 tracking |
| Cover Image | Standard Ghost cover image |
| Academic Paper | PDF upload — tracked for Commentary-to-Paper Bridge Rate |
| Publish Toggle | "Publish Now" / "Schedule" — Schedule reveals date/time input |
| Newsletter Toggle | "Send to subscribers as newsletter" — default off |
| Subscriber Note | "PRIVATE NOTE TO SUBSCRIBERS — VISIBLE IN EMAIL ONLY, NOT ON SITE" |
| Scratchpad | "SCRATCHPAD — NEVER PUBLISHED, PERSISTS BETWEEN SESSIONS" |

**Scratchpad persistence:** Server-side through Ghost member metadata. Not localStorage. Not a draft post. Persists across devices and cache clears.

---

## 6. IMPLEMENTATION PHASES

| Phase | Weeks | Scope | Gate Condition |
|---|---|---|---|
| Phase 1 | 1-2 | Ghost live, Zero Trust, Writing Room, Security Bar, Intelligence Gap placeholder | 3 real posts published through Ghost |
| Phase 2 | 3-4 | Plausible integration, YouTube API, Zone 5 Heatmap, Zone 6 Traffic Sources, Zone 8 3AM Map | Plausible tracking confirmed live, YouTube API key active |
| Phase 3 | 5-7 | Custom scroll/read depth tracking, paper download tracking, Zone 2 Resonance Index, Zone 7 YouTube Feed | Minimum 5 published posts with Plausible scroll data |
| Phase 4 | 8-10 | Zone 3 Baseline Engine, Zone 4 Convergence Events, Zone 9 Audience Depth, Zone 10 Proximity Layer | Minimum 10 published posts in same format for z-score validity |
| Phase 5 | 11-12 | Zone 1 AI Brief, Zone 11 fully wired, Security Bar fully wired | All prior zones live and returning data |

**Phase gates are hard stops.** Do not begin a new phase until the gate condition is confirmed met.

---

## 7. CURRENT BUILD STATUS

- **Phase 1:** Complete. Ghost running locally via Docker on MacBook. Writing Room functional. Scratchpad persisting via Ghost member metadata. Three gate posts published.
- **Phase 2:** Built structurally. Plausible and YouTube API wiring complete with placeholder .env variables. Real keys required at deployment.
- **Phase 3 and beyond:** Not yet built.

**Pending before deployment:**
- Hetzner server setup
- Domain pointed to server
- Plausible account (requires live site)
- YouTube API key (can be obtained without live site)
- Cloudflare Zero Trust gate

**Repository:** github.com/onionclub/stilled-observatory
