import { describe, it, expect, beforeAll } from "vitest";
import { Cl } from "@stacks/transactions";

describe("playground-token", () => {
  let simnet: any;
  let accounts: any;
  let deployer: string;
  let wallet1: string;
  let wallet2: string;
  let wallet3: string;

  beforeAll(() => {
    simnet = (globalThis as any).simnet;
    const simnetAccounts = simnet.getAccounts();
    
    deployer = simnetAccounts.get("deployer")!;
    wallet1 = simnetAccounts.get("wallet_1")!;
    wallet2 = simnetAccounts.get("wallet_2")!;
    wallet3 = simnetAccounts.get("wallet_3")!;

    accounts = { deployer, wallet_1: wallet1, wallet_2: wallet2, wallet_3: wallet3 };
  });

  describe("read-only checks", () => {
    it("has correct metadata", () => {
      const name = simnet.callReadOnlyFn("playground-token", "get-name", [], deployer);
      const sym = simnet.callReadOnlyFn("playground-token", "get-symbol", [], deployer);
      const dec = simnet.callReadOnlyFn("playground-token", "get-decimals", [], deployer);
      
      expect(name.result.value).toBeAscii("Playground Coin");
      expect(sym.result.value).toBeAscii("PLAY");
      expect(dec.result.value).toBeUint(6);
    });

    it("supply starts at 0", () => {
      const sup = simnet.callReadOnlyFn("playground-token", "get-total-supply", [], deployer);
      expect(sup.result.value).toBeUint(0);
    });
  });

  describe("faucet functionality", () => {
    
    it("faucet fails if block height is too low (< 10)", () => {
       const claim = simnet.callPublicFn("playground-token", "claim-tokens", [], wallet1);
       
       expect(claim.result.type).toBe("err");
       // PERBAIKAN: Kontrak mengembalikan u200 jika belum saatnya
       expect(claim.result.value.value).toBe(200n); 
    });

    it("faucet works after block 10", () => {
      simnet.mineEmptyBlocks(15); // Majukan blok

      const claim = simnet.callPublicFn("playground-token", "claim-tokens", [], wallet1);
      
      expect(claim.result.type).toBe("ok");
      const balance = simnet.callReadOnlyFn("playground-token", "get-balance", [Cl.standardPrincipal(wallet1)], deployer);
      expect(balance.result.value.value).toBe(100000000n);
    });

    it("enforces cooldown (cannot claim twice immediately)", () => {
      simnet.mineEmptyBlocks(15);
      
      // Claim 1 (Sukses)
      simnet.callPublicFn("playground-token", "claim-tokens", [], wallet1);

      // Claim 2 (Gagal - Cooldown)
      const claimAgain = simnet.callPublicFn("playground-token", "claim-tokens", [], wallet1);
      
      expect(claimAgain.result.type).toBe("err");
      expect(claimAgain.result.value.value).toBe(200n); // ERR-COOLDOWN
    });

    it("allows claim again after cooldown expires (10 blocks)", () => {
      simnet.mineEmptyBlocks(15);
      
      // 1. Claim Pertama
      simnet.callPublicFn("playground-token", "claim-tokens", [], wallet1);
      
      // 2. Tunggu cooldown habis
      simnet.mineEmptyBlocks(15);

      // 3. Claim Kedua
      const claimAgain = simnet.callPublicFn("playground-token", "claim-tokens", [], wallet1);
      expect(claimAgain.result.type).toBe("ok");
      
      // 4. Cek Saldo (Harus 200 juta sekarang)
      const balance = simnet.callReadOnlyFn("playground-token", "get-balance", [Cl.standardPrincipal(wallet1)], deployer);
      expect(balance.result.value.value).toBe(200000000n);
    });
  });

  describe("transfer functionality", () => {
    it("can transfer tokens between accounts", () => {
      // SETUP PENTING: Wallet 1 saldo 0 karena state reset. Kita isi dulu.
      simnet.mineEmptyBlocks(15);
      simnet.callPublicFn("playground-token", "claim-tokens", [], wallet1); 

      // Sekarang Wallet 1 punya 100 token, kirim 50 ke Wallet 2
      const transfer = simnet.callPublicFn(
        "playground-token",
        "transfer",
        [
            Cl.uint(50000000), 
            Cl.standardPrincipal(wallet1), 
            Cl.standardPrincipal(wallet2), 
            Cl.none() 
        ],
        wallet1 
      );

      expect(transfer.result.type).toBe("ok");
      expect(transfer.result.value).toEqual({ type: 'true' });

      // Verifikasi saldo Wallet 2
      const balance2 = simnet.callReadOnlyFn("playground-token", "get-balance", [Cl.standardPrincipal(wallet2)], deployer);
      expect(balance2.result.value.value).toBe(50000000n);
    });

    it("cannot transfer more than balance", () => {
       // Wallet 2 saldo 0. Coba kirim.
       const transfer = simnet.callPublicFn(
        "playground-token",
        "transfer",
        [
            Cl.uint(100000000), 
            Cl.standardPrincipal(wallet2), 
            Cl.standardPrincipal(wallet3), 
            Cl.none()
        ],
        wallet2
      );
      
      expect(transfer.result.type).toBe("err");
      // PERBAIKAN: Error u100 (Insufficient Balance di kontrak kamu)
      expect(transfer.result.value.value).toBe(100n); 
    });

    it("cannot transfer someone else's tokens", () => {
       // Setup: Wallet 1 isi saldo dulu
       simnet.mineEmptyBlocks(15);
       simnet.callPublicFn("playground-token", "claim-tokens", [], wallet1);

       // Wallet 3 (Maling) coba transfer uang milik Wallet 1
       const transfer = simnet.callPublicFn(
        "playground-token",
        "transfer",
        [
            Cl.uint(10000000), 
            Cl.standardPrincipal(wallet1), // Sender (Korban)
            Cl.standardPrincipal(wallet3), // Recipient (Maling)
            Cl.none()
        ],
        wallet3 // Caller (Maling)
      );

      expect(transfer.result.type).toBe("err");
      // PERBAIKAN: Error u101 (Sender Mismatch di kontrak kamu)
      expect(transfer.result.value.value).toBe(101n); 
    });
  });

});