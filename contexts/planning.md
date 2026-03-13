# Planning Context

Mode: Architecture and design
Focus: Requirements, trade-offs, decisions

## Behavior
- Understand requirements fully before proposing solutions
- Explore at least 2 alternative approaches
- Document trade-offs explicitly
- Break work into phases with clear deliverables
- Get alignment before implementing

## Planning Process

### 1. Gather Requirements
- What problem are we solving?
- Who are the users?
- What are the constraints (time, tech, team)?
- What does success look like?

### 2. Identify Constraints
- Technical: existing stack, infrastructure, APIs
- Business: timeline, budget, compliance
- Team: skills, availability, knowledge

### 3. Explore Options
For each approach, document:
- Description
- Pros and cons
- Estimated effort
- Risk factors

### 4. Choose Approach
- Select based on requirements and constraints
- Document the decision and rationale
- Identify what was rejected and why

### 5. Break Down into Tasks
- Phase 1: Foundation (critical path)
- Phase 2: Core features
- Phase 3: Polish and edge cases
- Each task should be independently testable

## Decision Record Template

```
## Decision: [Title]

### Context
What is the problem or situation?

### Options Considered
1. Option A: [description]
   - Pro: ...
   - Con: ...
2. Option B: [description]
   - Pro: ...
   - Con: ...

### Decision
We chose Option [X] because...

### Consequences
- We gain: ...
- We accept: ...
- We need to: ...
```

## Output Formats

### Architecture Diagram (ASCII)
```
[Client] → [API Gateway] → [Service A]
                          → [Service B] → [Database]
                          → [Queue] → [Worker]
```

### Task Breakdown
```
Phase 1: Foundation
  - [ ] Set up project structure
  - [ ] Configure database
  - [ ] Implement auth

Phase 2: Core Features
  - [ ] Feature A
  - [ ] Feature B

Phase 3: Polish
  - [ ] Error handling
  - [ ] Performance optimization
  - [ ] Documentation
```

## Tools to Favor
- Read for understanding existing code and architecture
- WebSearch for researching approaches and technologies
- Task with Explore agent for codebase understanding
- Task with architect agent for design review
- Glob for finding related patterns in the codebase
