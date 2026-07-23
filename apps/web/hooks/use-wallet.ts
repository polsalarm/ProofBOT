"use client";

import { useCallback, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

import { botChain } from "@/lib/chain";
import { isUnknownChainError, toUserError } from "@/lib/errors";
import { toHexChainId } from "@/lib/network-profiles";

type RequestProvider = {
  request(args: { method: string; params?: readonly unknown[] }): Promise<unknown>;
};

export function useWallet() {
  const account = useAccount();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();
  const [action, setAction] = useState<"idle" | "connecting" | "switching">("idle");
  const [error, setError] = useState<string>();

  const connector = connect.connectors.find((candidate) => candidate.type === "injected") ?? connect.connectors[0];

  const connectWallet = useCallback(async () => {
    setError(undefined);
    if (!connector) {
      setError("No injected EVM wallet was found. Install a browser wallet, then reload ProofBOT.");
      return;
    }
    setAction("connecting");
    try {
      const provider = await connector.getProvider();
      if (!provider) {
        setError("No injected EVM wallet was found. Install a browser wallet, then reload ProofBOT.");
        return;
      }
      await connect.connectAsync({ connector });
    } catch (cause) {
      setError(toUserError(cause, "The wallet could not be connected."));
    } finally {
      setAction("idle");
    }
  }, [connect, connector]);

  const switchToBotChain = useCallback(async () => {
    setError(undefined);
    setAction("switching");
    try {
      await switchChain.switchChainAsync({ chainId: botChain.id });
    } catch (cause) {
      if (!isUnknownChainError(cause) || !connector) {
        setError(toUserError(cause, "BOT Chain could not be selected in your wallet."));
        setAction("idle");
        return;
      }

      try {
        const provider = (await connector.getProvider()) as RequestProvider;
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: toHexChainId(botChain.id),
              chainName: botChain.name,
              nativeCurrency: botChain.nativeCurrency,
              rpcUrls: [...botChain.rpcUrls.default.http],
              blockExplorerUrls: [botChain.blockExplorers.default.url],
            },
          ],
        });
        await switchChain.switchChainAsync({ chainId: botChain.id });
      } catch (addCause) {
        setError(toUserError(addCause, "BOT Chain could not be added to your wallet."));
      }
    } finally {
      setAction("idle");
    }
  }, [connector, switchChain]);

  return {
    address: account.address,
    chainId: account.chainId,
    isConnected: account.isConnected,
    wrongNetwork: account.isConnected && account.chainId !== botChain.id,
    connectorName: account.connector?.name,
    action,
    error,
    connectWallet,
    switchToBotChain,
    disconnectWallet: disconnect.disconnect,
  } as const;
}
