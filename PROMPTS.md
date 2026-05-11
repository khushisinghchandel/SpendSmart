# AI Prompt Engineering

This application utilizes the Groq API (LLaMA 3 8B) to generate the personalized executive summary. 

**System Prompt:**
`You are an expert tech stack auditor for an enterprise firm.`

**User Prompt Template:**
`You are an expert AI software auditor. Review this user's stack: {toolsList}. We calculated they can save ${savings} per month. Write a 100-word personalized, professional executive summary of their audit. Tone: Direct, financial, expert. No fluff. Focus on the main inefficiencies and the total savings. Do not use markdown formatting like asterisks.`

**Fallback Strategy:**
If the API fails, times out, or rate-limits, the application catches the error and instantly falls back to a hardcoded string based on whether savings were found or not. This ensures the UI never breaks for the end-user.