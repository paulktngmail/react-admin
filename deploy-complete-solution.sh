#!/bin/bash

# deploy-complete-solution.sh
# This script deploys the complete solution to AWS

echo "===== Deploying Complete Solution ====="

# 1. Build the frontend
echo "Building frontend..."
NODE_OPTIONS=--openssl-legacy-provider npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed. Exiting."
  exit 1
fi

echo "✅ Frontend build successful."

# 2. Deploy to AWS Amplify
echo "Deploying to AWS Amplify..."
# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "⚠️ AWS CLI is not installed. Please deploy manually."
  echo "To deploy manually:"
  echo "1. Go to the AWS Amplify Console"
  echo "2. Select your app"
  echo "3. Go to the Hosting tab"
  echo "4. Click on 'Deploy'"
  echo "5. Upload the build.zip file"
else
  # Create a zip file of the build directory
  echo "Creating build.zip..."
  cd build && zip -r ../build.zip . && cd ..
  
  # Get the Amplify app ID from the environment or prompt the user
  APP_ID=${AMPLIFY_APP_ID}
  if [ -z "$APP_ID" ]; then
    read -p "Enter your Amplify App ID: " APP_ID
  fi
  
  # Get the branch name from the environment or prompt the user
  BRANCH=${AMPLIFY_BRANCH:-main}
  if [ -z "$BRANCH" ]; then
    read -p "Enter the branch name (default: main): " BRANCH
    BRANCH=${BRANCH:-main}
  fi
  
  # Deploy to Amplify
  echo "Deploying to Amplify app $APP_ID, branch $BRANCH..."
  aws amplify start-deployment --app-id $APP_ID --branch-name $BRANCH --source-url build.zip
  
  if [ $? -ne 0 ]; then
    echo "❌ Deployment to Amplify failed. Please deploy manually."
  else
    echo "✅ Deployment to Amplify successful."
  fi
fi

echo "===== Deployment Complete ====="
echo "Please verify the deployment by visiting https://admin.dash628.com"
echo "To test the API communication, run:"
echo "node test-deployed-frontend-api.js"

# Cleanup
echo "Cleaning up..."
rm -f build.zip

echo "Done!"
