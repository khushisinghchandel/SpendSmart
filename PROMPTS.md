# AI Prompt Engineering

The AI Executive Summary generation is handled by the Groq API (utilizing the `llama3-8b-8192` model) via `src/lib/aiSummary.js`. 

To ensure the LLM output remains professional, deterministic, and free of hallucinations or conversational fluff, a strict system and user prompt architecture is utilized.

## System Prompt
The system prompt establishes the persona and boundaries for the model:

```text
You are an expert tech stack auditor for an enterprise firm.