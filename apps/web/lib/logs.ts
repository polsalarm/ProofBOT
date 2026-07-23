import {
  getAddress,
  type Address,
  type Hash,
  type Hex,
  type PublicClient,
} from "viem";

import { proofBOTRegistryAbi, requireContractAddress } from "@/lib/contract";
import { publicEnv } from "@/lib/env";
import type { AssetType, ProofLogRecord } from "@/lib/proofs";

export class ProofLogsUnavailableError extends Error {
  constructor(options?: { cause?: unknown }) {
    super(
      "Proof history needs an RPC endpoint with eth_getLogs enabled. Configure NEXT_PUBLIC_BOTCHAIN_RPC_URL with a logs-capable BOT Chain provider, then retry.",
      options,
    );
    this.name = "ProofLogsUnavailableError";
  }
}

type LogsClient = Pick<PublicClient, "getBlockNumber" | "getContractEvents">;

const RANGE_LIMIT_PATTERNS = [
  /\bblock range\b.{0,120}\b(?:too (?:large|wide)|exceed(?:s|ed)?|limit(?:ed|s)?|max(?:imum)?)\b/i,
  /\b(?:limit(?:ed)?|max(?:imum)?|at most|no more than)\b.{0,120}\bblock range\b/i,
  /\beth_getlogs\b.{0,120}\b(?:limit(?:ed)?|max(?:imum)?|at most|no more than)\b.{0,60}\bblocks?\b/i,
  /\b(?:query returned|more than|too many)\b.{0,80}\b(?:logs?|results?)\b/i,
  /\b(?:log|result|response)(?: response)? size\b.{0,80}\b(?:exceed(?:s|ed)?|limit|too large)\b/i,
];

const NON_RANGE_LIMIT_PATTERNS = [
  /\brate limit(?:ed|ing)?\b/i,
  /\btoo many requests\b/i,
  /\bhttp status(?: code)? 429\b/i,
];

function errorText(error: unknown, seen = new Set<object>()): string {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object" || seen.has(error)) return "";

  seen.add(error);
  const candidate = error as {
    cause?: unknown;
    details?: unknown;
    message?: unknown;
    metaMessages?: unknown;
    shortMessage?: unknown;
  };
  const messages = [candidate.message, candidate.shortMessage, candidate.details]
    .filter((value): value is string => typeof value === "string")
    .concat(
      Array.isArray(candidate.metaMessages)
        ? candidate.metaMessages.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    );

  messages.push(errorText(candidate.cause, seen));
  return messages.filter(Boolean).join("\n");
}

function isRangeLimitError(error: unknown): boolean {
  const message = errorText(error);
  if (NON_RANGE_LIMIT_PATTERNS.some((pattern) => pattern.test(message))) return false;
  return RANGE_LIMIT_PATTERNS.some((pattern) => pattern.test(message));
}

async function queryWithRangeFallback(
  client: LogsClient,
  creator: Address,
  fromBlock: bigint,
  toBlock: bigint,
): Promise<ProofLogRecord[]> {
  try {
    const logs = await client.getContractEvents({
      address: requireContractAddress(),
      abi: proofBOTRegistryAbi,
      eventName: "ProofRegistered",
      args: { creator },
      fromBlock,
      toBlock,
      strict: true,
    });

    return logs.flatMap((log) => {
      const args = log.args as {
        proofId?: Hex;
        contentHash?: Hash;
        creator?: Address;
        assetType?: number;
        metadataURI?: string;
        timestamp?: bigint;
      };
      if (
        !args.proofId ||
        !args.contentHash ||
        !args.creator ||
        args.assetType === undefined ||
        args.metadataURI === undefined ||
        args.timestamp === undefined ||
        !log.transactionHash ||
        log.blockNumber === null ||
        log.logIndex === null
      ) {
        return [];
      }

      return [
        {
          proofId: args.proofId,
          contentHash: args.contentHash,
          creator: getAddress(args.creator),
          assetType: args.assetType as AssetType,
          metadataURI: args.metadataURI,
          timestamp: args.timestamp,
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
        },
      ];
    });
  } catch (error) {
    if (!isRangeLimitError(error) || fromBlock >= toBlock) {
      throw new ProofLogsUnavailableError({ cause: error });
    }

    const middle = fromBlock + (toBlock - fromBlock) / 2n;
    const left = await queryWithRangeFallback(client, creator, fromBlock, middle);
    const right = await queryWithRangeFallback(
      client,
      creator,
      middle + 1n,
      toBlock,
    );
    return [...left, ...right];
  }
}

export async function readCreatorProofLogs(
  client: LogsClient,
  creator: Address,
  options?: { fromBlock?: bigint; chunkSize?: bigint },
) {
  const fromBlock = options?.fromBlock ?? publicEnv.deploymentBlock;
  if (fromBlock === undefined) {
    throw new Error(
      "ProofBOT deployment block is not configured. Set NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK.",
    );
  }

  const latestBlock = await client.getBlockNumber();
  if (fromBlock > latestBlock) return [];

  const chunkSize = options?.chunkSize ?? publicEnv.logChunkSize;
  const records: ProofLogRecord[] = [];
  for (let start = fromBlock; start <= latestBlock; start += chunkSize) {
    const end = start + chunkSize - 1n > latestBlock ? latestBlock : start + chunkSize - 1n;
    records.push(...(await queryWithRangeFallback(client, creator, start, end)));
  }

  const unique = new Map<string, ProofLogRecord>();
  for (const record of records) {
    unique.set(`${record.transactionHash}:${record.logIndex}`, record);
  }

  return [...unique.values()].sort((left, right) => {
    if (left.blockNumber === right.blockNumber) return right.logIndex - left.logIndex;
    return left.blockNumber > right.blockNumber ? -1 : 1;
  });
}
