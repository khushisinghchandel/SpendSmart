import Groq from 'groq-sdk';

// THE MISSING FUNCTION! 
// This runs instantly if the API is missing, slow, or fails.
function generateFallbackSummary(savings) {
  if (savings > 0) {
    return `We have analyzed your AI stack. By eliminating redundant tools and right-sizing your seat licenses, your team can save $${savings.toLocaleString()} per month without sacrificing any capabilities. We recommend following the action plan below to consolidate your subscriptions immediately.`;
  }
  return `Your AI stack is perfectly optimized. We found no redundant tools or wasted seats in your current setup. You are running a highly efficient organization. Keep up the excellent work managing your software spend.`;
}

export async function generateAuditSummary(userStack, auditResults) {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    // If no key is found, instantly use the fallback
    if (!apiKey) {
      console.warn("No Groq API key found. Using fallback summary.");
      return generateFallbackSummary(auditResults.totalMonthlySavings);
    }

    const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
    const toolsList = userStack.map(t => `${t.tool} (${t.plan} plan, $${t.currentSpend}/mo)`).join(", ");
    const savings = auditResults.totalMonthlySavings;

    const prompt = `You are an expert AI software auditor. Review this user's stack: ${toolsList}. We calculated they can save $${savings} per month. Write a 100-word personalized, professional executive summary of their audit. Tone: Direct, financial, expert. No fluff. Focus on the main inefficiencies and the total savings. Do not use markdown formatting like asterisks.`;

    // 5-second ticking time bomb
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI API took too long (Timeout).")), 5000)
    );

    // Race the API against the time bomb
    const chatCompletion = await Promise.race([
      groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are an expert tech stack auditor for an enterprise firm." },
          { role: "user", content: prompt }
        ],
        model: "llama3-8b-8192",
        temperature: 0.5,
        max_tokens: 150,
      }),
      timeoutPromise
    ]);

    return chatCompletion.choices[0]?.message?.content || generateFallbackSummary(savings);

  } catch (error) {
    console.warn("AI API failed or timed out, using fallback:", error.message);
    return generateFallbackSummary(auditResults.totalMonthlySavings);
  }
}