---
name: social-graph-ranker
description: Weighted social graph traversal that ranks your network connections by proximity to target leads. Uses exponential decay across hops, parallel execution with lead-intelligence skill, and API-driven outreach prioritization. Replaces Apollo, Clay, and manual networking.
metadata:
  tags: networking, outreach, leads, graph-theory, x-api, linkedin, exa
---

## When to Use

Use this skill when you need to:
- Find warm intro paths to specific people or companies
- Rank your existing connections by networking value
- Identify which mutuals to ask for introductions
- Prioritize outbound outreach by warmth and proximity
- Map your social graph against a target lead list

## How It Works

### Architecture

Two parallel pipelines feed a unified ranking engine:

```
┌─────────────────────────────────────────────────────────┐
│                    SOCIAL GRAPH RANKER                   │
├──────────────────────┬──────────────────────────────────┤
│   INBOUND PIPELINE   │        OUTBOUND PIPELINE         │
│                      │                                   │
│  Your Connections    │     Target Lead List (ICP)        │
│  ┌──────────────┐    │     ┌──────────────────┐         │
│  │ X Mutuals    │    │     │ lead-intelligence │         │
│  │ X Followers  │    │     │ skill (parallel)  │         │
│  │ LI Connections│   │     │ Exa + X API +     │         │
│  └──────┬───────┘    │     │ enrichment agents │         │
│         │            │     └────────┬─────────┘         │
│         ▼            │              ▼                    │
│  ┌──────────────┐    │     ┌──────────────────┐         │
│  │ Connection   │    │     │ Ranked Lead List  │         │
│  │ Graph Build  │    │     │ (scored by ICP    │         │
│  │ (adjacency)  │    │     │  fit + response   │         │
│  └──────┬───────┘    │     │  probability)     │         │
│         │            │     └────────┬─────────┘         │
│         └────────────┼──────────────┘                    │
│                      ▼                                   │
│         ┌──────────────────────┐                        │
│         │  GRAPH INTERSECTION  │                        │
│         │  Match connections   │                        │
│         │  against targets     │                        │
│         └──────────┬───────────┘                        │
│                    ▼                                     │
│         ┌──────────────────────┐                        │
│         │  WEIGHTED RANKING    │                        │
│         │  Exponential decay   │                        │
│         │  across hops         │                        │
│         └──────────┬───────────┘                        │
│                    ▼                                     │
│         ┌──────────────────────┐                        │
│         │  PRIORITIZED OUTPUT  │                        │
│         │  1. Warm intro asks  │                        │
│         │  2. Direct outreach  │                        │
│         │  3. Network gaps     │                        │
│         └──────────────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### The Math: Weighted Graph Proximity Score

Given:
- **T** = set of target leads you want to reach
- **M** = set of your mutuals/connections
- **G** = social graph (adjacency)
- **d(m, t)** = shortest path distance from mutual m to target t

For each mutual m, compute:

**Bridge Score:**

```
B(m) = Σ_{t ∈ T} w(t) · λ^{d(m,t) - 1}
```

Where:
- `w(t)` = target weight (from lead-intelligence signal score: role 30%, industry 25%, activity 20%, influence 10%, location 10%, engagement 5%)
- `λ` = decay factor, typically 0.5 (halves value each hop)
- `d(m,t)` = hop distance (1 = direct connection, 2 = mutual-of-mutual, etc.)
- Convention: `d(m,t) = 1` for direct connection, so `λ^0 = 1` (full value)

**Properties:**
- Direct connection to target: contributes `w(t) · 1.0`
- One hop away: contributes `w(t) · 0.5`
- Two hops: contributes `w(t) · 0.25`
- Three hops: contributes `w(t) · 0.125`
- Effectively zero beyond ~6 hops (Gaussian/exponential decay → 0)

**Extended Score (second-order network value):**

For deeper traversal, also consider the mutual's own network reach:

```
B_ext(m) = B(m) + α · Σ_{m' ∈ N(m) \ M} Σ_{t ∈ T} w(t) · λ^{d(m',t)}
```

Where:
- `N(m) \ M` = connections of m that you DON'T already have
- `α` = second-order discount (typically 0.3)
- This captures: "even if m doesn't know my targets directly, m knows people I don't, who might"

**Final Ranking:**

```
R(m) = B_ext(m) · (1 + β · engagement(m))
```

Where:
- `engagement(m)` = normalized score of how responsive m is (reply rate, interaction frequency)
- `β` = engagement bonus weight (typically 0.2)

### Execution Steps

1. **Build Target List**
   - Run lead-intelligence skill in parallel to generate scored ICP leads
   - Or provide manual target list with names/handles

2. **Harvest Your Graph**
   - X API: `GET /2/users/:id/following` and `GET /2/users/:id/followers`
   - LinkedIn: connection export CSV or browser-use scraping
   - Build adjacency map: `mutual → [their connections]`

3. **Intersect and Score**
   - For each mutual, check which targets they follow/connect with
   - Compute B(m) with decay
   - For top-k mutuals, expand one more hop and compute B_ext(m)

4. **Generate Output**
   - Tier 1: Mutuals with B(m) > threshold → warm intro requests
   - Tier 2: Targets with no warm path → direct cold outreach via lead-intelligence
   - Tier 3: Network gaps → suggest who to follow/connect with to build bridges

5. **Draft Messages**
   - Warm intro: "Hey [mutual], I saw you're connected to [target]. I'm working on [context]. Would you be open to making an intro?"
   - Uses outreach-drafter agent from lead-intelligence for personalization

### Configuration

```yaml
# Target definition
targets:
  - handle: "@targetperson"
    platform: x
    weight: 0.9  # override signal score

# Decay parameters
decay_factor: 0.5        # λ — halve value per hop
max_depth: 3             # don't traverse beyond 3 hops
second_order_discount: 0.3  # α — discount for network-of-network
engagement_bonus: 0.2    # β — bonus for responsive mutuals

# API configuration
x_api:
  bearer_token: $X_BEARER_TOKEN
  rate_limit_delay: 1.1  # seconds between API calls
linkedin:
  method: csv_export     # or browser_use
  csv_path: ~/Downloads/Connections.csv
```

### Integration with lead-intelligence

This skill runs IN PARALLEL with lead-intelligence:
- lead-intelligence generates the target list (T) with signal scores
- social-graph-ranker maps your network against those targets
- Combined output: prioritized outreach plan with warm paths where available

### Example Output

```
BRIDGE RANKING — Top 10 Mutuals by Network Value
═══════════════════════════════════════════════════

#1  @alex_quant (B=4.72)
    Direct → @kalshi_ceo (w=0.9), @polymarket_shayne (w=0.85)
    1-hop  → @a16z_crypto (w=0.7, via @defi_mike)
    Action: Ask for intros to Kalshi + Polymarket

#2  @sarah_vc (B=3.15)
    Direct → @sequoia_partner (w=0.95)
    1-hop  → @yc_gustaf (w=0.8, via @batch_founder)
    Action: Ask for Sequoia intro

#3  @dev_community (B=2.88)
    Direct → @cursor_ceo (w=0.6), @vercel_guillermo (w=0.6)
    2-hop  → @anthropic_dario (w=0.95, via @cursor_ceo → @anthropic_team)
    Action: Ask for Cursor intro, mention Anthropic angle

NETWORK GAPS — No warm path exists
═══════════════════════════════════
@target_x — Suggest following @bridge_person_1, @bridge_person_2
@target_y — Direct cold outreach recommended (lead-intelligence draft ready)
```
