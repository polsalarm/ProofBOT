import { describe, expect, it } from "vitest";

import { validatePublicEnv } from "@/lib/env";

describe("public environment validation", () => {
  it("defaults to the verified mainnet profile", () => {
    expect(validatePublicEnv({})).toMatchObject({
      NEXT_PUBLIC_BOTCHAIN_NETWORK: "mainnet",
      NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: 677,
      NEXT_PUBLIC_BOTCHAIN_RPC_URL: "https://rpc.botchain.ai",
      NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL: "https://scan.botchain.ai",
    });
  });

  it("resolves the verified testnet profile", () => {
    expect(
      validatePublicEnv({ NEXT_PUBLIC_BOTCHAIN_NETWORK: "testnet" }),
    ).toMatchObject({
      NEXT_PUBLIC_BOTCHAIN_NETWORK: "testnet",
      NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: 968,
      NEXT_PUBLIC_BOTCHAIN_RPC_URL: "https://rpc.bohr.life",
      NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL: "https://scan.bohr.life",
    });
  });

  it("rejects an unsupported network value", () => {
    expect(() =>
      validatePublicEnv({ NEXT_PUBLIC_BOTCHAIN_NETWORK: "goerli" }),
    ).toThrow('must be "testnet" or "mainnet"');
  });

  it("rejects a chain ID that does not match the selected network", () => {
    expect(() =>
      validatePublicEnv({
        NEXT_PUBLIC_BOTCHAIN_NETWORK: "testnet",
        NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: "677",
      }),
    ).toThrow('NEXT_PUBLIC_BOTCHAIN_CHAIN_ID must be 968 for network "testnet"');

    expect(() =>
      validatePublicEnv({
        NEXT_PUBLIC_BOTCHAIN_NETWORK: "mainnet",
        NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: "968",
      }),
    ).toThrow('NEXT_PUBLIC_BOTCHAIN_CHAIN_ID must be 677 for network "mainnet"');
  });

  it("rejects a silent fallback to another chain on the default network", () => {
    expect(() =>
      validatePublicEnv({ NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: "1" }),
    ).toThrow("NEXT_PUBLIC_BOTCHAIN_CHAIN_ID must be 677");
  });

  it("rejects invalid addresses and block numbers", () => {
    expect(() =>
      validatePublicEnv({ NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS: "0x123" }),
    ).toThrow("valid EVM address");
    expect(() =>
      validatePublicEnv({ NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK: "-1" }),
    ).toThrow("unsigned block number");
  });

  it("rejects partially configured deployments", () => {
    expect(() =>
      validatePublicEnv({
        NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS:
          "0x00000000000000000000000000000000000000C0",
      }),
    ).toThrow("must be configured together");

    expect(() =>
      validatePublicEnv({ NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK: "123" }),
    ).toThrow("must be configured together");
  });

  it("requires deployment values for production validation", () => {
    expect(() => validatePublicEnv({}, { requireDeployment: true })).toThrow(
      "production requires NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS",
    );

    expect(() =>
      validatePublicEnv(
        {
          NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS:
            "0x00000000000000000000000000000000000000C0",
          NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK: "123",
        },
        { requireDeployment: true },
      ),
    ).not.toThrow();

    expect(() =>
      validatePublicEnv(
        {
          NEXT_PUBLIC_BOTCHAIN_NETWORK: "testnet",
          NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS:
            "0x00000000000000000000000000000000000000C0",
          NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK: "123",
        },
        { requireDeployment: true },
      ),
    ).not.toThrow();
  });
});
