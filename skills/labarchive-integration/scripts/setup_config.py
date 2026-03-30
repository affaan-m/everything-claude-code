#!/usr/bin/env python3
"""
LabArchives Configuration Setup Script

This script helps create a config.yaml file with necessary credentials
for LabArchives API access.
"""

import yaml
import os
from pathlib import Path


def get_regional_endpoint():
    """Prompt user to select regional API endpoint"""
    print("\nSelect your regional API endpoint:")
    print("1. US/International (mynotebook.labarchives.com)")
    print("2. Australia (aunotebook.labarchives.com)")
    print("3. UK (uknotebook.labarchives.com)")
    print("4. Custom endpoint")

    choice = input("\nEnter choice (1-4): ").strip()

    endpoints = {
        '1': 'https://api.labarchives.com/api',
        '2': 'https://auapi.labarchives.com/api',
        '3': 'https://ukapi.labarchives.com/api'
    }

    if choice in endpoints:
        return endpoints[choice]
    elif choice == '4':
        return input("Enter custom API endpoint URL: ").strip()
    else:
        print("Invalid choice, defaulting to US/International")
        return endpoints['1']


def get_credentials():
    """Prompt user for API credentials"""
    print("\n" + "="*60)
    print("LabArchives API Credentials")
    print("="*60)
    print("\nYou need two sets of credentials:")
    print("1. Institutional API credentials (from LabArchives administrator)")
    print("2. User authentication credentials (from your account settings)")
    print()

    # Institutional credentials
    print("Institutional Credentials:")
    access_key_id = input("  Access Key ID: ").strip()
    access_password = input("  Access Password: ").strip()

    # User credentials
    print("\nUser Credentials:")
    user_email = input("  Your LabArchives email: ").strip()

    print("\nExternal Applications Password:")
    print("(Set this in your LabArchives Account Settings → Security & Privacy)")
    user_password = input("  External Applications Password: ").strip()

    return {
        'access_key_id': access_key_id,
        'access_password': access_password,
        'user_email': user_email,
        'user_external_password': user_password
    }


def create_config_file(config_data, output_path='config.yaml'):
    """Create YAML configuration file"""
    with open(output_path, 'w') as f:
        yaml.dump(config_data, f, default_flow_style=False, sort_keys=False)

    # Set file permissions to user read/write only for security
    os.chmod(output_path, 0o600)

    print(f"\n✅ Configuration saved to: {os.path.abspath(output_path)}")
    print("   File permissions set to 600 (user read/write only)")


def verify_config(config_path='config.yaml'):
    """Verify configuration file can be loaded"""
    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)

        required_keys = ['api_url', 'access_key_id', 'access_password',
                        'user_email', 'user_external_password']

        missing = [key for key in required_keys if key not in config or not config[key]]

        if missing:
            print(f"\n⚠️  Warning: Missing required fields: {', '.join(missing)}")
            return False

        print("\n✅ Configuration file verified successfully")
        return True

    except Exception as e:
        print(f"\n❌ Error verifying configuration: {e}")
        return False


def test_authentication(config_path='config.yaml'):
    """Test authentication with LabArchives API"""
    print("\nWould you like to test the connection? (requires labarchives-py package)")
    test = input("Test connection? (y/n): ").strip().lower()

    if test != 'y':
        return

    try:
        # Try to import labarchives-py
        from labarchivespy.client import Client
        import xml.etree.ElementTree as ET

        # Load config
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)

        # Initialize client
        print("\nInitializing client...")
        client = Client(
            config['api_url'],
            config['access_key_id'],
            config['access_password']
        )

        # Test authentication
        print("Testing authentication...")
        login_params = {
            'login_or_email': config['user_email'],
            'password': config['user_external_password']
        }
        response = client.make_call('users', 'user_access_info', params=login_params)

        if response.status_code == 200:
            # Extract UID
            uid = ET.fromstring(response.content)[0].text
            print(f"\n✅ Authentication successful!")
            print(f"   User ID: {uid}")

            # Get notebook count
            root = ET.fromstring(response.content)
            notebooks = root.findall('.//notebook')
            print(f"   Accessible notebooks: {len(notebooks)}")

        else:
            print(f"\n❌ Authentication failed: HTTP {response.status_code}")
            print(f"   Response: {response.content.decode('utf-8')[:200]}")

    except ImportError:
        print("\n⚠️  labarchives-py package not installed")
        print("   Install with: pip install git+https://github.com/mcmero/labarchives-py")

    except Exception as e:
        print(f"\n❌ Connection test failed: {e}")


def main():
    """Main setup workflow"""
    print("="*60)
    print("LabArchives API Configuration Setup")
    print("="*60)

    # Check if config already exists
    if os.path.exists('config.yaml'):
        print("\n⚠️  config.yaml already exists")
        overwrite = input("Overwrite existing configuration? (y/n): ").strip().lower()
        if overwrite != 'y':
            print("Setup cancelled")
            return

    # Get configuration
    api_url = get_regional_endpoint()
    credentials = get_credentials()

    # Combine configuration
    config_data = {
        'api_url': api_url,
        **credentials
    }

    # Create config file
    create_config_file(config_data)

    # Verify
    verify_config()

    # Test connection
    test_authentication()

    print("\n" + "="*60)
    print("Setup complete!")
    print("="*60)
    print("\nNext steps:")
    print("1. Add config.yaml to .gitignore if using version control")
    print("2. Use notebook_operations.py to list and backup notebooks")
    print("3. Use entry_operations.py to create entries and upload files")
    print("\nFor more information, see references/authentication_guide.md")


if __name__ == '__main__':
    main()
