"use client";

import Link from "next/link";
import type { Address, Hash } from "viem";

import { ContentInput } from "@/components/content-input";
import { CopyButton } from "@/components/copy-button";
import { DeploymentNotice } from "@/components/deployment-notice";
import { ProofRecordCard } from "@/components/proof-record-card";
import { StatusNotice } from "@/components/status-notice";
import { useContentHash } from "@/hooks/use-content-hash";
import { useProofRecord } from "@/hooks/use-proof-record";

export function InvalidProofLink({ message }: { message: string }) {
  return (
    <section className="page-shell pt-16">
      <div className="surface mx-auto max-w-2xl p-7 text-center md:p-10">
        <p className="eyebrow">Invalid proof link</p>
        <h1 className="mt-4 font-[var(--font-display)] text-3xl font-bold">This proof URL cannot be checked.</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--mist-muted)]">{message}</p>
        <Link className="btn btn-primary mt-7" href="/?tab=verify">Verify another proof</Link>
      </div>
    </section>
  );
}

export function ProofPageClient({ creator, hash }: { creator: Address; hash: Hash }) {
  const proof = useProofRecord(creator, hash);
  const localContent = useContentHash();
  const comparison = localContent.hash ? localContent.hash.toLowerCase() === hash.toLowerCase() : undefined;

  return (
    <div className="page-shell pt-12 md:pt-16">
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="eyebrow">Shared proof</p>
          <h1 className="mt-4 font-[var(--font-display)] text-4xl leading-tight font-bold tracking-[-0.025em] md:text-5xl">
            Chain-of-custody record
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mist-muted)]">
            A direct read from the ProofBOT registry on BOT Chain. No connected wallet is required.
          </p>
        </div>
        <CopyButton value={hash} label="Copy content hash" />
      </div>

      <DeploymentNotice />

      <div className="mt-6" aria-live="polite">
        {proof.status === "idle" || proof.status === "loading" ? (
          <div className="surface grid min-h-56 place-items-center p-8 text-center">
            <div>
              <span className="spinner mx-auto mb-4 block text-[var(--teal)]" aria-hidden="true" />
              <p className="font-bold">Reading the BOT Chain registry…</p>
              <p className="mt-2 text-xs text-[var(--mist-muted)]">Checking this creator and exact 32-byte hash.</p>
            </div>
          </div>
        ) : null}
        {proof.status === "found" ? <ProofRecordCard record={proof.record} contentHash={hash} /> : null}
        {proof.status === "not-found" ? (
          <StatusNotice tone="warning">
            <strong className="block text-[var(--mist)]">No matching registration</strong>
            <span className="mt-1 block text-xs leading-5 text-[var(--mist-muted)]">
              The registry contains no proof for this creator and content hash. This is different from an RPC error.
            </span>
          </StatusNotice>
        ) : null}
        {proof.status === "error" ? <StatusNotice tone="error">{proof.error}</StatusNotice> : null}
      </div>

      <section className="surface mt-8 p-5 md:p-8" aria-labelledby="compare-heading">
        <div className="mb-6">
          <p className="eyebrow">Optional local check</p>
          <h2 className="mt-3 font-[var(--font-display)] text-2xl font-bold" id="compare-heading">Does your copy match this hash?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mist-muted)]">
            Paste text or choose a local file. ProofBOT will hash it in this browser and compare it with the URL—nothing is uploaded.
          </p>
        </div>
        <ContentInput controller={localContent} idPrefix="proof-compare" heading="Content to compare" />
        {comparison === true ? (
          <div className="mt-5"><StatusNotice tone="success" live>The local content produces the exact hash in this proof link.</StatusNotice></div>
        ) : null}
        {comparison === false ? (
          <div className="mt-5"><StatusNotice tone="warning" live>The local content produces a different hash. Check every character, space, line break, and file byte.</StatusNotice></div>
        ) : null}
      </section>

      <p className="legal-note mt-8 border-t border-[var(--line)] pt-5">
        ProofBOT records that a wallet registered a cryptographic hash at a BOT Chain timestamp. This record does not by itself establish legal authorship, copyright ownership, originality, identity, or exclusive rights.
      </p>
    </div>
  );
}
