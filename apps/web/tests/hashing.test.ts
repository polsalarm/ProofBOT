import { describe, expect, it } from "vitest";

import {
  CONTENT_HASH_PATTERN,
  MAX_FILE_BYTES,
  UnsupportedFileError,
  hashFile,
  hashFileBytes,
  hashText,
  isContentHash,
} from "@/lib/hashing";

describe("local Keccak-256 hashing", () => {
  it("hashes the exact UTF-8 bytes of text", () => {
    expect(hashText("hello")).toBe(
      "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
    );
  });

  it("does not trim or normalize whitespace", () => {
    expect(hashText("hello ")).not.toBe(hashText("hello"));
    expect(hashText("hello\n")).not.toBe(hashText("hello"));
  });

  it("rejects empty text", () => {
    expect(() => hashText("")).toThrow("Enter text");
  });

  it("hashes exact file bytes", async () => {
    const bytes = new Uint8Array([0, 1, 2, 255]);
    const file = {
      size: bytes.byteLength,
      arrayBuffer: async () => bytes.buffer,
    };
    expect(await hashFile(file)).toBe(hashFileBytes(bytes));
    expect(await hashFile(file)).not.toBe(hashText("0,1,2,255"));
  });

  it("rejects empty and oversized files before reading", async () => {
    await expect(hashFile({ size: 0, arrayBuffer: async () => new ArrayBuffer(0) })).rejects.toBeInstanceOf(
      UnsupportedFileError,
    );
    const reader = vi.fn(async () => new ArrayBuffer(0));
    await expect(hashFile({ size: MAX_FILE_BYTES + 1, arrayBuffer: reader })).rejects.toThrow("25 MB");
    expect(reader).not.toHaveBeenCalled();
  });

  it("accepts only full 0x-prefixed 32-byte hashes", () => {
    const valid = `0x${"aB".repeat(32)}`;
    expect(CONTENT_HASH_PATTERN.test(valid)).toBe(true);
    expect(isContentHash(valid)).toBe(true);
    expect(isContentHash(valid.slice(0, -1))).toBe(false);
    expect(isContentHash(`0x${"g".repeat(64)}`)).toBe(false);
    expect(isContentHash("a".repeat(64))).toBe(false);
  });
});
