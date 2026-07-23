import { describe, expect, it } from "vitest";

import {
  MAX_METADATA_BYTES,
  metadataByteLength,
  normalizeCreator,
  safeMetadataHref,
  validateCreator,
  validateMetadataURI,
  validateProofRoute,
} from "@/lib/validation";

const CREATOR = "0x00000000000000000000000000000000000000a1";
const HASH = `0x${"ab".repeat(32)}`;

describe("frontend input validation", () => {
  it("validates and checksums creator addresses", () => {
    expect(validateCreator(CREATOR)).toEqual({ valid: true });
    expect(normalizeCreator(CREATOR)).toBe("0x00000000000000000000000000000000000000A1");
    expect(validateCreator("0x123")).toEqual({
      valid: false,
      message: "Enter a valid EVM wallet address.",
    });
  });

  it("allows empty, HTTPS, and IPFS metadata", () => {
    expect(validateMetadataURI("").valid).toBe(true);
    expect(validateMetadataURI("https://example.com/model.json").valid).toBe(true);
    expect(validateMetadataURI("ipfs://bafybeigdyrzt/meta.json").valid).toBe(true);
  });

  it.each(["javascript:alert(1)", "data:text/html,test", "file:///secret", "http://example.com"])(
    "rejects unsupported metadata scheme %s",
    (value) => expect(validateMetadataURI(value).valid).toBe(false),
  );

  it("enforces the contract's UTF-8 byte limit", () => {
    const exact = `https://x.dev/${"a".repeat(MAX_METADATA_BYTES - "https://x.dev/".length)}`;
    expect(metadataByteLength(exact)).toBe(200);
    expect(validateMetadataURI(exact).valid).toBe(true);
    expect(validateMetadataURI(`${exact}a`).valid).toBe(false);
    expect(metadataByteLength("🤖")).toBe(4);
  });

  it("only turns safe HTTPS metadata into clickable links", () => {
    expect(safeMetadataHref("https://example.com")).toBe("https://example.com");
    expect(safeMetadataHref("ipfs://bafy/test")).toBeUndefined();
    expect(safeMetadataHref("javascript:alert(1)")).toBeUndefined();
  });

  it("validates both proof route parameters", () => {
    expect(validateProofRoute(CREATOR, HASH).valid).toBe(true);
    expect(validateProofRoute("bad", HASH)).toMatchObject({ valid: false });
    expect(validateProofRoute(CREATOR, "0x123")).toMatchObject({ valid: false });
  });
});
