#!/bin/bash

# Master deployment script for DPNET-10 Admin Dashboard
# This script runs all the necessary steps to deploy the application to AWS
set -e  # Exit on error

echo "Starting complete AWS deployment for DPNET-10 Admin Dashboard..."

AWS_PROFILE="dpnet-profile"
AWS_REGION="us-east-2"
APP_NAME="dpnet-backend"
ENV_NAME="dpnet-backend-env"
VERSION_LABEL="v$(date +%Y%m%d%H%M%S)"  # Unique version label for each deployment

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS is configured
if ! aws configure list --profile "$AWS_PROFILE" &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure --profile $AWS_PROFILE' first."
    exit 1
fi

# Step 1: Set up DynamoDB tables
echo "🛠️ Step 1: Setting up DynamoDB tables..."
./setup-aws-dynamodb.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to set up DynamoDB tables. Aborting deployment."
    exit 1
fi
echo "✅ DynamoDB tables setup completed."

# Step 2: Ensure Elastic Beanstalk Environment is Ready (DO NOT CREATE A NEW ONE)
ENV_STATUS=$(aws elasticbeanstalk describe-environments \
    --application-name "$APP_NAME" \
    --environment-name "$ENV_NAME" \
    --query "Environments[0].Status" \
    --output text --profile "$AWS_PROFILE")

if [[ "$ENV_STATUS" == "Ready" || "$ENV_STATUS" == "Launching" || "$ENV_STATUS" == "Updating" ]]; then
    echo "✅ Environment '$ENV_NAME' is ready for deployment."
else
    echo "❌ Environment '$ENV_NAME' is not ready. Check AWS Console."
    exit 1
fi

# Step 3: Fix imports in aws-deploy files
echo "🛠️ Step 3: Fixing imports in AWS deploy files..."
./fix-aws-deploy-imports.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to fix imports in aws-deploy files. Aborting deployment."
    exit 1
fi
echo "✅ Imports fixed successfully."

# Step 4: Create deployment package
echo "📦 Step 4: Creating deployment package..."
rm -f dpnet-backend-deploy.zip  # Remove old zip file
zip -r dpnet-backend-deploy.zip . -x "*.git*" "*node_modules*" "*deploy-all-to-aws-updated.sh*" || { echo "❌ Failed to create deployment package."; exit 1; }
echo "✅ Deployment package created: dpnet-backend-deploy.zip"

# Step 5: Upload deployment package to S3
echo "📤 Uploading deployment package to S3..."
aws s3 cp dpnet-backend-deploy.zip "s3://elasticbeanstalk-$AWS_REGION-$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query 'Account' --output text)/dpnet-backend-deploy.zip" --profile "$AWS_PROFILE"
echo "✅ Deployment package uploaded."

# Step 6: Create new application version
echo "🚀 Creating new application version: $VERSION_LABEL..."
aws elasticbeanstalk create-application-version \
    --application-name "$APP_NAME" \
    --version-label "$VERSION_LABEL" \
    --source-bundle S3Bucket="elasticbeanstalk-$AWS_REGION-$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query 'Account' --output text)",S3Key="dpnet-backend-deploy.zip" \
    --profile "$AWS_PROFILE"

echo "⏳ Waiting for AWS to process the new application version..."
while true; do
    STATUS=$(aws elasticbeanstalk describe-application-versions \
        --application-name "$APP_NAME" \
        --profile "$AWS_PROFILE" \
        --query "ApplicationVersions[?VersionLabel=='$VERSION_LABEL'].Status" \
        --output text)

    if [[ "$STATUS" == "Processed" ]]; then
        echo "✅ Application version '$VERSION_LABEL' is ready."
        break
    fi

    echo "⏳ Application version is still '$STATUS'. Waiting..."
    sleep 10
done

# Step 7: Deploy to Elastic Beanstalk
echo "🚀 Deploying new version '$VERSION_LABEL' to Elastic Beanstalk..."
aws elasticbeanstalk update-environment \
    --application-name "$APP_NAME" \
    --environment-name "$ENV_NAME" \
    --version-label "$VERSION_LABEL" \
    --profile "$AWS_PROFILE"

echo "✅ Deployment successfully started."

# Step 8: Get the Elastic Beanstalk URL
ENV_URL=$(aws elasticbeanstalk describe-environments \
    --environment-name "$ENV_NAME" \
    --query "Environments[0].CNAME" \
    --output text)

echo "🌎 Backend deployed at: http://$ENV_URL"

# Step 9: Update frontend API services to use the Elastic Beanstalk URL
echo "🔄 Updating frontend API services..."
sed -i '' "s|const API_URL = .*|const API_URL = 'http://$ENV_URL/api';|g" src/services/api.js
sed -i '' "s|const API_URL = .*|const API_URL = 'http://$ENV_URL/api';|g" src/services/solanaApi.js
echo "✅ Frontend API services updated."

# Step 10: Build and deploy frontend
echo "🎨 Step 10: Building and deploying frontend..."
./deploy-frontend-to-aws.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to build and deploy the frontend. Aborting."
    exit 1
fi
echo "✅ Frontend deployment completed."

echo "🎉 Deployment completed successfully!"
echo ""
echo "🌎 Backend services are running at: http://$ENV_URL"
echo "📢 Frontend is updated with the correct API URL."
echo "🚀 Your DPNET-10 Admin Dashboard is live!"
