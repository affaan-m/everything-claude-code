#!/usr/bin/env python3
"""
deepTools File Validation Script

Validates BAM, bigWig, and BED files for deepTools analysis.
Checks for file existence, proper indexing, and basic format requirements.
"""

import os
import sys
import argparse
from pathlib import Path


def check_file_exists(filepath):
    """Check if file exists and is readable."""
    if not os.path.exists(filepath):
        return False, f"File not found: {filepath}"
    if not os.access(filepath, os.R_OK):
        return False, f"File not readable: {filepath}"
    return True, f"✓ File exists: {filepath}"


def check_bam_index(bam_file):
    """Check if BAM file has an index (.bai or .bam.bai)."""
    bai_file1 = bam_file + ".bai"
    bai_file2 = bam_file.replace(".bam", ".bai")

    if os.path.exists(bai_file1):
        return True, f"✓ BAM index found: {bai_file1}"
    elif os.path.exists(bai_file2):
        return True, f"✓ BAM index found: {bai_file2}"
    else:
        return False, f"✗ BAM index missing for: {bam_file}\n  Run: samtools index {bam_file}"


def check_bigwig_file(bw_file):
    """Basic check for bigWig file."""
    # Check file size (bigWig files should have reasonable size)
    file_size = os.path.getsize(bw_file)
    if file_size < 100:
        return False, f"✗ bigWig file suspiciously small: {bw_file} ({file_size} bytes)"
    return True, f"✓ bigWig file appears valid: {bw_file} ({file_size} bytes)"


def check_bed_file(bed_file):
    """Basic validation of BED file format."""
    try:
        with open(bed_file, 'r') as f:
            lines = [line.strip() for line in f if line.strip() and not line.startswith('#')]

        if len(lines) == 0:
            return False, f"✗ BED file is empty: {bed_file}"

        # Check first few lines for basic format
        for i, line in enumerate(lines[:10], 1):
            fields = line.split('\t')
            if len(fields) < 3:
                return False, f"✗ BED file format error at line {i}: expected at least 3 columns\n  Line: {line}"

            # Check if start and end are integers
            try:
                start = int(fields[1])
                end = int(fields[2])
                if start >= end:
                    return False, f"✗ BED file error at line {i}: start >= end ({start} >= {end})"
            except ValueError:
                return False, f"✗ BED file format error at line {i}: start and end must be integers\n  Line: {line}"

        return True, f"✓ BED file format appears valid: {bed_file} ({len(lines)} regions)"

    except Exception as e:
        return False, f"✗ Error reading BED file: {bed_file}\n  Error: {str(e)}"


def validate_files(bam_files=None, bigwig_files=None, bed_files=None):
    """
    Validate all provided files.

    Args:
        bam_files: List of BAM file paths
        bigwig_files: List of bigWig file paths
        bed_files: List of BED file paths

    Returns:
        Tuple of (success: bool, messages: list)
    """
    all_success = True
    messages = []

    # Validate BAM files
    if bam_files:
        messages.append("\n=== Validating BAM Files ===")
        for bam_file in bam_files:
            # Check existence
            success, msg = check_file_exists(bam_file)
            messages.append(msg)
            if not success:
                all_success = False
                continue

            # Check index
            success, msg = check_bam_index(bam_file)
            messages.append(msg)
            if not success:
                all_success = False

    # Validate bigWig files
    if bigwig_files:
        messages.append("\n=== Validating bigWig Files ===")
        for bw_file in bigwig_files:
            # Check existence
            success, msg = check_file_exists(bw_file)
            messages.append(msg)
            if not success:
                all_success = False
                continue

            # Basic bigWig check
            success, msg = check_bigwig_file(bw_file)
            messages.append(msg)
            if not success:
                all_success = False

    # Validate BED files
    if bed_files:
        messages.append("\n=== Validating BED Files ===")
        for bed_file in bed_files:
            # Check existence
            success, msg = check_file_exists(bed_file)
            messages.append(msg)
            if not success:
                all_success = False
                continue

            # Check BED format
            success, msg = check_bed_file(bed_file)
            messages.append(msg)
            if not success:
                all_success = False

    return all_success, messages


def main():
    parser = argparse.ArgumentParser(
        description="Validate files for deepTools analysis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Validate BAM files
  python validate_files.py --bam sample1.bam sample2.bam

  # Validate all file types
  python validate_files.py --bam input.bam chip.bam --bed peaks.bed --bigwig signal.bw

  # Validate from a directory
  python validate_files.py --bam *.bam --bed *.bed
        """
    )

    parser.add_argument('--bam', nargs='+', help='BAM files to validate')
    parser.add_argument('--bigwig', '--bw', nargs='+', help='bigWig files to validate')
    parser.add_argument('--bed', nargs='+', help='BED files to validate')

    args = parser.parse_args()

    # Check if any files were provided
    if not any([args.bam, args.bigwig, args.bed]):
        parser.print_help()
        sys.exit(1)

    # Run validation
    success, messages = validate_files(
        bam_files=args.bam,
        bigwig_files=args.bigwig,
        bed_files=args.bed
    )

    # Print results
    for msg in messages:
        print(msg)

    # Summary
    print("\n" + "="*50)
    if success:
        print("✓ All validations passed!")
        sys.exit(0)
    else:
        print("✗ Some validations failed. Please fix the issues above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
