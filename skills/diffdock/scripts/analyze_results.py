#!/usr/bin/env python3
"""
DiffDock Results Analysis Script

This script analyzes DiffDock prediction results, extracting confidence scores,
ranking predictions, and generating summary reports.

Usage:
    python analyze_results.py results/output_dir/
    python analyze_results.py results/ --top 50 --threshold 0.0
    python analyze_results.py results/ --export summary.csv
"""

import argparse
import os
import sys
import json
from pathlib import Path
from collections import defaultdict
import re


def parse_confidence_scores(results_dir):
    """
    Parse confidence scores from DiffDock output directory.

    Args:
        results_dir: Path to DiffDock results directory

    Returns:
        dict: Dictionary mapping complex names to their predictions and scores
    """
    results = {}
    results_path = Path(results_dir)

    # Check if this is a single complex or batch results
    sdf_files = list(results_path.glob("*.sdf"))

    if sdf_files:
        # Single complex output
        results['single_complex'] = parse_single_complex(results_path)
    else:
        # Batch output - multiple subdirectories
        for subdir in results_path.iterdir():
            if subdir.is_dir():
                complex_results = parse_single_complex(subdir)
                if complex_results:
                    results[subdir.name] = complex_results

    return results


def parse_single_complex(complex_dir):
    """Parse results for a single complex."""
    predictions = []

    # Look for SDF files with rank information
    for sdf_file in complex_dir.glob("*.sdf"):
        filename = sdf_file.name

        # Extract rank from filename (e.g., "rank_1.sdf" or "index_0_rank_1.sdf")
        rank_match = re.search(r'rank_(\d+)', filename)
        if rank_match:
            rank = int(rank_match.group(1))

            # Try to extract confidence score from filename or separate file
            confidence = extract_confidence_score(sdf_file, complex_dir)

            predictions.append({
                'rank': rank,
                'file': sdf_file.name,
                'path': str(sdf_file),
                'confidence': confidence
            })

    # Sort by rank
    predictions.sort(key=lambda x: x['rank'])

    return {'predictions': predictions} if predictions else None


def extract_confidence_score(sdf_file, complex_dir):
    """
    Extract confidence score for a prediction.

    Tries multiple methods:
    1. Read from confidence_scores.txt file
    2. Parse from SDF file properties
    3. Extract from filename if present
    """
    # Method 1: confidence_scores.txt
    confidence_file = complex_dir / "confidence_scores.txt"
    if confidence_file.exists():
        try:
            with open(confidence_file) as f:
                lines = f.readlines()
                # Extract rank from filename
                rank_match = re.search(r'rank_(\d+)', sdf_file.name)
                if rank_match:
                    rank = int(rank_match.group(1))
                    if rank <= len(lines):
                        return float(lines[rank - 1].strip())
        except Exception:
            pass

    # Method 2: Parse from SDF file
    try:
        with open(sdf_file) as f:
            content = f.read()
            # Look for confidence score in SDF properties
            conf_match = re.search(r'confidence[:\s]+(-?\d+\.?\d*)', content, re.IGNORECASE)
            if conf_match:
                return float(conf_match.group(1))
    except Exception:
        pass

    # Method 3: Filename (e.g., "rank_1_conf_0.95.sdf")
    conf_match = re.search(r'conf_(-?\d+\.?\d*)', sdf_file.name)
    if conf_match:
        return float(conf_match.group(1))

    return None


def classify_confidence(score):
    """Classify confidence score into categories."""
    if score is None:
        return "Unknown"
    elif score > 0:
        return "High"
    elif score > -1.5:
        return "Moderate"
    else:
        return "Low"


def print_summary(results, top_n=None, min_confidence=None):
    """Print a formatted summary of results."""

    print("\n" + "="*80)
    print("DiffDock Results Summary")
    print("="*80)

    all_predictions = []

    for complex_name, data in results.items():
        predictions = data.get('predictions', [])

        print(f"\n{complex_name}")
        print("-" * 80)

        if not predictions:
            print("  No predictions found")
            continue

        # Filter by confidence if specified
        filtered_predictions = predictions
        if min_confidence is not None:
            filtered_predictions = [p for p in predictions if p['confidence'] is not None and p['confidence'] >= min_confidence]

        # Limit to top N if specified
        if top_n is not None:
            filtered_predictions = filtered_predictions[:top_n]

        for pred in filtered_predictions:
            confidence = pred['confidence']
            confidence_class = classify_confidence(confidence)

            conf_str = f"{confidence:>7.3f}" if confidence is not None else "   N/A"
            print(f"  Rank {pred['rank']:2d}: Confidence = {conf_str} ({confidence_class:8s}) | {pred['file']}")

            # Add to all predictions for overall statistics
            if confidence is not None:
                all_predictions.append((complex_name, pred['rank'], confidence))

        # Show statistics for this complex
        if filtered_predictions and any(p['confidence'] is not None for p in filtered_predictions):
            confidences = [p['confidence'] for p in filtered_predictions if p['confidence'] is not None]
            print(f"\n  Statistics: {len(filtered_predictions)} predictions")
            print(f"    Mean confidence: {sum(confidences)/len(confidences):.3f}")
            print(f"    Max confidence:  {max(confidences):.3f}")
            print(f"    Min confidence:  {min(confidences):.3f}")

    # Overall statistics
    if all_predictions:
        print("\n" + "="*80)
        print("Overall Statistics")
        print("="*80)

        confidences = [conf for _, _, conf in all_predictions]
        print(f"  Total predictions:    {len(all_predictions)}")
        print(f"  Total complexes:      {len(results)}")
        print(f"  Mean confidence:      {sum(confidences)/len(confidences):.3f}")
        print(f"  Max confidence:       {max(confidences):.3f}")
        print(f"  Min confidence:       {min(confidences):.3f}")

        # Confidence distribution
        high = sum(1 for c in confidences if c > 0)
        moderate = sum(1 for c in confidences if -1.5 < c <= 0)
        low = sum(1 for c in confidences if c <= -1.5)

        print(f"\n  Confidence distribution:")
        print(f"    High (> 0):          {high:4d} ({100*high/len(confidences):5.1f}%)")
        print(f"    Moderate (-1.5 to 0): {moderate:4d} ({100*moderate/len(confidences):5.1f}%)")
        print(f"    Low (< -1.5):        {low:4d} ({100*low/len(confidences):5.1f}%)")

    print("\n" + "="*80)


def export_to_csv(results, output_path):
    """Export results to CSV file."""
    import csv

    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['complex_name', 'rank', 'confidence', 'confidence_class', 'file_path'])

        for complex_name, data in results.items():
            predictions = data.get('predictions', [])
            for pred in predictions:
                confidence = pred['confidence']
                confidence_class = classify_confidence(confidence)
                conf_value = confidence if confidence is not None else ''

                writer.writerow([
                    complex_name,
                    pred['rank'],
                    conf_value,
                    confidence_class,
                    pred['path']
                ])

    print(f"✓ Exported results to: {output_path}")


def get_top_predictions(results, n=10, sort_by='confidence'):
    """Get top N predictions across all complexes."""
    all_predictions = []

    for complex_name, data in results.items():
        predictions = data.get('predictions', [])
        for pred in predictions:
            if pred['confidence'] is not None:
                all_predictions.append({
                    'complex': complex_name,
                    **pred
                })

    # Sort by confidence (descending)
    all_predictions.sort(key=lambda x: x['confidence'], reverse=True)

    return all_predictions[:n]


def print_top_predictions(results, n=10):
    """Print top N predictions across all complexes."""
    top_preds = get_top_predictions(results, n)

    print("\n" + "="*80)
    print(f"Top {n} Predictions Across All Complexes")
    print("="*80)

    for i, pred in enumerate(top_preds, 1):
        confidence_class = classify_confidence(pred['confidence'])
        print(f"{i:2d}. {pred['complex']:30s} | Rank {pred['rank']:2d} | "
              f"Confidence: {pred['confidence']:7.3f} ({confidence_class})")

    print("="*80)


def main():
    parser = argparse.ArgumentParser(
        description='Analyze DiffDock prediction results',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Analyze all results in directory
  python analyze_results.py results/output_dir/

  # Show only top 5 predictions per complex
  python analyze_results.py results/ --top 5

  # Filter by confidence threshold
  python analyze_results.py results/ --threshold 0.0

  # Export to CSV
  python analyze_results.py results/ --export summary.csv

  # Show top 20 predictions across all complexes
  python analyze_results.py results/ --best 20
        """
    )

    parser.add_argument('results_dir', help='Path to DiffDock results directory')
    parser.add_argument('--top', '-t', type=int,
                        help='Show only top N predictions per complex')
    parser.add_argument('--threshold', type=float,
                        help='Minimum confidence threshold')
    parser.add_argument('--export', '-e', metavar='FILE',
                        help='Export results to CSV file')
    parser.add_argument('--best', '-b', type=int, metavar='N',
                        help='Show top N predictions across all complexes')

    args = parser.parse_args()

    # Validate results directory
    if not os.path.exists(args.results_dir):
        print(f"Error: Results directory not found: {args.results_dir}")
        return 1

    # Parse results
    print(f"Analyzing results in: {args.results_dir}")
    results = parse_confidence_scores(args.results_dir)

    if not results:
        print("No DiffDock results found in directory")
        return 1

    # Print summary
    print_summary(results, top_n=args.top, min_confidence=args.threshold)

    # Print top predictions across all complexes
    if args.best:
        print_top_predictions(results, args.best)

    # Export to CSV if requested
    if args.export:
        export_to_csv(results, args.export)

    return 0


if __name__ == '__main__':
    sys.exit(main())
