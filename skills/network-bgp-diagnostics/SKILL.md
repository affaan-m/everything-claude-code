---
name: network-bgp-diagnostics
description: BGP neighbor state analysis, stuck session troubleshooting, AS path inspection, route filtering, and peering issue diagnosis on Cisco IOS/IOS-XE and multi-vendor devices.
origin: ECC
---

# Network BGP Diagnostics

Patterns and commands for diagnosing BGP peering problems, stuck neighbor states, route advertisement issues, and AS path anomalies.

## When to Activate

- Troubleshooting BGP neighbor sessions not reaching Established state
- Diagnosing why a BGP peer shows Active, Idle, or Connect state
- Investigating missing or unexpected routes in the BGP table
- Analyzing AS path attributes, route-maps, or prefix filters
- Debugging BGP flapping neighbors or high message counts
- Validating BGP configuration before or after a change window

## Reading BGP Summary Output

### Cisco IOS-XE: `show bgp summary`

```
BGP router identifier 10.0.0.1, local AS number 65001
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.0.0.2        4 65002    1234    5678        42    0    0 01:23:45        10
10.0.0.3        4 65003       0       5         0    0    0 00:02:11  Active
10.0.0.4        4 65004      12      10         0    0    0 never      Idle
```

**State/PfxRcd column interpretation:**
| Value | Meaning |
|---|---|
| Integer (e.g. `10`) | Established — number of prefixes received |
| `Active` | Trying to open TCP connection to peer |
| `Idle` | Not trying — check for misconfiguration or `shutdown` |
| `Connect` | TCP SYN sent, waiting for peer response |
| `OpenSent` | TCP connected, BGP OPEN sent, waiting reply |
| `OpenConfirm` | OPEN received, waiting KEEPALIVE |

### Key fields to check when a session isn't Established

```
# Check whether the neighbor is configured and enabled
show bgp neighbors 10.0.0.3

# Look for these in the output:
#   BGP state = Active  (TCP failing)
#   BGP state = Idle, reason: No route to host
#   Hold time: 0  (peer sent OPEN with hold time 0 — may be intentional)
#   Last reset: never / <timestamp> + reason
```

## Diagnosing Stuck States

### Active state — TCP not establishing

```
# 1. Verify IP reachability to the peer
ping 10.0.0.3 source Loopback0

# 2. Check the routing table for a path to the peer
show ip route 10.0.0.3

# 3. Verify the update-source matches what the peer expects
show bgp neighbors 10.0.0.3 | include source|local

# 4. Check ACLs or firewalls blocking TCP 179
show ip access-lists | include 179

# Common fix: misconfigured update-source
router bgp 65001
  neighbor 10.0.0.3 update-source Loopback0
```

### Idle state — session administratively down or misconfigured

```
# Check if neighbor is manually shut down
show bgp neighbors 10.0.0.4 | include shutdown|Idle

# Check for AS number mismatch
show bgp neighbors 10.0.0.4 | include remote AS|configured

# Re-enable a shut neighbor
router bgp 65001
  no neighbor 10.0.0.4 shutdown
```

### Established but no routes exchanged

```
# Check inbound route policy
show bgp neighbors 10.0.0.2 | include policy|filter|prefix

# Check what's being advertised
show bgp neighbors 10.0.0.2 advertised-routes

# Check what's being received (before policy)
show bgp neighbors 10.0.0.2 received-routes

# Check what's in the table after policy
show bgp neighbors 10.0.0.2 routes
```

## Route Filtering Troubleshooting

```
# Check if a prefix-list is blocking routes
show ip prefix-list INBOUND-FILTER

# Trace why a specific prefix is missing
show bgp 192.168.100.0/24

# Check route-map applied to neighbor
show route-map PEER-IN

# Force re-advertisement after policy change (no hard reset)
clear ip bgp 10.0.0.2 soft in
clear ip bgp 10.0.0.2 soft out
```

## AS Path Analysis

```
# Find routes with specific AS in path
show bgp regexp _65003_

# Find routes originating from a specific AS
show bgp regexp ^65003$

# Find all iBGP routes
show bgp regexp ^$

# Count hops to a destination
show bgp 203.0.113.0/24 | include Path

# Check for AS path prepending
show bgp neighbors 10.0.0.2 advertised-routes | include Path
```

## Python: Parsing BGP Summary Output

```python
import re

# Match a standard IOS/IOS-XE BGP summary neighbor line
SUMMARY_RE = re.compile(
    r"^(?P<neighbor>\d{1,3}(?:\.\d{1,3}){3})\s+"
    r"(?P<version>\d+)\s+"
    r"(?P<remote_as>\d+)\s+"
    r"(?P<msg_rcvd>\d+)\s+"
    r"(?P<msg_sent>\d+)\s+"
    r"(?P<tbl_ver>\d+)\s+"
    r"(?P<in_q>\d+)\s+"
    r"(?P<out_q>\d+)\s+"
    r"(?P<uptime>\S+)\s+"
    r"(?P<state_pfx>\S+)",
    re.MULTILINE,
)

def parse_bgp_summary(raw: str) -> list[dict]:
    neighbors = []
    for m in SUMMARY_RE.finditer(raw):
        state_pfx = m.group("state_pfx")
        try:
            prefixes = int(state_pfx)
            state = "Established"
        except ValueError:
            prefixes = 0
            state = state_pfx
        neighbors.append({
            "neighbor": m.group("neighbor"),
            "remote_as": int(m.group("remote_as")),
            "state": state,
            "prefixes_received": prefixes,
            "uptime": m.group("uptime"),
        })
    return neighbors

# Find non-established sessions
def find_problem_sessions(raw: str) -> list[dict]:
    return [n for n in parse_bgp_summary(raw) if n["state"] != "Established"]
```

## Anti-Patterns

```
# BAD: Hard reset — tears down and rebuilds the TCP session, causes route flap
clear ip bgp 10.0.0.2

# GOOD: Soft reset — re-applies policy without dropping the session
clear ip bgp 10.0.0.2 soft in
clear ip bgp 10.0.0.2 soft out

# BAD: Relying on numeric AS path regexp without anchors — matches unintended ASes
show bgp regexp 65003   # matches 65003, 165003, 650039, etc.

# GOOD: Use anchors for exact AS matching
show bgp regexp _65003_   # word-boundary match
show bgp regexp ^65003$   # exact origin AS

# BAD: Forgetting that 'received-routes' requires 'soft-reconfiguration inbound'
# If you haven't configured it, the command will fail
neighbor 10.0.0.2 soft-reconfiguration inbound   # add this to see received routes

# BAD: Mismatched MD5 authentication — session shows Active with no TCP errors
# Check both sides have the same password configured
show bgp neighbors 10.0.0.2 | include password|MD5
```

## Best Practices

- Always use `soft` resets (`clear ip bgp <ip> soft`) to avoid dropping the session
- Set `neighbor <ip> description` on every peer — makes `show bgp summary` readable at a glance
- Use Loopback interfaces as BGP update-source for iBGP — more resilient to physical link failures
- Configure `neighbor <ip> fall-over` for fast failure detection on directly connected eBGP peers
- Set explicit hold timers — the default 90/30s can be too slow for production networks
- Use `neighbor <ip> soft-reconfiguration inbound` if you need to inspect received routes before policy

## Related Skills

- cisco-ios-patterns
- network-config-validation
- network-ospf-troubleshooting
