import { describe, expect, it } from "vitest";

import {
  isDuplicateProofError,
  isUnknownChainError,
  isUserRejectedRequest,
  toUserError,
} from "@/lib/errors";

describe("human-readable wallet and contract errors", () => {
  it("recognizes wallet rejection and unknown-chain codes", () => {
    expect(isUserRejectedRequest({ code: 4001 })).toBe(true);
    expect(isUnknownChainError({ code: 4902 })).toBe(true);
  });

  it("maps duplicate custom errors", () => {
    const error = { shortMessage: "execution reverted: AlreadyRegistered()" };
    expect(isDuplicateProofError(error)).toBe(true);
    expect(toUserError(error)).toBe("This wallet has already registered the same content hash.");
  });

  it("maps gas, timeout, rejection, revert, and RPC failures without stack traces", () => {
    expect(toUserError(new Error("Provider not found"))).toContain("No injected EVM wallet");
    expect(toUserError(new Error("insufficient funds for gas"))).toContain("enough BOT");
    expect(toUserError(new Error("receipt timed out"))).toContain("not confirmed in time");
    expect(toUserError({ code: 4001 })).toContain("rejected");
    expect(toUserError(new Error("execution reverted"))).toContain("contract rejected");
    expect(toUserError(new Error("HTTP request failed"))).toContain("could not be reached");
    expect(toUserError(new Error("transaction replaced"))).toContain("replacement transaction");
    expect(toUserError(new Error("transaction dropped"))).toContain("no longer available");
  });
});
