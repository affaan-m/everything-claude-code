#!/usr/bin/env python3
"""
Extract structured clinical data from reports.

Usage:
    python extract_clinical_data.py <report_file>
"""

import argparse
import json
import re


def extract_vital_signs(content: str) -> dict:
    """Extract vital signs."""
    vitals = {}
    patterns = {
        "temperature": r"(?i)temp(?:erature)?[:]\s*([\d.]+)\s*°?F",
        "bp": r"(?i)BP[:]\s*(\d+/\d+)",
        "hr": r"(?i)HR[:]\s*(\d+)",
        "rr": r"(?i)RR[:]\s*(\d+)",
        "spo2": r"(?i)SpO2[:]\s*([\d.]+)%",
    }
    
    for vital, pattern in patterns.items():
        match = re.search(pattern, content)
        if match:
            vitals[vital] = match.group(1)
    
    return vitals


def extract_demographics(content: str) -> dict:
    """Extract patient demographics."""
    demographics = {}
    patterns = {
        "age": r"(?i)(\d+)[\s-]year[\s-]old",
        "sex": r"(?i)(male|female|M|F)",
    }
    
    for demo, pattern in patterns.items():
        match = re.search(pattern, content)
        if match:
            demographics[demo] = match.group(1)
    
    return demographics


def extract_medications(content: str) -> list:
    """Extract medication list."""
    meds = []
    # Simple pattern for common medication format
    pattern = r"(?i)(\w+)\s+(\d+\s*mg)\s+(PO|IV|SC)\s+(daily|BID|TID|QID)"
    matches = re.findall(pattern, content)
    
    for match in matches:
        meds.append({
            "drug": match[0],
            "dose": match[1],
            "route": match[2],
            "frequency": match[3]
        })
    
    return meds


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Extract clinical data")
    parser.add_argument("input_file", help="Path to clinical report")
    parser.add_argument("--output", "-o", help="Output JSON file")
    
    args = parser.parse_args()
    
    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        extracted_data = {
            "demographics": extract_demographics(content),
            "vital_signs": extract_vital_signs(content),
            "medications": extract_medications(content),
        }
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(extracted_data, f, indent=2)
            print(f"✓ Data extracted to: {args.output}")
        else:
            print(json.dumps(extracted_data, indent=2))
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())

