#!/bin/bash

# Script to deploy the fixed frontend to AWS Amplify
# This script will deploy the frontend with the HTTP protocol fix

echo "Deploying fixed frontend to AWS Amplify..."
echo "===================================================="

# Step 1: Build the frontend
echo "Step 1: Building the frontend..."
npm run build

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Error: Build failed. Please check the logs for more information."
  exit 1
fi

# Step 2: Deploy to AWS Amplify using the existing deploy script
echo "Step 2: Deploying to AWS Amplify..."

# Check if the deploy-frontend-to-aws.sh script exists
if [ -f "deploy-frontend-to-aws.sh" ]; then
  echo "Using existing deploy-frontend-to-aws.sh script..."
  chmod +x deploy-frontend-to-aws.sh
  ./deploy-frontend-to-aws.sh
  
  # Check if the deployment was successful
  if [ $? -eq 0 ]; then
    echo "Frontend deployment initiated successfully!"
  else
    echo "Frontend deployment failed. Please check the logs for more information."
    exit 1
  fi
else
  echo "Warning: deploy-frontend-to-aws.sh script not found."
  echo "Manual deployment required:"
  echo "1. Go to the AWS Amplify Console"
  echo "2. Select your app"
  echo "3. Click 'Deploy' or set up a deployment pipeline"
  echo "4. Upload the build folder or connect to your repository"
fi

echo "Deployment complete!"
echo "The updated frontend has been deployed to AWS Amplify."
echo ""
echo "To verify the deployment:"
echo "1. Go to the AWS Amplify Console"
echo "2. Check the deployment status"
echo "3. Once deployed, test the frontend by visiting https://admin.dash628.com"
echo ""
echo "If you encounter any issues, you can run the test scripts to debug the problem:"
echo "- node test-api-communication.js"
echo "- node test-deployed-frontend.js"
