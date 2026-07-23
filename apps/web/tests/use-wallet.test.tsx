import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toHexChainId } from "@/lib/network-profiles";

const mocks = vi.hoisted(() => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
  useSwitchChain: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: mocks.useAccount,
  useConnect: mocks.useConnect,
  useDisconnect: mocks.useDisconnect,
  useSwitchChain: mocks.useSwitchChain,
}));

vi.mock("@/lib/chain", () => ({ botChain: undefined }));

import * as chainModule from "@/lib/chain";
import { useWallet } from "@/hooks/use-wallet";

const TESTNET_CHAIN = {
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.bohr.life"] } },
  blockExplorers: { default: { url: "https://scan.bohr.life" } },
};

const MAINNET_CHAIN = {
  id: 677,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.botchain.ai"] } },
  blockExplorers: { default: { url: "https://scan.botchain.ai" } },
};

describe.each([
  ["testnet", TESTNET_CHAIN],
  ["mainnet", MAINNET_CHAIN],
])("useWallet on %s", (_label, chain) => {
  beforeEach(() => {
    vi.clearAllMocks();
    (chainModule as unknown as { botChain: typeof chain }).botChain = chain;
  });

  it("adds the chain via EIP-3085 with the exact network profile, then retries the switch", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const getProvider = vi.fn().mockResolvedValue({ request });
    const connector = { type: "injected", getProvider };

    mocks.useAccount.mockReturnValue({ address: "0xabc", chainId: 1, isConnected: true, connector });
    mocks.useConnect.mockReturnValue({ connectors: [connector], connectAsync: vi.fn() });
    mocks.useDisconnect.mockReturnValue({ disconnect: vi.fn() });

    const switchChainAsync = vi
      .fn()
      .mockRejectedValueOnce({ code: 4902, message: "Unrecognized chain" })
      .mockResolvedValueOnce(undefined);
    mocks.useSwitchChain.mockReturnValue({ switchChainAsync });

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.switchToBotChain();
    });

    expect(switchChainAsync).toHaveBeenNthCalledWith(1, { chainId: chain.id });
    expect(request).toHaveBeenCalledWith({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: toHexChainId(chain.id),
          chainName: chain.name,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: [chain.rpcUrls.default.http[0]],
          blockExplorerUrls: [chain.blockExplorers.default.url],
        },
      ],
    });
    expect(switchChainAsync).toHaveBeenNthCalledWith(2, { chainId: chain.id });
    await waitFor(() => expect(result.current.error).toBeUndefined());
  });

  it("flags the wrong network against this profile's chain ID", () => {
    mocks.useAccount.mockReturnValue({ address: "0xabc", chainId: 1, isConnected: true, connector: undefined });
    mocks.useConnect.mockReturnValue({ connectors: [], connectAsync: vi.fn() });
    mocks.useDisconnect.mockReturnValue({ disconnect: vi.fn() });
    mocks.useSwitchChain.mockReturnValue({ switchChainAsync: vi.fn() });

    const { result } = renderHook(() => useWallet());
    expect(result.current.wrongNetwork).toBe(true);
  });

  it("clears wrongNetwork once connected to this profile's chain ID", () => {
    mocks.useAccount.mockReturnValue({ address: "0xabc", chainId: chain.id, isConnected: true, connector: undefined });
    mocks.useConnect.mockReturnValue({ connectors: [], connectAsync: vi.fn() });
    mocks.useDisconnect.mockReturnValue({ disconnect: vi.fn() });
    mocks.useSwitchChain.mockReturnValue({ switchChainAsync: vi.fn() });

    const { result } = renderHook(() => useWallet());
    expect(result.current.wrongNetwork).toBe(false);
  });
});
