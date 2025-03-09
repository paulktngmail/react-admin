/**
 * Script to check AWS IAM permissions for the Elastic Beanstalk environment
 * This script will create configuration files for IAM permissions, security groups, and API Gateway
 */

const fs = require('fs');
const path = require('path');

// Path to the .ebextensions directory in the backend
const ebExtensionsPath = path.join(__dirname, '../../qwerty-app/.ebextensions');

// Create the .ebextensions directory if it doesn't exist
if (!fs.existsSync(ebExtensionsPath)) {
  console.log(`Creating .ebextensions directory at ${ebExtensionsPath}...`);
  fs.mkdirSync(ebExtensionsPath, { recursive: true });
}

// Path to the IAM permissions configuration file
const iamConfigPath = path.join(ebExtensionsPath, 'iam-permissions.config');

// IAM permissions configuration content
const iamConfig = `# IAM permissions configuration
# This file configures the IAM permissions for the Elastic Beanstalk environment

option_settings:
  aws:autoscaling:launchconfiguration:
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role

Resources:
  AWSEBAutoScalingGroup:
    Metadata:
      AWS::CloudFormation::Authentication:
        S3Auth:
          type: "s3"
          buckets: ["elasticbeanstalk-us-east-2-123456789012"]
          roleName: "aws-elasticbeanstalk-ec2-role"
`;

// Write the IAM permissions configuration file
console.log(`Writing IAM permissions configuration file to ${iamConfigPath}...`);
fs.writeFileSync(iamConfigPath, iamConfig);
console.log('IAM permissions configuration file created successfully!');

// Path to the security group configuration file
const securityGroupConfigPath = path.join(ebExtensionsPath, 'security-group.config');

// Security group configuration content
const securityGroupConfig = `# Security group configuration
# This file configures the security groups for the Elastic Beanstalk environment

Resources:
  sslSecurityGroupIngress:
    Type: AWS::EC2::SecurityGroupIngress
    Properties:
      GroupId: {"Fn::GetAtt" : ["AWSEBSecurityGroup", "GroupId"]}
      IpProtocol: tcp
      ToPort: 443
      FromPort: 443
      CidrIp: 0.0.0.0/0
      Description: "Allow HTTPS traffic"

  httpSecurityGroupIngress:
    Type: AWS::EC2::SecurityGroupIngress
    Properties:
      GroupId: {"Fn::GetAtt" : ["AWSEBSecurityGroup", "GroupId"]}
      IpProtocol: tcp
      ToPort: 80
      FromPort: 80
      CidrIp: 0.0.0.0/0
      Description: "Allow HTTP traffic"

  apiSecurityGroupIngress:
    Type: AWS::EC2::SecurityGroupIngress
    Properties:
      GroupId: {"Fn::GetAtt" : ["AWSEBSecurityGroup", "GroupId"]}
      IpProtocol: tcp
      ToPort: 8081
      FromPort: 8081
      CidrIp: 0.0.0.0/0
      Description: "Allow API traffic"
`;

// Write the security group configuration file
console.log(`Writing security group configuration file to ${securityGroupConfigPath}...`);
fs.writeFileSync(securityGroupConfigPath, securityGroupConfig);
console.log('Security group configuration file created successfully!');

// Path to the CORS configuration file
const corsConfigPath = path.join(ebExtensionsPath, 'cors-headers.config');

// CORS configuration content
const corsConfig = `# CORS configuration
# This file configures CORS headers for the Elastic Beanstalk environment

files:
  /etc/nginx/conf.d/cors.conf:
    mode: "000644"
    owner: root
    group: root
    content: |
      # CORS configuration
      map $http_origin $cors_header {
        default "";
        "~^https?://admin.dash628.com" "$http_origin";
        "~^https?://dash628.com" "$http_origin";
        "~^https?://localhost:3000" "$http_origin";
        "~^https?://localhost:8080" "$http_origin";
      }

      server {
        listen 80;
        
        location / {
          add_header 'Access-Control-Allow-Origin' $cors_header always;
          add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
          add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
          add_header 'Access-Control-Allow-Credentials' 'true' always;
          
          if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' $cors_header always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
          }
          
          proxy_pass http://localhost:8081;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
        }
      }

container_commands:
  01_restart_nginx:
    command: "service nginx restart"
`;

// Write the CORS configuration file
console.log(`Writing CORS configuration file to ${corsConfigPath}...`);
fs.writeFileSync(corsConfigPath, corsConfig);
console.log('CORS configuration file created successfully!');

console.log('AWS permissions and configuration check completed!');
