// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProofBOT Registry
/// @notice Records wallet-bound blockchain timestamps for hashes of AI and digital assets.
/// @dev Raw content is never stored. A registration stores only its sender, timestamp,
///      category, and an optional public metadata reference.
contract ProofBOTRegistry {
    /// @notice Supported categories for registered content hashes.
    enum AssetType {
        Prompt,
        Dataset,
        ModelCard,
        AgentOutput,
        Other
    }

    /// @notice Registration data keyed by a wallet-bound proof identifier.
    struct Proof {
        address creator;
        uint64 timestamp;
        AssetType assetType;
        string metadataURI;
    }

    uint256 public constant MAX_METADATA_URI_BYTES = 200;

    mapping(bytes32 proofId => Proof proof) private proofs;

    error InvalidContentHash();
    error AlreadyRegistered();
    error MetadataURITooLong();

    event ProofRegistered(
        bytes32 indexed proofId,
        bytes32 indexed contentHash,
        address indexed creator,
        AssetType assetType,
        string metadataURI,
        uint64 timestamp
    );

    /// @notice Registers a content hash for the transaction sender.
    /// @param contentHash Keccak-256 hash calculated before calling the contract.
    /// @param assetType Category of the registered digital asset.
    /// @param metadataURI Optional public IPFS or HTTPS metadata reference (at most 200 bytes).
    /// @return proofId Wallet-bound identifier for the registration.
    function register(
        bytes32 contentHash,
        AssetType assetType,
        string calldata metadataURI
    ) external returns (bytes32 proofId) {
        if (contentHash == bytes32(0)) {
            revert InvalidContentHash();
        }
        if (bytes(metadataURI).length > MAX_METADATA_URI_BYTES) {
            revert MetadataURITooLong();
        }

        proofId = getProofId(msg.sender, contentHash);
        if (proofs[proofId].creator != address(0)) {
            revert AlreadyRegistered();
        }

        uint64 registeredAt = uint64(block.timestamp);
        proofs[proofId] = Proof({
            creator: msg.sender,
            timestamp: registeredAt,
            assetType: assetType,
            metadataURI: metadataURI
        });

        emit ProofRegistered(
            proofId,
            contentHash,
            msg.sender,
            assetType,
            metadataURI,
            registeredAt
        );
    }

    /// @notice Returns a creator's proof for a content hash.
    /// @dev A missing proof returns a struct whose creator is address(0).
    function getProof(
        address creator,
        bytes32 contentHash
    ) external view returns (Proof memory) {
        return proofs[getProofId(creator, contentHash)];
    }

    /// @notice Returns whether a creator registered a content hash.
    function exists(
        address creator,
        bytes32 contentHash
    ) external view returns (bool) {
        return proofs[getProofId(creator, contentHash)].creator != address(0);
    }

    /// @notice Calculates the deterministic wallet-bound proof identifier.
    /// @dev Uses abi.encode rather than packed encoding to match off-chain ABI encoding exactly.
    function getProofId(
        address creator,
        bytes32 contentHash
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(creator, contentHash));
    }
}
