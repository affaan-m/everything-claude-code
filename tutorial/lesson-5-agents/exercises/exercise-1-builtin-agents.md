# Exercise 1: Use Built-In Agents

## Goal

Understand how Claude uses built-in agents automatically.

## Experiment 1: The Explore Agent

The Explore agent is used for searching and understanding codebases.

Start Claude Code in any project and try:

```
"How is authentication implemented in this project?"
```

Watch the output — Claude should launch an Explore agent to search the
codebase before answering. You'll see it spin up a subagent.

## Experiment 2: The Plan Agent

The Plan agent helps design implementation strategies.

```
"Plan how to add RBAC (role-based access control) to the API"
```

Claude should use the Plan agent to research the codebase, then present
a structured implementation plan.

## Experiment 3: Explicit Agent Selection

You can ask Claude to use a specific agent:

```
"Use an Explore agent to find all files that handle user authentication"
```

## What to Observe

- [ ] Did Claude delegate to a subagent? (You'll see a task indicator)
- [ ] Did the agent return focused results?
- [ ] Did Claude synthesize the agent's findings into a clear answer?
- [ ] Was the main conversation context preserved (not cluttered)?

## Reflection Questions

1. When did Claude decide to use an agent vs doing the work itself?
2. How did the agent's focused context help get a better answer?
3. What would happen if Claude tried to search the entire codebase
   in the main conversation? (Answer: context would fill up fast)
