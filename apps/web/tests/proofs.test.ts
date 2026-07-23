import { describe, expect, it } from "vitest";
import { zeroAddress } from "viem";

import { calculateProofId, formatProofResponse } from "@/lib/contract";
import { explorerAddressUrl, explorerBlockUrl, explorerTransactionUrl } from "@/lib/explorer";
import { ASSET_TYPES, assetTypeLabel, shortenHex } from "@/lib/proofs";

const CREATOR = "0x00000000000000000000000000000000000000A1" as const;
const HASH = `0x${"12".repeat(32)}` as const;

describe("proof formatting and links", () => {
  it("keeps the Solidity asset enum mapping stable", () => {
    expect(ASSET_TYPES.map(({ value, label }) => [value, label])).toEqual([
      [0, "Prompt"],
      [1, "Dataset"],
      [2, "Model card"],
      [3, "AI-agent output"],
      [4, "Other digital asset"],
    ]);
    expect(assetTypeLabel(99)).toBe("Unknown");
  });

  it("formats tuple and named contract responses", () => {
    expect(formatProofResponse([CREATOR, 123n, 2, "ipfs://bafy/meta"])).toEqual({
      creator: CREATOR,
      timestamp: 123n,
      assetType: 2,
      metadataURI: "ipfs://bafy/meta",
    });
    expect(
      formatProofResponse({ creator: CREATOR, timestamp: 456n, assetType: 4, metadataURI: "" }),
    ).toMatchObject({ timestamp: 456n, assetType: 4 });
    expect(formatProofResponse([zeroAddress, 0n, 0, ""])).toBeUndefined();
  });

  it("calculates a deterministic wallet-bound proof ID", () => {
    expect(calculateProofId(CREATOR, HASH)).toMatch(/^0x[0-9a-f]{64}$/);
    expect(calculateProofId(CREATOR, HASH)).toBe(calculateProofId(CREATOR, HASH));
    expect(calculateProofId(CREATOR, HASH)).not.toBe(
      calculateProofId("0x00000000000000000000000000000000000000A2", HASH),
    );
  });

  it("constructs explorer URLs without dropping identifiers", () => {
    expect(explorerAddressUrl(CREATOR)).toBe(`https://scan.botchain.ai/address/${CREATOR}`);
    expect(explorerTransactionUrl(HASH)).toBe(`https://scan.botchain.ai/tx/${HASH}`);
    expect(explorerBlockUrl(42n)).toBe("https://scan.botchain.ai/block/42");
  });

  it("shortens only compact list values", () => {
    expect(shortenHex(HASH, 10, 8)).toBe(`${HASH.slice(0, 10)}…${HASH.slice(-8)}`);
    expect(shortenHex("0x1234")).toBe("0x1234");
  });
});
