import { task } from "hardhat/config";

import { deployProofBOT } from "../scripts/deploy";

task(
  "deploy-proofbot",
  "Deploy ProofBOTRegistry after network and mainnet safety checks",
)
  .addFlag(
    "overwrite",
    "Allow an existing botchain-mainnet.json deployment record to be replaced",
  )
  .setAction(async ({ overwrite }: { overwrite: boolean }, hre) => {
    await deployProofBOT(hre, { overwrite });
  });
