import Link from "next/link";

import { WalletButton } from "@/components/wallet-button";

const navigation = [
  { href: "/?tab=register", label: "Register" },
  { href: "/?tab=verify", label: "Verify" },
  { href: "/my-proofs", label: "My Proofs" },
  { href: "/about", label: "About" },
];

export function AppHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[rgba(10,18,33,0.78)] backdrop-blur-xl">
      <div className="page-shell flex min-h-18 items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-3 rounded-md" aria-label="ProofBOT home">
          <span className="grid h-9 w-9 grid-cols-3 gap-1 rounded-lg border border-[var(--line-strong)] p-1.5" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
              <span className={cell === 4 ? "bg-[var(--copper)]" : cell % 2 ? "bg-[var(--blue)]/70" : "bg-[var(--teal)]/60"} key={cell} />
            ))}
          </span>
          <span>
            <span className="block font-[var(--font-display)] text-lg leading-none font-bold tracking-[0.02em]">ProofBOT</span>
            <span className="data-text mt-1 hidden text-[0.58rem] tracking-[0.16em] text-[var(--mist-muted)] uppercase sm:block">Hash · Stamp · Verify</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link className="rounded-md px-3 py-2 text-sm font-semibold text-[var(--mist-muted)] transition hover:bg-white/5 hover:text-[var(--mist)]" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <WalletButton />
      </div>
      <nav className="page-shell flex items-center justify-between border-t border-[var(--line)] lg:hidden" aria-label="Mobile navigation">
        {navigation.map((item) => (
          <Link className="min-w-0 flex-1 px-1 py-2.5 text-center text-xs font-bold text-[var(--mist-muted)] hover:text-[var(--mist)]" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
