# Project Reflection

Building SpendSmart was a deep dive into balancing complex business logic with a frictionless user experience. 

## What Went Well
1. **The "Value-First" Architecture:** I am incredibly proud of moving the lead capture to the *end* of the flow. By calculating the audit instantly in local state and showing the results before asking for an email, the tool builds immense trust.
2. **Defensible Logic:** Writing the `auditEngine.js` forced me to think like a CFO. Instead of just flagging expensive tools, the engine specifically looks for feature overlap (e.g., if a team has Cursor, they don't need GitHub Copilot).
3. **Resilient AI:** Implementing the 5-second `Promise.race` timeout for the Groq API ensures the user interface never freezes, even if the LLM provider goes down.

## Technical Tradeoffs
* **Client-Side Math:** I chose to do the audit calculations on the frontend rather than via a backend API. This makes the tool feel lightning-fast, but it means our pricing data is exposed in the client bundle. For an MVP, speed won out. 
* **Mocked Transactional Emails:** To keep the frontend secure without building a full separate backend server, the Resend integration is currently mocked via `emailService.js`. 

## Future Roadmap (If I had 2 more weeks)
1. **SSO/OAuth:** Allow users to "Sign in with Google/GitHub" to pull their actual software receipts automatically, bypassing the manual form entirely.
2. **Admin Dashboard:** Build a private `/admin` route for the Credex sales team to view all captured leads and sort them by highest potential savings.
3. **Real-Time Vendor Webhooks:** Connect the pricing data arrays to actual vendor APIs so the math engine updates automatically when a tool changes its pricing.