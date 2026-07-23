import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ProofBOTRegistry", function () {
  const promptHash = ethers.keccak256(
    ethers.toUtf8Bytes("ProofBOT deterministic prompt"),
  );
  const metadataURI = "https://example.com/proofs/prompt-1.json";

  async function deployRegistryFixture() {
    const [creator, otherCreator] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ProofBOTRegistry");
    const registry = await factory.deploy();
    await registry.waitForDeployment();

    return { creator, otherCreator, registry };
  }

  it("1. registers a valid proof", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const expectedProofId = await registry.getProofId(
      creator.address,
      promptHash,
    );

    expect(
      await registry.register.staticCall(promptHash, 0, metadataURI),
    ).to.equal(expectedProofId);
    await registry.register(promptHash, 0, metadataURI);

    expect(await registry.exists(creator.address, promptHash)).to.equal(true);
  });

  it("2. stores the transaction caller as creator", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    await registry.register(promptHash, 0, "");

    const proof = await registry.getProof(creator.address, promptHash);
    expect(proof.creator).to.equal(creator.address);
  });

  it("3. stores the registration block timestamp", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const transaction = await registry.register(promptHash, 1, "");
    const receipt = await transaction.wait();
    expect(receipt).not.to.equal(null);

    const block = await ethers.provider.getBlock(receipt!.blockNumber);
    expect(block).not.to.equal(null);
    const proof = await registry.getProof(creator.address, promptHash);
    expect(proof.timestamp).to.equal(BigInt(block!.timestamp));
  });

  it("4. stores the selected asset type", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    await registry.register(promptHash, 3, "");

    const proof = await registry.getProof(creator.address, promptHash);
    expect(proof.assetType).to.equal(3n);
  });

  it("5. stores the exact metadata URI", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    await registry.register(promptHash, 2, metadataURI);

    const proof = await registry.getProof(creator.address, promptHash);
    expect(proof.metadataURI).to.equal(metadataURI);
  });

  it("6. emits all indexed and non-indexed ProofRegistered values", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const proofId = await registry.getProofId(creator.address, promptHash);
    const transaction = await registry.register(promptHash, 4, metadataURI);
    const receipt = await transaction.wait();
    expect(receipt).not.to.equal(null);

    const eventLog = receipt!.logs.find((log) => {
      try {
        return registry.interface.parseLog(log)?.name === "ProofRegistered";
      } catch {
        return false;
      }
    });
    expect(eventLog).not.to.equal(undefined);
    // Signature plus three indexed event parameters.
    expect(eventLog!.topics).to.have.length(4);

    const parsed = registry.interface.parseLog(eventLog!);
    const block = await ethers.provider.getBlock(receipt!.blockNumber);
    expect(parsed).not.to.equal(null);
    expect(parsed!.args.proofId).to.equal(proofId);
    expect(parsed!.args.contentHash).to.equal(promptHash);
    expect(parsed!.args.creator).to.equal(creator.address);
    expect(parsed!.args.assetType).to.equal(4n);
    expect(parsed!.args.metadataURI).to.equal(metadataURI);
    expect(parsed!.args.timestamp).to.equal(BigInt(block!.timestamp));
  });

  it("7. rejects the zero content hash", async function () {
    const { registry } = await loadFixture(deployRegistryFixture);

    await expect(
      registry.register(ethers.ZeroHash, 0, ""),
    ).to.be.revertedWithCustomError(registry, "InvalidContentHash");
  });

  it("8. rejects a metadata URI longer than 200 UTF-8 bytes", async function () {
    const { registry } = await loadFixture(deployRegistryFixture);

    await expect(
      registry.register(promptHash, 0, "a".repeat(201)),
    ).to.be.revertedWithCustomError(registry, "MetadataURITooLong");
  });

  it("9. accepts exactly 200 metadata bytes", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const metadata = "a".repeat(200);
    expect(ethers.toUtf8Bytes(metadata)).to.have.length(200);

    await registry.register(promptHash, 0, metadata);
    expect(
      (await registry.getProof(creator.address, promptHash)).metadataURI,
    ).to.equal(metadata);
  });

  it("10. rejects duplicate registration by the same wallet", async function () {
    const { registry } = await loadFixture(deployRegistryFixture);
    await registry.register(promptHash, 0, "");

    await expect(
      registry.register(promptHash, 4, metadataURI),
    ).to.be.revertedWithCustomError(registry, "AlreadyRegistered");
  });

  it("11. permits different wallets to register the same content hash", async function () {
    const { creator, otherCreator, registry } = await loadFixture(
      deployRegistryFixture,
    );
    await registry.connect(creator).register(promptHash, 0, "");
    await registry.connect(otherCreator).register(promptHash, 1, metadataURI);

    expect(await registry.exists(creator.address, promptHash)).to.equal(true);
    expect(await registry.exists(otherCreator.address, promptHash)).to.equal(
      true,
    );
    expect(
      await registry.getProofId(creator.address, promptHash),
    ).not.to.equal(await registry.getProofId(otherCreator.address, promptHash));
  });

  it("12. permits one wallet to register different content hashes", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const secondHash = ethers.keccak256(ethers.toUtf8Bytes("second content"));
    await registry.register(promptHash, 0, "");
    await registry.register(secondHash, 0, "");

    expect(await registry.exists(creator.address, promptHash)).to.equal(true);
    expect(await registry.exists(creator.address, secondHash)).to.equal(true);
  });

  it("13. reports that a proof does not exist before registration", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    expect(await registry.exists(creator.address, promptHash)).to.equal(false);
  });

  it("14. reports that a proof exists after registration", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    await registry.register(promptHash, 0, "");
    expect(await registry.exists(creator.address, promptHash)).to.equal(true);
  });

  it("15. returns a zero-address creator for a missing proof", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const proof = await registry.getProof(creator.address, promptHash);

    expect(proof.creator).to.equal(ethers.ZeroAddress);
    expect(proof.timestamp).to.equal(0n);
    expect(proof.assetType).to.equal(0n);
    expect(proof.metadataURI).to.equal("");
  });

  it("16. calculates a deterministic ABI-encoded proof identifier", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const expected = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "bytes32"],
        [creator.address, promptHash],
      ),
    );

    expect(await registry.getProofId(creator.address, promptHash)).to.equal(
      expected,
    );
    expect(await registry.getProofId(creator.address, promptHash)).to.equal(
      expected,
    );
  });

  it("17. measures Unicode metadata by UTF-8 bytes, not characters", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const accepted = "é".repeat(100);
    const rejected = "é".repeat(101);
    expect(accepted).to.have.length(100);
    expect(ethers.toUtf8Bytes(accepted)).to.have.length(200);
    expect(ethers.toUtf8Bytes(rejected)).to.have.length(202);

    await registry.register(promptHash, 0, accepted);
    expect(
      (await registry.getProof(creator.address, promptHash)).metadataURI,
    ).to.equal(accepted);

    const otherHash = ethers.keccak256(ethers.toUtf8Bytes("unicode overflow"));
    await expect(
      registry.register(otherHash, 0, rejected),
    ).to.be.revertedWithCustomError(registry, "MetadataURITooLong");
  });

  it("18. rejects accidental native-token transfers", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);
    const address = await registry.getAddress();

    await expect(
      creator.sendTransaction({ to: address, value: 1n }),
    ).to.be.reverted;
    expect(await ethers.provider.getBalance(address)).to.equal(0n);
  });

  it("19. fuzzes deterministic valid non-zero hashes", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);

    for (let seed = 1; seed <= 24; seed += 1) {
      const contentHash = ethers.keccak256(
        ethers.solidityPacked(
          ["string", "uint256"],
          ["proofbot-hash-fuzz", seed],
        ),
      );
      expect(contentHash).not.to.equal(ethers.ZeroHash);

      await registry.register(
        contentHash,
        seed % 5,
        `ipfs://proofbot-fuzz-${seed}`,
      );
      const proof = await registry.getProof(creator.address, contentHash);
      expect(proof.creator).to.equal(creator.address);
      expect(proof.assetType).to.equal(BigInt(seed % 5));
    }
  });

  it("20. fuzzes deterministic metadata across the accepted byte boundary", async function () {
    const { creator, registry } = await loadFixture(deployRegistryFixture);

    for (let seed = 0; seed < 24; seed += 1) {
      const targetBytes = (seed * 73) % 201;
      const robotCount = seed % 3 === 0 ? Math.floor(targetBytes / 8) : 0;
      const metadata =
        "🤖".repeat(robotCount) + "x".repeat(targetBytes - robotCount * 4);
      expect(ethers.toUtf8Bytes(metadata)).to.have.length(targetBytes);

      const contentHash = ethers.keccak256(
        ethers.solidityPacked(
          ["string", "uint256"],
          ["proofbot-metadata-fuzz", seed],
        ),
      );
      await registry.register(contentHash, seed % 5, metadata);

      const proof = await registry.getProof(creator.address, contentHash);
      expect(proof.metadataURI).to.equal(metadata);
    }
  });

  it("exposes the metadata byte limit as an immutable protocol constant", async function () {
    const { registry } = await loadFixture(deployRegistryFixture);
    expect(await registry.MAX_METADATA_URI_BYTES()).to.equal(200n);
  });
});
