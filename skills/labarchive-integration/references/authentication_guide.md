# LabArchives Authentication Guide

## Prerequisites

### 1. Enterprise License

API access requires an Enterprise LabArchives license. Contact your LabArchives administrator or sales@labarchives.com to:
- Verify your institution has Enterprise access
- Request API access enablement for your account
- Obtain institutional API credentials

### 2. API Credentials

You need two sets of credentials:

#### Institutional API Credentials (from LabArchives administrator)
- **Access Key ID**: Institution-level identifier
- **Access Password**: Institution-level secret

#### User Authentication Credentials (self-configured)
- **Email**: Your LabArchives account email (e.g., researcher@university.edu)
- **External Applications Password**: Set in your LabArchives account settings

## Setting Up External Applications Password

The external applications password is different from your regular LabArchives login password. It provides API access without exposing your primary credentials.

**Steps to create external applications password:**

1. Log into your LabArchives account at mynotebook.labarchives.com (or your institutional URL)
2. Navigate to **Account Settings** (click your name in top-right corner)
3. Select **Security & Privacy** tab
4. Find **External Applications** section
5. Click **Generate New Password** or **Reset Password**
6. Copy and securely store this password (you won't see it again)
7. Use this password for all API authentication

**Security note:** Treat this password like an API token. If compromised, regenerate it immediately from account settings.

## Configuration File Setup

Create a `config.yaml` file to store your credentials securely:

```yaml
# Regional API endpoint
api_url: https://api.labarchives.com/api

# Institutional credentials (from administrator)
access_key_id: YOUR_ACCESS_KEY_ID_HERE
access_password: YOUR_ACCESS_PASSWORD_HERE

# User credentials (for user-specific operations)
user_email: researcher@university.edu
user_external_password: YOUR_EXTERNAL_APP_PASSWORD_HERE
```

**Alternative: Environment variables**

For enhanced security, use environment variables instead of config file:

```bash
export LABARCHIVES_API_URL="https://api.labarchives.com/api"
export LABARCHIVES_ACCESS_KEY_ID="your_key_id"
export LABARCHIVES_ACCESS_PASSWORD="your_access_password"
export LABARCHIVES_USER_EMAIL="researcher@university.edu"
export LABARCHIVES_USER_PASSWORD="your_external_app_password"
```

## Regional Endpoints

Select the correct regional API endpoint for your institution:

| Region | Endpoint | Use if your LabArchives URL is |
|--------|----------|--------------------------------|
| US/International | `https://api.labarchives.com/api` | `mynotebook.labarchives.com` |
| Australia | `https://auapi.labarchives.com/api` | `aunotebook.labarchives.com` |
| UK | `https://ukapi.labarchives.com/api` | `uknotebook.labarchives.com` |

Using the wrong regional endpoint will result in authentication failures even with correct credentials.

## Authentication Flow

### Option 1: Using labarchives-py Python Wrapper

```python
from labarchivespy.client import Client
import yaml

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Initialize client with institutional credentials
client = Client(
    config['api_url'],
    config['access_key_id'],
    config['access_password']
)

# Authenticate as specific user to get UID
login_params = {
    'login_or_email': config['user_email'],
    'password': config['user_external_password']
}
response = client.make_call('users', 'user_access_info', params=login_params)

# Parse response to extract UID
import xml.etree.ElementTree as ET
uid = ET.fromstring(response.content)[0].text
print(f"Authenticated as user ID: {uid}")
```

### Option 2: Direct HTTP Requests with Python requests

```python
import requests
import yaml

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Construct API call
url = f"{config['api_url']}/users/user_access_info"
params = {
    'access_key_id': config['access_key_id'],
    'access_password': config['access_password'],
    'login_or_email': config['user_email'],
    'password': config['user_external_password']
}

# Make authenticated request
response = requests.get(url, params=params)

if response.status_code == 200:
    print("Authentication successful!")
    print(response.content.decode('utf-8'))
else:
    print(f"Authentication failed: {response.status_code}")
    print(response.content.decode('utf-8'))
```

### Option 3: Using R

```r
library(httr)
library(xml2)

# Configuration
api_url <- "https://api.labarchives.com/api"
access_key_id <- "YOUR_ACCESS_KEY_ID"
access_password <- "YOUR_ACCESS_PASSWORD"
user_email <- "researcher@university.edu"
user_external_password <- "YOUR_EXTERNAL_APP_PASSWORD"

# Make authenticated request
response <- GET(
    paste0(api_url, "/users/user_access_info"),
    query = list(
        access_key_id = access_key_id,
        access_password = access_password,
        login_or_email = user_email,
        password = user_external_password
    )
)

# Parse response
if (status_code(response) == 200) {
    content <- content(response, as = "text", encoding = "UTF-8")
    xml_data <- read_xml(content)
    uid <- xml_text(xml_find_first(xml_data, "//uid"))
    print(paste("Authenticated as user ID:", uid))
} else {
    print(paste("Authentication failed:", status_code(response)))
}
```

## OAuth Authentication (New Integrations)

LabArchives now uses OAuth 2.0 for new third-party integrations. Legacy API key authentication (described above) continues to work for direct API access.

**OAuth flow (for app developers):**

1. Register your application with LabArchives
2. Obtain client ID and client secret
3. Implement OAuth 2.0 authorization code flow
4. Exchange authorization code for access token
5. Use access token for API requests

Contact LabArchives developer support for OAuth integration documentation.

## Troubleshooting Authentication Issues

### 401 Unauthorized Error

**Possible causes and solutions:**

1. **Incorrect access_key_id or access_password**
   - Verify credentials with your LabArchives administrator
   - Check for typos or extra whitespace in config file

2. **Wrong external applications password**
   - Confirm you're using the external applications password, not your regular login password
   - Regenerate external applications password in account settings

3. **API access not enabled**
   - Contact your LabArchives administrator to enable API access for your account
   - Verify your institution has Enterprise license

4. **Wrong regional endpoint**
   - Confirm your api_url matches your institution's LabArchives instance
   - Check if you're using .com, .auapi, or .ukapi domain

### 403 Forbidden Error

**Possible causes and solutions:**

1. **Insufficient permissions**
   - Verify your account role has necessary permissions
   - Check if you have access to the specific notebook (nbid)

2. **Account suspended or expired**
   - Contact your LabArchives administrator to check account status

### Network and Connection Issues

**Firewall/proxy configuration:**

If your institution uses a firewall or proxy:

```python
import requests

# Configure proxy
proxies = {
    'http': 'http://proxy.university.edu:8080',
    'https': 'http://proxy.university.edu:8080'
}

# Make request with proxy
response = requests.get(url, params=params, proxies=proxies)
```

**SSL certificate verification:**

For self-signed certificates (not recommended for production):

```python
# Disable SSL verification (use only for testing)
response = requests.get(url, params=params, verify=False)
```

## Security Best Practices

1. **Never commit credentials to version control**
   - Add `config.yaml` to `.gitignore`
   - Use environment variables or secret management systems

2. **Rotate credentials regularly**
   - Change external applications password every 90 days
   - Regenerate API keys annually

3. **Use least privilege principle**
   - Request only necessary API permissions
   - Create separate API credentials for different applications

4. **Monitor API usage**
   - Regularly review API access logs
   - Set up alerts for unusual activity

5. **Secure storage**
   - Encrypt configuration files at rest
   - Use system keychain or secret management tools (e.g., AWS Secrets Manager, Azure Key Vault)

## Testing Authentication

Use this script to verify your authentication setup:

```python
#!/usr/bin/env python3
"""Test LabArchives API authentication"""

from labarchivespy.client import Client
import yaml
import sys

def test_authentication():
    try:
        # Load config
        with open('config.yaml', 'r') as f:
            config = yaml.safe_load(f)

        print("Configuration loaded successfully")
        print(f"API URL: {config['api_url']}")

        # Initialize client
        client = Client(
            config['api_url'],
            config['access_key_id'],
            config['access_password']
        )
        print("Client initialized")

        # Test authentication
        login_params = {
            'login_or_email': config['user_email'],
            'password': config['user_external_password']
        }
        response = client.make_call('users', 'user_access_info', params=login_params)

        if response.status_code == 200:
            print("✅ Authentication successful!")

            # Extract UID
            import xml.etree.ElementTree as ET
            uid = ET.fromstring(response.content)[0].text
            print(f"User ID: {uid}")

            # Get user info
            user_response = client.make_call('users', 'user_info_via_id', params={'uid': uid})
            print("✅ User information retrieved successfully")

            return True
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(response.content.decode('utf-8'))
            return False

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_authentication()
    sys.exit(0 if success else 1)
```

Run this script to confirm everything is configured correctly:

```bash
python3 test_auth.py
```

## Getting Help

If authentication continues to fail after troubleshooting:

1. Contact your institutional LabArchives administrator
2. Email LabArchives support: support@labarchives.com
3. Include:
   - Your institution name
   - Your LabArchives account email
   - Error messages and response codes
   - Regional endpoint you're using
   - Programming language and library versions
