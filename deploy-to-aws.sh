#!/bin/bash

# AWS Deployment Script for DPNET-10 Admin Dashboard Backend Services
set -e  # Exit on error

echo "Starting AWS Deployment..."

AWS_PROFILE="dpnet-profile"
AWS_REGION="us-east-2"
APP_NAME="dpnet-backend"
ENV_NAME="dpnet-backend-env"
INSTANCE_PROFILE_NAME="aws-elasticbeanstalk-ec2-role"

# Ensure AWS CLI is configured
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
  echo "❌ Error: AWS profile '$AWS_PROFILE' is not configured correctly."
  exit 1
fi

# Ensure Instance Profile exists and is attached
INSTANCE_PROFILE_EXISTS=$(aws iam get-instance-profile --instance-profile-name "$INSTANCE_PROFILE_NAME" --profile "$AWS_PROFILE" --query "InstanceProfile.InstanceProfileName" --output text || echo "None")

if [[ "$INSTANCE_PROFILE_EXISTS" == "None" ]]; then
  echo "❌ Error: Instance Profile '$INSTANCE_PROFILE_NAME' does not exist. Create it first."
  exit 1
else
  echo "✅ Instance Profile '$INSTANCE_PROFILE_NAME' found."
fi

# Check if application exists
APP_EXISTS=$(aws elasticbeanstalk describe-applications --application-names "$APP_NAME" --query 'Applications[*].ApplicationName' --output text --profile "$AWS_PROFILE")

if [[ "$APP_EXISTS" == "$APP_NAME" ]]; then
  echo "✅ Application '$APP_NAME' already exists. Skipping creation."
else
  echo "🚀 Creating new application: $APP_NAME"
  aws elasticbeanstalk create-application --application-name "$APP_NAME" --profile "$AWS_PROFILE"
  sleep 10
fi

# Check if environment exists
ENV_STATUS=$(aws elasticbeanstalk describe-environments \
    --application-name "$APP_NAME" \
    --environment-name "$ENV_NAME" \
    --query "Environments[0].Status" \
    --output text --profile "$AWS_PROFILE")

if [[ "$ENV_STATUS" == "Ready" || "$ENV_STATUS" == "Launching" || "$ENV_STATUS" == "Updating" ]]; then
  echo "✅ Environment '$ENV_NAME' is already running with status: $ENV_STATUS"
  exit 0
elif [[ "$ENV_STATUS" == "Terminated" || "$ENV_STATUS" == "None" ]]; then
  echo "🚀 Creating new environment: $ENV_NAME"
  aws elasticbeanstalk create-environment \
      --application-name "$APP_NAME" \
      --environment-name "$ENV_NAME" \
      --solution-stack-name "64bit Amazon Linux 2023 v6.4.3 running Node.js 18" \
      --option-settings Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value="$INSTANCE_PROFILE_NAME" \
      --profile "$AWS_PROFILE"
else
  echo "⚠️ Unexpected environment status: $ENV_STATUS"
  exit 1
fi

echo "⏳ Waiting for environment to be created..."

# Wait for the environment to become ready using a loop
while true; do
    STATUS=$(aws elasticbeanstalk describe-environments \
        --application-name "$APP_NAME" \
        --environment-name "$ENV_NAME" \
        --query "Environments[0].Status" \
        --output text --profile "$AWS_PROFILE")

    if [[ "$STATUS" == "Ready" ]]; then
        echo "✅ Environment is ready!"
        break
    elif [[ "$STATUS" == "Terminated" ]]; then
        echo "❌ Environment failed. Check AWS console logs."
        exit 1
    elif [[ "$STATUS" == "Launching" || "$STATUS" == "Updating" ]]; then
        echo "⏳ Environment status: $STATUS. Waiting..."
        sleep 15
    else
        echo "❌ Unknown status: $STATUS. Exiting."
        exit 1
    fi
done

echo "✅ Environment successfully created!"
