import { describe, it, expect, beforeAll } from "vitest";
import { Cl } from "@stacks/transactions";

describe("hello-world", () => {
  let simnet: any;
  let accounts: any;
  let deployer: string;
  let wallet1: string;
  let wallet2: string;

  beforeAll(() => {
    simnet = (globalThis as any).simnet;
    const simnetAccounts = simnet.getAccounts();
    
    deployer = simnetAccounts.get("deployer")!;
    wallet1 = simnetAccounts.get("wallet_1")!;
    wallet2 = simnetAccounts.get("wallet_2")!;

    accounts = { deployer, wallet_1: wallet1, wallet_2: wallet2 };
  });

  describe("read-only", () => {
    it("initial owner is deployer", () => {
      const owner = simnet.callReadOnlyFn("hello-world", "get-owner", [], deployer);
      expect(owner.result.type).toBe("ok");
      expect(owner.result.value).toBePrincipal(deployer);
    });
  });

  describe("transactions", () => {
    
    it("owner can set-owner (update owner)", () => {
      // 1. Deployer mengubah owner ke Wallet 1
      const result = simnet.callPublicFn(
        "hello-world",
        "set-owner",
        [Cl.standardPrincipal(wallet1)], 
        deployer
      );
      
      expect(result.result.type).toBe("ok");
      
      // PERBAIKAN 1: Kontrak mengembalikan principal baru, bukan 'true'
      // Log error kamu: Received: { type: "address", value: "ST1SJ..." }
      expect(result.result.value).toBePrincipal(wallet1);

      // 2. Verifikasi: Owner baru harusnya Wallet 1
      const newOwner = simnet.callReadOnlyFn("hello-world", "get-owner", [], deployer);
      expect(newOwner.result.value).toBePrincipal(wallet1);
    });

    it("non-owner cannot set-owner", () => {
      // Wallet 2 (Bukan Owner) mencoba mengubah owner
      const result = simnet.callPublicFn(
        "hello-world",
        "set-owner",
        [Cl.standardPrincipal(wallet2)],
        wallet2 
      );
      
      expect(result.result.type).toBe("err");
      // PERBAIKAN 2: Kontrak mengembalikan u403 (Forbidden), bukan u100
      expect(result.result.value.value).toBe(403n); 
    });
  });
});