import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";

import { isValidPrivateKey } from "./scripts/deployment-safety";
import "./tasks/deploy-proofbot";

const BOTCHAIN_MAINNET_CHAIN_ID = 677;
const BOTCHAIN_TESTNET_CHAIN_ID = 968;
const BOTCHAIN_MAINNET_RPC_URL =
  process.env.BOTCHAIN_MAINNET_RPC_URL ?? "https://rpc.botchain.ai";
const BOTCHAIN_TESTNET_RPC_URL =
  process.env.BOTCHAIN_TESTNET_RPC_URL ?? "https://rpc.bohr.life";

function configuredAccounts(): string[] {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  return isValidPrivateKey(privateKey) ? [privateKey] : [];
}

const explorerApiKey = process.env.BOTCHAIN_EXPLORER_API_KEY ?? "";
const mainnetExplorerApiUrl = process.env.BOTCHAIN_EXPLORER_API_URL;
const testnetExplorerApiUrl = process.env.BOTCHAIN_TESTNET_EXPLORER_API_URL;

const customChains = [
  ...(mainnetExplorerApiUrl
    ? [
        {
          network: "botchainMainnet",
          chainId: BOTCHAIN_MAINNET_CHAIN_ID,
          urls: {
            apiURL: mainnetExplorerApiUrl,
            browserURL: "https://scan.botchain.ai",
          },
        },
      ]
    : []),
  ...(testnetExplorerApiUrl
    ? [
        {
          network: "botchainTestnet",
          chainId: BOTCHAIN_TESTNET_CHAIN_ID,
          urls: {
            apiURL: testnetExplorerApiUrl,
            browserURL: "https://scan.bohr.life",
          },
        },
      ]
    : []),
];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // Paris bytecode avoids relying on newer opcodes while preserving 0.8.24 fixes.
      evmVersion: "paris",
    },
  },
  networks: {
    hardhat: {
      chainId: 31_337,
    },
    botchainMainnet: {
      url: BOTCHAIN_MAINNET_RPC_URL,
      chainId: BOTCHAIN_MAINNET_CHAIN_ID,
      accounts: configuredAccounts(),
    },
    botchainTestnet: {
      url: BOTCHAIN_TESTNET_RPC_URL,
      chainId: BOTCHAIN_TESTNET_CHAIN_ID,
      accounts: configuredAccounts(),
    },
  },
  etherscan: {
    apiKey: {
      botchainMainnet: explorerApiKey,
      botchainTestnet:
        process.env.BOTCHAIN_TESTNET_EXPLORER_API_KEY ?? explorerApiKey,
    },
    customChains,
  },
  mocha: {
    timeout: 40_000,
  },
};

export default config;
