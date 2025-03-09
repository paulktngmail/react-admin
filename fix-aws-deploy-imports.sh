#!/bin/bash

# Script to fix imports in aws-deploy files
set -e  # Exit on error

echo "Fixing imports in aws-deploy files..."

# Create a copy of the dynamodb-integration.js file in the aws-deploy directory
echo "Copying dynamodb-integration.js to aws-deploy directory..."
cp scripts/dynamodb-integration.js aws-deploy/

# Update the import in solana-api.js
echo "Updating import in solana-api.js..."
sed -i '' "s|require('../scripts/dynamodb-integration')|require('./dynamodb-integration')|g" aws-deploy/solana-api.js

echo "Imports fixed successfully!"
