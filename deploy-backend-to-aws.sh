#!/bin/bash

# Script to package and deploy backend to AWS Elastic Beanstalk with explicit version creation
set -e  # Exit immediately if a command exits with a non-zero status

AWS_PROFILE="dpnet-profile"
APP_NAME="double9"
ENV_NAME="double9-env"
VERSION_LABEL="v$(date +%Y%m%d-%H%M%S)"
ZIP_FILE="backend-deploy.zip"
S3_KEY="double9/$ZIP_FILE"

# Step 1: Verify AWS Profile
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
  echo "❌ Error: AWS profile '$AWS_PROFILE' is not configured correctly."
  exit 1
fi

echo "✅ AWS profile '$AWS_PROFILE' is correctly configured."

# Step 2: Confirm Elastic Beanstalk Environment is Ready
echo "🔍 Checking Elastic Beanstalk environment status..."
ENV_STATUS=$(aws elasticbeanstalk describe-environments \
    --application-name "$APP_NAME" \
    --environment-name "$ENV_NAME" \
    --query "Environments[0].Status" \
    --output text \
    --profile "$AWS_PROFILE")

if [[ "$ENV_STATUS" != "Ready" ]]; then
  echo "❌ Environment '$ENV_NAME' is not ready (status: $ENV_STATUS)."
  exit 1
fi

echo "✅ Environment '$ENV_NAME' is ready."

# Step 3: Get correct Elastic Beanstalk S3 Bucket
BUCKET_NAME=$(aws s3 ls --profile "$AWS_PROFILE" | grep elasticbeanstalk | awk '{print $3}' | grep "elasticbeanstalk-" | head -n 1)

if [ -z "$BUCKET_NAME" ]; then
  echo "❌ Elastic Beanstalk bucket not found."
  exit 1
fi

echo "🪣 Using S3 bucket: $BUCKET_NAME"

# Step 4: Zip Backend Code
echo "📦 Zipping backend code..."
zip -r "$ZIP_FILE" . -x "*.git*" "node_modules/*" ".vscode/*" "build/*"

# Step 5: Upload Zip to S3 Bucket
echo "⬆️ Uploading zip to S3..."
aws s3 cp "$ZIP_FILE" "s3://$BUCKET_NAME/$S3_KEY" --profile "$AWS_PROFILE"

# Step 5: Register the Application Version in Elastic Beanstalk
echo "📝 Registering new application version '$VERSION_LABEL'..."
aws elasticbeanstalk create-application-version \
    --application-name "$APP_NAME" \
    --version-label "$VERSION_LABEL" \
    --source-bundle S3Bucket="$BUCKET_NAME",S3Key="$S3_KEY" \
    --profile "$AWS_PROFILE"

# Step 5: Deploy to Elastic Beanstalk Environment
echo "🚀 Deploying version '$VERSION_LABEL' to environment '$ENV_NAME'..."
aws elasticbeanstalk update-environment \
    --application-name "$APP_NAME" \
    --environment-name "$ENV_NAME" \
    --version-label "$VERSION_LABEL" \
    --profile "$AWS_PROFILE"

echo "🎉 Deployment initiated successfully!"
