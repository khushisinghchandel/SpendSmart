# Architecture & Technical Decisions

SpendSmart is designed as a lightweight, high-conversion single-page application (SPA). The architecture prioritizes "Value-First" user flows, immediate UI responsiveness, and resilient third-party API integrations.

## Tech Stack Overview

* **Frontend:** React (Vite) + Tailwind CSS 
* **Routing:** React Router DOM
* **Database / Backend:** Supabase (PostgreSQL)
* **AI Provider:** Groq (Llama 3 8B)
* **Data Visualization:** Chart.js + React-ChartJS-2
* **Transactional Email:** Resend 
* **PDF Generation:** `html-to-image` + `jspdf`

---

## Core Architectural Decisions

### 1. "Value-First" State Management & Routing
**The Problem:** Traditional lead-capture tools force database roundtrips and email verification *before* showing the user their results, resulting in massive drop-off rates.
**The Solution:** SpendSmart completely decouples the audit calculation from the database.
* When a user runs an audit, the state is passed instantly to the `/dashboard` route via local memory (`react-router` state) with zero network latency. 
* The database (`Supabase`) is only pinged at the very end of the funnel when the user explicitly requests a shareable link. 
* We use `window.history.replaceState` to seamlessly upgrade their local URL to a persistent UUID URL without a page reload, creating a frictionless viral loop.

### 2. Resilient AI Integration (Graceful Degradation)
**The Problem:** Third-party LLM APIs (like Anthropic/OpenAI/Groq) are prone to latency spikes and silent timeouts, which can cause loading spinners to hang infinitely.
**The Solution:** The AI summary is wrapped in a strict **`Promise.race` timeout architecture**. 
* The application gives the API exactly 5 seconds to generate the executive summary. 
* If the API fails, hangs, or exceeds the timeout, the `catch` block intercepts the error and instantly injects a deterministic, hardcoded fallback summary based on the financial calculations. 
* A `finally` block ensures the UI state (`isGeneratingAI`) always resolves to false, guaranteeing the user is never stuck waiting.

### 3. Separation of Concerns: The Audit Engine
The business logic (`src/lib/auditEngine.js`) is strictly isolated from the React UI components. 
* **Defensible Heuristics:** The engine relies on hardcoded pricing arrays and multi-variable conditional logic (checking team size, seat usage, and tool overlap arrays simultaneously) rather than relying on an LLM to do math.
* **Testability:** By separating the math from the UI, the engine can be independently tested against edge cases (e.g., enterprise arbitrage or redundant capability spend) without requiring DOM rendering.

### 4. Security & Abuse Prevention
Because this is a public-facing, ungated tool, basic protections were implemented:
* **Honeypot Strategy:** A hidden `<input type="text" name="website" tabIndex="-1">` is embedded in the lead capture form. Automated bots that scrape the DOM and fill out all fields will trigger the honeypot, and the submission is silently rejected before hitting the Supabase database.
* **Client-Side API Security:** To prevent API key scraping and CORS violations on the frontend, standard integrations (like transactional emails) are mocked via `emailService.js` with simulated network latency. In a production environment, this payload payload would be shifted to a Supabase Edge Function to securely interface with Resend/Postmark.

---

## Data Flow Pipeline

1. **Input:** User builds stack `[{ tool, plan, seats, spend, useCase }]`. `localStorage` persists this to prevent data loss on accidental refresh.
2. **Compute:** `runAudit()` processes the array against `PRICING_DATA`, returning `totalSavings` and an array of specific `recommendations`.
3. **Render:** Dashboard renders locally. Doughnut charts and CSS animations trigger.
4. **AI Generation:** Asynchronous call fires to Groq for the executive summary while the user reads the charts.
5. **Capture & Persist:** User submits email -> Supabase `INSERT` -> Returns `UUID` -> URL rewrites -> PDF generation becomes available.