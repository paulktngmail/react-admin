#!/bin/bash

# Script to deploy all fixes to AWS
# This script will deploy the frontend and backend changes to AWS

echo "Deploying all fixes to AWS..."
echo "===================================================="

# Step 1: Update the frontend to use HTTPS
echo "Step 1: Updating frontend to use HTTPS..."
node fix-https-protocol.js

# Step 2: Configure HTTPS for the Elastic Beanstalk environment
echo "Step 2: Configuring HTTPS for the Elastic Beanstalk environment..."
node configure-eb-https.js

# Step 3: Configure AWS permissions and security groups
echo "Step 3: Configuring AWS permissions and security groups..."
node check-aws-permissions.js

# Step 4: Deploy the updated backend to AWS Elastic Beanstalk
echo "Step 4: Deploying updated backend to AWS Elastic Beanstalk..."
cd ../../qwerty-app || { echo "Error: qwerty-app directory not found"; exit 1; }

# Check if the .elasticbeanstalk directory exists
if [ ! -d ".elasticbeanstalk" ]; then
  echo "Error: .elasticbeanstalk directory not found. Make sure you're in the correct directory."
  exit 1
fi

# Check if the EB CLI is installed
if ! command -v eb &> /dev/null; then
  echo "Error: EB CLI is not installed. Please install it first."
  exit 1
fi

# Deploy to Elastic Beanstalk
echo "Deploying to Elastic Beanstalk..."
eb deploy

# Check if the deployment was successful
if [ $? -eq 0 ]; then
  echo "Backend deployment successful!"
else
  echo "Backend deployment failed. Please check the logs for more information."
  exit 1
fi

# Return to the original directory
cd - || { echo "Error: Failed to return to the original directory"; exit 1; }

# Step 5: Deploy the frontend to AWS Amplify
echo "Step 5: Deploying frontend to AWS Amplify..."
./deploy-final-fix.sh

echo "Deployment complete!"
echo "The updated backend and frontend have been deployed to AWS."
echo "The frontend should now be able to communicate with the backend."
echo ""
echo "To verify the deployment:"
echo "1. Go to the AWS Amplify Console"
echo "2. Check the deployment status"
echo "3. Once deployed, test the frontend by visiting https://admin.dash628.com"
echo ""
echo "If you encounter any issues, you can run the test scripts to debug the problem:"
echo "- node test-https-backend.js"
echo "- node test-api-communication.js"
echo "- node test-deployed-frontend.js"
