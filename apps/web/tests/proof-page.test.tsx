import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-proof-record", () => ({
  useProofRecord: () => ({ status: "not-found", verify: vi.fn() }),
}));

import { InvalidProofLink, ProofPageClient } from "@/components/proof-page-client";

const ADDRESS = "0x00000000000000000000000000000000000000A1";
const HASH = `0x${"aa".repeat(32)}` as const;

describe("shareable proof view", () => {
  it("renders invalid route parameters as a guided state", () => {
    render(<InvalidProofLink message="This proof link contains an invalid creator address." />);
    expect(screen.getByText("This proof URL cannot be checked.")).toBeVisible();
    expect(screen.getByText(/invalid creator address/)).toBeVisible();
  });

  it("distinguishes a valid but missing registration", () => {
    render(<ProofPageClient creator={ADDRESS} hash={HASH} />);
    expect(screen.getByText("No matching registration")).toBeVisible();
    expect(screen.getByText(/different from an RPC error/)).toBeVisible();
  });
});
