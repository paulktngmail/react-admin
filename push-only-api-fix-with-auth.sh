#!/bin/bash

# Push only the API communication fix files to GitHub with authentication
# This script pushes only the specific files we modified to GitHub using a Personal Access Token

echo "Pushing only API communication fix files to GitHub with authentication..."

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

echo "Please enter your GitHub Personal Access Token when prompted"
git push -u origin api-communication-fix

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your API communication fix is now on GitHub at: https://github.com/paulktngmail/react-admin/tree/api-communication-fix"
    echo "You can create a pull request to merge these changes into the main branch."
else
    echo "Push failed. Please check the error message above."
    exit 1
fi

# Remove the credential helper configuration
git config --local --unset credential.helper

echo "GitHub push process completed."
