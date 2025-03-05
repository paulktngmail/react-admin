# DPNET-10 Admin Dashboard

This admin dashboard provides comprehensive tools for managing the DPNET-10 token on the Solana blockchain. It includes features for token management, whitelist management, and testing tools with integrations for AWS DynamoDB and RDS.

## Features

### Token Management
- View token information (supply, holders, transactions)
- Transfer tokens between wallets
- Mint new tokens
- Burn tokens

### Whitelist Management
- Add individual users to whitelist
- Bulk add users to whitelist
- Manage existing whitelist entries

### Testing Tools
- Token-specific tests for DPNET-10 on Solana blockchain
- DynamoDB integration tests for storing wallet addresses, transactions, and metadata
- RDS integration tests for relational data storage
- Solana integration tests

## Technical Stack

- **Frontend**: React, Material UI, React Router
- **Blockchain**: Solana, SPL Token
- **Database**: 
  - AWS DynamoDB (NoSQL) for wallet addresses, transactions, and metadata
  - AWS RDS (MySQL) for relational data storage
- **Testing**: Jest, Cypress

## Project Structure

```
react-admin/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Main application pages
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── scripts/
│   ├── token-specific-tests.js       # Solana token testing
│   ├── dynamodb-integration.js       # DynamoDB integration
│   └── rds-integration.js            # RDS integration
└── public/               # Static assets
```

## Integration Details

### Solana Integration

The dashboard connects to the Solana blockchain to interact with the DPNET-10 token. It uses the `@solana/web3.js` and `@solana/spl-token` libraries to:

- Fetch token metadata
- Check token supply and circulation
- Execute token transfers
- Mint new tokens
- Burn tokens

### DynamoDB Integration

DynamoDB is used to store:

- Wallet addresses and balances
- Transaction history
- Token metadata

The integration provides functions for:
- Creating, reading, updating, and deleting wallet information
- Recording and querying transactions
- Storing and retrieving token metadata

### RDS Integration

RDS (MySQL) is used to store relational data such as:

- User accounts and permissions
- Presale event information
- Token configuration data

The integration includes:
- Database schema creation
- CRUD operations for users, presales, and token info
- Join queries for related data

## Testing Tools

The dashboard includes comprehensive testing tools for:

1. **Token Testing**:
   - Token metadata validation
   - Supply verification
   - Transfer functionality
   - Mint functionality
   - Burn functionality

2. **DynamoDB Testing**:
   - Connection testing
   - Wallet table operations
   - Transaction table operations
   - Metadata table operations
   - Query performance

3. **RDS Testing**:
   - Connection testing
   - User table operations
   - Presale table operations
   - Token info table operations
   - Join query operations

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Solana CLI (for token operations)
- AWS account with DynamoDB and RDS access

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

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   # Solana
   REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
   REACT_APP_DPNET_TOKEN_ADDRESS=your_token_address

   # AWS
   REACT_APP_AWS_REGION=your_aws_region
   REACT_APP_AWS_ACCESS_KEY_ID=your_access_key
   REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key

   # DynamoDB
   REACT_APP_DYNAMODB_WALLETS_TABLE=dpnet10-wallets
   REACT_APP_DYNAMODB_TRANSACTIONS_TABLE=dpnet10-transactions
   REACT_APP_DYNAMODB_METADATA_TABLE=dpnet10-metadata

   # RDS
   REACT_APP_RDS_HOST=your_rds_host
   REACT_APP_RDS_PORT=3306
   REACT_APP_RDS_USERNAME=your_username
   REACT_APP_RDS_PASSWORD=your_password
   REACT_APP_RDS_DATABASE=dpnet10
   ```

4. Start the development server:
   ```
   npm start
   ```

### Running Tests

To run the token-specific tests:
```
node scripts/token-specific-tests.js
```

To run the DynamoDB integration tests:
```
node scripts/dynamodb-integration.js
```

To run the RDS integration tests:
```
node scripts/rds-integration.js
```

## Deployment

The application can be deployed using AWS Amplify:

1. Configure the Amplify settings in `amplify.yml`
2. Push the code to your GitHub repository
3. Connect the repository to AWS Amplify
4. Configure the build settings and environment variables
5. Deploy the application

## License

This project is licensed under the MIT License.
