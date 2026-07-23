import { expect } from "chai";
import { artifacts } from "hardhat";

describe("ProofBOTRegistry compiled surface", function () {
  const sourceName = "contracts/ProofBOTRegistry.sol";
  const contractName = "ProofBOTRegistry";

  it("contains only the intended nonpayable/read-only public API", async function () {
    const artifact = await artifacts.readArtifact(contractName);
    const callableEntries = artifact.abi.filter(
      (entry) => entry.type === "function",
    );

    expect(callableEntries.map((entry) => entry.name).sort()).to.deep.equal([
      "MAX_METADATA_URI_BYTES",
      "exists",
      "getProof",
      "getProofId",
      "register",
    ]);
    expect(
      callableEntries.every((entry) => entry.stateMutability !== "payable"),
    ).to.equal(true);
    expect(
      artifact.abi.some(
        (entry) => entry.type === "receive" || entry.type === "fallback",
      ),
    ).to.equal(false);
  });

  it("contains no external-call, delegate-call, or destruction opcodes", async function () {
    const buildInfo = await artifacts.getBuildInfo(
      `${sourceName}:${contractName}`,
    );
    expect(buildInfo).not.to.equal(undefined);

    const opcodes =
      buildInfo!.output.contracts[sourceName][contractName].evm.deployedBytecode
        .opcodes;
    const opcodeSet = new Set(opcodes.split(/\s+/));

    for (const forbiddenOpcode of [
      "CALL",
      "CALLCODE",
      "DELEGATECALL",
      "STATICCALL",
      "SELFDESTRUCT",
    ]) {
      expect(opcodeSet.has(forbiddenOpcode), forbiddenOpcode).to.equal(false);
    }
  });
});
