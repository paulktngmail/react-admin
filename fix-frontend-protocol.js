/**
 * Script to fix the frontend protocol to use HTTP instead of HTTPS
 * This script will modify the API endpoint URLs to use HTTP
 */

const fs = require('fs');
const path = require('path');

// Path to the direct-api.js file
const directApiPath = path.join(__dirname, 'src/direct-api.js');

// Check if the direct-api.js file exists
if (fs.existsSync(directApiPath)) {
  // Read the direct-api.js file
  console.log(`Reading direct-api.js file from ${directApiPath}...`);
  let directApi = fs.readFileSync(directApiPath, 'utf8');

  // Replace HTTPS with HTTP in the backend API URL
  const httpsRegex = /const BACKEND_API_URL = 'https:\/\/double9-env\.eba-wxarapmn\.us-east-2\.elasticbeanstalk\.com'/;
  const httpReplacement = "const BACKEND_API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'";

  if (directApi.match(httpsRegex)) {
    console.log('Found HTTPS protocol in direct-api.js');
    directApi = directApi.replace(httpsRegex, httpReplacement);
    
    // Write the modified direct-api.js file
    console.log('Writing modified direct-api.js file...');
    fs.writeFileSync(directApiPath, directApi);
    
    console.log('HTTP protocol updated successfully!');
  } else {
    console.log('Could not find HTTPS protocol in direct-api.js');
  }
} else {
  console.log('direct-api.js file does not exist. Creating it...');
  
  // Create the direct-api.js file
  const directApiContent = `// Direct API service for making requests directly to the backend
import axios from 'axios';

// Backend API URL - direct connection to the backend
const BACKEND_API_URL = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';

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

// API methods
export const getWhitelistedUsers = async () => {
  const response = await directApi.get('/api/pool/whitelist');
  return response.data;
};

export const getPresaleInfo = async () => {
  const response = await directApi.get('/api/pool/presale/info');
  return response.data;
};

export const getTokenInfo = async () => {
  const response = await directApi.get('/api/pool/token-info');
  return response.data;
};

export const getPresalePoolData = async () => {
  const response = await directApi.get('/api/pool/presale-pool-data');
  return response.data;
};

export default {
  getWhitelistedUsers,
  getPresaleInfo,
  getTokenInfo,
  getPresalePoolData
};
`;
  
  // Write the direct-api.js file
  fs.writeFileSync(directApiPath, directApiContent);
  console.log('direct-api.js file created successfully!');
}

// Path to the setupProxy.js file
const setupProxyPath = path.join(__dirname, 'src/setupProxy.js');

// Check if the setupProxy.js file exists
if (fs.existsSync(setupProxyPath)) {
  // Read the setupProxy.js file
  console.log(`Reading setupProxy.js file from ${setupProxyPath}...`);
  let setupProxy = fs.readFileSync(setupProxyPath, 'utf8');

  // Replace HTTPS with HTTP in the target URL
  const proxyHttpsRegex = /target: 'https:\/\/double9-env\.eba-wxarapmn\.us-east-2\.elasticbeanstalk\.com'/;
  const proxyHttpReplacement = "target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'";

  if (setupProxy.match(proxyHttpsRegex)) {
    console.log('Found HTTPS protocol in setupProxy.js');
    setupProxy = setupProxy.replace(proxyHttpsRegex, proxyHttpReplacement);
    
    // Write the modified setupProxy.js file
    console.log('Writing modified setupProxy.js file...');
    fs.writeFileSync(setupProxyPath, setupProxy);
    
    console.log('HTTP protocol updated successfully!');
  } else {
    console.log('Could not find HTTPS protocol in setupProxy.js');
  }
} else {
  console.log('setupProxy.js file does not exist. Creating it...');
  
  // Create the setupProxy.js file
  const setupProxyContent = `const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api': '/api' }
    })
  );
};
`;
  
  // Write the setupProxy.js file
  fs.writeFileSync(setupProxyPath, setupProxyContent);
  console.log('setupProxy.js file created successfully!');
}

// Path to the amplify.yml file
const amplifyYmlPath = path.join(__dirname, 'amplify.yml');

// Check if the amplify.yml file exists
if (fs.existsSync(amplifyYmlPath)) {
  // Read the amplify.yml file
  console.log(`Reading amplify.yml file from ${amplifyYmlPath}...`);
  let amplifyYml = fs.readFileSync(amplifyYmlPath, 'utf8');

  // Replace HTTPS with HTTP in the target URL
  const amplifyHttpsRegex = /target: 'https:\/\/double9-env\.eba-wxarapmn\.us-east-2\.elasticbeanstalk\.com'/;
  const amplifyHttpReplacement = "target: 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com'";

  if (amplifyYml.match(amplifyHttpsRegex)) {
    console.log('Found HTTPS protocol in amplify.yml');
    amplifyYml = amplifyYml.replace(amplifyHttpsRegex, amplifyHttpReplacement);
    
    // Write the modified amplify.yml file
    console.log('Writing modified amplify.yml file...');
    fs.writeFileSync(amplifyYmlPath, amplifyYml);
    
    console.log('HTTP protocol updated successfully!');
  } else {
    console.log('Could not find HTTPS protocol in amplify.yml');
  }
} else {
  console.log('amplify.yml file does not exist.');
}

// Path to the api.js file
const apiJsPath = path.join(__dirname, 'src/services/api.js');

// Check if the api.js file exists
if (fs.existsSync(apiJsPath)) {
  // Read the api.js file
  console.log(`Reading api.js file from ${apiJsPath}...`);
  let apiJs = fs.readFileSync(apiJsPath, 'utf8');

  // Replace HTTPS with HTTP in the API URL
  const apiHttpsRegex = /https:\/\/double9-env\.eba-wxarapmn\.us-east-2\.elasticbeanstalk\.com/g;
  const apiHttpReplacement = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';

  if (apiJs.match(apiHttpsRegex)) {
    console.log('Found HTTPS protocol in api.js');
    apiJs = apiJs.replace(apiHttpsRegex, apiHttpReplacement);
    
    // Write the modified api.js file
    console.log('Writing modified api.js file...');
    fs.writeFileSync(apiJsPath, apiJs);
    
    console.log('HTTP protocol updated successfully!');
  } else {
    console.log('Could not find HTTPS protocol in api.js');
  }
} else {
  console.log('api.js file does not exist.');
}

// Path to the solanaApi.js file
const solanaApiJsPath = path.join(__dirname, 'src/services/solanaApi.js');

// Check if the solanaApi.js file exists
if (fs.existsSync(solanaApiJsPath)) {
  // Read the solanaApi.js file
  console.log(`Reading solanaApi.js file from ${solanaApiJsPath}...`);
  let solanaApiJs = fs.readFileSync(solanaApiJsPath, 'utf8');

  // Replace HTTPS with HTTP in the API URL
  const solanaApiHttpsRegex = /https:\/\/double9-env\.eba-wxarapmn\.us-east-2\.elasticbeanstalk\.com/g;
  const solanaApiHttpReplacement = 'http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com';

  if (solanaApiJs.match(solanaApiHttpsRegex)) {
    console.log('Found HTTPS protocol in solanaApi.js');
    solanaApiJs = solanaApiJs.replace(solanaApiHttpsRegex, solanaApiHttpReplacement);
    
    // Write the modified solanaApi.js file
    console.log('Writing modified solanaApi.js file...');
    fs.writeFileSync(solanaApiJsPath, solanaApiJs);
    
    console.log('HTTP protocol updated successfully!');
  } else {
    console.log('Could not find HTTPS protocol in solanaApi.js');
  }
} else {
  console.log('solanaApi.js file does not exist.');
}

console.log('Protocol fix completed!');
