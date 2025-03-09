/**
 * Script to fix HTTPS protocol issues in the frontend
 * This script will modify the direct-api.js file to use HTTPS instead of HTTP
 */

const fs = require('fs');
const path = require('path');

// Path to the direct-api.js file
const directApiPath = path.join(__dirname, 'src/direct-api.js');

// Read the direct-api.js file
console.log(`Reading direct-api.js file from ${directApiPath}...`);
let directApi = fs.readFileSync(directApiPath, 'utf8');

// Replace HTTP with HTTPS in the backend API URL
const httpRegex = /const BACKEND_API_URL = 'http:\/\/double9-env\.eba-wxarapmn\.us-east-2\.elasticbeanstalk\.com'/;
const httpsReplacement = "const BACKEND_API_URL = 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'";

if (directApi.match(httpRegex)) {
  console.log('Found HTTP protocol in direct-api.js');
  directApi = directApi.replace(httpRegex, httpsReplacement);
  
  // Write the modified direct-api.js file
  console.log('Writing modified direct-api.js file...');
  fs.writeFileSync(directApiPath, directApi);
  
  console.log('HTTPS protocol updated successfully!');
} else {
  console.log('Could not find HTTP protocol in direct-api.js');
}

// Path to the setupProxy.js file
const setupProxyPath = path.join(__dirname, 'src/setupProxy.js');

// Read the setupProxy.js file
console.log(`Reading setupProxy.js file from ${setupProxyPath}...`);
let setupProxy = fs.readFileSync(setupProxyPath, 'utf8');

// Replace HTTP with HTTPS in the target URL
const proxyHttpRegex = /target: 'http:\/\/double9-env\.eba-wxarapmn\.us-east-2\.elasticbeanstalk\.com'/;
const proxyHttpsReplacement = "target: 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'";

if (setupProxy.match(proxyHttpRegex)) {
  console.log('Found HTTP protocol in setupProxy.js');
  setupProxy = setupProxy.replace(proxyHttpRegex, proxyHttpsReplacement);
  
  // Write the modified setupProxy.js file
  console.log('Writing modified setupProxy.js file...');
  fs.writeFileSync(setupProxyPath, setupProxy);
  
  console.log('HTTPS protocol updated successfully!');
} else {
  console.log('Could not find HTTP protocol in setupProxy.js');
}

// Path to the amplify.yml file
const amplifyYmlPath = path.join(__dirname, 'amplify.yml');

// Read the amplify.yml file
console.log(`Reading amplify.yml file from ${amplifyYmlPath}...`);
let amplifyYml = fs.readFileSync(amplifyYmlPath, 'utf8');

// Replace HTTP with HTTPS in the target URL
const amplifyHttpRegex = /target: 'http:\/\/double9-env\.eba-wxarapmn\.us-east-2\.elasticbeanstalk\.com'/;
const amplifyHttpsReplacement = "target: 'https://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'";

if (amplifyYml.match(amplifyHttpRegex)) {
  console.log('Found HTTP protocol in amplify.yml');
  amplifyYml = amplifyYml.replace(amplifyHttpRegex, amplifyHttpsReplacement);
  
  // Write the modified amplify.yml file
  console.log('Writing modified amplify.yml file...');
  fs.writeFileSync(amplifyYmlPath, amplifyYml);
  
  console.log('HTTPS protocol updated successfully!');
} else {
  console.log('Could not find HTTP protocol in amplify.yml');
}

console.log('Protocol fix completed!');
