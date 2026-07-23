"use client";

import { useCallback, useEffect, useState } from "react";
import type { Address, Hash } from "viem";
import { usePublicClient } from "wagmi";

import { BOT_CHAIN_ID } from "@/lib/chain";
import { readProofRecord } from "@/lib/contract";
import { toUserError } from "@/lib/errors";
import type { ProofRecord } from "@/lib/proofs";

type ProofReadState =
  | { key?: string; status: "idle" | "loading"; record?: undefined; error?: undefined }
  | { key: string; status: "found"; record: ProofRecord; error?: undefined }
  | { key: string; status: "not-found"; record?: undefined; error?: undefined }
  | { key: string; status: "error"; record?: undefined; error: string };

export function useProofRecord(creator?: Address, hash?: Hash, automatic = true) {
  const client = usePublicClient({ chainId: BOT_CHAIN_ID });
  const [state, setState] = useState<ProofReadState>({ status: "idle" });
  const key = creator && hash ? `${creator}:${hash}` : undefined;

  const read = useCallback(async () => {
    if (!client || !creator || !hash) return;
    const requestKey = `${creator}:${hash}`;
    try {
      const record = await readProofRecord(client, creator, hash);
      setState(
        record
          ? { key: requestKey, status: "found", record }
          : { key: requestKey, status: "not-found" },
      );
    } catch (cause) {
      console.error("Proof lookup failed", cause);
      setState({
        key: requestKey,
        status: "error",
        error: toUserError(cause, "The registry contract could not be queried."),
      });
    }
  }, [client, creator, hash]);

  const verify = useCallback(async () => {
    if (!key) return;
    setState({ key, status: "loading" });
    await read();
  }, [key, read]);

  useEffect(() => {
    if (!automatic || !key) return;
    const request = window.setTimeout(() => void read(), 0);
    return () => window.clearTimeout(request);
  }, [automatic, key, read]);

  if (!key) return { status: "idle" as const, verify };
  if (state.key !== key) {
    return { status: automatic ? ("loading" as const) : ("idle" as const), verify };
  }
  return { ...state, verify } as const;
}
