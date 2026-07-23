# Security policy

ProofBOT handles public blockchain writes and locally selected user content. Security and privacy reports are welcome.

## Supported code

Security fixes are made against the current default branch. This MVP has not yet published a versioned long-term-support policy.

## Report a vulnerability

Please use the repository's private **Security** tab to open a private vulnerability report or draft security advisory. If private reporting is not enabled, contact the maintainers through a private channel before disclosing details. Do not open a public issue for an unpatched vulnerability.

Include, when safe to do so:

- the affected commit, package, route, or contract function;
- a minimal reproduction and the expected impact;
- whether the issue affects content privacy, wallet safety, deployment keys, RPC configuration, or on-chain state;
- any mitigations you have already tested.

Never include a real private key, seed phrase, confidential source asset, or populated environment file in a report. Use disposable test accounts and synthetic content.

## Important boundaries

- ProofBOT hashes selected text and files in the browser. A report that shows raw content leaving the browser unexpectedly is security-sensitive.
- Content hashes, wallet addresses, timestamps, asset categories, and supplied metadata URIs are intentionally public once registered.
- Easily guessed content can sometimes be confirmed from a public hash. Users should not treat a hash as encryption.
- Metadata URIs are public and permanent; they must not contain credentials or confidential information.
- The registry has no owner, upgrade path, withdrawal function, custody, or administrative recovery mechanism. Confirm transaction details before signing.
- Deployer credentials belong only in local or CI secret storage. They must never use a `NEXT_PUBLIC_` variable.

## Disclosure and response

Maintainers will validate reports, coordinate a fix where one is possible, and communicate disclosure timing through the private report. No bug-bounty program or reward is promised by this policy.
