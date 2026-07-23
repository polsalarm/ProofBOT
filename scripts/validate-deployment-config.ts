import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

type NetworkName = "mainnet" | "testnet";

type NetworkConfig = {
  label: string;
  expectedChainId: number;
  rpcEnvironmentVariable: string;
  confirmationRequired: boolean;
};

type RpcFetch = (input: URL, init: RequestInit) => Promise<Response>;

const NETWORKS: Record<NetworkName, NetworkConfig> = {
  mainnet: {
    label: "BOT Chain mainnet",
    expectedChainId: 677,
    rpcEnvironmentVariable: "BOTCHAIN_MAINNET_RPC_URL",
    confirmationRequired: true,
  },
  testnet: {
    label: "BOT Chain testnet",
    expectedChainId: 968,
    rpcEnvironmentVariable: "BOTCHAIN_TESTNET_RPC_URL",
    confirmationRequired: false,
  },
};

const PRIVATE_KEY_PATTERN = /^0x[0-9a-fA-F]{64}$/;
const SECP256K1_ORDER = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
);
const CHAIN_ID_PATTERN = /^0x[0-9a-fA-F]+$/;
const RPC_TIMEOUT_MS = 12_000;

function printUsage(): void {
  console.log(`Usage: pnpm validate:deployment -- --network <mainnet|testnet>

This command validates a deployment environment and independently queries
eth_chainId. It never signs, sends, or simulates a transaction.

Environment files default to packages/contracts/.env. Set PROOFBOT_ENV_FILE to
load a different file.`);
}

export function parseNetwork(arguments_: string[]): NetworkName | undefined {
  if (arguments_.includes("--help") || arguments_.includes("-h")) {
    return undefined;
  }

  const equalsArgument = arguments_.find((argument) =>
    argument.startsWith("--network="),
  );
  const networkIndex = arguments_.indexOf("--network");
  const value = equalsArgument?.slice("--network=".length) ??
    (networkIndex >= 0 ? arguments_[networkIndex + 1] : undefined);

  if (value !== "mainnet" && value !== "testnet") {
    throw new Error("Pass --network mainnet or --network testnet explicitly.");
  }

  const accepted = new Set([
    "--network",
    value,
    `--network=${value}`,
  ]);
  const unexpected = arguments_.find((argument) => !accepted.has(argument));
  if (unexpected) {
    throw new Error(`Unknown argument: ${unexpected}`);
  }

  return value;
}

function loadContractEnvironment(): void {
  const configuredPath = process.env.PROOFBOT_ENV_FILE ??
    "packages/contracts/.env";
  const environmentPath = resolve(configuredPath);

  if (existsSync(environmentPath)) {
    loadEnvFile(environmentPath);
  }
}

export function assertNoPublicSecrets(
  environment: NodeJS.ProcessEnv = process.env,
): void {
  const exposedNames = Object.entries(environment)
    .filter(([name, value]) =>
      Boolean(value) &&
      name.startsWith("NEXT_PUBLIC_") &&
      /(PRIVATE|SECRET|DEPLOYER|API_KEY)/i.test(name),
    )
    .map(([name]) => name);

  if (exposedNames.length > 0) {
    throw new Error(
      `Potential secret variables must not be public: ${exposedNames.join(", ")}`,
    );
  }
}

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}.`);
  }

  return value;
}

export function validateRpcUrl(rawValue: string, variableName: string): URL {
  let url: URL;

  try {
    url = new URL(rawValue);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${variableName} must use HTTPS.`);
  }

  if (url.username || url.password) {
    throw new Error(
      `${variableName} must not place credentials in URL user-info fields.`,
    );
  }

  return url;
}

export function validatePrivateKey(privateKey: string): void {
  if (!PRIVATE_KEY_PATTERN.test(privateKey)) {
    throw new Error(
      "DEPLOYER_PRIVATE_KEY must be a valid non-zero 0x-prefixed 32-byte key.",
    );
  }

  const scalar = BigInt(privateKey);
  if (scalar === 0n || scalar >= SECP256K1_ORDER) {
    throw new Error(
      "DEPLOYER_PRIVATE_KEY must be a valid non-zero secp256k1 scalar.",
    );
  }
}

export function validateConfiguredTestnetChainId(
  rawValue: string | undefined,
): void {
  if (rawValue === undefined || rawValue.trim() === "") {
    return;
  }

  const parsed = Number(rawValue);
  if (!Number.isSafeInteger(parsed) || parsed !== NETWORKS.testnet.expectedChainId) {
    throw new Error(
      `BOTCHAIN_TESTNET_CHAIN_ID must equal ${NETWORKS.testnet.expectedChainId}.`,
    );
  }
}

export function validateDeploymentConfirmation(
  networkName: NetworkName,
  confirmation: string | undefined,
): void {
  if (NETWORKS[networkName].confirmationRequired && confirmation !== "true") {
    throw new Error(
      "Mainnet validation requires CONFIRM_MAINNET_DEPLOYMENT=true exactly.",
    );
  }
}

export function assertExpectedChainId(
  actualChainId: number,
  expectedChainId: number,
): void {
  if (actualChainId !== expectedChainId) {
    throw new Error(
      `Chain-ID mismatch: expected ${expectedChainId}, received ${actualChainId}.`,
    );
  }
}

export async function queryChainId(
  rpcUrl: URL,
  fetchImplementation: RpcFetch = fetch,
): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

  try {
    const response = await fetchImplementation(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_chainId",
        params: [],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`RPC returned HTTP ${response.status}.`);
    }

    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null) {
      throw new Error("RPC returned an invalid JSON-RPC response.");
    }

    const result = Reflect.get(payload, "result");
    if (typeof result !== "string" || !CHAIN_ID_PATTERN.test(result)) {
      const rpcError = Reflect.get(payload, "error");
      const errorCode = typeof rpcError === "object" && rpcError !== null
        ? Reflect.get(rpcError, "code")
        : undefined;
      const suffix = typeof errorCode === "number" ? ` (code ${errorCode})` : "";
      throw new Error(`RPC did not return a hexadecimal chain ID${suffix}.`);
    }

    const chainId = Number(BigInt(result));
    if (!Number.isSafeInteger(chainId) || chainId <= 0) {
      throw new Error("RPC returned an unsupported chain ID.");
    }

    return chainId;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`RPC chain-ID request timed out after ${RPC_TIMEOUT_MS}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function main(): Promise<void> {
  const arguments_ = process.argv.slice(2);
  if (arguments_.includes("--help") || arguments_.includes("-h")) {
    printUsage();
    return;
  }

  const networkName = parseNetwork(arguments_);
  if (!networkName) {
    printUsage();
    return;
  }

  loadContractEnvironment();
  assertNoPublicSecrets();

  const network = NETWORKS[networkName];
  const rpcValue = requireEnvironmentVariable(network.rpcEnvironmentVariable);
  const rpcUrl = validateRpcUrl(rpcValue, network.rpcEnvironmentVariable);
  validatePrivateKey(requireEnvironmentVariable("DEPLOYER_PRIVATE_KEY"));
  if (networkName === "testnet") {
    validateConfiguredTestnetChainId(process.env.BOTCHAIN_TESTNET_CHAIN_ID);
  }

  validateDeploymentConfirmation(
    networkName,
    process.env.CONFIRM_MAINNET_DEPLOYMENT,
  );

  console.log(`Validating ${network.label} deployment configuration...`);
  console.log(`RPC origin: ${rpcUrl.origin}`);
  console.log(`Expected chain ID: ${network.expectedChainId}`);

  const actualChainId = await queryChainId(rpcUrl);
  assertExpectedChainId(actualChainId, network.expectedChainId);

  console.log(`RPC chain ID: ${actualChainId}`);
  console.log("Deployer key scalar: valid (value not displayed)");
  if (network.confirmationRequired) {
    console.log("Mainnet confirmation gate: present");
  }
  console.log("Deployment configuration is valid. No transaction was sent.");
}

const invokedScript = process.argv[1] ? resolve(process.argv[1]) : undefined;
const currentScript = resolve(fileURLToPath(import.meta.url));

if (invokedScript === currentScript) {
  main().catch((error: unknown) => {
    const message = error instanceof Error
      ? error.message
      : "Unknown validation error.";
    console.error(`Deployment configuration validation failed: ${message}`);
    process.exitCode = 1;
  });
}
