# Comprehensive API Communication Fix

After thorough analysis, I've identified multiple issues causing the API communication problems between the frontend and backend. Here's a comprehensive solution to fix all these issues:

## Issues Identified

1. **Protocol Mismatch**: The frontend is using HTTPS, but trying to connect to the backend using HTTP.
2. **Proxy Configuration Issues**: The Amplify proxy configuration is not correctly forwarding API requests to the backend.
3. **CORS Configuration**: The backend CORS settings need to be updated to allow requests from the frontend.
4. **Redirect Configuration**: The Netlify _redirects file is not being properly applied.
5. **API Path Inconsistencies**: Some API endpoints in the frontend code don't match the backend expectations.
6. **Error Handling**: Inadequate error handling in the frontend code.
7. **Multiple API Request Approaches**: The code is using multiple approaches to make API requests, leading to confusion.
8. **Fallback to Mock Data**: The frontend is falling back to mock data when API requests fail, masking the real issues.

## Solutions

### 1. Fix Protocol Mismatch

The frontend is deployed on HTTPS (https://admin.dash628.com), but the backend is on HTTP (http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com). Modern browsers block mixed content (HTTPS pages loading HTTP resources).

**Solution**: Update the Amplify configuration to handle this properly:

```yaml
# amplify.yml
proxies:
  - path: '/api/*'
    target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'
    status: '200'
    pathRewrite:
      '^/api': '/api'
    options:
      secure: false  # Allow HTTPS to HTTP proxying
```

### 2. Fix Netlify Redirects

Update the _redirects file to ensure it's properly handling API requests:

```
# public/_redirects
/api/*  http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/:splat  200!
/*      /index.html                                                                200
```

### 3. Update Direct API Configuration

Modify the direct-api.js file to use relative URLs instead of absolute URLs:

```javascript
// src/direct-api.js
import axios from 'axios';

// Use relative URL instead of absolute URL
const BACKEND_API_URL = '/api';  // Instead of 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'

// Create an axios instance with the backend API URL
const directApi = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Rest of the file remains the same...
```

### 4. Standardize API Request Approach

The frontend code is using multiple approaches to make API requests (fetch, axios, direct API calls). Standardize on a single approach:

1. Create a unified API service that handles all API requests
2. Implement proper error handling
3. Add request/response interceptors for common tasks

```javascript
// src/services/unified-api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  config => {
    // You can add authentication headers here if needed
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 5. Update Backend CORS Configuration

Ensure the backend CORS configuration allows requests from the frontend:

```javascript
// server.js
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // Allow specific origins
    const allowedOrigins = [
      'https://admin.dash628.com',
      'http://localhost:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));
```

### 6. Improve Error Handling in Components

Update components to handle API errors more gracefully:

```javascript
// Example for WhitelistManagement.js
const fetchWhitelistedUsers = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await api.get('/pool/whitelist');
    setWhitelistedUsers(response.data);
  } catch (error) {
    console.error('Error fetching whitelist data:', error);
    setError('Failed to load whitelist data. Please try again later.');
    
    // Only use mock data in development environment
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data in development environment');
      setWhitelistedUsers([
        { id: 1, address: '7XSvJnS19TodrQJSbjUR3NLSZoK3mHvfGqVhxJQRPvTb', email: 'user1@example.com', dateAdded: '2025-03-01', status: 'Active' },
        // ... other mock data
      ]);
    }
  } finally {
    setLoading(false);
  }
};
```

### 7. Update setupProxy.js for Local Development

Ensure the setupProxy.js file is correctly configured for local development:

```javascript
// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api': '/api' },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log('Proxying:', req.method, req.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};
```

### 8. Create a Deployment Script

Create a comprehensive deployment script that handles all the necessary steps:

```bash
#!/bin/bash

# deploy-complete-solution.sh

echo "===== Deploying Complete Solution ====="

# 1. Build the frontend
echo "Building frontend..."
NODE_OPTIONS=--openssl-legacy-provider npm run build

# 2. Deploy to AWS Amplify
echo "Deploying to AWS Amplify..."
# Use the AWS CLI or Amplify CLI to deploy
# aws amplify start-deployment --app-id YOUR_APP_ID --branch-name main --source-url s3://your-bucket/build.zip

echo "Deployment complete!"
echo "Please verify the deployment by visiting https://admin.dash628.com"
```

## Implementation Plan

1. Update the direct-api.js file to use relative URLs
2. Create a unified API service
3. Update components to use the unified API service
4. Update the setupProxy.js file
5. Update the _redirects file
6. Update the amplify.yml file
7. Deploy the changes
8. Test the deployment

## Testing

After implementing these changes, test the API communication using the following scripts:

1. test-backend-simple.js - Test the backend API directly
2. test-frontend-proxy.js - Test the frontend proxy to the backend API
3. test-deployed-frontend-api.js - Test the deployed frontend's API access

## Conclusion

By implementing these changes, we should resolve all the API communication issues between the frontend and backend. The key is to ensure consistent API request handling, proper error handling, and correct proxy configuration.
