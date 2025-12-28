import { describe, it, expect, beforeAll } from "vitest";
import { Cl } from "@stacks/transactions";

describe("playground-token", () => {
  let simnet: any;
  let accounts: any;

  beforeAll(() => {
    simnet = (globalThis as any).simnet;
    const simnetAccounts = simnet.getAccounts();
    accounts = {
      deployer: simnetAccounts.get("deployer")!,
      wallet_1: simnetAccounts.get("wallet_1")!,
      wallet_2: simnetAccounts.get("wallet_2")!,
      wallet_3: simnetAccounts.get("wallet_3")!,
    };
  });

  describe("read-only", () => {
    it("metadata & supply", () => {
      const name = simnet.callReadOnlyFn("playground-token", "get-name", [], accounts.deployer);
      const sym = simnet.callReadOnlyFn("playground-token", "get-symbol", [], accounts.deployer);
      const dec = simnet.callReadOnlyFn("playground-token", "get-decimals", [], accounts.deployer);
      const sup = simnet.callReadOnlyFn("playground-token", "get-total-supply", [], accounts.deployer);
      expect(name.result.value).toBeAscii("Playground Coin");
      expect(sym.result.value).toBeAscii("PLAY");
      expect(dec.result.value).toBeUint(6);
      expect(sup.result.value).toBeUint(0);
    });

    it("token uri", () => {
      const uri = simnet.callReadOnlyFn("playground-token", "get-token-uri", [], accounts.deployer);
      expect(uri.result.type).toBe("ok");
      expect(uri.result.value.type).toBe("some");
    });
  });

  describe("edge cases", () => {
    it("multiple claims respect cooldown", () => {
      const first = simnet.callPublicFn("playground-token", "claim-tokens", [], accounts.wallet_2);
      expect(first.result.type).toBe("ok");
      expect(first.result.value.type).toBe("true");

      const second = simnet.callPublicFn("playground-token", "claim-tokens", [], accounts.wallet_2);
      expect(second.result.type).toBe("err");
      expect(second.result.value.type).toBe("uint");
      expect(second.result.value.value).toBe(200n);
    });
  });
});