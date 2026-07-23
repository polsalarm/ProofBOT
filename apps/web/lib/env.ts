import { getAddress, isAddress } from "viem";
import { z } from "zod";

import { NETWORK_PROFILES, isNetworkKey } from "@/lib/network-profiles";

const httpUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://") || value.startsWith("http://"), {
    message: "must use http:// or https://",
  });

const publicEnvSchema = z.object({
  NEXT_PUBLIC_BOTCHAIN_NETWORK: z.enum(["testnet", "mainnet"], {
    errorMap: () => ({ message: 'must be "testnet" or "mainnet"' }),
  }),
  NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: z.coerce.number().int(),
  NEXT_PUBLIC_BOTCHAIN_RPC_URL: httpUrl,
  NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL: httpUrl,
  NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS: z
    .string()
    .refine((value) => value === "" || isAddress(value), { message: "must be a valid EVM address" }),
  NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK: z
    .string()
    .regex(/^\d*$/, "must be an unsigned block number"),
  NEXT_PUBLIC_PROOFBOT_LOG_CHUNK_SIZE: z.coerce.number().int().min(100).max(100_000),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

interface PublicEnvValidationOptions {
  requireDeployment?: boolean;
}

export function validatePublicEnv(
  input: Partial<Record<keyof PublicEnv, string | undefined>>,
  options: PublicEnvValidationOptions = {},
) {
  const rawNetwork = input.NEXT_PUBLIC_BOTCHAIN_NETWORK ?? "mainnet";
  const networkDefaults = isNetworkKey(rawNetwork) ? NETWORK_PROFILES[rawNetwork] : undefined;

  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_BOTCHAIN_NETWORK: rawNetwork,
    NEXT_PUBLIC_BOTCHAIN_CHAIN_ID:
      input.NEXT_PUBLIC_BOTCHAIN_CHAIN_ID ?? String(networkDefaults?.chainId ?? ""),
    NEXT_PUBLIC_BOTCHAIN_RPC_URL:
      input.NEXT_PUBLIC_BOTCHAIN_RPC_URL ?? networkDefaults?.defaultRpcUrl,
    NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL:
      input.NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL ?? networkDefaults?.defaultExplorerUrl,
    NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS:
      input.NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS ?? "",
    NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK:
      input.NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK ?? "",
    NEXT_PUBLIC_PROOFBOT_LOG_CHUNK_SIZE:
      input.NEXT_PUBLIC_PROOFBOT_LOG_CHUNK_SIZE ?? "5000",
  });

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid ProofBOT public environment: ${details}`);
  }

  const expectedChainId = NETWORK_PROFILES[result.data.NEXT_PUBLIC_BOTCHAIN_NETWORK].chainId;
  if (result.data.NEXT_PUBLIC_BOTCHAIN_CHAIN_ID !== expectedChainId) {
    throw new Error(
      `Invalid ProofBOT public environment: NEXT_PUBLIC_BOTCHAIN_CHAIN_ID must be ${expectedChainId} for network "${result.data.NEXT_PUBLIC_BOTCHAIN_NETWORK}", got ${result.data.NEXT_PUBLIC_BOTCHAIN_CHAIN_ID}.`,
    );
  }

  const hasContractAddress =
    result.data.NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS !== "";
  const hasDeploymentBlock =
    result.data.NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK !== "";

  if (hasContractAddress !== hasDeploymentBlock) {
    throw new Error(
      "Invalid ProofBOT public environment: NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS and NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK must be configured together.",
    );
  }

  if (options.requireDeployment && !hasContractAddress) {
    throw new Error(
      "Invalid ProofBOT public environment: production requires NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS and NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK.",
    );
  }

  return result.data;
}

const parsed = validatePublicEnv({
  NEXT_PUBLIC_BOTCHAIN_NETWORK: process.env.NEXT_PUBLIC_BOTCHAIN_NETWORK,
  NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: process.env.NEXT_PUBLIC_BOTCHAIN_CHAIN_ID,
  NEXT_PUBLIC_BOTCHAIN_RPC_URL: process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL,
  NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL: process.env.NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL,
  NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS,
  NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK:
    process.env.NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK,
  NEXT_PUBLIC_PROOFBOT_LOG_CHUNK_SIZE:
    process.env.NEXT_PUBLIC_PROOFBOT_LOG_CHUNK_SIZE,
}, {
  requireDeployment: process.env.NODE_ENV === "production",
});

export const publicEnv = {
  network: parsed.NEXT_PUBLIC_BOTCHAIN_NETWORK,
  chainId: parsed.NEXT_PUBLIC_BOTCHAIN_CHAIN_ID,
  rpcUrl: parsed.NEXT_PUBLIC_BOTCHAIN_RPC_URL.replace(/\/$/, ""),
  explorerUrl: parsed.NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL.replace(/\/$/, ""),
  contractAddress: parsed.NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS
    ? getAddress(parsed.NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS)
    : undefined,
  deploymentBlock: parsed.NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK
    ? BigInt(parsed.NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK)
    : undefined,
  logChunkSize: BigInt(parsed.NEXT_PUBLIC_PROOFBOT_LOG_CHUNK_SIZE),
} as const;

export const deploymentConfigured =
  publicEnv.contractAddress !== undefined && publicEnv.deploymentBlock !== undefined;
