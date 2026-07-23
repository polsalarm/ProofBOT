import type { Metadata } from "next";

import { MyProofsClient } from "@/components/my-proofs-client";

export const metadata: Metadata = {
  title: "My Proofs",
  description: "Read creator-filtered ProofBOT registrations from BOT Chain event logs.",
};

export default function MyProofsPage() {
  return (
    <div className="page-shell pt-12 md:pt-16">
      <div className="mb-8">
        <p className="eyebrow">On-chain history</p>
        <h1 className="mt-4 font-[var(--font-display)] text-4xl font-bold tracking-[-0.025em] md:text-5xl">My Proofs</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mist-muted)]">Registrations emitted by your connected wallet, read directly from BOT Chain without an indexer or account database.</p>
      </div>
      <MyProofsClient />
    </div>
  );
}
