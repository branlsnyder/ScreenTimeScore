#!/bin/bash
cd "$(dirname "$0")/Application Files"

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed."
    echo "Download it from: https://nodejs.org"
    echo "Choose the LTS version, then run this script again."
    read -p "Press Enter to exit..."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "=========================================="
echo "  Screen Time Score Server"
echo "=========================================="
echo ""
node server.js
echo ""
read -p "Server stopped. Press Enter to exit..."
