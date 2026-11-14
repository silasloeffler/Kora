# Kora — Holistic AI Fitness, Mental Health & Wellness Core

**Kora** (*Core / Kern*) is an offline-first Progressive Web App (PWA) and Capacitor Android application designed around a **Liquid Glass** interface (Dark & Light Mode) with floating pill navigation and zero-click workout recovery.

It unifies **strength training**, **mental health journaling**, **Health Connect recovery telemetry**, and an **always-on proactive Gemini AI coach (`gemini-3.8-flash`)** into one resilient personal wellness core.

---

## Core Engineering Highlights

1. **0-Click Instant Workout Recovery (OS Process-Kill Resistant)**
   - Built to solve aggressive Android background process killing when switching between the gym logger and media apps (e.g., YouTube or Spotify).
   - Every weight/rep adjustment, set completion, and focused exercise card writes atomically to **IndexedDB (Dexie)** and mirrors a synchronous recovery pointer (`kora_active_workout_v1`) so cold-starting Kora while a session is active jumps straight back to the exact exercise and set with **zero menu clicks**.
   - **Wall-Clock Rest Timer**: Stores exact target completion timestamps (`restTimerTargetEndTime`) rather than relying solely on in-memory `setInterval` ticks, keeping rest countdowns accurate across app switches and device sleep.

2. **Liquid Glass Design System (Dark & Light Mode)**
   - Multi-layered Gaussian blur (`backdrop-filter`), `1px` specular glass highlights, atmospheric radial mesh backgrounds, floating top/bottom pill bars, and a floating live workout/rest-timer mini-pill.
   - **Minimalist Black & White Exercise Visualizations**: Custom architectural SVG line-art illustrations for 18 biomechanical movement patterns with subtle target-muscle accents that adapt to Dark and Light themes.

3. **Proactive Always-On AI Coach (`@google/genai` + Cron Scheduler)**
   - Powered by the official `@google/genai` Interactions API (`gemini-3.8-flash`) with stateful conversation threading (`previous_interaction_id`).
   - Built-in **Proactive Cron Check-in Scheduler** (`08:00 Morning Readiness`, `17:00 Pre-Workout Primer`, `21:30 Evening Mental Unwind`, plus user-defined schedules) and a local smart-coach fallback when offline in the gym.
   - Supports **1-Click AI Plan Generation** directly into the active training view.

4. **Mental Health & Nervous System Journal + Health Connect Bridge**
   - Tracks Mood, Energy, Stress, and Sleep Quality alongside contextual recovery tags and AI Coach reflections.
   - Modular `HealthConnectService` integrating sleep, HRV, resting heart rate, steps, and active calories into a daily Readiness Score.

5. **Strict Privacy Separation (`personal-seed.local.json` vs. `demoSeed.ts`)**
   - Personal workout logs, body/health screenshots, and API keys are strictly excluded via `.gitignore` and guarded by `npm run privacy-check`.
   - Public clones boot cleanly with `src/data/demoSeed.ts`, while local private setups can load an optional git-ignored `public/personal-seed.local.json`.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite 8
- **Persistence:** Dexie (IndexedDB) + Synchronous Recovery Mirror + PWA Service Worker
- **AI SDK:** `@google/genai` (`gemini-3.8-flash`)
- **Mobile Bridge:** Capacitor 8 (`com.silasloeffler.kora`) with Android & Local Notifications support
- **Testing:** Vitest

---

## Getting Started

```bash
# Install dependencies
npm install

# Run privacy guard & unit tests
npm run privacy-check
npm test

# Start development server
npm run dev

# Build production bundle
npm run build
```

### Optional Environment Variable
Copy `.env.example` to `.env.local` and add `VITE_GEMINI_API_KEY` — or enter your key locally in Kora's in-app Settings modal (never committed to Git).

### Installing on Android Homescreen (PWA) or Building Native APK
- **PWA:** Open the served app in Chrome on Android and tap **Add to Home screen / Install App** (`manifest.json` + `sw.js` enabled).
- **Android Native (Capacitor):**
  ```bash
  npx cap add android
  npm run cap:sync
  npx cap open android
  ```
