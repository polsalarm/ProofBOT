import { getAddress, isAddress } from "viem";
import { z } from "zod";

const httpUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://") || value.startsWith("http://"), {
    message: "must use http:// or https://",
  });

const publicEnvSchema = z.object({
  NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: z.coerce.number().int().refine((value) => value === 677, {
    message: "must be BOT Chain mainnet chain ID 677",
  }),
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
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_BOTCHAIN_CHAIN_ID: input.NEXT_PUBLIC_BOTCHAIN_CHAIN_ID ?? "677",
    NEXT_PUBLIC_BOTCHAIN_RPC_URL:
      input.NEXT_PUBLIC_BOTCHAIN_RPC_URL ?? "https://rpc.botchain.ai",
    NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL:
      input.NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL ?? "https://scan.botchain.ai",
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
