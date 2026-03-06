<div align="center">
  <h1 align="center">Stilled. — The Observatory</h1>
  <p align="center">
    <strong>A Forensic Analytics Dashboard & CMS Interface</strong>
    <br />
    <em>Private admin application for the Stilled. publishing ecosystem.</em>
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

<br />

The Observatory is a bespoke, solo-operator command center designed explicitly for **Stilled.** It bypasses traditional vanity metrics to measure read depth, long-term resonance, and true psychological reach.

It is built with a deep appreciation for the **Dark Academia Noir** aesthetic: warm alabaster, charcoal, and antique bronze. Function dictates form. High negative space. Quiet confidence.

---

## 🏛️ System Architecture

The ecosystem relies on an aggressively decoupled stack designed for security and absolute editorial ownership.

*   **Frontend Interface:** Astro (Node SSR) acting securely as a proxy.
*   **Database & Content Engine:** Ghost CMS v5 (Alpine/SQLite3 containerized).
*   **Access Paradigm:** Ghost is never exposed to the open web. It lives on an internal Docker network behind a Cloudflare Zero Trust tunnel.
*   **Telemetry:** Plausible Analytics (privacy-first metrics) + YouTube Data API.

---

## 🔭 The Eleven Zones

The Observatory organizes operational intelligence precisely across 11 distinct forensic zones:

| Zone | Designation | Function |
| :--- | :--- | :--- |
| **01** | **AI Situational Brief** | Generated overview summarizing key momentum anomalies. |
| **02** | **Resonance Index** | Multi-variable composite scoring (not raw pageviews). |
| **03** | **Baseline Engine** | Z-score deviation tracking against historical performance. |
| **04** | **Convergence Events** | Alert cards surfacing clustered retention spikes. |
| **05** | **Publication Heatmap** | 52-week Github-style visual record of essay resonance. |
| **06** | **Traffic Sources** | Forensic breakdown of acquisition pathways. |
| **07** | **YouTube Intelligence** | Bridge-rates from specific videos to literature downloads. |
| **08** | **The 3AM Map** | Time-based geographic mapping of reading depth. |
| **09** | **Audience Depth Index** | Aggregate patterning of reader lifecycle behavior. |
| **10** | **Proximity Layer** | Tracing related reading navigation inside a single session. |
| **11** | **Gap Indicator** | Persistent diagnostic of all incoming data stream latencies. |

---

## 🧭 Infrastructure Status

<details open>
<summary><b>Development Roadmap</b></summary>
<br/>

- [x] **Phase 1:** Core container setup, Astro SSR, Ghost Admin API, Writing Room build, and Scratchpad persistence logic.
- [ ] **Phase 2 (In Development):** Plausible + YouTube API telemetry connections, Publication Heatmap, and the 3AM geographical map.
- [ ] **Phase 3:** Deep read tracking, paper downloads, the Resonance Index composite scoring logic.
- [ ] **Phase 4:** Baseline calculations, Convergence alerts, Audience depth calculations.
- [ ] **Phase 5:** LLM AI brief generation and diagnostic gap wiring.

</details>

---

## ⚙️ Local Development Setup

To initialize the development sequence on your local machine:

### 1. Boot Ghost via Docker

```bash
# Launch the Ghost backend and its explicit database container
docker-compose -f docker-compose.local.yml up -d
```
*Ghost will boot at `http://localhost:2368`.* Access `/ghost` and configure an owner account. Retrieve a custom integration Admin API key.

### 2. Configure Environment

Navigate to the `observatory_app` directory:

```bash
cd observatory_app
cp .env.example .env
```

Inject the required keys inside `.env`:
```text
GHOST_URL=http://localhost:2368
GHOST_ADMIN_API_KEY=your:ghostapikey
PLAUSIBLE_API_KEY=yourplausiblekey
PLAUSIBLE_SITE_ID=stilled.xyz
YOUTUBE_API_KEY=yourgoogleyoutubekey
```

### 3. Initialize The Observatory

```bash
npm install
npm run dev
```
*The Observatory dashboard will compile and launch at `http://localhost:4321`.*

----

<div align="center">
  <p><em>Formed in quiet. Measured in depth.</em></p>
</div>
