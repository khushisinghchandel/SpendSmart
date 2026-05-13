# Automated Test Suite

To ensure the financial math in the SpendSmart logic engine is defensible and accurate, a suite of automated unit tests was built using **Vitest**.

## How to Run the Tests
To run the test suite locally, run the following command in the terminal:
`npm run test`
*(This executes `vitest run` as defined in `package.json`)*.

## Test Coverage

**Filename:** `src/lib/auditEngine.test.js`

The test suite covers the following 5 core engine behaviors:

1. **Empty Stack Handling:** Verifies that passing an empty array correctly returns `$0` in savings and an empty recommendations array, preventing null reference errors.
2. **Seat-to-Tier Optimization:** Tests the logic that catches users paying for "Team / Business" minimum seat limits when they only have 1 or 2 users, correctly calculating the downgrade savings to individual Pro plans.
3. **Tool Overlap Detection:** Tests the redundancy logic. If a user inputs both `Cursor` and `GitHub Copilot`, the engine must flag Copilot as redundant and recommend cancellation.
4. **Enterprise API Arbitrage:** Verifies the heuristic that flags large engineering teams (>50 seats) paying for retail Enterprise UI licenses, calculating the estimated 40% savings of routing that volume through direct API keys via internal tooling.
5. **Optimized Stack Baseline:** Passes a perfectly right-sized stack (e.g., 1 user on a Pro plan) to ensure the engine does not manufacture false savings and correctly returns `$0`.