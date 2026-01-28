---
name: deep-research
description: Autonomous multi-step research agent. Breaks down complex questions, gathers evidence, synthesizes findings, and produces structured reports.
metadata: {"clawdbot":{"emoji":"🔬","os":["darwin","linux","win32"]}}
---

# Deep Research

Autonomous research methodology for complex, multi-step investigations.

## When to Use

- Complex questions requiring multiple sources
- Technical deep-dives (architecture comparisons, technology evaluations)
- Market research and competitive analysis
- Literature reviews and state-of-the-art surveys
- Due diligence and background research

## The RESEARCH Framework

### R - Refine the Question

Break down the main question into sub-questions:

```markdown
## Main Question
"Should we migrate from PostgreSQL to CockroachDB?"

## Sub-Questions
1. What are the performance differences at our scale?
2. What is the migration complexity?
3. What are the operational differences?
4. What is the total cost of ownership?
5. What are the failure modes and recovery options?
```

### E - Explore Sources

Identify and prioritize sources:

```markdown
## Source Types
- [x] Official documentation
- [x] Benchmark studies
- [x] Case studies from similar companies
- [x] GitHub issues and discussions
- [x] Stack Overflow / Reddit experiences
- [x] Academic papers (if relevant)

## Source Priority
1. Official docs (most authoritative)
2. Peer-reviewed benchmarks
3. Production case studies
4. Community experiences
```

### S - Search Systematically

Execute searches with varied queries:

```bash
# Search variations
"cockroachdb vs postgresql benchmark"
"cockroachdb migration experience"
"cockroachdb at scale production"
"postgresql to cockroachdb migration guide"
"cockroachdb limitations problems"
```

### E - Extract Key Findings

For each source, extract:

```markdown
## Source: [Title](URL)
**Type**: Official Documentation / Case Study / Benchmark
**Date**: YYYY-MM-DD
**Credibility**: High / Medium / Low

### Key Points
- Point 1
- Point 2

### Evidence
> "Direct quote with specific data"

### Limitations
- Potential bias (vendor source)
- Outdated (2 years old)
```

### A - Analyze and Compare

Cross-reference findings:

```markdown
## Finding: Performance at Scale

### Supporting Evidence
1. Source A says: "X performs better"
2. Source B says: "X performs better under conditions Y"

### Contradicting Evidence
1. Source C says: "Z performs better for workload W"

### Synthesis
Under our specific workload (read-heavy, 10TB), evidence suggests...
```

### R - Report Findings

Structure the final report:

```markdown
# Research Report: [Topic]

## Executive Summary
One paragraph summary with key recommendation.

## Methodology
- Questions explored
- Sources consulted
- Timeframe

## Findings

### Finding 1: [Topic]
**Conclusion**: [One sentence]
**Evidence**: [Summary with citations]
**Confidence**: High / Medium / Low

### Finding 2: [Topic]
...

## Recommendations
1. Recommendation with rationale
2. Recommendation with rationale

## Appendix
- Full source list
- Raw data
- Methodology notes
```

### C - Check and Cite

Verify and cite properly:

```markdown
## Verification Checklist
- [ ] Cross-referenced with multiple sources
- [ ] Checked for recency (< 2 years preferred)
- [ ] Identified potential biases
- [ ] Noted confidence levels
- [ ] Cited all sources

## Citation Format
[1] Author, "Title", Source, Date. URL
[2] ...
```

### H - Highlight Gaps

Acknowledge limitations:

```markdown
## Known Gaps
- Could not find production data at our exact scale
- No direct comparison for our specific use case
- Limited data on long-term operational costs

## Recommended Follow-up
1. Run our own benchmark with production-like data
2. Contact companies X, Y for case study details
3. Pilot test with subset of data
```

## Research File Structure

```
research/
├── question.md           # The refined research question
├── sources/
│   ├── source-001.md     # Individual source notes
│   ├── source-002.md
│   └── ...
├── findings/
│   ├── finding-01.md     # Synthesized findings
│   ├── finding-02.md
│   └── ...
├── analysis.md           # Cross-reference analysis
├── report.md             # Final report
└── citations.md          # Bibliography
```

## Example: Technology Evaluation

```markdown
# Research: GraphQL vs REST for Our API

## Sub-Questions
1. Performance impact at 10k requests/second?
2. Developer experience differences?
3. Caching and CDN compatibility?
4. Mobile client considerations?
5. Tooling and ecosystem maturity?

## Sources Explored
- GraphQL official docs
- Netflix engineering blog (GraphQL adoption)
- Shopify engineering blog (GraphQL at scale)
- PayPal case study
- Benchmark papers from ACM
- Reddit r/graphql experiences

## Key Findings

### Performance
- GraphQL reduces over-fetching by 40% (Source: Shopify)
- N+1 query problem requires DataLoader (Source: Official docs)
- Caching more complex than REST (Source: Netflix)

### Developer Experience
- Faster iteration for frontend (Source: PayPal)
- Steeper learning curve (Source: Reddit consensus)
- Better tooling with Apollo/Relay (Source: Official docs)

## Recommendation
For our use case (mobile-heavy, many nested resources):
GraphQL recommended with caveats on caching strategy.
```

## Integration with Other Skills

### With Planning-with-Files
```
task_plan.md   → Research phases as checklist
findings.md    → Direct mapping to research findings
progress.md    → Track sources explored
```

### With Multi-Agent Swarm
Parallelize research:
- Agent 1: Official documentation
- Agent 2: Case studies
- Agent 3: Community experiences
- Agent 4: Academic sources

### With Quant Research
For market/competitive research:
- Apply same rigor to data analysis
- Quantify where possible
- Use statistical methods for confidence

## Research Quality Checklist

Before finalizing research:

- [ ] Question is clearly defined
- [ ] Multiple independent sources consulted
- [ ] Evidence is cited with dates
- [ ] Contradictions are addressed
- [ ] Confidence levels assigned
- [ ] Biases acknowledged
- [ ] Gaps identified
- [ ] Recommendations are actionable
- [ ] Report is structured and scannable

## Common Pitfalls

### 1. Confirmation Bias
Actively seek contradicting evidence. Search for "[topic] problems" and "[topic] criticism".

### 2. Recency Bias
Prefer recent sources but don't ignore foundational work.

### 3. Authority Bias
Vendor docs are authoritative for "how" but biased for "should you".

### 4. Survivorship Bias
Look for failure stories, not just success cases.

### 5. Scope Creep
Stay focused on the original question. Note tangents for future research.

## Time Boxing

| Research Depth | Time | Sources | Output |
|----------------|------|---------|--------|
| Quick scan | 30 min | 3-5 | Summary |
| Standard | 2-4 hours | 10-15 | Report |
| Deep dive | 1-2 days | 20-30 | Comprehensive |
| Exhaustive | 1+ week | 50+ | Publication-ready |

---

**Remember**: Good research is iterative. Start broad, narrow to specifics, then verify.
