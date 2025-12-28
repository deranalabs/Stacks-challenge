# StackChallenge Builder Toolkit

## 1. Hello-world Contract
- File: `contracts/hello-world.clar`
- Features:
  - Stores the contract owner; only the current owner can update it.
  - Read-only helper: `get-owner`.
  - `set-owner` returns the new owner after validating caller is the current owner.
- Run locally with Clarinet:
  ```bash
  clarinet console
  (contract-call? .hello-world set-owner 'ST...NEW)
  (contract-call? .hello-world get-owner)
  ```

## 2. Chainhook Registration
- File: `index.ts`
- Uses `@hirosystems/chainhooks-client` to register a hook for `set-owner`.
- Env:
  - `STACKS_NETWORK` (`mainnet` | `testnet`, default testnet)
  - `CHAINHOOKS_BASE_URL` (optional override)
  - `CONTRACT_IDENTIFIER` (e.g., `ST...HELLO.hello-world`)
  - `CHAINHOOKS_WEBHOOK_URL` (e.g., `http://localhost:4000/hooks/hello-world`)
  - `HIRO_API_KEY` (if using hosted Chainhooks)
- Run:
  ```bash
  npx ts-node index.ts
  ```

## 3. Webhook Receiver
- File: `webhook-server.ts`
- Express server for POST `/hooks/hello-world`, logs to `data/chainhook-events.log`, with GET health.
- Env:
  - `WEBHOOK_PORT` (default `4000`)
- Run:
  ```bash
  npx ts-node webhook-server.ts
  ```
- Tail logs: `tail -f data/chainhook-events.log`

## Suggested Flow
1. Start webhook server.
2. Register chainhook via `index.ts`.
3. Call `set-owner` on deployed contract (or via Clarinet) so Hiro sends events to your webhook.

## Dependencies
`npm install`
- Runtime: `@hirosystems/chainhooks-client`, `express`
- Dev: `ts-node`, `@types/node`, `@types/express`

## Testing
- Run all tests: `npm test`
- Run lint: `npm run lint` (minimal config; TS linting not enforced)
- Per-contract suites:
  - `tests/playground-token.test.ts` — transactions skipped (principal serialization), cooldown edge active
  - `tests/dev-badge.test.ts` — transfer (principal) skipped; mint + edge cases active
  - `tests/hello-world.test.ts` — set-owner transactions skipped; read-only active
  - `tests/contracts.test.ts` — placeholder `describe.skip` to avoid legacy suite
- Skips stem from clarinet-sdk principal serialization; re-enable when fixed.

## Deployment
- Config templates: `settings/Devnet.toml`, `settings/Testnet.toml`, `settings/Mainnet.toml`.
- Do NOT commit real seed phrases. Use `clarinet deployments encrypt` for mnemonics.
- Revert any temporary mnemonic to placeholders before sharing the repo.

## Tooling Notes
- Clarinet `3.12.0` currently required; Clarity 4 keywords (e.g., `stacks-block-time`) not yet in official CLI. Update when Hiro releases Clarity 4 support.

## Deployed Contracts
| Network  | Contract Identifier | Explorer link |
|----------|--------------------|---------------|
| Testnet  | `ST1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG19Q0YD2Q.hello-world` | [Tx 0xc17c…b89](https://explorer.hiro.so/txid/0xc17ccebd98129efaaabaaabf54fb57a2e1798d14dd4981206a9fdbb735ba8b89?chain=testnet) |
| Mainnet  | `SP1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG18BTW5QV.hello-world` | [Explorer](https://explorer.hiro.so/contract/SP1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG18BTW5QV.hello-world?chain=mainnet) |

## Next Steps
- Build a frontend with `@stacks/connect` + `@stacks/transactions`.
- Deploy contracts to testnet/mainnet and share contract IDs for UI calls.
- Extend webhook to persist events or surface them in dashboards.
