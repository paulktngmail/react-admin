#!/bin/bash

echo "Deploying API proxy fix..."

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
git add API_PROXY_CONFIGURATION.md
git add DIRECT_API_APPROACH.md
git add PROXY_APPROACH.md
git add test-api-proxy.js
git add test-whitelist-api.js
git add README.md
git add LICENSE.md

# Commit changes
echo "Committing changes..."
git commit -m "Update frontend with API proxy fix"

# Push to GitHub
echo "Pushing to GitHub main branch..."
echo "WARNING: This will force push the complete project to the main branch. Press Ctrl+C to cancel or Enter to continue."
read -p ""

git push -f origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "Push successful!"
    echo "Your updated project is now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "Push failed. Please check the error message above."
    echo "If you're having authentication issues, you might need to use a Personal Access Token."
    exit 1
fi

echo "Deployment complete!"
echo "The changes have been pushed to GitHub. AWS Amplify will automatically detect the changes and deploy them."
echo ""
echo "To verify the deployment:"
echo "1. Go to the AWS Amplify Console"
echo "2. Check the deployment status"
echo "3. Once deployed, test the frontend by visiting https://admin.dash628.com"
echo ""
echo "The frontend should now be able to communicate with the backend API through the proxy."
