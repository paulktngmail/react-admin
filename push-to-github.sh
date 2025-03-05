#!/bin/bash

# Script to push changes to GitHub repository
# Usage: ./push-to-github.sh "Commit message"

# Check if commit message is provided
if [ -z "$1" ]; then
  echo "Error: Please provide a commit message."
  echo "Usage: ./push-to-github.sh \"Commit message\""
  exit 1
fi

# Set GitHub repository URL
GITHUB_REPO="https://github.com/paulktngmail/react-admin.git"

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo "Error: git is not installed. Please install git first."
  exit 1
fi

# Check if this is a git repository
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
  
  # Add remote repository
  echo "Adding remote repository..."
  git remote add origin $GITHUB_REPO
  
  if [ $? -ne 0 ]; then
    echo "Error: Failed to add remote repository. Please check the repository URL."
    exit 1
  fi
else
  # Check if the remote repository is already set
  if ! git remote -v | grep -q origin; then
    echo "Adding remote repository..."
    git remote add origin $GITHUB_REPO
  fi
fi

# Add all files to staging
echo "Adding files to staging..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "$1"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
  echo "Successfully pushed changes to GitHub!"
else
  echo "Failed to push changes to GitHub. Trying to push to master branch instead..."
  git push -u origin master
  
  if [ $? -eq 0 ]; then
    echo "Successfully pushed changes to GitHub master branch!"
  else
    echo "Error: Failed to push changes to GitHub. Please check your credentials and repository access."
    exit 1
  fi
fi

exit 0
