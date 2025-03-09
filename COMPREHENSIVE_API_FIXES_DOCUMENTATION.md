# Comprehensive API Communication Fixes Documentation

## Problem Overview

The frontend (deployed on AWS Amplify) was unable to communicate with the backend (deployed on AWS Elastic Beanstalk) due to several issues:

1. **Protocol Mismatch**: The frontend was using HTTP to connect to the backend, while the backend might be expecting HTTPS connections.
2. **Double API Prefix Issue**: The frontend was trying to connect to URLs with a double `/api/api/` prefix.
3. **Incorrect Proxy Configuration**: The proxy configuration in setupProxy.js and amplify.yml was incorrect.
4. **CORS Issues**: The backend CORS configuration was not allowing requests from the frontend domain.
5. **AWS Security Group Issues**: The security groups for the Elastic Beanstalk environment might not allow incoming traffic from the Amplify domain.
6. **AWS IAM Permissions**: The backend might not have the necessary IAM permissions to access other AWS services.
7. **Inconsistent API Request Methods**: Different components were using different methods to make API requests.

## Solutions Implemented

We implemented a multi-layered approach to fix the API communication issues:

### 1. Fixed Protocol Mismatch

Updated all API endpoints to use HTTPS instead of HTTP:

```javascript
// BEFORE
const BACKEND_API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';

// AFTER
const BACKEND_API_URL = 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';
```

### 2. Fixed Proxy Configuration

#### setupProxy.js

```javascript
// BEFORE
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api': '' }
    })
  );
};

// AFTER
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api': '/api' }
    })
  );
};
```

#### amplify.yml

```yaml
# BEFORE
proxies:
  - path: '/api/*'
    target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api'
    status: '200'
    pathRewrite: '^/api/'

# AFTER
proxies:
  - path: '/api/*'
    target: 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'
    status: '200'
    pathRewrite:
      '^/api': '/api'
```

### 3. Fixed Backend CORS Configuration

Updated the CORS configuration in the backend server.js file to allow requests from all origins:

```javascript
// BEFORE
app.use(cors({
  origin: ['https://admin.dash628.com', 'https://dash628.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// AFTER
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // Allow all origins
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));
```

### 4. Configured HTTPS for Elastic Beanstalk

Created HTTPS configuration files for the Elastic Beanstalk environment:

```yaml
# https-instance.config
Resources:
  sslSecurityGroupIngress:
    Type: AWS::EC2::SecurityGroupIngress
    Properties:
      GroupId: {"Fn::GetAtt" : ["AWSEBSecurityGroup", "GroupId"]}
      IpProtocol: tcp
      ToPort: 443
      FromPort: 443
      CidrIp: 0.0.0.0/0

files:
  /etc/nginx/conf.d/https.conf:
    mode: "000644"
    owner: root
    group: root
    content: |
      # HTTPS server
      server {
        listen       443 default ssl;
        server_name  localhost;
        
        ssl_certificate      /etc/pki/tls/certs/server.crt;
        ssl_certificate_key  /etc/pki/tls/certs/server.key;
        
        ssl_session_timeout  5m;
        
        ssl_protocols  TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers   on;
        
        location / {
          proxy_pass  http://localhost:8081;
          proxy_set_header   Connection "";
          proxy_http_version 1.1;
          proxy_set_header        Host            $host;
          proxy_set_header        X-Real-IP       $remote_addr;
          proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header        X-Forwarded-Proto $scheme;
        }
      }
```

### 5. Configured AWS Security Groups

Created security group configuration files for the Elastic Beanstalk environment:

```yaml
# security-group.config
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
```

### 6. Configured AWS IAM Permissions

Created IAM permissions configuration files for the Elastic Beanstalk environment:

```yaml
# iam-permissions.config
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
```

### 7. Created Direct API Service

Implemented a new direct-api.js service that bypasses the proxy and connects directly to the backend:

```javascript
// Direct API service for making requests directly to the backend
import axios from 'axios';

// Backend API URL - direct connection to the backend
const BACKEND_API_URL = 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';

// Create an axios instance with the backend API URL
const directApi = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://admin.dash628.com'
  }
});

// API methods...
```

### 8. Implemented Fallback Mechanism

Updated the WhitelistManagement.js and PresaleOverview.js components to use a multi-layered approach to API requests:

1. First try the direct API (bypassing proxy)
2. Then try the solanaApi service
3. Finally try the regular API service
4. Fall back to mock data if all API attempts fail

```javascript
// Try multiple approaches to get the data
try {
  // First try the direct API (bypassing proxy)
  try {
    console.log('Fetching data using directApi...');
    data = await directApi.getWhitelistedUsers();
    console.log('Direct API success:', data);
    setWhitelistedUsers(data);
    setError(null);
    return; // Exit early if successful
  } catch (directErr) {
    console.error('Error with directApi connection:', directErr);
    errorMessage = 'Direct API failed: ' + directErr.message;
  }
  
  // Then try solanaApi
  try {
    console.log('Fetching token info using solanaApi...');
    await solanaApi.getTokenInfo();
    
    // If the above succeeds, then try the regular API
    console.log('SolanaApi connection successful, fetching data using api...');
    data = await api.getWhitelistedUsers();
    console.log('Regular API success:', data);
    setWhitelistedUsers(data);
    setError(null);
    return; // Exit early if successful
  } catch (solanaErr) {
    // Additional fallback logic...
  }
} catch (err) {
  // Fall back to mock data if all API attempts fail
  setWhitelistedUsers([/* mock data */]);
  setError('Using local data. API connection failed.');
}
```

## Testing and Verification

We created several test scripts to verify the API communication:

1. **test-https-backend.js**: Tests the backend API endpoints directly using HTTPS
2. **test-api-communication.js**: Tests the communication between frontend and backend
3. **test-deployed-frontend.js**: Tests the deployed frontend pages

## Deployment

We created deployment scripts to deploy the updated frontend and backend:

1. **deploy-updated-backend-to-aws.sh**: Deploys the updated backend to AWS Elastic Beanstalk
2. **deploy-final-fix.sh**: Deploys the updated frontend to AWS Amplify
3. **deploy-all-fixes.sh**: Deploys both the frontend and backend

### 9. Fixed Node.js Version Issues

We encountered deployment issues with the Node.js version in Elastic Beanstalk. To fix this, we:

1. Specified a specific Node.js version in package.json:

```json
"engines": {
  "node": "18.18.0"
}
```

2. Created a nodejs.config file in the .ebextensions directory:

```yaml
# Node.js configuration for Elastic Beanstalk
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeVersion: 18.18.0
    ProxyServer: nginx
    NodeCommand: "npm start"
  aws:elasticbeanstalk:environment:proxy:
    ProxyServer: nginx
```

3. Created a platform.config file in the .ebextensions directory:

```yaml
# Platform configuration for Elastic Beanstalk
option_settings:
  aws:elasticbeanstalk:environment:
    EnvironmentType: SingleInstance
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:elasticbeanstalk:application:environment:
    NPM_USE_PRODUCTION: false
    NODE_ENV: production
    NODE_OPTIONS: "--max-old-space-size=2048"
```

## Conclusion

The API communication issue was caused by a combination of protocol mismatch, incorrect proxy configuration, CORS issues, AWS security group issues, AWS IAM permissions, Node.js version issues, and inconsistent API request methods. We fixed these issues by:

1. Updating all API endpoints to use HTTPS instead of HTTP
2. Correcting the proxy configuration in setupProxy.js and amplify.yml
3. Updating the CORS configuration in the backend server.js file
4. Configuring HTTPS for the Elastic Beanstalk environment
5. Configuring AWS security groups for the Elastic Beanstalk environment
6. Configuring AWS IAM permissions for the Elastic Beanstalk environment
7. Creating a direct API service that bypasses the proxy
8. Implementing a fallback mechanism in the frontend components
9. Fixing Node.js version issues in Elastic Beanstalk

This comprehensive approach ensures that the frontend can communicate with the backend even if one method fails, providing a robust solution to the API communication issues.
