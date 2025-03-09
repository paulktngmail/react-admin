#!/bin/bash

# Push API communication fix directly to the main branch on GitHub
# This script pushes the specific files we modified to the main branch

echo "Pushing API communication fix to main branch on GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install it first."
    exit 1
fi

# Ensure we're in the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Make sure we're on the main branch
echo "Checking out main branch..."
git checkout main

# Add only the specific files we modified
echo "Adding only the modified files..."
git add src/services/api.js
git add API_COMMUNICATION_FIX.md

# Commit changes
echo "Committing changes..."
git commit -m "Fix API communication between frontend and backend"

# Pull the latest changes from the remote repository
echo "Pulling the latest changes from the remote repository..."
git pull --rebase origin main

# Push to GitHub
echo "Pushing to GitHub main branch..."
echo "WARNING: This will push the API communication fix files to the main branch. Press Ctrl+C to cancel or Enter to continue."
read -p ""

git push origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your API communication fix is now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "Push failed. Please check the error message above."
    echo "If you're having authentication issues, you might need to use a Personal Access Token."
    exit 1
fi

echo "GitHub push process completed."
