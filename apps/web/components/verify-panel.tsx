"use client";

import { useState } from "react";

import { ContentInput } from "@/components/content-input";
import { DeploymentNotice } from "@/components/deployment-notice";
import { ProofRecordCard } from "@/components/proof-record-card";
import { StatusNotice } from "@/components/status-notice";
import { useContentHash } from "@/hooks/use-content-hash";
import { useProofRecord } from "@/hooks/use-proof-record";
import { deploymentConfigured } from "@/lib/env";
import { normalizeCreator, validateCreator } from "@/lib/validation";

export function VerifyPanel() {
  const content = useContentHash();
  const [creatorInput, setCreatorInput] = useState("");
  const creatorValidation = validateCreator(creatorInput);
  const showCreatorError = creatorInput.length > 0 && !creatorValidation.valid;
  const creator = normalizeCreator(creatorInput);
  const proof = useProofRecord(creator, content.hash, false);
  const canVerify = Boolean(creator && content.hash && deploymentConfigured && proof.status !== "loading");

  return (
    <div className="grid gap-7">
      <DeploymentNotice />
      <div>
        <label className="field-label" htmlFor="verify-creator">Creator wallet</label>
        <input
          className="field-input data-text text-sm"
          id="verify-creator"
          value={creatorInput}
          onChange={(event) => setCreatorInput(event.target.value)}
          placeholder="0x…"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={showCreatorError}
          aria-describedby="verify-creator-help verify-creator-error"
        />
        <p className="mt-2 text-xs text-[var(--mist-muted)]" id="verify-creator-help">Use the wallet address that registered the original content.</p>
        {showCreatorError ? <p className="mt-2 text-sm text-[var(--danger)]" id="verify-creator-error" role="alert">{creatorValidation.message}</p> : null}
      </div>

      <ContentInput controller={content} idPrefix="verify" heading="Original content" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="btn btn-teal sm:min-w-44"
          type="button"
          disabled={!canVerify}
          onClick={() => {
            if (creator && content.hash) void proof.verify();
          }}
        >
          {proof.status === "loading" ? <span className="spinner" aria-hidden="true" /> : "✓"}
          {proof.status === "loading" ? "Checking registry" : "Verify proof"}
        </button>
        <p className="text-xs leading-5 text-[var(--mist-muted)]">No wallet connection is needed. This is a read-only BOT Chain query.</p>
      </div>

      <div aria-live="polite">
        {proof.status === "found" && content.hash ? <ProofRecordCard record={proof.record} contentHash={content.hash} /> : null}
        {proof.status === "not-found" ? (
          <StatusNotice tone="warning">
            <strong className="block text-[var(--mist)]">No matching registration</strong>
            <span className="mt-1 block text-xs text-[var(--mist-muted)]">No registration was found for this wallet and exact content hash. Check whitespace, file bytes, and the creator address.</span>
          </StatusNotice>
        ) : null}
        {proof.status === "error" ? <StatusNotice tone="error">{proof.error}</StatusNotice> : null}
      </div>

      <p className="legal-note border-t border-[var(--line)] pt-5">
        A matching record shows that a wallet registered this exact hash at a blockchain timestamp. It does not establish identity, legal authorship, ownership, originality, or exclusive rights.
      </p>
    </div>
  );
}
