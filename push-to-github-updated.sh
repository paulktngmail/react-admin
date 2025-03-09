#!/bin/bash

# Script to push the changes to GitHub
set -e  # Exit on error

echo "Pushing changes to GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install it first."
    exit 1
fi

# Check if the repository is initialized
if [ ! -d .git ]; then
    echo "Git repository is not initialized. Initializing..."
    git init
fi

# Add all files
git add .

# Commit the changes
git commit -m "Update API URLs to use AWS Elastic Beanstalk"

# Check if the remote origin exists
if ! git remote | grep -q "origin"; then
    echo "Remote origin does not exist. Adding it..."
    git remote add origin https://github.com/paulktngmail/react-admin.git
else
    # Update the remote URL to ensure it's correct
    git remote set-url origin https://github.com/paulktngmail/react-admin.git
fi

# Push to GitHub
git push -u origin main

echo "Changes pushed to GitHub successfully!"
