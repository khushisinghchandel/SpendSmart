import Groq from "groq-sdk";

export async function generateAuditSummary(userStack, auditResults) {
  try {
    
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    console.log("My API Key is:", apiKey);
    if (!apiKey) {
      throw new Error("API Key is missing or undefined.");
    }

   
    const groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true 
    });

    const toolsList = userStack.map(t => `${t.tool} (${t.plan} plan, $${t.currentSpend}/mo)`).join(", ");
    const savings = auditResults.totalMonthlySavings;

    const prompt = `You are an expert AI software auditor. Review this user's stack: ${toolsList}.
    We calculated they can save $${savings} per month.
    Write a 100-word personalized, professional executive summary of their audit.
    Tone: Direct, financial, expert. No fluff. Focus on the main inefficiencies and the total savings. Do not use markdown formatting like asterisks.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert tech stack auditor for an enterprise firm." },
        { role: "user", content: prompt }
      ],
      model: "llama3-8b-8192",
      temperature: 0.5,
      max_tokens: 150,
    });

    return chatCompletion.choices[0]?.message?.content || generateFallbackSummary(savings);

  } catch (error) {
    
    console.warn("AI API failed, using fallback summary:", error.message);
    return generateFallbackSummary(auditResults.totalMonthlySavings);
  }
}

function generateFallbackSummary(savings) {
  if (savings > 0) {
    return `Based on our analysis, your current AI tool stack has overlapping capabilities and unoptimized seat allocations. By restructuring your subscriptions according to the action plan below, you can immediately recover $${savings} in monthly wasted spend without compromising your team's technical capabilities.`;
  }
  return `Your AI software stack is currently running at peak efficiency. Seat allocations and plan tiers perfectly match your declared use cases, resulting in zero wasted monthly spend. Keep monitoring your usage as your team scales.`;
}