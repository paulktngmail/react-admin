#!/bin/bash

# Script to deploy the complete solution to AWS
# This script will deploy both the backend and frontend

echo "Deploying complete solution to AWS..."
echo "===================================================="

# Step 1: Deploy the backend
echo "Step 1: Deploying the backend..."
./deploy-fixed-backend-v4.sh

# Check if the backend deployment was successful
if [ $? -ne 0 ]; then
  echo "Error: Backend deployment failed. Please check the logs for more information."
  exit 1
fi

# Step 2: Test the backend API
echo "Step 2: Testing the backend API..."
node test-backend-api-v2.js

# Step 3: Update the frontend to use HTTP instead of HTTPS
echo "Step 3: Updating the frontend to use HTTP instead of HTTPS..."
node fix-frontend-protocol.js

# Step 4: Build the frontend
echo "Step 4: Building the frontend..."
npm run build

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Error: Frontend build failed. Please check the logs for more information."
  exit 1
fi

echo "Frontend built successfully!"
echo "The complete solution has been prepared for deployment."
echo ""
echo "Backend has been deployed to AWS Elastic Beanstalk."
echo "Frontend has been built and is ready for deployment."
echo ""
echo "To complete the frontend deployment:"
echo "1. Go to the AWS Amplify Console"
echo "2. Select your app"
echo "3. Click 'Deploy' or set up a deployment pipeline"
echo "4. Upload the build folder or connect to your repository"
echo ""
echo "To verify the deployment:"
echo "1. Test the backend API by visiting http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/pool/whitelist"
echo "2. Once the frontend is deployed, test it by visiting https://admin.dash628.com"
echo ""
echo "If you encounter any issues, you can run the test scripts to debug the problem:"
echo "- node test-backend-api-v2.js"
echo "- node test-api-communication.js"
