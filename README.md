# បៀរ ទៀងឡែន (Tien Len / Thirteen) — 4-Player Real-Time Card Game

[![Build & Test](https://img.shields.io/badge/tests-14%20passed-emerald)](.)
[![Platform](https://img.shields.io/badge/PWA-Desktop%20%26%20Mobile-blue)](.)
[![Rules](https://img.shields.io/badge/rules-Authentic%20Tien%20Len-amber)](.)
[![License](https://img.shields.io/badge/license-MIT-slate)](.)

A professional, real-time multiplayer implementation of the authentic Cambodian and Southern Asian climbing card game **បៀរ ទៀងឡែន (Tien Len / Thirteen Cards)**, built with strict adherence to traditional tournament rules, server-side validation, AI bot opponents, 1-click friend invite links, PWA support, and full bilingual localization (ភាសាខ្មែរ & English).

---

## Features

- **Authentic Tien Len (ទៀងឡែន) Game Engine:**
  - 52-card standard deck with 13 cards dealt to each of 4 players.
  - Strict rank hierarchy: $3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2$ (Card 2 is the highest card / អាពីរ; $\heartsuit2$ is the supreme card).
  - Traditional suit hierarchy: Spades ($\spadesuit$) < Clubs ($\clubsuit$) < Diamonds ($\diamondsuit$) < Hearts ($\heartsuit$).
  - Starting rule: Player holding the 3 of Spades ($\spadesuit3$ / ៣ ប៊ិច) must lead the opening trick of Round 1; winner of each round leads subsequent rounds.
  - Valid hand combinations: Singles, Pairs, Triples, Straights of arbitrary length (3 to 12 cards, no 2s allowed), Four of a Kind (ការ៉េ), 3 Consecutive Pairs (៣ គូជាប់គ្នា), and 4 Consecutive Pairs (៤ គូជាប់គ្នា).
  - Special Bomb Cuts on 2s (កាប់អាពីរ):
    - **3 Consecutive Pairs** can cut a single 2.
    - **Four of a Kind (ការ៉េ)** can cut a single 2 or a pair of 2s, and can cut 3 consecutive pairs.
    - **4 Consecutive Pairs** can cut a single 2, a pair of 2s, Four of a Kind, or 3 consecutive pairs.
  - Sitting-Out Pass Rule: When a player passes during a trick, they must sit out and wait until the trick completes and the table is cleared with a Free Lead.
  - Trapped 2 Penalties (ស្អុយអាពីរ): Remaining 2s at round end incur heavy penalties (+2 for black 2, +4 for red 2).

- **1-Click Friend Invitations & Real-Time Multiplayer:**
  - 1-click "Invite Friends (អញ្ជើញមិត្តភក្តិ)" button supporting native Web Share API and clipboard copy (`?join=ROOMCODE`).
  - Auto-join and auto-fill room code from URL parameters.
  - Real-time WebSocket synchronization via Socket.io with room codes and room browser.
  - Server-authoritative validation preventing illegal plays, out-of-turn actions, or card spoofing.
  - Solo Practice Mode against 3 intelligent AI bots.
  - Hybrid tables: Empty seats automatically filled with AI bots so games start immediately.

- **Progressive Web App (PWA) & Mobile-First Responsive Design:**
  - Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) for offline caching and home screen installation on iOS, Android, and desktop.
  - Touch-optimized, fanned card layout for mobile devices.
  - Smart hand combination cyclers (Pairs, Triples, Straights, Bombs) for rapid play on small screens.

- **Profile Picture Upload & Authentication:**
  - Custom profile picture upload stored securely in browser `localStorage`.
  - User accounts (Register, Login, Sign in with Google option, Guest quick-play).
  - Persistent player statistics, match history, and leaderboards.

- **100% Zero-Emoji Human-Grade Design:**
  - Clean vector graphics, Lucide icons, and high-fidelity SVG playing cards.
  - Built-in Web Audio API synthesizer for tactile card slaps, chips, and victory fanfares without external audio downloads.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, Socket.io, TypeScript.
- **Database:** Dual-mode architecture: Neon Serverless PostgreSQL with auto-provisioning schema for cloud hosting, and local transaction-safe JSON storage on Drive D for offline development.
- **Testing:** Node.js native test runner (`node:test`, `tsx`) with 14 automated unit, game-logic, and multiplayer integration test suites.
- **Deployment & Hosting:** Vercel (Frontend & PWA), Render (Backend & WebSockets), Neon (Serverless Postgres).

---

## Production Cloud Hosting Guide (Vercel + Render + Neon)

### 1. Database: Neon (Serverless Postgres)
1. Create a free PostgreSQL database at [neon.tech](https://neon.tech).
2. Copy your connection string from the Neon Console:
   ```text
   postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
   ```
3. Set this value as `DATABASE_URL` in your Render backend service.
   *(Note: The server automatically runs idempotent DDL migrations on boot to create `users`, `rooms`, and `matches` tables).*

### 2. Backend: Render (Node.js & WebSockets)
1. Connect your GitHub repository `BigTwo_KhmerGame` to [render.com](https://render.com).
2. Create a new **Web Service** (or use the included Blueprint `render.yaml`):
   - **Environment:** Node
   - **Build Command:** `npm --prefix server install && npm --prefix server run build`
   - **Start Command:** `node server/dist/server/src/server.js`
   - **Health Check Path:** `/api/health`
3. Configure Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render default)
   - `DATABASE_URL`: `postgresql://...` (your Neon connection string)
   - `CLIENT_ORIGIN`: `https://your-vercel-domain.vercel.app` (your Vercel frontend URL)

### 3. Frontend: Vercel (Vite SPA & PWA)
1. Import your GitHub repository `BigTwo_KhmerGame` into [vercel.com](https://vercel.com).
2. Select **Vite** framework preset with `vercel.json` included in repository root.
   - **Build Command:** `npm --prefix client run build`
   - **Output Directory:** `client/dist`
3. Configure Environment Variable in Vercel:
   - `VITE_SERVER_URL`: `https://your-render-backend.onrender.com` (the public URL from Render)
4. Deploy! Vercel handles global edge CDN caching and PWA service worker delivery.

---

## Quick Start & Installation

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm or pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/Rotananob/BigTwo_KhmerGame.git
cd BigTwo_KhmerGame

# Install dependencies
npm --prefix server install
npm --prefix client install

# Build client and server
npm run build:client
npm run build:server

# Start the production server
npm start
```

Open your browser and navigate to:
```
http://localhost:3001
```

---

## Automated Testing

Run the full automated test suite (14 tests including authentic Tien Len rules, suit ranking, arbitrary straights, bomb cuts on 2s, trapped 2s penalties, AI heuristics, and WebSocket multiplayer sync):

```bash
npm --prefix server test
```

---

## License

MIT License. Designed and engineered by the Autonomous Multi-Agent Engineering Organization.
