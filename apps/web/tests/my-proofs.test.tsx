import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  wallet: vi.fn(),
  history: vi.fn(),
  connect: vi.fn(),
}));

vi.mock("@/hooks/use-wallet", () => ({ useWallet: mocks.wallet }));
vi.mock("@/hooks/use-my-proofs", () => ({ useMyProofs: mocks.history }));
vi.mock("@/lib/env", () => ({ deploymentConfigured: true }));

import { MyProofsClient } from "@/components/my-proofs-client";

const ADDRESS = "0x00000000000000000000000000000000000000A1";

describe("My Proofs states", () => {
  beforeEach(() => {
    mocks.wallet.mockReturnValue({
      address: ADDRESS,
      isConnected: true,
      action: "idle",
      error: undefined,
      connectWallet: mocks.connect,
    });
    mocks.history.mockReturnValue({ status: "success", records: [], retry: vi.fn() });
  });

  it("requires a connected wallet", () => {
    mocks.wallet.mockReturnValue({
      address: undefined,
      isConnected: false,
      action: "idle",
      error: undefined,
      connectWallet: mocks.connect,
    });
    mocks.history.mockReturnValue({ status: "idle", records: [], retry: vi.fn() });
    render(<MyProofsClient />);
    expect(screen.getByText("Connect the creator wallet.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeVisible();
  });

  it("guides a connected wallet from the empty state", () => {
    render(<MyProofsClient />);
    expect(screen.getByText("This wallet has no registered proofs.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Register the first proof" })).toHaveAttribute(
      "href",
      "/?tab=register",
    );
  });

  it("surfaces the logs-capable RPC limitation", () => {
    mocks.history.mockReturnValue({
      status: "error",
      records: [],
      retry: vi.fn(),
      error: "Proof history needs an RPC endpoint with eth_getLogs enabled.",
    });
    render(<MyProofsClient />);
    expect(screen.getByText("Proof history is unavailable.")).toBeVisible();
    expect(screen.getByText(/eth_getLogs enabled/)).toBeVisible();
  });
});
