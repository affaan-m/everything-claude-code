---
name: two-factor-authentication-best-practices
description: This skill provides guidance and enforcement rules for implementing secure two-factor authentication (2FA) using Better Auth's twoFactor plugin.
---

## Setting Up Two-Factor Authentication

When adding 2FA to your application, configure the `twoFactor` plugin with your app name as the issuer. This name appears in authenticator apps when users scan the QR code.

```ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  appName: "My App", // Used as the default issuer for TOTP
  plugins: [
    twoFactor({
      issuer: "My App", // Optional: override the app name for 2FA specifically
    }),
  ],
});
```

**Note**: After adding the plugin, run `npx @better-auth/cli migrate` to add the required database fields and tables.

### Client-Side Setup

Add the client plugin and configure the redirect behavior for 2FA verification:

```ts
import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/2fa"; // Redirect to your 2FA verification page
      },
    }),
  ],
});
```

## Enabling 2FA for Users

When a user enables 2FA, require their password for verification. The enable endpoint returns a TOTP URI for QR code generation and backup codes for account recovery.

```ts
const enable2FA = async (password: string) => {
  const { data, error } = await authClient.twoFactor.enable({
    password,
  });

  if (data) {
    // data.totpURI - Use this to generate a QR code
    // data.backupCodes - Display these to the user for safekeeping
  }
};
```

**Important**: The `twoFactorEnabled` flag on the user is not set to `true` until the user successfully verifies their first TOTP code. This ensures users have properly configured their authenticator app before 2FA is fully active.

### Skipping Initial Verification

If you want to enable 2FA immediately without requiring verification, set `skipVerificationOnEnable`:

```ts
twoFactor({
  skipVerificationOnEnable: true, // Not recommended for most use cases
});
```

**Note**: This is generally not recommended as it doesn't confirm the user has successfully set up their authenticator app.

## TOTP (Authenticator App)

TOTP generates time-based codes using an authenticator app (Google Authenticator, Authy, etc.). Codes are valid for 30 seconds by default.

### Displaying the QR Code

Use the TOTP URI to generate a QR code for users to scan:

```tsx
import QRCode from "react-qr-code";

const TotpSetup = ({ totpURI }: { totpURI: string }) => {
  return <QRCode value={totpURI} />;
};
```

### Verifying TOTP Codes

Better Auth accepts codes from one period before and one after the current time, accommodating minor clock differences between devices:

```ts
const verifyTotp = async (code: string) => {
  const { data, error } = await authClient.twoFactor.verifyTotp({
    code,
    trustDevice: true, // Optional: remember this device for 30 days
  });
};
```

### TOTP Configuration Options

```ts
twoFactor({
  totpOptions: {
    digits: 6, // 6 or 8 digits (default: 6)
    period: 30, // Code validity period in seconds (default: 30)
  },
});
```

## OTP (Email/SMS)

OTP sends a one-time code to the user's email or phone. You must implement the `sendOTP` function to deliver codes.

### Configuring OTP Delivery

```ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { sendEmail } from "./email";

export const auth = betterAuth({
  plugins: [
    twoFactor({
      otpOptions: {
        sendOTP: async ({ user, otp }, ctx) => {
          await sendEmail({
            to: user.email,
            subject: "Your verification code",
            text: `Your code is: ${otp}`,
          });
        },
        period: 5, // Code validity in minutes (default: 3)
        digits: 6, // Number of digits (default: 6)
        allowedAttempts: 5, // Max verification attempts (default: 5)
      },
    }),
  ],
});
```

### Sending and Verifying OTP

```ts
// Request an OTP to be sent
const sendOtp = async () => {
  const { data, error } = await authClient.twoFactor.sendOtp();
};

// Verify the OTP code
const verifyOtp = async (code: string) => {
  const { data, error } = await authClient.twoFactor.verifyOtp({
    code,
    trustDevice: true,
  });
};
```

### OTP Storage Security

Configure how OTP codes are stored in the database:

```ts
twoFactor({
  otpOptions: {
    storeOTP: "encrypted", // Options: "plain", "encrypted", "hashed"
  },
});
```

For custom encryption:

```ts
twoFactor({
  otpOptions: {
    storeOTP: {
      encrypt: async (token) => myEncrypt(token),
      decrypt: async (token) => myDecrypt(token),
    },
  },
});
```

## Backup Codes

Backup codes provide account recovery when users lose access to their authenticator app or phone. They are generated automatically when 2FA is enabled.

### Displaying Backup Codes

Always show backup codes to users when they enable 2FA:

```tsx
const BackupCodes = ({ codes }: { codes: string[] }) => {
  return (
    <div>
      <p>Save these codes in a secure location:</p>
      <ul>
        {codes.map((code, i) => (
          <li key={i}>{code}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Regenerating Backup Codes

When users need new codes, regenerate them (this invalidates all previous codes):

```ts
const regenerateBackupCodes = async (password: string) => {
  const { data, error } = await authClient.twoFactor.generateBackupCodes({
    password,
  });
  // data.backupCodes contains the new codes
};
```

### Using Backup Codes for Recovery

```ts
const verifyBackupCode = async (code: string) => {
  const { data, error } = await authClient.twoFactor.verifyBackupCode({
    code,
    trustDevice: true,
  });
};
```

**Note**: Each backup code can only be used once and is removed from the database after successful verification.

### Backup Code Configuration

```ts
twoFactor({
  backupCodeOptions: {
    amount: 10, // Number of codes to generate (default: 10)
    length: 10, // Length of each code (default: 10)
    storeBackupCodes: "encrypted", // Options: "plain", "encrypted"
  },
});
```

## Handling 2FA During Sign-In

When a user with 2FA enabled signs in, the response includes `twoFactorRedirect: true`:

```ts
const signIn = async (email: string, password: string) => {
  const { data, error } = await authClient.signIn.email(
    {
      email,
      password,
    },
    {
      onSuccess(context) {
        if (context.data.twoFactorRedirect) {
          // Redirect to 2FA verification page
          window.location.href = "/2fa";
        }
      },
    }
  );
};
```

### Server-Side 2FA Detection

When using `auth.api.signInEmail` on the server, check for 2FA redirect:

```ts
const response = await auth.api.signInEmail({
  body: {
    email: "user@example.com",
    password: "password",
  },
});

if ("twoFactorRedirect" in response) {
  // Handle 2FA verification
}
```

## Trusted Devices

Trusted devices allow users to skip 2FA verification on subsequent sign-ins for a configurable period.

### Enabling Trust on Verification

Pass `trustDevice: true` when verifying 2FA:

```ts
await authClient.twoFactor.verifyTotp({
  code: "123456",
  trustDevice: true,
});
```

### Configuring Trust Duration

```ts
twoFactor({
  trustDeviceMaxAge: 30 * 24 * 60 * 60, // 30 days in seconds (default)
});
```

**Note**: The trust period refreshes on each successful sign-in within the trust window.

## Security Considerations

### Session Management

During the 2FA flow:

1. User signs in with credentials
2. Session cookie is removed (not yet authenticated)
3. A temporary two-factor cookie is set (default: 10-minute expiration)
4. User verifies via TOTP, OTP, or backup code
5. Session cookie is created upon successful verification

Configure the two-factor cookie expiration:

```ts
twoFactor({
  twoFactorCookieMaxAge: 600, // 10 minutes in seconds (default)
});
```

### Rate Limiting

Better Auth applies built-in rate limiting to all 2FA endpoints (3 requests per 10 seconds). For OTP verification, additional attempt limiting is applied:

```ts
twoFactor({
  otpOptions: {
    allowedAttempts: 5, // Max attempts per OTP code (default: 5)
  },
});
```

### Encryption at Rest

- TOTP secrets are encrypted using symmetric encryption with your auth secret
- Backup codes are stored encrypted by default
- OTP codes can be configured for plain, encrypted, or hashed storage

### Constant-Time Comparison

Better Auth uses constant-time comparison for OTP verification to prevent timing attacks.

### Credential Account Requirement

Two-factor authentication can only be enabled for credential (email/password) accounts. For social accounts, it's assumed the provider already handles 2FA.

## Disabling 2FA

Allow users to disable 2FA with password confirmation:

```ts
const disable2FA = async (password: string) => {
  const { data, error } = await authClient.twoFactor.disable({
    password,
  });
};
```

**Note**: When 2FA is disabled, trusted device records are revoked.

## Complete Configuration Example

```ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { sendEmail } from "./email";

export const auth = betterAuth({
  appName: "My App",
  plugins: [
    twoFactor({
      // TOTP settings
      issuer: "My App",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      // OTP settings
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendEmail({
            to: user.email,
            subject: "Your verification code",
            text: `Your code is: ${otp}`,
          });
        },
        period: 5,
        allowedAttempts: 5,
        storeOTP: "encrypted",
      },
      // Backup code settings
      backupCodeOptions: {
        amount: 10,
        length: 10,
        storeBackupCodes: "encrypted",
      },
      // Session settings
      twoFactorCookieMaxAge: 600, // 10 minutes
      trustDeviceMaxAge: 30 * 24 * 60 * 60, // 30 days
    }),
  ],
});
```
