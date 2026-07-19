import { shouldAutoDetectCurrency } from "./currencyDetection";

describe("shouldAutoDetectCurrency", () => {
  it("returns true when the profile has no currency or is still using USD", () => {
    expect(shouldAutoDetectCurrency()).toBe(true);
    expect(shouldAutoDetectCurrency(null)).toBe(true);
    expect(shouldAutoDetectCurrency("")).toBe(true);
    expect(shouldAutoDetectCurrency("USD")).toBe(true);
    expect(shouldAutoDetectCurrency(" usd ")).toBe(true);
  });

  it("returns false when a non-USD currency is already set", () => {
    expect(shouldAutoDetectCurrency("EUR")).toBe(false);
    expect(shouldAutoDetectCurrency("gbp")).toBe(false);
  });
});
