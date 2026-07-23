import {
  encodeAbiParameters,
  getAddress,
  keccak256,
  type Abi,
  type Address,
  type Hash,
  type PublicClient,
  zeroAddress,
} from "viem";

import registryArtifact from "@/lib/generated/ProofBOTRegistry.json";
import { publicEnv } from "@/lib/env";
import type { AssetType, ProofRecord } from "@/lib/proofs";

export const proofBOTRegistryAbi = registryArtifact.abi as Abi;

export class DeploymentNotConfiguredError extends Error {
  constructor() {
    super(
      "ProofBOT is not connected to a deployed registry. Set the public contract address and deployment block.",
    );
    this.name = "DeploymentNotConfiguredError";
  }
}

export function requireContractAddress() {
  if (!publicEnv.contractAddress) throw new DeploymentNotConfiguredError();
  return publicEnv.contractAddress;
}

export function proofContractConfig() {
  return {
    address: requireContractAddress(),
    abi: proofBOTRegistryAbi,
  } as const;
}

type RawProof =
  | readonly [Address, bigint, number, string]
  | {
      creator: Address;
      timestamp: bigint;
      assetType: number;
      metadataURI: string;
    };

export function formatProofResponse(raw: RawProof): ProofRecord | undefined {
  const objectResult = "creator" in raw;
  const creator = getAddress(objectResult ? raw.creator : raw[0]);
  if (creator === zeroAddress) return undefined;

  return {
    creator,
    timestamp: objectResult ? raw.timestamp : raw[1],
    assetType: (objectResult ? raw.assetType : raw[2]) as AssetType,
    metadataURI: objectResult ? raw.metadataURI : raw[3],
  };
}

export async function readProofRecord(
  client: Pick<PublicClient, "readContract">,
  creator: Address,
  contentHash: Hash,
) {
  const raw = await client.readContract({
    ...proofContractConfig(),
    functionName: "getProof",
    args: [creator, contentHash],
  });

  return formatProofResponse(raw as RawProof);
}

export async function readProofExists(
  client: Pick<PublicClient, "readContract">,
  creator: Address,
  contentHash: Hash,
) {
  return (await client.readContract({
    ...proofContractConfig(),
    functionName: "exists",
    args: [creator, contentHash],
  })) as boolean;
}

export function calculateProofId(creator: Address, contentHash: Hash) {
  const encoded = encodeAbiParameters(
    [{ type: "address" }, { type: "bytes32" }],
    [creator, contentHash],
  );
  return keccak256(encoded);
}

export function proofPath(creator: Address, hash: Hash) {
  return `/proof/${creator}/${hash}`;
}
