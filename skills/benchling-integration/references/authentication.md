# Benchling Authentication Reference

## Authentication Methods

Benchling supports three authentication methods, each suited for different use cases.

### 1. API Key Authentication (Basic Auth)

**Best for:** Personal scripts, prototyping, single-user integrations

**How it works:**
- Use your API key as the username in HTTP Basic authentication
- Leave the password field empty
- All requests must use HTTPS

**Obtaining an API Key:**
1. Log in to your Benchling account
2. Navigate to Profile Settings
3. Find the API Key section
4. Generate a new API key
5. Store it securely (it will only be shown once)

**Python SDK Usage:**
```python
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.api_key_auth import ApiKeyAuth

benchling = Benchling(
    url="https://your-tenant.benchling.com",
    auth_method=ApiKeyAuth("your_api_key_here")
)
```

**Direct HTTP Usage:**
```bash
curl -X GET \
  https://your-tenant.benchling.com/api/v2/dna-sequences \
  -u "your_api_key_here:"
```

Note the colon after the API key with no password.

**Environment Variable Pattern:**
```python
import os
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.api_key_auth import ApiKeyAuth

api_key = os.environ.get("BENCHLING_API_KEY")
tenant_url = os.environ.get("BENCHLING_TENANT_URL")

benchling = Benchling(
    url=tenant_url,
    auth_method=ApiKeyAuth(api_key)
)
```

### 2. OAuth 2.0 Client Credentials

**Best for:** Multi-user applications, service accounts, production integrations

**How it works:**
1. Register an application in Benchling's Developer Console
2. Obtain client ID and client secret
3. Exchange credentials for an access token
4. Use the access token for API requests
5. Refresh token when expired

**Registering an App:**
1. Log in to Benchling as an admin
2. Navigate to Developer Console
3. Create a new App
4. Record the client ID and client secret
5. Configure OAuth redirect URIs and permissions

**Python SDK Usage:**
```python
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.client_credentials_oauth2 import ClientCredentialsOAuth2

auth_method = ClientCredentialsOAuth2(
    client_id="your_client_id",
    client_secret="your_client_secret"
)

benchling = Benchling(
    url="https://your-tenant.benchling.com",
    auth_method=auth_method
)
```

The SDK automatically handles token refresh.

**Direct HTTP Token Flow:**
```bash
# Get access token
curl -X POST \
  https://your-tenant.benchling.com/api/v2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=your_client_id" \
  -d "client_secret=your_client_secret"

# Response:
# {
#   "access_token": "token_here",
#   "token_type": "Bearer",
#   "expires_in": 3600
# }

# Use access token
curl -X GET \
  https://your-tenant.benchling.com/api/v2/dna-sequences \
  -H "Authorization: Bearer access_token_here"
```

### 3. OpenID Connect (OIDC)

**Best for:** Enterprise integrations with existing identity providers, SSO scenarios

**How it works:**
- Authenticate users through your identity provider (Okta, Azure AD, etc.)
- Identity provider issues an ID token with email claim
- Benchling verifies the token against the OpenID configuration endpoint
- Matches authenticated user by email

**Requirements:**
- Enterprise Benchling account
- Configured identity provider (IdP)
- IdP must issue tokens with email claims
- Email in token must match Benchling user email

**Identity Provider Configuration:**
1. Configure your IdP to issue OpenID Connect tokens
2. Ensure tokens include the `email` claim
3. Provide Benchling with your IdP's OpenID configuration URL
4. Benchling will verify tokens against this configuration

**Python Usage:**
```python
# Assuming you have an ID token from your IdP
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.oidc_auth import OidcAuth

auth_method = OidcAuth(id_token="id_token_from_idp")

benchling = Benchling(
    url="https://your-tenant.benchling.com",
    auth_method=auth_method
)
```

**Direct HTTP Usage:**
```bash
curl -X GET \
  https://your-tenant.benchling.com/api/v2/dna-sequences \
  -H "Authorization: Bearer id_token_here"
```

## Security Best Practices

### Credential Storage

**DO:**
- Store credentials in environment variables
- Use password managers or secret management services (AWS Secrets Manager, HashiCorp Vault)
- Encrypt credentials at rest
- Use different credentials for dev/staging/production

**DON'T:**
- Commit credentials to version control
- Hardcode credentials in source files
- Share credentials via email or chat
- Store credentials in plain text files

**Example with Environment Variables:**
```python
import os
from dotenv import load_dotenv  # python-dotenv package

# Load from .env file (add .env to .gitignore!)
load_dotenv()

api_key = os.environ["BENCHLING_API_KEY"]
tenant = os.environ["BENCHLING_TENANT_URL"]
```

### Credential Rotation

**API Key Rotation:**
1. Generate a new API key in Profile Settings
2. Update your application to use the new key
3. Verify the new key works
4. Delete the old API key

**App Secret Rotation:**
1. Navigate to Developer Console
2. Select your app
3. Generate new client secret
4. Update your application configuration
5. Delete the old secret after verifying

**Best Practice:** Rotate credentials regularly (e.g., every 90 days) and immediately if compromised.

### Access Control

**Principle of Least Privilege:**
- Grant only the minimum necessary permissions
- Use service accounts (apps) instead of personal accounts for automation
- Review and audit permissions regularly

**App Permissions:**
Apps require explicit access grants to:
- Organizations
- Teams
- Projects
- Folders

Configure these in the Developer Console when setting up your app.

**User Permissions:**
API access mirrors UI permissions:
- Users can only access data they have permission to view/edit in the UI
- Suspended users lose API access
- Archived apps lose API access until unarchived

### Network Security

**HTTPS Only:**
All Benchling API requests must use HTTPS. HTTP requests will be rejected.

**IP Allowlisting (Enterprise):**
Some enterprise accounts can restrict API access to specific IP ranges. Contact Benchling support to configure.

**Rate Limiting:**
Benchling implements rate limiting to prevent abuse:
- Default: 100 requests per 10 seconds per user/app
- 429 status code returned when rate limit exceeded
- SDK automatically retries with exponential backoff

### Audit Logging

**Tracking API Usage:**
- All API calls are logged with user/app identity
- OAuth apps show proper audit trails with user attribution
- API key calls are attributed to the key owner
- Review audit logs in Benchling's admin console

**Best Practice for Apps:**
Use OAuth instead of API keys when multiple users interact through your app. This ensures proper audit attribution to the actual user, not just the app.

## Troubleshooting

### Common Authentication Errors

**401 Unauthorized:**
- Invalid or expired credentials
- API key not properly formatted
- Missing "Authorization" header

**Solution:**
- Verify credentials are correct
- Check API key is not expired or deleted
- Ensure proper header format: `Authorization: Bearer <token>`

**403 Forbidden:**
- Valid credentials but insufficient permissions
- User doesn't have access to the requested resource
- App not granted access to the organization/project

**Solution:**
- Check user/app permissions in Benchling
- Grant necessary access in Developer Console (for apps)
- Verify the resource exists and user has access

**429 Too Many Requests:**
- Rate limit exceeded
- Too many requests in short time period

**Solution:**
- Implement exponential backoff
- SDK handles this automatically
- Consider caching results
- Spread requests over time

### Testing Authentication

**Quick Test with curl:**
```bash
# Test API key
curl -X GET \
  https://your-tenant.benchling.com/api/v2/users/me \
  -u "your_api_key:" \
  -v

# Test OAuth token
curl -X GET \
  https://your-tenant.benchling.com/api/v2/users/me \
  -H "Authorization: Bearer your_token" \
  -v
```

The `/users/me` endpoint returns the authenticated user's information and is useful for verifying credentials.

**Python SDK Test:**
```python
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.api_key_auth import ApiKeyAuth

try:
    benchling = Benchling(
        url="https://your-tenant.benchling.com",
        auth_method=ApiKeyAuth("your_api_key")
    )

    # Test authentication
    user = benchling.users.get_me()
    print(f"Authenticated as: {user.name} ({user.email})")

except Exception as e:
    print(f"Authentication failed: {e}")
```

## Multi-Tenant Considerations

If working with multiple Benchling tenants:

```python
# Configuration for multiple tenants
tenants = {
    "production": {
        "url": "https://prod.benchling.com",
        "api_key": os.environ["PROD_API_KEY"]
    },
    "staging": {
        "url": "https://staging.benchling.com",
        "api_key": os.environ["STAGING_API_KEY"]
    }
}

# Initialize clients
clients = {}
for name, config in tenants.items():
    clients[name] = Benchling(
        url=config["url"],
        auth_method=ApiKeyAuth(config["api_key"])
    )

# Use specific client
prod_sequences = clients["production"].dna_sequences.list()
```

## Advanced: Custom HTTPS Clients

For environments with self-signed certificates or corporate proxies:

```python
import httpx
from benchling_sdk.benchling import Benchling
from benchling_sdk.auth.api_key_auth import ApiKeyAuth

# Custom httpx client with certificate verification
custom_client = httpx.Client(
    verify="/path/to/custom/ca-bundle.crt",
    timeout=30.0
)

benchling = Benchling(
    url="https://your-tenant.benchling.com",
    auth_method=ApiKeyAuth("your_api_key"),
    http_client=custom_client
)
```

## References

- **Official Authentication Docs:** https://docs.benchling.com/docs/authentication
- **Developer Console:** https://your-tenant.benchling.com/developer
- **SDK Documentation:** https://benchling.com/sdk-docs/
