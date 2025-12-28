import { describe, it, expect, beforeAll } from "vitest";
import { Cl } from "@stacks/transactions";

describe("hello-world", () => {
  let simnet: any;
  let accounts: any;

  beforeAll(() => {
    simnet = (globalThis as any).simnet;
    const simnetAccounts = simnet.getAccounts();
    accounts = {
      deployer: simnetAccounts.get("deployer")!,
      wallet_1: simnetAccounts.get("wallet_1")!,
      wallet_2: simnetAccounts.get("wallet_2")!,
    };
  });

  describe("read-only", () => {
    it("initial owner", () => {
      const owner = simnet.callReadOnlyFn("hello-world", "get-owner", [], accounts.deployer);
      // get-owner returns (ok principal), so check result.value
      expect(owner.result.value).toBePrincipal(accounts.deployer);
    });
  });

  describe.skip("transactions", () => {
    // TODO: principal serialization still failing with clarinet-sdk bundled @stacks/transactions.
    // Unskip after clarinet-sdk update or when a working principal builder is confirmed.
    it("owner can set-owner", () => {
      const result = simnet.callPublicFn(
        "hello-world",
        "set-owner",
        [Cl.standardPrincipal(accounts.wallet_1)],
        accounts.deployer
      );
      expect(result.result.type).toBe("ok");
    });

    it("non-owner cannot set-owner", () => {
      const result = simnet.callPublicFn(
        "hello-world",
        "set-owner",
        [Cl.standardPrincipal(accounts.wallet_2)],
        accounts.wallet_2
      );
      expect(result.result.type).toBe("err");
    });
  });
});