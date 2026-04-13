---
name: homelab-wireguard-vpn
description: WireGuard VPN server setup, peer configuration, key generation, split tunneling vs full tunnel routing, and remote access to a home network from mobile and laptop clients.
origin: ECC
---

# Homelab WireGuard VPN

WireGuard is a fast, modern VPN protocol. It's the right choice for remote access to a home network — simpler to configure than OpenVPN, and faster than most alternatives.

## When to Activate

- Setting up WireGuard server on a Raspberry Pi, Linux host, pfSense, or router
- Generating WireGuard keypairs and writing peer config files
- Configuring remote access from a phone or laptop to a home network
- Explaining split tunneling (route only home traffic) vs full tunnel (route all traffic)
- Troubleshooting WireGuard connections that won't come up
- Automating peer configuration generation for multiple clients

## How WireGuard Works

```
Your phone (WireGuard client)
    │
    │  Encrypted UDP tunnel (port 51820)
    │
Your home router (WireGuard server — needs a public IP or DDNS)
    │
    Your home network (192.168.1.0/24, NAS, Pi, etc.)

Every device has a keypair (public + private key).
The server knows each client's public key.
The client knows the server's public key + endpoint (IP:port).
Traffic is encrypted end-to-end with no central server or certificate authority.
```

## Server Setup (Linux)

```bash
# Install WireGuard
sudo apt update && sudo apt install wireguard -y

# Generate server keypair
wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key
sudo chmod 600 /etc/wireguard/server_private.key

# Server config: /etc/wireguard/wg0.conf
sudo tee /etc/wireguard/wg0.conf << EOF
[Interface]
Address = 10.8.0.1/24              # VPN subnet — server gets .1
ListenPort = 51820
PrivateKey = $(cat /etc/wireguard/server_private.key)
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
# Phone
PublicKey = <phone_public_key>
AllowedIPs = 10.8.0.2/32           # This peer gets .2 on the VPN

[Peer]
# Laptop
PublicKey = <laptop_public_key>
AllowedIPs = 10.8.0.3/32
EOF

# Enable IP forwarding (required for routing traffic through the VPN server)
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Start WireGuard and enable on boot
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
```

## Client Configuration

```bash
# Generate client keypair (run on the client, or on the server and transfer securely)
wg genkey | tee phone_private.key | wg pubkey > phone_public.key

# Client config file (phone_wg0.conf):
[Interface]
PrivateKey = <phone_private_key>
Address = 10.8.0.2/32              # VPN IP for this client
DNS = 192.168.1.2                  # Optional: use Pi-hole for DNS over the tunnel

[Peer]
PublicKey = <server_public_key>
Endpoint = your-home-ip.ddns.net:51820  # Your public IP or DDNS hostname
AllowedIPs = 192.168.1.0/24            # Split tunnel: only home network traffic
# AllowedIPs = 0.0.0.0/0              # Full tunnel: all traffic through VPN

PersistentKeepalive = 25              # Keep NAT hole open (required for mobile clients)
```

## Split Tunnel vs Full Tunnel

```
# Split tunnel: AllowedIPs = 192.168.1.0/24
  Only traffic destined for your home network goes through the VPN
  Internet traffic (YouTube, Spotify) goes directly — better performance on mobile
  Best for: "I just want to reach my NAS and Pi from anywhere"

# Full tunnel: AllowedIPs = 0.0.0.0/0, ::/0
  ALL traffic goes through your home internet connection
  Useful for: using home IP for geographic reasons, piggybacking home DNS/Pi-hole
  Downside: home upload speed becomes your bottleneck everywhere

# Multi-subnet split tunnel (most common homelab use case):
  AllowedIPs = 192.168.1.0/24, 192.168.2.0/24, 192.168.3.0/24, 10.8.0.0/24
  Routes all your VLANs through the tunnel, internet stays direct
```

## Key Generation and Peer Management

```python
import subprocess
import os

def generate_keypair() -> tuple[str, str]:
    """Generate a WireGuard keypair. Returns (private_key, public_key)."""
    private = subprocess.check_output(["wg", "genkey"]).decode().strip()
    public = subprocess.run(
        ["wg", "pubkey"], input=private.encode(), capture_output=True
    ).stdout.decode().strip()
    return private, public

def generate_preshared_key() -> str:
    return subprocess.check_output(["wg", "genpsk"]).decode().strip()

def build_client_config(
    client_private_key: str,
    client_vpn_ip: str,       # e.g. "10.8.0.3"
    server_public_key: str,
    server_endpoint: str,     # e.g. "home.example.com:51820"
    allowed_ips: str = "192.168.1.0/24",
    dns: str = "",
) -> str:
    dns_line = f"DNS = {dns}\n" if dns else ""
    return f"""[Interface]
PrivateKey = {client_private_key}
Address = {client_vpn_ip}/32
{dns_line}
[Peer]
PublicKey = {server_public_key}
Endpoint = {server_endpoint}
AllowedIPs = {allowed_ips}
PersistentKeepalive = 25
"""

def build_server_peer_block(
    client_public_key: str,
    client_vpn_ip: str,
    comment: str = "",
) -> str:
    comment_line = f"# {comment}\n" if comment else ""
    return f"""
{comment_line}[Peer]
PublicKey = {client_public_key}
AllowedIPs = {client_vpn_ip}/32
"""
```

## pfSense / OPNsense WireGuard

```
# pfSense: VPN → WireGuard → Add Tunnel
  Interface Keys: Generate (creates keypair automatically)
  Listen Port: 51820
  Interface Address: 10.8.0.1/24

# Add Peer (one per client):
  Public Key: <client public key>
  Allowed IPs: 10.8.0.2/32

# Assign the WireGuard interface:
  Interfaces → Assignments → Add (select wg0)
  Enable interface, no IP needed (it's set in the tunnel config)

# Firewall rules:
  WAN → Allow UDP port 51820 inbound (so clients can reach the server)
  WireGuard interface → Allow traffic to LAN networks
```

## DDNS (Dynamic DNS) for Home Servers

Most home internet connections have a dynamic IP. Use DDNS so your VPN endpoint stays reachable.

```bash
# Option 1: Cloudflare DDNS (free, API-based)
# Install ddclient or use a Docker container:

# docker-compose entry:
  ddns-updater:
    image: qmcgaw/ddns-updater
    environment:
      CONFIG: >
        {
          "settings": [{
            "provider": "cloudflare",
            "zone_identifier": "your_zone_id",
            "domain": "home.yourdomain.com",
            "ttl": 120,
            "token": "your_cf_api_token",
            "ip_version": "ipv4"
          }]
        }
    restart: unless-stopped

# Option 2: DuckDNS (free, simple)
  Sign up at duckdns.org → get a token and subdomain (myhome.duckdns.org)
  Cron job to update: */5 * * * * curl "https://www.duckdns.org/update?domains=myhome&token=YOUR_TOKEN&ip="
```

## Troubleshooting

```bash
# Check WireGuard status and last handshake
sudo wg show

# If "latest handshake" is never or very old, the tunnel is not connected
# Check:
# 1. Is UDP port 51820 open on the router/firewall?
sudo ufw status  # or check pfSense/UniFi firewall rules

# 2. Is the server public key in the client config correct?
wg show wg0 public-key   # Compare to what's in the client config

# 3. Is IP forwarding enabled on the server?
cat /proc/sys/net/ipv4/ip_forward  # Should be 1

# 4. Does the client's AllowedIPs match what you're trying to reach?
# If AllowedIPs = 192.168.1.0/24 but you're trying to reach 192.168.3.5, it won't route

# Check kernel logs for WireGuard errors
dmesg | grep wireguard

# Restart WireGuard
sudo wg-quick down wg0 && sudo wg-quick up wg0
```

## Anti-Patterns

```
# BAD: Storing private keys in version control or sharing them
# Private keys are like passwords — never commit them to git

# BAD: Using AllowedIPs = 0.0.0.0/0 on mobile without thinking about it
# Full tunnel routes your 4G/5G traffic through your home upload — usually slow

# BAD: Not setting PersistentKeepalive on mobile clients
# Mobile clients behind NAT need keepalive pings or the tunnel drops when idle

# BAD: Opening port 51820 in firewall but forgetting IP forwarding on the server
# Tunnel will connect but no traffic routes through — very confusing to debug

# BAD: Using the same keypair for multiple clients
# Each device must have its own unique keypair — shared keys break WireGuard's security model
```

## Best Practices

- Generate a unique keypair per client device — never reuse keys
- Use split tunneling (`AllowedIPs = <home subnets>`) for mobile — preserves mobile data performance
- Set `PersistentKeepalive = 25` on all mobile clients to maintain NAT holes
- Use DDNS if your ISP assigns a dynamic IP
- Rotate the server keypair periodically and update all client configs
- Add Pi-hole's IP as `DNS =` in client configs to get ad blocking over the VPN

## Related Skills

- homelab-network-setup
- homelab-vlan-segmentation
- homelab-pihole-dns
