<!-- Source: https://github.com/SuperiorByteWorks-LLC/agent-project | License: Apache-2.0 | Author: Clayton Young / Superior Byte Works, LLC (Boreal Bytes) -->

# Sankey Diagram

> **Back to [Style Guide](../mermaid_style_guide.md)** — Read the style guide first for emoji, color, and accessibility rules.

**Syntax keyword:** `sankey-beta`
**Best for:** Flow magnitude visualization, resource distribution, budget allocation, traffic routing
**When NOT to use:** Simple proportions (use [Pie](pie.md)), process steps (use [Flowchart](flowchart.md))

> ⚠️ **Accessibility:** Sankey diagrams do **not** support `accTitle`/`accDescr`. Always place a descriptive _italic_ Markdown paragraph directly above the code block.

---

## Exemplar Diagram

_Sankey diagram showing how a $100K monthly cloud budget flows from the total allocation through service categories (compute, storage, networking, observability) to specific AWS services, with band widths proportional to cost:_

```mermaid
sankey-beta

Cloud Budget,Compute,45000
Cloud Budget,Storage,25000
Cloud Budget,Networking,15000
Cloud Budget,Observability,10000
Cloud Budget,Security,5000

Compute,EC2 Instances,30000
Compute,Lambda Functions,10000
Compute,ECS Containers,5000

Storage,S3 Buckets,15000
Storage,RDS Databases,10000

Networking,CloudFront CDN,8000
Networking,API Gateway,7000

Observability,CloudWatch,6000
Observability,Datadog,4000
```

---

## Tips

- Format: `Source,Target,Value` — one flow per line
- Values determine the width of each flow band
- Keep to **3 levels** maximum (source → category → destination)
- Blank lines between groups improve source readability
- Good for answering "where does the 💰 go?" questions
- No emoji in node names (parser limitation) — use descriptive text
- **Always** pair with a Markdown text description above for screen readers

---

## Template

_Description of what flows from where to where and what the magnitudes represent:_

```mermaid
sankey-beta

Source,Category A,500
Source,Category B,300
Source,Category C,200

Category A,Destination 1,300
Category A,Destination 2,200

Category B,Destination 3,300
```
