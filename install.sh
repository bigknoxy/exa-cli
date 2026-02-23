#!/bin/sh
# Install script for exa-cli
# Usage: curl -fsSL https://bigknoxy.github.io/exa-cli/install.sh | sh
# Or: curl -fsSL https://raw.githubusercontent.com/bigknoxy/exa-cli/main/install.sh | sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

info() { printf "${BLUE}==>${NC} %s\n" "$1"; }
success() { printf "${GREEN}✓${NC} %s\n" "$1"; }
warn() { printf "${YELLOW}Warning:${NC} %s\n" "$1" >&2; }
error() { printf "${RED}Error:${NC} %s\n" "$1" >&2; exit 1; }

# Check for npm
if ! command -v npm >/dev/null 2>&1; then
    error "npm is required but not installed. Please install Node.js first: https://nodejs.org"
fi

# Check Node.js version (need 18+)
NODE_VERSION=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ is required. You have Node.js $(node -v). Please upgrade."
fi

info "Installing exa-cli..."

# Install globally
if npm install -g @bigknoxy/exa-cli 2>&1; then
    success "exa-cli installed successfully!"
    echo ""
    info "Quick start:"
    echo "  exa search \"your query\"      # Search the web"
    echo "  exa code \"react hooks\"       # Search for code"
    echo "  exa crawl https://example.com # Crawl a URL"
    echo "  exa --help                    # Show all commands"
    echo ""
    echo "Documentation: https://github.com/bigknoxy/exa-cli"
else
    error "Failed to install exa-cli"
fi
