import { defineChain } from "viem";

import { publicEnv } from "@/lib/env";
import { getNetworkProfile } from "@/lib/network-profiles";

const networkProfile = getNetworkProfile(publicEnv.network);

export const botChain = defineChain({
  id: publicEnv.chainId,
  name: networkProfile.name,
  nativeCurrency: networkProfile.nativeCurrency,
  rpcUrls: {
    default: { http: [publicEnv.rpcUrl] },
    public: { http: [publicEnv.rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: `${networkProfile.name} Explorer`,
      url: publicEnv.explorerUrl,
    },
  },
  testnet: networkProfile.testnet,
});

export const BOT_CHAIN_ID = botChain.id;
export const BOT_NETWORK_PROFILE = networkProfile;
