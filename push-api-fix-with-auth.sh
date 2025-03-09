#!/bin/bash

# Push API communication fix to GitHub with authentication
# This script pushes the updated frontend code with API fixes to GitHub using a Personal Access Token

echo "Pushing API communication fix to GitHub with authentication..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install it first."
    exit 1
fi

# Ensure we're in the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configure git to use credential store temporarily
git config --local credential.helper store

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Check if the remote origin exists
if ! git remote | grep -q "origin"; then
    echo "Adding remote origin..."
    git remote add origin https://github.com/paulktngmail/react-admin.git
else
    # Update the remote URL to ensure it's correct
    git remote set-url origin https://github.com/paulktngmail/react-admin.git
fi

# Add the specific files we modified
echo "Adding changes..."
git add src/services/api.js
git add test-fixed-connection.js
git add deploy-fixed-frontend.sh
git add API_COMMUNICATION_FIX.md
git add push-api-fix-to-github.sh
git add push-api-fix-with-auth.sh

# Commit changes
echo "Committing changes..."
git commit -m "Fix API communication between frontend and backend"

# Ask for the PAT if not provided
echo "Please enter your GitHub Personal Access Token when prompted"
echo "Pushing to GitHub..."
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your API communication fix is now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "Push failed. Please check the error message above."
    exit 1
fi

# Remove the credential helper configuration
git config --local --unset credential.helper

echo "GitHub push process completed."
