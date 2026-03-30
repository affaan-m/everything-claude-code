#!/usr/bin/env python3
"""
Anonymize DICOM files by removing or replacing Protected Health Information (PHI).

Usage:
    python anonymize_dicom.py input.dcm output.dcm
    python anonymize_dicom.py input.dcm output.dcm --patient-id ANON001
"""

import argparse
import sys
from pathlib import Path

try:
    import pydicom
except ImportError:
    print("Error: pydicom is not installed. Install it with: pip install pydicom")
    sys.exit(1)


# Tags commonly containing PHI (Protected Health Information)
PHI_TAGS = [
    'PatientName', 'PatientID', 'PatientBirthDate', 'PatientBirthTime',
    'PatientSex', 'PatientAge', 'PatientSize', 'PatientWeight',
    'PatientAddress', 'PatientTelephoneNumbers', 'PatientMotherBirthName',
    'MilitaryRank', 'EthnicGroup', 'Occupation', 'PatientComments',
    'InstitutionName', 'InstitutionAddress', 'InstitutionalDepartmentName',
    'ReferringPhysicianName', 'ReferringPhysicianAddress',
    'ReferringPhysicianTelephoneNumbers', 'ReferringPhysicianIdentificationSequence',
    'PerformingPhysicianName', 'PerformingPhysicianIdentificationSequence',
    'OperatorsName', 'PhysiciansOfRecord', 'PhysiciansOfRecordIdentificationSequence',
    'NameOfPhysiciansReadingStudy', 'PhysiciansReadingStudyIdentificationSequence',
    'StudyDescription', 'SeriesDescription', 'AdmittingDiagnosesDescription',
    'DerivationDescription', 'RequestingPhysician', 'RequestingService',
    'RequestedProcedureDescription', 'ScheduledPerformingPhysicianName',
    'PerformedLocation', 'PerformedStationName',
]


def anonymize_dicom(input_path, output_path, patient_id='ANONYMOUS', patient_name='ANONYMOUS'):
    """
    Anonymize a DICOM file by removing or replacing PHI.

    Args:
        input_path: Path to input DICOM file
        output_path: Path to output anonymized DICOM file
        patient_id: Replacement patient ID (default: 'ANONYMOUS')
        patient_name: Replacement patient name (default: 'ANONYMOUS')
    """
    try:
        # Read DICOM file
        ds = pydicom.dcmread(input_path)

        # Track what was anonymized
        anonymized = []

        # Remove or replace sensitive data
        for tag in PHI_TAGS:
            if hasattr(ds, tag):
                if tag == 'PatientName':
                    ds.PatientName = patient_name
                    anonymized.append(f"{tag}: replaced with '{patient_name}'")
                elif tag == 'PatientID':
                    ds.PatientID = patient_id
                    anonymized.append(f"{tag}: replaced with '{patient_id}'")
                elif tag == 'PatientBirthDate':
                    ds.PatientBirthDate = '19000101'
                    anonymized.append(f"{tag}: replaced with '19000101'")
                else:
                    delattr(ds, tag)
                    anonymized.append(f"{tag}: removed")

        # Anonymize UIDs if present (optional - maintains referential integrity)
        # Uncomment if you want to anonymize UIDs as well
        # if hasattr(ds, 'StudyInstanceUID'):
        #     ds.StudyInstanceUID = pydicom.uid.generate_uid()
        # if hasattr(ds, 'SeriesInstanceUID'):
        #     ds.SeriesInstanceUID = pydicom.uid.generate_uid()
        # if hasattr(ds, 'SOPInstanceUID'):
        #     ds.SOPInstanceUID = pydicom.uid.generate_uid()

        # Save anonymized file
        ds.save_as(output_path)

        return True, anonymized

    except Exception as e:
        return False, str(e)


def main():
    parser = argparse.ArgumentParser(
        description='Anonymize DICOM files by removing or replacing PHI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python anonymize_dicom.py input.dcm output.dcm
  python anonymize_dicom.py input.dcm output.dcm --patient-id ANON001
  python anonymize_dicom.py input.dcm output.dcm --patient-id ANON001 --patient-name "Anonymous^Patient"
        """
    )

    parser.add_argument('input', type=str, help='Input DICOM file')
    parser.add_argument('output', type=str, help='Output anonymized DICOM file')
    parser.add_argument('--patient-id', type=str, default='ANONYMOUS',
                       help='Replacement patient ID (default: ANONYMOUS)')
    parser.add_argument('--patient-name', type=str, default='ANONYMOUS',
                       help='Replacement patient name (default: ANONYMOUS)')
    parser.add_argument('-v', '--verbose', action='store_true',
                       help='Show detailed anonymization information')

    args = parser.parse_args()

    # Validate input file exists
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file '{args.input}' not found")
        sys.exit(1)

    # Anonymize the file
    print(f"Anonymizing: {args.input}")
    success, result = anonymize_dicom(args.input, args.output,
                                     args.patient_id, args.patient_name)

    if success:
        print(f"✓ Successfully anonymized DICOM file: {args.output}")
        if args.verbose:
            print(f"\nAnonymized {len(result)} fields:")
            for item in result:
                print(f"  - {item}")
    else:
        print(f"✗ Error: {result}")
        sys.exit(1)


if __name__ == '__main__':
    main()
