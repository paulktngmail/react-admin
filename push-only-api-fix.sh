#!/bin/bash

# Push only the API communication fix files to GitHub
# This script pushes only the specific files we modified to GitHub

echo "Pushing only API communication fix files to GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install it first."
    exit 1
fi

# Ensure we're in the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create a new branch for our changes
echo "Creating a new branch for our changes..."
git checkout -b api-communication-fix

# Add only the specific files we modified
echo "Adding only the modified files..."
git add src/services/api.js
git add API_COMMUNICATION_FIX.md

# Commit changes
echo "Committing changes..."
git commit -m "Fix API communication between frontend and backend"

# Push to GitHub
echo "Pushing to GitHub..."
echo "WARNING: This will push only the API communication fix files to a new branch. Press Ctrl+C to cancel or Enter to continue."
read -p ""

git push -u origin api-communication-fix

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your API communication fix is now on GitHub at: https://github.com/paulktngmail/react-admin/tree/api-communication-fix"
    echo "You can create a pull request to merge these changes into the main branch."
else
    echo "Push failed. Please check the error message above."
    echo "If you're having authentication issues, you might need to use a Personal Access Token."
    exit 1
fi

echo "GitHub push process completed."
