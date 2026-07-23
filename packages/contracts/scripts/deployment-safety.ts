export const DEPLOYMENT_PROFILES = {
  botchainMainnet: {
    chainId: 677,
    explorerUrl: "https://scan.botchain.ai",
    isMainnet: true,
    networkLabel: "BOT Chain Mainnet",
    recordNetwork: "botchain-mainnet",
    rpcEnvName: "BOTCHAIN_MAINNET_RPC_URL",
    rpcUrl: "https://rpc.botchain.ai",
  },
  botchainTestnet: {
    chainId: 968,
    explorerUrl: "https://scan.bohr.life",
    isMainnet: false,
    networkLabel: "BOT Chain Testnet",
    recordNetwork: "botchain-testnet",
    rpcEnvName: "BOTCHAIN_TESTNET_RPC_URL",
    rpcUrl: "https://rpc.bohr.life",
  },
} as const;

export type DeploymentNetworkName = keyof typeof DEPLOYMENT_PROFILES;
export type DeploymentProfile =
  (typeof DEPLOYMENT_PROFILES)[DeploymentNetworkName];

export interface DeploymentSafetyInput {
  actualChainId: number;
  confirmation: string | undefined;
  configuredTestnetChainId?: string;
  privateKey: string | undefined;
  profile: DeploymentProfile;
}

const SECP256K1_ORDER =
  0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

export function getDeploymentProfile(networkName: string): DeploymentProfile {
  if (!(networkName in DEPLOYMENT_PROFILES)) {
    throw new Error(
      `Unsupported deployment network "${networkName}". Use botchainTestnet or botchainMainnet.`,
    );
  }

  return DEPLOYMENT_PROFILES[networkName as DeploymentNetworkName];
}

export function isValidPrivateKey(value: string | undefined): value is string {
  if (value === undefined || !/^0x[0-9a-fA-F]{64}$/.test(value)) {
    return false;
  }

  const scalar = BigInt(value);
  return scalar > 0n && scalar < SECP256K1_ORDER;
}

export function parseRpcChainId(value: unknown): number {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]+$/.test(value)) {
    throw new Error("RPC returned an invalid eth_chainId value.");
  }

  const chainId = Number(BigInt(value));
  if (!Number.isSafeInteger(chainId) || chainId <= 0) {
    throw new Error("RPC returned an out-of-range eth_chainId value.");
  }

  return chainId;
}

/**
 * Returns the non-sensitive origin of an HTTP(S) RPC endpoint for logs.
 * User info, paths, query values, and fragments can contain provider keys, so
 * none of those components are ever included in the display value.
 */
export function sanitizeRpcUrlForDisplay(value: string): string {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "[redacted RPC endpoint]";
    }

    return parsed.origin;
  } catch {
    // Never echo malformed input: it may itself be an API key or credential.
    return "[redacted RPC endpoint]";
  }
}

export function assertDeploymentSafety({
  actualChainId,
  confirmation,
  configuredTestnetChainId,
  privateKey,
  profile,
}: DeploymentSafetyInput): void {
  if (actualChainId !== profile.chainId) {
    throw new Error(
      `RPC chain ID mismatch: expected ${profile.chainId}, received ${actualChainId}. Deployment refused.`,
    );
  }

  if (
    !profile.isMainnet &&
    configuredTestnetChainId !== undefined &&
    configuredTestnetChainId !== ""
  ) {
    if (!/^\d+$/.test(configuredTestnetChainId)) {
      throw new Error("BOTCHAIN_TESTNET_CHAIN_ID must be a decimal integer.");
    }
    if (Number(configuredTestnetChainId) !== profile.chainId) {
      throw new Error(
        `BOTCHAIN_TESTNET_CHAIN_ID must equal the verified chain ID ${profile.chainId}.`,
      );
    }
  }

  if (profile.isMainnet && confirmation !== "true") {
    throw new Error(
      "Mainnet deployment refused: set CONFIRM_MAINNET_DEPLOYMENT=true explicitly.",
    );
  }

  if (!isValidPrivateKey(privateKey)) {
    throw new Error(
      "Deployment refused: DEPLOYER_PRIVATE_KEY must be a 0x-prefixed 32-byte private key.",
    );
  }
}

export function assertDeploymentRecordWriteAllowed(
  profile: DeploymentProfile,
  recordExists: boolean,
  overwrite: boolean,
): void {
  if (profile.isMainnet && recordExists && !overwrite) {
    throw new Error(
      "Mainnet deployment record already exists. Deployment refused; pass --overwrite only after reviewing the existing record.",
    );
  }
}

export function resolveConfirmations(
  configuredValue: string | undefined,
  profile: DeploymentProfile,
): number {
  if (configuredValue === undefined || configuredValue === "") {
    return profile.isMainnet ? 2 : 1;
  }
  if (!/^\d+$/.test(configuredValue)) {
    throw new Error("DEPLOYMENT_CONFIRMATIONS must be a positive integer.");
  }

  const confirmations = Number(configuredValue);
  if (!Number.isSafeInteger(confirmations) || confirmations < 1) {
    throw new Error("DEPLOYMENT_CONFIRMATIONS must be a positive integer.");
  }

  return confirmations;
}
