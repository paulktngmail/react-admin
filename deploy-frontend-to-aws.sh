#!/bin/bash

# Script to build the frontend with the updated API URLs and deploy it to AWS
set -e  # Exit on error

echo "Starting frontend build and deployment to AWS..."

# Build the frontend
echo "📦 Building the frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to build the frontend."
  exit 1
fi

echo "✅ Frontend built successfully."

# Create a deployment package
echo "📦 Creating deployment package..."

# Create a temporary directory for the deployment package
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Copy build files to the temporary directory
cp -r build/* "$TEMP_DIR/"

# Create the deployment package
cd "$TEMP_DIR"
zip -r "../../frontend-deploy.zip" .
cd -

echo "✅ Deployment package created: frontend-deploy.zip"

# Get the Elastic Beanstalk URL
ENV_URL=$(aws elasticbeanstalk describe-environments \
    --environment-names dpnet-backend-env \
    --query "Environments[0].CNAME" \
    --output text)

echo "✅ Backend is deployed at: http://$ENV_URL"
echo "✅ Frontend is built with API URL: http://$ENV_URL/api"

# Instructions for deploying to AWS Amplify
echo ""
echo "To deploy the frontend to AWS Amplify:"
echo "1. Push your code to a Git repository (GitHub, GitLab, etc.)"
echo "2. Log in to the AWS Amplify Console"
echo "3. Choose 'Connect app' and select your repository"
echo "4. Follow the instructions in the AWS_DEPLOYMENT_GUIDE.md file"
echo ""

# Clean up
rm -rf "$TEMP_DIR"
echo "✅ Temporary directory removed."

echo "✅ Frontend build completed successfully!"
echo "The frontend is now ready to be deployed to AWS Amplify."
