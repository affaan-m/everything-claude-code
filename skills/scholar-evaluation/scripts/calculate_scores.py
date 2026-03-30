#!/usr/bin/env python3
"""
ScholarEval Score Calculator

Calculate aggregate evaluation scores from dimension-level ratings.
Supports weighted averaging, threshold analysis, and score visualization.

Usage:
    python calculate_scores.py --scores <dimension_scores.json> --output <report.txt>
    python calculate_scores.py --scores <dimension_scores.json> --weights <weights.json>
    python calculate_scores.py --interactive

Author: ScholarEval Framework
License: MIT
"""

import json
import argparse
import sys
from typing import Dict, List, Optional
from pathlib import Path


# Default dimension weights (total = 100%)
DEFAULT_WEIGHTS = {
    "problem_formulation": 0.15,
    "literature_review": 0.15,
    "methodology": 0.20,
    "data_collection": 0.10,
    "analysis": 0.15,
    "results": 0.10,
    "writing": 0.10,
    "citations": 0.05
}

# Quality level definitions
QUALITY_LEVELS = {
    (4.5, 5.0): ("Exceptional", "Ready for top-tier publication"),
    (4.0, 4.4): ("Strong", "Publication-ready with minor revisions"),
    (3.5, 3.9): ("Good", "Major revisions required, promising work"),
    (3.0, 3.4): ("Acceptable", "Significant revisions needed"),
    (2.0, 2.9): ("Weak", "Fundamental issues, major rework required"),
    (0.0, 1.9): ("Poor", "Not suitable without complete revision")
}


def load_scores(filepath: Path) -> Dict[str, float]:
    """Load dimension scores from JSON file."""
    try:
        with open(filepath, 'r') as f:
            scores = json.load(f)

        # Validate scores
        for dim, score in scores.items():
            if not 1 <= score <= 5:
                raise ValueError(f"Score for {dim} must be between 1 and 5, got {score}")

        return scores
    except FileNotFoundError:
        print(f"Error: File not found: {filepath}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {filepath}")
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)


def load_weights(filepath: Optional[Path] = None) -> Dict[str, float]:
    """Load dimension weights from JSON file or return defaults."""
    if filepath is None:
        return DEFAULT_WEIGHTS

    try:
        with open(filepath, 'r') as f:
            weights = json.load(f)

        # Validate weights sum to 1.0
        total = sum(weights.values())
        if not 0.99 <= total <= 1.01:  # Allow small floating point errors
            raise ValueError(f"Weights must sum to 1.0, got {total}")

        return weights
    except FileNotFoundError:
        print(f"Error: File not found: {filepath}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {filepath}")
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)


def calculate_weighted_average(scores: Dict[str, float], weights: Dict[str, float]) -> float:
    """Calculate weighted average score."""
    total_score = 0.0
    total_weight = 0.0

    for dimension, score in scores.items():
        # Handle dimension name variations (e.g., "problem_formulation" vs "problem-formulation")
        dim_key = dimension.replace('-', '_').lower()
        weight = weights.get(dim_key, 0.0)

        total_score += score * weight
        total_weight += weight

    # Normalize if not all dimensions were scored
    if total_weight > 0:
        return total_score / total_weight * (sum(weights.values()) / total_weight)
    return 0.0


def get_quality_level(score: float) -> tuple:
    """Get quality level description for a given score."""
    for (low, high), (level, description) in QUALITY_LEVELS.items():
        if low <= score <= high:
            return level, description
    return "Unknown", "Score out of expected range"


def generate_bar_chart(scores: Dict[str, float], max_width: int = 50) -> str:
    """Generate ASCII bar chart of dimension scores."""
    lines = []
    max_name_len = max(len(name) for name in scores.keys())

    for dimension, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
        bar_length = int((score / 5.0) * max_width)
        bar = '█' * bar_length
        padding = ' ' * (max_name_len - len(dimension))
        lines.append(f"  {dimension}{padding} │ {bar} {score:.2f}")

    return '\n'.join(lines)


def identify_strengths_weaknesses(scores: Dict[str, float]) -> tuple:
    """Identify top strengths and areas for improvement."""
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    strengths = [dim for dim, score in sorted_scores[:3] if score >= 4.0]
    weaknesses = [dim for dim, score in sorted_scores[-3:] if score < 3.5]

    return strengths, weaknesses


def generate_report(scores: Dict[str, float], weights: Dict[str, float],
                   output_file: Optional[Path] = None) -> str:
    """Generate comprehensive evaluation report."""
    overall_score = calculate_weighted_average(scores, weights)
    quality_level, quality_desc = get_quality_level(overall_score)
    strengths, weaknesses = identify_strengths_weaknesses(scores)

    report_lines = [
        "="*70,
        "SCHOLAREVAL SCORE REPORT",
        "="*70,
        "",
        f"Overall Score: {overall_score:.2f} / 5.00",
        f"Quality Level: {quality_level}",
        f"Assessment: {quality_desc}",
        "",
        "="*70,
        "DIMENSION SCORES",
        "="*70,
        "",
        generate_bar_chart(scores),
        "",
        "="*70,
        "DETAILED BREAKDOWN",
        "="*70,
        ""
    ]

    # Add detailed scores with weights
    for dimension, score in sorted(scores.items()):
        dim_key = dimension.replace('-', '_').lower()
        weight = weights.get(dim_key, 0.0)
        weighted_contribution = score * weight
        percentage = weight * 100

        report_lines.append(
            f"  {dimension:25s} {score:.2f}/5.00  "
            f"(weight: {percentage:4.1f}%, contribution: {weighted_contribution:.3f})"
        )

    report_lines.extend([
        "",
        "="*70,
        "ASSESSMENT SUMMARY",
        "="*70,
        ""
    ])

    if strengths:
        report_lines.append("Top Strengths:")
        for dim in strengths:
            report_lines.append(f"  • {dim}: {scores[dim]:.2f}/5.00")
        report_lines.append("")

    if weaknesses:
        report_lines.append("Areas for Improvement:")
        for dim in weaknesses:
            report_lines.append(f"  • {dim}: {scores[dim]:.2f}/5.00")
        report_lines.append("")

    # Add recommendations based on score
    report_lines.extend([
        "="*70,
        "RECOMMENDATIONS",
        "="*70,
        ""
    ])

    if overall_score >= 4.5:
        report_lines.append("  Excellent work! Ready for submission to top-tier venues.")
    elif overall_score >= 4.0:
        report_lines.append("  Strong work. Address minor issues identified in weaknesses.")
    elif overall_score >= 3.5:
        report_lines.append("  Good foundation. Focus on major revisions in weak dimensions.")
    elif overall_score >= 3.0:
        report_lines.append("  Significant revisions needed. Prioritize weakest dimensions.")
    elif overall_score >= 2.0:
        report_lines.append("  Major rework required. Consider restructuring approach.")
    else:
        report_lines.append("  Fundamental revision needed across multiple dimensions.")

    report_lines.append("")
    report_lines.append("="*70)

    report = '\n'.join(report_lines)

    # Write to file if specified
    if output_file:
        try:
            with open(output_file, 'w') as f:
                f.write(report)
            print(f"\nReport saved to: {output_file}")
        except IOError as e:
            print(f"Error writing to {output_file}: {e}")

    return report


def interactive_mode():
    """Run interactive score entry mode."""
    print("ScholarEval Interactive Score Calculator")
    print("="*50)
    print("\nEnter scores for each dimension (1-5):")
    print("(Press Enter to skip a dimension)\n")

    scores = {}
    dimensions = [
        "problem_formulation",
        "literature_review",
        "methodology",
        "data_collection",
        "analysis",
        "results",
        "writing",
        "citations"
    ]

    for dim in dimensions:
        while True:
            dim_display = dim.replace('_', ' ').title()
            user_input = input(f"{dim_display}: ").strip()

            if not user_input:
                break

            try:
                score = float(user_input)
                if 1 <= score <= 5:
                    scores[dim] = score
                    break
                else:
                    print("  Score must be between 1 and 5")
            except ValueError:
                print("  Invalid input. Please enter a number between 1 and 5")

    if not scores:
        print("\nNo scores entered. Exiting.")
        return

    print("\n" + "="*50)
    print("SCORES ENTERED:")
    for dim, score in scores.items():
        print(f"  {dim.replace('_', ' ').title()}: {score}")

    print("\nCalculating overall assessment...\n")

    report = generate_report(scores, DEFAULT_WEIGHTS)
    print(report)

    # Ask if user wants to save
    save = input("\nSave report to file? (y/n): ").strip().lower()
    if save == 'y':
        filename = input("Enter filename [scholareval_report.txt]: ").strip()
        if not filename:
            filename = "scholareval_report.txt"
        generate_report(scores, DEFAULT_WEIGHTS, Path(filename))


def main():
    parser = argparse.ArgumentParser(
        description="Calculate aggregate ScholarEval scores from dimension ratings",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Calculate from JSON file
  python calculate_scores.py --scores my_scores.json

  # Calculate with custom weights
  python calculate_scores.py --scores my_scores.json --weights custom_weights.json

  # Save report to file
  python calculate_scores.py --scores my_scores.json --output report.txt

  # Interactive mode
  python calculate_scores.py --interactive

Score JSON Format:
  {
    "problem_formulation": 4.5,
    "literature_review": 4.0,
    "methodology": 3.5,
    "data_collection": 4.0,
    "analysis": 3.5,
    "results": 4.0,
    "writing": 4.5,
    "citations": 4.0
  }

Weights JSON Format:
  {
    "problem_formulation": 0.15,
    "literature_review": 0.15,
    "methodology": 0.20,
    "data_collection": 0.10,
    "analysis": 0.15,
    "results": 0.10,
    "writing": 0.10,
    "citations": 0.05
  }
        """
    )

    parser.add_argument('--scores', type=Path, help='Path to JSON file with dimension scores')
    parser.add_argument('--weights', type=Path, help='Path to JSON file with dimension weights (optional)')
    parser.add_argument('--output', type=Path, help='Path to output report file (optional)')
    parser.add_argument('--interactive', '-i', action='store_true', help='Run in interactive mode')

    args = parser.parse_args()

    # Interactive mode
    if args.interactive:
        interactive_mode()
        return

    # File mode
    if not args.scores:
        parser.print_help()
        print("\nError: --scores is required (or use --interactive)")
        sys.exit(1)

    scores = load_scores(args.scores)
    weights = load_weights(args.weights)

    report = generate_report(scores, weights, args.output)

    # Print to stdout if no output file specified
    if not args.output:
        print(report)


if __name__ == '__main__':
    main()
