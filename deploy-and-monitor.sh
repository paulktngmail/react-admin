#!/bin/bash

# Script to deploy the backend and monitor the logs
# This script will deploy the backend and then monitor the logs for errors

echo "Deploying backend and monitoring logs..."
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

# Step 4: Monitor the logs
echo "Step 4: Monitoring the logs..."
echo "Checking for errors in the backend logs..."

# Go to the qwerty-app directory
cd ../../qwerty-app || { echo "Error: qwerty-app directory not found"; exit 1; }

# Check if the EB CLI is installed
if ! command -v eb &> /dev/null; then
  echo "Error: EB CLI is not installed. Please install it first."
  exit 1
fi

# Monitor the logs
echo "Fetching logs from Elastic Beanstalk..."
eb logs

# Return to the original directory
cd - || { echo "Error: Failed to return to the original directory"; exit 1; }

echo "Log monitoring complete!"
echo "The backend has been deployed and logs have been checked."
echo ""
echo "To verify the deployment:"
echo "1. Test the backend API by visiting http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/pool/whitelist"
echo "2. If the API is working correctly, proceed with frontend deployment"
echo ""
echo "If you encounter any issues, you can run the test scripts to debug the problem:"
echo "- node test-backend-api-v2.js"
echo "- node test-api-communication.js"
