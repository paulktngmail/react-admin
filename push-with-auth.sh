#!/bin/bash

# Push to GitHub with authentication
# This script pushes the code to GitHub using a Personal Access Token

echo "Pushing to GitHub with authentication..."

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

# We are not removing large files here, because .gitignore should handle it.
# Removing with git rm -r --cached . is destructive and removes files from git history.
# Instead, ensure .gitignore is properly configured.
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Update API endpoints to connect to Elastic Beanstalk backend"

# Ask for the PAT if not provided
echo "Please enter your GitHub Personal Access Token when prompted"
echo "Pushing to GitHub..."
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your changes are now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "Push failed. Please check the error message above."
    exit 1
fi

# Remove the credential helper configuration
git config --local --unset credential.helper

echo "Deployment process completed."
