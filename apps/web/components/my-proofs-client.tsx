"use client";

import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { DeploymentNotice } from "@/components/deployment-notice";
import { StatusNotice } from "@/components/status-notice";
import { useMyProofs } from "@/hooks/use-my-proofs";
import { useWallet } from "@/hooks/use-wallet";
import { proofPath } from "@/lib/contract";
import { explorerTransactionUrl } from "@/lib/explorer";
import { assetTypeLabel, formatTimestamp, shortenHex } from "@/lib/proofs";

export function MyProofsClient() {
  const wallet = useWallet();
  const history = useMyProofs(wallet.address);

  if (!wallet.isConnected || !wallet.address) {
    return (
      <div className="surface mx-auto max-w-2xl p-7 text-center md:p-10">
        <p className="eyebrow">Wallet-bound history</p>
        <h2 className="mt-4 font-[var(--font-display)] text-3xl font-bold">Connect the creator wallet.</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--mist-muted)]">
          My Proofs reads creator-filtered registration events directly from BOT Chain. No account or profile is created.
        </p>
        <button className="btn btn-primary mt-7" type="button" onClick={wallet.connectWallet} disabled={wallet.action !== "idle"}>
          {wallet.action === "connecting" ? <span className="spinner" aria-hidden="true" /> : null}
          Connect wallet
        </button>
        {wallet.error ? <p className="mt-4 text-sm text-[var(--danger)]" role="alert">{wallet.error}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <DeploymentNotice />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white/[0.025] p-4">
        <div>
          <p className="text-xs text-[var(--mist-muted)]">Creator filter</p>
          <p className="data-text hash-wrap mt-1 text-sm">{wallet.address}</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => void history.retry()} disabled={history.status === "loading"}>
          {history.status === "loading" ? <span className="spinner" aria-hidden="true" /> : "↻"}
          {history.status === "loading" ? "Refreshing" : "Refresh from chain"}
        </button>
      </div>

      {history.status === "error" ? (
        <StatusNotice tone="error">
          <strong className="block text-[var(--mist)]">Proof history is unavailable.</strong>
          <span className="mt-1 block text-xs leading-5 text-[var(--mist-muted)]">{history.error}</span>
          <button className="mt-3 text-xs font-bold text-[var(--blue)] underline underline-offset-4" type="button" onClick={() => void history.retry()}>Retry query</button>
        </StatusNotice>
      ) : null}

      {history.status === "loading" && history.records.length === 0 ? (
        <div className="surface grid min-h-52 place-items-center p-8 text-center" aria-live="polite">
          <div>
            <span className="spinner mx-auto mb-4 block text-[var(--teal)]" aria-hidden="true" />
            <p className="font-bold">Scanning creator-filtered logs…</p>
            <p className="mt-2 text-xs text-[var(--mist-muted)]">Ranges are queried in safe chunks from the deployment block.</p>
          </div>
        </div>
      ) : null}

      {history.status === "success" && history.records.length === 0 ? (
        <div className="surface p-8 text-center md:p-12">
          <p className="data-text text-xs tracking-[0.12em] text-[var(--teal)] uppercase">No records yet</p>
          <h2 className="mt-3 font-[var(--font-display)] text-2xl font-bold">This wallet has no registered proofs.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--mist-muted)]">Register a text or file fingerprint, then return here to see the confirmed event.</p>
          <Link className="btn btn-primary mt-6" href="/?tab=register">Register the first proof</Link>
        </div>
      ) : null}

      {history.records.length > 0 ? (
        <ol className="grid gap-3" aria-label="Registered proofs">
          {history.records.map((record) => (
            <li className="rounded-xl border border-[var(--line)] bg-[var(--ink-raised)] p-5 transition hover:border-[var(--line-strong)]" key={`${record.transactionHash}:${record.logIndex}`}>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--teal)]/30 bg-[var(--teal)]/8 px-2.5 py-1 text-[0.68rem] font-bold text-[var(--teal)]">{assetTypeLabel(record.assetType)}</span>
                    {record.metadataURI ? <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[0.68rem] text-[var(--mist-muted)]">Public metadata</span> : null}
                    <span className="text-xs text-[var(--mist-muted)]">{formatTimestamp(record.timestamp)} UTC</span>
                  </div>
                  <p className="data-text hash-wrap text-sm text-[var(--mist)]" title={record.contentHash}>{shortenHex(record.contentHash, 18, 12)}</p>
                  <p className="data-text mt-2 text-[0.68rem] text-[var(--mist-muted)]">Block {record.blockNumber.toString()} · log {record.logIndex}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <CopyButton value={record.contentHash} label="Copy hash" className="btn btn-secondary min-h-10 px-3 py-2 text-xs" />
                  <a className="btn btn-secondary min-h-10 px-3 py-2 text-xs" href={explorerTransactionUrl(record.transactionHash)} target="_blank" rel="noopener noreferrer">Transaction ↗</a>
                  <Link className="btn btn-primary min-h-10 px-3 py-2 text-xs" href={proofPath(record.creator, record.contentHash)}>Open proof</Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <p className="legal-note">
        This list is reconstructed from on-chain ProofRegistered events. A small session cache may make repeat visits faster, but BOT Chain remains the source of truth.
      </p>
    </div>
  );
}
