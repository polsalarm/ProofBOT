"use client";

import { CopyButton } from "@/components/copy-button";
import { HashFingerprint } from "@/components/hash-fingerprint";
import type { useContentHash } from "@/hooks/use-content-hash";
import { formatFileSize, MAX_FILE_BYTES } from "@/lib/hashing";

type ContentHashController = ReturnType<typeof useContentHash>;

export function ContentInput({
  controller,
  idPrefix,
  heading = "Choose content",
}: {
  controller: ContentHashController;
  idPrefix: string;
  heading?: string;
}) {
  const errorId = `${idPrefix}-content-error`;

  return (
    <section aria-labelledby={`${idPrefix}-content-heading`}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[var(--mist)]" id={`${idPrefix}-content-heading`}>
            {heading}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--mist-muted)]">
            Exact bytes are hashed in this browser. Nothing is uploaded.
          </p>
        </div>
        <div className="segmented min-w-44" role="tablist" aria-label="Content input mode">
          <button
            type="button"
            role="tab"
            aria-selected={controller.mode === "text"}
            onClick={() => controller.setMode("text")}
          >
            Text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={controller.mode === "file"}
            onClick={() => controller.setMode("file")}
          >
            File
          </button>
        </div>
      </div>

      {controller.mode === "text" ? (
        <div>
          <label className="sr-only" htmlFor={`${idPrefix}-text`}>
            Original text
          </label>
          <textarea
            className="field-input min-h-40 resize-y data-text text-sm leading-6"
            id={`${idPrefix}-text`}
            value={controller.text}
            onChange={(event) => controller.setText(event.target.value)}
            placeholder="Paste the exact prompt, model card, or agent output…"
            spellCheck={false}
            aria-describedby={controller.error ? errorId : `${idPrefix}-text-help`}
            aria-invalid={controller.error ? true : undefined}
          />
          <p className="mt-2 text-xs text-[var(--mist-muted)]" id={`${idPrefix}-text-help`}>
            Spaces, line breaks, capitalization, and Unicode are preserved exactly.
          </p>
        </div>
      ) : (
        <div>
          <label
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line-strong)] bg-black/10 px-5 py-8 text-center transition hover:border-[var(--teal)]/60 hover:bg-[var(--teal)]/4"
            htmlFor={`${idPrefix}-file`}
          >
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-[var(--line-strong)] text-xl" aria-hidden="true">
              ↥
            </span>
            <span className="font-bold text-[var(--mist)]">
              {controller.file ? controller.file.name : "Choose a local file"}
            </span>
            <span className="mt-1 text-xs text-[var(--mist-muted)]">
              {controller.file
                ? `${formatFileSize(controller.file.size)} · exact file bytes selected`
                : `Up to ${formatFileSize(MAX_FILE_BYTES)} · the file never leaves this device`}
            </span>
          </label>
          <input
            className="sr-only"
            id={`${idPrefix}-file`}
            type="file"
            onChange={(event) => void controller.setSelectedFile(event.target.files?.[0])}
            aria-describedby={controller.error ? errorId : undefined}
            aria-invalid={controller.error ? true : undefined}
          />
        </div>
      )}

      {controller.error ? (
        <p className="mt-2 text-sm text-[var(--danger)]" id={errorId} role="alert">
          {controller.error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 rounded-xl border border-[var(--line)] bg-black/12 p-4 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--mist-muted)] uppercase">
              Calculated hash
            </p>
            {controller.hash ? (
              <CopyButton value={controller.hash} label="Copy hash" className="btn btn-secondary min-h-9 px-3 py-2 text-xs" />
            ) : null}
          </div>
          <div className="data-text hash-wrap min-h-13 text-sm leading-6 text-[var(--mist)]" aria-live="polite">
            {controller.status === "hashing" ? "Calculating the hash locally…" : null}
            {controller.hash ?? (controller.status === "idle" ? "Your 0x-prefixed Keccak-256 hash will appear here." : null)}
          </div>
          {controller.hash ? (
            <p className="mt-2 text-xs text-[var(--teal)]">Ready. Only this hash will be sent on-chain.</p>
          ) : null}
        </div>
        <div className="mx-auto w-24 sm:w-28">
          <HashFingerprint hash={controller.hash} label={controller.hash ? "Fingerprint derived from the calculated hash" : "Placeholder hash fingerprint"} />
        </div>
      </div>
    </section>
  );
}
