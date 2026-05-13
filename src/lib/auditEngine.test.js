import { describe, it, expect } from 'vitest';
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