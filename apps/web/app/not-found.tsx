import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-shell pt-20 text-center">
      <p className="data-text text-xs tracking-[0.16em] text-[var(--copper)] uppercase">404 · Record path missing</p>
      <h1 className="mt-4 font-[var(--font-display)] text-4xl font-bold">This page does not exist.</h1>
      <p className="mt-3 text-sm text-[var(--mist-muted)]">Return to the workbench to register or verify a proof.</p>
      <Link className="btn btn-primary mt-7" href="/">Open workbench</Link>
    </section>
  );
}
