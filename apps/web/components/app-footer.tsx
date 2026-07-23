import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--line)] py-10">
      <div className="page-shell grid gap-8 text-sm text-[var(--mist-muted)] md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl">
          <p className="mb-2 font-[var(--font-display)] text-lg font-bold text-[var(--mist)]">ProofBOT</p>
          <p className="leading-6">
            ProofBOT records that a wallet registered a cryptographic hash at a BOT Chain timestamp. It does not by itself establish legal authorship, copyright ownership, originality, identity, or exclusive rights.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end" aria-label="Footer navigation">
          <Link href="/privacy" className="hover:text-[var(--mist)]">Privacy</Link>
          <Link href="/legal" className="hover:text-[var(--mist)]">Legal notice</Link>
          <a href="https://scan.botchain.ai" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--mist)]">BOT Explorer ↗</a>
        </nav>
      </div>
    </footer>
  );
}
