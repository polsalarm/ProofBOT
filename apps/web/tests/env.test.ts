import { describe, expect, it } from "vitest";

import { validatePublicEnv } from "@/lib/env";

describe("public environment validation", () => {
  it("uses verified BOT Chain defaults", () => {
    expect(validatePublicEnv({})).toMatchObject({
      NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: 677,
      NEXT_PUBLIC_BOTCHAIN_RPC_URL: "https://rpc.botchain.ai",
      NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL: "https://scan.botchain.ai",
    });
  });

  it("rejects a silent fallback to another chain", () => {
    expect(() =>
      validatePublicEnv({ NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: "1" }),
    ).toThrow("chain ID 677");
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
  });
});
