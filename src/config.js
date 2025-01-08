// Chains for EVM Wallets
const evmWalletChains = {
  mainnet: {
    chainId: 397,
    name: "Near Mainnet",
    explorer: "https://eth-explorer.near.org",
    rpc: "https://eth-rpc.mainnet.near.org",
  },
  testnet: {
    chainId: 398,
    name: "Near Testnet",
    explorer: "https://eth-explorer-testnet.near.org",
    rpc: "https://eth-rpc.testnet.near.org",
  },
};

export const NETWORK_ID = "mainnet";
export const EVMWalletChain = evmWalletChains[NETWORK_ID];

export const NEAR_SOCIAL_ENABLED = true;
export const TWITTER_ENABLED = true;
