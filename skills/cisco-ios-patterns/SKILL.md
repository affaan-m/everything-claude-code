---
name: cisco-ios-patterns
description: Cisco IOS and IOS-XE configuration syntax, show commands, privilege levels, config mode navigation, wildcard masks, and the most common operational gotchas.
origin: ECC
---

# Cisco IOS Patterns

Reference patterns for working with Cisco IOS and IOS-XE — the most common network OS in enterprise environments. Covers config syntax, show commands, privilege levels, and the gotchas that cause the most operational incidents.

## When to Activate

- Writing or reviewing Cisco IOS/IOS-XE configuration
- Generating show commands for troubleshooting
- Explaining IOS config mode hierarchy or privilege levels
- Helping with ACL wildcard mask calculations
- Diagnosing why a config change didn't take effect
- Automating IOS device interaction with Python/Netmiko

## Config Mode Hierarchy

```
Router> enable                    # Enter privileged EXEC (requires enable password)
Router# configure terminal        # Enter global config mode
Router(config)# interface Gi0/0   # Enter interface sub-mode
Router(config-if)# ip address 10.0.0.1 255.255.255.0
Router(config-if)# no shutdown
Router(config-if)# exit           # Back to global config
Router(config)# router bgp 65001  # Enter routing process sub-mode
Router(config-router)# end        # Jump straight back to privileged EXEC
Router# write memory              # Save — or use: copy running-config startup-config
```

**Critical gotcha: forgetting `write memory`**
IOS running-config is in RAM. A reload without saving loses all unsaved changes. Always verify with `show running-config | include <key phrase>` before and after a change window, then save.

## Essential Show Commands

```
# System state
show version                      # IOS version, uptime, hardware
show inventory                    # Physical hardware/modules
show processes cpu sorted         # CPU utilization
show memory statistics            # Memory usage

# Interfaces
show interfaces                   # Full interface detail — errors, counters, speed/duplex
show ip interface brief           # Quick status table for all interfaces
show interfaces GigabitEthernet0/0 # Single interface detail
show interfaces trunk             # Trunk port status and allowed VLANs

# Routing
show ip route                     # Full routing table
show ip route 10.0.0.0            # Longest match for a specific prefix
show ip protocols                 # Running routing protocols + parameters
show ip ospf neighbor             # OSPF adjacency table
show bgp summary                  # BGP session table

# Layer 2
show vlan brief                   # VLAN table
show spanning-tree                # STP state per VLAN
show mac address-table            # CAM table

# Access lists
show ip access-lists              # ACL contents + hit counters
show ip access-lists MYACL        # Specific ACL

# Logging and events
show logging                      # Syslog buffer
show ip nat translations          # Active NAT entries
```

## Wildcard Masks

Wildcard masks are the inverse of subnet masks. `0` = must match, `1` = don't care.

```
# Subnet mask  →  Wildcard mask
255.255.255.0  →  0.0.0.255      (match /24 network)
255.255.255.252 → 0.0.0.3        (match /30 — point-to-point links)
255.255.0.0    →  0.0.255.255    (match /16 network)
255.0.0.0      →  0.255.255.255  (match /8 network)
0.0.0.0        →  255.255.255.255 (match any host — used in OSPF: network 0.0.0.0 255.255.255.255 area 0)
255.255.255.255 → 0.0.0.0        (match one specific host)

# Formula: wildcard = 255.255.255.255 - subnet_mask
# Example: wildcard for 255.255.255.224 = 255.255.255.255 - 255.255.255.224 = 0.0.0.31

# ACL examples
access-list 10 permit 192.168.1.0 0.0.0.255     # Permit entire /24
access-list 10 permit 10.0.0.1 0.0.0.0          # Permit single host
access-list 10 permit 172.16.0.0 0.0.255.255     # Permit entire /16

# OSPF network statements
router ospf 1
  network 10.0.0.0 0.0.0.255 area 0    # Advertise /24 in area 0
  network 0.0.0.0 255.255.255.255 area 0  # Advertise all interfaces (use with care)
```

## ACL Structure and Implicit Deny

```
# Every ACL ends with an invisible implicit deny all
# If no permit matches, traffic is dropped silently

ip access-list extended INBOUND
  10 permit tcp 10.0.0.0 0.0.0.255 any eq 80
  20 permit tcp 10.0.0.0 0.0.0.255 any eq 443
  30 permit icmp any any
  ! implicit deny ip any any here — no log, no counter increment

# Make the deny visible and logged
ip access-list extended INBOUND
  10 permit tcp 10.0.0.0 0.0.0.255 any eq 80
  20 permit tcp 10.0.0.0 0.0.0.255 any eq 443
  30 permit icmp any any
  999 deny ip any any log   # Now shows in 'show ip access-lists' with hit count

# Check ACL hit counts to confirm traffic is matching expected entries
show ip access-lists INBOUND
```

## Interface Configuration Patterns

```
interface GigabitEthernet0/0
 description UPLINK-TO-CORE
 ip address 10.0.1.1 255.255.255.252
 no shutdown
 duplex full
 speed 1000

# Layer 2 access port
interface GigabitEthernet0/1
 description WORKSTATION-PORT
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 no shutdown

# Layer 2 trunk port
interface GigabitEthernet0/2
 description TRUNK-TO-DISTRIBUTION
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,100
 switchport trunk native vlan 999
 no shutdown

# Loopback — used for management, BGP update-source, router-id
interface Loopback0
 description MGMT-LOOPBACK
 ip address 10.255.0.1 255.255.255.255
```

## Privilege Levels

```
# IOS has 16 privilege levels (0–15)
# 0 = user EXEC (ping, traceroute, show version)
# 1 = default user mode
# 15 = full privileged EXEC (all commands)

# Assign a specific command to a lower privilege level
privilege exec level 5 show running-config

# Create a user at a specific privilege level
username readonly privilege 5 secret MyPassword

# Check current privilege level
show privilege

# Drop back from privileged to user EXEC
disable
```

## Saving and Verifying Config

```
# Save running config to startup config (survives reload)
write memory
# or equivalently:
copy running-config startup-config

# View only the lines you care about
show running-config | include bgp
show running-config | include interface|ip address
show running-config | section router bgp
show running-config | section interface GigabitEthernet

# Compare running vs startup (identify unsaved changes)
show archive config differences nvram:startup-config system:running-config
```

## Anti-Patterns

```
# BAD: Applying an ACL to an interface without testing it first
# An overly broad deny can black-hole your own management traffic
# Always verify the ACL with 'show ip access-lists' and test from a safe source first

# BAD: Using wrong wildcard mask in OSPF network statement
router ospf 1
  network 10.0.0.0 255.255.255.0 area 0   # WRONG — this is a subnet mask, not wildcard
  network 10.0.0.0 0.0.0.255 area 0       # CORRECT

# BAD: Forgetting 'no shutdown' on a new interface
interface GigabitEthernet0/1
  ip address 192.168.1.1 255.255.255.0
  # Missing 'no shutdown' — interface stays down

# BAD: Putting ACL on wrong interface direction
# 'in' filters traffic entering the interface (from that network into the router)
# 'out' filters traffic leaving the interface (from the router to that network)
ip access-group MYACL in   # Applied to the interface, not the ACL definition
```

## Best Practices

- Always add `description` to every interface and BGP neighbor — makes troubleshooting faster
- Use named ACLs (`ip access-list extended NAME`) instead of numbered — easier to edit individual entries
- Set `service timestamps log datetime msec localtime` so log entries have useful timestamps
- Configure `logging buffered 16384 informational` to keep a local syslog buffer
- Use `no ip domain-lookup` to prevent IOS from trying to DNS-resolve mistyped commands
- Set `exec-timeout 15 0` on VTY lines so idle sessions don't lock out other users
- Test ACLs with `show ip access-lists` hit counters before and after applying

## Related Skills

- network-bgp-diagnostics
- network-interface-health
- network-config-validation
