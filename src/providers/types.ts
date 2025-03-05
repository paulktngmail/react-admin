import { DataProvider } from 'react-admin';

export interface CrmDataProvider extends DataProvider {
  // Add any custom methods for your CRM data provider here
  getWalletBalance?: (walletAddress: string) => Promise<{ balance: number }>;
  getTokenInfo?: (tokenAddress: string) => Promise<any>;
  getTransactionHistory?: (walletAddress: string) => Promise<any[]>;
}
