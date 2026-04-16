# ECC v1.10.0 is live

ECC just crossed **140K stars**, and the public release surface had drifted too far from the actual repo.

So v1.10.0 is a hard sync release:

- **38 agents**
- **156 skills**
- **72 commands**
- plugin/install metadata corrected
- top-line docs and release surfaces brought back in line

This release also folds in the operator/media lane that has been growing around the core harness system:

- `brand-voice`
- `social-graph-ranker`
- `connections-optimizer`
- `customer-billing-ops`
- `google-workspace-ops`
- `project-flow-ops`
- `workspace-surface-audit`
- `manim-video`
- `remotion-video-creation`

And on the 2.0 side:

ECC 2.0 is now **real as an alpha control-plane surface** in-tree under `ecc2/`.

It builds today and exposes:

- `dashboard`
- `start`
- `sessions`
- `status`
- `stop`
- `resume`
- `daemon`

That does **not** mean the full ECC 2.0 roadmap is done.

It means the control-plane alpha is here, usable, and moving out of the “just a vision” category.

The shortest honest framing right now:

- ECC 1.x is the battle-tested harness/workflow layer shipping broadly today
- ECC 2.0 is the alpha control-plane growing on top of it

If you have been waiting for:

- cleaner install surfaces
- stronger cross-harness parity
- operator workflows instead of just coding primitives
- a real control-plane direction instead of scattered notes

this is the release that makes the repo feel coherent again.
