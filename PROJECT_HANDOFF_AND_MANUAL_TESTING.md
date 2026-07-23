# ProofBOT handoff, manual testing, and rollout plan

Last updated: 2026-07-17

This document is the practical handoff for ProofBOT. It records what is complete, what still depends on deployment or external services, what you need on your machine, how to test the current application manually, and the recommended phases for reaching BOT Chain mainnet.

## Read this first

- The application and contract are implemented and the automated quality suite passes.
- No ProofBOT contract has been deployed to BOT Chain testnet or mainnet.
- Local hashing and UI behavior can be tested immediately without a wallet or blockchain transaction.
- Registration, on-chain verification, proof history, and explorer links need a real deployed contract address and deployment block.
- The current frontend is configured for BOT Chain **mainnet only** (`677`). The deployment scripts also support testnet (`968`), but a frontend testnet profile must be added before doing safe end-to-end browser testing on testnet.
- Do not use mainnet merely to work around the missing frontend testnet profile. Add testnet support first.

## Current status

| Area | Status | Notes |
| --- | --- | --- |
| Solidity registry | Complete | Compiles with Solidity `0.8.24`; no owner, upgrade, fee, custody, or withdrawal path |
| Register UI | Complete | Local text/file hashing, category, optional metadata, wallet write, receipt states |
| Verify UI | Complete | Read-only exact-content verification; wallet connection not required |
| Shareable proof route | Complete | `/proof/<creator>/<hash>` with route validation and contract lookup |
| My Proofs | Complete in code | Needs a deployed contract and an RPC with `eth_getLogs` enabled |
| Wallet connection | Complete for injected EVM wallets | MetaMask Extension is the recommended manual-test wallet |
| Deployment tooling | Complete | Testnet/mainnet profiles, chain-ID check, key validation, mainnet confirmation gate, records, ABI export |
| Automated tests | Complete | `94` passing: 8 root/configuration, 34 contract, 52 frontend |
| Contract coverage | Complete | 100% statements, branches, functions, and lines |
| Lint/type checks/build | Complete | Final lint, all TypeScript checks, contract compile, ABI export, and Next.js production build passed |
| Git/release baseline | Not done | Git is initialized, but there is no first commit, remote, pushed branch, release tag, or hosted CI run yet |
| Testnet deployment | Not done | No address, transaction, block, or deployment record exists |
| Mainnet deployment | Not done | Intentionally blocked pending testnet validation and explicit approval |
| Explorer source verification | Not done | Official material currently documents a manual verification page, not a confirmed API |
| Production hosting/domain | Not done | No hosting project, public URL, or domain has been configured |
| Live wallet smoke test | Not done | Requires testnet frontend support plus a testnet deployment |

## What was implemented

### Smart contract

- Wallet-bound proof registration using an exact `bytes32` content hash.
- Deterministic proof IDs derived from creator wallet plus content hash.
- Asset categories for prompts, datasets, model cards, AI-agent outputs, and other digital assets.
- Optional public metadata limited to 200 UTF-8 bytes.
- Duplicate rejection for the same wallet and content hash.
- The same content may be registered by different wallets.
- Immutable proof lookup and existence checks.
- `ProofRegistered` events indexed for creator history.
- Zero-hash, oversized metadata, duplicate, and accidental BOT-transfer protection.
- Guarded deployment scripts and append-safe deployment records.

### Frontend

- Responsive Next.js App Router application.
- Exact local Keccak-256 hashing of text and files.
- Text whitespace, capitalization, line breaks, and Unicode are preserved.
- File hashing is browser-only with a 25 MB limit.
- Raw text and files are never sent to the contract.
- Registration, duplicate checks, simulation, wallet confirmation, receipt confirmation, and success/error states.
- Read-only verification without connecting a wallet.
- Shareable proof pages and creator-filtered My Proofs history.
- Explorer links, copying, responsive navigation, empty states, privacy, legal, and provenance limitations.
- Clear deployment-not-configured and logs-capable-RPC errors.

### Operations and documentation

- Frozen pnpm workspace and pinned Node/pnpm versions.
- Secret-free CI for install, configuration validation, compilation, tests, lint, type checks, and production build.
- ABI generated from the compiled artifact rather than hand-maintained.
- Mainnet deployment requires the correct RPC chain ID, an explicit `CONFIRM_MAINNET_DEPLOYMENT=true`, and a valid private key.
- RPC URLs are redacted before deployment logs can expose embedded credentials.
- README, security policy, license, environment examples, and deployment-record documentation.

## What is still not done

### Required before a safe public launch

1. Create the initial reviewed Git commit, add the intended remote, push it, and confirm CI on that exact commit. Deploying before this would record the Git revision as `unknown`.
2. Add a selectable BOT Chain testnet frontend profile.
3. Deploy the contract to BOT Chain testnet.
4. Configure the frontend with the testnet contract address and deployment block.
5. Run real register, verify, duplicate, proof-page, and My Proofs tests on testnet.
6. Confirm whether the chosen testnet RPC supports the required log ranges.
7. Select a trusted logs-capable mainnet RPC for My Proofs. BOT Chain's listed public mainnet RPC disables `eth_getLogs`.
8. Perform a focused external security review before mainnet funds are used.
9. Deploy to mainnet only after an explicit go/no-go review.
10. Verify the contract source manually in the explorer if no official verification API is available.
11. Update the README and frontend environment with the verified mainnet address and deployment block.
12. Rebuild with real production values and deploy the frontend to a reviewed hosting account/domain.
13. Add final desktop/mobile screenshots and run a public-URL browser smoke test.

### Deliberately outside the MVP

These are intentional product boundaries, not incomplete scaffolding:

- No database or application backend.
- No raw prompt, file, dataset, or output storage.
- No user accounts, email login, or identity verification.
- No token, NFT, marketplace, bridge, or payment system.
- No contract owner, upgrade proxy, deletion, or administrative recovery.
- No claim that a proof establishes copyright, identity, originality, or legal ownership.
- No automatic fetching of arbitrary metadata URLs.

## What you need

### For local UI testing now

- Windows, macOS, or Linux.
- Node.js `24.14.1`.
- pnpm `10.33.2` through Corepack or a trusted pnpm installation.
- A modern browser. Chrome, Brave, or Edge is easiest for extension-wallet testing.
- No database, Docker container, API key, BOT token, or wallet is needed for local hashing/UI checks.

### For live testnet testing later

- MetaMask Extension from the [official MetaMask download page](https://metamask.io/download).
- A dedicated, low-value test wallet. Do not reuse a wallet holding valuable mainnet assets.
- A separate disposable testnet deployer account/private key.
- Test BOT from the [official BOT Chain faucet](https://faucet.botchain.ai/basic).
- A completed frontend testnet profile.
- A deployed testnet contract address, deployment transaction, and deployment block.
- A trusted testnet RPC endpoint.

### For mainnet later

- A reviewed mainnet deployment plan and explicit approval.
- Native BOT for deployment and registration gas.
- A securely controlled deployer key supplied outside source control.
- A trusted logs-capable RPC provider for My Proofs.
- A hosting account, production URL/domain, and HTTPS.
- A private vulnerability-reporting/support channel.
- Preferably a hardware-backed or otherwise tightly controlled signing process. The current Hardhat deploy script accepts an environment-supplied EOA private key; direct hardware-wallet or multisig deployment is not implemented yet.

## Wallets

### Recommended: MetaMask Extension

BOT Chain's official Quick Guide lists MetaMask and BO Wallet. MetaMask Extension is the recommended desktop testing option because ProofBOT currently connects through the standard injected EVM provider used by browser extensions.

Install MetaMask only from <https://metamask.io/download>. Never install a wallet from an advertisement, direct message, or unverified extension-store link.

### BO Wallet

BO Wallet is also listed by BOT Chain's official documentation, but its current official page focuses on mobile downloads. It has not been manually validated with this local desktop application, and ProofBOT has no BO-Wallet-specific connector.

### Other EVM wallets

Another injected EVM wallet may work because the app uses wagmi's injected connector. Rabby, Coinbase Wallet extension, and similar wallets have not been accepted-tested for this project and are not currently listed as supported choices in the UI. If multiple injected wallets are installed, provider selection may be ambiguous; begin with only MetaMask enabled.

The current MVP does not include WalletConnect/QR pairing, an embedded/email wallet, a named multi-wallet chooser, or direct Ledger/Trezor integration. A hardware wallet may work through MetaMask, but that path has not been manually validated.

### Wallet roles

| Wallet/account | Needed when | Recommendation |
| --- | --- | --- |
| Browser tester | Registering a proof | Dedicated test account with only enough BOT for gas |
| Testnet deployer | Deploying the testnet contract | Separate disposable account; store the private key only in ignored local secret storage |
| Second test account | Testing cross-wallet behavior | Optional; confirms a second wallet can register the same hash |
| Mainnet deployer | Mainnet deployment | Separate tightly controlled account; do not use until security/go-live review |
| Verification user | Read-only Verify page | No wallet required |

ProofBOT will never ask for a seed phrase or private key in the browser. The deployment CLI uses `DEPLOYER_PRIVATE_KEY`; the web application does not.

## BOT Chain network settings

Verify custom network values against the [official BOT Chain Quick Guide](https://dev-docs.botchain.ai/docs/Developers/quick-guide/) before accepting a wallet prompt.

| Field | Testnet | Mainnet |
| --- | --- | --- |
| Network name | BOT Chain Testnet | BOT Chain Mainnet |
| Chain ID | `968` | `677` |
| RPC URL | `https://rpc.bohr.life` | `https://rpc.botchain.ai` |
| Native currency symbol | `BOT` | `BOT` |
| Explorer | `https://scan.bohr.life` | `https://scan.botchain.ai` |
| Faucet | `https://faucet.botchain.ai/basic` | None; real BOT is required |

MetaMask setup:

1. Open MetaMask and select the network menu.
2. Choose **Add a custom network**.
3. Enter the values from the table exactly.
4. Save the network.
5. Confirm that the chain ID and RPC shown by MetaMask match the official BOT Chain documentation.

MetaMask's official instructions are at <https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc>. Custom networks may need to be added separately on each device.

## Manual test track A: test locally now without a deployment

This track tests local hashing, validation, responsive UI, navigation, and deployment-disabled behavior. It does not send transactions.

### 1. Open PowerShell in the project

```powershell
Set-Location 'C:\Users\Admin\Documents\BotChain-project\ProofBOT'
node --version
pnpm --version
```

Expected versions:

- Node.js: `v24.14.1`
- pnpm: `10.33.2`

If pnpm is not available, enable Corepack first:

```powershell
corepack enable
```

### 2. Install exactly from the lockfile

```powershell
pnpm install --frozen-lockfile
```

### 3. Create the local frontend environment

```powershell
Copy-Item 'apps/web/.env.example' 'apps/web/.env.local'
```

For this deployment-free test, leave these two values blank:

```dotenv
NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS=
NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK=
```

Blank deployment values are accepted by `pnpm dev` so you can test hashing and layout. Production builds intentionally require both values.

### 4. Start the application

```powershell
pnpm dev
```

Open <http://localhost:3000>.

### 5. Local manual checklist

- [ ] The home page loads and shows Register and Verify modes.
- [ ] A warning says the registry deployment is not configured.
- [ ] Enter `ProofBOT browser smoke` in text mode.
- [ ] Confirm the displayed hash is `0xa28947e37ab2f4a6eb6ec97c23980b35d50890295d70b5193a89afe4e61dc0ef`.
- [ ] Add one space or line break and confirm the hash changes.
- [ ] Remove that exact byte and confirm the original hash returns.
- [ ] Switch to File mode and select a non-empty file under 25 MB.
- [ ] Confirm the file name, size, hash, and local-only privacy message appear.
- [ ] Confirm an empty file and a file over 25 MB show an error.
- [ ] Test each asset category.
- [ ] Enter a valid `https://` metadata URL and a valid `ipfs://` URI.
- [ ] Confirm `http://`, malformed URLs, and metadata over 200 UTF-8 bytes are rejected.
- [ ] Open Verify and confirm an invalid creator address shows validation feedback.
- [ ] Confirm no wallet is required merely to use the Verify form.
- [ ] Confirm Register/Verify chain actions remain disabled while deployment is unconfigured.
- [ ] Open My Proofs and confirm it requests a wallet connection.
- [ ] Open About, Privacy, and Legal pages.
- [ ] Test at desktop width and approximately 400 x 850 mobile width with no horizontal overflow.
- [ ] Open browser developer tools and confirm there are no unexpected console errors.

Stop the dev server with `Ctrl+C`.

### 6. Run the automated suite yourself

Local development can leave deployment values blank for lint, tests, and type checks:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm contracts:compile
pnpm contracts:coverage
```

For a production build, supply a verified contract address and block after deployment. Build-only placeholders may be used in CI to exercise validation, but a placeholder build must never be published as a real deployment.

## Manual test track B: live testnet end to end

Do this only after Phase 1 adds frontend testnet support. Setting `NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=968` today will correctly fail validation because the current frontend only accepts mainnet `677`.

### 1. Prepare MetaMask testnet

1. Create a dedicated test account.
2. Add BOT Chain Testnet using the network table above.
3. Visit <https://faucet.botchain.ai/basic>.
4. Submit only the public wallet address to the faucet.
5. Confirm the test BOT balance in MetaMask and the testnet explorer.

Test tokens have no real value. Never pay anyone for faucet tokens.

### 2. Configure the testnet deployer

```powershell
Copy-Item 'packages/contracts/.env.example' 'packages/contracts/.env'
```

Edit the ignored `packages/contracts/.env`:

```dotenv
BOTCHAIN_TESTNET_RPC_URL=https://rpc.bohr.life
BOTCHAIN_TESTNET_CHAIN_ID=968
DEPLOYER_PRIVATE_KEY=0xYOUR_DISPOSABLE_TESTNET_PRIVATE_KEY
CONFIRM_MAINNET_DEPLOYMENT=false
```

Never commit, paste into chat, screenshot, or share this file. Use a disposable testnet key only.

### 3. Validate before sending anything

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm contracts:compile
pnpm validate:deployment -- --network testnet
```

The validation command checks configuration and live RPC chain identity but does not deploy a contract.

### 4. Deploy the testnet contract

```powershell
pnpm contracts:deploy:testnet
```

After the receipt is confirmed:

1. Open the transaction in <https://scan.bohr.life>.
2. Confirm chain ID, deployer, contract address, status, and block.
3. Keep the generated `deployments/botchain-testnet-<address>.json` record.
4. Confirm the ABI was exported from the compiled artifact.
5. Never copy illustrative zero addresses from documentation.

### 5. Configure the frontend after testnet support exists

The following values become valid only after the frontend testnet profile phase is implemented:

```dotenv
NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=968
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.bohr.life
NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL=https://scan.bohr.life
NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS=0xACTUAL_TESTNET_CONTRACT
NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK=ACTUAL_RECEIPT_BLOCK
NEXT_PUBLIC_PROOFBOT_LOG_CHUNK_SIZE=5000
```

Restart `pnpm dev` after changing public environment values.

### 6. Live browser checklist

Use synthetic, non-confidential content.

- [ ] Connect MetaMask and approve only the intended test account.
- [ ] Switch to BOT Chain Testnet.
- [ ] Register `ProofBOT testnet smoke <date-and-random-suffix>`.
- [ ] Review the destination contract, selected network, and gas before confirming.
- [ ] Confirm pending states appear while the wallet and receipt are pending.
- [ ] Confirm the explorer transaction succeeds.
- [ ] Open the generated proof route and compare creator, hash, category, timestamp, and metadata.
- [ ] Disconnect the wallet and Verify the same exact content plus creator address.
- [ ] Change one character and confirm no matching registration is found.
- [ ] Use the wrong creator wallet and confirm no match.
- [ ] Try registering the same hash again with the same wallet and confirm duplicate rejection.
- [ ] Optionally use a second account to confirm a different wallet may register the same hash.
- [ ] Open My Proofs and confirm the new event appears newest first.
- [ ] Refresh My Proofs and confirm no duplicate event rows appear.
- [ ] Register and verify one small local file.
- [ ] Reject one wallet transaction and confirm the UI returns an actionable error rather than a false success.

Record the transaction hashes and test results in a release checklist without recording any secret or raw confidential content.

## Mainnet rollout

Do not begin mainnet deployment until testnet exit criteria are complete.

1. Reconfirm chain ID `677`, RPC, explorer, wallet guidance, and faucet/DEX information from official BOT Chain sources.
2. Select a logs-capable trusted RPC for My Proofs. The official public mainnet endpoint is documented as not supporting `eth_getLogs`.
3. Complete a security review of the final bytecode, deployment scripts, frontend environment, and wallet transaction display.
4. Prepare a dedicated funded deployer and decide how its private key will be injected securely.
5. Set `CONFIRM_MAINNET_DEPLOYMENT=true` only for the intentional deployment session.
6. Run `pnpm validate:deployment -- --network mainnet`.
7. Run every quality command and a non-published production-build rehearsal.
8. Obtain explicit go/no-go approval.
9. Run `pnpm contracts:deploy:mainnet` once.
10. Verify the receipt and source, then update the deployment record, README, and real production environment.
11. Rebuild the frontend with the real address and deployment block.
12. Publish the frontend, verify HTTPS/domain configuration, and rerun all public-URL smoke tests.

## Recommended phases

Use [PROOFBOT_PHASE_CHECKLIST.md](PROOFBOT_PHASE_CHECKLIST.md) as the standalone actionable checklist for completing and signing off each phase.

| Phase | Work | You need | Exit criteria |
| --- | --- | --- | --- |
| 0. Repository and local acceptance | Create the first reviewed commit/remote, push and confirm CI, then run manual track A | Node, pnpm, browser, Git hosting | CI and local hash/UI/validation checks pass on a known commit |
| 1. Frontend testnet profile | Make chain/env configuration support reviewed `968` testnet values; add tests and visible network labeling | Development change and review | Frontend switches/adds testnet correctly and all suites pass |
| 2. Testnet deployment | Fund disposable deployer, validate RPC, deploy contract, save record, configure app | MetaMask, faucet BOT, disposable key | Explorer-confirmed address/block and production build with real testnet values |
| 3. Testnet live acceptance | Execute register/verify/history/file/duplicate/error checklist | Deployed testnet app and test accounts | Recorded successful testnet transactions and no blocking defects |
| 4. Mainnet readiness | Logs RPC selection, external security review, mainnet signing plan, final go/no-go | Trusted provider, reviewer, funded secure deployer | Written approval and every safety gate green |
| 5. Mainnet and hosting | Deploy once, verify source/record, configure/build/host frontend | Real address/block, hosting/domain | Public HTTPS app passes register, verify, proof, history, and mobile smoke tests |
| 6. Post-launch operations | Monitor RPC availability, support security reports, maintain dependency/security updates | Operational owner | Documented incident, upgrade, and release process |

## Troubleshooting

### Registry deployment is not configured

This is expected before deployment. Local hashing remains available. Chain reads/writes require both:

```dotenv
NEXT_PUBLIC_PROOFBOT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PROOFBOT_DEPLOYMENT_BLOCK=123...
```

They must be supplied together and must come from a verified receipt.

### Production build reports missing deployment values

This is intentional fail-fast behavior. `pnpm dev` may run unconfigured, but a production build requires a contract address and deployment block so an incomplete build is not accidentally published.

### No injected wallet found

- Install and enable MetaMask Extension.
- Unlock it, reload the page, and try again.
- Disable other wallet extensions temporarily if provider selection is ambiguous.
- Do not paste a private key or recovery phrase into the site.

### Wrong network

Check the chain ID against official BOT Chain documentation. The current app requests mainnet `677`; testnet `968` requires the planned frontend testnet profile.

### Insufficient BOT

Registration and deployment are blockchain transactions and require native BOT for gas. Use only faucet test BOT on testnet. Do not move real assets into a test wallet.

### My Proofs says history is unavailable

The configured RPC must support `eth_getLogs`. Direct proof reads can work even when history queries are disabled. Configure a reviewed logs-capable endpoint and restart/rebuild the frontend.

### Exact content does not verify

The hash includes every byte. Check spaces, line endings, capitalization, Unicode, file version, and the creator wallet address. A visually similar string or re-saved file can have a different hash.

### Duplicate registration

The same wallet cannot register the same hash twice. This is expected contract behavior. Another wallet may independently register that hash.

## Security rules

- Never share or commit a seed phrase, private key, populated `.env`, RPC credential, or explorer API key.
- Never use a `NEXT_PUBLIC_` variable for a secret; those values are embedded into browser code.
- Use synthetic test content. A hash is public and is not encryption.
- Metadata URLs are public and permanent. Do not place credentials, private links, or personal information in them.
- Verify custom network prompts against official documentation before accepting.
- Read [SECURITY.md](SECURITY.md) before any deployment-key work.
- Remember that ProofBOT proves a wallet registered a hash at a timestamp; it does not itself prove legal authorship or ownership.

## Command reference

```powershell
# Development
pnpm dev

# Full automated quality
pnpm lint
pnpm typecheck
pnpm test
pnpm contracts:compile
pnpm contracts:coverage

# ABI
pnpm abi:export

# Configuration preflight; no deployment
pnpm validate:deployment -- --network testnet
pnpm validate:deployment -- --network mainnet

# Deployments; these send real transactions
pnpm contracts:deploy:testnet
pnpm contracts:deploy:mainnet

# Production build; requires verified public address/block
pnpm build
```

## Official references

- BOT Chain Quick Guide: <https://dev-docs.botchain.ai/docs/Developers/quick-guide/>
- BOT Chain JSON-RPC endpoints: <https://dev-docs.botchain.ai/docs/Developers/json-rpc-endpoint/>
- BOT Chain faucet guide: <https://dev-docs.botchain.ai/docs/Developers/claim-test-tbot-tokens/>
- BOT Chain testnet faucet: <https://faucet.botchain.ai/basic>
- BOT Chain testnet explorer: <https://scan.bohr.life>
- BOT Chain mainnet explorer: <https://scan.botchain.ai>
- MetaMask official download: <https://metamask.io/download>
- MetaMask custom network guide: <https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc>
- MetaMask secret-recovery safety: <https://support.metamask.io/start/user-guide-secret-recovery-phrase-password-and-private-keys/>
- Deployment record format: [deployments/README.md](deployments/README.md)
- Main project guide: [README.md](README.md)
