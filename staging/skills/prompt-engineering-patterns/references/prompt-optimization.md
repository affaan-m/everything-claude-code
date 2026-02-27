# Prompt Optimization Guide

## Systematic Refinement Process

### 1. Baseline Establishment

```python
def establish_baseline(prompt, test_cases):
    results = {
        'accuracy': 0,
        'avg_tokens': 0,
        'avg_latency': 0,
        'success_rate': 0
    }

    for test_case in test_cases:
        response = llm.complete(prompt.format(**test_case['input']))

        results['accuracy'] += evaluate_accuracy(response, test_case['expected'])
        results['avg_tokens'] += count_tokens(response)
        results['avg_latency'] += measure_latency(response)
        results['success_rate'] += is_valid_response(response)

    # Average across test cases
    n = len(test_cases)
    return {k: v/n for k, v in results.items()}
```

### 2. Iterative Refinement Workflow

```
Initial Prompt → Test → Analyze Failures → Refine → Test → Repeat
```

```python
class PromptOptimizer:
    def __init__(self, initial_prompt, test_suite):
        self.prompt = initial_prompt
        self.test_suite = test_suite
        self.history = []

    def optimize(self, max_iterations=10):
        for i in range(max_iterations):
            # Test current prompt
            results = self.evaluate_prompt(self.prompt)
            self.history.append({
                'iteration': i,
                'prompt': self.prompt,
                'results': results
            })

            # Stop if good enough
            if results['accuracy'] > 0.95:
                break

            # Analyze failures
            failures = self.analyze_failures(results)

            # Generate refinement suggestions
            refinements = self.generate_refinements(failures)

            # Apply best refinement
            self.prompt = self.select_best_refinement(refinements)

        return self.get_best_prompt()
```

### 3. A/B Testing Framework

```python
class PromptABTest:
    def __init__(self, variant_a, variant_b):
        self.variant_a = variant_a
        self.variant_b = variant_b

    def run_test(self, test_queries, metrics=['accuracy', 'latency']):
        results = {
            'A': {m: [] for m in metrics},
            'B': {m: [] for m in metrics}
        }

        for query in test_queries:
            # Randomly assign variant (50/50 split)
            variant = 'A' if random.random() < 0.5 else 'B'
            prompt = self.variant_a if variant == 'A' else self.variant_b

            response, metrics_data = self.execute_with_metrics(
                prompt.format(query=query['input'])
            )

            for metric in metrics:
                results[variant][metric].append(metrics_data[metric])

        return self.analyze_results(results)

    def analyze_results(self, results):
        from scipy import stats

        analysis = {}
        for metric in results['A'].keys():
            a_values = results['A'][metric]
            b_values = results['B'][metric]

            # Statistical significance test
            t_stat, p_value = stats.ttest_ind(a_values, b_values)

            analysis[metric] = {
                'A_mean': np.mean(a_values),
                'B_mean': np.mean(b_values),
                'improvement': (np.mean(b_values) - np.mean(a_values)) / np.mean(a_values),
                'statistically_significant': p_value < 0.05,
                'p_value': p_value,
                'winner': 'B' if np.mean(b_values) > np.mean(a_values) else 'A'
            }

        return analysis
```

## Optimization Strategies

### Token Reduction

```python
def optimize_for_tokens(prompt):
    optimizations = [
        # Remove redundant phrases
        ('in order to', 'to'),
        ('due to the fact that', 'because'),
        ('at this point in time', 'now'),

        # Consolidate instructions
        ('First, ...\\nThen, ...\\nFinally, ...', 'Steps: 1) ... 2) ... 3) ...'),

        # Use abbreviations (after first definition)
        ('Natural Language Processing (NLP)', 'NLP'),

        # Remove filler words
        (' actually ', ' '),
        (' basically ', ' '),
        (' really ', ' ')
    ]

    optimized = prompt
    for old, new in optimizations:
        optimized = optimized.replace(old, new)

    return optimized
```

### Latency Reduction

```python
def optimize_for_latency(prompt):
    strategies = {
        'shorter_prompt': reduce_token_count(prompt),
        'streaming': enable_streaming_response(prompt),
        'caching': add_cacheable_prefix(prompt),
        'early_stopping': add_stop_sequences(prompt)
    }

    # Test each strategy
    best_strategy = None
    best_latency = float('inf')

    for name, modified_prompt in strategies.items():
        latency = measure_average_latency(modified_prompt)
        if latency < best_latency:
            best_latency = latency
            best_strategy = modified_prompt

    return best_strategy
```

### Accuracy Improvement

```python
def improve_accuracy(prompt, failure_cases):
    improvements = []

    # Add constraints for common failures
    if has_format_errors(failure_cases):
        improvements.append("Output must be valid JSON with no additional text.")

    # Add examples for edge cases
    edge_cases = identify_edge_cases(failure_cases)
    if edge_cases:
        improvements.append(f"Examples of edge cases:\\n{format_examples(edge_cases)}")

    # Add verification step
    if has_logical_errors(failure_cases):
        improvements.append("Before responding, verify your answer is logically consistent.")

    # Strengthen instructions
    if has_ambiguity_errors(failure_cases):
        improvements.append(clarify_ambiguous_instructions(prompt))

    return integrate_improvements(prompt, improvements)
```

## Performance Metrics

### Core Metrics

```python
class PromptMetrics:
    @staticmethod
    def accuracy(responses, ground_truth):
        return sum(r == gt for r, gt in zip(responses, ground_truth)) / len(responses)

    @staticmethod
    def consistency(responses):
        # Measure how often identical inputs produce identical outputs
        from collections import defaultdict
        input_responses = defaultdict(list)

        for inp, resp in responses:
            input_responses[inp].append(resp)

        consistency_scores = []
        for inp, resps in input_responses.items():
            if len(resps) > 1:
                # Percentage of responses that match the most common response
                most_common_count = Counter(resps).most_common(1)[0][1]
                consistency_scores.append(most_common_count / len(resps))

        return np.mean(consistency_scores) if consistency_scores else 1.0

    @staticmethod
    def token_efficiency(prompt, responses):
        avg_prompt_tokens = np.mean([count_tokens(prompt.format(**r['input'])) for r in responses])
        avg_response_tokens = np.mean([count_tokens(r['output']) for r in responses])
        return avg_prompt_tokens + avg_response_tokens

    @staticmethod
    def latency_p95(latencies):
        return np.percentile(latencies, 95)
```

### Automated Evaluation

```python
def evaluate_prompt_comprehensively(prompt, test_suite):
    results = {
        'accuracy': [],
        'consistency': [],
        'latency': [],
        'tokens': [],
        'success_rate': []
    }

    # Run each test case multiple times for consistency measurement
    for test_case in test_suite:
        runs = []
        for _ in range(3):  # 3 runs per test case
            start = time.time()
            response = llm.complete(prompt.format(**test_case['input']))
            latency = time.time() - start

            runs.append(response)
            results['latency'].append(latency)
            results['tokens'].append(count_tokens(prompt) + count_tokens(response))

        # Accuracy (best of 3 runs)
        accuracies = [evaluate_accuracy(r, test_case['expected']) for r in runs]
        results['accuracy'].append(max(accuracies))

        # Consistency (how similar are the 3 runs?)
        results['consistency'].append(calculate_similarity(runs))

        # Success rate (all runs successful?)
        results['success_rate'].append(all(is_valid(r) for r in runs))

    return {
        'avg_accuracy': np.mean(results['accuracy']),
        'avg_consistency': np.mean(results['consistency']),
        'p95_latency': np.percentile(results['latency'], 95),
        'avg_tokens': np.mean(results['tokens']),
        'success_rate': np.mean(results['success_rate'])
    }
```

## Failure Analysis

### Categorizing Failures

```python
class FailureAnalyzer:
    def categorize_failures(self, test_results):
        categories = {
            'format_errors': [],
            'factual_errors': [],
            'logic_errors': [],
            'incomplete_responses': [],
            'hallucinations': [],
            'off_topic': []
        }

        for result in test_results:
            if not result['success']:
                category = self.determine_failure_type(
                    result['response'],
                    result['expected']
                )
                categories[category].append(result)

        return categories

    def generate_fixes(self, categorized_failures):
        fixes = []

        if categorized_failures['format_errors']:
            fixes.append({
                'issue': 'Format errors',
                'fix': 'Add explicit format examples and constraints',
                'priority': 'high'
            })

        if categorized_failures['hallucinations']:
            fixes.append({
                'issue': 'Hallucinations',
                'fix': 'Add grounding instruction: "Base your answer only on provided context"',
                'priority': 'critical'
            })

        if categorized_failures['incomplete_responses']:
            fixes.append({
                'issue': 'Incomplete responses',
                'fix': 'Add: "Ensure your response fully addresses all parts of the question"',
                'priority': 'medium'
            })

        return fixes
```

## Versioning and Rollback

### Prompt Version Control

```python
class PromptVersionControl:
    def __init__(self, storage_path):
        self.storage = storage_path
        self.versions = []

    def save_version(self, prompt, metadata):
        version = {
            'id': len(self.versions),
            'prompt': prompt,
            'timestamp': datetime.now(),
            'metrics': metadata.get('metrics', {}),
            'description': metadata.get('description', ''),
            'parent_id': metadata.get('parent_id')
        }
        self.versions.append(version)
        self.persist()
        return version['id']

    def rollback(self, version_id):
        if version_id < len(self.versions):
            return self.versions[version_id]['prompt']
        raise ValueError(f"Version {version_id} not found")

    def compare_versions(self, v1_id, v2_id):
        v1 = self.versions[v1_id]
        v2 = self.versions[v2_id]

        return {
            'diff': generate_diff(v1['prompt'], v2['prompt']),
            'metrics_comparison': {
                metric: {
                    'v1': v1['metrics'].get(metric),
                    'v2': v2['metrics'].get(metric'),
                    'change': v2['metrics'].get(metric, 0) - v1['metrics'].get(metric, 0)
                }
                for metric in set(v1['metrics'].keys()) | set(v2['metrics'].keys())
            }
        }
```

## Best Practices

1. **Establish Baseline**: Always measure initial performance
2. **Change One Thing**: Isolate variables for clear attribution
3. **Test Thoroughly**: Use diverse, representative test cases
4. **Track Metrics**: Log all experiments and results
5. **Validate Significance**: Use statistical tests for A/B comparisons
6. **Document Changes**: Keep detailed notes on what and why
7. **Version Everything**: Enable rollback to previous versions
8. **Monitor Production**: Continuously evaluate deployed prompts

## Common Optimization Patterns

### Pattern 1: Add Structure

```
Before: "Analyze this text"
After: "Analyze this text for:\n1. Main topic\n2. Key arguments\n3. Conclusion"
```

### Pattern 2: Add Examples

```
Before: "Extract entities"
After: "Extract entities\\n\\nExample:\\nText: Apple released iPhone\\nEntities: {company: Apple, product: iPhone}"
```

### Pattern 3: Add Constraints

```
Before: "Summarize this"
After: "Summarize in exactly 3 bullet points, 15 words each"
```

### Pattern 4: Add Verification

```
Before: "Calculate..."
After: "Calculate... Then verify your calculation is correct before responding."
```

## Tools and Utilities

- Prompt diff tools for version comparison
- Automated test runners
- Metric dashboards
- A/B testing frameworks
- Token counting utilities
- Latency profilers
