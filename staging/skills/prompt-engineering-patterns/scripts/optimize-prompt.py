#!/usr/bin/env python3
"""
Prompt Optimization Script

Automatically test and optimize prompts using A/B testing and metrics tracking.
"""

import json
import time
from typing import List, Dict, Any
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
import numpy as np


@dataclass
class TestCase:
    input: Dict[str, Any]
    expected_output: str
    metadata: Dict[str, Any] = None


class PromptOptimizer:
    def __init__(self, llm_client, test_suite: List[TestCase]):
        self.client = llm_client
        self.test_suite = test_suite
        self.results_history = []
        self.executor = ThreadPoolExecutor()

    def shutdown(self):
        """Shutdown the thread pool executor."""
        self.executor.shutdown(wait=True)

    def evaluate_prompt(self, prompt_template: str, test_cases: List[TestCase] = None) -> Dict[str, float]:
        """Evaluate a prompt template against test cases in parallel."""
        if test_cases is None:
            test_cases = self.test_suite

        metrics = {
            'accuracy': [],
            'latency': [],
            'token_count': [],
            'success_rate': []
        }

        def process_test_case(test_case):
            start_time = time.time()

            # Render prompt with test case inputs
            prompt = prompt_template.format(**test_case.input)

            # Get LLM response
            response = self.client.complete(prompt)

            # Measure latency
            latency = time.time() - start_time

            # Calculate individual metrics
            token_count = len(prompt.split()) + len(response.split())
            success = 1 if response else 0
            accuracy = self.calculate_accuracy(response, test_case.expected_output)

            return {
                'latency': latency,
                'token_count': token_count,
                'success_rate': success,
                'accuracy': accuracy
            }

        # Run test cases in parallel
        results = list(self.executor.map(process_test_case, test_cases))

        # Aggregate metrics
        for result in results:
            metrics['latency'].append(result['latency'])
            metrics['token_count'].append(result['token_count'])
            metrics['success_rate'].append(result['success_rate'])
            metrics['accuracy'].append(result['accuracy'])

        return {
            'avg_accuracy': np.mean(metrics['accuracy']),
            'avg_latency': np.mean(metrics['latency']),
            'p95_latency': np.percentile(metrics['latency'], 95),
            'avg_tokens': np.mean(metrics['token_count']),
            'success_rate': np.mean(metrics['success_rate'])
        }

    def calculate_accuracy(self, response: str, expected: str) -> float:
        """Calculate accuracy score between response and expected output."""
        # Simple exact match
        if response.strip().lower() == expected.strip().lower():
            return 1.0

        # Partial match using word overlap
        response_words = set(response.lower().split())
        expected_words = set(expected.lower().split())

        if not expected_words:
            return 0.0

        overlap = len(response_words & expected_words)
        return overlap / len(expected_words)

    def optimize(self, base_prompt: str, max_iterations: int = 5) -> Dict[str, Any]:
        """Iteratively optimize a prompt."""
        current_prompt = base_prompt
        best_prompt = base_prompt
        best_score = 0
        current_metrics = None

        for iteration in range(max_iterations):
            print(f"\nIteration {iteration + 1}/{max_iterations}")

            # Evaluate current prompt
            # Bolt Optimization: Avoid re-evaluating if we already have metrics from previous iteration
            if current_metrics:
                metrics = current_metrics
            else:
                metrics = self.evaluate_prompt(current_prompt)

            print(f"Accuracy: {metrics['avg_accuracy']:.2f}, Latency: {metrics['avg_latency']:.2f}s")

            # Track results
            self.results_history.append({
                'iteration': iteration,
                'prompt': current_prompt,
                'metrics': metrics
            })

            # Update best if improved
            if metrics['avg_accuracy'] > best_score:
                best_score = metrics['avg_accuracy']
                best_prompt = current_prompt

            # Stop if good enough
            if metrics['avg_accuracy'] > 0.95:
                print("Achieved target accuracy!")
                break

            # Generate variations for next iteration
            variations = self.generate_variations(current_prompt, metrics)

            # Test variations and pick best
            best_variation = current_prompt
            best_variation_score = metrics['avg_accuracy']
            best_variation_metrics = metrics

            for variation in variations:
                var_metrics = self.evaluate_prompt(variation)
                if var_metrics['avg_accuracy'] > best_variation_score:
                    best_variation_score = var_metrics['avg_accuracy']
                    best_variation = variation
                    best_variation_metrics = var_metrics

            current_prompt = best_variation
            current_metrics = best_variation_metrics

        return {
            'best_prompt': best_prompt,
            'best_score': best_score,
            'history': self.results_history
        }

    def generate_variations(self, prompt: str, current_metrics: Dict) -> List[str]:
        """Generate prompt variations to test."""
        variations = []

        # Variation 1: Add explicit format instruction
        variations.append(prompt + "\n\nProvide your answer in a clear, concise format.")

        # Variation 2: Add step-by-step instruction
        variations.append("Let's solve this step by step.\n\n" + prompt)

        # Variation 3: Add verification step
        variations.append(prompt + "\n\nVerify your answer before responding.")

        # Variation 4: Make more concise
        concise = self.make_concise(prompt)
        if concise != prompt:
            variations.append(concise)

        # Variation 5: Add examples (if none present)
        if "example" not in prompt.lower():
            variations.append(self.add_examples(prompt))

        return variations[:3]  # Return top 3 variations

    def make_concise(self, prompt: str) -> str:
        """Remove redundant words to make prompt more concise."""
        replacements = [
            ("in order to", "to"),
            ("due to the fact that", "because"),
            ("at this point in time", "now"),
            ("in the event that", "if"),
        ]

        result = prompt
        for old, new in replacements:
            result = result.replace(old, new)

        return result

    def add_examples(self, prompt: str) -> str:
        """Add example section to prompt."""
        return f"""{prompt}

Example:
Input: Sample input
Output: Sample output
"""

    def compare_prompts(self, prompt_a: str, prompt_b: str) -> Dict[str, Any]:
        """A/B test two prompts."""
        print("Testing Prompt A...")
        metrics_a = self.evaluate_prompt(prompt_a)

        print("Testing Prompt B...")
        metrics_b = self.evaluate_prompt(prompt_b)

        return {
            'prompt_a_metrics': metrics_a,
            'prompt_b_metrics': metrics_b,
            'winner': 'A' if metrics_a['avg_accuracy'] > metrics_b['avg_accuracy'] else 'B',
            'improvement': abs(metrics_a['avg_accuracy'] - metrics_b['avg_accuracy'])
        }

    def export_results(self, filename: str):
        """Export optimization results to JSON."""
        with open(filename, 'w') as f:
            json.dump(self.results_history, f, indent=2)


def main():
    # Example usage
    test_suite = [
        TestCase(
            input={'text': 'This movie was amazing!'},
            expected_output='Positive'
        ),
        TestCase(
            input={'text': 'Worst purchase ever.'},
            expected_output='Negative'
        ),
        TestCase(
            input={'text': 'It was okay, nothing special.'},
            expected_output='Neutral'
        )
    ]

    # Mock LLM client for demonstration
    class MockLLMClient:
        def complete(self, prompt):
            # Simulate LLM response
            if 'amazing' in prompt:
                return 'Positive'
            elif 'worst' in prompt.lower():
                return 'Negative'
            else:
                return 'Neutral'

    optimizer = PromptOptimizer(MockLLMClient(), test_suite)

    try:
        base_prompt = "Classify the sentiment of: {text}\nSentiment:"

        results = optimizer.optimize(base_prompt)

        print("\n" + "="*50)
        print("Optimization Complete!")
        print(f"Best Accuracy: {results['best_score']:.2f}")
        print(f"Best Prompt:\n{results['best_prompt']}")

        optimizer.export_results('optimization_results.json')
    finally:
        optimizer.shutdown()


if __name__ == '__main__':
    main()
