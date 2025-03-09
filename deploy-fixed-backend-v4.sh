#!/bin/bash

# Script to deploy the fixed backend to AWS Elastic Beanstalk
# This script will deploy the backend with a minimal approach

echo "Deploying fixed backend to AWS Elastic Beanstalk (v4)..."
echo "===================================================="

# Step 1: Configure CORS for the backend
echo "Step 1: Configuring CORS for the backend..."
cd ../../qwerty-app || { echo "Error: qwerty-app directory not found"; exit 1; }

# Update the CORS configuration in server.js
echo "Updating CORS configuration in server.js..."
cat > cors-fix.js << 'EOL'
const fs = require('fs');
const path = require('path');

// Path to the server.js file
const serverJsPath = path.join(__dirname, 'server.js');

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
EOL

# Run the CORS fix script
node cors-fix.js

# Step 2: Update the package.json file
echo "Step 2: Updating package.json file..."
cat > package-fix.js << 'EOL'
const fs = require('fs');
const path = require('path');

// Path to the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');

// Read the package.json file
console.log(`Reading package.json file from ${packageJsonPath}...`);
let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update the engines field
packageJson.engines = {
  "node": "18.x"
};

// Write the modified package.json file
console.log('Writing modified package.json file...');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('package.json updated successfully!');
EOL

# Run the package.json fix script
node package-fix.js

# Step 3: Remove all .ebextensions files
echo "Step 3: Removing all .ebextensions files..."
rm -rf .ebextensions
mkdir -p .ebextensions

# Step 4: Create a simple Procfile
echo "Step 4: Creating Procfile..."
echo "web: npm start" > Procfile

# Step 5: Deploy to Elastic Beanstalk
echo "Step 5: Deploying to Elastic Beanstalk..."

# Check if the .elasticbeanstalk directory exists
if [ ! -d ".elasticbeanstalk" ]; then
  echo "Error: .elasticbeanstalk directory not found. Make sure you're in the correct directory."
  exit 1
fi

# Check if the EB CLI is installed
if ! command -v eb &> /dev/null; then
  echo "Error: EB CLI is not installed. Please install it first."
  exit 1
fi

# Deploy to Elastic Beanstalk
echo "Deploying to Elastic Beanstalk..."
eb deploy

# Check if the deployment was successful
if [ $? -eq 0 ]; then
  echo "Backend deployment successful!"
else
  echo "Backend deployment failed. Please check the logs for more information."
  exit 1
fi

# Return to the original directory
cd - || { echo "Error: Failed to return to the original directory"; exit 1; }

echo "Deployment complete!"
echo "The updated backend has been deployed to AWS Elastic Beanstalk."
echo ""
echo "To verify the deployment:"
echo "1. Go to the AWS Elastic Beanstalk Console"
echo "2. Check the deployment status"
echo "3. Once deployed, test the backend API by visiting https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/pool/whitelist"
echo ""
echo "If you encounter any issues, you can run the test scripts to debug the problem:"
echo "- node test-backend-api-v2.js"
echo "- node test-api-communication.js"
