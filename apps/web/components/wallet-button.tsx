"use client";

import { explorerAddressUrl } from "@/lib/explorer";
import { shortenHex } from "@/lib/proofs";
import { useWallet } from "@/hooks/use-wallet";

export function WalletButton() {
  const wallet = useWallet();

  if (!wallet.isConnected) {
    return (
      <div className="relative">
        <button className="btn btn-secondary" type="button" onClick={wallet.connectWallet} disabled={wallet.action !== "idle"}>
          {wallet.action === "connecting" ? <span className="spinner" aria-hidden="true" /> : null}
          {wallet.action === "connecting" ? "Connecting" : "Connect wallet"}
        </button>
        {wallet.error ? (
          <p className="absolute top-full right-0 z-30 mt-2 w-72 rounded-lg border border-[var(--danger)]/40 bg-[var(--ink-soft)] p-3 text-xs text-[var(--danger)] shadow-xl" role="alert">
            {wallet.error}
          </p>
        ) : null}
      </div>
    );
  }

  if (wallet.wrongNetwork) {
    return (
      <div className="relative">
        <button className="btn btn-primary" type="button" onClick={wallet.switchToBotChain} disabled={wallet.action !== "idle"}>
          {wallet.action === "switching" ? <span className="spinner" aria-hidden="true" /> : "↻"}
          {wallet.action === "switching" ? "Switching" : "Switch to BOT Chain"}
        </button>
        {wallet.error ? (
          <p className="absolute top-full right-0 z-30 mt-2 w-72 rounded-lg border border-[var(--danger)]/40 bg-[var(--ink-soft)] p-3 text-xs text-[var(--danger)] shadow-xl" role="alert">
            {wallet.error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <details className="group relative">
      <summary className="btn btn-secondary list-none cursor-pointer">
        <span className="h-2 w-2 rounded-full bg-[var(--teal)]" aria-hidden="true" />
        <span className="data-text">{wallet.address ? shortenHex(wallet.address, 8, 5) : "Connected"}</span>
      </summary>
      <div className="absolute top-full right-0 z-30 mt-2 w-64 rounded-xl border border-[var(--line-strong)] bg-[var(--ink-soft)] p-3 shadow-2xl">
        <p className="mb-1 text-[0.68rem] font-bold tracking-[0.12em] text-[var(--mist-muted)] uppercase">Connected wallet</p>
        <p className="data-text hash-wrap mb-3 text-xs text-[var(--mist)]">{wallet.address}</p>
        <div className="grid gap-2">
          {wallet.address ? (
            <a className="btn btn-secondary" href={explorerAddressUrl(wallet.address)} target="_blank" rel="noopener noreferrer">
              View in explorer ↗
            </a>
          ) : null}
          <button className="btn btn-secondary" type="button" onClick={() => wallet.disconnectWallet()}>
            Disconnect
          </button>
        </div>
      </div>
    </details>
  );
}
