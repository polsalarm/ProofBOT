# 🔗 ProofBOT

**Hash it. Stamp it. Verify it.**

[![License: MIT](https://img.shields.io/badge/License-MIT-informational)](LICENSE)
[![Node](https://img.shields.io/badge/Node-24.14.1-339933?logo=node.js&logoColor=white)](.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-10.33.2-F69220?logo=pnpm&logoColor=white)](pnpm-workspace.yaml)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=next.js&logoColor=white)](apps/web)
[![Solidity](https://img.shields.io/badge/Solidity-Hardhat-363636?logo=solidity&logoColor=white)](packages/contracts)
[![Chain](https://img.shields.io/badge/BOT%20Chain-677%20%2F%20968-6C4CE0)](#verified-bot-chain-configuration)

ProofBOT is a lightweight provenance and timestamping application for AI assets on BOT Chain. It hashes prompts, datasets, model cards, agent outputs, and other digital assets locally in the browser, then registers only the resulting Keccak-256 hash and an optional public metadata URI. Anyone who has the original content and creator wallet can independently check the on-chain timestamp.

> Screenshot placeholder: add a reviewed desktop/mobile product screenshot here after the final UI is deployed.

ProofBOT records that a wallet registered a cryptographic hash at a BOT Chain timestamp. This record does **not** by itself establish legal authorship, copyright ownership, originality, identity, or exclusive rights.

## 🧩 Problem

AI-assisted work (prompts, datasets, model cards, agent outputs) is trivial to copy and hard to date. Once a file leaves your machine there is usually no independent, low-trust way to show *what* you had and *when* you had it:

- Screenshots and file timestamps are easy to fake or silently altered by the OS/filesystem.
- Centralized "proof of creation" services require you to upload the actual content to a third party, and their database is a single point of trust and failure.
- Existing notarization tools are often paid, closed, or coupled to a platform you don't control.

None of these give a permanent, independently verifiable, tamper-evident record that anyone — not just the issuing service — can check.

## 💡 Why we're building this

ProofBOT exists to make that record cheap, boring, and trust-minimized:

- **Non-custodial**: only a hash and wallet address go on-chain — never the original content. Nothing to leak, nothing to host.
- **No backend to trust or maintain**: hashing happens in the browser, verification is a read-only contract call. If ProofBOT the app disappears, the on-chain record and a public RPC endpoint are still enough to verify.
- **Cheap and simple**: BOT Chain gives low-cost transactions for a single-purpose registry contract, so timestamping stays affordable for individual creators, not just enterprises.
- **A building block, not a platform**: the registry is intentionally minimal (hash + category + optional metadata URI) so it can be composed into other provenance or attribution tooling later, instead of locking users into one UI.

## How ProofBOT works

1. The browser converts the exact text or file bytes to a Keccak-256 hash without trimming or normalizing them.
2. A connected wallet registers the hash, asset category, and optional public `https://` or `ipfs://` metadata URI in one registry transaction.
3. The immutable registry binds that content hash to the registering wallet and block timestamp.
4. Verification hashes the supplied content again and performs a read-only contract lookup; a wallet connection is not required.
5. Shareable proof routes and **My Proofs** use contract reads and creator-filtered event logs rather than a database.

Changing even one byte produces a different hash. The original content is never written to the contract.

## Privacy model

- Text and file hashing happens entirely in the browser. ProofBOT has no upload backend or application database.
- Only the hash, wallet, timestamp, category, and optional metadata URI become public on-chain.
- A hash is not encryption. Public hashes can reveal information when the source material is predictable or easily guessed.
- Metadata URIs are public and permanent. Never include confidential data, tokens, credentials, or private storage links.
- The MVP includes no content analytics and never automatically fetches arbitrary metadata.

## Architecture

```text
Local text/file bytes
        |
        v
Browser-only Keccak-256 -----> Next.js App Router UI
                                      |
                    viem/wagmi reads, logs, and wallet writes
                                      |
                                      v
                         ProofBOTRegistry on BOT Chain
```

The monorepo contains a frontend-only Next.js application and one non-upgradeable Solidity contract. There is no centralized API, database, token, NFT, owner role, contract fee, or custody path. The frontend consumes an ABI exported from the compiled Hardhat artifact so there is no manually maintained duplicate.

## Repository structure

```text
apps/web/                 Next.js frontend, browser hashing, wallet and RPC flows
packages/contracts/       Solidity registry, Hardhat tests, deploy and ABI scripts
deployments/              Public deployment-record documentation and JSON records
scripts/                  Root deployment-configuration validation
.github/workflows/        Secret-free continuous integration
```

## Verified BOT Chain configuration

The official BOT Chain developer documentation is the technical source of truth. Values reviewed for this build are:

| Network | Chain ID | RPC | Explorer | Notes |
| --- | ---: | --- | --- | --- |
| BOT Chain mainnet | `677` | `https://rpc.botchain.ai` | `https://scan.botchain.ai` | Native asset: BOT |
| BOT Chain testnet | `968` | `https://rpc.bohr.life` | `https://scan.bohr.life` | Faucet: `https://faucet.botchain.ai` |

The official material reviewed for this MVP does not document public RPC rate limits, recommended gas overrides, or a source-verification API. The mainnet explorer currently provides a manual verification interface at https://scan.botchain.ai/contract-verification. Reconfirm all network and verification details immediately before a production deployment.

### Event-log RPC caveat

The official JSON-RPC endpoint documentation says `eth_getLogs` is disabled on the listed public mainnet endpoints. Registration and direct proof reads can use the official RPC, but **My Proofs** requires an explicitly configured trusted endpoint that supports log queries (or an official WebSocket/log-capable endpoint). Do not silently substitute another chain or an unreviewed provider. The UI reports log-query failures separately from an empty proof history.

## Prerequisites

- Node.js `24.14.1` (declared in `.nvmrc`)
- Corepack and pnpm `10.33.2`
- An EVM wallet for registration or deployment
- Testnet BOT from the official faucet for testnet transactions
- A separate, securely managed deployer key only when deploying the contract

## Installation

```bash
corepack enable
pnpm install
```

The lockfile is committed. CI installs with `pnpm install --frozen-lockfile`.

## Environment variables

Copy the package examples before development:

```bash
cp packages/contracts/.env.example packages/contracts/.env
cp apps/web/.env.example apps/web/.env.local
```

PowerShell equivalents use `Copy-Item`.

### Contract and deployment

| Variable | Purpose |
| --- | --- |
| `BOTCHAIN_MAINNET_RPC_URL` | Explicit mainnet RPC used for validation and deployment |
| `BOTCHAIN_TESTNET_RPC_URL` | Explicit testnet RPC used for validation and deployment |
| `BOTCHAIN_TESTNET_CHAIN_ID` | Expected testnet chain ID (`968` for the reviewed configuration) |
| `DEPLOYER_PRIVATE_KEY` | Secret 32-byte deployer key; never commit or expose to the frontend |
| `CONFIRM_MAINNET_DEPLOYMENT` | Must equal exactly `true` before mainnet deployment |
| `BOTCHAIN_EXPLORER_API_URL` | Optional; leave empty until an official verification API is confirmed |
| `BOTCHAIN_EXPLORER_API_KEY` | Optional secret for a confirmed explorer API |
| `BOTCHAIN_TESTNET_EXPLORER_API_URL` | Optional testnet verification API; leave empty until confirmed |
| `BOTCHAIN_TESTNET_EXPLORER_API_KEY` | Optional testnet explorer secret |
| `DEPLOYMENT_CONFIRMATIONS` | Optional receipt confirmation override (defaults: mainnet `2`, testnet `1`) |
| `PROOFBOT_ENV_FILE` | Optional path used by the root validator instead of `packages/contracts/.env` |

### Frontend

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BOTCHAIN_CHAIN_ID` | Public chain ID; production expects `677` |
| `NEXT_PUBLIC_BOTCHAIN_RPC_URL` | Public read RPC; use a reviewed log-capable endpoint for **My Proofs** |
| `NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL` | Explorer base URL |
| `NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS` | Deployed registry address |
| `NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK` | Earliest block used for creator event-log scans |
| `NEXT_PUBLIC_PROOFBOT_LOG_CHUNK_SIZE` | Maximum block span per creator log query (example default: `5000`) |

No secret may use the `NEXT_PUBLIC_` prefix. Production configuration fails clearly when required public deployment values are absent or malformed.

## Local development

After configuring `apps/web/.env.local`:

```bash
pnpm dev
```

The app is frontend-only. Local verification does not require a wallet, while registration needs an injected EVM wallet and the configured BOT Chain network.

## Quality commands

Run the complete local quality suite before review or deployment:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm contracts:compile
pnpm contracts:test
pnpm build
```

Useful focused commands:

```bash
pnpm test:config
pnpm web:test
pnpm contracts:coverage
```

Tests mock wallet/RPC behavior and do not depend on a live public chain.

## Frontend tests

```bash
pnpm web:test
```

The Vitest suites cover local hashing and validation utilities as well as register, verify, proof-page, wallet/network, transaction, and empty-history states with mocked wallet and RPC behavior. Use `pnpm test` to run both frontend and contract tests together with the root deployment-safety tests.

## Contract compilation and tests

```bash
pnpm contracts:compile
pnpm contracts:test
```

The registry rejects the zero hash, duplicate registrations by the same wallet, metadata over 200 UTF-8 bytes, and accidental native-token transfers. Different wallets may register the same content hash.

## ABI export

```bash
pnpm abi:export
```

The export command reads the compiled `ProofBOTRegistry` artifact and writes `apps/web/lib/generated/ProofBOTRegistry.json` in `{ "abi": [...] }` artifact shape. Never edit a second ABI by hand. The root `pnpm build` compiles and exports before building the frontend.

## Frontend production build

Configure the required `NEXT_PUBLIC_` values, then run:

```bash
pnpm build
```

This command compiles the contract, exports its ABI, and creates the production Next.js build.

## BOT Chain testnet deployment

1. Set `BOTCHAIN_TESTNET_RPC_URL=https://rpc.bohr.life`, `BOTCHAIN_TESTNET_CHAIN_ID=968`, and a disposable funded `DEPLOYER_PRIVATE_KEY` in `packages/contracts/.env`.
2. Obtain testnet funds only from https://faucet.botchain.ai and verify the wallet network.
3. Independently validate the RPC and key format without sending a transaction:

   ```bash
   pnpm validate:deployment -- --network testnet
   ```

4. Run all quality commands, then deploy:

   ```bash
   pnpm contracts:deploy:testnet
   ```

5. Check the saved receipt against https://scan.bohr.life, export the ABI, and configure the frontend address and deployment block.

## BOT Chain mainnet deployment safety gate

Mainnet deployment is intentionally manual. Do not proceed until tests, lint, type checking, contract compilation, the production build, bytecode review, deployer funding, and official network re-verification all pass.

1. Set `BOTCHAIN_MAINNET_RPC_URL=https://rpc.botchain.ai` and a securely supplied `DEPLOYER_PRIVATE_KEY` outside source control.
2. Set `CONFIRM_MAINNET_DEPLOYMENT=true` explicitly. Any other value is rejected.
3. Validate the RPC-returned chain ID (`677`) without sending a transaction:

   ```bash
   pnpm validate:deployment -- --network mainnet
   ```

4. Review the selected network, deployer, balance, compiled bytecode, and existing deployment records.
5. Deploy only through the guarded command:

   ```bash
   pnpm contracts:deploy:mainnet
   ```

The deployment script independently calls `eth_chainId`, refuses mismatches, will not overwrite an existing mainnet record without its explicit `--overwrite` task option, waits for a receipt, and records deployment metadata. The root validator never signs or sends a transaction. If an overwrite is genuinely required, the fully explicit command is `pnpm --filter @proofbot/contracts exec hardhat deploy-proofbot --network botchainMainnet --overwrite`; review and preserve the existing record before using it.

## Deployment records

Successful deployments create JSON records under `deployments/` with the network, chain ID, contract and deployer addresses, transaction hash, block, UTC time, compiler, source-verification status, and Git commit. Mainnet uses `deployments/botchain-mainnet.json`; append-safe testnet records use `deployments/botchain-testnet-<lowercase-contract-address>.json`. See [`deployments/README.md`](deployments/README.md) for the schema and handling rules.

Treat a record as valid only after matching it to the explorer receipt. Keep `sourceVerified` false until verification is complete, then update the record and this README through normal review.

## Contract addresses

| Network | Contract address | Deployment block | Status |
| --- | --- | ---: | --- |
| BOT Chain testnet | Not deployed | — | Awaiting reviewed deployment |
| BOT Chain mainnet | Not deployed | — | Awaiting reviewed deployment |

No deployment was performed as part of the repository build. Populate `NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS` and `NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK` from a verified deployment record; do not edit application source to change them.

## BOT Chain resources

- https://www.botchain.ai
- https://dev-docs.botchain.ai/docs/intro
- https://botchain.notion.site/bot-chain-ecosystem-support-program-en
- https://www.botchain.ai/project-party

## Security

Read [`SECURITY.md`](SECURITY.md) before handling deployment keys or reporting a vulnerability. Use a private GitHub security report where available and never include real keys or confidential source content.

## License

ProofBOT is released under the [MIT License](LICENSE).
