import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

import { botChain } from "@/lib/chain";

export const wagmiConfig = createConfig({
  chains: [botChain],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [botChain.id]: http(botChain.rpcUrls.default.http[0], {
      retryCount: 2,
      timeout: 15_000,
    }),
  },
  ssr: true,
});

export function createProofQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
