import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from "dotenv";

dotenv.config();

const { SEPOLIA_RPC_URL, ARBITRUM_SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

if(!SEPOLIA_RPC_URL || !ARBITRUM_SEPOLIA_RPC_URL || !PRIVATE_KEY) {
  throw new Error(
    "Missing required environment variables: SEPOLIA_RPC_URL, PRIVATE_KEY");
}

const ACCOUNTS: string[] = [PRIVATE_KEY];

const SOLC_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 200 
  }
};

const defaultNetwork: string = "localhost";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  
  defaultNetwork: defaultNetwork,
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337    
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: ACCOUNTS,
    },
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL,
      chainId: 421614,
      accounts: ACCOUNTS,
    },
  },
};

export default config;
