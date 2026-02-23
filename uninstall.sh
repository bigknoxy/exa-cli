#!/bin/sh
# Uninstall script for exa-cli
# Usage: curl -fsSL https://bigknoxy.github.io/exa-cli/uninstall.sh | sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

info() { printf "${BLUE}==>${NC} %s\n" "$1"; }
success() { printf "${GREEN}✓${NC} %s\n" "$1"; }
warn() { printf "${YELLOW}Warning:${NC} %s\n" "$1" >&2; }
error() { printf "${RED}Error:${NC} %s\n" "$1" >&2; exit 1; }

confirm() {
    printf '%s [y/N] ' "$1"
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}

# Check if installed
if ! command -v exa >/dev/null 2>&1; then
    warn "exa-cli does not appear to be installed"
    exit 0
fi

# Confirm uninstall
if [ -z "${FORCE:-}" ]; then
    if ! confirm "Uninstall exa-cli?"; then
        info "Aborted"
        exit 0
    fi
fi

info "Uninstalling exa-cli..."

if npm uninstall -g @bigknoxy/exa-cli 2>&1; then
    success "exa-cli uninstalled successfully!"
    
    # Check for config
    CONFIG_FILE="$HOME/.exarc"
    if [ -f "$CONFIG_FILE" ]; then
        warn "Config file ${CONFIG_FILE} still exists"
        echo "  Remove it with: rm ${CONFIG_FILE}"
    fi
else
    error "Failed to uninstall exa-cli"
fi
