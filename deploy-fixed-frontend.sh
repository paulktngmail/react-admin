#!/bin/bash

# Script to deploy the fixed frontend to AWS Amplify
set -e  # Exit immediately if a command exits with a non-zero status

echo "🔧 Deploying fixed frontend to AWS Amplify..."

# Step 1: Build the frontend with the fixed API endpoints
echo "📦 Building the frontend..."
npm run build

# Step 2: Deploy to AWS Amplify
echo "🚀 Deploying to AWS Amplify..."
# Use the existing deploy-frontend-to-aws.sh script
./deploy-frontend-to-aws.sh

echo "✅ Frontend deployment completed!"
echo ""
echo "The frontend has been updated with the fixed API endpoints."
echo "The frontend should now be able to communicate with the backend correctly."
echo ""
echo "To verify the fix:"
echo "1. Wait for the AWS Amplify deployment to complete (check the AWS Amplify console)"
echo "2. Access the deployed frontend application"
echo "3. Check the browser's developer console for any API errors"
echo ""
echo "If you still see API errors, you may need to:"
echo "1. Check if there are other API endpoints that need to be updated"
echo "2. Verify that the backend is correctly configured to handle the API requests"
echo "3. Check if there are any CORS issues that need to be addressed"
