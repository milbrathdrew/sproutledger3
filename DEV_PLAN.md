# SproutLedger Development Plan

## MVP Phase

### Core Features
1. **User Authentication (Optional for MVP)**
   - Local-only for MVP, no persistent accounts required.
2. **JSON Import** ✅ (Complete)
   - Branch: feature/json-import
   - Users can upload a grand-exchange.json file.
   - Parse and display transactions in a table.
   - Resolve itemId to item name using OSRS Wiki API or local mapping.
   - **Progress:** JSON import, parsing, and table display are implemented and working as of [date].
3. **Cycle Management** (In Progress)
   - Branch: feature/cycle-management-mvp
   - Users can create new farming cycles.
   - Assign transactions to cycles (no splitting buys for now).
   - Display cycles as cards with summary stats (profit, yield, seeds used, etc.).
   - **NEW:** For each buy transaction assigned to a cycle, users can specify how many seeds from that transaction were actually used in the cycle (defaulting to the full quantity, but editable). Calculations for profit, yield, and efficiency (yield/seeds used) are based on the sum of these per-transaction values. (Branch: feature/user-defined-seeds-used)
4. **Transaction Management**
   - List all transactions (sortable, filterable, assignable to cycles).
   - Show unassigned transactions.
5. **Profit/Yield Calculation**
   - Calculate and display profit/loss and average yield per cycle and overall, using the sum of user-defined seeds used per buy transaction in each cycle.
6. **Dashboard**
   - Show summary cards (total profit, active cycles, avg. yield, recent transactions).
   - Show recent transactions and profit trends (basic chart, optional for MVP).

### Process & Workflow
- Focus on MVP features only until `MVP_COMPLETE = YES`.
- All new features or changes must be added to this plan and approved before implementation.
- If a proposed item strays from the plan, it must be highlighted and explicitly approved.
- Use a strict branching system for all features and fixes (see below).

### MVP_COMPLETE: NO

---

## Post-MVP (To be defined after MVP_COMPLETE = YES)
- User authentication and persistence
- Advanced analytics and reporting
- Cycle splitting and advanced assignment
- UI/UX enhancements
- Multi-user support
- ... (to be expanded)

---

## Branching System
- Use feature branches for all new features: `feature/<feature-name>`
- Use bugfix branches for fixes: `bugfix/<description>`
- Use a main branch for stable releases: `main`
- Use a develop branch for ongoing integration: `develop`
- All changes must be merged via pull request and reviewed. 