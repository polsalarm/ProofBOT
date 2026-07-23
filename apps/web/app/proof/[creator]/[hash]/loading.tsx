export default function ProofLoading() {
  return (
    <div className="page-shell pt-16">
      <div className="surface grid min-h-72 place-items-center p-8">
        <div className="text-center">
          <span className="spinner mx-auto mb-4 block text-[var(--teal)]" aria-hidden="true" />
          <p className="font-bold">Preparing proof record…</p>
        </div>
      </div>
    </div>
  );
}
