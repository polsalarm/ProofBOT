import type { ReactNode } from "react";

export function StatusNotice({
  tone = "info",
  children,
  live = false,
}: {
  tone?: "info" | "success" | "warning" | "error";
  children: ReactNode;
  live?: boolean;
}) {
  return (
    <div
      className="status-notice"
      data-tone={tone}
      role={tone === "error" ? "alert" : undefined}
      aria-live={live ? "polite" : undefined}
    >
      <span className="status-dot" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
