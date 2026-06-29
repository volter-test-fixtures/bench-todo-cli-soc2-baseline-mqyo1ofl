#!/usr/bin/env bash
# Self-managed, NO-ACCOUNT egress allowlist for PRIVATE GitHub-hosted runners (harden-runner Community blocks
# only on public). Allows loopback + established + DNS + GitHub's published /meta ranges (keeps the Actions
# runner control-plane alive) + the resolved IPs of EXTRA_ALLOW_HOSTS; everything else is default-DENY.
set -euo pipefail
EXTRA="${EXTRA_ALLOW_HOSTS:-registry.npmjs.org objects.githubusercontent.com}"
sudo ipset create oa_allow4 hash:net -exist
sudo ipset create oa_allow6 hash:net family inet6 -exist
meta="$(curl -s --max-time 20 https://api.github.com/meta)"
echo "$meta" | jq -r '((.actions//[])+(.api//[])+(.web//[])+(.git//[])+(.packages//[])+(.hooks//[])+(.dependabot//[]))[]' \
  | while read -r c; do case "$c" in *:*) sudo ipset add oa_allow6 "$c" -exist 2>/dev/null;; *) sudo ipset add oa_allow4 "$c" -exist 2>/dev/null;; esac; done
for h in $EXTRA; do getent ahosts "$h" | awk '{print $1}' | sort -u | while read -r ip; do
  case "$ip" in *:*) sudo ipset add oa_allow6 "$ip" -exist 2>/dev/null;; *) sudo ipset add oa_allow4 "$ip" -exist 2>/dev/null;; esac; done; done
for ipt in iptables ip6tables; do
  sudo $ipt -A OUTPUT -o lo -j ACCEPT
  sudo $ipt -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
  sudo $ipt -A OUTPUT -p udp --dport 53 -j ACCEPT
  sudo $ipt -A OUTPUT -p tcp --dport 53 -j ACCEPT
done
sudo iptables  -A OUTPUT -m set --match-set oa_allow4 dst -j ACCEPT
sudo ip6tables -A OUTPUT -m set --match-set oa_allow6 dst -j ACCEPT
sudo iptables  -A OUTPUT -j REJECT --reject-with icmp-port-unreachable
sudo ip6tables -A OUTPUT -j REJECT --reject-with icmp6-port-unreachable
echo "egress-guard installed: $(sudo ipset list oa_allow4 | grep -c '^[0-9]') v4 nets + EXTRA($EXTRA), default-deny"
