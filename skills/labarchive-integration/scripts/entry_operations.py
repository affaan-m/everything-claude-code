#!/usr/bin/env python3
"""
LabArchives Entry Operations

Utilities for creating entries, uploading attachments, and managing notebook content.
"""

import argparse
import sys
import yaml
import os
from pathlib import Path
from datetime import datetime


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


def create_entry(client, uid, nbid, title, content=None, date=None):
    """Create a new entry in a notebook"""
    print(f"\n📝 Creating entry: {title}")

    # Prepare parameters
    params = {
        'uid': uid,
        'nbid': nbid,
        'title': title
    }

    if content:
        # Ensure content is HTML formatted
        if not content.startswith('<'):
            content = f'<p>{content}</p>'
        params['content'] = content

    if date:
        params['date'] = date

    try:
        response = client.make_call('entries', 'create_entry', params=params)

        if response.status_code == 200:
            print("✅ Entry created successfully")

            # Try to extract entry ID from response
            try:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.content)
                entry_id = root.find('.//entry_id')
                if entry_id is not None:
                    print(f"   Entry ID: {entry_id.text}")
                    return entry_id.text
            except:
                pass

            return True

        else:
            print(f"❌ Entry creation failed: HTTP {response.status_code}")
            print(f"   Response: {response.content.decode('utf-8')[:200]}")
            return None

    except Exception as e:
        print(f"❌ Error creating entry: {e}")
        return None


def create_comment(client, uid, nbid, entry_id, comment):
    """Add a comment to an existing entry"""
    print(f"\n💬 Adding comment to entry {entry_id}")

    params = {
        'uid': uid,
        'nbid': nbid,
        'entry_id': entry_id,
        'comment': comment
    }

    try:
        response = client.make_call('entries', 'create_comment', params=params)

        if response.status_code == 200:
            print("✅ Comment added successfully")
            return True
        else:
            print(f"❌ Comment creation failed: HTTP {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Error creating comment: {e}")
        return False


def upload_attachment(client, config, uid, nbid, entry_id, file_path):
    """Upload a file attachment to an entry"""
    import requests

    file_path = Path(file_path)

    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return False

    print(f"\n📎 Uploading attachment: {file_path.name}")
    print(f"   Size: {file_path.stat().st_size / 1024:.2f} KB")

    url = f"{config['api_url']}/entries/upload_attachment"

    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {
                'uid': uid,
                'nbid': nbid,
                'entry_id': entry_id,
                'filename': file_path.name,
                'access_key_id': config['access_key_id'],
                'access_password': config['access_password']
            }

            response = requests.post(url, files=files, data=data)

        if response.status_code == 200:
            print("✅ Attachment uploaded successfully")
            return True
        else:
            print(f"❌ Upload failed: HTTP {response.status_code}")
            print(f"   Response: {response.content.decode('utf-8')[:200]}")
            return False

    except Exception as e:
        print(f"❌ Error uploading attachment: {e}")
        return False


def batch_upload(client, config, uid, nbid, entry_id, directory):
    """Upload all files from a directory as attachments"""
    directory = Path(directory)

    if not directory.is_dir():
        print(f"❌ Directory not found: {directory}")
        return

    files = list(directory.glob('*'))
    files = [f for f in files if f.is_file()]

    if not files:
        print(f"❌ No files found in {directory}")
        return

    print(f"\n📦 Batch uploading {len(files)} files from {directory}")

    successful = 0
    failed = 0

    for file_path in files:
        if upload_attachment(client, config, uid, nbid, entry_id, file_path):
            successful += 1
        else:
            failed += 1

    print("\n" + "="*60)
    print(f"Batch upload complete: {successful} successful, {failed} failed")
    print("="*60)


def create_entry_with_attachments(client, config, uid, nbid, title, content,
                                  attachments):
    """Create entry and upload multiple attachments"""
    # Create entry
    entry_id = create_entry(client, uid, nbid, title, content)

    if not entry_id:
        print("❌ Cannot upload attachments without entry ID")
        return False

    # Upload attachments
    for attachment_path in attachments:
        upload_attachment(client, config, uid, nbid, entry_id, attachment_path)

    return True


def main():
    """Main command-line interface"""
    parser = argparse.ArgumentParser(
        description='LabArchives Entry Operations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create simple entry
  python3 entry_operations.py create --nbid 12345 --title "Experiment Results"

  # Create entry with content
  python3 entry_operations.py create --nbid 12345 --title "Results" \\
    --content "PCR amplification successful"

  # Create entry with HTML content
  python3 entry_operations.py create --nbid 12345 --title "Results" \\
    --content "<p>Results:</p><ul><li>Sample A: Positive</li></ul>"

  # Upload attachment to existing entry
  python3 entry_operations.py upload --nbid 12345 --entry-id 67890 \\
    --file data.csv

  # Batch upload multiple files
  python3 entry_operations.py batch-upload --nbid 12345 --entry-id 67890 \\
    --directory ./experiment_data/

  # Add comment to entry
  python3 entry_operations.py comment --nbid 12345 --entry-id 67890 \\
    --text "Follow-up analysis needed"
        """
    )

    parser.add_argument('--config', default='config.yaml',
                       help='Path to configuration file (default: config.yaml)')
    parser.add_argument('--nbid', required=True,
                       help='Notebook ID')

    subparsers = parser.add_subparsers(dest='command', help='Command to execute')

    # Create entry command
    create_parser = subparsers.add_parser('create', help='Create new entry')
    create_parser.add_argument('--title', required=True, help='Entry title')
    create_parser.add_argument('--content', help='Entry content (HTML supported)')
    create_parser.add_argument('--date', help='Entry date (YYYY-MM-DD)')
    create_parser.add_argument('--attachments', nargs='+',
                              help='Files to attach to the new entry')

    # Upload attachment command
    upload_parser = subparsers.add_parser('upload', help='Upload attachment to entry')
    upload_parser.add_argument('--entry-id', required=True, help='Entry ID')
    upload_parser.add_argument('--file', required=True, help='File to upload')

    # Batch upload command
    batch_parser = subparsers.add_parser('batch-upload',
                                        help='Upload all files from directory')
    batch_parser.add_argument('--entry-id', required=True, help='Entry ID')
    batch_parser.add_argument('--directory', required=True,
                             help='Directory containing files to upload')

    # Comment command
    comment_parser = subparsers.add_parser('comment', help='Add comment to entry')
    comment_parser.add_argument('--entry-id', required=True, help='Entry ID')
    comment_parser.add_argument('--text', required=True, help='Comment text')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Load configuration and initialize
    config = load_config(args.config)
    client = init_client(config)
    uid = get_user_id(client, config)

    # Execute command
    if args.command == 'create':
        if args.attachments:
            create_entry_with_attachments(
                client, config, uid, args.nbid, args.title,
                args.content, args.attachments
            )
        else:
            create_entry(client, uid, args.nbid, args.title,
                        args.content, args.date)

    elif args.command == 'upload':
        upload_attachment(client, config, uid, args.nbid,
                         args.entry_id, args.file)

    elif args.command == 'batch-upload':
        batch_upload(client, config, uid, args.nbid,
                    args.entry_id, args.directory)

    elif args.command == 'comment':
        create_comment(client, uid, args.nbid, args.entry_id, args.text)


if __name__ == '__main__':
    main()
