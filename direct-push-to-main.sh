#!/bin/bash

# Direct push to main branch on GitHub
# This script uses a more direct approach to push the changes to the main branch

echo "Direct pushing API communication fix to main branch on GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install it first."
    exit 1
fi

# Ensure we're in the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create a fresh git repository
echo "Creating a fresh git repository..."
rm -rf .git
git init

# Add remote origin
echo "Adding remote origin..."
git remote add origin https://github.com/paulktngmail/react-admin.git

# Create and checkout main branch
echo "Creating and checking out main branch..."
git checkout -b main

# Add only the specific files we modified
echo "Adding only the modified files..."
git add src/services/api.js
git add API_COMMUNICATION_FIX.md

# Commit changes
echo "Committing changes..."
git commit -m "Fix API communication between frontend and backend"

# Push to GitHub
echo "Pushing to GitHub main branch..."
echo "WARNING: This will force push the API communication fix files to the main branch. Press Ctrl+C to cancel or Enter to continue."
read -p ""

git push -f origin main

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
