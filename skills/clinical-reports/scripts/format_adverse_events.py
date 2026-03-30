#!/usr/bin/env python3
"""
Format adverse event data into tables for clinical trial reports.

Converts CSV or structured data into formatted AE summary tables.

Usage:
    python format_adverse_events.py <ae_data.csv>
"""

import argparse
import csv
from collections import defaultdict
from pathlib import Path


def format_ae_summary_table(data: list) -> str:
    """Generate AE summary table in markdown format."""
    # Group by treatment arm
    arm_stats = defaultdict(lambda: {
        'total': 0,
        'any_ae': 0,
        'related_ae': 0,
        'sae': 0,
        'deaths': 0,
        'discontinuations': 0
    })
    
    for row in data:
        arm = row.get('treatment_arm', 'Unknown')
        arm_stats[arm]['total'] += 1
        
        if row.get('any_ae', '').lower() == 'yes':
            arm_stats[arm]['any_ae'] += 1
        if row.get('related', '').lower() == 'yes':
            arm_stats[arm]['related_ae'] += 1
        if row.get('serious', '').lower() == 'yes':
            arm_stats[arm]['sae'] += 1
        if row.get('fatal', '').lower() == 'yes':
            arm_stats[arm]['deaths'] += 1
        if row.get('discontinuation', '').lower() == 'yes':
            arm_stats[arm]['discontinuations'] += 1
    
    # Generate table
    table = "| Category | " + " | ".join(arm_stats.keys()) + " |\n"
    table += "|----------|" + "|".join(["--------"] * len(arm_stats)) + "|\n"
    
    categories = [
        ('Total N', 'total'),
        ('Any AE', 'any_ae'),
        ('Treatment-related AE', 'related_ae'),
        ('Serious AE', 'sae'),
        ('Deaths', 'deaths'),
        ('Discontinuation due to AE', 'discontinuations')
    ]
    
    for cat_name, cat_key in categories:
        row_data = [cat_name]
        for arm_data in arm_stats.values():
            count = arm_data[cat_key]
            total = arm_data['total']
            pct = (count / total * 100) if total > 0 and cat_key != 'total' else 0
            value = f"{count}" if cat_key == 'total' else f"{count} ({pct:.1f}%)"
            row_data.append(value)
        table += "| " + " | ".join(row_data) + " |\n"
    
    return table


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Format AE data into tables")
    parser.add_argument("input_file", help="Path to AE data CSV")
    parser.add_argument("--output", "-o", help="Output markdown file")
    
    args = parser.parse_args()
    
    try:
        with open(args.input_file, 'r') as f:
            reader = csv.DictReader(f)
            data = list(reader)
        
        table = format_ae_summary_table(data)
        
        if args.output:
            with open(args.output, 'w') as f:
                f.write(table)
            print(f"✓ Table saved to: {args.output}")
        else:
            print("\nAdverse Events Summary Table:\n")
            print(table)
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())

