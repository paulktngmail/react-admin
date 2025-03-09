# Port Configuration Fix

## Issue
The WhitelistManagement component was showing "Using local data. API connection failed" because of port configuration mismatches between the frontend and backend services.

## Solution
We updated the port configurations to ensure proper communication between services:

1. Frontend API Service (`react-admin/src/services/api.js`):
   - Updated to use port 3002 instead of 3001
   - This ensures the frontend connects to the correct backend server port

2. Solana API Server (`react-admin/backend/solana-api.js`):
   - Updated to use port 3003 instead of 3002
   - This avoids port conflicts with the main server

3. Main Server (`react-admin/backend/server.js`):
   - Confirmed it's configured to use port 3002

## Running the Services

### Option 1: Using the Startup Script (Recommended)
We've created a startup script that handles starting all services with the correct port configurations:

```bash
cd /Users/paulktn/dpnet10/react-admin
./start-services.sh
```

This script will:
1. Kill any existing processes on ports 3001, 3002, and 3003
2. Start the main server on port 3002
3. Start the Solana API server on port 3003
4. Start the frontend application
5. Automatically clean up all processes when you exit the frontend

### Option 2: Manual Startup
If you prefer to start the services manually:

1. Start the main server:
   ```
   cd /Users/paulktn/dpnet10/react-admin/backend && PORT=3002 node server.js
   ```

2. Start the Solana API server:
   ```
   cd /Users/paulktn/dpnet10/react-admin/backend && PORT=3003 node solana-api.js
   ```

3. Start the frontend:
   ```
   cd /Users/paulktn/dpnet10/react-admin && npm start
   ```

## Verification
After making these changes, the WhitelistManagement component should connect to the backend API successfully and no longer show the "Using local data. API connection failed" error message.
