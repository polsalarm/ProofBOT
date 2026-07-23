"use client";

import { useState } from "react";

import { ContentInput } from "@/components/content-input";
import { DeploymentNotice } from "@/components/deployment-notice";
import { ProofRecordCard } from "@/components/proof-record-card";
import { StatusNotice } from "@/components/status-notice";
import { useContentHash } from "@/hooks/use-content-hash";
import { useDuplicateCheck } from "@/hooks/use-duplicate-check";
import { useProofRecord } from "@/hooks/use-proof-record";
import { useRegisterProof } from "@/hooks/use-register-proof";
import { useWallet } from "@/hooks/use-wallet";
import { botChain } from "@/lib/chain";
import { deploymentConfigured } from "@/lib/env";
import { ASSET_TYPES, type AssetType } from "@/lib/proofs";
import { metadataByteLength, validateMetadataURI } from "@/lib/validation";

function RegistrationResult({
  creator,
  hash,
  transactionHash,
}: {
  creator: NonNullable<ReturnType<typeof useWallet>["address"]>;
  hash: NonNullable<ReturnType<typeof useContentHash>["hash"]>;
  transactionHash: NonNullable<ReturnType<typeof useRegisterProof>["transactionHash"]>;
}) {
  const proof = useProofRecord(creator, hash);
  if (proof.status === "found") {
    return <ProofRecordCard record={proof.record} contentHash={hash} transactionHash={transactionHash} />;
  }
  return (
    <StatusNotice tone="success" live>
      <strong className="block text-[var(--mist)]">Proof registered successfully.</strong>
      <span className="mt-1 block text-xs text-[var(--mist-muted)]">
        The receipt is confirmed. The registry record is being refreshed.
      </span>
    </StatusNotice>
  );
}

export function RegisterPanel() {
  const content = useContentHash();
  const wallet = useWallet();
  const registration = useRegisterProof();
  const [assetType, setAssetType] = useState<AssetType>(0);
  const [metadataURI, setMetadataURI] = useState("");
  const metadataValidation = validateMetadataURI(metadataURI);
  const duplicate = useDuplicateCheck(wallet.address, content.hash);
  const busy = ["checking", "simulating", "wallet", "confirming"].includes(registration.status);
  const canRegister = Boolean(
    content.hash &&
      metadataValidation.valid &&
      wallet.address &&
      wallet.isConnected &&
      !wallet.wrongNetwork &&
      deploymentConfigured &&
      duplicate === "available" &&
      !busy &&
      registration.status !== "success",
  );

  const statusMessage =
    registration.status === "checking"
      ? "Checking for an existing wallet-bound proof…"
      : registration.status === "simulating"
        ? "Simulating the contract call before submission…"
        : registration.status === "wallet"
          ? "Confirm the transaction in your wallet."
          : registration.status === "confirming"
            ? `Transaction submitted to ${botChain.name}. Waiting for its receipt…`
            : undefined;

  return (
    <div className="grid gap-6">
      <DeploymentNotice />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="grid gap-8">
          <ContentInput controller={content} idPrefix="register" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="asset-type">Asset category</label>
              <select
                className="field-input"
                id="asset-type"
                value={assetType}
                onChange={(event) => setAssetType(Number(event.target.value) as AssetType)}
              >
                {ASSET_TYPES.map((asset) => (
                  <option value={asset.value} key={asset.value}>{asset.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="metadata-uri">
                <span>Optional public metadata</span>
                <span className="field-help data-text">{metadataByteLength(metadataURI)}/200 bytes</span>
              </label>
              <input
                className="field-input"
                id="metadata-uri"
                type="url"
                inputMode="url"
                value={metadataURI}
                onChange={(event) => setMetadataURI(event.target.value)}
                placeholder="https://… or ipfs://…"
                aria-describedby={metadataValidation.valid ? "metadata-help" : "metadata-help metadata-error"}
                aria-invalid={!metadataValidation.valid}
              />
              <p className="mt-2 text-xs leading-5 text-[var(--mist-muted)]" id="metadata-help">
                Included URLs become public and permanent. Never put secrets here.
              </p>
              {!metadataValidation.valid ? (
                <p className="mt-2 text-xs text-[var(--danger)]" id="metadata-error" role="alert">
                  {metadataValidation.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="rounded-xl border border-[var(--line)] bg-black/12 p-5 xl:self-start" aria-labelledby="confirm-heading">
          <p className="eyebrow">Final check</p>
          <h3 className="mt-3 text-lg font-bold" id="confirm-heading">Confirm on {botChain.name}</h3>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--mist-muted)]">Wallet</dt>
              <dd className="data-text max-w-36 text-right text-xs hash-wrap">{wallet.address ?? "Not connected"}</dd>
            </div>
            <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--mist-muted)]">Network</dt>
              <dd className={wallet.isConnected && !wallet.wrongNetwork ? "text-[var(--teal)]" : "text-[var(--warning)]"}>
                {!wallet.isConnected ? "Connect wallet" : wallet.wrongNetwork ? `Chain ${wallet.chainId ?? "unknown"}` : `${botChain.name} · ${botChain.id}`}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[var(--mist-muted)]">Duplicate</dt>
              <dd>
                {duplicate === "checking" ? "Checking…" : duplicate === "duplicate" ? "Already registered" : duplicate === "available" ? "Clear" : "—"}
              </dd>
            </div>
          </dl>

          {!wallet.isConnected ? (
            <button className="btn btn-primary mt-5 w-full" type="button" onClick={wallet.connectWallet} disabled={wallet.action !== "idle"}>
              {wallet.action === "connecting" ? <span className="spinner" aria-hidden="true" /> : null}
              Connect wallet
            </button>
          ) : wallet.wrongNetwork ? (
            <button className="btn btn-primary mt-5 w-full" type="button" onClick={wallet.switchToBotChain} disabled={wallet.action !== "idle"}>
              {wallet.action === "switching" ? <span className="spinner" aria-hidden="true" /> : "↻"}
              Switch to {botChain.name}
            </button>
          ) : (
            <button
              className="btn btn-primary mt-5 w-full"
              type="button"
              disabled={!canRegister}
              onClick={() => {
                if (!wallet.address || !content.hash) return;
                void registration.register({ creator: wallet.address, contentHash: content.hash, assetType, metadataURI });
              }}
            >
              {busy ? <span className="spinner" aria-hidden="true" /> : "◇"}
              {busy ? "Registering proof" : "Register proof"}
            </button>
          )}

          {!content.hash ? <p className="mt-3 text-xs text-[var(--mist-muted)]">Choose non-empty content to calculate its hash.</p> : null}
          {content.hash && duplicate === "error" ? <p className="mt-3 text-xs text-[var(--danger)]">The duplicate check could not reach the registry.</p> : null}
          {duplicate === "duplicate" || registration.status === "duplicate" ? (
            <p className="mt-3 text-xs leading-5 text-[var(--warning)]" role="status">This wallet has already registered the same content hash.</p>
          ) : null}
          {wallet.error ? <p className="mt-3 text-xs text-[var(--danger)]" role="alert">{wallet.error}</p> : null}
        </aside>
      </div>

      {statusMessage ? <StatusNotice live>{statusMessage}</StatusNotice> : null}
      {registration.error ? <StatusNotice tone="error" live>{registration.error}</StatusNotice> : null}
      {registration.status === "success" && wallet.address && content.hash && registration.transactionHash ? (
        <div className="grid gap-3">
          <RegistrationResult creator={wallet.address} hash={content.hash} transactionHash={registration.transactionHash} />
          <button
            className="btn btn-secondary justify-self-start"
            type="button"
            onClick={() => {
              content.reset();
              registration.reset();
              setAssetType(0);
              setMetadataURI("");
            }}
          >
            Register another proof
          </button>
        </div>
      ) : null}

      <p className="legal-note border-t border-[var(--line)] pt-5">
        A registration proves that this wallet submitted this hash by a BOT Chain timestamp. It does not conclusively prove legal authorship, copyright ownership, originality, identity, or exclusive rights.
      </p>
    </div>
  );
}
