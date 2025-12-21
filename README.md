# StackChallenge Builder Toolkit

## 1. Clarity 4 Demo Contract
- File: `contracts/hello-world.clar`
- Features:
  - Stores the contract owner plus the `stacks-block-time` of the latest owner update (Clarity 4 keyword).
  - Read-only helpers: `get-owner` and `get-last-updated`.
  - `set-owner` returns the new owner and timestamp after asserting the caller is the current owner.
- Run locally with Clarinet:
  ```bash
  clarinet console
  (contract-call? .hello-world set-owner 'ST...NEW)
  (contract-call? .hello-world get-last-updated)
  ```

## 2. Chainhook Registration Script
- File: `index.ts`
- Uses `@hirosystems/chainhooks-client` to register a hook that listens for `set-owner` calls.
- Required env vars:
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
- Express server that accepts POST `/hooks/hello-world`, logs events to `data/chainhook-events.log`, and exposes a simple GET health endpoint.
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
3. Trigger `set-owner` on deployed contract (or via Clarinet) so Hiro sends events to your webhook.
4. Commit logs/screenshots to boost GitHub progress.

## Dependencies
`npm install`
- Runtime: `@hirosystems/chainhooks-client`, `express`
- Dev: `ts-node`, `@types/node`, `@types/express`

## Next Steps
- Build a frontend with `@stacks/connect` + `@stacks/transactions` calling `set-owner`.
- Deploy contract to mainnet/testnet and invite other wallets to interact for on-chain points.
- Extend webhook to persist events in DB or broadcast to UI dashboards.
