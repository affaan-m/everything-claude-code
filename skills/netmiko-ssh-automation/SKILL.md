---
name: netmiko-ssh-automation
description: Multi-vendor network device SSH automation using Python Netmiko — connecting, sending commands, parsing output, handling enable mode, error handling, and batch operations across device lists.
origin: ECC
---

# Netmiko SSH Automation

Patterns for automating network device interaction via SSH using Netmiko. Covers single-device connections, batch operations, enable mode, error handling, and output parsing.

## When to Activate

- Writing Python scripts to automate Cisco, Juniper, Arista, or other network devices via SSH
- Collecting show command output from multiple devices programmatically
- Applying configuration changes across a fleet of devices
- Parsing structured or semi-structured CLI output in Python
- Building network automation tools or scripts that talk to real devices

## Basic Connection

```python
from netmiko import ConnectHandler

device = {
    "device_type": "cisco_ios",     # See device type list below
    "host": "192.168.1.1",
    "username": "admin",
    "password": "secret",
    "secret": "enable_secret",      # Required for devices that need enable mode
    "port": 22,                     # Default SSH port
    "timeout": 30,                  # Connection timeout in seconds
    "session_log": "session.log",   # Optional: log all CLI I/O to a file
}

with ConnectHandler(**device) as conn:
    output = conn.send_command("show version")
    print(output)
# Connection auto-closes on context manager exit
```

## Device Types Reference

```python
# Common device_type values:
# cisco_ios        — Cisco IOS / IOS-XE
# cisco_nxos       — Cisco NX-OS (Nexus)
# cisco_xr         — Cisco IOS-XR
# cisco_asa        — Cisco ASA
# juniper_junos    — Juniper JunOS
# arista_eos       — Arista EOS
# linux            — Linux hosts (servers, Raspberry Pi, etc.)
# paloalto_panos   — Palo Alto PAN-OS
# fortinet         — Fortinet FortiOS
# mikrotik_routeros — MikroTik RouterOS

# For SSH key authentication instead of password:
device = {
    "device_type": "cisco_ios",
    "host": "192.168.1.1",
    "username": "admin",
    "use_keys": True,
    "key_file": "/home/user/.ssh/id_rsa",
}
```

## Enable Mode

```python
# Option 1: Auto-enter enable at connection time (recommended)
device = {
    "device_type": "cisco_ios",
    "host": "192.168.1.1",
    "username": "admin",
    "password": "secret",
    "secret": "enable_secret",
}
with ConnectHandler(**device) as conn:
    conn.enable()                    # Enter privileged exec
    output = conn.send_command("show running-config")

# Option 2: Check and enter enable as needed
with ConnectHandler(**device) as conn:
    if conn.check_enable_mode():
        print("Already in enable mode")
    else:
        conn.enable()
```

## Sending Configuration

```python
from netmiko import ConnectHandler

commands = [
    "interface GigabitEthernet0/1",
    "description AUTOMATION-TEST",
    "no shutdown",
]

with ConnectHandler(**device) as conn:
    conn.enable()
    # send_config_set handles 'configure terminal' and 'end' automatically
    output = conn.send_config_set(commands)
    print(output)

    # Save the config after changes
    conn.save_config()    # Runs 'write memory' or 'copy run start' as appropriate
```

## Batch Operations Across Multiple Devices

```python
from netmiko import ConnectHandler
from netmiko.exceptions import NetmikoAuthenticationException, NetmikoTimeoutException
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

DEVICES = [
    {"host": "10.0.0.1", "device_type": "cisco_ios"},
    {"host": "10.0.0.2", "device_type": "cisco_ios"},
    {"host": "10.0.0.3", "device_type": "arista_eos"},
]
BASE_CREDS = {"username": "admin", "password": "secret"}

def run_command_on_device(device_params: dict, command: str) -> dict[str, Any]:
    params = {**device_params, **BASE_CREDS}
    host = params["host"]
    try:
        with ConnectHandler(**params) as conn:
            output = conn.send_command(command)
        return {"host": host, "output": output, "error": None}
    except NetmikoAuthenticationException:
        return {"host": host, "output": None, "error": "Authentication failed"}
    except NetmikoTimeoutException:
        return {"host": host, "output": None, "error": "Connection timed out"}
    except Exception as e:
        return {"host": host, "output": None, "error": str(e)}

# Run in parallel (max 10 concurrent connections)
results = []
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {
        executor.submit(run_command_on_device, d, "show version"): d["host"]
        for d in DEVICES
    }
    for future in as_completed(futures):
        results.append(future.result())

for r in results:
    if r["error"]:
        print(f"{r['host']}: ERROR — {r['error']}")
    else:
        print(f"{r['host']}: OK")
```

## Parsing Output

```python
from netmiko import ConnectHandler
import re

# TextFSM parsing (returns structured list of dicts when templates exist)
with ConnectHandler(**device) as conn:
    # use_textfsm=True applies NTC-templates automatically for known commands
    parsed = conn.send_command("show ip interface brief", use_textfsm=True)
    # Returns list of dicts: [{"intf": "Gi0/0", "ipaddr": "10.0.0.1", ...}]
    for intf in parsed:
        print(f"{intf['intf']}: {intf['ipaddr']} — {intf['status']}/{intf['proto']}")

# Manual regex parsing when TextFSM templates don't exist
BGP_NEIGHBOR_RE = re.compile(
    r"^(?P<ip>\d{1,3}(?:\.\d{1,3}){3})\s+\d+\s+(?P<as>\d+)"
    r"\s+\d+\s+\d+\s+\d+\s+\d+\s+(?P<uptime>\S+)\s+(?P<state>\S+)",
    re.MULTILINE,
)

with ConnectHandler(**device) as conn:
    raw = conn.send_command("show bgp summary")

for m in BGP_NEIGHBOR_RE.finditer(raw):
    print(f"Neighbor {m.group('ip')} (AS {m.group('as')}): {m.group('state')}")
```

## Error Handling Patterns

```python
from netmiko import ConnectHandler
from netmiko.exceptions import (
    NetmikoAuthenticationException,
    NetmikoTimeoutException,
    NetMikoTimeoutException,  # Legacy alias — handle both
)
import socket

def safe_connect(device_params: dict) -> dict:
    host = device_params.get("host", "unknown")
    try:
        conn = ConnectHandler(**device_params)
        return {"conn": conn, "error": None}
    except NetmikoAuthenticationException:
        return {"conn": None, "error": f"{host}: authentication failed"}
    except (NetmikoTimeoutException, NetMikoTimeoutException):
        return {"conn": None, "error": f"{host}: SSH timeout"}
    except socket.gaierror:
        return {"conn": None, "error": f"{host}: DNS resolution failed"}
    except ConnectionRefusedError:
        return {"conn": None, "error": f"{host}: SSH port not open"}
    except Exception as e:
        return {"conn": None, "error": f"{host}: {type(e).__name__}: {e}"}
```

## Anti-Patterns

```python
# BAD: Not using context manager — connection leaks if an exception occurs
conn = ConnectHandler(**device)
output = conn.send_command("show version")
# If exception happens here, conn.disconnect() is never called
conn.disconnect()

# GOOD: Always use context manager
with ConnectHandler(**device) as conn:
    output = conn.send_command("show version")

# BAD: Hardcoding credentials in source code
device = {
    "host": "10.0.0.1",
    "username": "admin",
    "password": "MyPassword123",   # Never do this
}

# GOOD: Load from environment variables or a secrets manager
import os
device = {
    "host": "10.0.0.1",
    "username": os.environ["NET_USERNAME"],
    "password": os.environ["NET_PASSWORD"],
}

# BAD: Running batch operations sequentially — very slow at scale
for d in devices:
    result = run_command_on_device(d, "show version")  # Sequential, slow

# GOOD: Use ThreadPoolExecutor for parallel SSH connections (see Batch Operations above)

# BAD: Sending config without saving
conn.send_config_set(["interface Gi0/1", "description CHANGED"])
# Config is in running-config only — lost on reload

# GOOD: Always save after config changes
conn.send_config_set(["interface Gi0/1", "description CHANGED"])
conn.save_config()
```

## Best Practices

- Always use context managers (`with ConnectHandler(...) as conn`) for automatic cleanup
- Store credentials in environment variables or a vault — never in source code
- Set explicit `timeout` values — default can be too long for large-scale automation
- Use `session_log` during development to capture full CLI I/O for debugging
- Use `use_textfsm=True` on supported commands for structured output — much easier to process
- Wrap all connections in try/except to handle unreachable devices gracefully in batch jobs
- Limit parallel threads to 10–20 — more can exhaust SSH sessions on older devices

## Related Skills

- cisco-ios-patterns
- network-bgp-diagnostics
- network-config-validation
