# StackChallenge Builder Toolkit

## 1. Hello-world Contract (Clarity 2/3 compatible)
- File: `contracts/hello-world.clar`
- Features:
  - Stores the contract owner and ensures only the current owner can update it.
  - Read-only helper: `get-owner`.
  - `set-owner` returns the new owner after asserting the caller is the current owner.
- Run locally with Clarinet:
  ```bash
  clarinet console
  (contract-call? .hello-world set-owner 'ST...NEW)
  (contract-call? .hello-world get-owner)
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

## Testing
- Jalankan semua tes: `npm test`
- Jalankan lint: `npm run lint` (config minimal, abaikan TS sementara)
- Struktur per-kontrak:  
  - `tests/playground-token.test.ts` (transaksi di-skip karena serialisasi principal; edge cooldown aktif)  
  - `tests/dev-badge.test.ts` (transfer principal di-skip; mint & edge cases aktif)  
  - `tests/hello-world.test.ts` (transaksi set-owner di-skip; read-only aktif)  
  - `tests/contracts.test.ts` adalah placeholder `describe.skip` untuk menghindari suite legacy.
- Skips saat ini terkait limitasi principal serialization di clarinet-sdk. Aktifkan kembali saat SDK sudah mendukung.

## Deployment Settings
- Template configs live under `settings/Devnet.toml`, `settings/Testnet.toml`, and `settings/Mainnet.toml`.
- **Never commit real seed phrases.** Use `clarinet deployments encrypt` to generate an encrypted mnemonic and store that value instead of a plaintext phrase.
- If you temporarily paste a mnemonic for local testing, revert it to a placeholder before pushing or sharing the repo.

## Tooling Notes
- Clarinet `3.12.0` (Homebrew) is currently required; Clarity 4 keywords such as `stacks-block-time` are not yet available in the official CLI. Once Hiro releases a Clarinet build with Clarity 4 support, the contract can be updated to reintroduce the timestamp logic.

## Deployed Contracts
| Network  | Contract Identifier | Explorer link |
|----------|--------------------|---------------|
| Testnet  | `ST1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG19Q0YD2Q.hello-world` | [Tx 0xc17c…b89](https://explorer.hiro.so/txid/0xc17ccebd98129efaaabaaabf54fb57a2e1798d14dd4981206a9fdbb735ba8b89?chain=testnet) |
| Mainnet  | `SP1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG18BTW5QV.hello-world` | [Explorer](https://explorer.hiro.so/contract/SP1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG18BTW5QV.hello-world?chain=mainnet) |

## Next Steps
- Build a frontend with `@stacks/connect` + `@stacks/transactions` calling `set-owner`.
- Deploy contract to mainnet/testnet and invite other wallets to interact for on-chain points.
- Extend webhook to persist events in DB or broadcast to UI dashboards.
