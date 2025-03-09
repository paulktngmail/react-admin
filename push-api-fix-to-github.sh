#!/bin/bash

# Push API communication fix to GitHub
# This script pushes the updated frontend code with API fixes to GitHub

echo "Pushing API communication fix to GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install it first."
    exit 1
fi

# Ensure we're in the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git remote add origin https://github.com/paulktngmail/react-admin.git
else
    # Check if the remote exists
    if ! git remote | grep -q "origin"; then
        echo "Adding remote origin..."
        git remote add origin https://github.com/paulktngmail/react-admin.git
    fi
fi

# Add the specific files we modified
echo "Adding changes..."
git add src/services/api.js
git add test-fixed-connection.js
git add deploy-fixed-frontend.sh
git add API_COMMUNICATION_FIX.md

# Commit changes
echo "Committing changes..."
git commit -m "Fix API communication between frontend and backend"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your API communication fix is now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "Push failed. Please check the error message above."
    echo "If you're having authentication issues, you might need to use the push-with-auth.sh script instead."
    exit 1
fi

echo "GitHub push process completed."
