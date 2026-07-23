import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "How ProofBOT creates local fingerprints and wallet-bound BOT Chain timestamps.",
};

export default function AboutPage() {
  return (
    <div className="page-shell pt-14 md:pt-20">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div>
          <p className="eyebrow">About ProofBOT</p>
          <h1 className="mt-5 max-w-4xl font-[var(--font-display)] text-4xl leading-tight font-bold tracking-[-0.035em] md:text-6xl">A small, inspectable provenance primitive.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--mist-muted)]">ProofBOT answers one narrow question: did this wallet register this exact content hash on BOT Chain, and when?</p>
        </div>
        <aside className="surface p-6">
          <p className="data-text text-xs font-bold tracking-[0.12em] text-[var(--copper)] uppercase">Scope, not a claim</p>
          <p className="mt-4 text-sm leading-6 text-[var(--mist-muted)]">The record is useful evidence of a timestamped wallet action. It is not a legal ruling about authorship, identity, ownership, originality, or exclusive rights.</p>
        </aside>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3" aria-label="How it works">
        {[
          ["1 · Hash locally", "Text is encoded exactly as UTF-8. Files are read as their original bytes. Keccak-256 runs entirely in the browser."],
          ["2 · Register once", "The connected wallet submits the 32-byte hash, asset category, and optional public metadata URL to the immutable registry."],
          ["3 · Verify independently", "A verifier repeats the local hash and performs a public, read-only lookup using the creator wallet and digest."],
        ].map(([title, copy]) => (
          <article className="surface p-6" key={title}><h2 className="font-[var(--font-display)] text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-6 text-[var(--mist-muted)]">{copy}</p></article>
        ))}
      </section>

      <section className="surface mt-10 grid gap-8 p-7 md:grid-cols-2 md:p-10">
        <div><h2 className="font-[var(--font-display)] text-2xl font-bold">What goes on-chain</h2><ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--mist-muted)]"><li>• 32-byte content hash</li><li>• Registering wallet address</li><li>• Asset category</li><li>• Optional public metadata URL</li><li>• BOT Chain timestamp</li></ul></div>
        <div><h2 className="font-[var(--font-display)] text-2xl font-bold">What stays local</h2><ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--mist-muted)]"><li>• Original prompts and text</li><li>• Dataset and model files</li><li>• File names and local paths</li><li>• Any content bytes selected for verification</li></ul></div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3"><Link className="btn btn-primary" href="/?tab=register">Register a proof</Link><Link className="btn btn-secondary" href="/?tab=verify">Verify a proof</Link></div>
    </div>
  );
}
