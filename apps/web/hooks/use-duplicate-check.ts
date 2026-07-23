"use client";

import { useEffect, useState } from "react";
import type { Address, Hash } from "viem";
import { usePublicClient } from "wagmi";

import { BOT_CHAIN_ID } from "@/lib/chain";
import { readProofExists } from "@/lib/contract";
import { deploymentConfigured } from "@/lib/env";

type DuplicateStatus = "idle" | "checking" | "available" | "duplicate" | "error";

export function useDuplicateCheck(creator?: Address, hash?: Hash) {
  const client = usePublicClient({ chainId: BOT_CHAIN_ID });
  const key = creator && hash ? `${creator}:${hash}` : undefined;
  const [result, setResult] = useState<{ key?: string; status: DuplicateStatus }>({
    status: "idle",
  });

  useEffect(() => {
    if (!client || !creator || !hash || !deploymentConfigured) {
      return;
    }

    let current = true;
    void readProofExists(client, creator, hash)
      .then((exists) => {
        if (current) {
          setResult({ key: `${creator}:${hash}`, status: exists ? "duplicate" : "available" });
        }
      })
      .catch((cause) => {
        console.error("Duplicate proof check failed", cause);
        if (current) setResult({ key: `${creator}:${hash}`, status: "error" });
      });

    return () => {
      current = false;
    };
  }, [client, creator, hash]);

  if (!client || !key || !deploymentConfigured) return "idle";
  return result.key === key ? result.status : "checking";
}
