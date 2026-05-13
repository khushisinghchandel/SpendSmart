# Pricing Data & Sources

The SpendSmart audit engine relies on hardcoded, defensible pricing data to calculate potential savings. This data is verified and current as of **May 2026**.

## Verified Tier Pricing (USD/Month)

| Vendor | Tool | Free / Hobby | Individual / Pro | Team / Business | Enterprise / Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OpenAI** | ChatGPT | $0 | $20 | $30 | ~$60 (Custom) |
| **Anthropic** | Claude | $0 | $20 | $30 | ~$60 (Custom) |
| **Google** | Gemini | $0 | $20 (Advanced) | $30 | Custom |
| **Microsoft** | GitHub Copilot | N/A | $10 | $19 | $39 |
| **Anysphere** | Cursor | $0 | $20 | $40 | Custom |
| **Vercel** | v0 | $0 | $20 (Premium) | Custom | Custom |

*Note: Enterprise tiers often require annual contracts and custom negotiation. For the purpose of the MVP audit engine, standard retail heuristics (~$60/seat for LLMs, $39/seat for Copilot) were used to calculate retail vs. API arbitrage opportunities.*

## Official Source URLs

Every data point in the audit engine traces back to these official vendor pricing pages:

1. **ChatGPT (OpenAI):** - [https://openai.com/chatgpt/pricing/](https://openai.com/chatgpt/pricing/)
   - *Logic tied to minimum seat counts on the Team plan (min 2 seats).*

2. **Claude (Anthropic):** - [https://www.anthropic.com/pricing](https://www.anthropic.com/pricing)
   - *Logic tied to redundant capabilities when paired with ChatGPT.*

3. **Cursor (Anysphere):** - [https://www.cursor.com/pricing](https://www.cursor.com/pricing)
   - *Logic dictates that Cursor natively includes frontier models, making standalone GitHub Copilot subscriptions redundant.*

4. **GitHub Copilot (Microsoft):** - [https://github.com/pricing](https://github.com/pricing)

5. **Gemini (Google):** - [https://gemini.google.com/advanced](https://gemini.google.com/advanced)

6. **v0 (Vercel):**
   - [https://v0.dev/pricing](https://v0.dev/pricing)

7. **API Direct (OpenAI / Anthropic):**
   - OpenAI: [https://openai.com/pricing](https://openai.com/pricing)
   - Anthropic: [https://www.anthropic.com/api#pricing](https://www.anthropic.com/api#pricing)
   - *The engine uses a 40% heuristic savings rate when advising engineering teams (>50 devs) to shift from Enterprise UI retail licenses to direct API routing via internal tooling.*