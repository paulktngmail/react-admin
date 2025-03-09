#!/bin/bash

# Push the complete project to GitHub
# This script pushes all necessary files to the main branch

echo "Pushing complete project to GitHub..."

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

# Add all necessary files
echo "Adding all necessary files..."
git add package.json
git add package-lock.json
git add tsconfig.json
git add config-overrides.js
git add public/
git add src/
git add .gitignore
git add .eslintrc
git add .prettierrc.js
git add babel.config.js
git add webpack.config.js
git add amplify.yml
git add API_COMMUNICATION_FIX.md
git add README.md
git add LICENSE.md

# Commit changes
echo "Committing changes..."
git commit -m "Fix API communication between frontend and backend"

# Push to GitHub
echo "Pushing to GitHub main branch..."
echo "WARNING: This will force push the complete project to the main branch. Press Ctrl+C to cancel or Enter to continue."
read -p ""

git push -f origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your complete project is now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "Push failed. Please check the error message above."
    echo "If you're having authentication issues, you might need to use a Personal Access Token."
    exit 1
fi

echo "GitHub push process completed."
