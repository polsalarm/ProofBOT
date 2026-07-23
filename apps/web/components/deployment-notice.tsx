import { deploymentConfigured } from "@/lib/env";
import { StatusNotice } from "@/components/status-notice";

export function DeploymentNotice() {
  if (deploymentConfigured) return null;
  return (
    <StatusNotice tone="warning">
      <strong className="block text-[var(--mist)]">Registry deployment is not configured.</strong>
      <span className="mt-1 block text-xs leading-5 text-[var(--mist-muted)]">
        Hashing remains available. Set the public contract address and deployment block to enable chain reads and writes.
      </span>
    </StatusNotice>
  );
}
