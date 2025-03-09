#!/usr/bin/env node

/**
 * React Admin Dashboard - Admin Tools Script
 * 
 * This script provides utilities for managing the React Admin Dashboard project,
 * including starting servers, running tests, and performing common operations.
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');

// Configuration
const config = {
  backendPort: process.env.PORT || 3001,
  frontendPort: 3000,
  backendDir: path.join(__dirname, '../backend'),
  frontendDir: path.join(__dirname, '..'),
  apiBaseUrl: `http://localhost:${process.env.PORT || 3001}/api`
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Helper function to execute a command and return a promise
 */
function executeCommand(command, args, cwd, silent = false) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, {
      cwd,
      stdio: silent ? 'ignore' : 'inherit',
      shell: true
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Helper function to execute a command and get the output
 */
function executeCommandWithOutput(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Start the backend server
 */
async function startBackend() {
  console.log('Starting backend server...');
  
  // Check if .env file exists, if not create from template
  const envPath = path.join(config.backendDir, '.env');
  const envExamplePath = path.join(config.backendDir, '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('Creating .env file from .env.example');
    fs.copyFileSync(envExamplePath, envPath);
  }
  
  // Install dependencies if needed
  if (!fs.existsSync(path.join(config.backendDir, 'node_modules'))) {
    console.log('Installing backend dependencies...');
    await executeCommand('npm', ['install'], config.backendDir);
  }
  
  // Start the server
  const serverProcess = spawn('node', ['server.js'], {
    cwd: config.backendDir,
    stdio: 'inherit',
    detached: true
  });
  
  console.log(`Backend server started on port ${config.backendPort}`);
  return serverProcess;
}

/**
 * Start the frontend development server
 */
async function startFrontend() {
  console.log('Starting frontend development server...');
  
  // Install dependencies if needed
  if (!fs.existsSync(path.join(config.frontendDir, 'node_modules'))) {
    console.log('Installing frontend dependencies...');
    await executeCommand('npm', ['install'], config.frontendDir);
  }
  
  // Start the development server
  const frontendProcess = spawn('npm', ['start'], {
    cwd: config.frontendDir,
    stdio: 'inherit',
    detached: true
  });
  
  console.log(`Frontend development server started on port ${config.frontendPort}`);
  return frontendProcess;
}

/**
 * Build the project for production
 */
async function buildProject() {
  console.log('Building project for production...');
  
  // Build the frontend
  console.log('Building frontend...');
  await executeCommand('npm', ['run', 'build'], config.frontendDir);
  
  console.log('Project built successfully!');
}

/**
 * Run tests
 */
async function runTests(testType) {
  console.log(`Running ${testType} tests...`);
  
  switch (testType) {
    case 'all':
      await executeCommand('npm', ['test'], config.frontendDir);
      break;
    case 'token':
      await executeCommand('node', ['scripts/token-specific-tests.js'], config.frontendDir);
      break;
    case 'dynamodb':
      await executeCommand('node', ['scripts/dynamodb-integration.js'], config.frontendDir);
      break;
    case 'rds':
      await executeCommand('node', ['scripts/rds-integration.js'], config.frontendDir);
      break;
    default:
      console.log(`Unknown test type: ${testType}`);
      break;
  }
}

/**
 * Check token balances
 */
async function checkTokenBalances() {
  console.log('Checking token balances...');
  
  try {
    await executeCommand('node', ['check-token-balances.js'], config.backendDir);
  } catch (error) {
    console.error('Error checking token balances:', error.message);
  }
}

/**
 * Create token accounts
 */
async function createTokenAccounts() {
  console.log('Creating token accounts...');
  
  try {
    await executeCommand('node', ['create-token-accounts.js'], config.backendDir);
  } catch (error) {
    console.error('Error creating token accounts:', error.message);
  }
}

/**
 * Test live connection
 */
async function testLiveConnection() {
  console.log('Testing live connection...');
  
  try {
    await executeCommand('node', ['test-live-connection.js'], config.backendDir);
  } catch (error) {
    console.error('Error testing live connection:', error.message);
  }
}

/**
 * Manage whitelist
 */
async function manageWhitelist(action, address, allocation) {
  console.log(`Managing whitelist: ${action}`);
  
  try {
    const apiUrl = `${config.apiBaseUrl}/whitelist`;
    
    switch (action) {
      case 'list':
        const response = await axios.get(apiUrl);
        console.log('Whitelisted addresses:');
        response.data.forEach(entry => {
          console.log(`- ${entry.walletAddress} (Allocation: ${entry.allocation})`);
        });
        break;
      
      case 'add':
        if (!address) {
          console.error('Address is required for adding to whitelist');
          return;
        }
        
        await axios.post(`${apiUrl}/add`, {
          address,
          allocation: allocation || 0
        });
        console.log(`Address ${address} added to whitelist`);
        break;
      
      case 'remove':
        if (!address) {
          console.error('Address is required for removing from whitelist');
          return;
        }
        
        await axios.delete(`${apiUrl}/remove`, {
          data: { address }
        });
        console.log(`Address ${address} removed from whitelist`);
        break;
      
      default:
        console.log(`Unknown whitelist action: ${action}`);
        break;
    }
  } catch (error) {
    console.error('Error managing whitelist:', error.response?.data?.error || error.message);
  }
}

/**
 * Get presale info
 */
async function getPresaleInfo() {
  console.log('Getting presale info...');
  
  try {
    const response = await axios.get(`${config.apiBaseUrl}/presale/info`);
    console.log('Presale Info:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error getting presale info:', error.response?.data?.error || error.message);
  }
}

/**
 * Get token info
 */
async function getTokenInfo() {
  console.log('Getting token info...');
  
  try {
    const response = await axios.get(`${config.apiBaseUrl}/token/info`);
    console.log('Token Info:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error getting token info:', error.response?.data?.error || error.message);
  }
}

/**
 * Deploy to GitHub
 */
async function deployToGitHub() {
  console.log('Deploying to GitHub...');
  
  try {
    // Check if git is initialized
    try {
      await executeCommandWithOutput('git status', config.frontendDir);
    } catch (error) {
      console.log('Initializing git repository...');
      await executeCommand('git', ['init'], config.frontendDir);
    }
    
    // Check if remote exists
    try {
      const remotes = await executeCommandWithOutput('git remote', config.frontendDir);
      if (!remotes.includes('origin')) {
        const repoUrl = await askQuestion('Enter GitHub repository URL: ');
        await executeCommand('git', ['remote', 'add', 'origin', repoUrl], config.frontendDir);
      }
    } catch (error) {
      console.error('Error checking git remotes:', error.message);
      return;
    }
    
    // Add all files
    await executeCommand('git', ['add', '.'], config.frontendDir);
    
    // Commit changes
    const commitMessage = await askQuestion('Enter commit message: ');
    await executeCommand('git', ['commit', '-m', commitMessage], config.frontendDir);
    
    // Push to GitHub
    const branch = await executeCommandWithOutput('git rev-parse --abbrev-ref HEAD', config.frontendDir) || 'main';
    await executeCommand('git', ['push', 'origin', branch], config.frontendDir);
    
    console.log('Successfully deployed to GitHub!');
  } catch (error) {
    console.error('Error deploying to GitHub:', error.message);
  }
}

/**
 * Helper function to ask a question and get user input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Display the main menu and handle user input
 */
async function showMainMenu() {
  console.log('\n=== React Admin Dashboard - Admin Tools ===');
  console.log('1. Start Development Environment');
  console.log('2. Build for Production');
  console.log('3. Run Tests');
  console.log('4. Token Operations');
  console.log('5. Whitelist Management');
  console.log('6. Presale Management');
  console.log('7. Deploy to GitHub');
  console.log('0. Exit');
  
  const choice = await askQuestion('\nEnter your choice: ');
  
  switch (choice) {
    case '1':
      await handleDevelopmentMenu();
      break;
    
    case '2':
      await buildProject();
      await showMainMenu();
      break;
    
    case '3':
      await handleTestsMenu();
      break;
    
    case '4':
      await handleTokenMenu();
      break;
    
    case '5':
      await handleWhitelistMenu();
      break;
    
    case '6':
      await handlePresaleMenu();
      break;
    
    case '7':
      await deployToGitHub();
      await showMainMenu();
      break;
    
    case '0':
      console.log('Exiting...');
      rl.close();
      process.exit(0);
      break;
    
    default:
      console.log('Invalid choice. Please try again.');
      await showMainMenu();
      break;
  }
}

/**
 * Handle the development environment menu
 */
async function handleDevelopmentMenu() {
  console.log('\n=== Development Environment ===');
  console.log('1. Start Backend Server');
  console.log('2. Start Frontend Server');
  console.log('3. Start Both Servers');
  console.log('4. Test Live Connection');
  console.log('0. Back to Main Menu');
  
  const choice = await askQuestion('\nEnter your choice: ');
  
  switch (choice) {
    case '1':
      await startBackend();
      await handleDevelopmentMenu();
      break;
    
    case '2':
      await startFrontend();
      await handleDevelopmentMenu();
      break;
    
    case '3':
      await startBackend();
      await startFrontend();
      await handleDevelopmentMenu();
      break;
    
    case '4':
      await testLiveConnection();
      await handleDevelopmentMenu();
      break;
    
    case '0':
      await showMainMenu();
      break;
    
    default:
      console.log('Invalid choice. Please try again.');
      await handleDevelopmentMenu();
      break;
  }
}

/**
 * Handle the tests menu
 */
async function handleTestsMenu() {
  console.log('\n=== Tests ===');
  console.log('1. Run All Tests');
  console.log('2. Run Token Tests');
  console.log('3. Run DynamoDB Tests');
  console.log('4. Run RDS Tests');
  console.log('0. Back to Main Menu');
  
  const choice = await askQuestion('\nEnter your choice: ');
  
  switch (choice) {
    case '1':
      await runTests('all');
      await handleTestsMenu();
      break;
    
    case '2':
      await runTests('token');
      await handleTestsMenu();
      break;
    
    case '3':
      await runTests('dynamodb');
      await handleTestsMenu();
      break;
    
    case '4':
      await runTests('rds');
      await handleTestsMenu();
      break;
    
    case '0':
      await showMainMenu();
      break;
    
    default:
      console.log('Invalid choice. Please try again.');
      await handleTestsMenu();
      break;
  }
}

/**
 * Handle the token operations menu
 */
async function handleTokenMenu() {
  console.log('\n=== Token Operations ===');
  console.log('1. Check Token Balances');
  console.log('2. Create Token Accounts');
  console.log('3. Get Token Info');
  console.log('0. Back to Main Menu');
  
  const choice = await askQuestion('\nEnter your choice: ');
  
  switch (choice) {
    case '1':
      await checkTokenBalances();
      await handleTokenMenu();
      break;
    
    case '2':
      await createTokenAccounts();
      await handleTokenMenu();
      break;
    
    case '3':
      await getTokenInfo();
      await handleTokenMenu();
      break;
    
    case '0':
      await showMainMenu();
      break;
    
    default:
      console.log('Invalid choice. Please try again.');
      await handleTokenMenu();
      break;
  }
}

/**
 * Handle the whitelist management menu
 */
async function handleWhitelistMenu() {
  console.log('\n=== Whitelist Management ===');
  console.log('1. List Whitelisted Addresses');
  console.log('2. Add Address to Whitelist');
  console.log('3. Remove Address from Whitelist');
  console.log('0. Back to Main Menu');
  
  const choice = await askQuestion('\nEnter your choice: ');
  
  switch (choice) {
    case '1':
      await manageWhitelist('list');
      await handleWhitelistMenu();
      break;
    
    case '2':
      const addAddress = await askQuestion('Enter address to add: ');
      const allocation = await askQuestion('Enter allocation (optional): ');
      await manageWhitelist('add', addAddress, allocation ? parseInt(allocation) : undefined);
      await handleWhitelistMenu();
      break;
    
    case '3':
      const removeAddress = await askQuestion('Enter address to remove: ');
      await manageWhitelist('remove', removeAddress);
      await handleWhitelistMenu();
      break;
    
    case '0':
      await showMainMenu();
      break;
    
    default:
      console.log('Invalid choice. Please try again.');
      await handleWhitelistMenu();
      break;
  }
}

/**
 * Handle the presale management menu
 */
async function handlePresaleMenu() {
  console.log('\n=== Presale Management ===');
  console.log('1. Get Presale Info');
  console.log('0. Back to Main Menu');
  
  const choice = await askQuestion('\nEnter your choice: ');
  
  switch (choice) {
    case '1':
      await getPresaleInfo();
      await handlePresaleMenu();
      break;
    
    case '0':
      await showMainMenu();
      break;
    
    default:
      console.log('Invalid choice. Please try again.');
      await handlePresaleMenu();
      break;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('React Admin Dashboard - Admin Tools');
  
  // Check if running with arguments
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Handle command line arguments
    const command = args[0];
    
    switch (command) {
      case 'start-backend':
        await startBackend();
        break;
      
      case 'start-frontend':
        await startFrontend();
        break;
      
      case 'start':
        await startBackend();
        await startFrontend();
        break;
      
      case 'build':
        await buildProject();
        break;
      
      case 'test':
        const testType = args[1] || 'all';
        await runTests(testType);
        break;
      
      case 'check-balances':
        await checkTokenBalances();
        break;
      
      case 'create-accounts':
        await createTokenAccounts();
        break;
      
      case 'test-connection':
        await testLiveConnection();
        break;
      
      case 'whitelist':
        const whitelistAction = args[1] || 'list';
        const address = args[2];
        const allocation = args[3] ? parseInt(args[3]) : undefined;
        await manageWhitelist(whitelistAction, address, allocation);
        break;
      
      case 'presale-info':
        await getPresaleInfo();
        break;
      
      case 'token-info':
        await getTokenInfo();
        break;
      
      case 'deploy':
        await deployToGitHub();
        break;
      
      case 'help':
      default:
        console.log('Usage: node admin-tools.js [command]');
        console.log('Commands:');
        console.log('  start-backend       Start the backend server');
        console.log('  start-frontend      Start the frontend development server');
        console.log('  start               Start both backend and frontend servers');
        console.log('  build               Build the project for production');
        console.log('  test [type]         Run tests (all, token, dynamodb, rds)');
        console.log('  check-balances      Check token balances');
        console.log('  create-accounts     Create token accounts');
        console.log('  test-connection     Test live connection');
        console.log('  whitelist [action] [address] [allocation]');
        console.log('                      Manage whitelist (list, add, remove)');
        console.log('  presale-info        Get presale information');
        console.log('  token-info          Get token information');
        console.log('  deploy              Deploy to GitHub');
        console.log('  help                Show this help message');
        break;
    }
    
    // Exit after handling command line arguments
    process.exit(0);
  } else {
    // Show interactive menu
    await showMainMenu();
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
