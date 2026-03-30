#!/usr/bin/env python3
"""
COSMIC Data Download Utility

This script provides functions to download data from the COSMIC database
(Catalogue of Somatic Mutations in Cancer).

Usage:
    from download_cosmic import download_cosmic_file, list_available_files

    # Download a specific file
    download_cosmic_file(
        email="user@example.com",
        password="password",
        filepath="GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz",
        output_filename="mutations.tsv.gz"
    )

Requirements:
    - requests library: pip install requests
    - Valid COSMIC account credentials (register at cancer.sanger.ac.uk/cosmic)
"""

import requests
import sys
import os
from typing import Optional


def download_cosmic_file(
    email: str,
    password: str,
    filepath: str,
    output_filename: Optional[str] = None,
    genome_assembly: str = "GRCh38"
) -> bool:
    """
    Download a file from COSMIC database.

    Args:
        email: COSMIC account email
        password: COSMIC account password
        filepath: Relative path to file (e.g., "GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz")
        output_filename: Optional custom output filename (default: last part of filepath)
        genome_assembly: Genome assembly version (GRCh37 or GRCh38, default: GRCh38)

    Returns:
        True if download successful, False otherwise

    Example:
        download_cosmic_file(
            "user@email.com",
            "pass123",
            "GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz"
        )
    """
    base_url = "https://cancer.sanger.ac.uk/cosmic/file_download/"

    # Determine output filename
    if output_filename is None:
        output_filename = os.path.basename(filepath)

    try:
        # Step 1: Get the download URL
        print(f"Requesting download URL for: {filepath}")
        r = requests.get(
            base_url + filepath,
            auth=(email, password),
            timeout=30
        )

        if r.status_code == 401:
            print("ERROR: Authentication failed. Check email and password.")
            return False
        elif r.status_code == 404:
            print(f"ERROR: File not found: {filepath}")
            return False
        elif r.status_code != 200:
            print(f"ERROR: Request failed with status code {r.status_code}")
            print(f"Response: {r.text}")
            return False

        # Parse response to get download URL
        response_data = r.json()
        download_url = response_data.get("url")

        if not download_url:
            print("ERROR: No download URL in response")
            return False

        # Step 2: Download the file
        print(f"Downloading file from: {download_url}")
        file_response = requests.get(download_url, stream=True, timeout=300)

        if file_response.status_code != 200:
            print(f"ERROR: Download failed with status code {file_response.status_code}")
            return False

        # Step 3: Write to disk
        print(f"Saving to: {output_filename}")
        total_size = int(file_response.headers.get('content-length', 0))

        with open(output_filename, 'wb') as f:
            if total_size == 0:
                f.write(file_response.content)
            else:
                downloaded = 0
                for chunk in file_response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        # Show progress
                        progress = (downloaded / total_size) * 100
                        print(f"\rProgress: {progress:.1f}%", end='', flush=True)
                print()  # New line after progress

        print(f"✓ Successfully downloaded: {output_filename}")
        return True

    except requests.exceptions.Timeout:
        print("ERROR: Request timed out")
        return False
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Request failed: {e}")
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        return False


def get_common_file_path(
    data_type: str,
    genome_assembly: str = "GRCh38",
    version: str = "latest"
) -> Optional[str]:
    """
    Get the filepath for common COSMIC data files.

    Args:
        data_type: Type of data (e.g., 'mutations', 'gene_census', 'signatures')
        genome_assembly: GRCh37 or GRCh38
        version: COSMIC version (use 'latest' for most recent)

    Returns:
        Filepath string or None if type unknown
    """
    common_files = {
        'mutations': f'{genome_assembly}/cosmic/{version}/CosmicMutantExport.tsv.gz',
        'mutations_vcf': f'{genome_assembly}/cosmic/{version}/VCF/CosmicCodingMuts.vcf.gz',
        'gene_census': f'{genome_assembly}/cosmic/{version}/cancer_gene_census.csv',
        'resistance_mutations': f'{genome_assembly}/cosmic/{version}/CosmicResistanceMutations.tsv.gz',
        'structural_variants': f'{genome_assembly}/cosmic/{version}/CosmicStructExport.tsv.gz',
        'gene_expression': f'{genome_assembly}/cosmic/{version}/CosmicCompleteGeneExpression.tsv.gz',
        'copy_number': f'{genome_assembly}/cosmic/{version}/CosmicCompleteCNA.tsv.gz',
        'fusion_genes': f'{genome_assembly}/cosmic/{version}/CosmicFusionExport.tsv.gz',
        'signatures': f'signatures/signatures.tsv',
        'sample_info': f'{genome_assembly}/cosmic/{version}/CosmicSample.tsv.gz',
    }

    return common_files.get(data_type)


def main():
    """Command-line interface for downloading COSMIC files."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Download files from COSMIC database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Download mutations file
  %(prog)s user@email.com --filepath GRCh38/cosmic/latest/CosmicMutantExport.tsv.gz

  # Download using shorthand
  %(prog)s user@email.com --data-type mutations

  # Download for GRCh37
  %(prog)s user@email.com --data-type gene_census --assembly GRCh37
        """
    )

    parser.add_argument('email', help='COSMIC account email')
    parser.add_argument('--password', help='COSMIC account password (will prompt if not provided)')
    parser.add_argument('--filepath', help='Full filepath to download')
    parser.add_argument('--data-type',
                       choices=['mutations', 'mutations_vcf', 'gene_census', 'resistance_mutations',
                               'structural_variants', 'gene_expression', 'copy_number',
                               'fusion_genes', 'signatures', 'sample_info'],
                       help='Common data type shorthand')
    parser.add_argument('--assembly', default='GRCh38',
                       choices=['GRCh37', 'GRCh38'],
                       help='Genome assembly (default: GRCh38)')
    parser.add_argument('--version', default='latest',
                       help='COSMIC version (default: latest)')
    parser.add_argument('-o', '--output', help='Output filename')

    args = parser.parse_args()

    # Get password if not provided
    if not args.password:
        import getpass
        args.password = getpass.getpass('COSMIC password: ')

    # Determine filepath
    if args.filepath:
        filepath = args.filepath
    elif args.data_type:
        filepath = get_common_file_path(args.data_type, args.assembly, args.version)
        if not filepath:
            print(f"ERROR: Unknown data type: {args.data_type}")
            return 1
    else:
        print("ERROR: Must provide either --filepath or --data-type")
        parser.print_help()
        return 1

    # Download the file
    success = download_cosmic_file(
        email=args.email,
        password=args.password,
        filepath=filepath,
        output_filename=args.output,
        genome_assembly=args.assembly
    )

    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
