# ◉ One Watch

> **Eliminate choice paralysis. One perfect pick — or the full catalogue. Your call.**

One Watch is a streaming intelligence layer that unifies Netflix, Prime Video, Disney+, Max, Hulu, and Apple TV+ into a single, unbiased recommendation surface. Built at a hackathon in a matter of hours, it goes from a blank screen to a confident watch decision in under 60 seconds.

---

## Inspiration

Every evening, millions of people sit down to unwind — only to hit a wall of digital friction.

With great content scattered across half a dozen apps, finding something to watch has become a chore. We observed the **Fragmented Consumer**: everyday viewers who spend their prime relaxation window opening and closing apps, dodging biased promotional algorithms, and cross-referencing TikTok, Instagram, and Rotten Tomatoes just to see what's *actually* trending.

We realized that finding a trending show shouldn't take longer than watching an episode. Our inspiration was simple: eliminate **choice paralysis** by creating a unified, centralized intelligence layer that treats all streaming platforms as a single ecosystem.

---

## What It Does

One Watch is built around two modes, toggled from the top bar:

### 🎯 Focus Mode
Answer three questions — *who's watching, what's your mood, how much time do you have* — and the agent returns a curated shortlist of four picks matched to your intent. No scrolling. No filters. One decision.

### 🌐 Explore Mode
Browse the full aggregated catalogue. Filter by genre, mood, and runtime. Use the **Pick for me** engine to get ranked recommendations from the full pool. Expand any title for a full breakdown.

### Core capabilities

- **The Aggregator Engine** — bypasses individual app homepages to pull and centralize trending data across gated digital boundaries, creating a single unbiased source of truth.
- **Social & Critical Validation** — factors in real-time external signals from IMDb, Rotten Tomatoes, and cultural velocity metrics from TikTok and Instagram to ensure trends are organic, not platform-promoted.
- **Intent Parsing** — removes complex dropdowns. A short questionnaire captures mood, time, and audience; the agent parses that intent and matches it instantly with current global trends.

---

## How It's Built

### Frontend

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite 6 |
| Icons | Phosphor Icons (duotone/bold) |
| Styling | Vanilla CSS with design tokens |
| Font | Poppins |

The UI is intentionally minimalist — no infinite scroll grids, no overwhelming filter panels. A prompt-and-questionnaire interface does the cognitive heavy lifting so the user doesn't have to.

```
src/
├── components/
│   ├── focus/          # Focus mode questionnaire + result cards + expanded sheet
│   ├── explore/        # Hero, title cards, modal, provider badges
│   └── onboarding/     # Platform selection screen
├── data/
│   ├── focusData.ts    # Questionnaire options + 4 curated demo picks
│   └── titles.ts       # 30-title aggregated catalogue
└── lib/
    ├── rank.ts         # Scoring + filter engine
    └── providers.ts    # Provider access logic
```

### The Velocity Score

To determine what is truly viral across the web, we built a custom scoring algorithm that normalizes trending metrics from multiple sources into a single comparable metric.

A show's unified **Velocity Score** $V$ is modelled as:

$$V = w_1 \cdot R_{\text{platform}} + w_2 \cdot S_{\text{social}} + w_3 \cdot C_{\text{critical}}$$

Where:

| Variable | Meaning |
|---|---|
| $R_{\text{platform}}$ | Normalized rank across streaming apps |
| $S_{\text{social}}$ | Engagement velocity on TikTok and Instagram |
| $C_{\text{critical}}$ | External critic scores (IMDb, Rotten Tomatoes) |
| $w_1, w_2, w_3$ | Weights calibrated to prioritize human buzz over corporate promotional ads |

---

## Challenges

**Aligning on the core vision** — With so many directions we could take, our first major hurdle was narrowing a massive problem space into a sharp, definable problem statement. We had to ruthlessly cut secondary features to align on solving just one thing: *Time-to-Decision*.

**Platform fragmentation & data normalization** — Every streaming platform actively locks its data behind walled gardens and uses internal algorithms meant to promote their own content. Scraping, aggregating, and neutralizing this fragmented data so Netflix metrics could fairly compete with Max metrics was an architectural puzzle.

**The clock** — With the hackathon timer ticking down, we had to balance technical depth with a functional deadline — knowing when to perfect a piece of code and when to ship a working prototype.

---

## Accomplishments

We're proud to have built a fully functional end-to-end prototype that completely bypasses the traditional "infinite scroll" of modern streaming UIs. We successfully unified data that massive entertainment corporations intentionally keep separated. Most importantly — a brand-new team went from an abstract, messy problem to a working, algorithmic solution in a matter of hours.

---

## What We Learned

**Next-gen AI workflows** — We leveraged AI-assisted coding to write boilerplate rapidly, debug algorithmic loops in real-time, and significantly accelerate development velocity.

**Rapid researching** — We didn't have days to read API documentation. We learned how to rapidly scan, test, and extract data models from various platforms under strict time constraints.

**High-speed collaboration** — Working with a brand-new team requires immediate trust, clear communication, and checking your ego at the door. We mastered breaking a project into modules so we could build concurrently without stepping on each other's toes.

**Aggressive curation over features** — Consumers don't want *more* choices — they want confidence in a *single* choice. Designing for the "Peak Friction" moment — that 15-minute window of evening fatigue — requires software that does the cognitive heavy lifting for you.

---

## What's Next

**Deep-dive backend architecture** — Fully build out the backend infrastructure, shifting from lightweight scripts to robust, automated data pipelines capable of handling thousands of concurrent requests.

**Fluid platform integrations** — Build deeper, native integrations with streaming APIs so users don't just get a recommendation — they can click a title and have it instantly launch and play on their active TV or device.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Take screenshots (requires running dev server on :5174)
node scripts/screenshot.mjs
node scripts/composite.mjs
```

### Prerequisites

- Node.js 18+
- Playwright (included in devDependencies — run `npx playwright install chromium` for screenshot scripts)

---

## Design System

| Token | Value |
|---|---|
| Background | `#080810` |
| Card surface | `#11111c` |
| Accent (amber) | `#e8c47a` |
| Font | Poppins 400/500/600/700 |
| Icon library | Phosphor Icons (duotone · bold · fill) |

Cinematic poster art is generated as multi-stop CSS gradients with a radial glow layer and SVG film-grain overlay — no external images required.

---

<p align="center">Built with 🎬 at a hackathon &nbsp;·&nbsp; <strong>One Watch</strong></p>
