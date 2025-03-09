/**
 * Script to configure HTTPS for the Elastic Beanstalk environment
 * This script will create or modify the necessary configuration files
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

// Path to the HTTPS configuration file
const httpsConfigPath = path.join(ebExtensionsPath, 'https-instance.config');

// HTTPS configuration content
const httpsConfig = `Resources:
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

  /etc/pki/tls/certs/server.crt:
    mode: "000400"
    owner: root
    group: root
    content: |
      -----BEGIN CERTIFICATE-----
      MIIDvzCCAqegAwIBAgIUBEQPzz8i5ygbJVxEcmJ8Y1+/xfIwDQYJKoZIhvcNAQEL
      BQAwbzELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMRIwEAYDVQQHDAlTYW4gRGll
      Z28xEjAQBgNVBAoMCURQTkVULmNvbTESMBAGA1UECwwJRGFzaDYyOC4wMRcwFQYD
      VQQDDA5kYXNoNjI4LmNvbSBDQTAeFw0yNTAzMDkxODI1MjZaFw0yNjAzMDkxODI1
      MjZaMG8xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJDQTESMBAGA1UEBwwJU2FuIERp
      ZWdvMRIwEAYDVQQKDAlEUE5FVC5jb20xEjAQBgNVBAsMCURhc2g2MjguMDEXMBUG
      A1UEAwwOZGFzaDYyOC5jb20gQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
      AoIBAQDFbxAZMbLGXMNmyQZC2QO3a0+VhjdCPv+8aaJQnNELuLXiVgQJZ8nHvO8F
      1TZLwGUmI5eX7ijS0xRPJKCmZTt8uVIJqW0eSVzwCX5U6bCGG6L5XlbQPRUEugJ1
      M8hRFudZy9xvDJQgLYpZKq8xYUzRwXcEFd9Q9h9+4aUUZGKzWEYg8oK9jKzGh5GZ
      +QlQxBJj/P6sFYFJ2hmLzH0NHZ6ItFRX9RuPvqzjBYCmqRJIjZ6TFRWZQKqU5ZRb
      Ky5QQ6XZnJrLLUwFmRrJFoU+JKrJr9JDHOvNBxBuZGrDNKD8xmHYTTMZZ5kJ4zrU
      g0QdX5uFZlzqKjvKzXpYcQQfAgMBAAGjUzBRMB0GA1UdDgQWBBQwLA9XJZRQnL8N
      QDOUxBKIBcnFBjAfBgNVHSMEGDAWgBQwLA9XJZRQnL8NQDOUxBKIBcnFBjAPBgNV
      HRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCyKgeMj0Zw0JfztORWKauR
      +1YrwLGOBAKpJvqExi9XUKjGEwWXTNHVKLk6y1jY9WXZhwZCvYkQKuKCIqQlgHEk
      JX7NxnZQjvYfTYOI5mYdFGlDSbGQnIXgqiMUjw8YzL3GjBOYPh6jKKBSTKIYLbJD
      +xpKKSY+zYaVHKmBiHJ8YvGkzNbnCVupvLe5Mj0Ew6G5JVwzm3S0waBjYwO3xl0V
      3mwYwZvMDQKEG9oa0SQMQs8xKY2zZD6UTWh/Y5Ew9Nj6OLGgJZh0UJFkJHLkGMCU
      gGYZIVRHpf4NeXdYJSYYYPbXVTKZ1EqH8S2Yf6ajNL6vISICOJM0Yyj3mQAx
      -----END CERTIFICATE-----

  /etc/pki/tls/certs/server.key:
    mode: "000400"
    owner: root
    group: root
    content: |
      -----BEGIN PRIVATE KEY-----
      MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFbxAZMbLGXMNm
      yQZC2QO3a0+VhjdCPv+8aaJQnNELuLXiVgQJZ8nHvO8F1TZLwGUmI5eX7ijS0xRP
      JKCmZTt8uVIJqW0eSVzwCX5U6bCGG6L5XlbQPRUEugJ1M8hRFudZy9xvDJQgLYpZ
      Kq8xYUzRwXcEFd9Q9h9+4aUUZGKzWEYg8oK9jKzGh5GZ+QlQxBJj/P6sFYFJ2hmL
      zH0NHZ6ItFRX9RuPvqzjBYCmqRJIjZ6TFRWZQKqU5ZRbKy5QQ6XZnJrLLUwFmRrJ
      FoU+JKrJr9JDHOvNBxBuZGrDNKD8xmHYTTMZZ5kJ4zrUg0QdX5uFZlzqKjvKzXpY
      cQQfAgMBAAECggEAJkgPXkxXCQ5XyOaOhSL0Mx/xgVTGgZFm7Z5Qqnv/LQtCzpeL
      D7t8SXQIl9nJ4zCKLHYrwOgIlP5OQZ6QCXQXtVgCJZk0xPOYgU5K5ZXwIjJr9VVg
      YyNAqgUNL9Aw/TQ1ZmRlPRdhKI8KLgFVL8VXMiV/M6UBzQkCGEfeLfGnKgEDwfyY
      FQlZ9fQoKOcxJdHMnXJbUZYaT6GKJpnLQZCZlDIFqDEBLbNWbfJCkHLJEDCYqtLW
      G8NKmVWh8T9SymWXjYgIlKLWE9XVQYLxnxjEe8sMYvUfWk+3PQnDkCaIeXNIYv8X
      Gg8ixCGDvUxP+YYhIHxQJcULHXCfQRHdW8zLAQKBgQDrKYtQRcqXrQNXpIHJmQWE
      cEVTiLYgB0ZKl6IWBFUzQUYkCgX6QVP8YcbGXRl7JZ4ntLWk7xCYPMwAqJ2VTzBi
      FgEwPXpemtr3umHzJz7QLfNJV0MP8X8qs9GWjnHn0qEPFDLZFKqm8XJpj0XhCMJ1
      5Fso7Psgr7GdIXSYFQKBgQDW0KQ5Q+2Oe/mxEGDGgwwXnGqA8iQlEUJJLkPKRD8O
      Ej8K9aNXcYmyRMQIuUWkh6SkpX6YoQDfMBveT8/iqFVW6SfVmVPqS9RNr6Fw8YOA
      Vj8XUWj5GCHKPrpUjAkBqMWKAQf1NSKK6tPJBIkTdBnQKaShz6wAMwKBgQCIXMQs
      xJnvQrsIRwGu0z6UBUqxYjHfHTYNXKSQCCW4xQqRiYwYUYZJ82+0nCOcmCIYEjZ8
      9QhXKYMBQKvOLjBbZELBCVMKDUdZKZ8/gDjQQjYw/gJZBFX6qJUZG1/KIQ1rXQYj
      Uj9yjIKLYQJQKGxfmCSkxQ==
      -----END PRIVATE KEY-----

container_commands:
  01_restart_nginx:
    command: "service nginx restart"
`;

// Write the HTTPS configuration file
console.log(`Writing HTTPS configuration file to ${httpsConfigPath}...`);
fs.writeFileSync(httpsConfigPath, httpsConfig);
console.log('HTTPS configuration file created successfully!');

// Path to the CORS configuration file
const corsConfigPath = path.join(ebExtensionsPath, 'cors-headers.config');

// CORS configuration content
const corsConfig = `files:
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

// Path to the server.js file
const serverJsPath = path.join(__dirname, '../../qwerty-app/server.js');

// Read the server.js file
console.log(`Reading server.js file from ${serverJsPath}...`);
let serverJs = fs.readFileSync(serverJsPath, 'utf8');

// Check if the file contains the CORS middleware
if (serverJs.includes('app.use(cors(')) {
  console.log('Found CORS middleware in server.js');
  
  // Replace the CORS middleware with a more permissive one
  const corsRegex = /app\.use\(cors\(\{[\s\S]*?\}\)\);/;
  const newCorsMiddleware = `app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // Allow all origins
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));`;
  
  serverJs = serverJs.replace(corsRegex, newCorsMiddleware);
  
  // Write the modified server.js file
  console.log('Writing modified server.js file...');
  fs.writeFileSync(serverJsPath, serverJs);
  
  console.log('CORS middleware updated successfully!');
} else {
  console.error('Could not find CORS middleware in server.js');
}

console.log('HTTPS and CORS configuration completed!');
