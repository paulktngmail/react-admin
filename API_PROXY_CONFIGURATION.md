# API Proxy Configuration for AWS Amplify

This document explains how the API proxy is configured to enable communication between the frontend (deployed on AWS Amplify) and the backend (deployed on AWS Elastic Beanstalk).

## Overview

The frontend application is deployed on AWS Amplify at `admin.dash628.com`, while the backend API is deployed on AWS Elastic Beanstalk at `double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com`. To enable seamless communication between the frontend and backend, we've set up an API proxy that forwards requests from `admin.dash628.com/api/*` to `double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/*`.

## Configuration Files

### 1. amplify.yml

The `amplify.yml` file configures the AWS Amplify build and deployment process, including the API proxy:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - echo "Nothing to build for backend"
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - NODE_OPTIONS=--openssl-legacy-provider npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
  customHeaders:
    - pattern: '/api/**'
      headers:
        - key: 'Access-Control-Allow-Origin'
          value: '*'
        - key: 'Access-Control-Allow-Headers'
          value: '*'
        - key: 'Access-Control-Allow-Methods'
          value: 'GET,POST,PUT,DELETE,OPTIONS'
  proxies:
    - path: '/api/*'
      target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api'
      status: '200'
```

The key part is the `rewrites` section, which configures the proxy:

```yaml
rewrites:
  - source: '/api/<*>'
    target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/<*>'
    status: '200'
    condition: null
```

This tells AWS Amplify to forward any requests to `/api/*` to the Elastic Beanstalk backend.

### 2. public/_redirects

The `_redirects` file is used by Netlify (which AWS Amplify is based on) to configure redirects and proxies:

```
# Proxy API requests to Elastic Beanstalk
/api/*  http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/:splat  200

# Handle client-side routing
/*    /index.html   200
```

This file serves as a backup to the `amplify.yml` configuration and ensures that the proxy works correctly.

## Frontend Configuration

The frontend is configured to use the local API endpoint:

```javascript
// src/services/api.js
const API_URL = 'https://admin.dash628.com/api';
```

This means that all API requests will be made to `admin.dash628.com/api/*`, which will then be proxied to the Elastic Beanstalk backend.

## Backend Configuration

The backend is configured to allow CORS requests from the frontend domain:

```javascript
// server.js
app.use(cors({
  origin: ['https://admin.dash628.com', 'https://dash628.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

This ensures that the backend will accept requests from the frontend domain.

## How It Works

1. The frontend makes a request to `https://admin.dash628.com/api/pool/whitelist`
2. AWS Amplify intercepts the request and forwards it to `http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/pool/whitelist`
3. The backend processes the request and returns a response
4. AWS Amplify forwards the response back to the frontend

This proxy configuration allows the frontend and backend to communicate seamlessly, even though they are deployed on different platforms.

## Troubleshooting

If the API proxy is not working correctly, check the following:

1. Verify that the AWS Amplify deployment has completed successfully
2. Check the AWS Amplify logs for any errors
3. Verify that the backend is running and accessible
4. Check that the CORS configuration in the backend allows requests from the frontend domain
5. Test the API endpoints directly using the Elastic Beanstalk URL to ensure they are working correctly

## Testing

You can test the API proxy by visiting `https://admin.dash628.com/api/pool/whitelist` in your browser. If the proxy is working correctly, you should see the whitelist data as JSON.
