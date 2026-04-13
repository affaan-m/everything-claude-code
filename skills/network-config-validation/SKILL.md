---
name: network-config-validation
description: Pre-deployment validation of Cisco IOS/IOS-XE configuration — catching missing saves, mismatched ACLs, overlapping subnets, duplicate IPs, missing route-maps, and dangerous commands before they cause outages.
origin: ECC
---

# Network Config Validation

Patterns for validating network device configuration before pushing it to production. Catches common mistakes that cause outages — the kind of check that gets shared with the whole team after one incident too many.

## When to Activate

- Reviewing IOS/IOS-XE configuration before a change window
- Validating automation-generated config before applying it to a device
- Auditing an existing configuration for security or correctness issues
- Checking for dangerous commands in a proposed config block
- Verifying subnet consistency and IP address uniqueness across a config

## Dangerous Command Detection

Some commands cause immediate, hard-to-recover impact. Always flag these before applying any config.

```python
import re
from typing import Optional

DANGEROUS_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\breload\b", re.I),              "device reload — causes downtime"),
    (re.compile(r"\berase\s+(startup|nvram|flash)", re.I), "erase persistent storage"),
    (re.compile(r"\bformat\b", re.I),              "format filesystem"),
    (re.compile(r"crypto\s+key\s+(generate|zeroize)", re.I), "crypto key operation"),
    (re.compile(r"no\s+router\s+(bgp|ospf|eigrp)", re.I), "remove entire routing process"),
    (re.compile(r"no\s+interface\s+\S+", re.I),    "remove interface config"),
    (re.compile(r"aaa\s+new-model", re.I),         "AAA model change — can lock you out"),
    (re.compile(r"(username|enable)\s+secret", re.I), "credential change"),
]

def check_dangerous_commands(commands: list[str]) -> list[dict]:
    warnings = []
    for i, cmd in enumerate(commands, start=1):
        for pattern, reason in DANGEROUS_PATTERNS:
            if pattern.search(cmd.strip()):
                warnings.append({"line": i, "command": cmd.strip(), "reason": reason})
    return warnings
```

## IOS-XE Syntax Validation

```python
import re

# Known-valid IOS-XE command patterns
VALID_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"^interface\s+\S+", re.I),                      "interface declaration"),
    (re.compile(r"^\s*ip address\s+\d{1,3}(?:\.\d{1,3}){3}\s+\d{1,3}(?:\.\d{1,3}){3}", re.I), "ip address"),
    (re.compile(r"^\s*(no\s+)?shutdown", re.I),                  "shutdown/no shutdown"),
    (re.compile(r"^\s*description\s+.+", re.I),                  "description"),
    (re.compile(r"^\s*duplex\s+(auto|full|half)", re.I),         "duplex"),
    (re.compile(r"^\s*speed\s+(10|100|1000|auto)", re.I),        "speed"),
    (re.compile(r"^router bgp\s+\d+", re.I),                     "BGP process"),
    (re.compile(r"^\s*neighbor\s+\S+\s+remote-as\s+\d+", re.I), "BGP neighbor"),
    (re.compile(r"^router ospf\s+\d+", re.I),                    "OSPF process"),
    (re.compile(r"^\s*network\s+\d{1,3}(?:\.\d{1,3}){3}\s+\d{1,3}(?:\.\d{1,3}){3}\s+area\s+\d+", re.I), "OSPF network"),
    (re.compile(r"^ip route\s+\S+\s+\S+", re.I),                "static route"),
    (re.compile(r"^(ip )?access-list\s+(standard|extended)\s+\S+", re.I), "ACL declaration"),
    (re.compile(r"^\s*(permit|deny)\s+.+", re.I),                "ACL entry"),
    (re.compile(r"^ntp server\s+\S+", re.I),                     "NTP"),
    (re.compile(r"^logging\s+\S+", re.I),                        "logging"),
    (re.compile(r"^hostname\s+\S+", re.I),                       "hostname"),
    (re.compile(r"^exit$", re.I),                                 "exit"),
    (re.compile(r"^!", re.I),                                     "comment"),
    (re.compile(r"^\s*$", re.I),                                  "blank line"),
]

def validate_ios_command(command: str) -> tuple[bool, str]:
    """Returns (is_valid, matched_category)."""
    for pattern, category in VALID_PATTERNS:
        if pattern.match(command.strip()):
            return True, category
    return False, "unknown"

def validate_config_block(commands: list[str]) -> dict:
    results = []
    invalid = []
    for i, cmd in enumerate(commands, start=1):
        valid, category = validate_ios_command(cmd)
        if not valid:
            invalid.append(cmd.strip())
        results.append({"line": i, "command": cmd.strip(), "valid": valid, "category": category})
    return {
        "valid": len(invalid) == 0,
        "invalid_commands": invalid,
        "results": results,
        "summary": f"All {len(commands)} commands valid." if not invalid
                   else f"{len(invalid)} invalid command(s): {', '.join(invalid)}",
    }
```

## Subnet Overlap Detection

```python
import ipaddress

def find_subnet_overlaps(subnets: list[str]) -> list[tuple[str, str]]:
    """Return pairs of overlapping subnet strings."""
    networks = []
    for s in subnets:
        try:
            networks.append(ipaddress.ip_network(s, strict=False))
        except ValueError:
            pass
    overlaps = []
    for i, a in enumerate(networks):
        for b in networks[i+1:]:
            if a.overlaps(b):
                overlaps.append((str(a), str(b)))
    return overlaps

# Extract subnets from a running-config
import re
IP_ADDR_RE = re.compile(
    r"ip address (?P<ip>\d{1,3}(?:\.\d{1,3}){3}) (?P<mask>\d{1,3}(?:\.\d{1,3}){3})"
)

def extract_subnets_from_config(config: str) -> list[str]:
    subnets = []
    for m in IP_ADDR_RE.finditer(config):
        network = ipaddress.ip_interface(f"{m.group('ip')}/{m.group('mask')}").network
        subnets.append(str(network))
    return subnets

# Usage
config = open("router.cfg").read()
subnets = extract_subnets_from_config(config)
overlaps = find_subnet_overlaps(subnets)
if overlaps:
    for a, b in overlaps:
        print(f"OVERLAP: {a} overlaps with {b}")
```

## Duplicate IP Detection

```python
from collections import Counter

def find_duplicate_ips(config: str) -> list[str]:
    """Find IP addresses assigned more than once in a config."""
    matches = re.findall(
        r"ip address (\d{1,3}(?:\.\d{1,3}){3}) \d{1,3}(?:\.\d{1,3}){3}",
        config,
        re.IGNORECASE,
    )
    counts = Counter(matches)
    return [ip for ip, count in counts.items() if count > 1]
```

## Missing Best Practice Checks

```python
BEST_PRACTICE_CHECKS = [
    (r"ntp server",           "NTP — required for accurate log timestamps"),
    (r"logging \S+",          "remote syslog — required for audit trail"),
    (r"snmp-server group",    "SNMPv3 — use v3 with auth+priv instead of v2c community strings"),
    (r"service timestamps",   "timestamps in log messages"),
    (r"banner (motd|login)",  "login banner — legal requirement in many orgs"),
    (r"ip ssh version 2",     "SSH v2 (v1 has known vulnerabilities)"),
]

def check_best_practices(config: str) -> list[str]:
    missing = []
    for pattern, description in BEST_PRACTICE_CHECKS:
        if not re.search(pattern, config, re.IGNORECASE):
            missing.append(f"Missing: {description}")
    return missing
```

## Security Checks

```python
SECURITY_CHECKS = [
    # SNMP v2 with 'public' community is a well-known security risk
    (re.compile(r"snmp-server community public", re.I),
     "SNMP community 'public' — change to something non-default"),
    # Open VTY lines with no access-class allow anyone to SSH in
    (re.compile(r"line vty.*\n(?:(?!access-class).)*\n", re.I),
     "VTY lines without access-class — restrict SSH access by source IP"),
    # SSH v1 has known vulnerabilities
    (re.compile(r"ip ssh version 1", re.I),
     "SSH version 1 enabled — upgrade to version 2"),
    # Telnet is cleartext
    (re.compile(r"transport input telnet", re.I),
     "Telnet enabled on VTY lines — use SSH only"),
    # No enable secret means enable password is either weak or absent
    (re.compile(r"enable password\b", re.I),
     "enable password (MD5-hashed) — use 'enable secret' instead"),
]

def check_security(config: str) -> list[str]:
    issues = []
    for pattern, description in SECURITY_CHECKS:
        if pattern.search(config):
            issues.append(f"SECURITY: {description}")
    return issues
```

## Full Pre-Flight Report

```python
def pre_flight_check(config_lines: list[str]) -> dict:
    config_str = "\n".join(config_lines)
    dangerous   = check_dangerous_commands(config_lines)
    validation  = validate_config_block(config_lines)
    security    = check_security(config_str)
    best_prac   = check_best_practices(config_str)
    subnets     = extract_subnets_from_config(config_str)
    overlaps    = find_subnet_overlaps(subnets)
    dup_ips     = find_duplicate_ips(config_str)

    return {
        "dangerous_commands": dangerous,
        "syntax_valid": validation["valid"],        # informational only — whitelist is not exhaustive
        "invalid_commands": validation["invalid_commands"],
        "security_issues": security,
        "missing_best_practices": best_prac,
        "subnet_overlaps": overlaps,
        "duplicate_ips": dup_ips,
        # syntax_valid is excluded from overall — the whitelist doesn't cover all valid IOS commands
        "overall": "PASS" if not dangerous and not security
                             and not overlaps and not dup_ips
                   else "FAIL",
    }
```

## Anti-Patterns

```
# BAD: Applying config to a device without a dry-run review
# One wrong command can take down a production link

# BAD: Not checking for subnet overlaps when adding new interfaces
# Overlapping subnets cause routing black holes

# BAD: Not saving config after changes
# A reload will lose all running-config changes

# BAD: Using 'enable password' instead of 'enable secret'
# 'enable password' uses weak reversible encryption; 'enable secret' uses a stronger hash

# BAD: Leaving SNMP community 'public' in production
# Default SNMP communities are scanned constantly by internet bots
```

## Best Practices

- Always run a pre-flight check before pushing config — dangerous command detection alone prevents major incidents
- Use `propose_config_change` (dry-run only) before any live `apply_config_change`
- Verify subnet allocation centrally with IPAM before assigning any new IP range to a device
- After applying config, run `write memory` and then verify with `show running-config | section <changed section>`
- Keep ACL entries numbered (e.g. `10`, `20`, `30`) so you can insert rules between them without rewriting

## Related Skills

- cisco-ios-patterns
- network-bgp-diagnostics
- network-interface-health
- netmiko-ssh-automation
