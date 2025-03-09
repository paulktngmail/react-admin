/**
 * Script to fix CORS issues in the backend server
 * This script will modify the server.js file to allow CORS from all origins
 */

const fs = require('fs');
const path = require('path');

// Path to the backend server.js file
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
  origin: '*', // Allow all origins
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

// Create a script to restart the backend server
const restartScriptPath = path.join(__dirname, '../../qwerty-app/restart-server.sh');
const restartScript = `#!/bin/bash

# Script to restart the backend server

echo "Restarting backend server..."
cd "$(dirname "$0")"
npm stop
npm start

echo "Backend server restarted!"
`;

console.log(`Creating restart script at ${restartScriptPath}...`);
fs.writeFileSync(restartScriptPath, restartScript);
fs.chmodSync(restartScriptPath, '755');

console.log('Restart script created successfully!');
console.log('To restart the backend server, run:');
console.log(`cd ../../qwerty-app && ./restart-server.sh`);
