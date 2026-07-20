import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  convertCurrencyAmount,
  fetchExchangeRates,
  getCurrencySymbol,
  formatCurrency as baseFormatCurrency,
  CURRENCY_LIST,
  type CurrencyOption,
  normalizeCurrencyCode,
} from "@/lib/currency";

export interface CurrencyContext {
  currency: string;
  currencySymbol: string;
  exchangeRate: number;
  isRateLoading: boolean;
  convertAmount: (
    amount: number,
    fromCurrency?: string,
    toCurrency?: string,
  ) => number;
  formatCurrency: (amount: number, fromCurrency?: string) => string;
  formatNumber: (amount: number, fromCurrency?: string) => string;
  currencyOptions: CurrencyOption[];
}

export function useCurrency(): CurrencyContext {
  const { data: profileData } = useMyProfile();
  const { data: exchangeRatesData, isLoading: isRateLoading } = useQuery({
    queryKey: ["exchange-rates", "USD"],
    queryFn: () => fetchExchangeRates("USD"),
    staleTime: 1000 * 60 * 60,
  });

  const currency = useMemo(
    () => normalizeCurrencyCode(profileData?.data?.currency as string),
    [profileData?.data?.currency],
  );

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const exchangeRate = useMemo(() => {
    if (currency === "USD") {
      return 1;
    }

    const rate = Number(exchangeRatesData?.rates?.[currency]);
    return Number.isFinite(rate) && rate > 0 ? rate : 1;
  }, [currency, exchangeRatesData?.rates]);

  const convertAmount = useMemo(
    () =>
      (amount: number, fromCurrency = "USD", toCurrency = currency) =>
        convertCurrencyAmount(
          amount,
          exchangeRatesData?.rates,
          fromCurrency,
          toCurrency,
        ),
    [currency, exchangeRatesData?.rates],
  );

  const formatCurrency = useMemo(
    () =>
      (amount: number, fromCurrency = "USD") =>
        baseFormatCurrency(convertAmount(amount, fromCurrency), currency),
    [convertAmount, currency],
  );

  const formatNumber = useMemo(
    () =>
      (amount: number, fromCurrency = "USD") =>
        convertAmount(amount, fromCurrency).toFixed(2),
    [convertAmount],
  );

  return {
    currency,
    currencySymbol,
    exchangeRate,
    isRateLoading,
    convertAmount,
    formatCurrency,
    formatNumber,
    currencyOptions: CURRENCY_LIST,
  };
}
