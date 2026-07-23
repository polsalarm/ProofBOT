import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  wallet: vi.fn(),
  duplicate: vi.fn(),
  registration: vi.fn(),
  proof: vi.fn(),
  register: vi.fn(),
  reset: vi.fn(),
  connect: vi.fn(),
  switchChain: vi.fn(),
}));

vi.mock("@/hooks/use-wallet", () => ({ useWallet: mocks.wallet }));
vi.mock("@/hooks/use-duplicate-check", () => ({ useDuplicateCheck: mocks.duplicate }));
vi.mock("@/hooks/use-register-proof", () => ({ useRegisterProof: mocks.registration }));
vi.mock("@/hooks/use-proof-record", () => ({ useProofRecord: mocks.proof }));
vi.mock("@/lib/env", () => ({
  deploymentConfigured: true,
  publicEnv: {
    network: "mainnet",
    chainId: 677,
    rpcUrl: "https://rpc.botchain.ai",
    explorerUrl: "https://scan.botchain.ai",
    contractAddress: "0x00000000000000000000000000000000000000A1",
    deploymentBlock: 1n,
    logChunkSize: 5000n,
  },
}));
vi.mock("@/components/proof-record-card", () => ({
  ProofRecordCard: ({ contentHash }: { contentHash: string }) => (
    <div data-testid="proof-record">Verified record {contentHash}</div>
  ),
}));

import { RegisterPanel } from "@/components/register-panel";

const ADDRESS = "0x00000000000000000000000000000000000000A1";
const TX_HASH = `0x${"11".repeat(32)}`;

function wallet(overrides: Record<string, unknown> = {}) {
  return {
    address: ADDRESS,
    chainId: 677,
    isConnected: true,
    wrongNetwork: false,
    action: "idle",
    error: undefined,
    connectWallet: mocks.connect,
    switchToBotChain: mocks.switchChain,
    disconnectWallet: vi.fn(),
    ...overrides,
  };
}

function registration(overrides: Record<string, unknown> = {}) {
  return {
    status: "idle",
    transactionHash: undefined,
    error: undefined,
    register: mocks.register,
    reset: mocks.reset,
    ...overrides,
  };
}

describe("RegisterPanel", () => {
  beforeEach(() => {
    mocks.wallet.mockReturnValue(wallet());
    mocks.duplicate.mockReturnValue("available");
    mocks.registration.mockReturnValue(registration());
    mocks.proof.mockReturnValue({ status: "idle", verify: vi.fn() });
  });

  it("keeps registration disabled until exact content has a hash", async () => {
    const user = userEvent.setup();
    render(<RegisterPanel />);
    const button = screen.getByRole("button", { name: /Register proof/ });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText("Original text"), "hello");
    expect(
      screen.getByText("0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"),
    ).toBeVisible();
    expect(button).toBeEnabled();

    await user.click(button);
    expect(mocks.register).toHaveBeenCalledWith(
      expect.objectContaining({
        creator: ADDRESS,
        contentHash: "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
        assetType: 0,
        metadataURI: "",
      }),
    );
  });

  it("switches between exact text and local file modes", async () => {
    const user = userEvent.setup();
    render(<RegisterPanel />);
    await user.type(screen.getByLabelText("Original text"), "temporary text");
    await user.click(screen.getByRole("tab", { name: "File" }));
    expect(screen.queryByLabelText("Original text")).not.toBeInTheDocument();

    const bytes = new Uint8Array([1, 2, 3, 4]);
    const selected = new File([bytes], "model.bin", { type: "application/octet-stream" });
    await user.upload(screen.getByLabelText(/choose a local file/i), selected);
    await waitFor(() => expect(screen.getByText("model.bin")).toBeVisible());
    expect(screen.getByText(/exact file bytes selected/i)).toBeVisible();
  });

  it("shows a wallet-connect action while disconnected", () => {
    mocks.wallet.mockReturnValue(wallet({ address: undefined, chainId: undefined, isConnected: false }));
    mocks.duplicate.mockReturnValue("idle");
    render(<RegisterPanel />);
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /Register proof/ })).not.toBeInTheDocument();
  });

  it("shows an explicit BOT Chain switch action on the wrong network", () => {
    mocks.wallet.mockReturnValue(wallet({ chainId: 1, wrongNetwork: true }));
    render(<RegisterPanel />);
    expect(screen.getByRole("button", { name: /Switch to BOT Chain/ })).toBeVisible();
    expect(screen.getByText("Chain 1")).toBeVisible();
  });

  it("blocks a duplicate wallet-bound proof", async () => {
    const user = userEvent.setup();
    mocks.duplicate.mockReturnValue("duplicate");
    render(<RegisterPanel />);
    await user.type(screen.getByLabelText("Original text"), "same content");
    expect(screen.getByText("This wallet has already registered the same content hash.")).toBeVisible();
    expect(screen.getByRole("button", { name: /Register proof/ })).toBeDisabled();
  });

  it("announces pending wallet and receipt states", async () => {
    const user = userEvent.setup();
    mocks.registration.mockReturnValue(registration({ status: "confirming", transactionHash: TX_HASH }));
    render(<RegisterPanel />);
    await user.type(screen.getByLabelText("Original text"), "pending content");
    expect(screen.getByText(/Transaction submitted to BOT Chain/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Registering proof/ })).toBeDisabled();
  });

  it("renders the confirmed proof result", async () => {
    const user = userEvent.setup();
    mocks.registration.mockReturnValue(registration({ status: "success", transactionHash: TX_HASH }));
    mocks.proof.mockReturnValue({
      status: "found",
      record: { creator: ADDRESS, timestamp: 123n, assetType: 0, metadataURI: "" },
      verify: vi.fn(),
    });
    render(<RegisterPanel />);
    await user.type(screen.getByLabelText("Original text"), "confirmed content");
    expect(await screen.findByTestId("proof-record")).toBeVisible();
  });
});
