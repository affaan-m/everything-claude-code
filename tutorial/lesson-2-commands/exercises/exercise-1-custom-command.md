# Exercise 1: Create a Custom Command

## Goal

Create a `/check-hardening` command that reviews a server configuration file
and checks it against basic hardening guidelines.

## Step 1: Create the Command

Save this as `.claude/commands/check-hardening.md` in your project:

```markdown
Analyze the configuration file provided in $ARGUMENTS for security hardening issues.

Check for these common problems:

1. **Default Credentials**: Are any defaults still in use?
2. **Unnecessary Services**: Are unused services/ports enabled?
3. **Logging**: Is logging properly configured?
4. **Permissions**: Are file permissions too permissive?
5. **Encryption**: Is encryption enabled where appropriate?
6. **Updates**: Are there outdated or vulnerable versions?

For each finding:
- Severity: Critical / High / Medium / Low
- Description: What the issue is
- Location: Where in the config file
- Fix: How to remediate

End with a hardening score out of 10.
```

## Step 2: Create a Test Config File

Save this as `test-config/sshd_config`:

```
# OpenSSH Server Configuration
Port 22
PermitRootLogin yes
PasswordAuthentication yes
PermitEmptyPasswords yes
X11Forwarding yes
MaxAuthTries 10
LoginGraceTime 120
Protocol 2
LogLevel INFO
AllowTcpForwarding yes
ClientAliveInterval 0
```

## Step 3: Test It

```
/check-hardening test-config/sshd_config
```

## Expected Results

Claude should flag several issues:
- `PermitRootLogin yes` (Critical)
- `PermitEmptyPasswords yes` (Critical)
- `PasswordAuthentication yes` (Medium — should use key-based)
- `MaxAuthTries 10` (Medium — too many)
- `X11Forwarding yes` (Low — unnecessary if no GUI)
- `ClientAliveInterval 0` (Low — no timeout)

## Verification

Did Claude:
- [ ] Find all the security issues?
- [ ] Rate them by severity?
- [ ] Provide specific remediation steps?
- [ ] Give a hardening score?
