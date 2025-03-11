/**
 * DPNET-10 Token Allocation Data
 * 
 * This file contains the token allocation data for the DPNET-10 token.
 * It is used by the backend server to provide accurate information about
 * token allocations to the frontend.
 */

const TOKEN_ALLOCATIONS = {
  // Total supply: 1.5 billion tokens
  totalSupply: 1500000000,
  
  // Allocation pools
  pools: [
    {
      name: "Rewards Pool",
      publicKey: "FdYsNj3jhGLcCzoMLA2KZdzUnM3UiwCYUNhMmmFaUDie",
      allocation: 615000000, // 615 million tokens
      percentage: 41, // 41% of total supply
      description: "Rewards for network participants and staking incentives"
    },
    {
      name: "Presale Pool",
      publicKey: "bJhdXiRhddYL2wXHjx3CEsGDRDCLYrW5ZxmG4xeSahX",
      allocation: 270000000, // 270 million tokens
      percentage: 18, // 18% of total supply
      description: "Tokens available for purchase during presale"
    },
    {
      name: "Liquidity Pools",
      publicKey: "3HUwa6YYKNdDgsU6nkkMWyBgT2BRtzmD1JpWSg77sa55",
      allocation: 270000000, // 270 million tokens
      percentage: 18, // 18% of total supply
      description: "Tokens allocated for providing liquidity on DEXs"
    },
    {
      name: "Marketing, Airdrops, and Community Building",
      publicKey: "99AufghSAA7Xj1grrhLgiZMvGXk6XAGLESf1PRJBpoko",
      allocation: 180000000, // 180 million tokens
      percentage: 12, // 12% of total supply
      description: "Tokens for marketing campaigns, airdrops, and community initiatives"
    },
    {
      name: "Team Allocation",
      publicKey: "2MAP3pASkcvdeKnsRS5JGFebYvvAG14ikShtPLbwg4sw",
      allocation: 120000000, // 120 million tokens
      percentage: 8, // 8% of total supply
      description: "Tokens allocated to the development team, vested over time"
    },
    {
      name: "Treasury Reserves",
      publicKey: "2BLLHiCHtrYDRUuh4VndsnNPpyJ3AHFp3oMAcxNX1kJj",
      allocation: 45000000, // 45 million tokens
      percentage: 3, // 3% of total supply
      description: "Tokens held in reserve for future development and contingencies"
    }
  ],
  
  // Token address
  tokenAddress: "F4qB6W5tUPHXRE1nfnw7MkLAu3YU7T12o6T52QKq5pQK"
};

module.exports = TOKEN_ALLOCATIONS;
