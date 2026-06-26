#!/bin/bash
# ============================================================================
# GSU — GENO IN A BOX · SETUP SCRIPT v1.0 (June 7, 2026)
# Turns a stock Raspberry Pi into a GENO in a Box: a device that broadcasts
# the entire Global Sovereign University library as an open local Wi-Fi
# network. No internet required after setup. Free education, in the air.
#
# TESTED PATTERN: NetworkManager hotspot (built into Raspberry Pi OS Bookworm)
#                 + nginx static server + DNS capture. Standard, boring, sturdy.
#
# HARDWARE:  Raspberry Pi Zero 2 W, 3, 4, or 5 · 32GB+ microSD · power supply
# OS:        Raspberry Pi OS Lite (Bookworm or newer)
#
# USE:
#   1. Flash Raspberry Pi OS Lite to the microSD (Raspberry Pi Imager).
#   2. Boot the Pi with internet (ethernet or Wi-Fi) just for this setup.
#   3. Copy the GSU library (the University on a Stick bundle) to the Pi,
#      or let step 4 place a placeholder you can fill later:
#         sudo mkdir -p /var/www/gsu   (then copy the bundle's files into it;
#         the bundle's index.html must end up at /var/www/gsu/index.html)
#   4. Run:  curl -sL https://read.globalsovereignuniversity.org/gsu-box-setup.sh | sudo bash
#   5. Reboot. The Pi now broadcasts the open network "GSU Free Library".
#      Join it from any phone and browse to  http://gsu.box  (or any address —
#      all roads lead to the library).
#
# Every boot thereafter is automatic. No internet, no maintenance, no login.
# ============================================================================
set -e

SSID="GSU Free Library"
WEBROOT="/var/www/gsu"
CON="gsu-box"

echo "==> GENO in a Box setup starting…"

[ "$(id -u)" -eq 0 ] || { echo "Please run with sudo."; exit 1; }

echo "==> Installing nginx (the library's serving tray)…"
apt-get update -qq
apt-get install -y -qq nginx > /dev/null

echo "==> Preparing the library folder at $WEBROOT…"
mkdir -p "$WEBROOT"
if [ ! -f "$WEBROOT/index.html" ]; then
  cat > "$WEBROOT/index.html" <<'PLACEHOLDER'
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GSU Free Library</title>
<style>body{background:#000;color:#F5F1E8;font-family:Georgia,serif;text-align:center;padding:18vh 24px}
h1{color:#C9A84C;font-size:2rem}p{color:#9CA3AF;max-width:480px;margin:16px auto;line-height:1.6}</style></head>
<body><script src="/return-bar.js"></script><h1>GSU Free Library</h1><p>The box is broadcasting, but the library hasn't been loaded yet.
Copy the University on a Stick bundle into /var/www/gsu on this device, then refresh.</p>
<p>globalsovereignuniversity.org · Free education for all</p></body></html>
PLACEHOLDER
  echo "    (No library found — placed a placeholder page. Load the bundle when ready.)"
fi
chown -R www-data:www-data "$WEBROOT"

echo "==> Configuring nginx to serve the library to everyone…"
cat > /etc/nginx/sites-available/gsu-box <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root $WEBROOT;
    index index.html;
    server_name _;
    location / { try_files \$uri \$uri/ /index.html; }
    # Captive-portal probes: send phones straight to the library
    location = /generate_204 { return 302 http://gsu.box/; }
    location = /hotspot-detect.html { return 302 http://gsu.box/; }
    location = /ncsi.txt { return 302 http://gsu.box/; }
}
NGINX
ln -sf /etc/nginx/sites-available/gsu-box /etc/nginx/sites-enabled/gsu-box
rm -f /etc/nginx/sites-enabled/default
systemctl enable nginx -q
systemctl restart nginx

echo "==> Creating the open hotspot \"$SSID\"…"
nmcli connection delete "$CON" >/dev/null 2>&1 || true
nmcli connection add type wifi ifname wlan0 con-name "$CON" autoconnect yes \
  ssid "$SSID" 802-11-wireless.mode ap 802-11-wireless.band bg \
  ipv4.method shared ipv6.method disabled >/dev/null

echo "==> Capturing DNS so every address leads to the library…"
mkdir -p /etc/NetworkManager/dnsmasq-shared.d
cat > /etc/NetworkManager/dnsmasq-shared.d/gsu-box.conf <<'DNS'
# GENO in a Box: resolve every name to the box itself
address=/#/10.42.0.1
DNS

nmcli connection up "$CON" >/dev/null 2>&1 || true

echo ""
echo "============================================================"
echo "  GENO in a Box is ready."
echo "  Network:  $SSID   (open — no password, by design)"
echo "  Library:  http://gsu.box   (from any device that joins)"
echo "  Files:    $WEBROOT"
echo ""
echo "  Reboot to confirm it all comes up on its own:  sudo reboot"
echo "  Then unplug the internet. The box no longer needs it."
echo "============================================================"
