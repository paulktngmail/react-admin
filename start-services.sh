#!/bin/bash

# Start services script for DPNET-10 Admin Dashboard
# This script starts all the necessary services with the correct port configurations

echo "Starting DPNET-10 Admin Dashboard Services..."

# Kill any existing processes on the required ports
echo "Cleaning up any existing processes on ports 3001, 3002, and 3003..."
sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3002) 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:3003) 2>/dev/null || true

# Start the main server on port 3002
echo "Starting main server on port 3002..."
cd "$(dirname "$0")/backend" && PORT=3002 node server.js &
MAIN_SERVER_PID=$!
echo "Main server started with PID: $MAIN_SERVER_PID"

# Wait a moment for the server to start
sleep 2

# Start the Solana API server on port 3003
echo "Starting Solana API server on port 3003..."
cd "$(dirname "$0")/backend" && PORT=3003 node solana-api.js &
SOLANA_API_PID=$!
echo "Solana API server started with PID: $SOLANA_API_PID"

# Wait a moment for the server to start
sleep 2

# Start the frontend
echo "Starting frontend..."
cd "$(dirname "$0")" && npm start

# This script will keep running until the frontend is closed
# When the frontend is closed, we'll also stop the backend servers
trap "kill $MAIN_SERVER_PID $SOLANA_API_PID; exit" SIGINT SIGTERM EXIT

# Wait for all background processes to finish
wait
