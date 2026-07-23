import { defineChain } from "viem";

import { publicEnv } from "@/lib/env";

export const botChain = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [publicEnv.rpcUrl] },
    public: { http: [publicEnv.rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "BOT Chain Explorer",
      url: publicEnv.explorerUrl,
    },
  },
  testnet: false,
});

export const BOT_CHAIN_ID = botChain.id;
