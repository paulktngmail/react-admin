# Proxy Approach for Frontend-Backend Communication

This document explains the proxy approach implemented to enable communication between the frontend (deployed on AWS Amplify) and the backend (deployed on AWS Elastic Beanstalk).

## Overview

After identifying mixed content issues (HTTPS frontend trying to access HTTP backend), we've implemented a comprehensive proxy solution that works at both development and production levels.

## Implementation Details

### 1. Development Proxy (setupProxy.js)

For local development, we've added a proxy configuration using `http-proxy-middleware`:

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
    })
  );
};
```

This allows the development server to proxy API requests to the backend.

### 2. Production Proxy (AWS Amplify Configuration)

For production, we've configured AWS Amplify to proxy API requests:

```yaml
# amplify.yml
proxies:
  - path: '/api/*'
    target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'
    status: '200'
```

We've also added a backup configuration in the `_redirects` file:

```
# public/_redirects
/api/*  http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/:splat  200!
```

### 3. Frontend API Configuration

The frontend has been updated to use a relative URL for API requests:

```javascript
// src/services/api.js
const API_URL = '/api';
```

This ensures that API requests are made relative to the current domain, which will then be proxied to the backend.

## How It Works

1. The frontend makes a request to `/api/pool/whitelist`
2. The proxy intercepts the request and forwards it to `http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/pool/whitelist`
3. The backend processes the request and returns a response
4. The proxy forwards the response back to the frontend

## Advantages of the Proxy Approach

1. **Solves Mixed Content Issues**: The frontend makes requests to its own domain over HTTPS, which are then proxied to the HTTP backend.
2. **Simplifies Frontend Configuration**: The frontend uses a simple relative URL for all API requests.
3. **Works in Both Development and Production**: The same approach works for both local development and production environments.
4. **Improves Security**: The proxy can add security headers and handle CORS issues.

## Testing

We've verified that the proxy approach works correctly:

1. The backend API endpoints are accessible and return the expected data.
2. The frontend can successfully make requests to the backend API through the proxy.

## Next Steps

1. **Monitor the AWS Amplify Deployment**: Check the AWS Amplify Console to ensure the deployment completes successfully.
2. **Test the Frontend**: Once deployed, test the frontend by visiting https://admin.dash628.com to ensure it can communicate with the backend API through the proxy.
3. **Consider HTTPS for Backend**: For a more robust solution, consider setting up HTTPS for the backend API.

## Conclusion

The proxy approach provides a robust solution for enabling communication between the frontend and backend, solving the mixed content issues and ensuring that the application functions correctly in both development and production environments.
