import hre from "hardhat";

import { exportAbi } from "./abi-exporter";

async function main(): Promise<void> {
  const outputPath = await exportAbi(hre.artifacts, hre.config.paths.root);
  console.log(`Exported ProofBOTRegistry ABI to ${outputPath}`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
