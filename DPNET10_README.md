# DPNET-10 Admin Dashboard

This admin dashboard provides comprehensive tools for managing the DPNET-10 token presale on the Solana blockchain, including presale overview, presale management, whitelist management, and testing tools.

## Features

- **Presale Overview**: View key presale metrics including total supply, tokens sold (for SOL and Fiat), transaction count, and real-time countdown timer. Extend presale time as needed.
- **Presale Management**: View token information, transfer tokens, mint new tokens, burn tokens, control presale parameters (pause/resume, start/end time, purchase limits), and withdraw unsold tokens.
- **Whitelist Management**: Add users to the whitelist individually or in bulk with email addresses, search by wallet address or email, multi-select and bulk remove users, and manage the whitelist.
- **Testing Tools**: Run comprehensive tests for the DPNET-10 token, DynamoDB integration, RDS integration, and Solana blockchain integration.
- **AWS Integration**: Store data in DynamoDB (for wallet addresses, transactions, and metadata) and RDS (for relational data).
- **Solana Integration**: Interact with the Solana blockchain for presale and token operations.

## Project Structure

```
react-admin/
├── public/                 # Static files
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.js       # Top navigation bar
│   │   └── Sidebar.js      # Side navigation menu
│   ├── pages/              # Page components
│   │   ├── Dashboard.js    # Main dashboard page
│   │   ├── PresaleOverview.js    # Presale overview page
│   │   ├── PresaleManagement.js  # Presale management page
│   │   ├── WhitelistManagement.js # Whitelist management page
│   │   └── TestingTools.js # Testing tools page
│   ├── services/           # API services
│   │   └── api.js          # API client for backend communication
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles
├── scripts/                # Testing and integration scripts
│   ├── token-specific-tests.js    # Tests for DPNET-10 token
│   ├── dynamodb-integration.js    # DynamoDB integration
│   └── rds-integration.js         # RDS integration
└── package.json            # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- AWS account with DynamoDB and RDS access
- Solana CLI tools

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/paulktngmail/react-admin.git
   cd react-admin
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following environment variables:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
   REACT_APP_TOKEN_ADDRESS=your_token_address
   ```

4. Start the development server:
   ```
   npm start
   ```

## Testing

### Token Tests

Run comprehensive tests for the DPNET-10 token:

```
node scripts/token-specific-tests.js
```

### DynamoDB Integration Tests

Test the DynamoDB integration:

```
node scripts/dynamodb-integration.js
```

### RDS Integration Tests

Test the RDS integration:

```
node scripts/rds-integration.js
```

## AWS Integration

### DynamoDB

The application uses DynamoDB for storing:
- Wallet addresses and balances
- Transaction history
- Token metadata

### RDS

The application uses RDS for storing relational data:
- User information
- Presale events
- Token information
- Relationships between users, presales, and tokens

## Solana Integration

The application integrates with the Solana blockchain for:
- Fetching presale and token information
- Managing presale parameters (start/end time, purchase limits)
- Pausing and resuming presale
- Extending presale time
- Transferring tokens
- Minting new tokens
- Burning tokens
- Withdrawing unsold tokens
- Managing whitelist with email addresses

## Deployment

The application can be deployed using AWS Amplify:

1. Set up an Amplify project:
   ```
   amplify init
   ```

2. Add hosting:
   ```
   amplify add hosting
   ```

3. Deploy:
   ```
   amplify publish
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License.
