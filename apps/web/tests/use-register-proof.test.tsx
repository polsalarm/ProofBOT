import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readExists: vi.fn(),
  simulate: vi.fn(),
  write: vi.fn(),
  waitReceipt: vi.fn(),
  reset: vi.fn(),
}));

vi.mock("wagmi", () => ({
  usePublicClient: () => ({
    simulateContract: mocks.simulate,
    waitForTransactionReceipt: mocks.waitReceipt,
  }),
  useWriteContract: () => ({
    writeContractAsync: mocks.write,
    reset: mocks.reset,
  }),
}));

vi.mock("@/lib/contract", () => ({
  proofContractConfig: () => ({
    address: "0x00000000000000000000000000000000000000C0",
    abi: [],
  }),
  readProofExists: mocks.readExists,
}));

import { useRegisterProof } from "@/hooks/use-register-proof";

const input = {
  creator: "0x00000000000000000000000000000000000000A1" as const,
  contentHash: `0x${"aa".repeat(32)}` as const,
  assetType: 2 as const,
  metadataURI: "https://example.com/model-card",
};
const TRANSACTION_HASH = `0x${"11".repeat(32)}` as const;

describe("useRegisterProof write pipeline", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.readExists.mockResolvedValue(false);
    mocks.simulate.mockResolvedValue({ request: { functionName: "register" } });
    mocks.write.mockResolvedValue(TRANSACTION_HASH);
    mocks.waitReceipt.mockResolvedValue({ status: "success" });
  });

  it("checks duplicates, simulates, writes, and waits for a successful receipt", async () => {
    const { result } = renderHook(() => useRegisterProof());
    await act(async () => result.current.register(input));

    expect(mocks.readExists).toHaveBeenCalledWith(expect.anything(), input.creator, input.contentHash);
    expect(mocks.simulate).toHaveBeenCalledWith(
      expect.objectContaining({
        account: input.creator,
        functionName: "register",
        args: [input.contentHash, input.assetType, input.metadataURI],
      }),
    );
    expect(mocks.write).toHaveBeenCalledWith({ functionName: "register" });
    expect(mocks.waitReceipt).toHaveBeenCalledWith(
      expect.objectContaining({ hash: TRANSACTION_HASH, confirmations: 1 }),
    );
    expect(result.current.status).toBe("success");
    expect(result.current.transactionHash).toBe(TRANSACTION_HASH);
  });

  it("stops before simulation when the wallet-bound proof already exists", async () => {
    mocks.readExists.mockResolvedValue(true);
    const { result } = renderHook(() => useRegisterProof());
    await act(async () => result.current.register(input));
    expect(result.current.status).toBe("duplicate");
    expect(mocks.simulate).not.toHaveBeenCalled();
    expect(mocks.write).not.toHaveBeenCalled();
  });

  it("maps a rejected wallet request into a readable error", async () => {
    mocks.write.mockRejectedValue({ code: 4001 });
    const { result } = renderHook(() => useRegisterProof());
    await act(async () => result.current.register(input));
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("The request was rejected in your wallet.");
  });

  it("does not report a reverted receipt as success", async () => {
    mocks.waitReceipt.mockResolvedValue({ status: "reverted" });
    const { result } = renderHook(() => useRegisterProof());
    await act(async () => result.current.register(input));
    expect(result.current.status).toBe("error");
    expect(result.current.error).toContain("contract rejected");
  });
});
