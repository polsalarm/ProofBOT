"use client";

import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { usePublicClient } from "wagmi";

import { BOT_CHAIN_ID } from "@/lib/chain";
import { publicEnv } from "@/lib/env";
import { ProofLogsUnavailableError, readCreatorProofLogs } from "@/lib/logs";
import type { ProofLogRecord } from "@/lib/proofs";

type HistoryState = {
  creator?: Address;
  status: "idle" | "loading" | "success" | "error";
  records: ProofLogRecord[];
  error?: string;
};

function cacheKey(creator: Address) {
  return `proofbot:proof-history:v1:${publicEnv.chainId}:${publicEnv.contractAddress ?? "none"}:${creator}`;
}

function readCache(creator: Address) {
  try {
    const value = sessionStorage.getItem(cacheKey(creator));
    if (!value) return [];
    const parsed = JSON.parse(value) as Array<Omit<ProofLogRecord, "timestamp" | "blockNumber"> & {
      timestamp: string;
      blockNumber: string;
    }>;
    return parsed.map((record) => ({
      ...record,
      timestamp: BigInt(record.timestamp),
      blockNumber: BigInt(record.blockNumber),
    }));
  } catch {
    return [];
  }
}

function writeCache(creator: Address, records: ProofLogRecord[]) {
  try {
    sessionStorage.setItem(
      cacheKey(creator),
      JSON.stringify(records.slice(0, 100), (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );
  } catch {
    // History remains chain-sourced when storage is unavailable.
  }
}

export function useMyProofs(creator?: Address) {
  const client = usePublicClient({ chainId: BOT_CHAIN_ID });
  const [state, setState] = useState<HistoryState>({ status: "idle", records: [] });

  const load = useCallback(async () => {
    if (!creator || !client) return;
    const cached = readCache(creator);
    try {
      const records = await readCreatorProofLogs(client, creator);
      writeCache(creator, records);
      setState({ creator, status: "success", records });
    } catch (cause) {
      console.error("Proof history query failed", cause);
      setState({
        creator,
        status: "error",
        records: cached,
        error:
          cause instanceof ProofLogsUnavailableError
            ? cause.message
            : "Proof history could not be loaded from BOT Chain. Check the RPC configuration and retry.",
      });
    }
  }, [client, creator]);

  useEffect(() => {
    if (!creator) return;
    const request = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(request);
  }, [creator, load]);

  const retry = useCallback(async () => {
    if (!creator) return;
    setState({ creator, status: "loading", records: readCache(creator) });
    await load();
  }, [creator, load]);

  if (!creator) return { status: "idle" as const, records: [], retry };
  if (state.creator !== creator) {
    return { status: "loading" as const, records: readCache(creator), retry };
  }
  return { ...state, retry } as const;
}
