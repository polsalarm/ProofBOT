import type { Metadata } from "next";

export const metadata: Metadata = { title: "Legal & provenance notice", description: "The evidentiary limits of a ProofBOT registration." };

export default function LegalPage() {
  return (
    <article className="page-shell max-w-4xl pt-14 md:pt-20">
      <p className="eyebrow">Provenance notice</p>
      <h1 className="mt-5 font-[var(--font-display)] text-4xl font-bold tracking-[-0.03em] md:text-5xl">A timestamped wallet action, with clear limits.</h1>
      <div className="surface mt-10 grid gap-8 p-7 text-sm leading-7 text-[var(--mist-muted)] md:p-10">
        <section><h2 className="text-xl font-bold text-[var(--mist)]">What the record supports</h2><p className="mt-3">The registry can show that a particular wallet registered a particular 32-byte hash by a BOT Chain block timestamp. Anyone can independently reproduce the content hash and query the same public contract.</p></section>
        <section><h2 className="text-xl font-bold text-[var(--mist)]">What the record does not prove</h2><p className="mt-3">It does not by itself establish the natural person or organization controlling a wallet; legal authorship or copyright ownership; originality; first creation; complete custody history; or exclusive rights.</p></section>
        <section><h2 className="text-xl font-bold text-[var(--mist)]">Metadata is a reference, not verification</h2><p className="mt-3">Optional metadata URLs are user-supplied public references. ProofBOT validates only the scheme and byte length, does not fetch or endorse their contents, and does not treat them as authentic.</p></section>
        <section><h2 className="text-xl font-bold text-[var(--mist)]">Independent evaluation</h2><p className="mt-3">The evidentiary or legal weight of a registration depends on context, jurisdiction, wallet-control evidence, and other records. Obtain qualified advice for legal decisions.</p></section>
      </div>
    </article>
  );
}
