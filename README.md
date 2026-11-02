# Big Two (鋤大D / ធំពីរ) — 4-Player Online Card Game

[![Build & Test](https://img.shields.io/badge/tests-13%20passed-emerald)](.)
[![Platform](https://img.shields.io/badge/PWA-Desktop%20%26%20Mobile-blue)](.)
[![License](https://img.shields.io/badge/license-MIT-slate)](.)

A professional, real-time multiplayer implementation of the classic Asian climbing card game **Big Two** (also known as *Cho Dai Di*, *Pusoy Dos*, or *ធំពីរ*), built with strict adherence to authentic tournament rules, server-side validation, AI bot opponents, PWA support, and full bilingual support (English & ភាសាខ្មែរ).

---

## Features

- **Authentic Big Two Game Engine:**
  - 52-card standard deck with 13 cards dealt to each of 4 players.
  - Strict rank hierarchy: $3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2$.
  - Traditional suit hierarchy: Diamonds ($\diamondsuit$) < Clubs ($\clubsuit$) < Hearts ($\heartsuit$) < Spades ($\spadesuit$).
  - Starting rule: Player holding the 3 of Diamonds ($\diamondsuit3$) must lead the very first trick with a play including $\diamondsuit3$.
  - Valid hand combinations: Singles, Pairs, Triples, and 5-card hands (Straight < Flush < Full House < Four of a Kind / Bomb < Straight Flush).
  - 3-pass clearing rule: 3 consecutive passes clears the table and awards the trick winner a Free Lead.
  - Traditional penalty scoring: 1 point per card; double penalty for 10–12 cards ($2\times$); triple shutout penalty for 13 cards ($3\times$).

- **Real-Time Multiplayer & AI Practice:**
  - WebSocket synchronization via Socket.io with room codes and room browser.
  - Server-authoritative validation preventing illegal moves or card spoofing.
  - Solo Practice Mode against 3 intelligent AI bots.
  - Hybrid tables: Empty seats automatically filled with AI bots so games start immediately.

- **Progressive Web App (PWA) & Mobile Ready:**
  - Web App Manifest and Service Worker for offline resilience and desktop/mobile home screen installation.
  - Responsive table layout with mobile touch gestures and fanned card hand presentation.

- **Profile Picture Upload & Authentication:**
  - Custom profile picture upload stored securely in `localStorage`.
  - User accounts (Register, Login, Sign in with Google option, Guest quick-play).

- **100% Zero-Emoji Human-Grade Design:**
  - Sleek vector graphics, Lucide icons, and high-fidelity SVG playing cards.
  - Built-in Web Audio API synthesizer for tactile card slaps, chips, and victory fanfares without external audio downloads.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, Socket.io, TypeScript.
- **Database:** Local transaction-safe JSON database with user profiles, match histories, and leaderboards.
- **Testing:** Node.js native test runner (`node:test`, `tsx`) with automated unit and multiplayer integration test suites.

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

Run the full automated test suite (13 tests including game engine rules, combinations, penalties, AI heuristics, and WebSocket multiplayer sync):

```bash
npm --prefix server test
```

---

## License

MIT License. Designed and engineered by the Autonomous Multi-Agent Engineering Organization.
