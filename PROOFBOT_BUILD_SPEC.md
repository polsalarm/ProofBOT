# ProofBOT — Complete Build Specification for GPT CLI

> **Purpose of this file:** Give GPT CLI enough product, technical, UX, testing, security, and BOT Chain context to build a complete ProofBOT MVP.
>
> **Instruction to GPT CLI:** Read this entire file before changing or creating code. Build the application end to end, not just a scaffold. Make reasonable implementation decisions where details are not specified, but do not expand the core scope. Run all available tests, linting, type checks, contract compilation, and production builds before declaring the work complete.

---

## 1. Project Summary

**Project name:** ProofBOT  
**Tagline:** Hash it. Stamp it. Verify it.  
**Category:** AI infrastructure / provenance / on-chain timestamping  
**Target network:** BOT Chain  
**Target chain ID:** `677`  
**MVP architecture:** One small Solidity registry contract plus a frontend-only web application  
**Backend:** None required for the MVP  
**Database:** None required for the MVP  
**Project token:** None  
**Custody of user funds:** None  

ProofBOT lets a user generate a cryptographic hash of an AI-related digital asset in the browser and register that hash on BOT Chain. The original text or file must remain on the user's device unless the user separately supplies an optional public metadata URL.

Supported asset categories:

- Prompt
- Dataset
- Model card
- AI-agent output
- Other digital asset

A verifier can later provide the original content and the creator's wallet address. ProofBOT hashes the content again and checks BOT Chain for a matching registration.

The product proves that a particular wallet registered a particular content hash at a particular blockchain timestamp. It does **not** conclusively prove legal authorship, copyright ownership, originality, or the complete creation history of the content.

---

## 2. GPT CLI Operating Rules

1. Do not stop after generating boilerplate.
2. Implement the smart contract, tests, deployment scripts, frontend, wallet integration, hashing, read/write flows, documentation, and CI.
3. Prefer the smallest dependable implementation over unnecessary abstractions.
4. Do not add a token, NFT, marketplace, staking, DAO, bridge, oracle, account system, database, centralized API, or paid feature.
5. Do not upload user-selected content to a server.
6. Do not send raw prompts, text, model files, datasets, or AI outputs to the blockchain.
7. Do not commit secrets, private keys, RPC credentials, API keys, or populated `.env` files.
8. Never initiate a BOT Chain mainnet deployment unless:
   - all tests pass;
   - the production build passes;
   - the chain ID returned by the configured RPC is `677`;
   - `CONFIRM_MAINNET_DEPLOYMENT=true` is explicitly present;
   - a valid deployer key is supplied through an environment variable.
9. Official BOT Chain documentation is the source of truth for RPC URLs, explorer URLs, native currency details, verification APIs, gas behavior, and current network configuration.
10. If the official documentation conflicts with marketing context in this file, use the official documentation for technical implementation and document the discrepancy.
11. Keep the codebase understandable to a small team. Add comments where a security or protocol decision is not obvious.
12. Finish by producing a concise completion report containing:
    - files created or changed;
    - commands run;
    - test/build results;
    - contract deployment status;
    - unresolved items, if any.

---

## 3. BOT Chain Context Supplied by the Project Team

> The following ecosystem and marketing information was supplied for this build brief. Treat it as project-provided context. Confirm time-sensitive or technical claims against official sources before publishing them as independently verified facts.

### What is BOT Chain?

BOT Chain is described as a modular Layer 1 blockchain built for AI and Web3. Its mission is to serve as a protocol factory, empowering builders to deploy faster and at a lower cost. It is positioned as Layer 1 infrastructure built by builders, for builders, and is forecasting thousands of deployments.

### Is it live?

The supplied context states:

- Mainnet launched in February 2026.
- The network currently has more than `$22M` in TVL.
- It is backed by NIX Foundation, Alpha Capital, and Gemhead Capital.
- It has received `$15M` in funding.

### How easy is it to build on?

The supplied context states:

- BOT Chain is fully EVM-compatible.
- Existing Solidity contracts can be deployed with zero code changes.
- Mainnet chain ID is `677`.
- The network is listed on ChainList.

### Cost and speed

The supplied context states:

- Approximate transaction cost is `$0.002`.
- It is approximately `60%` cheaper than BSC.
- It is approximately `50x` cheaper than Ethereum.
- Block time is approximately `0.75 seconds`.

Do not hardcode these marketing comparisons into application logic. Keep any public marketing copy editable and verify it before release.

### Ecosystem support

The supplied context describes five support pillars:

1. **Funding**
   - `$50M` ecosystem fund
   - Grants of up to `$1M`
   - Weekly gas rebates

2. **Technical**
   - EVM infrastructure
   - Deployment support
   - Dedicated ecosystem support

3. **Traffic exposure**
   - More than `900K` wallet addresses
   - Bo Wallet DApp store placement
   - Launchpad priority

4. **Liquidity**
   - Instant DEX depth
   - Market-maker access
   - CEX listing channel

5. **Branding**
   - Official verification badge for approved projects
   - Summit roadshows
   - Media support

---

## 4. BOT Chain Links

Copy and preserve these links in the finished repository README:

- BOT Chain website: https://www.botchain.ai
- BOT Chain developer documentation: https://dev-docs.botchain.ai/docs/intro
- BOT Chain incentive and grants program: https://botchain.notion.site/bot-chain-ecosystem-support-program-en
- Current BOT Chain ecosystem projects: https://www.botchain.ai/project-party

Before configuring or deploying the app, inspect the developer documentation and confirm:

- Mainnet RPC URL
- Testnet RPC URL, if available
- Mainnet chain ID
- Testnet chain ID, if available
- Native currency name, symbol, and decimals
- Mainnet explorer URL
- Testnet explorer URL
- Explorer source-verification method or API
- Faucet details for testnet, if available
- Recommended gas configuration
- Any public RPC rate limits
- Any official wallet-add configuration

The supplied mainnet chain ID is `677`. The deployment script must independently query the RPC and refuse to deploy if the returned chain ID does not match the expected environment.

---

## 5. Product Goal

Build the smallest credible mainnet application that demonstrates BOT Chain's EVM compatibility and low-friction transaction experience while providing a useful primitive for AI builders and creators.

The product should make it possible to answer:

> Did this wallet register this exact content hash on BOT Chain, and when?

The product must not imply:

> This wallet has conclusively proven legal authorship, copyright ownership, originality, or exclusive rights.

---

## 6. Primary User Stories

### Register a proof

As a creator, researcher, AI developer, or agent operator, I can:

1. Open ProofBOT.
2. Connect an EVM wallet.
3. Select either text input or a local file.
4. Choose an asset category.
5. Optionally add a public metadata URL.
6. See the computed Keccak-256 content hash.
7. Switch to or add BOT Chain in my wallet.
8. submit a single registration transaction.
9. Wait for confirmation.
10. Copy a shareable proof URL and transaction link.

### Verify a proof

As a third party, I can:

1. Open ProofBOT without connecting a wallet.
2. Paste the creator wallet address.
3. Paste text or choose the original local file.
4. Compute the content hash locally.
5. Query the registry contract.
6. See whether a matching registration exists.
7. See the recorded creator, timestamp, asset category, metadata URL, and explorer link.

### View a proof page

As a user opening a shared link, I can:

1. See the registered creator and hash.
2. See whether the record exists.
3. See the registration timestamp and category.
4. Open the related explorer page.
5. Optionally select a local file or paste text to confirm that it produces the same hash.

### View my proofs

As a connected user, I can:

1. Open a "My Proofs" view.
2. See registrations emitted by my wallet.
3. Open each proof page.
4. Copy a proof link or hash.

No centralized account or login is required.

---

## 7. MVP Scope

The MVP must include:

- A deployable Solidity registry contract
- Contract unit tests
- A deployment script
- BOT Chain network configuration
- Wallet connection
- Network switch/add behavior
- Local text hashing
- Local file hashing
- Proof registration
- Proof verification
- Shareable proof pages
- "My Proofs" based on contract event logs
- Explorer links
- Responsive UI
- Error, loading, pending, success, and empty states
- README and environment setup instructions
- CI for lint, type checking, contract tests, and production build
- A contract deployment record format

---

## 8. Explicitly Out of Scope

Do not add any of the following to the MVP:

- Project token
- NFT minting
- Marketplace
- Staking
- Yield or liquidity features
- DAO or governance
- Cross-chain messaging
- Oracle integration
- Built-in generative AI model
- AI API calls
- Server-side file upload
- Permanent storage of raw prompts or files
- User profile database
- Email/password authentication
- Subscription billing
- Gas sponsorship
- Batch registration
- Upgradeable proxy
- Admin owner
- Pausable contract
- Withdrawal function
- Contract fees
- Legal ownership adjudication

---

## 9. Recommended Technology Stack

Use current stable, mutually compatible releases and commit the lockfile.

### Repository

- `pnpm` workspaces
- TypeScript
- Node version declared in `.nvmrc` or `.node-version`
- Root scripts that orchestrate frontend and contract tasks

### Frontend

- Next.js using the App Router
- React
- TypeScript with strict mode
- Tailwind CSS
- `wagmi`
- `viem`
- A lightweight wallet modal or a small custom wallet connection interface
- Zod for environment and form validation where useful
- No backend requirement
- No database requirement

### Smart contracts

- Solidity `^0.8.24` or a newer compatible stable compiler
- Hardhat with TypeScript
- Ethers or viem-based deployment tooling
- Chai-based unit tests
- Contract source verification support where BOT Chain's explorer allows it

Avoid adding a large UI framework unless it materially reduces complexity. Small reusable components are preferred.

---

## 10. Suggested Repository Structure

```text
proofbot/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── page.tsx
│       │   ├── proof/
│       │   │   └── [creator]/
│       │   │       └── [hash]/
│       │   │           └── page.tsx
│       │   ├── my-proofs/
│       │   │   └── page.tsx
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       │   ├── chain.ts
│       │   ├── contract.ts
│       │   ├── hashing.ts
│       │   ├── validation.ts
│       │   └── explorer.ts
│       ├── public/
│       ├── tests/
│       ├── .env.example
│       └── package.json
├── packages/
│   └── contracts/
│       ├── contracts/
│       │   └── ProofBOTRegistry.sol
│       ├── scripts/
│       │   ├── deploy.ts
│       │   └── export-abi.ts
│       ├── test/
│       │   └── ProofBOTRegistry.test.ts
│       ├── hardhat.config.ts
│       ├── .env.example
│       └── package.json
├── deployments/
│   ├── README.md
│   └── .gitkeep
├── scripts/
│   └── validate-deployment-config.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── .nvmrc
├── pnpm-workspace.yaml
├── package.json
├── README.md
├── SECURITY.md
├── LICENSE
└── PROOFBOT_BUILD_SPEC.md
```

The final location of the ABI must be deterministic. A contract build/export script should copy or generate the ABI used by the frontend. Do not maintain two manually edited ABI copies.

---

## 11. Smart Contract Requirements

### Contract name

`ProofBOTRegistry`

### Design goals

- Minimal
- Immutable
- No owner
- No upgradeability
- No payable functions
- No token
- No custody
- No external calls
- No imports required
- Easy to review
- Same content may be registered by different wallets
- The same wallet may not register the same content hash twice
- Only a hash and optional public metadata URI are stored
- Raw content is never stored

### Asset type enum

```solidity
enum AssetType {
    Prompt,
    Dataset,
    ModelCard,
    AgentOutput,
    Other
}
```

### Proof identifier

Calculate a wallet-bound proof identifier as:

```solidity
keccak256(abi.encode(creator, contentHash))
```

Using the creator address in the proof identifier allows different wallets to register the same content hash independently.

### Metadata URI

- Optional
- Maximum length: `200` bytes
- Intended for `https://` or `ipfs://` references
- Must not contain secrets
- Must not be treated as proof of authenticity
- The frontend must not render unsupported URL schemes as clickable links

### Required contract API

```solidity
register(bytes32 contentHash, AssetType assetType, string metadataURI)
getProof(address creator, bytes32 contentHash)
exists(address creator, bytes32 contentHash)
getProofId(address creator, bytes32 contentHash)
```

### Required event

```solidity
event ProofRegistered(
    bytes32 indexed proofId,
    bytes32 indexed contentHash,
    address indexed creator,
    AssetType assetType,
    string metadataURI,
    uint64 timestamp
);
```

---

## 12. Reference Smart Contract

Use the following as the starting implementation. Improve naming, NatSpec, tests, or packaging where useful, but do not introduce ownership, fees, upgradeability, or external calls.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ProofBOT Registry
/// @notice Wallet-bound blockchain timestamps for hashes of AI and digital assets.
/// @dev The contract stores hashes and optional metadata references, not raw content.
contract ProofBOTRegistry {
    enum AssetType {
        Prompt,
        Dataset,
        ModelCard,
        AgentOutput,
        Other
    }

    struct Proof {
        address creator;
        uint64 timestamp;
        AssetType assetType;
        string metadataURI;
    }

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
    /// @param metadataURI Optional public IPFS or HTTPS metadata reference.
    /// @return proofId Wallet-bound identifier for the registration.
    function register(
        bytes32 contentHash,
        AssetType assetType,
        string calldata metadataURI
    ) external returns (bytes32 proofId) {
        if (contentHash == bytes32(0)) {
            revert InvalidContentHash();
        }

        if (bytes(metadataURI).length > 200) {
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

    /// @notice Returns a proof for a creator and content hash.
    /// @dev A missing proof returns a struct with creator set to address(0).
    function getProof(
        address creator,
        bytes32 contentHash
    ) external view returns (Proof memory) {
        return proofs[getProofId(creator, contentHash)];
    }

    /// @notice Returns true when a proof exists.
    function exists(
        address creator,
        bytes32 contentHash
    ) external view returns (bool) {
        return proofs[getProofId(creator, contentHash)].creator != address(0);
    }

    /// @notice Calculates the deterministic wallet-bound proof identifier.
    function getProofId(
        address creator,
        bytes32 contentHash
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(creator, contentHash));
    }
}
```

---

## 13. Contract Test Requirements

At minimum, implement tests for all of the following:

1. A valid proof can be registered.
2. The stored creator is the caller.
3. The stored timestamp equals the transaction block timestamp.
4. The stored asset type is correct.
5. The stored metadata URI is correct.
6. The `ProofRegistered` event contains the correct indexed and non-indexed values.
7. A zero content hash reverts with `InvalidContentHash`.
8. A metadata URI longer than `200` bytes reverts with `MetadataURITooLong`.
9. Exactly `200` metadata bytes are accepted.
10. A duplicate registration by the same wallet reverts with `AlreadyRegistered`.
11. A different wallet can register the same content hash.
12. The same wallet can register two different content hashes.
13. `exists` returns `false` before registration.
14. `exists` returns `true` after registration.
15. `getProof` returns a zero-address creator for a missing proof.
16. `getProofId` is deterministic.
17. Unicode metadata length is checked by UTF-8 byte length, not character count.
18. The contract does not accept accidental native-token transfers through an undefined payable path.
19. Fuzz valid non-zero hashes.
20. Fuzz metadata values within the accepted byte-length boundary.

Run contract coverage if the chosen tooling supports it without excessive complexity.

---

## 14. Hashing Rules

ProofBOT must use **Keccak-256** for the MVP.

### Text hashing

- Accept raw user-entered text.
- Reject an empty input in the UI.
- Convert the exact text to UTF-8 bytes using `TextEncoder`.
- Hash those bytes with Keccak-256.
- Do not trim, lowercase, normalize Unicode, remove newlines, or change whitespace.
- Explain that even one changed character or space produces a different hash.

Conceptual implementation:

```ts
const bytes = new TextEncoder().encode(text);
const contentHash = keccak256(bytes);
```

### File hashing

- Read the original file bytes locally using `arrayBuffer`.
- Convert to `Uint8Array`.
- Hash the exact bytes with Keccak-256.
- Do not upload the file.
- Do not modify image metadata, line endings, compression, or file contents.
- Show the selected file name and size.
- Set a configurable MVP browser limit, such as `25 MB`, to prevent memory problems.
- Clearly explain that files exceeding the limit are not supported by the initial browser implementation.

Conceptual implementation:

```ts
const buffer = await file.arrayBuffer();
const bytes = new Uint8Array(buffer);
const contentHash = keccak256(bytes);
```

### Hash display

- Always display the full `0x`-prefixed 32-byte hash.
- Provide a copy button.
- Use a monospace style.
- Shorten only in compact list views; the full value must remain accessible.
- Validate that externally entered hashes match `/^0x[0-9a-fA-F]{64}$/`.

---

## 15. BOT Chain Configuration

Build a custom `viem` chain configuration after confirming details from the official developer documentation.

The configuration must include:

- Chain ID: expected `677`
- Chain name
- Native currency name
- Native currency symbol
- Native currency decimals
- Default RPC URL
- Public RPC URL, if different
- Block explorer name and URL
- Testnet flag set to `false`

Do not silently fall back to Ethereum or another chain.

### Runtime network checks

Before a write:

1. Detect the connected wallet chain.
2. If it is not `677`, show a clear switch-network action.
3. Attempt `wallet_switchEthereumChain`.
4. If the chain is unknown to the wallet, attempt `wallet_addEthereumChain` using verified official values.
5. Re-check the chain after the switch.
6. Simulate the contract call before submitting it.
7. Wait for a receipt and display transaction state.

Before deployment:

1. Call `eth_chainId` through the configured RPC.
2. Parse the result.
3. Refuse deployment if the result is not the expected chain ID.
4. Print the selected network, deployer address, and balance.
5. Require `CONFIRM_MAINNET_DEPLOYMENT=true`.

---

## 16. Environment Variables

Create safe `.env.example` files with explanatory comments.

### Root or contract environment

```dotenv
# BOT Chain mainnet RPC from the official developer documentation.
BOTCHAIN_MAINNET_RPC_URL=

# Optional BOT Chain testnet configuration from official documentation.
BOTCHAIN_TESTNET_RPC_URL=
BOTCHAIN_TESTNET_CHAIN_ID=

# Never commit this value.
DEPLOYER_PRIVATE_KEY=

# Hard safety gate. Mainnet deployment must refuse to run unless this is true.
CONFIRM_MAINNET_DEPLOYMENT=false

# Optional explorer verification configuration.
BOTCHAIN_EXPLORER_API_URL=
BOTCHAIN_EXPLORER_API_KEY=
```

### Frontend environment

```dotenv
# Public BOT Chain values confirmed from official documentation.
NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=677
NEXT_PUBLIC_BOTCHAIN_RPC_URL=
NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL=

# Set after contract deployment.
NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS=

# Deployment block is used as the earliest event-log query block.
NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK=
```

Validate environment variables at startup. The application should fail with a clear developer-facing message when required production values are missing.

No secret may use the `NEXT_PUBLIC_` prefix.

---

## 17. Deployment Record

Every successful deployment must write a JSON file under `deployments/`.

Suggested format:

```json
{
  "network": "botchain-mainnet",
  "chainId": 677,
  "contractName": "ProofBOTRegistry",
  "address": "0x...",
  "deploymentTransaction": "0x...",
  "deploymentBlock": 0,
  "deployer": "0x...",
  "deployedAt": "2026-01-01T00:00:00.000Z",
  "compilerVersion": "0.8.x",
  "sourceVerified": false,
  "gitCommit": "..."
}
```

The deployment script must not overwrite an existing mainnet record unless an explicit overwrite flag is supplied.

After deployment:

1. Wait for confirmations.
2. Save the deployment record.
3. Export the ABI for the frontend.
4. Print the contract address and explorer transaction URL.
5. Attempt source verification only if the explorer supports it.
6. Update documentation without exposing secrets.

---

## 18. Frontend Pages and Components

### Home page

Use a simple tab or segmented control:

- Register
- Verify

Hero copy:

> **Prove when your AI asset existed.**  
> Hash prompts, datasets, model cards, and agent outputs locally, then timestamp the hash on BOT Chain.

Primary reassurance:

> Your content stays on your device. Only its cryptographic hash and optional public metadata URL are sent on-chain.

### Register panel

Required fields and controls:

- Input mode selector:
  - Text
  - File
- Text area or file selector
- Asset category selector
- Optional metadata URL
- Computed hash
- Connected wallet
- Current network
- Connect-wallet button
- Switch/add BOT Chain button where needed
- Register button
- Transaction status
- Success result
- Copy proof URL
- Open transaction in explorer

Disable the transaction button until:

- a non-empty text or supported file has been hashed;
- metadata is valid;
- a wallet is connected;
- the correct network is selected;
- the proof is not already registered.

Before submitting, call `exists` and show a useful message when a duplicate already exists.

### Verify panel

Required controls:

- Creator wallet address
- Input mode selector:
  - Text
  - File
- Text area or file selector
- Computed hash
- Verify button

A wallet connection must not be required for verification.

Result states:

- Verified
- Not found
- Invalid creator address
- Invalid or empty content
- RPC unavailable
- Contract unavailable

Verified result should display:

- Creator
- Full content hash
- Proof ID
- Asset category
- Registration timestamp
- Optional metadata link
- Contract address
- BOT Chain chain ID
- Explorer link
- Shareable proof page link

### Proof page

Route:

```text
/proof/[creator]/[hash]
```

The page must:

- Validate route parameters.
- Query the contract without requiring a wallet.
- Display the proof record.
- Show a strong "Verified on BOT Chain" state only when the record exists.
- Show a "No matching registration" state otherwise.
- Allow optional local text/file selection to compare against the hash in the URL.
- Never upload the selected content.
- Include a copy/share action.
- Include the legal/provenance limitation.

### My Proofs page

Route:

```text
/my-proofs
```

Requirements:

- Require a connected wallet.
- Query `ProofRegistered` logs filtered by the connected creator address.
- Start from the configured contract deployment block.
- Query logs in safe block ranges if the RPC limits ranges.
- Sort newest first.
- Support loading, empty, retry, and RPC error states.
- Show category, abbreviated hash, timestamp, metadata indicator, and proof link.
- Keep a small local cache only as a performance aid, never as the source of truth.

---

## 19. Event Log Strategy

The contract event has three indexed fields:

- `proofId`
- `contentHash`
- `creator`

Use the indexed `creator` topic to retrieve a user's records.

Because public RPC providers may limit `eth_getLogs` ranges:

1. Read `NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK`.
2. Query from deployment block to latest.
3. Use configurable chunks.
4. Retry smaller chunks after a range-limit error.
5. De-duplicate by transaction hash plus log index.
6. Sort by block number and log index.
7. Read block timestamps only when needed and cache them in memory for the current session.

Do not introduce an indexing backend in the MVP.

---

## 20. Metadata URL Rules

The metadata URL is optional.

Frontend validation:

- Allow an empty value.
- Allow `https://`.
- Allow `ipfs://`.
- Reject `javascript:`, `data:`, `file:`, and other unsupported schemes.
- Enforce the same `200` UTF-8 byte maximum used by the contract.
- Show the byte count.
- Warn users that metadata URLs are public and permanent when included in a transaction.

When rendering:

- Sanitize the URL.
- For `https://`, open with `target="_blank"` and `rel="noopener noreferrer"`.
- For `ipfs://`, either show it as copyable text or convert it through a clearly configured gateway.
- Never inject metadata content as HTML.
- Never automatically fetch arbitrary metadata in the initial MVP.

---

## 21. UX and Visual Direction

Use a clean, credible, developer-oriented interface.

### Desired qualities

- Fast
- Minimal
- Trustworthy
- Mobile-friendly
- Easy to understand without blockchain expertise
- Clear network and transaction states
- Strong distinction between local content and on-chain data

### Suggested visual language

- Dark or neutral developer-tool aesthetic
- Generous spacing
- One prominent action per state
- Monospace treatment for hashes, addresses, and transaction IDs
- Subtle chain/grid motifs rather than excessive crypto imagery
- BOT Chain branding only where permitted by its brand rules

### Required accessibility

- Semantic HTML
- Keyboard-accessible controls
- Visible focus states
- Proper form labels
- Sufficient contrast
- `aria-live` regions for hash and transaction status
- Errors associated with their fields
- No information communicated by color alone
- Respect reduced-motion preferences

### Required responsive behavior

- Fully usable at approximately `360px` width
- No horizontal scrolling for normal content
- Long hashes and addresses wrap or scroll safely
- Buttons remain large enough for touch
- Desktop layout should not become excessively wide

---

## 22. Error Handling

Create user-readable errors for:

- Wallet not installed
- Wallet connection rejected
- Wrong network
- Network switch rejected
- BOT Chain not configured in wallet
- Invalid RPC configuration
- RPC request failure
- Invalid wallet address
- Empty text
- Unsupported or oversized file
- Invalid metadata URL
- Metadata over 200 bytes
- Duplicate proof
- Contract call simulation failure
- Insufficient native token for gas
- Transaction rejected
- Transaction reverted
- Transaction dropped or replaced
- Receipt timeout
- Missing deployment address
- Missing proof
- Event-log query limitation

Do not display raw stack traces to end users. Preserve developer details in console logging during development.

---

## 23. Privacy and Security Requirements

### Privacy

- Hash content entirely in the browser.
- Never transmit raw text or file bytes to a backend.
- Do not add analytics that capture user content, hashes, metadata, wallet activity, or file names without explicit review.
- Explain that hashes are public and can still reveal information when the original content is easily guessable.
- Warn users not to place confidential information in the optional metadata URL.

### Smart contract security

- No external calls
- No delegate calls
- No owner
- No upgrade proxy
- No payable registration
- No native-token withdrawal
- Checks before state changes
- Explicit custom errors
- Bounded metadata storage
- Contract source verification where supported
- Run static analysis if available

### Frontend security

- Validate all addresses and hashes.
- Do not trust route parameters.
- Sanitize external URLs.
- Never interpolate untrusted data into HTML.
- Use safe external-link attributes.
- Keep RPC and explorer URLs in validated configuration.
- Never expose a deployer private key to the frontend.
- Add a restrictive security-header configuration where practical.

### Legal/provenance notice

Display language similar to:

> ProofBOT records that a wallet registered a cryptographic hash at a BOT Chain timestamp. This record does not by itself establish legal authorship, copyright ownership, originality, identity, or exclusive rights.

---

## 24. Content and Labels

### Navigation

- Register
- Verify
- My Proofs
- About

### Register headings

- Register a proof
- Choose content
- Asset category
- Optional public metadata
- Content hash
- Confirm on BOT Chain

### Verify headings

- Verify a proof
- Creator wallet
- Original content
- Calculated hash
- On-chain result

### Status text

Hashing:

> Calculating the hash locally…

Ready:

> Your content is ready to register. Only the hash will be sent on-chain.

Pending wallet:

> Confirm the transaction in your wallet.

Submitted:

> Transaction submitted to BOT Chain.

Confirmed:

> Proof registered successfully.

Duplicate:

> This wallet has already registered the same content hash.

Verified:

> Matching proof found on BOT Chain.

Not found:

> No registration was found for this wallet and content hash.

### Privacy reassurance

> ProofBOT does not upload your selected text or file. Hashing happens in your browser.

---

## 25. Testing Requirements

### Smart contract

Run all contract tests described earlier.

### Frontend unit tests

At minimum test:

- Exact text-to-hash behavior
- Whitespace changes produce different hashes
- File-byte hashing
- Hash format validation
- Address validation
- Metadata URL scheme validation
- Metadata byte-length validation
- Asset enum mapping
- Explorer URL construction
- Contract response formatting
- Duplicate-proof handling
- Human-readable error mapping

### Component/integration tests

At minimum test:

- Register form disabled states
- Text/file mode switching
- Local hash display
- Wallet disconnected state
- Wrong-network state
- Duplicate registration state
- Transaction pending state
- Successful registration state
- Verify-found state
- Verify-not-found state
- Invalid route parameters
- My Proofs empty state

Mock wallet and RPC behavior. Do not make CI depend on a live public RPC.

### End-to-end smoke test

Where practical, create a browser smoke test covering:

1. Load the home page.
2. Enter text.
3. Confirm a hash appears.
4. Open Verify mode.
5. Validate form errors.
6. Open a mock proof page.

A live-chain E2E test may be optional and gated behind environment variables.

### Required quality commands

The root repository must expose commands equivalent to:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm contracts:compile
pnpm contracts:test
pnpm build
```

All must pass before completion.

---

## 26. Continuous Integration

Create a GitHub Actions workflow that:

1. Checks out the repository.
2. Installs the declared Node and pnpm versions.
3. Restores dependency caching.
4. Installs dependencies with a frozen lockfile.
5. Compiles the contract.
6. Runs contract tests.
7. Runs frontend/unit tests.
8. Runs linting.
9. Runs TypeScript checks.
10. Runs the production frontend build.

CI must not require deployment secrets or a live BOT Chain RPC.

---

## 27. README Requirements

The finished `README.md` must include:

- Product description
- Screenshot placeholder or actual screenshot
- How ProofBOT works
- Privacy model
- Provenance/legal limitation
- Architecture overview
- Repository structure
- Prerequisites
- Installation
- Environment variables
- Local development
- Contract compilation
- Contract tests
- Frontend tests
- BOT Chain testnet deployment
- BOT Chain mainnet deployment safety gate
- ABI export process
- Frontend production build
- Deployment records
- Contract address section
- BOT Chain links supplied in this brief
- License
- Security reporting instructions

Include these exact links:

- https://www.botchain.ai
- https://dev-docs.botchain.ai/docs/intro
- https://botchain.notion.site/bot-chain-ecosystem-support-program-en
- https://www.botchain.ai/project-party

---

## 28. Mainnet Deployment Checklist

Do not deploy until every applicable item is complete.

### Documentation and configuration

- [ ] Official developer documentation reviewed
- [ ] Mainnet RPC confirmed
- [ ] Mainnet chain ID independently returns `677`
- [ ] Native currency details confirmed
- [ ] Explorer URL confirmed
- [ ] Explorer verification method confirmed
- [ ] Contract address environment flow tested

### Contract

- [ ] Contract compiles without warnings requiring action
- [ ] Unit tests pass
- [ ] Static analysis reviewed
- [ ] No owner or privileged role
- [ ] No payable registration path
- [ ] No withdrawal function
- [ ] No external calls
- [ ] Metadata maximum enforced
- [ ] Duplicate behavior confirmed
- [ ] Event indexing confirmed
- [ ] Source code and compiler settings ready for verification

### Frontend

- [ ] Lint passes
- [ ] Type checking passes
- [ ] Unit/component tests pass
- [ ] Production build passes
- [ ] Wallet connect works
- [ ] Add/switch chain works
- [ ] Registration simulation works
- [ ] Duplicate check works
- [ ] Verify flow works without wallet
- [ ] Proof links work
- [ ] Explorer links work
- [ ] Mobile layout reviewed
- [ ] Privacy notice visible
- [ ] Legal/provenance limitation visible

### Deployment safety

- [ ] Deployer address confirmed
- [ ] Deployer has enough BOT for gas
- [ ] Private key loaded only from secure environment
- [ ] `CONFIRM_MAINNET_DEPLOYMENT=true`
- [ ] RPC chain check passes
- [ ] Final contract bytecode matches tested build
- [ ] Deployment record will not overwrite an existing record
- [ ] Git commit recorded

### Post-deployment

- [ ] Receipt confirmed
- [ ] Deployment JSON saved
- [ ] ABI exported
- [ ] Frontend address updated
- [ ] Contract source verification attempted
- [ ] One real registration smoke-tested
- [ ] One verification smoke-tested
- [ ] Explorer links checked
- [ ] README contract address updated

---

## 29. Acceptance Criteria

The MVP is complete only when all of the following are true:

1. A user can hash non-empty text locally.
2. A user can hash a supported local file without uploading it.
3. The UI displays the exact Keccak-256 hash.
4. A wallet can connect.
5. The UI detects whether the wallet is on BOT Chain.
6. The UI can request a chain switch or add BOT Chain using verified values.
7. A user can register a proof with one contract transaction.
8. The contract rejects a zero hash.
9. The contract rejects duplicate registrations by the same wallet.
10. Another wallet can register the same content hash.
11. Metadata over 200 bytes is rejected.
12. A verifier can check a creator/content pair without connecting a wallet.
13. A verified proof shows creator, timestamp, category, hash, and explorer link.
14. A missing proof is clearly distinguished from an RPC error.
15. A shareable proof URL loads the correct on-chain record.
16. "My Proofs" reads creator-filtered event logs.
17. No raw user content is written on-chain.
18. No raw user content is sent to an application backend.
19. No deployer secret is exposed to the frontend or repository.
20. Contract tests pass.
21. Frontend tests pass.
22. Linting passes.
23. Type checking passes.
24. Production build passes.
25. CI passes without live-chain secrets.
26. Documentation explains setup and deployment.
27. Mainnet deployment is protected by an explicit safety flag.
28. The application displays the provenance limitation.
29. The BOT Chain links in this brief appear in the finished README.
30. The deployed contract address and deployment block can be configured without editing source code.

---

## 30. Recommended Implementation Order

1. Initialize the pnpm workspace.
2. Create the Hardhat contract package.
3. Implement `ProofBOTRegistry`.
4. Add comprehensive contract tests.
5. Add deployment and ABI-export scripts.
6. Add chain-ID validation and mainnet deployment safety gate.
7. Create the Next.js frontend.
8. Add validated BOT Chain configuration.
9. Implement text and file hashing utilities.
10. Implement the read-only verify flow.
11. Implement wallet connection and network switching.
12. Implement proof registration.
13. Implement shareable proof pages.
14. Implement event-based My Proofs.
15. Add user-friendly error mapping.
16. Add accessibility and responsive styling.
17. Add frontend tests.
18. Add root scripts and CI.
19. Write README and SECURITY documentation.
20. Run all checks.
21. Test on BOT Chain testnet when official parameters and funds are available.
22. Prepare, but do not automatically execute, mainnet deployment.

---

## 31. Suggested Ecosystem Application Description

> **ProofBOT is a lightweight provenance and timestamping primitive for AI assets on BOT Chain. Users can register cryptographic hashes of prompts, datasets, model cards, agent outputs, and other digital assets through a single transaction without exposing the underlying content. Any third party can independently verify a registration using the original asset and creator wallet. ProofBOT demonstrates BOT Chain's EVM developer experience while providing reusable infrastructure for AI applications, creators, researchers, and autonomous agents.**

---

## 32. Suggested Launch Copy

### One-line description

ProofBOT timestamps hashes of AI assets on BOT Chain without uploading the original content.

### Longer description

ProofBOT helps creators, researchers, and AI builders register cryptographic fingerprints of prompts, datasets, model cards, agent outputs, and other digital assets. Hashing happens locally in the browser, and only the resulting hash plus optional public metadata is recorded on BOT Chain. Anyone with the original content can later calculate the same hash and verify the wallet and blockchain timestamp.

### Important limitation

A ProofBOT registration is evidence that a wallet registered a specific hash at a specific blockchain timestamp. It is not conclusive evidence of identity, legal authorship, copyright ownership, originality, or exclusive rights.

---

## 33. Final GPT CLI Deliverables

The completed repository should contain:

- Working contract source
- Passing contract tests
- Deployment scripts
- ABI export process
- Mainnet safety checks
- Working responsive frontend
- Local text/file hashing
- Wallet integration
- BOT Chain configuration
- Register flow
- Verify flow
- Proof page
- My Proofs page
- Error handling
- Unit and component tests
- CI workflow
- README
- SECURITY policy
- MIT license
- Environment examples
- Deployment record documentation

Do not report the project as complete until the full test, lint, type-check, contract compile, and production build suite has been run successfully.

---

## 34. Source Links Supplied for BOT Chain Context

- https://www.botchain.ai
- https://dev-docs.botchain.ai/docs/intro
- https://botchain.notion.site/bot-chain-ecosystem-support-program-en
- https://www.botchain.ai/project-party
