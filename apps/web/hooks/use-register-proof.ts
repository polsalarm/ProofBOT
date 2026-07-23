"use client";

import { useCallback, useState } from "react";
import type { Address, Hash } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

import { BOT_CHAIN_ID } from "@/lib/chain";
import { proofContractConfig, readProofExists } from "@/lib/contract";
import { isDuplicateProofError, toUserError } from "@/lib/errors";
import type { AssetType } from "@/lib/proofs";

export type RegisterStatus =
  | "idle"
  | "checking"
  | "simulating"
  | "wallet"
  | "confirming"
  | "success"
  | "duplicate"
  | "error";

export function useRegisterProof() {
  const client = usePublicClient({ chainId: BOT_CHAIN_ID });
  const writer = useWriteContract();
  const [status, setStatus] = useState<RegisterStatus>("idle");
  const [transactionHash, setTransactionHash] = useState<Hash>();
  const [error, setError] = useState<string>();

  const reset = useCallback(() => {
    setStatus("idle");
    setTransactionHash(undefined);
    setError(undefined);
    writer.reset();
  }, [writer]);

  const register = useCallback(
    async (input: {
      creator: Address;
      contentHash: Hash;
      assetType: AssetType;
      metadataURI: string;
    }) => {
      if (!client) {
        setStatus("error");
        setError("BOT Chain could not be reached. Check the configured RPC and try again.");
        return;
      }

      setError(undefined);
      setTransactionHash(undefined);
      try {
        setStatus("checking");
        if (await readProofExists(client, input.creator, input.contentHash)) {
          setStatus("duplicate");
          return;
        }

        setStatus("simulating");
        const simulation = await client.simulateContract({
          ...proofContractConfig(),
          account: input.creator,
          functionName: "register",
          args: [input.contentHash, input.assetType, input.metadataURI],
        });

        setStatus("wallet");
        const hash = await writer.writeContractAsync(simulation.request);
        setTransactionHash(hash);
        setStatus("confirming");
        const receipt = await client.waitForTransactionReceipt({
          hash,
          confirmations: 1,
          timeout: 120_000,
        });
        if (receipt.status !== "success") {
          throw new Error("Transaction reverted while waiting for its receipt.");
        }
        setStatus("success");
      } catch (cause) {
        console.error("Proof registration failed", cause);
        if (isDuplicateProofError(cause)) {
          setStatus("duplicate");
          return;
        }
        setStatus("error");
        setError(toUserError(cause, "The proof could not be registered."));
      }
    },
    [client, writer],
  );

  return { status, transactionHash, error, register, reset } as const;
}
