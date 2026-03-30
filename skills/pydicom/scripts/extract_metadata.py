#!/usr/bin/env python3
"""
Extract and display DICOM metadata in a readable format.

Usage:
    python extract_metadata.py file.dcm
    python extract_metadata.py file.dcm --output metadata.txt
    python extract_metadata.py file.dcm --format json --output metadata.json
"""

import argparse
import sys
import json
from pathlib import Path

try:
    import pydicom
except ImportError:
    print("Error: pydicom is not installed. Install it with: pip install pydicom")
    sys.exit(1)


def format_value(value):
    """Format DICOM values for display."""
    if isinstance(value, bytes):
        try:
            return value.decode('utf-8', errors='ignore')
        except:
            return str(value)
    elif isinstance(value, pydicom.multival.MultiValue):
        return ', '.join(str(v) for v in value)
    elif isinstance(value, pydicom.sequence.Sequence):
        return f"Sequence with {len(value)} item(s)"
    else:
        return str(value)


def extract_metadata_text(ds, show_sequences=False):
    """Extract metadata as formatted text."""
    lines = []
    lines.append("=" * 80)
    lines.append("DICOM Metadata")
    lines.append("=" * 80)

    # File Meta Information
    if hasattr(ds, 'file_meta'):
        lines.append("\n[File Meta Information]")
        for elem in ds.file_meta:
            lines.append(f"{elem.name:40s} {format_value(elem.value)}")

    # Patient Information
    lines.append("\n[Patient Information]")
    patient_tags = ['PatientName', 'PatientID', 'PatientBirthDate',
                   'PatientSex', 'PatientAge', 'PatientWeight']
    for tag in patient_tags:
        if hasattr(ds, tag):
            value = getattr(ds, tag)
            lines.append(f"{tag:40s} {format_value(value)}")

    # Study Information
    lines.append("\n[Study Information]")
    study_tags = ['StudyInstanceUID', 'StudyDate', 'StudyTime',
                 'StudyDescription', 'AccessionNumber', 'StudyID']
    for tag in study_tags:
        if hasattr(ds, tag):
            value = getattr(ds, tag)
            lines.append(f"{tag:40s} {format_value(value)}")

    # Series Information
    lines.append("\n[Series Information]")
    series_tags = ['SeriesInstanceUID', 'SeriesNumber', 'SeriesDescription',
                  'Modality', 'SeriesDate', 'SeriesTime']
    for tag in series_tags:
        if hasattr(ds, tag):
            value = getattr(ds, tag)
            lines.append(f"{tag:40s} {format_value(value)}")

    # Image Information
    lines.append("\n[Image Information]")
    image_tags = ['SOPInstanceUID', 'InstanceNumber', 'ImageType',
                 'Rows', 'Columns', 'BitsAllocated', 'BitsStored',
                 'PhotometricInterpretation', 'SamplesPerPixel',
                 'PixelSpacing', 'SliceThickness', 'ImagePositionPatient',
                 'ImageOrientationPatient', 'WindowCenter', 'WindowWidth']
    for tag in image_tags:
        if hasattr(ds, tag):
            value = getattr(ds, tag)
            lines.append(f"{tag:40s} {format_value(value)}")

    # All other elements
    if show_sequences:
        lines.append("\n[All Elements]")
        for elem in ds:
            if elem.VR != 'SQ':  # Skip sequences for brevity
                lines.append(f"{elem.name:40s} {format_value(elem.value)}")
            else:
                lines.append(f"{elem.name:40s} {format_value(elem.value)}")

    return '\n'.join(lines)


def extract_metadata_json(ds):
    """Extract metadata as JSON."""
    metadata = {}

    # File Meta Information
    if hasattr(ds, 'file_meta'):
        metadata['file_meta'] = {}
        for elem in ds.file_meta:
            metadata['file_meta'][elem.keyword] = format_value(elem.value)

    # All data elements (excluding sequences for simplicity)
    metadata['dataset'] = {}
    for elem in ds:
        if elem.VR != 'SQ':
            metadata['dataset'][elem.keyword] = format_value(elem.value)

    return json.dumps(metadata, indent=2)


def main():
    parser = argparse.ArgumentParser(
        description='Extract and display DICOM metadata',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python extract_metadata.py file.dcm
  python extract_metadata.py file.dcm --output metadata.txt
  python extract_metadata.py file.dcm --format json --output metadata.json
  python extract_metadata.py file.dcm --show-sequences
        """
    )

    parser.add_argument('input', type=str, help='Input DICOM file')
    parser.add_argument('--output', '-o', type=str, help='Output file (default: print to console)')
    parser.add_argument('--format', type=str, choices=['text', 'json'], default='text',
                       help='Output format (default: text)')
    parser.add_argument('--show-sequences', action='store_true',
                       help='Include all data elements including sequences')

    args = parser.parse_args()

    # Validate input file exists
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file '{args.input}' not found")
        sys.exit(1)

    try:
        # Read DICOM file
        ds = pydicom.dcmread(args.input)

        # Extract metadata
        if args.format == 'json':
            output = extract_metadata_json(ds)
        else:
            output = extract_metadata_text(ds, args.show_sequences)

        # Write or print output
        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"✓ Metadata extracted to: {args.output}")
        else:
            print(output)

    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
