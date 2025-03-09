# React Admin Dashboard - Admin Tools

This utility script provides a comprehensive set of tools for managing the React Admin Dashboard project, specifically designed for the DPNET-10 token administration.

## Features

- **Development Environment Management**: Start backend and frontend servers
- **Build Tools**: Build the project for production
- **Testing Utilities**: Run various test suites
- **Token Operations**: Check balances, create accounts, get token info
- **Whitelist Management**: List, add, and remove addresses from the whitelist
- **Presale Management**: Get presale information
- **GitHub Deployment**: Push changes to GitHub

## Installation

The script is already included in the project. Make sure it's executable:

```bash
chmod +x scripts/admin-tools.js
```

## Usage

### Interactive Mode

Run the script without arguments to enter interactive mode:

```bash
node scripts/admin-tools.js
```

This will display a menu-driven interface where you can select various operations.

### Command Line Mode

You can also run specific commands directly:

```bash
node scripts/admin-tools.js [command] [arguments]
```

Available commands:

- `start-backend`: Start the backend server
- `start-frontend`: Start the frontend development server
- `start`: Start both backend and frontend servers
- `build`: Build the project for production
- `test [type]`: Run tests (all, token, dynamodb, rds)
- `check-balances`: Check token balances
- `create-accounts`: Create token accounts
- `test-connection`: Test live connection
- `whitelist [action] [address] [allocation]`: Manage whitelist (list, add, remove)
- `presale-info`: Get presale information
- `token-info`: Get token information
- `deploy`: Deploy to GitHub
- `help`: Show help message

## Examples

Start both servers:
```bash
node scripts/admin-tools.js start
```

Check token balances:
```bash
node scripts/admin-tools.js check-balances
```

Add an address to the whitelist:
```bash
node scripts/admin-tools.js whitelist add FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie 1000
```

## Requirements

- Node.js 14+
- npm or yarn
- Access to the backend server (for API operations)

## Troubleshooting

If you encounter any issues:

1. Make sure both backend and frontend dependencies are installed
2. Check that the backend server is running for API operations
3. Verify that the .env file is properly configured in the backend directory
