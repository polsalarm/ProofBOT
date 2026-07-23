# ProofBOT phased rollout checklist

Last updated: 2026-07-17

This is the standalone execution checklist for moving ProofBOT from the completed local MVP to testnet, mainnet, public hosting, and ongoing operations. Check an item only when evidence exists. Never mark a deployment item complete from a placeholder address or an unconfirmed transaction.

For detailed setup, wallet instructions, manual test steps, and troubleshooting, use [PROJECT_HANDOFF_AND_MANUAL_TESTING.md](PROJECT_HANDOFF_AND_MANUAL_TESTING.md).

## Status legend

- `[x]` Completed and verified.
- `[ ]` Not completed yet.
- **Blocked** means a required dependency is missing and later phases must not start.
- **Evidence** means a commit, CI run, command output, explorer link, deployment record, screenshot, or signed decision that another person can review.

## Phase summary

| Phase | Current status | Primary blocker | Exit result |
| --- | --- | --- | --- |
| 0. Repository and local acceptance | In progress | No initial commit, remote, hosted CI run, or owner-run manual checklist | Known commit passes CI and local acceptance |
| 1. Frontend testnet profile | Not started | Frontend is currently hardcoded to mainnet chain `677` | UI safely supports reviewed testnet chain `968` |
| 2. Testnet deployment | Not started | Phase 1 and a funded disposable deployer are required | Explorer-confirmed testnet contract and configured build |
| 3. Testnet live acceptance | Not started | Testnet app and contract do not exist yet | Real register/verify/history flows pass with no blocker |
| 4. Mainnet readiness | Not started | Testnet evidence, security review, logs RPC, and signing plan | Written mainnet go/no-go approval |
| 5. Mainnet deployment and hosting | Not started | Phase 4 approval | Verified contract and public HTTPS application |
| 6. Post-launch operations | Not started | Public service is not live | Maintained monitoring, support, incident, and release process |

## Global stop conditions

Stop the rollout immediately if any of these are true:

- A requested network value conflicts with official BOT Chain documentation.
- The RPC reports a chain ID other than the intended `968` testnet or `677` mainnet ID.
- A private key, seed phrase, RPC credential, or populated `.env` appears in Git, screenshots, chat, CI logs, or browser code.
- Any test, lint check, type check, contract compile, ABI export, or production build fails.
- The contract address or deployment block cannot be matched to a successful explorer receipt.
- The wallet shows an unexpected destination contract, network, transaction value, or method.
- Mainnet deployment lacks the exact explicit approval and `CONFIRM_MAINNET_DEPLOYMENT=true` safety gate.
- A production build contains a placeholder contract address.

## Phase 0 — Repository and local acceptance

Status: **In progress**

### Required inputs

- Node.js `24.14.1`.
- pnpm `10.33.2`.
- Git hosting destination and account access.
- Modern desktop browser.
- No wallet or BOT funds are required for this phase.

### Repository baseline

- [x] Git repository initialized on `main`.
- [x] Review the full uncommitted file set.
- [x] Confirm no `.env`, private key, seed phrase, RPC credential, or generated secret is staged.
- [x] Create the initial reviewed commit.
- [x] Add the intended Git remote.
- [x] Push `main` or the reviewed working branch.
- [ ] Confirm the repository's security/private-reporting settings.
- [x] Record the commit hash below.

Commit: `8c614d8`

Remote/repository: `https://github.com/polsalarm/ProofBOT`

### Automated local acceptance

- [x] Frozen-lockfile install passes.
- [x] Frontend lint passes.
- [x] Root, contract, and frontend TypeScript checks pass.
- [x] TypeScript configuration passes under TypeScript 6 and 7 migration checks.
- [x] Root configuration tests pass.
- [x] Contract tests pass.
- [x] Frontend tests pass.
- [x] Solidity contract compiles.
- [x] Solidity coverage is 100% for statements, branches, functions, and lines.
- [x] ABI export runs and rewrites the generated artifact.
- [x] Next.js production build completes with non-published build-validation values.
- [x] Push the exact accepted commit and confirm GitHub Actions passes without deployment secrets.

### Owner-run manual acceptance

Use [Manual test track A](PROJECT_HANDOFF_AND_MANUAL_TESTING.md#manual-test-track-a-test-locally-now-without-a-deployment).

- [ ] Create `apps/web/.env.local` from the example with address/block blank.
- [ ] Start `pnpm dev` and open `http://localhost:3000`.
- [ ] Confirm the deployment-not-configured warning.
- [ ] Confirm the documented deterministic text hash.
- [ ] Confirm a one-byte text change produces a different hash.
- [ ] Test non-empty, empty, and over-25-MB files.
- [ ] Test every asset category and metadata validation.
- [ ] Test invalid creator and proof-route validation.
- [ ] Test About, Privacy, Legal, and My Proofs disconnected states.
- [ ] Test desktop and mobile layouts with no horizontal overflow.
- [ ] Confirm no unexpected console errors or raw-content upload requests.
- [ ] Record tester, date, browser, and result below.

Tester/date/browser: `______________________________`

Evidence: `______________________________`

### Phase 0 exit criteria

- [x] Initial commit and remote exist.
- [x] Hosted CI passes on the recorded commit.
- [ ] Owner-run local manual checklist passes.
- [ ] No unresolved blocker or exposed secret exists.
- [ ] Phase 0 approval is recorded.

Approved by/date: `______________________________`

## Phase 1 — Frontend testnet profile

Status: **In progress**

Implementation complete and merged to `main`. Remaining before exit: a second-person review and the manual MetaMask wallet checklist below.

### Required inputs

- Official BOT Chain testnet values rechecked on the implementation date.
- Reviewed choice: build-time environment profile, explicit UI selector, or separate testnet build. **Decided: build-time environment profile** (`NEXT_PUBLIC_BOTCHAIN_NETWORK`), matching the existing per-network deploy-script pattern.
- Developer and reviewer.

### Implementation checklist

- [x] Define a typed network profile for BOT Chain testnet `968` and mainnet `677`.
- [x] Reject every unsupported chain ID rather than silently falling back.
- [x] Make RPC, explorer, chain name, chain ID, currency, and `testnet` flag derive from the selected profile.
- [x] Remove hardcoded `677` labels from wallet/registration UI.
- [x] Make wallet add/switch requests use the selected profile.
- [x] Make explorer transaction/address links use the selected profile.
- [x] Preserve strict production validation for contract address and deployment block.
- [x] Make the active network unmistakable in development/testnet UI.
- [x] Update `.env.example` with safe testnet/mainnet examples and warnings.
- [x] Add tests for both supported network profiles.
- [x] Add tests that reject unsupported or mismatched chain IDs.
- [x] Add wallet switch/add tests for testnet `968` and mainnet `677`.
- [x] Confirm no private RPC token is accidentally exposed in a public environment value.
- [x] Run lint, type checks, all tests, contract compile, ABI export, and production builds for the intended profiles.
- [ ] Have a second person review the network-selection changes.

### Manual wallet checklist

- [ ] Install MetaMask Extension from the official source.
- [ ] Add BOT Chain Testnet with chain ID `968` and reviewed RPC/explorer values.
- [ ] Connect the intended disposable account.
- [ ] Confirm ProofBOT identifies testnet correctly.
- [ ] Confirm switching from another chain requests testnet `968`, not mainnet.
- [ ] Confirm rejecting the wallet request produces a friendly error.
- [ ] Confirm mainnet remains separately configured and clearly labeled.

### Phase 1 exit criteria

- [x] Testnet and mainnet profiles are explicit and covered by tests.
- [x] Unsupported networks fail safely.
- [ ] MetaMask add/switch behavior is manually verified on testnet.
- [x] Complete automated suite passes.
- [x] Reviewed commit and CI evidence are recorded.

Commit/CI evidence: `37cf7ca` (network profile implementation), `60945de` (unrelated fixup) — CI runs [30037791234](https://github.com/polsalarm/ProofBOT/actions/runs/30037791234) and [30037965597](https://github.com/polsalarm/ProofBOT/actions/runs/30037965597), both green.

Approved by/date: `______________________________`

## Phase 2 — Testnet deployment

Status: **Not started**

### Required inputs

- Phase 1 complete.
- Disposable testnet deployer account.
- Test BOT from the official faucet.
- Ignored `packages/contracts/.env` file.
- Reviewed BOT Chain testnet RPC and explorer.

### Wallet and funding checklist

- [ ] Create a dedicated disposable testnet deployer.
- [ ] Confirm it contains no valuable mainnet assets.
- [ ] Request test BOT using only its public address.
- [ ] Confirm its balance on the testnet explorer.
- [ ] Store its private key only in ignored local secret storage.
- [ ] Confirm the key is never placed in `NEXT_PUBLIC_` configuration.

### Pre-deployment checklist

- [ ] Confirm Phase 1 commit and CI are green.
- [ ] Recheck official testnet chain ID `968`.
- [ ] Recheck `https://rpc.bohr.life` and `https://scan.bohr.life` or document the reviewed replacements.
- [ ] Set `BOTCHAIN_TESTNET_CHAIN_ID=968`.
- [ ] Set a disposable `DEPLOYER_PRIVATE_KEY`.
- [ ] Keep `CONFIRM_MAINNET_DEPLOYMENT=false`.
- [ ] Run `pnpm validate:deployment -- --network testnet`.
- [ ] Run lint, type checks, all tests, contract compile, and coverage.
- [ ] Review compiled bytecode surface and deployer balance.
- [ ] Obtain testnet deployment approval.

Approved by/date: `______________________________`

### Deployment checklist

- [ ] Run `pnpm contracts:deploy:testnet` exactly once for the intended attempt.
- [ ] Record the deployment transaction hash immediately.
- [ ] Confirm the transaction succeeds in the testnet explorer.
- [ ] Confirm deployed bytecode exists at the recorded address.
- [ ] Match deployer, chain ID, contract address, transaction, and block to the generated JSON record.
- [ ] Preserve `deployments/botchain-testnet-<address>.json`.
- [ ] Attempt manual source verification if supported and record the result honestly.
- [ ] Export the ABI from the compiled artifact.
- [ ] Commit the public deployment record and generated ABI; never commit the deployer key.

Transaction: `______________________________`

Contract address: `______________________________`

Deployment block: `______________________________`

Explorer link: `______________________________`

Source verification result: `______________________________`

### Frontend configuration checklist

- [ ] Set the verified testnet chain/RPC/explorer values.
- [ ] Set the exact deployed contract address.
- [ ] Set the exact receipt block as the deployment block.
- [ ] Run a production build with those real testnet values.
- [ ] Confirm the build contains no placeholder address.
- [ ] Start the testnet build and confirm reads reach the deployed bytecode.

### Phase 2 exit criteria

- [ ] Testnet receipt is successful and independently checked.
- [ ] Public deployment record matches the explorer.
- [ ] Real testnet frontend configuration builds and starts.
- [ ] Deployment secret is removed from the active shell/session when no longer needed.
- [ ] No unresolved deployment discrepancy exists.

Approved by/date: `______________________________`

## Phase 3 — Testnet live acceptance

Status: **Not started**

Use synthetic, non-confidential content and at least two disposable test accounts.

### Registration checklist

- [ ] Connect wallet A to BOT Chain Testnet.
- [ ] Register unique synthetic text without metadata.
- [ ] Review destination contract, chain, method, transaction value, and gas before approval.
- [ ] Confirm wallet-pending and receipt-pending UI states.
- [ ] Confirm the successful receipt in the explorer.
- [ ] Compare the displayed proof with creator, hash, category, timestamp, and transaction.
- [ ] Register one proof with valid public metadata.
- [ ] Register and verify one small non-empty local file.
- [ ] Reject one wallet request and confirm a friendly error with no false success.
- [ ] Test insufficient gas and confirm an actionable error.

### Verification and contract-behavior checklist

- [ ] Disconnect the wallet and verify the exact original content.
- [ ] Change one character or byte and confirm no match.
- [ ] Use the wrong creator address and confirm no match.
- [ ] Register the same hash again with wallet A and confirm duplicate rejection.
- [ ] Register the same hash with wallet B and confirm it is allowed.
- [ ] Open the shareable proof route and compare it with the explorer record.
- [ ] Test a malformed proof route and confirm safe validation.

### My Proofs and RPC checklist

- [ ] Connect wallet A and open My Proofs.
- [ ] Confirm all wallet-A events appear newest first.
- [ ] Refresh and confirm there are no duplicate rows.
- [ ] Confirm transaction and proof links use the testnet explorer/profile.
- [ ] Test the configured RPC's practical `eth_getLogs` range behavior.
- [ ] Confirm adaptive range splitting works when the provider rejects a large range.
- [ ] Confirm disabled-log and authorization errors are not displayed as an empty history.
- [ ] Record the chosen testnet RPC and any observed limits.

Testnet RPC/results: `______________________________`

### Browser and privacy checklist

- [ ] Test current Chrome, Edge/Brave, and a mobile-sized viewport.
- [ ] Confirm no horizontal overflow or inaccessible primary action.
- [ ] Confirm no unexpected console errors.
- [ ] Confirm raw text/file content does not appear in application network requests.
- [ ] Confirm only intended hash/category/metadata data appears in the wallet transaction.
- [ ] Record screenshots using synthetic content only.

### Phase 3 exit criteria

- [ ] All live testnet checks pass.
- [ ] Transaction/proof evidence is recorded.
- [ ] No critical/high defect remains open.
- [ ] RPC behavior and limitations are documented.
- [ ] Testnet acceptance is signed off by someone other than the implementer where possible.

Evidence: `______________________________`

Approved by/date: `______________________________`

## Phase 4 — Mainnet readiness

Status: **Not started**

### Required inputs

- Completed Phase 3 evidence.
- External or independent security reviewer.
- Trusted logs-capable mainnet RPC provider.
- Mainnet deployer/signing strategy.
- BOT gas budget.
- Hosting/environment owner.

### Network and provider checklist

- [ ] Reconfirm mainnet chain ID `677` from official BOT Chain documentation.
- [ ] Reconfirm mainnet explorer and public RPC.
- [ ] Select a trusted browser-compatible mainnet RPC supporting `eth_getLogs`.
- [ ] Document provider ownership, limits, availability, cost, and incident contact.
- [ ] Decide whether an exposed browser RPC URL/token has acceptable scope and restrictions.
- [ ] Define a backup RPC/failover procedure.
- [ ] Confirm explorer source-verification procedure and required inputs.

### Security checklist

- [ ] Review final Solidity source and exact compiled bytecode.
- [ ] Review deployment scripts, mainnet gate, record protection, and RPC redaction.
- [ ] Review frontend hashing/privacy behavior and wallet transaction simulation.
- [ ] Review dependencies and known security advisories.
- [ ] Review production headers, HTTPS, CSP implications, and environment exposure.
- [ ] Confirm no admin/upgrade/recovery path exists and accept that operational limitation.
- [ ] Resolve every critical/high finding or document a written no-go.
- [ ] Record reviewer and report location.

Reviewer/report: `______________________________`

### Mainnet wallet and approval checklist

- [ ] Choose a dedicated mainnet deployer that is not used for daily funds.
- [ ] Decide whether the current raw-key Hardhat flow is acceptable.
- [ ] If not acceptable, implement and test a hardware-backed or multisig deployment flow first.
- [ ] Fund only the reviewed BOT gas budget.
- [ ] Confirm the deployer address and balance independently.
- [ ] Prepare secure, temporary secret injection and post-deployment secret removal.
- [ ] Confirm the frontend registration wallet needs BOT only for user gas, never a private key in the app.

### Release checklist

- [ ] Create a release candidate commit and tag.
- [ ] Confirm hosted CI passes on that exact commit.
- [ ] Run the complete quality suite again.
- [ ] Run a non-published production-build rehearsal with clearly identified validation-only values.
- [ ] Review hosting, domain, environment, rollback, and support plans.
- [ ] Prepare the exact mainnet deployment command and responsible operator.
- [ ] Hold a documented go/no-go review.
- [ ] Obtain explicit approval before setting `CONFIRM_MAINNET_DEPLOYMENT=true`.

Release commit/tag: `______________________________`

Go/no-go approvers/date: `______________________________`

### Phase 4 exit criteria

- [ ] Testnet acceptance is complete.
- [ ] Security review is accepted.
- [ ] Logs-capable RPC and backup plan are approved.
- [ ] Mainnet signing and gas plans are approved.
- [ ] CI and full suite are green on the release commit.
- [ ] Written mainnet go decision exists.

## Phase 5 — Mainnet deployment and hosting

Status: **Not started**

This phase sends real transactions. Do not improvise values or commands.

### Final preflight

- [ ] Confirm the operator is using the approved release commit.
- [ ] Confirm no unreviewed working-tree change exists.
- [ ] Reconfirm RPC-reported chain ID `677`.
- [ ] Reconfirm deployer address and BOT balance.
- [ ] Re-run `pnpm validate:deployment -- --network mainnet`.
- [ ] Re-run lint, type checks, tests, contract compile, coverage, ABI export, and build rehearsal.
- [ ] Set `CONFIRM_MAINNET_DEPLOYMENT=true` only in the controlled deployment session.
- [ ] Re-read the wallet transaction details before approval.

### Mainnet deployment

- [ ] Run `pnpm contracts:deploy:mainnet` exactly once for the approved deployment.
- [ ] Record the transaction hash immediately.
- [ ] Wait for the configured confirmations.
- [ ] Confirm explorer success and deployed bytecode.
- [ ] Match every generated deployment-record field to the explorer.
- [ ] Preserve `deployments/botchain-mainnet.json` without overwriting an existing record unexpectedly.
- [ ] Attempt source verification and update `sourceVerified` truthfully.
- [ ] Export and review the ABI.
- [ ] Clear the private key and mainnet confirmation flag from the active session.

Transaction: `______________________________`

Contract address: `______________________________`

Deployment block: `______________________________`

Explorer/source verification: `______________________________`

### Production frontend and hosting

- [ ] Set the real mainnet chain, logs-capable RPC, explorer, contract address, and deployment block.
- [ ] Ensure no secret is placed in any `NEXT_PUBLIC_` variable.
- [ ] Run `pnpm build` with real verified values.
- [ ] Deploy the exact build to the reviewed hosting project.
- [ ] Configure the intended domain and HTTPS.
- [ ] Confirm the public build exposes the correct address/network in its behavior.
- [ ] Run a read-only verification before sending a user transaction.
- [ ] Perform one approved low-value synthetic-content registration.
- [ ] Verify the proof route, transaction link, and My Proofs history.
- [ ] Test desktop and mobile public URLs with a clean browser profile.
- [ ] Update README addresses, deployment block, status, and final screenshots.
- [ ] Commit/tag the public deployment record and documentation update.

Public URL: `______________________________`

### Phase 5 exit criteria

- [ ] Mainnet contract receipt and source status are recorded.
- [ ] Production build uses the real verified address/block.
- [ ] Public HTTPS application passes register, verify, proof-route, and history smoke tests.
- [ ] README and deployment records match the explorer.
- [ ] Deployment secrets have been removed from active environments.
- [ ] Launch approval is recorded.

Approved by/date: `______________________________`

## Phase 6 — Post-launch operations

Status: **Not started**

### Monitoring and reliability

- [ ] Assign an operational owner and backup.
- [ ] Monitor public frontend availability and HTTPS/domain expiry.
- [ ] Monitor read RPC and logs RPC availability separately.
- [ ] Monitor explorer availability and broken transaction links.
- [ ] Track frontend errors without collecting raw proof content.
- [ ] Define thresholds and contacts for RPC degradation.
- [ ] Test the backup RPC procedure periodically.

### Security and support

- [ ] Enable and monitor a private vulnerability-reporting channel.
- [ ] Document incident severity, triage, communication, and evidence handling.
- [ ] Never request user seed phrases, private keys, or raw confidential content in support.
- [ ] Define what can be fixed in the frontend versus what is immutable in the contract.
- [ ] Run periodic dependency and security reviews.
- [ ] Preserve provenance limitations in user-facing support and documentation.

### Release and record maintenance

- [ ] Maintain versioned releases and changelogs.
- [ ] Keep deployment records immutable and explorer-verified.
- [ ] Re-run the complete quality suite for every release.
- [ ] Re-test wallet/network behavior after major wagmi, viem, Next.js, or wallet updates.
- [ ] Update official BOT Chain configuration only after primary-source verification.
- [ ] Keep screenshots, README status, and manual test instructions current.
- [ ] Document rollback steps for frontend releases; remember the contract itself is non-upgradeable.

### Phase 6 exit criteria

- [ ] Operational and security owners are named.
- [ ] Monitoring and incident procedures are tested.
- [ ] Release, dependency, and deployment-record maintenance has a schedule.
- [ ] Post-launch review date is recorded.

Owners/review date: `______________________________`

## Acquisition checklist

### Needed now

- [ ] Git hosting repository/remote.
- [ ] CI access and repository security settings.
- [ ] Owner/tester for Phase 0 manual acceptance.

### Needed for testnet

- [ ] MetaMask Extension from the official source.
- [ ] Disposable testnet deployer and at least one additional test account.
- [ ] Faucet test BOT.
- [ ] Frontend testnet-profile implementation/review.

### Needed for mainnet

- [ ] Independent security reviewer.
- [ ] Trusted logs-capable RPC provider and backup.
- [ ] Secure deployer/signing strategy.
- [ ] Native BOT gas budget.
- [ ] Hosting account, domain, HTTPS, and environment management.
- [ ] Operational/support owner.

## Evidence log

| Date | Phase | Evidence/link | Reviewer | Result |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## Official references

- BOT Chain Quick Guide: <https://dev-docs.botchain.ai/docs/Developers/quick-guide/>
- BOT Chain JSON-RPC endpoints: <https://dev-docs.botchain.ai/docs/Developers/json-rpc-endpoint/>
- BOT Chain testnet faucet: <https://faucet.botchain.ai/basic>
- BOT Chain testnet explorer: <https://scan.bohr.life>
- BOT Chain mainnet explorer: <https://scan.botchain.ai>
- MetaMask official download: <https://metamask.io/download>
- Project handoff/manual testing: [PROJECT_HANDOFF_AND_MANUAL_TESTING.md](PROJECT_HANDOFF_AND_MANUAL_TESTING.md)
- Security policy: [SECURITY.md](SECURITY.md)
- Deployment records: [deployments/README.md](deployments/README.md)
