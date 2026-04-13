---
name: homelab-network-setup
description: Home network architecture from scratch — gateway placement, switch and AP selection, IP addressing scheme design, DHCP scoping, and common setup mistakes for homelab beginners.
origin: ECC
---

# Homelab Network Setup

A practical guide to designing and building a home network from the ground up. Covers hardware decisions, IP addressing, DHCP, and the layout patterns that scale as your homelab grows.

## When to Activate

- Helping someone design or redesign their home network from scratch
- Choosing between router/switch hardware options for a homelab
- Designing an IP addressing scheme for a home network
- Setting up DHCP scoping and reservations
- Planning a network that will support VLANs, a NAS, a Pi, and self-hosted services
- Troubleshooting connectivity on a newly built home network

## Hardware Roles

```
Internet
   │
[Modem / ONT]
   │
[Gateway / Router]  ← handles NAT, firewall, DHCP, DNS
   │
[Managed Switch]    ← VLAN trunk, connects wired devices
   ├── [Access Points]  ← Wi-Fi (ideally wired backhaul to switch)
   ├── [NAS / Server]
   ├── [Desktop / workstation]
   └── [Raspberry Pi / homelab server]
```

**Gateway options by experience level:**
| Option | Best for | Notes |
|---|---|---|
| ISP-provided router | Complete beginner | Limited features, hard to extend |
| UniFi Dream Machine (UDM) | Intermediate | All-in-one, good UI, UniFi ecosystem |
| pfSense / OPNsense on mini PC | Intermediate–Advanced | Full control, VLAN-aware, free software |
| MikroTik hEX / RB series | Advanced | Very capable, steep learning curve |
| Raspberry Pi + nftables | Tinkerers | Works, but not recommended for primary gateway |

## IP Addressing Design

Design your IP space before buying anything. A clean scheme saves hours of confusion.

```
# Recommended private ranges for home use
10.0.0.0/8     — Large enterprises; works fine at home but feels like overkill
172.16.0.0/12  — Less commonly used; good choice to avoid VPN conflicts
192.168.0.0/16 — Most common at home; ISP routers default to 192.168.1.0/24

# Recommended scheme for a growing homelab
Network: 192.168.0.0/16   (65,534 usable addresses — room to grow)

Subnet plan:
  192.168.1.0/24  — Trusted devices (PCs, phones, laptops)      254 hosts
  192.168.2.0/24  — IoT devices (smart plugs, cameras, TVs)     254 hosts
  192.168.3.0/24  — Servers / homelab (Pi, NAS, VMs)            254 hosts
  192.168.4.0/24  — Guest network                               254 hosts
  192.168.10.0/24 — Management (switch, APs, router web UI)     254 hosts

# Gateway IP convention: .1 of each subnet
  192.168.1.1     — Trusted VLAN gateway
  192.168.2.1     — IoT VLAN gateway
  192.168.3.1     — Servers VLAN gateway

# Reserve the bottom of each DHCP pool for static assignments
  192.168.1.1   — Gateway
  192.168.1.2–20 — Static reservations (printers, NAS, Pi, etc.)
  192.168.1.21–254 — DHCP dynamic pool
```

## DHCP Configuration

```
# pfSense / OPNsense: set in Services → DHCP Server per interface
# UniFi: set per network in UniFi Network controller

# Key DHCP settings for each subnet:
  Range: .21 to .254  (reserve .1–.20 for static)
  DNS: point to Pi-hole IP if you have one, otherwise gateway IP
  Lease time: 86400 (24h) for trusted; 3600 (1h) for IoT/guest
  Domain: home.lan  (makes hostnames like nas.home.lan work)

# DHCP reservations (static IP by MAC address) — set these for:
  - NAS
  - Raspberry Pi / homelab servers
  - Printers
  - Any device you SSH into or host services on
```

## DNS Setup

```
# Option A: Use your gateway as DNS
  Simple, works out of the box, no ad blocking

# Option B: Pi-hole as DNS (recommended for homelab)
  1. Install Pi-hole on a Raspberry Pi (see homelab-pihole-dns skill)
  2. Give Pi-hole a static IP: 192.168.3.2 (or your server subnet)
  3. In DHCP settings, set DNS to Pi-hole IP instead of gateway
  4. All devices get ad/malware blocking automatically

# Option C: Local DNS resolver (Unbound on pfSense/OPNsense)
  Resolves DNS directly from root servers — no upstream ISP DNS queries
  Pair with Pi-hole for both local resolution and ad blocking
```

## Common Beginner Mistakes

```
# MISTAKE 1: Double NAT
# Connecting ISP router (NAT) → your router (NAT) = double NAT
# Symptoms: port forwarding breaks, certain apps fail, slower speeds
# Fix: put the ISP router in bridge mode, or use your ISP router as gateway only

# MISTAKE 2: Using the same 192.168.1.0/24 as your VPN provider
# Remote VPN tunnels to the same subnet cause routing conflicts
# Fix: change your LAN subnet to something less common (192.168.50.0/24)

# MISTAKE 3: Connecting APs via Wi-Fi mesh to main router
# Wireless backhaul cuts bandwidth in half on each hop
# Fix: run Ethernet to each AP (even a single Cat6 cable makes a big difference)

# MISTAKE 4: Not giving servers static IPs / DHCP reservations
# Your NAS, Pi, or self-hosted service changes IP on lease renewal
# Fix: always use DHCP reservations (tied to MAC) for anything you host services on

# MISTAKE 5: Skipping VLANs, then regretting it
# IoT devices on the same network as your PCs is a security risk
# Fix: plan VLAN segmentation from day 1 (see homelab-vlan-segmentation skill)
```

## Cabling Tips

```
# Cat6 is the right choice for a new homelab run in 2024+
# - Supports 10 Gbps up to 55m; 1 Gbps up to 100m
# - Future-proof for multi-gig switches

# PoE (Power over Ethernet) — buy a PoE switch and you won't need wall adapters for APs
# 802.3af (PoE): 15.4W per port — older APs
# 802.3at (PoE+): 30W per port — most current APs, cameras
# 802.3bt (PoE++): 60W per port — high-power APs, some cameras

# Patch panel in the comms closet → Ethernet runs to wall plates
# Even if you only have 3 devices now, a patch panel makes moves/changes easy later
```

## Anti-Patterns

```
# BAD: Leaving the ISP router doing NAT + your router doing NAT = double NAT
# BAD: Using 192.168.1.0/24 when you plan to run a VPN (conflicts with many hotel/office nets)
# BAD: Wi-Fi backhaul for APs — kill the wireless hop, run Ethernet
# BAD: Dynamic DHCP leases for servers — they'll change IPs and break your DNS/bookmarks
# BAD: All devices on one flat network — IoT devices can attack your PCs
```

## Best Practices

- Design your IP addressing scheme on paper before touching any hardware
- Use a /24 per role/VLAN — simple, standard, easy to explain to anyone
- Give every server and service a DHCP reservation or static IP from day one
- PoE switch + wired APs beats mesh Wi-Fi for reliability and speed
- Plan for VLANs from the start even if you don't implement them immediately
- Use a UPS (battery backup) on your gateway, switch, and any always-on servers

## Related Skills

- homelab-vlan-segmentation
- homelab-pihole-dns
- homelab-wireguard-vpn
