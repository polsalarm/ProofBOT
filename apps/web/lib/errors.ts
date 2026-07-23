type ErrorLike = {
  code?: number;
  name?: string;
  message?: string;
  shortMessage?: string;
  cause?: unknown;
};

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === "object" && error !== null ? (error as ErrorLike) : {};
}

export function isUserRejectedRequest(error: unknown) {
  const candidate = asErrorLike(error);
  const combined = `${candidate.name ?? ""} ${candidate.message ?? ""} ${candidate.shortMessage ?? ""}`;
  return candidate.code === 4001 || /user rejected|user denied|rejected the request/i.test(combined);
}

export function isUnknownChainError(error: unknown) {
  const candidate = asErrorLike(error);
  const combined = `${candidate.name ?? ""} ${candidate.message ?? ""} ${candidate.shortMessage ?? ""}`;
  return candidate.code === 4902 || /unknown chain|unrecognized chain|not added/i.test(combined);
}

export function isDuplicateProofError(error: unknown) {
  const candidate = asErrorLike(error);
  const combined = `${candidate.name ?? ""} ${candidate.message ?? ""} ${candidate.shortMessage ?? ""}`;
  return /AlreadyRegistered|already registered/i.test(combined);
}

export function toUserError(error: unknown, fallback = "The request could not be completed.") {
  const candidate = asErrorLike(error);
  const combined = `${candidate.name ?? ""} ${candidate.message ?? ""} ${candidate.shortMessage ?? ""}`;

  if (isUserRejectedRequest(error)) return "The request was rejected in your wallet.";
  if (isDuplicateProofError(error)) return "This wallet has already registered the same content hash.";
  if (/provider not found|no provider|window\.ethereum|connector not found/i.test(combined)) {
    return "No injected EVM wallet was found. Install a browser wallet, then reload ProofBOT.";
  }
  if (/insufficient funds|exceeds the balance/i.test(combined)) {
    return "Your wallet does not have enough BOT to pay for transaction gas.";
  }
  if (/transaction replaced|replacement transaction/i.test(combined)) {
    return "The transaction was replaced in your wallet. Check the replacement transaction in the explorer.";
  }
  if (/transaction dropped|transaction not found/i.test(combined)) {
    return "The submitted transaction is no longer available. Check your wallet activity before retrying.";
  }
  if (/timeout|timed out/i.test(combined)) {
    return "The receipt was not confirmed in time. Check the transaction in the explorer before retrying.";
  }
  if (/revert|execution reverted|call exception/i.test(combined)) {
    return "The contract rejected the transaction during simulation or execution.";
  }
  if (/failed to fetch|network error|rpc|http request failed/i.test(combined)) {
    return "BOT Chain could not be reached. Check the configured RPC and try again.";
  }
  return fallback;
}
