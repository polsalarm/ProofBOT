import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Artifacts } from "hardhat/types";

const CONTRACT_NAME = "ProofBOTRegistry";
const SOURCE_NAME = "contracts/ProofBOTRegistry.sol";

export async function exportAbi(
  artifacts: Artifacts,
  contractsRoot: string,
): Promise<string> {
  const artifact = await artifacts.readArtifact(CONTRACT_NAME);
  const repositoryRoot = path.resolve(contractsRoot, "../..");
  const outputPath = path.join(
    repositoryRoot,
    "apps",
    "web",
    "lib",
    "generated",
    "ProofBOTRegistry.json",
  );

  const output = {
    contractName: CONTRACT_NAME,
    sourceName: SOURCE_NAME,
    abi: artifact.abi,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  return outputPath;
}
