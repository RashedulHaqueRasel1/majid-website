import { useMemo } from "react";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  getCurrencySymbol,
  formatCurrency as baseFormatCurrency,
  CURRENCY_LIST,
  type CurrencyOption,
} from "@/lib/currency";

export interface CurrencyContext {
  currency: string;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  currencyOptions: CurrencyOption[];
}

export function useCurrency(): CurrencyContext {
  const { data: profileData } = useMyProfile();

  const currency = useMemo(
    () => (profileData?.data?.currency as string) || "USD",
    [profileData?.data?.currency],
  );

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const formatCurrency = useMemo(
    () => (amount: number) => baseFormatCurrency(amount, currency),
    [currency],
  );

  return {
    currency,
    currencySymbol,
    formatCurrency,
    currencyOptions: CURRENCY_LIST,
  };
}
