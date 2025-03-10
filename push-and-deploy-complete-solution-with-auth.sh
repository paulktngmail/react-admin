#!/bin/bash

# Push and Deploy Complete Solution with Authentication
# This script pushes the frontend changes to GitHub (with authentication) and deploys the backend to AWS Elastic Beanstalk

echo "===== Push and Deploy Complete Solution (with Authentication) ====="
echo "This script will:"
echo "1. Push the frontend changes to GitHub (with authentication)"
echo "2. Deploy the backend to AWS Elastic Beanstalk"
echo "=================================================="

# Part 1: Push frontend changes to GitHub with authentication
echo "Part 1: Pushing frontend changes to GitHub (with authentication)..."
echo "------------------------------------------------"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install it first."
    exit 1
fi

# Ensure we're in the correct directory for frontend
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Prompt for GitHub credentials
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -s -p "Enter your GitHub personal access token: " GITHUB_TOKEN
echo ""

# Check if this is a git repository
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git remote add origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/paulktngmail/react-admin.git
else
    # Check if the remote exists
    if ! git remote | grep -q "origin"; then
        echo "Adding remote origin..."
        git remote add origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/paulktngmail/react-admin.git
    else
        # Update the remote URL to include authentication
        echo "Updating remote origin with authentication..."
        git remote set-url origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/paulktngmail/react-admin.git
    fi
fi

# Add all changes
echo "Adding changes..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Fix API communication between frontend and backend

- Update frontend to use relative URLs instead of absolute URLs
- Create unified API service with proper error handling
- Update setupProxy.js with better error handling
- Update amplify.yml to allow HTTPS to HTTP proxying
- Update _redirects file for proper API request handling
- Add comprehensive documentation"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend push successful!"
    echo "Your API communication fix is now on GitHub at: https://github.com/paulktngmail/react-admin"
else
    echo "❌ Frontend push failed. Please check the error message above."
    exit 1
fi

echo "Frontend changes have been pushed to GitHub."
echo "AWS Amplify should automatically detect the changes and start a new deployment."
echo ""

# Part 2: Deploy backend to AWS Elastic Beanstalk
echo "Part 2: Deploying backend to AWS Elastic Beanstalk..."
echo "------------------------------------------------"

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
  echo "✅ Backend deployment successful!"
else
  echo "❌ Backend deployment failed. Please check the logs for more information."
  exit 1
fi

# Return to the original directory
cd - || { echo "Error: Failed to return to the original directory"; exit 1; }

echo "=================================================="
echo "✅ Deployment complete!"
echo ""
echo "Frontend changes have been pushed to GitHub."
echo "AWS Amplify should automatically detect the changes and start a new deployment."
echo ""
echo "The updated backend has been deployed to AWS Elastic Beanstalk."
echo ""
echo "To verify the deployments:"
echo "1. Frontend: Visit https://admin.dash628.com"
echo "2. Backend: Test the API by visiting http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/pool/whitelist"
echo ""
echo "If you encounter any issues, you can run the test scripts to debug the problem:"
echo "- node test-backend-simple.js"
echo "- node test-deployed-frontend-api.js"
echo "=================================================="
