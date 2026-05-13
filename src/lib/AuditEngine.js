
export const PRICING_DATA = {
  "Cursor": { "Hobby": 0, "Pro": 20, "Business": 40, "Enterprise": 80 },
  "GitHub Copilot": { "Individual": 10, "Business": 19, "Enterprise": 39 },
  "Claude": { "Free": 0, "Pro": 20, "Max": 40, "Team": 30, "Enterprise": 60, "API direct": 0 },
  "ChatGPT": { "Plus": 20, "Team": 30, "Enterprise": 60, "API direct": 0 },
  "Anthropic API direct": { "API direct": 0 },
  "OpenAI API direct": { "API direct": 0 },
  "Gemini": { "Pro": 0, "Ultra": 20, "API": 0 },
  "v0": { "Free": 0, "Premium": 20, "Enterprise": 50 }
};

export function runAudit(stack, teamSize) {
  let totalMonthlySavings = 0;
  let recommendations = [];
  
  const toolNames = stack.map(item => item.tool);

  stack.forEach(item => {
 
    if ((item.plan.includes("Team") || item.plan.includes("Business")) && item.seats < 3) {
      
      const individualPlanCost = PRICING_DATA[item.tool]?.["Plus"] || PRICING_DATA[item.tool]?.["Pro"] || PRICING_DATA[item.tool]?.["Individual"] || 20;
      const currentCost = item.currentSpend;
      const optimizedCost = individualPlanCost * item.seats;
      const savings = currentCost - optimizedCost;
      
      if (savings > 0) {
        totalMonthlySavings += savings;
        recommendations.push({
          id: crypto.randomUUID(),
          tool: item.tool,
          action: "Downgrade to Individual Plan",
          reason: `Team plans require minimum seat commitments. With only ${item.seats} users, individual licenses are significantly cheaper.`,
          savings: savings
        });
      }
    }

    
    if ((item.tool === "ChatGPT" || item.tool === "Claude") && item.plan.includes("Enterprise") && item.useCase === "coding" && teamSize > 50) {
       recommendations.push({
        id: crypto.randomUUID(),
        tool: item.tool,
        action: "Switch to API Direct",
        reason: "For large coding teams, paying retail Enterprise UI prices is inefficient. Routing usage through API Direct via internal tools cuts costs by roughly 40%.",
        savings: item.currentSpend * 0.4 // Arbitrary 40% saving heuristic for the audit
      });
      totalMonthlySavings += (item.currentSpend * 0.4);
    }

    
    if (item.tool === "Claude" && toolNames.includes("ChatGPT")) {
      totalMonthlySavings += item.currentSpend;
      recommendations.push({
        id: crypto.randomUUID(),
        tool: "Claude",
        action: "Consolidate LLM Subscriptions",
        reason: "You are paying for both ChatGPT and Claude. Standardizing your team on a single frontier model avoids redundant capability spend.",
        savings: item.currentSpend
      });
    }

    
    if (item.tool === "GitHub Copilot" && toolNames.includes("Cursor")) {
      totalMonthlySavings += item.currentSpend;
      recommendations.push({
        id: crypto.randomUUID(),
        tool: "GitHub Copilot",
        action: "Cancel Copilot",
        reason: "Cursor IDE has best-in-class AI generation built natively into the editor. Maintaining a separate GitHub Copilot subscription is redundant.",
        savings: item.currentSpend
      });
    }
  });

  return { totalMonthlySavings, annualSavings: totalMonthlySavings * 12, recommendations };
}import { describe, it, expect } from 'vitest';
import { runAudit } from './auditEngine'; // Ensure casing matches your actual filename

describe('Audit Engine Logic', () => {

  it('1. Returns 0 savings and no recommendations for an empty stack', () => {
    const result = runAudit([], 10);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.recommendations.length).toBe(0);
  });

  it('2. Catches wasted Team plan seats (e.g., 2 seats on a Team plan)', () => {
    const stack = [{ id: '1', tool: 'Cursor', plan: 'Team / Business', seats: 2, currentSpend: 80, useCase: 'coding' }];
    const result = runAudit(stack, 2);
    // Should recommend downgrading to 2 Pro seats ($40 total instead of $80)
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    expect(result.recommendations[0].tool).toBe('Cursor');
    expect(result.recommendations[0].action).toContain('Downgrade');
  });

  it('3. Identifies overlap between Cursor and GitHub Copilot', () => {
    const stack = [
      { id: '1', tool: 'Cursor', plan: 'Individual / Pro / Plus', seats: 1, currentSpend: 20, useCase: 'coding' },
      { id: '2', tool: 'GitHub Copilot', plan: 'Individual / Pro / Plus', seats: 1, currentSpend: 10, useCase: 'coding' }
    ];
    const result = runAudit(stack, 1);
    // Should recommend canceling Copilot since Cursor has AI built-in
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(10);
    expect(result.recommendations.some(r => r.tool === 'GitHub Copilot')).toBe(true);
  });

  it('4. Recommends API arbitrage for large teams on Enterprise UIs', () => {
    const stack = [{ id: '1', tool: 'ChatGPT', plan: 'Enterprise', seats: 50, currentSpend: 3000, useCase: 'mixed' }];
    // Passing a global team size of 50
    const result = runAudit(stack, 50);
    // Should recommend moving to API Direct
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    expect(result.recommendations[0].tool).toBe('ChatGPT');
    expect(result.recommendations[0].action).toContain('API');
  });

  it('5. Returns 0 savings for a perfectly optimized stack', () => {
    const stack = [{ id: '1', tool: 'ChatGPT', plan: 'Individual / Pro / Plus', seats: 1, currentSpend: 20, useCase: 'mixed' }];
    const result = runAudit(stack, 1);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.recommendations.length).toBe(0);
  });

});