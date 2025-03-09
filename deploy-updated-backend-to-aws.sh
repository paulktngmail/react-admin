#!/bin/bash

# Script to deploy the updated backend to AWS Elastic Beanstalk

echo "Deploying updated backend to AWS Elastic Beanstalk..."
echo "===================================================="

# Change to the qwerty-app directory
cd ../../qwerty-app || { echo "Error: qwerty-app directory not found"; exit 1; }

# Check if the .elasticbeanstalk directory exists
if [ ! -d ".elasticbeanstalk" ]; then
  echo "Error: .elasticbeanstalk directory not found. Make sure you're in the correct directory."
  exit 1
fi

# Check if the AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "Error: AWS CLI is not installed. Please install it first."
  exit 1
fi

# Check if the EB CLI is installed
if ! command -v eb &> /dev/null; then
  echo "Error: EB CLI is not installed. Please install it first."
  exit 1
fi

# Create a deployment package
echo "Creating deployment package..."
zip -r deployment.zip . -x "node_modules/*" ".git/*" ".elasticbeanstalk/*" "deployment.zip"

# Deploy to Elastic Beanstalk
echo "Deploying to Elastic Beanstalk..."
eb deploy

# Check if the deployment was successful
if [ $? -eq 0 ]; then
  echo "Deployment successful!"
  echo "The updated backend has been deployed to AWS Elastic Beanstalk."
  echo "The CORS configuration has been updated to allow requests from all origins."
  echo "The frontend should now be able to communicate with the backend."
else
  echo "Deployment failed. Please check the logs for more information."
  exit 1
fi

# Clean up
echo "Cleaning up..."
rm deployment.zip

echo "Deployment complete!"
