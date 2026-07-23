"use client";

import { useState } from "react";

import { HashFingerprint } from "@/components/hash-fingerprint";
import { RegisterPanel } from "@/components/register-panel";
import { VerifyPanel } from "@/components/verify-panel";
import { botChain } from "@/lib/chain";

type HomeTab = "register" | "verify";

export function HomeWorkbench({ initialTab = "register" }: { initialTab?: HomeTab }) {
  const [tab, setTab] = useState<HomeTab>(initialTab);

  return (
    <>
      <section className="page-shell grid gap-10 pt-14 pb-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-center lg:pt-20 lg:pb-16">
        <div>
          <p className="eyebrow">Local-first provenance</p>
          <h1 className="mt-5 max-w-4xl font-[var(--font-display)] text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.92] font-bold tracking-[-0.045em] text-[var(--paper)]">
            Prove when your <span className="text-[var(--copper)]">AI asset</span> existed.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-[#b5c5c6] md:text-lg">
            Hash prompts, datasets, model cards, and agent outputs locally, then timestamp the fingerprint on BOT Chain.
          </p>
          <div className="mt-8 grid max-w-2xl grid-cols-3 border-y border-[var(--line)] py-4">
            {[
              ["Local", "Content stays here"],
              ["Keccak-256", "Exact-byte digest"],
              [`${botChain.nativeCurrency.symbol} · ${botChain.id}`, "On-chain timestamp"],
            ].map(([label, detail]) => (
              <div className="border-l border-[var(--line)] px-3 first:border-l-0 first:pl-0" key={label}>
                <p className="data-text text-[0.65rem] font-bold tracking-[0.08em] text-[var(--teal)] uppercase sm:text-xs">{label}</p>
                <p className="mt-1 text-[0.68rem] leading-4 text-[var(--mist-muted)] sm:text-xs">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-8 -z-10 rounded-full bg-[var(--teal)]/6 blur-3xl" />
          <HashFingerprint label="A sample 64-cell cryptographic fingerprint" />
          <div className="data-text absolute right-3 bottom-3 left-3 flex justify-between rounded-lg border border-white/10 bg-[rgba(4,12,24,0.82)] px-3 py-2 text-[0.58rem] tracking-[0.1em] text-[var(--mist-muted)] uppercase backdrop-blur">
            <span>64 nibbles</span><span>1 exact digest</span>
          </div>
        </div>
      </section>

      <section className="page-shell" aria-labelledby="workbench-title">
        <div className="surface overflow-hidden">
          <div className="grid border-b border-[var(--line)] md:grid-cols-[1fr_auto] md:items-end">
            <div className="p-5 md:p-8">
              <p className="eyebrow">Proof workbench</p>
              <h2 className="mt-3 font-[var(--font-display)] text-2xl font-bold md:text-3xl" id="workbench-title">
                {tab === "register" ? "Register a proof" : "Verify a proof"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mist-muted)]">
                {tab === "register"
                  ? "Create a local fingerprint, check for duplicates, simulate the call, and register it in one transaction."
                  : "Recalculate a fingerprint locally and compare it with the wallet-bound registry record."}
              </p>
            </div>
            <div className="segmented m-5 md:m-8 md:min-w-64" role="tablist" aria-label="Proof workbench mode">
              <button type="button" role="tab" aria-selected={tab === "register"} onClick={() => setTab("register")}>Register</button>
              <button type="button" role="tab" aria-selected={tab === "verify"} onClick={() => setTab("verify")}>Verify</button>
            </div>
          </div>
          <div className="p-5 md:p-8 lg:p-10">
            {tab === "register" ? <RegisterPanel /> : <VerifyPanel />}
          </div>
        </div>
      </section>

      <section className="page-shell mt-20 grid gap-4 md:grid-cols-3" aria-label="How ProofBOT works">
        {[
          ["Local", "Your original text or file is converted into an exact Keccak-256 fingerprint inside this browser."],
          ["Stamped", "Your wallet registers only the hash, category, and optional public metadata URL on BOT Chain."],
          ["Verifiable", "Anyone with the original content and creator wallet can independently reproduce the lookup."],
        ].map(([title, copy], index) => (
          <article className="rounded-xl border border-[var(--line)] bg-white/[0.025] p-6" key={title}>
            <p className="data-text text-xs text-[var(--copper)]">0{index + 1}</p>
            <h2 className="mt-4 font-[var(--font-display)] text-xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--mist-muted)]">{copy}</p>
          </article>
        ))}
      </section>
    </>
  );
}
