# AWS Deployment Guide for DPNET-10 Admin Dashboard

## Why Deploy to AWS?

Running backend services locally has several limitations:
1. **Availability**: Services stop when you shut down your computer
2. **Reliability**: Local network issues or computer crashes can interrupt service
3. **Scalability**: Limited by your local machine's resources
4. **Security**: Exposes your local machine to potential security risks
5. **Professional Setup**: Production applications should run on dedicated infrastructure

By deploying to AWS, you get:
1. **24/7 Availability**: Services run continuously in the cloud
2. **High Reliability**: AWS infrastructure is designed for high uptime
3. **Scalability**: Easily scale up as your user base grows
4. **Security**: AWS provides robust security features
5. **Professional Infrastructure**: Industry-standard hosting environment

## Prerequisites

Before deploying to AWS, ensure you have:

1. **AWS Account**: Create one at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI**: Install from [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. **AWS Credentials**: Configure with `aws configure`
4. **IAM Permissions**: Your AWS user needs permissions for:
   - Elastic Beanstalk
   - S3
   - DynamoDB
   - IAM roles

## Deployment Steps

### 1. Set Up AWS Resources

First, ensure you have the necessary DynamoDB tables:

```bash
aws dynamodb create-table \
    --table-name dpnetsale \
    --attribute-definitions AttributeName=saleKey,AttributeType=S \
    --key-schema AttributeName=saleKey,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
    --table-name dpnet-whitelist \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
    --table-name dpnet-transactions \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### 2. Deploy Backend Services

We've created a deployment script that handles the entire process:

```bash
cd /Users/paulktn/dpnet10/react-admin
./deploy-to-aws.sh
```

This script:
1. Packages both backend services (main server and Solana API)
2. Creates necessary AWS Elastic Beanstalk resources
3. Deploys the application to AWS
4. Updates the frontend configuration to use the AWS backend

### 3. Deploy Frontend to AWS Amplify

For the frontend, we recommend using AWS Amplify:

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Log in to the AWS Amplify Console
3. Choose "Connect app" and select your repository
4. Configure build settings:
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
5. Deploy the application

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
   - Run `./deploy-to-aws.sh` for backend updates
   - Push to your Git repository for frontend updates

## Troubleshooting

If you encounter issues:

1. **Check logs**:
   - Elastic Beanstalk logs in CloudWatch
   - Amplify build logs

2. **Verify environment variables**:
   - Ensure all required environment variables are set

3. **Check security groups**:
   - Ensure proper network access between services

## Cost Considerations

AWS services used in this deployment:
- Elastic Beanstalk (EC2 instances)
- DynamoDB
- S3
- CloudWatch
- Amplify

For a development environment, this should cost approximately $30-50 per month. You can reduce costs by:
- Using smaller instance types
- Stopping environments when not in use
- Using AWS Free Tier resources where possible

## Conclusion

Deploying to AWS provides a professional, reliable infrastructure for your DPNET-10 Admin Dashboard. The backend services will run continuously, even when your local machine is off, and the frontend will be accessible from anywhere.

For any questions or issues, refer to the AWS documentation or contact your AWS administrator.
