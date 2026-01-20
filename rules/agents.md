# Agent Orchestration

## Available Agents

Located in `~/.claude/agents/`:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, module design |
| architect | System design | Architectural decisions, module dependencies |
| tdd-guide | Test-driven development | New features, bug fixes (two-phase testing) |
| code-reviewer | Code review | After writing code, security/ORM checks |
| security-reviewer | Security analysis | ACLs, record rules, sudo audit |
| e2e-runner | E2E testing | Critical user flows with Odoo selectors |
| refactor-cleaner | Dead code cleanup | Code maintenance, unused fields/models |
| doc-updater | Documentation | Updating docs from __manifest__.py |

## Immediate Agent Usage

No user prompt needed:
1. Complex feature requests - Use **planner** agent
2. Code just written/modified - Use **code-reviewer** agent
3. Bug fix or new feature - Use **tdd-guide** agent
4. Architectural decision - Use **architect** agent
5. New model created - Use **security-reviewer** agent (ACL check)

## Odoo-Specific Agent Tasks

### tdd-guide Agent
- Two-Phase Testing (Phase 1: DB, Phase 2: ORM)
- TransactionCase test structure
- Test data factories

### code-reviewer Agent
- ACL validation for new models
- Record rule verification
- ORM anti-pattern detection (N+1 queries)
- Missing `_description` check
- Sudo usage documentation

### security-reviewer Agent
- ir.model.access.csv validation
- Record rule domain analysis
- Sudo call audit
- SQL injection detection

### refactor-cleaner Agent
- Unused field detection
- Dead model identification
- vulture/pylint integration

## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of models/sale_order.py
2. Agent 2: ORM pattern review of models/partner.py
3. Agent 3: Test coverage check for tests/

# BAD: Sequential when unnecessary
First agent 1, then agent 2, then agent 3
```

## Multi-Perspective Analysis

For complex Odoo problems, use split role sub-agents:
- Security expert (ACLs, record rules, sudo)
- ORM specialist (query patterns, performance)
- Odoo architect (module design, inheritance)
- Test specialist (two-phase testing, coverage)
- Documentation reviewer (docstrings, __manifest__.py)

## Agent Selection by Task

| Task | Primary Agent | Secondary Agent |
|------|---------------|-----------------|
| New model | security-reviewer | code-reviewer |
| New feature | tdd-guide | planner |
| Bug fix | tdd-guide | code-reviewer |
| Refactoring | refactor-cleaner | code-reviewer |
| Documentation | doc-updater | - |
| Architecture | architect | planner |
| E2E testing | e2e-runner | tdd-guide |
