import type { Address, Hash } from "viem";

import { publicEnv } from "@/lib/env";

export function explorerAddressUrl(address: Address) {
  return `${publicEnv.explorerUrl}/address/${address}`;
}

export function explorerTransactionUrl(hash: Hash) {
  return `${publicEnv.explorerUrl}/tx/${hash}`;
}

export function explorerBlockUrl(blockNumber: bigint) {
  return `${publicEnv.explorerUrl}/block/${blockNumber}`;
}
