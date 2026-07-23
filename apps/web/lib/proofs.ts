import type { Address, Hash, Hex } from "viem";

export const ASSET_TYPES = [
  { value: 0, label: "Prompt" },
  { value: 1, label: "Dataset" },
  { value: 2, label: "Model card" },
  { value: 3, label: "AI-agent output" },
  { value: 4, label: "Other digital asset" },
] as const;

export type AssetType = (typeof ASSET_TYPES)[number]["value"];

export type ProofRecord = {
  creator: Address;
  timestamp: bigint;
  assetType: AssetType;
  metadataURI: string;
};

export type ProofLogRecord = ProofRecord & {
  proofId: Hex;
  contentHash: Hash;
  transactionHash: Hash;
  blockNumber: bigint;
  logIndex: number;
};

export function assetTypeLabel(value: number) {
  return ASSET_TYPES.find((asset) => asset.value === value)?.label ?? "Unknown";
}

export function formatTimestamp(timestamp: bigint) {
  if (timestamp === 0n) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(Number(timestamp) * 1000));
}

export function shortenHex(value: string, start = 10, end = 8) {
  if (value.length <= start + end + 1) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}
