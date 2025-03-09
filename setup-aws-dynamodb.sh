#!/bin/bash

# Setup script for AWS DynamoDB tables required by DPNET-10 Admin Dashboard
# This script creates the necessary DynamoDB tables in AWS

echo "Setting up AWS DynamoDB tables for DPNET-10 Admin Dashboard..."

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

# Set AWS region
AWS_REGION=$(aws configure get region)
if [ -z "$AWS_REGION" ]; then
    AWS_REGION="us-east-2"
    echo "No AWS region found in configuration. Using default: $AWS_REGION"
fi

echo "Using AWS region: $AWS_REGION"

# Create presale table
echo "Creating dpnetsale table..."
aws dynamodb create-table \
    --table-name dpnetsale \
    --attribute-definitions AttributeName=saleKey,AttributeType=S \
    --key-schema AttributeName=saleKey,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $AWS_REGION

# Create whitelist table
echo "Creating dpnet-whitelist table..."
aws dynamodb create-table \
    --table-name dpnet-whitelist \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $AWS_REGION

# Create transactions table
echo "Creating dpnet-transactions table..."
aws dynamodb create-table \
    --table-name dpnet-transactions \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $AWS_REGION

# Wait for tables to be created
echo "Waiting for tables to be created..."
aws dynamodb wait table-exists --table-name dpnetsale --region $AWS_REGION
aws dynamodb wait table-exists --table-name dpnet-whitelist --region $AWS_REGION
aws dynamodb wait table-exists --table-name dpnet-transactions --region $AWS_REGION

# Initialize presale data
echo "Initializing presale data..."
aws dynamodb put-item \
    --table-name dpnetsale \
    --item '{
        "saleKey": {"S": "presale-info"},
        "totalSupply": {"N": "500000000"},
        "tokensSold": {"N": "250000000"},
        "tokensSoldForSol": {"N": "200000000"},
        "tokensSoldForFiat": {"N": "50000000"},
        "transactionsNumber": {"N": "1250"},
        "lastUpdated": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
        "timeLeft": {
            "M": {
                "days": {"N": "30"},
                "hours": {"N": "12"},
                "minutes": {"N": "45"},
                "seconds": {"N": "20"}
            }
        },
        "presalePoolAddress": {"S": "bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX"},
        "tokenAddress": {"S": "F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK"}
    }' \
    --region $AWS_REGION

# Add sample whitelist entries
echo "Adding sample whitelist entries..."
aws dynamodb put-item \
    --table-name dpnet-whitelist \
    --item '{
        "id": {"S": "1"},
        "walletAddress": {"S": "5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8"},
        "allocation": {"N": "10000"},
        "email": {"S": "user1@example.com"},
        "dateAdded": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
        "status": {"S": "Active"}
    }' \
    --region $AWS_REGION

aws dynamodb put-item \
    --table-name dpnet-whitelist \
    --item '{
        "id": {"S": "2"},
        "walletAddress": {"S": "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg"},
        "allocation": {"N": "20000"},
        "email": {"S": "user2@example.com"},
        "dateAdded": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
        "status": {"S": "Active"}
    }' \
    --region $AWS_REGION

# Add sample transaction
echo "Adding sample transaction..."
aws dynamodb put-item \
    --table-name dpnet-transactions \
    --item '{
        "id": {"S": "1"},
        "type": {"S": "purchase"},
        "amount": {"N": "5000"},
        "recipient": {"S": "5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8"},
        "timestamp": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
    }' \
    --region $AWS_REGION

echo "DynamoDB tables setup completed successfully!"
echo "The following tables have been created:"
echo "  - dpnetsale: Stores presale information"
echo "  - dpnet-whitelist: Stores whitelisted wallet addresses"
echo "  - dpnet-transactions: Stores transaction records"
echo ""
echo "Sample data has been added to each table."
echo ""
echo "Next steps:"
echo "1. Run ./deploy-to-aws.sh to deploy the backend services to AWS Elastic Beanstalk"
echo "2. Follow the AWS_DEPLOYMENT_GUIDE.md for deploying the frontend to AWS Amplify"
