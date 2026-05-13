# SpendSmart 💸 | AI Stack Auditor by Credex

**Live Deployment:** [https://spend-smart-j7hp.vercel.app/]

### Overview
SpendSmart is a lightning-fast, high-conversion auditing tool designed for CTOs and engineering leaders to instantly identify wasted spend in their AI software stack. By calculating feature overlap, redundant "Team" seats, and API arbitrage opportunities, the tool provides a personalized financial action plan and acts as a high-intent lead generation engine for Credex.

---

## 📸 Application Previews

*(Replace the links below with your actual screenshot paths or a Loom video link)*
* [Image: The Spend Input Form - Clean, Dark Mode UI](./path-to-screenshot-1.png)
* [Image: The Results Dashboard - Dynamic Chart.js visualizations](./path-to-screenshot-2.png)
* [Image: AI Executive Summary & Action Plan](./path-to-screenshot-3.png)

---

## 🚀 Quick Start Guide

### 1. Install & Run Locally
Ensure you have Node.js (v18+) installed. Clone the repository and run the following commands:

```bash
# Install dependencies
npm install

# Create environment file (Windows: type NUL > .env)
touch .env
```

Add your API keys to the `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_llama3_api_key
```

```bash
# Start the Vite development server
npm run dev
```

### 2. Deploy to Production
This project is optimized for zero-config deployment on Vercel:
1. Push the repository to GitHub.
2. Import the project in your Vercel dashboard.
3. Add the three Environment Variables in the Vercel project settings.
4. Click **Deploy**.

---

## 🤔 Architectural Decisions & Trade-offs

To deliver a high-performance MVP within the sprint timeline, the following 5 critical trade-offs were made:

1. **Client-Side Math vs. Server-Side Processing:** * **Decision:** The core financial audit logic runs entirely in the browser rather than on a backend server. 
   * **Why:** This prioritizes a "Value-First" user experience, allowing instant UI rendering and zero network latency, trading off the fact that the pricing arrays are exposed in the client bundle.
2. **Graceful AI Degradation vs. Blocking API Calls:** * **Decision:** The Groq LLM API call is wrapped in a strict 5-second `Promise.race` timeout. 
   * **Why:** Third-party APIs frequently hang. I traded a guaranteed AI summary for guaranteed UI responsiveness; if the API times out, the app instantly falls back to a deterministic, hardcoded summary.
3. **Local Router State vs. Database Hydration:** * **Decision:** Audit results are passed to the dashboard via React Router local memory instead of doing a database roundtrip. 
   * **Why:** This eliminates loading spinners and allows us to defer the database write until the very end of the funnel when the user explicitly provides their email.
4. **Hardcoded Logic vs. LLM Math:** * **Decision:** Used JavaScript conditional statements (heuristics) for calculating tool overlap and savings, rather than asking the LLM to do the math. 
   * **Why:** LLMs hallucinate numbers. Trading the flexibility of an AI for the absolute deterministic accuracy of hardcoded financial logic ensures the tool remains defensible to CFOs.
5. **Mocked Email Service vs. Full Backend Pipeline:** * **Decision:** Transactional emails (Resend) are mocked via a frontend `setTimeout` service (`emailService.js`) rather than hitting a live SMTP server. 
   * **Why:** Calling private API keys from the frontend creates a security vulnerability (CORS/Key scraping). Without time to build a dedicated backend microservice, mocking the network latency provided the best UX representation while maintaining security.

---

## 📂 Project Documentation
For a deep dive into the business logic, market strategy, and engineering architecture, please review the supplementary documentation:
* `ARCHITECTURE.md` - System diagrams and scaling plans.
* `GTM.md` - Go-To-Market and distribution strategy.
* `ECONOMICS.md` - Unit economics and CAC/LTV math.
* `TESTS.md` - Automated test suite documentation.
* `REFLECTION.md` - Sprint reflection and week 2 roadmap.
