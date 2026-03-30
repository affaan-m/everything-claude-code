#!/usr/bin/env python3
"""
LabArchives Notebook Operations

Utilities for listing, backing up, and managing LabArchives notebooks.
"""

import argparse
import sys
import yaml
from datetime import datetime
from pathlib import Path


def load_config(config_path='config.yaml'):
    """Load configuration from YAML file"""
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        print(f"❌ Configuration file not found: {config_path}")
        print("   Run setup_config.py first to create configuration")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading configuration: {e}")
        sys.exit(1)


def init_client(config):
    """Initialize LabArchives API client"""
    try:
        from labarchivespy.client import Client
        return Client(
            config['api_url'],
            config['access_key_id'],
            config['access_password']
        )
    except ImportError:
        print("❌ labarchives-py package not installed")
        print("   Install with: pip install git+https://github.com/mcmero/labarchives-py")
        sys.exit(1)


def get_user_id(client, config):
    """Get user ID via authentication"""
    import xml.etree.ElementTree as ET

    login_params = {
        'login_or_email': config['user_email'],
        'password': config['user_external_password']
    }

    try:
        response = client.make_call('users', 'user_access_info', params=login_params)

        if response.status_code == 200:
            uid = ET.fromstring(response.content)[0].text
            return uid
        else:
            print(f"❌ Authentication failed: HTTP {response.status_code}")
            print(f"   Response: {response.content.decode('utf-8')[:200]}")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Error during authentication: {e}")
        sys.exit(1)


def list_notebooks(client, uid):
    """List all accessible notebooks for a user"""
    import xml.etree.ElementTree as ET

    print(f"\n📚 Listing notebooks for user ID: {uid}\n")

    # Get user access info which includes notebook list
    login_params = {'uid': uid}

    try:
        response = client.make_call('users', 'user_access_info', params=login_params)

        if response.status_code == 200:
            root = ET.fromstring(response.content)
            notebooks = root.findall('.//notebook')

            if not notebooks:
                print("No notebooks found")
                return []

            notebook_list = []
            print(f"{'Notebook ID':<15} {'Name':<40} {'Role':<10}")
            print("-" * 70)

            for nb in notebooks:
                nbid = nb.find('nbid').text if nb.find('nbid') is not None else 'N/A'
                name = nb.find('name').text if nb.find('name') is not None else 'Unnamed'
                role = nb.find('role').text if nb.find('role') is not None else 'N/A'

                notebook_list.append({'nbid': nbid, 'name': name, 'role': role})
                print(f"{nbid:<15} {name:<40} {role:<10}")

            print(f"\nTotal notebooks: {len(notebooks)}")
            return notebook_list

        else:
            print(f"❌ Failed to list notebooks: HTTP {response.status_code}")
            return []

    except Exception as e:
        print(f"❌ Error listing notebooks: {e}")
        return []


def backup_notebook(client, uid, nbid, output_dir='backups', json_format=False,
                   no_attachments=False):
    """Backup a notebook"""
    print(f"\n💾 Backing up notebook {nbid}...")

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    # Prepare parameters
    params = {
        'uid': uid,
        'nbid': nbid,
        'json': 'true' if json_format else 'false',
        'no_attachments': 'true' if no_attachments else 'false'
    }

    try:
        response = client.make_call('notebooks', 'notebook_backup', params=params)

        if response.status_code == 200:
            # Determine file extension
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

            if no_attachments:
                ext = 'json' if json_format else 'xml'
                filename = f"notebook_{nbid}_{timestamp}.{ext}"
            else:
                filename = f"notebook_{nbid}_{timestamp}.7z"

            output_file = output_path / filename

            # Write to file
            with open(output_file, 'wb') as f:
                f.write(response.content)

            file_size = output_file.stat().st_size / (1024 * 1024)  # MB
            print(f"✅ Backup saved: {output_file}")
            print(f"   File size: {file_size:.2f} MB")

            return str(output_file)

        else:
            print(f"❌ Backup failed: HTTP {response.status_code}")
            print(f"   Response: {response.content.decode('utf-8')[:200]}")
            return None

    except Exception as e:
        print(f"❌ Error during backup: {e}")
        return None


def backup_all_notebooks(client, uid, output_dir='backups', json_format=False,
                        no_attachments=False):
    """Backup all accessible notebooks"""
    print("\n📦 Backing up all notebooks...\n")

    notebooks = list_notebooks(client, uid)

    if not notebooks:
        print("No notebooks to backup")
        return

    successful = 0
    failed = 0

    for nb in notebooks:
        nbid = nb['nbid']
        name = nb['name']

        print(f"\n--- Backing up: {name} (ID: {nbid}) ---")

        result = backup_notebook(client, uid, nbid, output_dir, json_format, no_attachments)

        if result:
            successful += 1
        else:
            failed += 1

    print("\n" + "="*60)
    print(f"Backup complete: {successful} successful, {failed} failed")
    print("="*60)


def main():
    """Main command-line interface"""
    parser = argparse.ArgumentParser(
        description='LabArchives Notebook Operations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List all notebooks
  python3 notebook_operations.py list

  # Backup specific notebook
  python3 notebook_operations.py backup --nbid 12345

  # Backup all notebooks (JSON format, no attachments)
  python3 notebook_operations.py backup-all --json --no-attachments

  # Backup to custom directory
  python3 notebook_operations.py backup --nbid 12345 --output my_backups/
        """
    )

    parser.add_argument('--config', default='config.yaml',
                       help='Path to configuration file (default: config.yaml)')

    subparsers = parser.add_subparsers(dest='command', help='Command to execute')

    # List command
    subparsers.add_parser('list', help='List all accessible notebooks')

    # Backup command
    backup_parser = subparsers.add_parser('backup', help='Backup a specific notebook')
    backup_parser.add_argument('--nbid', required=True, help='Notebook ID to backup')
    backup_parser.add_argument('--output', default='backups',
                              help='Output directory (default: backups)')
    backup_parser.add_argument('--json', action='store_true',
                              help='Return data in JSON format instead of XML')
    backup_parser.add_argument('--no-attachments', action='store_true',
                              help='Exclude attachments from backup')

    # Backup all command
    backup_all_parser = subparsers.add_parser('backup-all',
                                             help='Backup all accessible notebooks')
    backup_all_parser.add_argument('--output', default='backups',
                                   help='Output directory (default: backups)')
    backup_all_parser.add_argument('--json', action='store_true',
                                   help='Return data in JSON format instead of XML')
    backup_all_parser.add_argument('--no-attachments', action='store_true',
                                   help='Exclude attachments from backup')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Load configuration and initialize
    config = load_config(args.config)
    client = init_client(config)
    uid = get_user_id(client, config)

    # Execute command
    if args.command == 'list':
        list_notebooks(client, uid)

    elif args.command == 'backup':
        backup_notebook(client, uid, args.nbid, args.output, args.json, args.no_attachments)

    elif args.command == 'backup-all':
        backup_all_notebooks(client, uid, args.output, args.json, args.no_attachments)


if __name__ == '__main__':
    main()
