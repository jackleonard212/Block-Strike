#!/bin/bash
# Starts the Blockstrike server and opens the game in your browser.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Download it from https://nodejs.org and run this again."
  read -r -p "Press Enter to close..." _
  exit 1
fi
OPEN=1 node server.js
