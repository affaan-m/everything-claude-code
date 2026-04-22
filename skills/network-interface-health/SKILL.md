---
name: network-interface-health
description: Diagnosing network interface errors including CRC errors, input/output drops, runts, giants, duplex mismatches, flapping, and speed negotiation failures on Cisco IOS/IOS-XE devices.
origin: ECC
---

# Network Interface Health

Patterns for reading interface counters, identifying error types, and diagnosing the root cause of interface problems. Interface health is the first check in almost every network troubleshooting session.

## When to Activate

- Investigating packet loss or high latency on a specific link
- Diagnosing CRC errors, input drops, or output drops on an interface
- Troubleshooting duplex mismatches or speed negotiation issues
- Investigating an interface that is flapping (going up and down)
- Reviewing interface health after a cable replacement or hardware change
- Building automation to monitor interface error counters at scale

## Reading `show interfaces` Output

```
GigabitEthernet0/0 is up, line protocol is up
  Hardware is iGbE, address is aabb.cc00.0100
  Description: UPLINK-TO-CORE
  Internet address is 10.0.0.1/30
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Full-duplex, 1000Mb/s, media type is T
  ...
  5 minute input rate 1234000 bits/sec, 890 packets/sec
  5 minute output rate 987000 bits/sec, 720 packets/sec
     1234567 packets input, 987654321 bytes, 0 no buffer
     Received 45 broadcasts (0 IP multicasts)
     0 runts, 0 giants, 0 throttles
     12 input errors, 12 CRC, 0 frame, 0 overrun, 0 ignored
     0 watchdog, 0 multicast, 0 pause input
     1098765 packets output, 876543210 bytes, 0 underruns
     0 output errors, 0 collisions, 2 interface resets
     0 unknown protocol drops
     0 babbles, 0 late collision, 0 deferred
     0 lost carrier, 0 no carrier, 0 pause output
     0 output buffer failures, 0 output buffers swapped out
```

### Counter Reference

| Counter | What it means | Common cause |
|---|---|---|
| `CRC` | Frames received with checksum mismatch | Bad cable, duplex mismatch, failing NIC/SFP |
| `input errors` | Sum of all input error types | See sub-counters |
| `runts` | Frames shorter than 64 bytes | Duplex mismatch, collisions |
| `giants` | Frames larger than MTU | Jumbo frames with no jumbo support, misconfigured MTU |
| `input drops` (no buffer) | Frames dropped — RX buffer full | Interface oversubscription, inbound traffic burst |
| `output drops` | Frames dropped in TX queue | Egress congestion, QoS tail drop |
| `interface resets` | Interface hardware reset | Flapping, keepalive failure, driver issue |
| `collisions` | Late/excessive collisions | Half-duplex operation or duplex mismatch |
| `throttles` | Input rate throttled by IOS | Severe inbound oversubscription |

## Diagnosing Specific Issues

### CRC Errors

CRC errors almost always mean a physical layer problem.

```
# Confirm CRC errors are incrementing (run twice, compare)
show interfaces GigabitEthernet0/0 | include CRC|input errors

# Steps:
# 1. Check cable — replace with a known-good cable
# 2. Check duplex and speed settings (mismatch is the most common cause)
show interfaces GigabitEthernet0/0 | include duplex|speed

# 3. Check SFP or transceiver
show interfaces GigabitEthernet0/0 transceiver

# 4. Check the connected switch/device's interface for counters too
# CRC errors are almost always on the receiving side of the bad signal
```

### Duplex Mismatch

The most common cause of CRC errors, collisions, and degraded throughput.

```
# Symptom: CRC errors on both ends, poor throughput, collisions
show interfaces Gi0/0 | include duplex|speed|collision

# Fix: Set explicit duplex and speed on both ends (never leave one as auto and one as fixed)
interface GigabitEthernet0/0
  duplex full
  speed 1000

# OR leave both ends as auto-negotiate (acceptable when both sides support it)
interface GigabitEthernet0/0
  duplex auto
  speed auto
  no shutdown
```

### Input Drops (Buffer Overrun)

```
# Symptom: 'no buffer' or high input drop counter
show interfaces GigabitEthernet0/0 | include drops|throttle|buffer

# Cause: inbound traffic rate exceeds what IOS can process
# Options:
# 1. Check for traffic bursts — high input rate at time of drops
show interfaces GigabitEthernet0/0 | include input rate

# 2. Increase input hold queue (IOS default: 75 packets)
interface GigabitEthernet0/0
  hold-queue 300 in

# 3. Consider hardware upgrade if sustained oversubscription
```

### Output Drops (Egress Congestion)

```
# Symptom: output drops incrementing under load
show interfaces GigabitEthernet0/0 | include output drops|queue

# Cause: egress interface is congested — packets arrive faster than they leave
# Options:
# 1. Enable QoS to prioritize critical traffic
# 2. Increase tx-ring-limit (hardware queue depth)
interface GigabitEthernet0/0
  tx-ring-limit 128

# 3. Check for asymmetric routing sending too much traffic to one interface
```

### Interface Flapping

```
# Check syslog for flap events
show logging | include GigabitEthernet0/0|changed state

# Check uptime counter — low value = recently flapped
show interfaces GigabitEthernet0/0 | include line protocol|reset

# Common causes:
# - Faulty cable or SFP
# - Keepalive mismatch (disable keepalives if connecting to non-IOS devices)
#   interface GigabitEthernet0/0
#     no keepalive
# - Speed/duplex negotiation failure
# - Power instability on connected device
```

## Python: Polling Interface Counters

```python
import re
from typing import Any

INTF_DETAIL_RE = re.compile(
    r"^(?P<interface>\S+) is (?P<status>(?:administratively )?down|up)"
    r", line protocol is (?P<protocol>up|down)",
    re.IGNORECASE | re.MULTILINE,
)
SPEED_DUPLEX_RE = re.compile(
    r"(?P<duplex>Full|Half|Auto)-duplex.*?(?P<speed>\d+\s*[MG]b(?:ps)?|Auto-speed|unknown)",
    re.IGNORECASE,
)
ERRORS_RE = re.compile(
    r"(?P<in_errors>\d+) input errors.*?(?P<crcs>\d+) CRC",
    re.IGNORECASE | re.DOTALL,
)

def parse_interface_health(raw: str) -> list[dict[str, Any]]:
    matches = list(INTF_DETAIL_RE.finditer(raw))
    results = []
    for i, m in enumerate(matches):
        name = m.group("interface")
        entry: dict[str, Any] = {
            "interface": name,
            "status": m.group("status"),
            "protocol": m.group("protocol"),
            "duplex": "unknown",
            "speed": "unknown",
            "input_errors": 0,
            "crc_errors": 0,
        }
        # Slice from this interface header to the start of the next one (or end of string)
        # This avoids reading counters from a neighbouring interface block
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw)
        chunk = raw[m.start():end]
        sd = SPEED_DUPLEX_RE.search(chunk)
        if sd:
            entry["duplex"] = sd.group("duplex")
            entry["speed"] = sd.group("speed")
        err = ERRORS_RE.search(chunk)
        if err:
            entry["input_errors"] = int(err.group("in_errors"))
            entry["crc_errors"] = int(err.group("crcs"))
        results.append(entry)
    return results

def find_unhealthy_interfaces(raw: str, crc_threshold: int = 0) -> list[dict]:
    return [
        i for i in parse_interface_health(raw)
        if i["crc_errors"] > crc_threshold
        or i["status"] != "up"
        or i["protocol"] != "up"
    ]
```

## Anti-Patterns

```
# BAD: Ignoring incrementing CRC errors — small numbers can indicate a developing fault
# A few CRCs per day will grow into thousands if the root cause isn't addressed

# BAD: Mixing auto-negotiate on one side with fixed speed/duplex on the other
# Fixed end transmits without flow control signals; auto end falls back to half-duplex
interface GigabitEthernet0/0
  duplex full      # fixed
  speed 1000       # fixed
# Partner interface left as auto — will negotiate half-duplex, causing collisions and CRCs

# BAD: Clearing counters without first noting baseline values
# Counters tell you history — clear only when you need a fresh measurement window
clear counters GigabitEthernet0/0   # loses historical data

# BAD: Only checking one side of a link
# CRC errors occur on the receiver. If Gi0/0 shows CRCs, check the transmitter
# on the OTHER end of the cable — the problem is usually there
```

## Best Practices

- Always check both ends of a link — errors are received, not transmitted
- Baseline counter values with `show interfaces` before a change window; compare after
- Use `show interfaces | include error|reset|drop` for a quick system-wide health check
- Explicitly set `duplex full` and `speed 1000` (or appropriate value) on uplinks where you control both ends — on uplinks to ISP or third-party equipment, leave both sides as auto-negotiate
- Configure SNMP polling on `ifInErrors` and `ifOutDiscards` OIDs for automated alerting
- Use `no keepalive` when connecting IOS to devices that don't support keepalives (some firewalls, servers)

## Related Skills

- cisco-ios-patterns
- network-bgp-diagnostics
- network-config-validation
