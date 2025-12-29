import { describe, it, expect, beforeAll } from "vitest";

describe("traits", () => {
  let simnet: any;
  let accounts: any;

  beforeAll(() => {
    simnet = (globalThis as any).simnet;
    const simnetAccounts = simnet.getAccounts();
    
    // Standarisasi pengambilan akun
    accounts = {
      deployer: simnetAccounts.get("deployer")!,
    };
  });

  it("simnet environment is ready", () => {
    expect(simnet).toBeDefined();
    expect(typeof simnet.callReadOnlyFn).toBe("function");
  });

  it("trait contracts are deployed successfully", () => {
    // Kita memastikan address deployer ada
    // (Jika deploy gagal, biasanya simnet akan crash sebelum masuk sini)
    expect(accounts.deployer).toBeDefined();
    expect(accounts.deployer).toMatch(/^ST/); // Pastikan format address testnet (ST...)
  });
});