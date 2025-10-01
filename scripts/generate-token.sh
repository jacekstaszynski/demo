#!/bin/bash

# JWT Token Generator Script
# Usage: ./generate-token.sh <email>

if [ $# -eq 0 ]; then
    echo "❌ Error: Email is required"
    echo "Usage: ./generate-token.sh <email>"
    echo "Example: ./generate-token.sh john.doe@example.com"
    exit 1
fi

EMAIL=$1

echo "🔑 Generating JWT token for: $EMAIL"
echo ""

# Run the TypeScript script
yarn generate-jwt "$EMAIL"
