import { getAddress, isAddress } from "viem";

import { isContentHash } from "@/lib/hashing";

export const MAX_METADATA_BYTES = 200;

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function metadataByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function validateMetadataURI(value: string): ValidationResult {
  const bytes = metadataByteLength(value);
  if (bytes > MAX_METADATA_BYTES) {
    return {
      valid: false,
      message: `Metadata is ${bytes} bytes; the on-chain maximum is 200 bytes.`,
    };
  }
  if (value === "") return { valid: true };

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { valid: false, message: "Use a complete https:// or ipfs:// URL." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "ipfs:") {
    return { valid: false, message: "Only https:// and ipfs:// metadata URLs are supported." };
  }
  if (!parsed.hostname) {
    return { valid: false, message: "The metadata URL must include a host or IPFS identifier." };
  }

  return { valid: true };
}

export function safeMetadataHref(value: string) {
  const validation = validateMetadataURI(value);
  if (!validation.valid || !value.startsWith("https://")) return undefined;
  return value;
}

export function validateCreator(value: string): ValidationResult {
  if (!isAddress(value)) {
    return { valid: false, message: "Enter a valid EVM wallet address." };
  }
  return { valid: true };
}

export function normalizeCreator(value: string) {
  return isAddress(value) ? getAddress(value) : undefined;
}

export function validateProofRoute(creator: string, hash: string): ValidationResult {
  if (!isAddress(creator)) {
    return { valid: false, message: "This proof link contains an invalid creator address." };
  }
  if (!isContentHash(hash)) {
    return { valid: false, message: "This proof link contains an invalid content hash." };
  }
  return { valid: true };
}
