#!/bin/bash

# Script to push the fixed version to GitHub

# Make sure we're in the right directory
cd /Users/paulktn/dpnet10/react-admin

# Add all changes
git add .

# Commit the changes
git commit -m "Fix: Implement backend API for Solana blockchain interactions

- Created a backend server to handle Solana blockchain interactions
- Updated frontend to use the backend API instead of direct Solana connections
- Removed direct Solana dependencies from frontend build process
- Added real-time blockchain data fetching"

# Push to GitHub
git push origin main

echo "Changes pushed to GitHub successfully!"
