import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", description: "ProofBOT's local-first privacy model." };

export default function PrivacyPage() {
  return (
    <article className="page-shell max-w-4xl pt-14 md:pt-20">
      <p className="eyebrow">Privacy model</p>
      <h1 className="mt-5 font-[var(--font-display)] text-4xl font-bold tracking-[-0.03em] md:text-5xl">Your source content stays on your device.</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--mist-muted)]">ProofBOT has no application backend, upload service, user account, or content database. Text and file bytes are hashed locally in the browser.</p>
      <div className="surface mt-10 grid gap-8 p-7 md:p-10">
        <section><h2 className="text-xl font-bold">Public blockchain data</h2><p className="mt-3 text-sm leading-7 text-[var(--mist-muted)]">A registration publishes the hash, creator wallet, asset category, optional metadata URL, and timestamp. Blockchain records are public and effectively permanent. Do not include confidential information in metadata.</p></section>
        <section><h2 className="text-xl font-bold">Hashes can still disclose clues</h2><p className="mt-3 text-sm leading-7 text-[var(--mist-muted)]">A hash is not encryption. If the original content is short, common, or easily guessed, someone can hash guesses and compare them with the public value.</p></section>
        <section><h2 className="text-xl font-bold">Wallet and RPC visibility</h2><p className="mt-3 text-sm leading-7 text-[var(--mist-muted)]">Your wallet provider and configured BOT Chain RPC process blockchain requests and may observe network metadata under their own policies. ProofBOT adds no content analytics or tracking.</p></section>
        <section><h2 className="text-xl font-bold">Local history cache</h2><p className="mt-3 text-sm leading-7 text-[var(--mist-muted)]">My Proofs may keep up to 100 decoded proof events in session storage as a performance aid. It never treats that cache as the source of truth and refreshes from the chain.</p></section>
      </div>
    </article>
  );
}
