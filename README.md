<div align="center">
  <h1 align="center">Stilled.</h1>
  <p align="center">
    <em>A publishing ecosystem for the architecture of consciousness.<br/>And the private instrument built to measure whether it lands.</em>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Astro-1A1A1A?style=flat-square&logo=astro&logoColor=FAF9F6" alt="Astro" />
    <img src="https://img.shields.io/badge/React-1A1A1A?style=flat-square&logo=react&logoColor=FAF9F6" alt="React" />
    <img src="https://img.shields.io/badge/Ghost-1A1A1A?style=flat-square&logo=ghost&logoColor=FAF9F6" alt="Ghost" />
    <img src="https://img.shields.io/badge/SQLite-1A1A1A?style=flat-square&logo=sqlite&logoColor=FAF9F6" alt="SQLite" />
    <img src="https://img.shields.io/badge/Docker-1A1A1A?style=flat-square&logo=docker&logoColor=FAF9F6" alt="Docker" />
    <img src="https://img.shields.io/badge/Status-Phase_2_Dev-8B7355?style=flat-square" alt="Status" />
  </p>
</div>

<br/>

There is a particular kind of vanity endemic to our age — the vanity of the counted. Pageviews. Impressions. Follower counts ticking upward like a fever chart no one knows how to read. We have confused the noise of attention with the weight of meaning, and in doing so have built an entire civilization of measurement around the wrong thing entirely.

This repository refuses that bargain.

**Stilled.** is a forensic publishing platform. Its single subject is the interior life — consciousness, paradox, identity, and the mechanisms most people feel but cannot name. It does not prescribe. It does not comfort. It reveals. There is a difference, and most things built today have forgotten it.

This repository contains two things: the public face of Stilled., and the private instrument — **The Observatory** — built to measure whether the work is actually reaching the depths it was written for.

---

## The Public Site

The public frontend is an Astro static site. Warm alabaster. Charcoal. Cormorant Garamond for the things that matter, Inter for the things that serve. A landing threshold with a persisted background video. Pages for Theories, Artifacts, a Directory of influences, and a Counsel form for those who arrive with something they cannot yet articulate.

No analytics visible to the reader. No comment sections. No engagement mechanics. The work stands alone or it does not stand at all.

**Stack:** Astro SSG · Vanilla CSS · React (sparingly, for interactive components) · Ghost Content API

---

## The Observatory

The Observatory is not a dashboard in any sense that Silicon Valley would recognize. It does not congratulate. It does not display streaks. It does not tell you that you are doing well.

It is a command center for a single operator who publishes for the sleepless — for the high-functioning professionals in existential crisis, the deconstructionists seeking new frameworks for meaning, the 3AM readers in diaspora cities who found something here at an hour when nothing else made sense. The Observatory exists to understand them, not to harvest them.

Eleven zones. Each one measuring something that matters.

| Zone | Designation | Function |
| :--- | :--- | :--- |
| **01** | **AI Situational Brief** | Generated synthesis of momentum anomalies across the full system. |
| **02** | **Resonance Index** | Multi-variable composite score. Not raw pageviews. Never raw pageviews. |
| **03** | **Baseline Engine** | Z-score deviation tracking against personal historical averages. |
| **04** | **Convergence Events** | Alert cards surfacing clustered retention spikes within 48 hours. |
| **05** | **Publication Heatmap** | 52-week visual record of essay resonance across time. |
| **06** | **Traffic Sources** | Forensic breakdown of acquisition pathways and referral chains. |
| **07** | **YouTube Intelligence** | Bridge-rates from specific videos to literature and downloads. |
| **08** | **The 3AM Map** | Time-based geographic mapping of read depth. The loneliness cartograph. |
| **09** | **Audience Depth Index** | Aggregate patterning of reader lifecycle behavior across the archive. |
| **10** | **Proximity Layer** | Tracing the internal navigation of a single session — what leads to what. |
| **11** | **Gap Indicator** | Persistent diagnostic of incoming data stream latencies and sync failures. |

**Stack:** Astro SSR (Node) · Ghost CMS v5 (Alpine/SQLite, containerized) · Plausible Analytics · YouTube Data API · Docker · Cloudflare Zero Trust

Ghost is never exposed to the open web. It lives on an internal Docker network. This is not a security feature. It is a philosophy.

---

## Architecture

```
stilled-observatory/
├── src/                        # Public Stilled frontend (Astro SSG)
│   ├── pages/                  # index, home, theories, directory, artifacts, counsel
│   ├── components/             # Navigation, CursorMask, ScrollReveal
│   ├── styles/                 # global.css — the single source of visual truth
│   └── data/                   # Mock data, pending Ghost Content API
│
├── observatory_app/            # The Observatory dashboard (Astro SSR)
│   └── src/
│       ├── pages/              # Eleven zone interfaces
│       ├── layouts/            # Observatory shell, Security Bar
│       └── utils/              # Metrics, ping, YouTube bridge
│
├── public/
│   └── portraits/              # Dostoevsky, Laozi, Nietzsche — atmospheric presences
│
└── docker-compose.local.yml    # Ghost + SQLite local environment
```

---

## Local Development

### 1. Boot Ghost

```bash
docker-compose -f docker-compose.local.yml up -d
```

Ghost surfaces at `http://localhost:2368`. Navigate to `/ghost`, configure an owner account, and retrieve a Custom Integration Admin API key.

### 2. Configure Environment

```bash
cd observatory_app
cp .env.example .env
```

```text
GHOST_URL=http://localhost:2368
GHOST_ADMIN_API_KEY=your:ghostapikey
PLAUSIBLE_API_KEY=yourplausiblekey
PLAUSIBLE_SITE_ID=stilled.xyz
YOUTUBE_API_KEY=yourgoogleyoutubekey
```

### 3. Launch

```bash
npm install
npm run dev
```

The Observatory compiles at `http://localhost:4321`.

---

## Roadmap

- [x] **Phase 1** — Container infrastructure, Astro SSR proxy, Ghost Admin API, Writing Room, Scratchpad persistence
- [x] **Phase 2** — Public frontend: home, theories, directory, artifacts, counsel. Responsive refactor. Cinematic transitions. Philosopher portraits.
- [ ] **Phase 3** — Plausible + YouTube telemetry, Publication Heatmap, The 3AM Map
- [ ] **Phase 4** — Resonance Index composite scoring, deep read tracking, Baseline Engine
- [ ] **Phase 5** — Convergence alerts, Audience Depth Index, Proximity Layer
- [ ] **Phase 6** — LLM AI brief generation, Gap Indicator wiring, full Observatory deployment

---

<div align="center">
  <p><em>What is measured here is not traffic.<br/>It is whether the work found the people it was written for.</em></p>
</div>
