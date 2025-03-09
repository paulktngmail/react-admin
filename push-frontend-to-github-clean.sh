#!/bin/bash

# Push frontend changes to GitHub, excluding large files
# This script pushes the updated frontend code to GitHub

echo "Pushing frontend changes to GitHub..."

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
fi

# Check if the remote origin exists
if ! git remote | grep -q "origin"; then
    echo "Adding remote origin..."
    git remote add origin https://github.com/paulktngmail/react-admin.git
else
    # Update the remote URL to ensure it's correct
    git remote set-url origin https://github.com/paulktngmail/react-admin.git
fi

# Remove any large files that might have been previously tracked
echo "Cleaning up any large files..."
git rm -r --cached .
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Update API endpoints to connect to Elastic Beanstalk backend"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main --force

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your frontend changes are now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "Push failed. Please check the error message above."
    exit 1
fi

echo "Frontend deployment process completed."
