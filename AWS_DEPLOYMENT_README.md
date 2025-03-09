# AWS Deployment for DPNET-10 Admin Dashboard

This document explains how to deploy the DPNET-10 Admin Dashboard to AWS.

## Overview

The DPNET-10 Admin Dashboard consists of two main components:

1. **Backend Services**: Node.js Express servers that handle API requests, interact with DynamoDB, and connect to the Solana blockchain.
2. **Frontend Application**: React application that provides the user interface.

The deployment process involves:

1. Setting up DynamoDB tables
2. Creating an Elastic Beanstalk environment
3. Deploying the backend services to Elastic Beanstalk
4. Building the frontend with the correct API URLs
5. Deploying the frontend to AWS Amplify

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account**: Create one at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI**: Install from [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. **AWS Credentials**: Configure with `aws configure`
4. **IAM Permissions**: Your AWS user needs permissions for:
   - Elastic Beanstalk
   - S3
   - DynamoDB
   - IAM roles

## Deployment Scripts

We've created several scripts to automate the deployment process:

### 1. `deploy-to-aws.sh`

This script creates the Elastic Beanstalk application and environment.

```bash
./deploy-to-aws.sh
```

### 2. `deploy-backend-to-aws.sh`

This script packages and deploys the backend code to Elastic Beanstalk.

```bash
./deploy-backend-to-aws.sh
```

### 3. `deploy-frontend-to-aws.sh`

This script builds the frontend with the correct API URLs and packages it for deployment to AWS Amplify.

```bash
./deploy-frontend-to-aws.sh
```

### 4. `fix-aws-deploy-imports.sh`

This script fixes the imports in the aws-deploy files to ensure they work correctly when deployed to Elastic Beanstalk.

```bash
./fix-aws-deploy-imports.sh
```

### 5. `deploy-all-to-aws-updated.sh`

This is a master script that runs all the necessary steps to deploy both the backend and frontend.

```bash
./deploy-all-to-aws-updated.sh
```

### 6. `push-to-github-updated.sh`

This script pushes the changes to GitHub, which can then be connected to AWS Amplify for frontend deployment.

```bash
./push-to-github-updated.sh
```

## Deployment Process

### Option 1: Automated Deployment

Run the master deployment script:

```bash
./deploy-all-to-aws-updated.sh
```

This will:
1. Set up DynamoDB tables
2. Create the Elastic Beanstalk environment
3. Fix imports in aws-deploy files
4. Deploy the backend services
5. Update the frontend API URLs
6. Build and package the frontend

### Option 2: Manual Deployment

If you prefer to deploy each component separately:

1. Set up DynamoDB tables:
   ```bash
   ./setup-aws-dynamodb.sh
   ```

2. Create the Elastic Beanstalk environment:
   ```bash
   ./deploy-to-aws.sh
   ```

3. Fix imports in aws-deploy files:
   ```bash
   ./fix-aws-deploy-imports.sh
   ```

4. Deploy the backend services:
   ```bash
   ./deploy-backend-to-aws.sh
   ```

5. Build and package the frontend:
   ```bash
   ./deploy-frontend-to-aws.sh
   ```

6. Push to GitHub:
   ```bash
   ./push-to-github-updated.sh
   ```

## Frontend Deployment to AWS Amplify

After pushing your code to GitHub:

1. Log in to the AWS Amplify Console
2. Choose "Connect app" and select your repository
3. Configure build settings:
   ```yaml
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
   ```
4. Deploy the application

## Troubleshooting

If you encounter issues:

1. **Check logs**:
   - Elastic Beanstalk logs in CloudWatch
   - Amplify build logs

2. **Verify environment variables**:
   - Ensure all required environment variables are set

3. **Check security groups**:
   - Ensure proper network access between services

4. **API Connection Issues**:
   - Verify that the API URLs in `src/services/api.js` and `src/services/solanaApi.js` are correct
   - Ensure CORS is properly configured on the backend

## Monitoring and Management

After deployment, you can:

1. **Monitor your application**:
   - AWS Elastic Beanstalk Console for backend
   - AWS Amplify Console for frontend
   - CloudWatch for logs and metrics

2. **Scale your application**:
   - Elastic Beanstalk environment configuration
   - Auto-scaling groups

3. **Update your application**:
   - Run `./deploy-backend-to-aws.sh` for backend updates
   - Push to your Git repository for frontend updates
