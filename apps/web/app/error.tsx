"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="page-shell pt-20 text-center">
      <p className="eyebrow">Application error</p>
      <h1 className="mt-4 font-[var(--font-display)] text-4xl font-bold">This view could not be rendered.</h1>
      <p className="mt-3 text-sm text-[var(--mist-muted)]">No source content was uploaded. Retry the view, then check configuration if the problem continues.</p>
      <button className="btn btn-primary mt-7" type="button" onClick={reset}>Retry view</button>
    </section>
  );
}
