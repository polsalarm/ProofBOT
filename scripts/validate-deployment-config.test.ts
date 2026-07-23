import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertExpectedChainId,
  assertNoPublicSecrets,
  parseNetwork,
  queryChainId,
  validateConfiguredTestnetChainId,
  validateDeploymentConfirmation,
  validatePrivateKey,
  validateRpcUrl,
} from "./validate-deployment-config.js";

describe("deployment configuration validator", () => {
  it("requires an explicit supported network", () => {
    assert.equal(parseNetwork(["--network", "mainnet"]), "mainnet");
    assert.equal(parseNetwork(["--network=testnet"]), "testnet");
    assert.throws(
      () => parseNetwork([]),
      /Pass --network mainnet or --network testnet explicitly/,
    );
    assert.throws(
      () => parseNetwork(["--network", "ethereum"]),
      /Pass --network mainnet or --network testnet explicitly/,
    );
  });

  it("accepts only credential-free HTTPS RPC URLs", () => {
    assert.equal(
      validateRpcUrl("https://rpc.botchain.ai", "RPC").origin,
      "https://rpc.botchain.ai",
    );
    assert.throws(
      () => validateRpcUrl("http://rpc.botchain.ai", "RPC"),
      /must use HTTPS/,
    );
    assert.throws(
      () => validateRpcUrl("https://user:pass@rpc.botchain.ai", "RPC"),
      /must not place credentials/,
    );
  });

  it("validates a non-zero 32-byte deployer key without exposing it", () => {
    assert.doesNotThrow(() => validatePrivateKey(`0x${"1".repeat(64)}`));
    assert.throws(() => validatePrivateKey(`0x${"0".repeat(64)}`), /non-zero/);
    assert.throws(() => validatePrivateKey(`0x${"f".repeat(64)}`), /secp256k1/);
    assert.throws(() => validatePrivateKey("not-a-private-key"), /32-byte/);
  });

  it("rejects a configured testnet chain ID that differs from the reviewed value", () => {
    assert.doesNotThrow(() => validateConfiguredTestnetChainId(undefined));
    assert.doesNotThrow(() => validateConfiguredTestnetChainId("968"));
    assert.throws(
      () => validateConfiguredTestnetChainId("677"),
      /must equal 968/,
    );
  });

  it("requires the exact mainnet confirmation and enforces RPC chain identity", () => {
    assert.doesNotThrow(() =>
      validateDeploymentConfirmation("testnet", undefined),
    );
    assert.doesNotThrow(() =>
      validateDeploymentConfirmation("mainnet", "true"),
    );
    assert.throws(
      () => validateDeploymentConfirmation("mainnet", "TRUE"),
      /CONFIRM_MAINNET_DEPLOYMENT=true exactly/,
    );
    assert.doesNotThrow(() => assertExpectedChainId(677, 677));
    assert.throws(() => assertExpectedChainId(1, 677), /Chain-ID mismatch/);
  });

  it("rejects potential secrets placed in public environment variables", () => {
    assert.doesNotThrow(() =>
      assertNoPublicSecrets({ NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: "677" }),
    );
    assert.throws(
      () => assertNoPublicSecrets({ NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY: "secret" }),
      /must not be public/,
    );
  });

  it("parses the hexadecimal chain ID returned by JSON-RPC", async () => {
    const fetchResponse = async (
      _input: URL,
      init: RequestInit,
    ): Promise<Response> => {
      const request = JSON.parse(String(init.body)) as { method?: unknown };
      assert.equal(request.method, "eth_chainId");
      return new Response(
        JSON.stringify({ jsonrpc: "2.0", id: 1, result: "0x2a5" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    };

    assert.equal(
      await queryChainId(new URL("https://rpc.botchain.ai"), fetchResponse),
      677,
    );
  });

  it("rejects malformed JSON-RPC chain IDs", async () => {
    const fetchResponse = async (): Promise<Response> =>
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: "677" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    await assert.rejects(
      queryChainId(new URL("https://rpc.botchain.ai"), fetchResponse),
      /did not return a hexadecimal chain ID/,
    );
  });
});
