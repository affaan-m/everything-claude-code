# Chain-of-Thought Prompting

## Overview

Chain-of-Thought (CoT) prompting elicits step-by-step reasoning from LLMs, dramatically improving performance on complex reasoning, math, and logic tasks.

## Core Techniques

### Zero-Shot CoT

Add a simple trigger phrase to elicit reasoning:

```python
def zero_shot_cot(query):
    return f"""{query}

Let's think step by step:"""

# Example
query = "If a train travels 60 mph for 2.5 hours, how far does it go?"
prompt = zero_shot_cot(query)

# Model output:
# "Let's think step by step:
# 1. Speed = 60 miles per hour
# 2. Time = 2.5 hours
# 3. Distance = Speed × Time
# 4. Distance = 60 × 2.5 = 150 miles
# Answer: 150 miles"
```

### Few-Shot CoT

Provide examples with explicit reasoning chains:

```python
few_shot_examples = """
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 balls. How many tennis balls does he have now?
A: Let's think step by step:
1. Roger starts with 5 balls
2. He buys 2 cans, each with 3 balls
3. Balls from cans: 2 × 3 = 6 balls
4. Total: 5 + 6 = 11 balls
Answer: 11

Q: The cafeteria had 23 apples. If they used 20 to make lunch and bought 6 more, how many do they have?
A: Let's think step by step:
1. Started with 23 apples
2. Used 20 for lunch: 23 - 20 = 3 apples left
3. Bought 6 more: 3 + 6 = 9 apples
Answer: 9

Q: {user_query}
A: Let's think step by step:"""
```

### Self-Consistency

Generate multiple reasoning paths and take the majority vote:

```python
import openai
from collections import Counter

def self_consistency_cot(query, n=5, temperature=0.7):
    prompt = f"{query}\n\nLet's think step by step:"

    responses = []
    for _ in range(n):
        response = openai.ChatCompletion.create(
            model="gpt-5.2",
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature
        )
        responses.append(extract_final_answer(response))

    # Take majority vote
    answer_counts = Counter(responses)
    final_answer = answer_counts.most_common(1)[0][0]

    return {
        'answer': final_answer,
        'confidence': answer_counts[final_answer] / n,
        'all_responses': responses
    }
```

## Advanced Patterns

### Least-to-Most Prompting

Break complex problems into simpler subproblems:

```python
def least_to_most_prompt(complex_query):
    # Stage 1: Decomposition
    decomp_prompt = f"""Break down this complex problem into simpler subproblems:

Problem: {complex_query}

Subproblems:"""

    subproblems = get_llm_response(decomp_prompt)

    # Stage 2: Sequential solving
    solutions = []
    context = ""

    for subproblem in subproblems:
        solve_prompt = f"""{context}

Solve this subproblem:
{subproblem}

Solution:"""
        solution = get_llm_response(solve_prompt)
        solutions.append(solution)
        context += f"\n\nPreviously solved: {subproblem}\nSolution: {solution}"

    # Stage 3: Final integration
    final_prompt = f"""Given these solutions to subproblems:
{context}

Provide the final answer to: {complex_query}

Final Answer:"""

    return get_llm_response(final_prompt)
```

### Tree-of-Thought (ToT)

Explore multiple reasoning branches:

```python
class TreeOfThought:
    def __init__(self, llm_client, max_depth=3, branches_per_step=3):
        self.client = llm_client
        self.max_depth = max_depth
        self.branches_per_step = branches_per_step

    def solve(self, problem):
        # Generate initial thought branches
        initial_thoughts = self.generate_thoughts(problem, depth=0)

        # Evaluate each branch
        best_path = None
        best_score = -1

        for thought in initial_thoughts:
            path, score = self.explore_branch(problem, thought, depth=1)
            if score > best_score:
                best_score = score
                best_path = path

        return best_path

    def generate_thoughts(self, problem, context="", depth=0):
        prompt = f"""Problem: {problem}
{context}

Generate {self.branches_per_step} different next steps in solving this problem:

1."""
        response = self.client.complete(prompt)
        return self.parse_thoughts(response)

    def evaluate_thought(self, problem, thought_path):
        prompt = f"""Problem: {problem}

Reasoning path so far:
{thought_path}

Rate this reasoning path from 0-10 for:
- Correctness
- Likelihood of reaching solution
- Logical coherence

Score:"""
        return float(self.client.complete(prompt))
```

### Verification Step

Add explicit verification to catch errors:

```python
def cot_with_verification(query):
    # Step 1: Generate reasoning and answer
    reasoning_prompt = f"""{query}

Let's solve this step by step:"""

    reasoning_response = get_llm_response(reasoning_prompt)

    # Step 2: Verify the reasoning
    verification_prompt = f"""Original problem: {query}

Proposed solution:
{reasoning_response}

Verify this solution by:
1. Checking each step for logical errors
2. Verifying arithmetic calculations
3. Ensuring the final answer makes sense

Is this solution correct? If not, what's wrong?

Verification:"""

    verification = get_llm_response(verification_prompt)

    # Step 3: Revise if needed
    if "incorrect" in verification.lower() or "error" in verification.lower():
        revision_prompt = f"""The previous solution had errors:
{verification}

Please provide a corrected solution to: {query}

Corrected solution:"""
        return get_llm_response(revision_prompt)

    return reasoning_response
```

## Domain-Specific CoT

### Math Problems

```python
math_cot_template = """
Problem: {problem}

Solution:
Step 1: Identify what we know
- {list_known_values}

Step 2: Identify what we need to find
- {target_variable}

Step 3: Choose relevant formulas
- {formulas}

Step 4: Substitute values
- {substitution}

Step 5: Calculate
- {calculation}

Step 6: Verify and state answer
- {verification}

Answer: {final_answer}
"""
```

### Code Debugging

```python
debug_cot_template = """
Code with error:
{code}

Error message:
{error}

Debugging process:
Step 1: Understand the error message
- {interpret_error}

Step 2: Locate the problematic line
- {identify_line}

Step 3: Analyze why this line fails
- {root_cause}

Step 4: Determine the fix
- {proposed_fix}

Step 5: Verify the fix addresses the error
- {verification}

Fixed code:
{corrected_code}
"""
```

### Logical Reasoning

```python
logic_cot_template = """
Premises:
{premises}

Question: {question}

Reasoning:
Step 1: List all given facts
{facts}

Step 2: Identify logical relationships
{relationships}

Step 3: Apply deductive reasoning
{deductions}

Step 4: Draw conclusion
{conclusion}

Answer: {final_answer}
"""
```

## Performance Optimization

### Caching Reasoning Patterns

```python
class ReasoningCache:
    def __init__(self):
        self.cache = {}

    def get_similar_reasoning(self, problem, threshold=0.85):
        problem_embedding = embed(problem)

        for cached_problem, reasoning in self.cache.items():
            similarity = cosine_similarity(
                problem_embedding,
                embed(cached_problem)
            )
            if similarity > threshold:
                return reasoning

        return None

    def add_reasoning(self, problem, reasoning):
        self.cache[problem] = reasoning
```

### Adaptive Reasoning Depth

```python
def adaptive_cot(problem, initial_depth=3):
    depth = initial_depth

    while depth <= 10:  # Max depth
        response = generate_cot(problem, num_steps=depth)

        # Check if solution seems complete
        if is_solution_complete(response):
            return response

        depth += 2  # Increase reasoning depth

    return response  # Return best attempt
```

## Evaluation Metrics

```python
def evaluate_cot_quality(reasoning_chain):
    metrics = {
        'coherence': measure_logical_coherence(reasoning_chain),
        'completeness': check_all_steps_present(reasoning_chain),
        'correctness': verify_final_answer(reasoning_chain),
        'efficiency': count_unnecessary_steps(reasoning_chain),
        'clarity': rate_explanation_clarity(reasoning_chain)
    }
    return metrics
```

## Best Practices

1. **Clear Step Markers**: Use numbered steps or clear delimiters
2. **Show All Work**: Don't skip steps, even obvious ones
3. **Verify Calculations**: Add explicit verification steps
4. **State Assumptions**: Make implicit assumptions explicit
5. **Check Edge Cases**: Consider boundary conditions
6. **Use Examples**: Show the reasoning pattern with examples first

## Common Pitfalls

- **Premature Conclusions**: Jumping to answer without full reasoning
- **Circular Logic**: Using the conclusion to justify the reasoning
- **Missing Steps**: Skipping intermediate calculations
- **Overcomplicated**: Adding unnecessary steps that confuse
- **Inconsistent Format**: Changing step structure mid-reasoning

## When to Use CoT

**Use CoT for:**

- Math and arithmetic problems
- Logical reasoning tasks
- Multi-step planning
- Code generation and debugging
- Complex decision making

**Skip CoT for:**

- Simple factual queries
- Direct lookups
- Creative writing
- Tasks requiring conciseness
- Real-time, latency-sensitive applications

## Resources

- Benchmark datasets for CoT evaluation
- Pre-built CoT prompt templates
- Reasoning verification tools
- Step extraction and parsing utilities
