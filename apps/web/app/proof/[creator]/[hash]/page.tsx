import type { Metadata } from "next";
import { getAddress, type Hash } from "viem";

import { InvalidProofLink, ProofPageClient } from "@/components/proof-page-client";
import { validateProofRoute } from "@/lib/validation";

type ProofPageProps = {
  params: Promise<{ creator: string; hash: string }>;
};

export async function generateMetadata({ params }: ProofPageProps): Promise<Metadata> {
  const { creator, hash } = await params;
  const validation = validateProofRoute(creator, hash);
  if (!validation.valid) return { title: "Invalid proof link" };
  return {
    title: "BOT Chain proof",
    description: `Verify the ProofBOT registration for ${creator.slice(0, 8)}… and ${hash.slice(0, 10)}…`,
  };
}

export default async function ProofPage({ params }: ProofPageProps) {
  const { creator, hash } = await params;
  const validation = validateProofRoute(creator, hash);
  if (!validation.valid) return <InvalidProofLink message={validation.message} />;

  return <ProofPageClient creator={getAddress(creator)} hash={hash as Hash} />;
}
