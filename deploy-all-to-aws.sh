#!/bin/bash

# Master deployment script for DPNET-10 Admin Dashboard
# This script runs all the necessary steps to deploy the application to AWS

echo "Starting complete AWS deployment for DPNET-10 Admin Dashboard..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS is configured
if ! aws configure list &> /dev/null; then
    echo "AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Step 1: Set up DynamoDB tables
echo "Step 1: Setting up DynamoDB tables..."
./setup-aws-dynamodb.sh
if [ $? -ne 0 ]; then
    echo "Failed to set up DynamoDB tables. Aborting deployment."
    exit 1
fi
echo "DynamoDB tables setup completed."

# Step 2: Deploy backend services to Elastic Beanstalk
echo "Step 2: Deploying backend services to Elastic Beanstalk..."
./deploy-to-aws.sh
if [ $? -ne 0 ]; then
    echo "Failed to deploy backend services. Aborting deployment."
    exit 1
fi
echo "Backend services deployment completed."

# Step 3: Prepare frontend for deployment
echo "Step 3: Preparing frontend for deployment to AWS Amplify..."

# Create amplify.yml file if it doesn't exist
if [ ! -f "amplify.yml" ]; then
    echo "Creating amplify.yml file..."
    cat > amplify.yml << EOL
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
EOL
    echo "amplify.yml file created."
fi

# Create _redirects file for SPA routing
mkdir -p public
if [ ! -f "public/_redirects" ]; then
    echo "Creating _redirects file for SPA routing..."
    echo "/* /index.html 200" > public/_redirects
    echo "_redirects file created."
fi

# Step 4: Build the frontend
echo "Step 4: Building the frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build the frontend. Aborting deployment."
    exit 1
fi
echo "Frontend build completed."

# Step 5: Instructions for deploying to AWS Amplify
echo "Step 5: Instructions for deploying to AWS Amplify..."
echo ""
echo "To deploy the frontend to AWS Amplify:"
echo "1. Push your code to a Git repository (GitHub, GitLab, etc.)"
echo "2. Log in to the AWS Amplify Console"
echo "3. Choose 'Connect app' and select your repository"
echo "4. Follow the instructions in the AWS_DEPLOYMENT_GUIDE.md file"
echo ""

# Get the backend URL
BACKEND_URL=$(aws elasticbeanstalk describe-environments --environment-names dpnet-backend-env --query "Environments[0].CNAME" --output text)
if [ -n "$BACKEND_URL" ]; then
    echo "Backend deployed at: http://$BACKEND_URL"
    echo "Make sure your frontend is configured to use this URL."
fi

echo "Deployment preparation completed!"
echo ""
echo "Your DPNET-10 Admin Dashboard is now ready for production use."
echo "The backend services are running on AWS Elastic Beanstalk and will continue to run even when your local machine is off."
echo "Follow the instructions above to complete the frontend deployment to AWS Amplify."
echo ""
echo "For more information, refer to the AWS_DEPLOYMENT_GUIDE.md file."
