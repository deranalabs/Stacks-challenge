import { describe, it, expect, beforeAll } from "vitest";
import { Cl } from "@stacks/transactions";

describe("dev-badge", () => {
  let simnet: any;
  let accounts: any;
  let deployer: string;
  let wallet4: string;
  let wallet5: string;
  let wallet6: string;

  beforeAll(() => {
    simnet = (globalThis as any).simnet;
    const simnetAccounts = simnet.getAccounts();
    
    // Simpan address sebagai STRING murni untuk menghindari masalah object serialization
    deployer = simnetAccounts.get("deployer")!;
    wallet4 = simnetAccounts.get("wallet_4")!;
    wallet5 = simnetAccounts.get("wallet_5")!;
    wallet6 = simnetAccounts.get("wallet_6")!;

    accounts = { deployer, wallet_4: wallet4, wallet_5: wallet5, wallet_6: wallet6 };
  });

  describe("read-only", () => {
    it("last token id starts at 0", () => {
      const lastId = simnet.callReadOnlyFn("dev-badge", "get-last-token-id", [], deployer);
      expect(lastId.result.value).toBeUint(0);
    });
    
    it("get-token-uri works", () => {
        // PERBAIKAN: Gunakan 'deployer' string langsung
        const uri = simnet.callReadOnlyFn("dev-badge", "get-token-uri", [Cl.uint(1)], deployer);
        expect(uri.result.type).toBe("ok");
    });
  });

  describe("transactions", () => {
    
    it("insufficient balance for mint fails", () => {
      const mint = simnet.callPublicFn("dev-badge", "buy-mint", [], wallet4);
      expect(mint.result.type).toBe("err");
      expect(mint.result.value.value).toBe(100n); 
    });

    it("mint with payment and update last id", () => {
      simnet.mineEmptyBlocks(15);
      const claim = simnet.callPublicFn("playground-token", "claim-tokens", [], wallet4);
      expect(claim.result.type).toBe("ok");

      const mint = simnet.callPublicFn("dev-badge", "buy-mint", [], wallet4);
      expect(mint.result.type).toBe("ok");
      expect(mint.result.value.value).toBe(1n); 

      const lastId = simnet.callReadOnlyFn("dev-badge", "get-last-token-id", [], deployer);
      expect(lastId.result.value).toBeUint(1);
    });

    it("sequential mints increase token ids", () => {
      simnet.mineEmptyBlocks(15);
      const wallets = [wallet4, wallet5, wallet6];
      
      wallets.forEach((w, idx) => {
        simnet.callPublicFn("playground-token", "claim-tokens", [], w);
        const mint = simnet.callPublicFn("dev-badge", "buy-mint", [], w);
        expect(mint.result.type).toBe("ok");
        expect(mint.result.value.value).toBe(BigInt(idx + 1)); 
      });

      const lastId = simnet.callReadOnlyFn("dev-badge", "get-last-token-id", [], deployer);
      expect(lastId.result.value).toBeUint(3);
    });

    it("prevents double minting (security check)", () => {
        simnet.mineEmptyBlocks(15);
        simnet.callPublicFn("playground-token", "claim-tokens", [], wallet4);
        const mint1 = simnet.callPublicFn("dev-badge", "buy-mint", [], wallet4);
        expect(mint1.result.type).toBe("ok");
  
        const mint2 = simnet.callPublicFn("dev-badge", "buy-mint", [], wallet4);
        expect(mint2.result.type).toBe("err");
        expect(mint2.result.value.value).toBe(403n); 
    });
  
    it("can transfer nft to another user", () => {
        simnet.mineEmptyBlocks(15);
        simnet.callPublicFn("playground-token", "claim-tokens", [], wallet5);
        simnet.callPublicFn("dev-badge", "buy-mint", [], wallet5);
  
        // PERBAIKAN UTAMA: Cl.standardPrincipal() sekarang menerima variabel string yang bersih
        const transfer = simnet.callPublicFn(
          "dev-badge",
          "transfer",
          [
            Cl.uint(1), 
            Cl.standardPrincipal(wallet5), // Sender (String)
            Cl.standardPrincipal(wallet6)  // Recipient (String)
          ],
          wallet5 
        );
  
        expect(transfer.result.type).toBe("ok");
        // Check if the value inside the OK response is a Clarity boolean true
        expect(transfer.result.value).toEqual({ type: 'true' });
        // OR even safer:
        // expect(transfer.result.value.type).toBe('true');
  
        // Verifikasi pemilik baru
        const getOwner = simnet.callReadOnlyFn("dev-badge", "get-owner", [Cl.uint(1)], deployer);
        // Pastikan principal output cocok dengan string wallet6
        expect(getOwner.result.value.value).toBePrincipal(wallet6);
    });
  
    it("cannot transfer someone else's nft (security check)", () => {
        simnet.mineEmptyBlocks(15);
        simnet.callPublicFn("playground-token", "claim-tokens", [], wallet5);
        simnet.callPublicFn("dev-badge", "buy-mint", [], wallet5);
  
        const transfer = simnet.callPublicFn(
          "dev-badge",
          "transfer",
          [
            Cl.uint(1), 
            Cl.standardPrincipal(wallet5), 
            Cl.standardPrincipal(wallet6)
          ],
          wallet6 // <--- PENCURI
        );
  
        expect(transfer.result.type).toBe("err");
        expect(transfer.result.value.value).toBe(401n); 
    });

  });
});