export type NetworkKey = "testnet" | "mainnet";

export interface NetworkProfile {
  key: NetworkKey;
  chainId: number;
  name: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  defaultRpcUrl: string;
  defaultExplorerUrl: string;
  testnet: boolean;
}

export const NETWORK_PROFILES: Record<NetworkKey, NetworkProfile> = {
  testnet: {
    key: "testnet",
    chainId: 968,
    name: "BOT Chain Testnet",
    nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
    defaultRpcUrl: "https://rpc.bohr.life",
    defaultExplorerUrl: "https://scan.bohr.life",
    testnet: true,
  },
  mainnet: {
    key: "mainnet",
    chainId: 677,
    name: "BOT Chain",
    nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
    defaultRpcUrl: "https://rpc.botchain.ai",
    defaultExplorerUrl: "https://scan.botchain.ai",
    testnet: false,
  },
};

export function isNetworkKey(value: string): value is NetworkKey {
  return value === "testnet" || value === "mainnet";
}

export function getNetworkProfile(key: string): NetworkProfile {
  if (!isNetworkKey(key)) {
    throw new Error(`Unsupported BOT Chain network "${key}". Must be "testnet" or "mainnet".`);
  }
  return NETWORK_PROFILES[key];
}

export function toHexChainId(chainId: number): `0x${string}` {
  return `0x${chainId.toString(16)}`;
}

