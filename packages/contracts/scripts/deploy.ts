import { execFileSync } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { exportAbi } from "./abi-exporter";
import {
  assertDeploymentRecordWriteAllowed,
  assertDeploymentSafety,
  getDeploymentProfile,
  parseRpcChainId,
  resolveConfirmations,
  sanitizeRpcUrlForDisplay,
  type DeploymentProfile,
} from "./deployment-safety";

interface DeployOptions {
  overwrite: boolean;
}

interface JsonRpcResponse {
  error?: {
    code?: number;
    message?: string;
  };
  result?: unknown;
}

interface DeploymentRecord {
  network: string;
  chainId: number;
  contractName: "ProofBOTRegistry";
  address: string;
  deploymentTransaction: string;
  deploymentBlock: number;
  deployer: string;
  deployedAt: string;
  compilerVersion: string;
  sourceVerified: boolean;
  gitCommit: string;
}

async function queryRpcChainId(rpcUrl: string): Promise<number> {
  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_chainId",
        params: [],
      }),
    });
  } catch {
    throw new Error(
      `RPC chain-ID check could not reach ${sanitizeRpcUrlForDisplay(rpcUrl)}. Deployment refused.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `RPC chain-ID check failed with HTTP ${response.status}. Deployment refused.`,
    );
  }

  const body = (await response.json()) as JsonRpcResponse;
  if (body.error !== undefined) {
    throw new Error(
      `RPC chain-ID check failed with JSON-RPC error ${body.error.code ?? "unknown"}. Deployment refused.`,
    );
  }

  return parseRpcChainId(body.result);
}

function getRpcUrl(profile: DeploymentProfile): string {
  const configuredValue = process.env[profile.rpcEnvName];
  return configuredValue && configuredValue.trim() !== ""
    ? configuredValue
    : profile.rpcUrl;
}

function readGitCommit(repositoryRoot: string): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function mainnetRecordPath(repositoryRoot: string): string {
  return path.join(repositoryRoot, "deployments", "botchain-mainnet.json");
}

function deploymentRecordPath(
  repositoryRoot: string,
  profile: DeploymentProfile,
  contractAddress: string,
): string {
  if (profile.isMainnet) {
    return mainnetRecordPath(repositoryRoot);
  }
  return path.join(
    repositoryRoot,
    "deployments",
    `${profile.recordNetwork}-${contractAddress.toLowerCase()}.json`,
  );
}

async function attemptVerification(
  hre: HardhatRuntimeEnvironment,
  profile: DeploymentProfile,
  address: string,
): Promise<boolean> {
  const apiUrl = profile.isMainnet
    ? process.env.BOTCHAIN_EXPLORER_API_URL
    : process.env.BOTCHAIN_TESTNET_EXPLORER_API_URL;
  const apiKey = profile.isMainnet
    ? process.env.BOTCHAIN_EXPLORER_API_KEY
    : process.env.BOTCHAIN_TESTNET_EXPLORER_API_KEY ??
      process.env.BOTCHAIN_EXPLORER_API_KEY;

  // Official docs currently expose manual verification but no API. Never guess.
  if (!apiUrl || !apiKey) {
    console.log(
      "Skipping source verification: no documented explorer API configuration was supplied.",
    );
    return false;
  }

  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [],
    });
    return true;
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    console.warn(`Source verification was not completed: ${detail}`);
    return false;
  }
}

export async function deployProofBOT(
  hre: HardhatRuntimeEnvironment,
  { overwrite }: DeployOptions,
): Promise<DeploymentRecord> {
  const profile = getDeploymentProfile(hre.network.name);
  const repositoryRoot = path.resolve(hre.config.paths.root, "../..");
  const rpcUrl = getRpcUrl(profile);

  // Preflight the fixed mainnet record before broadcasting any transaction.
  const mainnetRecordExists =
    profile.isMainnet &&
    (await pathExists(mainnetRecordPath(repositoryRoot)));
  assertDeploymentRecordWriteAllowed(
    profile,
    mainnetRecordExists,
    overwrite,
  );

  const rpcChainId = await queryRpcChainId(rpcUrl);
  assertDeploymentSafety({
    actualChainId: rpcChainId,
    confirmation: process.env.CONFIRM_MAINNET_DEPLOYMENT,
    configuredTestnetChainId: process.env.BOTCHAIN_TESTNET_CHAIN_ID,
    privateKey: process.env.DEPLOYER_PRIVATE_KEY,
    profile,
  });

  const providerChainId = Number((await hre.ethers.provider.getNetwork()).chainId);
  if (providerChainId !== rpcChainId) {
    throw new Error(
      `Provider chain ID ${providerChainId} differs from independent RPC check ${rpcChainId}. Deployment refused.`,
    );
  }

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer is configured.");
  }

  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await hre.ethers.provider.getBalance(deployerAddress);
  const confirmations = resolveConfirmations(
    process.env.DEPLOYMENT_CONFIRMATIONS,
    profile,
  );

  console.log(`Network: ${profile.networkLabel} (chain ID ${rpcChainId})`);
  console.log(`RPC: ${sanitizeRpcUrlForDisplay(rpcUrl)}`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Balance: ${hre.ethers.formatEther(deployerBalance)} BOT`);
  console.log(`Receipt confirmations: ${confirmations}`);

  if (deployerBalance === 0n) {
    throw new Error("Deployer has no BOT available for deployment gas.");
  }

  const factory = await hre.ethers.getContractFactory(
    "ProofBOTRegistry",
    deployer,
  );
  const contract = await factory.deploy();
  const deploymentTransaction = contract.deploymentTransaction();
  if (!deploymentTransaction) {
    throw new Error("Deployment transaction was not created.");
  }

  console.log(`Deployment submitted: ${deploymentTransaction.hash}`);
  const receipt = await deploymentTransaction.wait(confirmations);
  if (!receipt || receipt.status !== 1) {
    throw new Error("Deployment transaction did not complete successfully.");
  }

  const address = await contract.getAddress();
  const buildInfo = await hre.artifacts.getBuildInfo(
    "contracts/ProofBOTRegistry.sol:ProofBOTRegistry",
  );
  const deploymentBlock = await hre.ethers.provider.getBlock(receipt.blockNumber);
  const record: DeploymentRecord = {
    network: profile.recordNetwork,
    chainId: profile.chainId,
    contractName: "ProofBOTRegistry",
    address,
    deploymentTransaction: deploymentTransaction.hash,
    deploymentBlock: receipt.blockNumber,
    deployer: deployerAddress,
    deployedAt: deploymentBlock
      ? new Date(deploymentBlock.timestamp * 1_000).toISOString()
      : new Date().toISOString(),
    compilerVersion: buildInfo?.solcVersion ?? "0.8.24",
    sourceVerified: false,
    gitCommit: readGitCommit(repositoryRoot),
  };

  const recordPath = deploymentRecordPath(repositoryRoot, profile, address);
  await mkdir(path.dirname(recordPath), { recursive: true });
  await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`, {
    encoding: "utf8",
    flag: profile.isMainnet && overwrite ? "w" : "wx",
  });

  const abiPath = await exportAbi(hre.artifacts, hre.config.paths.root);

  console.log(`ProofBOTRegistry deployed at ${address}`);
  console.log(`Explorer transaction: ${profile.explorerUrl}/tx/${deploymentTransaction.hash}`);
  console.log(`Deployment record: ${recordPath}`);
  console.log(`Frontend ABI: ${abiPath}`);

  // Persist the deployment before contacting an optional third-party verifier.
  // If verification succeeds, update only the sourceVerified field in that record.
  if (await attemptVerification(hre, profile, address)) {
    record.sourceVerified = true;
    await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
    console.log("Contract source verification completed.");
  }

  return record;
}
