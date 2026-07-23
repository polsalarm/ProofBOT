import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  proof: vi.fn(),
  verify: vi.fn(),
}));

vi.mock("@/hooks/use-proof-record", () => ({ useProofRecord: mocks.proof }));
vi.mock("@/lib/env", () => ({ deploymentConfigured: true }));
vi.mock("@/components/proof-record-card", () => ({
  ProofRecordCard: () => <div data-testid="verified-record">Matching proof found on BOT Chain.</div>,
}));

import { VerifyPanel } from "@/components/verify-panel";

const ADDRESS = "0x00000000000000000000000000000000000000A1";

async function fillVerificationForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Creator wallet"), ADDRESS);
  await user.type(screen.getByLabelText("Original text"), "verify me");
  return user;
}

describe("VerifyPanel", () => {
  beforeEach(() => {
    mocks.proof.mockReturnValue({ status: "idle", verify: mocks.verify });
  });

  it("validates the creator without requiring a wallet", async () => {
    const user = userEvent.setup();
    render(<VerifyPanel />);
    expect(screen.getByText(/No wallet connection is needed/)).toBeVisible();
    await user.type(screen.getByLabelText("Creator wallet"), "bad");
    await user.type(screen.getByLabelText("Original text"), "content");
    expect(screen.getByRole("button", { name: /Verify proof/ })).toBeDisabled();
  });

  it("shows a verified record", async () => {
    mocks.proof.mockReturnValue({
      status: "found",
      record: { creator: ADDRESS, timestamp: 123n, assetType: 1, metadataURI: "" },
      verify: mocks.verify,
    });
    render(<VerifyPanel />);
    await fillVerificationForm();
    expect(screen.getByTestId("verified-record")).toBeVisible();
  });

  it("clearly distinguishes a missing proof", async () => {
    mocks.proof.mockReturnValue({ status: "not-found", verify: mocks.verify });
    render(<VerifyPanel />);
    await fillVerificationForm();
    expect(screen.getByText("No matching registration")).toBeVisible();
    expect(screen.getByText(/No registration was found for this wallet/)).toBeVisible();
  });

  it("submits a valid read-only lookup", async () => {
    render(<VerifyPanel />);
    const user = await fillVerificationForm();
    await user.click(screen.getByRole("button", { name: /Verify proof/ }));
    expect(mocks.verify).toHaveBeenCalledOnce();
  });
});
