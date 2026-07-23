import { describe, expect, it } from "vitest";

import { getNetworkProfile, isNetworkKey, toHexChainId } from "@/lib/network-profiles";

describe("network profiles", () => {
  it("resolves the testnet profile", () => {
    expect(getNetworkProfile("testnet")).toMatchObject({
      key: "testnet",
      chainId: 968,
      testnet: true,
    });
  });

  it("resolves the mainnet profile", () => {
    expect(getNetworkProfile("mainnet")).toMatchObject({
      key: "mainnet",
      chainId: 677,
      testnet: false,
    });
  });

  it("rejects an unsupported network key", () => {
    expect(() => getNetworkProfile("goerli")).toThrow(
      'Unsupported BOT Chain network "goerli"',
    );
  });

  it("narrows supported network keys", () => {
    expect(isNetworkKey("testnet")).toBe(true);
    expect(isNetworkKey("mainnet")).toBe(true);
    expect(isNetworkKey("sepolia")).toBe(false);
  });

  it("converts chain IDs to EIP-3085 hex form for both networks", () => {
    expect(toHexChainId(968)).toBe("0x3c8");
    expect(toHexChainId(677)).toBe("0x2a5");
  });
});
