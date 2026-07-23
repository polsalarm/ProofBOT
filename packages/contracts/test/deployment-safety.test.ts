import { expect } from "chai";

import {
  DEPLOYMENT_PROFILES,
  assertDeploymentRecordWriteAllowed,
  assertDeploymentSafety,
  getDeploymentProfile,
  isValidPrivateKey,
  parseRpcChainId,
  resolveConfirmations,
  sanitizeRpcUrlForDisplay,
} from "../scripts/deployment-safety";

describe("deployment safety", function () {
  const validPrivateKey = `0x${"11".repeat(32)}`;

  it("accepts only the named BOT Chain deployment networks", function () {
    expect(getDeploymentProfile("botchainMainnet").chainId).to.equal(677);
    expect(getDeploymentProfile("botchainTestnet").chainId).to.equal(968);
    expect(() => getDeploymentProfile("hardhat")).to.throw(
      "Unsupported deployment network",
    );
  });

  it("parses canonical JSON-RPC chain IDs", function () {
    expect(parseRpcChainId("0x2a5")).to.equal(677);
    expect(parseRpcChainId("0x3c8")).to.equal(968);
    expect(() => parseRpcChainId(677)).to.throw("invalid eth_chainId");
    expect(() => parseRpcChainId("677")).to.throw("invalid eth_chainId");
  });

  it("redacts credentials, path keys, query tokens, and fragments from RPC logs", function () {
    const sensitiveUrl =
      "https://deploy%40user:super-secret@rpc.example.com:8545/v3/path-key?apiKey=query-token#private-fragment";
    const displayValue = sanitizeRpcUrlForDisplay(sensitiveUrl);

    expect(displayValue).to.equal("https://rpc.example.com:8545");
    for (const secret of [
      "deploy",
      "super-secret",
      "path-key",
      "query-token",
      "private-fragment",
    ]) {
      expect(displayValue).not.to.include(secret);
    }
  });

  it("preserves only a safe HTTP(S) origin and never echoes invalid input", function () {
    expect(
      sanitizeRpcUrlForDisplay("https://rpc.botchain.ai"),
    ).to.equal("https://rpc.botchain.ai");
    expect(
      sanitizeRpcUrlForDisplay("http://127.0.0.1:8545/safe-looking-path"),
    ).to.equal("http://127.0.0.1:8545");
    expect(
      sanitizeRpcUrlForDisplay("not-a-url-containing-secret-token"),
    ).to.equal("[redacted RPC endpoint]");
    expect(
      sanitizeRpcUrlForDisplay("wss://secret.rpc.example.com/private-key"),
    ).to.equal("[redacted RPC endpoint]");
  });

  it("rejects an RPC connected to the wrong chain", function () {
    expect(() =>
      assertDeploymentSafety({
        actualChainId: 1,
        confirmation: "true",
        privateKey: validPrivateKey,
        profile: DEPLOYMENT_PROFILES.botchainMainnet,
      }),
    ).to.throw("RPC chain ID mismatch");
  });

  it("requires an exact explicit mainnet confirmation", function () {
    for (const confirmation of [undefined, "", "TRUE", "1", "yes"]) {
      expect(() =>
        assertDeploymentSafety({
          actualChainId: 677,
          confirmation,
          privateKey: validPrivateKey,
          profile: DEPLOYMENT_PROFILES.botchainMainnet,
        }),
      ).to.throw("CONFIRM_MAINNET_DEPLOYMENT=true");
    }
  });

  it("requires a valid 0x-prefixed 32-byte deployer key", function () {
    expect(isValidPrivateKey(validPrivateKey)).to.equal(true);
    for (const privateKey of [
      undefined,
      "",
      "11".repeat(32),
      `0x${"11".repeat(31)}`,
      `0x${"zz".repeat(32)}`,
      `0x${"00".repeat(32)}`,
      "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
    ]) {
      expect(isValidPrivateKey(privateKey)).to.equal(false);
      expect(() =>
        assertDeploymentSafety({
          actualChainId: 968,
          confirmation: undefined,
          privateKey,
          profile: DEPLOYMENT_PROFILES.botchainTestnet,
        }),
      ).to.throw("DEPLOYER_PRIVATE_KEY");
    }
  });

  it("permits testnet without the mainnet confirmation gate", function () {
    expect(() =>
      assertDeploymentSafety({
        actualChainId: 968,
        confirmation: undefined,
        configuredTestnetChainId: "968",
        privateKey: validPrivateKey,
        profile: DEPLOYMENT_PROFILES.botchainTestnet,
      }),
    ).not.to.throw();
  });

  it("rejects an unverified testnet chain-ID override", function () {
    expect(() =>
      assertDeploymentSafety({
        actualChainId: 968,
        confirmation: undefined,
        configuredTestnetChainId: "999",
        privateKey: validPrivateKey,
        profile: DEPLOYMENT_PROFILES.botchainTestnet,
      }),
    ).to.throw("verified chain ID 968");
  });

  it("requires the explicit overwrite flag for an existing mainnet record", function () {
    expect(() =>
      assertDeploymentRecordWriteAllowed(
        DEPLOYMENT_PROFILES.botchainMainnet,
        true,
        false,
      ),
    ).to.throw("pass --overwrite");
    expect(() =>
      assertDeploymentRecordWriteAllowed(
        DEPLOYMENT_PROFILES.botchainMainnet,
        true,
        true,
      ),
    ).not.to.throw();
    expect(() =>
      assertDeploymentRecordWriteAllowed(
        DEPLOYMENT_PROFILES.botchainTestnet,
        true,
        false,
      ),
    ).not.to.throw();
  });

  it("validates receipt-confirmation configuration", function () {
    expect(
      resolveConfirmations(undefined, DEPLOYMENT_PROFILES.botchainMainnet),
    ).to.equal(2);
    expect(
      resolveConfirmations(undefined, DEPLOYMENT_PROFILES.botchainTestnet),
    ).to.equal(1);
    expect(
      resolveConfirmations("5", DEPLOYMENT_PROFILES.botchainMainnet),
    ).to.equal(5);
    expect(() =>
      resolveConfirmations("0", DEPLOYMENT_PROFILES.botchainMainnet),
    ).to.throw("positive integer");
    expect(() =>
      resolveConfirmations("1.5", DEPLOYMENT_PROFILES.botchainMainnet),
    ).to.throw("positive integer");
  });
});
