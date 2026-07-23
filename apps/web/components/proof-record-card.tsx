"use client";

import type { Hash } from "viem";

import { CopyButton } from "@/components/copy-button";
import { HashFingerprint } from "@/components/hash-fingerprint";
import { ShareButton } from "@/components/share-button";
import { calculateProofId, proofPath, requireContractAddress } from "@/lib/contract";
import { BOT_CHAIN_ID } from "@/lib/chain";
import { explorerAddressUrl, explorerTransactionUrl } from "@/lib/explorer";
import { assetTypeLabel, formatTimestamp, type ProofRecord } from "@/lib/proofs";
import { safeMetadataHref } from "@/lib/validation";

export function ProofRecordCard({
  record,
  contentHash,
  transactionHash,
}: {
  record: ProofRecord;
  contentHash: Hash;
  transactionHash?: Hash;
}) {
  const proofId = calculateProofId(record.creator, contentHash);
  const relativePath = proofPath(record.creator, contentHash);
  const metadataHref = safeMetadataHref(record.metadataURI);
  const contractAddress = requireContractAddress();

  return (
    <article className="surface-paper overflow-hidden" aria-labelledby="verified-proof-title">
      <div className="grid gap-6 border-b border-[#dce8e5] bg-[#edf7f3] p-5 sm:grid-cols-[1fr_7rem] sm:items-center md:p-7">
        <div>
          <p className="data-text mb-2 text-[0.68rem] font-bold tracking-[0.16em] text-[var(--teal-deep)] uppercase">
            On-chain record · Chain {BOT_CHAIN_ID}
          </p>
          <h3 className="font-[var(--font-display)] text-2xl font-bold text-[#10262b]" id="verified-proof-title">
            Verified on BOT Chain
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#506b6c]">Matching wallet-bound registration found in the ProofBOT registry.</p>
        </div>
        <HashFingerprint hash={contentHash} label="Fingerprint derived from this proof hash" />
      </div>
      <dl className="px-5 py-3 md:px-7">
        <div className="receipt-row">
          <dt className="receipt-term">Creator</dt>
          <dd className="receipt-value">
            <a className="data-text hash-wrap underline decoration-[#9bb5b4] underline-offset-4 hover:decoration-[#187d73]" href={explorerAddressUrl(record.creator)} target="_blank" rel="noopener noreferrer">
              {record.creator}
            </a>
          </dd>
        </div>
        <div className="receipt-row">
          <dt className="receipt-term">Content hash</dt>
          <dd className="receipt-value flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="data-text hash-wrap min-w-0">{contentHash}</span>
            <CopyButton value={contentHash} label="Copy" className="btn border border-[#cadbd8] bg-white min-h-9 shrink-0 px-3 py-2 text-xs text-[#29434a]" />
          </dd>
        </div>
        <div className="receipt-row">
          <dt className="receipt-term">Proof ID</dt>
          <dd className="receipt-value data-text hash-wrap">{proofId}</dd>
        </div>
        <div className="receipt-row">
          <dt className="receipt-term">Registered</dt>
          <dd className="receipt-value">{formatTimestamp(record.timestamp)} UTC</dd>
        </div>
        <div className="receipt-row">
          <dt className="receipt-term">Category</dt>
          <dd className="receipt-value">{assetTypeLabel(record.assetType)}</dd>
        </div>
        <div className="receipt-row">
          <dt className="receipt-term">Public metadata</dt>
          <dd className="receipt-value min-w-0">
            {record.metadataURI ? (
              metadataHref ? (
                <a className="hash-wrap underline decoration-[#9bb5b4] underline-offset-4 hover:decoration-[#187d73]" href={metadataHref} target="_blank" rel="noopener noreferrer">
                  {record.metadataURI} ↗
                </a>
              ) : (
                <span className="data-text hash-wrap">{record.metadataURI}</span>
              )
            ) : (
              <span className="text-[#738588]">None supplied</span>
            )}
          </dd>
        </div>
        <div className="receipt-row">
          <dt className="receipt-term">Registry</dt>
          <dd className="receipt-value data-text hash-wrap">
            <a className="underline decoration-[#9bb5b4] underline-offset-4 hover:decoration-[#187d73]" href={explorerAddressUrl(contractAddress)} target="_blank" rel="noopener noreferrer">
              {contractAddress}
            </a>
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2 border-t border-[#dce8e5] px-5 py-5 md:px-7">
        <ShareButton url={relativePath} />
        {transactionHash ? (
          <a className="btn border border-[#cadbd8] bg-white text-[#29434a]" href={explorerTransactionUrl(transactionHash)} target="_blank" rel="noopener noreferrer">
            View transaction ↗
          </a>
        ) : (
          <a className="btn border border-[#cadbd8] bg-white text-[#29434a]" href={explorerAddressUrl(contractAddress)} target="_blank" rel="noopener noreferrer">
            View registry ↗
          </a>
        )}
      </div>
    </article>
  );
}
