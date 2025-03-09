#!/bin/bash

# Push API communication fix to GitHub
# This script pushes the updated frontend code with API communication fix to GitHub

echo "Pushing API communication fix to GitHub..."
echo "===================================================="

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

# Add all changes
echo "Adding changes..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Fix API communication between frontend and backend

- Update frontend to use HTTP instead of HTTPS for backend API
- Fix API path prefix issues
- Update CORS configuration
- Create deployment scripts for backend and frontend
- Add comprehensive documentation"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your API communication fix is now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "Push failed. Please check the error message above."
    echo "You may need to use authentication. Try running push-with-auth.sh instead."
    exit 1
fi

echo "API communication fix has been pushed to GitHub."
echo "The frontend is now ready for deployment to AWS Amplify."
