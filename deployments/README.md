# Deployment records

Every successful ProofBOT registry deployment writes one JSON record in this directory. Deployment records are public operational metadata and should be reviewed and committed; they must never contain a private key, seed phrase, RPC credential, or explorer API key.

No BOT Chain deployment is included in the repository yet. The application contract address and deployment block remain environment configuration until a reviewed deployment record is created.

## Record shape

```json
{
  "network": "botchain-mainnet",
  "chainId": 677,
  "contractName": "ProofBOTRegistry",
  "address": "0x0000000000000000000000000000000000000000",
  "deploymentTransaction": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "deploymentBlock": 0,
  "deployer": "0x0000000000000000000000000000000000000000",
  "deployedAt": "2026-01-01T00:00:00.000Z",
  "compilerVersion": "0.8.x",
  "sourceVerified": false,
  "gitCommit": "0000000000000000000000000000000000000000"
}
```

The zero values above are illustrative placeholders only and must never be presented as a real deployment.

## Rules

- Mainnet uses the stable filename `deployments/botchain-mainnet.json`.
- Testnet records are append-safe and use `deployments/botchain-testnet-<lowercase-contract-address>.json`.
- The deployment script queries `eth_chainId` and rejects a mismatched network before signing.
- Mainnet requires `CONFIRM_MAINNET_DEPLOYMENT=true` and a valid `DEPLOYER_PRIVATE_KEY` supplied outside source control.
- An existing mainnet record is not overwritten unless the deployment command receives its explicit overwrite option.
- Record the receipt block, transaction hash, deployer, compiler, UTC time, and current Git commit from the actual deployment.
- Keep `sourceVerified` false until explorer verification is confirmed.
- Export the ABI from the compiled artifact after deployment; do not hand-edit a second ABI.
- Update the root README contract-address section and frontend environment only after checking the saved receipt against the explorer.

BOT Chain's official documentation currently exposes a manual mainnet contract-verification page at https://scan.botchain.ai/contract-verification. It does not document an explorer verification API in the supplied developer documentation, so automation must remain disabled unless an official API is later confirmed.
