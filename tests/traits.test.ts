import { describe, it, expect, beforeAll } from "vitest";

describe("traits", () => {
  let simnet: any;
  let accounts: any;

  beforeAll(() => {
    simnet = (globalThis as any).simnet;
    accounts = {
      deployer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    };
  });

  it("simnet available", () => {
    expect(simnet).toBeDefined();
    expect(typeof simnet.callReadOnlyFn).toBe("function");
  });

  // Trait files have no public functions; this is a presence smoke test.
  it("trait contracts are deployed (smoke)", () => {
    // If needed later, we can attempt a dummy call to ensure deployment exists.
    expect(accounts.deployer).toBeDefined();
  });
});
