#!/bin/bash

# Script to deploy the fixed backend to AWS Elastic Beanstalk
# This script will deploy the backend with the Node.js version fixes

echo "Deploying fixed backend to AWS Elastic Beanstalk..."
echo "===================================================="

# Step 1: Configure HTTPS for the Elastic Beanstalk environment
echo "Step 1: Configuring HTTPS for the Elastic Beanstalk environment..."
node configure-eb-https.js

# Step 2: Configure AWS permissions and security groups
echo "Step 2: Configuring AWS permissions and security groups..."
node check-aws-permissions.js

# Step 3: Deploy the updated backend to AWS Elastic Beanstalk
echo "Step 3: Deploying updated backend to AWS Elastic Beanstalk..."
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

echo "Deployment complete!"
echo "The updated backend has been deployed to AWS Elastic Beanstalk."
echo ""
echo "To verify the deployment:"
echo "1. Go to the AWS Elastic Beanstalk Console"
echo "2. Check the deployment status"
echo "3. Once deployed, test the backend API by visiting https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/pool/whitelist"
echo ""
echo "If you encounter any issues, you can run the test scripts to debug the problem:"
echo "- node test-https-backend.js"
echo "- node test-api-communication.js"
