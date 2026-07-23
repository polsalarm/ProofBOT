"use client";

import { useState } from "react";

export function ShareButton({ url, title = "ProofBOT proof" }: { url: string; title?: string }) {
  const [message, setMessage] = useState("Share proof");

  return (
    <button
      className="btn btn-primary"
      type="button"
      onClick={async () => {
        const resolvedUrl = new URL(url, window.location.origin).toString();
        if (navigator.share) {
          try {
            await navigator.share({ title, url: resolvedUrl });
            setMessage("Shared");
            return;
          } catch {
            return;
          }
        }
        await navigator.clipboard.writeText(resolvedUrl);
        setMessage("Link copied");
      }}
    >
      ↗ {message}
    </button>
  );
}
