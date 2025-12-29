# StackChallenge Builder Toolkit

Toolkit for building, testing, and monitoring Stacks smart contracts. Includes SIP-009/SIP-010 implementations, a Hello World contract, and Chainhook integration for event tracking.

## Deployed Contracts (Testnet)
| Contract | Identifier | Explorer |
| :--- | :--- | :---: |
| SIP-010 Trait | `ST1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG19Q0YD2Q.sip-010-trait-v2` | [Explorer](https://explorer.hiro.so/txid/0x27b1770363a171815a5457acf6fcbb76d6f2f22da01ae2c7c0cb7f44933830c1?chain=testnet) |
| SIP-009 Trait | `ST1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG19Q0YD2Q.sip-009-trait-v2` | [Explorer](https://explorer.hiro.so/txid/0xa926d70dcb556b115449e4656b2b7ab465bd0e519721ea867ebed6471d963f43?chain=testnet) |
| Hello World | `ST1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG19Q0YD2Q.hello-world-v2` | [Explorer](https://explorer.hiro.so/txid/0xc3a1dfa64f954b2c7fde2729804dfedaa7b12b85cdc777b33dc2578b2d06d8e9?chain=testnet) |
| Playground Token | `ST1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG19Q0YD2Q.playground-token-v2` | [Explorer](https://explorer.hiro.so/txid/0x1214d0dc4f33b3716c3c1dd0468587913fd6fc4c6247aa93fb496c5de67c0d59?chain=testnet) |
| Dev Badge (NFT) | `ST1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG19Q0YD2Q.dev-badge-v3` | [Explorer](https://explorer.hiro.so/txid/0xf744b7b8c1cb2dc95f42bcd498a4eee5dc33ddadcc2d503b5a0b7fd5234b7ac4?chain=testnet) |

Mainnet: `SP1B3AYKVPXY4MZXWPKNGHGYGRDP3AFKG18BTW5QV.hello-world`

## Contracts
- `hello-world.clar`: owner storage and transfer (`get-owner`, `set-owner`).
- `playground-token.clar`: SIP-010 FT with faucet cooldown (uses `stacks-block-height`).
- `dev-badge.clar`: SIP-009 NFT, pay-to-mint via `.playground-token-v2`.

## Chainhook and Webhook
- `webhook-server.ts`: receiver for POST `/hooks/hello-world`, logs to `data/chainhook-events.log`.
- `index.ts`: registers Chainhook via `@hirosystems/chainhooks-client`.
- Run:
  ```bash
  npx ts-node webhook-server.ts
  npx ts-node index.ts
  ```

## Testing and Tooling
- Install: `npm install`
- Tests: `npm test`
- Lint: `npm run lint`
- Clarinet: `clarinet check` (Clarinet 3.12.0; Clarity 4 keywords not yet in the CLI)

## Deployment
- Use `settings/*.toml`; do not commit mnemonics. Prefer `clarinet deployments encrypt`.
- When applying a plan, use `--use-on-disk-deployment-plan` to keep the curated plan.

## Roadmap
- [x] Deploy core contracts (Token, NFT, Hello World)
-- [x] Integrate Chainhooks
- [ ] Frontend UI (`@stacks/connect`)
- [ ] Webhook events dashboard
