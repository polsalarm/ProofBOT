import { beforeEach, describe, expect, it, vi } from "vitest";

const CONTRACT = "0x00000000000000000000000000000000000000C0";
const CREATOR = "0x00000000000000000000000000000000000000A1";
const TX_ONE = `0x${"11".repeat(32)}` as const;
const TX_TWO = `0x${"22".repeat(32)}` as const;

vi.mock("@/lib/contract", () => ({
  proofBOTRegistryAbi: [],
  requireContractAddress: () => CONTRACT,
}));

vi.mock("@/lib/env", () => ({
  publicEnv: {
    deploymentBlock: 10n,
    logChunkSize: 5n,
  },
}));

import { ProofLogsUnavailableError, readCreatorProofLogs } from "@/lib/logs";

function log(transactionHash: `0x${string}`, blockNumber: bigint, logIndex: number) {
  return {
    args: {
      proofId: `0x${"aa".repeat(32)}`,
      contentHash: `0x${"bb".repeat(32)}`,
      creator: CREATOR,
      assetType: 1,
      metadataURI: "",
      timestamp: 1_700_000_000n + blockNumber,
    },
    transactionHash,
    blockNumber,
    logIndex,
  };
}

describe("creator-filtered event log strategy", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queries safe chunks, de-duplicates, and sorts newest first", async () => {
    const getContractEvents = vi
      .fn()
      .mockResolvedValueOnce([log(TX_ONE, 11n, 0)])
      .mockResolvedValueOnce([log(TX_TWO, 18n, 1), log(TX_ONE, 11n, 0)])
      .mockResolvedValueOnce([]);
    const records = await readCreatorProofLogs(
      { getBlockNumber: vi.fn().mockResolvedValue(20n), getContractEvents } as never,
      CREATOR,
    );

    expect(getContractEvents).toHaveBeenCalledTimes(3);
    expect(getContractEvents.mock.calls.map(([request]) => [request.fromBlock, request.toBlock])).toEqual([
      [10n, 14n],
      [15n, 19n],
      [20n, 20n],
    ]);
    expect(getContractEvents.mock.calls[0][0].args).toEqual({ creator: CREATOR });
    expect(records.map((record) => record.transactionHash)).toEqual([TX_TWO, TX_ONE]);
  });

  it("recursively bisects range-limit failures down to individual blocks", async () => {
    const getContractEvents = vi.fn(
      async (request: { fromBlock: bigint; toBlock: bigint }) => {
        if (request.fromBlock !== request.toBlock) {
          throw new Error("block range too wide");
        }

        const transactionHash = `0x${request.fromBlock
          .toString(16)
          .padStart(64, "0")}` as `0x${string}`;
        return [log(transactionHash, request.fromBlock, 0)];
      },
    );

    const records = await readCreatorProofLogs(
      { getBlockNumber: vi.fn().mockResolvedValue(17n), getContractEvents } as never,
      CREATOR,
      { fromBlock: 10n, chunkSize: 8n },
    );
    expect(
      getContractEvents.mock.calls.map(([request]) => [request.fromBlock, request.toBlock]),
    ).toEqual([
      [10n, 17n],
      [10n, 13n],
      [10n, 11n],
      [10n, 10n],
      [11n, 11n],
      [12n, 13n],
      [12n, 12n],
      [13n, 13n],
      [14n, 17n],
      [14n, 15n],
      [14n, 14n],
      [15n, 15n],
      [16n, 17n],
      [16n, 16n],
      [17n, 17n],
    ]);
    expect(records.map((record) => record.blockNumber)).toEqual([
      17n,
      16n,
      15n,
      14n,
      13n,
      12n,
      11n,
      10n,
    ]);
  });

  it("does not retry when eth_getLogs is disabled", async () => {
    const getContractEvents = vi.fn().mockRejectedValue(new Error("eth_getLogs is disabled"));
    await expect(
      readCreatorProofLogs(
        { getBlockNumber: vi.fn().mockResolvedValue(14n), getContractEvents } as never,
        CREATOR,
      ),
    ).rejects.toEqual(expect.any(ProofLogsUnavailableError));
    expect(getContractEvents).toHaveBeenCalledTimes(1);
  });

  it("does not retry non-range RPC failures", async () => {
    const getContractEvents = vi.fn().mockRejectedValue(new Error("401 Unauthorized"));
    await expect(
      readCreatorProofLogs(
        { getBlockNumber: vi.fn().mockResolvedValue(14n), getContractEvents } as never,
        CREATOR,
      ),
    ).rejects.toEqual(expect.any(ProofLogsUnavailableError));
    expect(getContractEvents).toHaveBeenCalledTimes(1);
  });
});
