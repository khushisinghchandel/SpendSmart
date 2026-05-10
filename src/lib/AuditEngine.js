import { PRICING_MATRIX } from './pricingData';

export function runAudit(userStack) {
  let totalMonthlySavings = 0;
  let recommendations = [];

  userStack.forEach(item => {
    const toolName = item.tool.toLowerCase();
    const planName = item.plan.toLowerCase();

    // RULE 1: Minimum Seat Violations (Overkill)
    // Example: Paying for ChatGPT Team but only having 1 user
    if (toolName === 'chatgpt' && planName === 'team' && item.seats === 1) {
      const optimizedSpend = PRICING_MATRIX.chatgpt.plus.price;
      const savings = item.currentSpend - optimizedSpend;
      
      if (savings > 0) {
        totalMonthlySavings += savings;
        recommendations.push({
          id: crypto.randomUUID(),
          tool: 'ChatGPT',
          action: 'Downgrade to Plus',
          savings: savings,
          reason: 'Team plans require a 2-seat minimum. Solo users get identical model access on the Plus plan.'
        });
      }
    }

    // RULE 2: Cheaper Tool for the Same Use Case
    // Example: Spending >$50 on Claude just for coding when Cursor exists
    if (item.useCase === 'coding' && item.currentSpend >= 50 && toolName !== 'cursor') {
      const optimizedSpend = PRICING_MATRIX.cursor.pro.price;
      const savings = item.currentSpend - optimizedSpend;

      if (savings > 0) {
        totalMonthlySavings += savings;
        recommendations.push({
          id: crypto.randomUUID(),
          tool: item.tool,
          action: 'Switch to Cursor Pro',
          savings: savings,
          reason: `For heavy coding, a dedicated AI IDE ($20/mo) is vastly more efficient and cheaper than raw API/chat usage.`
        });
      }
    }
  });

  return { 
    totalMonthlySavings, 
    annualSavings: totalMonthlySavings * 12,
    recommendations 
  };
}