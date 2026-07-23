import { keccak256 } from "viem";

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const CONTENT_HASH_PATTERN = /^0x[0-9a-fA-F]{64}$/;

export class UnsupportedFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedFileError";
  }
}

export function hashText(text: string) {
  if (text.length === 0) {
    throw new Error("Enter text before calculating its hash.");
  }

  return keccak256(new TextEncoder().encode(text));
}

export function hashFileBytes(bytes: Uint8Array) {
  if (bytes.byteLength === 0) {
    throw new UnsupportedFileError("Choose a non-empty file.");
  }
  if (bytes.byteLength > MAX_FILE_BYTES) {
    throw new UnsupportedFileError("This file is larger than the 25 MB browser limit.");
  }

  return keccak256(bytes);
}

export async function hashFile(file: Pick<File, "arrayBuffer" | "size">) {
  if (file.size === 0) {
    throw new UnsupportedFileError("Choose a non-empty file.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new UnsupportedFileError("This file is larger than the 25 MB browser limit.");
  }

  const buffer = await file.arrayBuffer();
  return hashFileBytes(new Uint8Array(buffer));
}

export function isContentHash(value: string): value is `0x${string}` {
  return CONTENT_HASH_PATTERN.test(value);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
