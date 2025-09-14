import { describe, it, expect, beforeEach } from "vitest";
import { uintCV, stringAsciiCV } from "@stacks/transactions";

const ERR_DESIGN_NOT_FOUND = 100;
const ERR_INVALID_RATE = 101;
const ERR_INVALID_USAGE = 102;
const ERR_INVALID_REVENUE = 103;
const ERR_INVALID_FORMULA = 104;
const ERR_CALCULATION_FAILED = 105;
const ERR_NO_AUTH = 106;
const ERR_INVALID_PERIOD = 107;
const FORMULA_PER_OCCUPANT = 1;
const FORMULA_PER_ENERGY = 2;
const FORMULA_FIXED = 3;

interface RoyaltyTerm {
  rate: number;
  base: number;
  formula: number;
  currency: string;
  creator: string;
}

interface UsageData {
  occupants: number;
  energy: number;
  timestamp: number;
  submitter: string;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class RoyaltyCalculatorMock {
  state: {
    admin: string;
    royaltyTerms: Map<number, RoyaltyTerm>;
    usageData: Map<string, UsageData>;
    historicalRoyalties: Map<string, number>;
  } = {
    admin: "ST1ADMIN",
    royaltyTerms: new Map(),
    usageData: new Map(),
    historicalRoyalties: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1ADMIN";
  key = (designId: number, period: number) => `${designId}-${period}`;

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      admin: "ST1ADMIN",
      royaltyTerms: new Map(),
      usageData: new Map(),
      historicalRoyalties: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1ADMIN";
  }

  getRoyaltyTerm(designId: number): RoyaltyTerm | null {
    return this.state.royaltyTerms.get(designId) || null;
  }

  getUsageData(designId: number, period: number): UsageData | null {
    return this.state.usageData.get(this.key(designId, period)) || null;
  }

  getHistoricalRoyalty(designId: number, period: number): number | null {
    return this.state.historicalRoyalties.get(this.key(designId, period)) || null;
  }

  registerTerm(designId: number, rate: number, base: number, formula: number, currency: string): Result<boolean> {
    if (this.caller !== this.state.admin) return { ok: false, value: ERR_NO_AUTH };
    if (rate <= 0 || rate > 10000) return { ok: false, value: ERR_INVALID_RATE };
    if (![FORMULA_PER_OCCUPANT, FORMULA_PER_ENERGY, FORMULA_FIXED].includes(formula)) return { ok: false, value: ERR_INVALID_FORMULA };
    if (currency.length > 10) return { ok: false, value: ERR_INVALID_RATE };
    this.state.royaltyTerms.set(designId, { rate, base, formula, currency, creator: this.caller });
    return { ok: true, value: true };
  }

  submitUsage(designId: number, period: number, occupants: number, energy: number): Result<boolean> {
    if (occupants < 0 || energy < 0) return { ok: false, value: ERR_INVALID_USAGE };
    if (period <= 0) return { ok: false, value: ERR_INVALID_PERIOD };
    this.state.usageData.set(this.key(designId, period), { occupants, energy, timestamp: this.blockHeight, submitter: this.caller });
    return { ok: true, value: true };
  }

  calculateRoyalty(designId: number, period: number, revenue: number): Result<number> {
    const term = this.getRoyaltyTerm(designId);
    if (!term) return { ok: false, value: ERR_DESIGN_NOT_FOUND };
    const usage = this.getUsageData(designId, period);
    if (!usage) return { ok: false, value: ERR_INVALID_USAGE };
    if (revenue <= 0) return { ok: false, value: ERR_INVALID_REVENUE };
    const { rate, base, formula } = term;
    const { occupants, energy } = usage;
    let amount: number;
    if (formula === FORMULA_PER_OCCUPANT) {
      amount = Math.floor((rate * occupants / 100) * revenue);
    } else if (formula === FORMULA_PER_ENERGY) {
      amount = Math.floor((rate * energy / base) * revenue);
    } else if (formula === FORMULA_FIXED) {
      amount = rate * base;
    } else {
      return { ok: false, value: ERR_INVALID_FORMULA };
    }
    if (amount <= 0) return { ok: false, value: ERR_CALCULATION_FAILED };
    this.state.historicalRoyalties.set(this.key(designId, period), amount);
    return { ok: true, value: amount };
  }

  updateAdmin(newAdmin: string): Result<boolean> {
    if (this.caller !== this.state.admin) return { ok: false, value: ERR_NO_AUTH };
    this.state.admin = newAdmin;
    return { ok: true, value: true };
  }

  getAdmin(): string {
    return this.state.admin;
  }
}

describe("RoyaltyCalculator", () => {
  let contract: RoyaltyCalculatorMock;

  beforeEach(() => {
    contract = new RoyaltyCalculatorMock();
    contract.reset();
  });

  it("registers a royalty term successfully", () => {
    const result = contract.registerTerm(1, 500, 100, FORMULA_PER_OCCUPANT, "STX");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const term = contract.getRoyaltyTerm(1);
    expect(term?.rate).toBe(500);
    expect(term?.base).toBe(100);
    expect(term?.formula).toBe(FORMULA_PER_OCCUPANT);
    expect(term?.currency).toBe("STX");
    expect(term?.creator).toBe("ST1ADMIN");
  });

  it("rejects invalid rate in registration", () => {
    const result = contract.registerTerm(1, 10001, 100, FORMULA_PER_OCCUPANT, "STX");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_RATE);
  });

  it("rejects invalid formula in registration", () => {
    const result = contract.registerTerm(1, 500, 100, 4, "STX");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_FORMULA);
  });

  it("rejects registration by non-admin", () => {
    contract.caller = "ST2FAKE";
    const result = contract.registerTerm(1, 500, 100, FORMULA_PER_OCCUPANT, "STX");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NO_AUTH);
  });

  it("submits usage data successfully", () => {
    const result = contract.submitUsage(1, 1, 200, 5000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const usage = contract.getUsageData(1, 1);
    expect(usage?.occupants).toBe(200);
    expect(usage?.energy).toBe(5000);
    expect(usage?.timestamp).toBe(0);
    expect(usage?.submitter).toBe("ST1ADMIN");
  });

  it("rejects invalid usage data", () => {
    const result = contract.submitUsage(1, 1, -1, 5000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_USAGE);
  });

  it("rejects invalid period in usage", () => {
    const result = contract.submitUsage(1, 0, 200, 5000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_PERIOD);
  });
  
  it("calculates royalty for fixed formula", () => {
    contract.registerTerm(1, 50, 100, FORMULA_FIXED, "STX");
    contract.submitUsage(1, 1, 200, 5000);
    const result = contract.calculateRoyalty(1, 1, 10000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(5000);
  });

  it("rejects calculation without term", () => {
    contract.submitUsage(1, 1, 200, 5000);
    const result = contract.calculateRoyalty(1, 1, 10000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_DESIGN_NOT_FOUND);
  });

  it("rejects calculation without usage", () => {
    contract.registerTerm(1, 100, 100, FORMULA_PER_OCCUPANT, "STX");
    const result = contract.calculateRoyalty(1, 1, 10000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_USAGE);
  });

  it("rejects calculation with invalid revenue", () => {
    contract.registerTerm(1, 100, 100, FORMULA_PER_OCCUPANT, "STX");
    contract.submitUsage(1, 1, 200, 5000);
    const result = contract.calculateRoyalty(1, 1, 0);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_REVENUE);
  });

  it("updates admin successfully", () => {
    const result = contract.updateAdmin("ST2NEW");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.getAdmin()).toBe("ST2NEW");
  });

  it("rejects admin update by non-admin", () => {
    contract.caller = "ST2FAKE";
    const result = contract.updateAdmin("ST2NEW");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NO_AUTH);
  });

  it("parses Clarity types correctly", () => {
    const designId = uintCV(1);
    const rate = uintCV(500);
    const currency = stringAsciiCV("STX");
    expect(designId.value.toString()).toBe("1");
    expect(rate.value.toString()).toBe("500");
    expect(currency.value).toBe("STX");
  });
});