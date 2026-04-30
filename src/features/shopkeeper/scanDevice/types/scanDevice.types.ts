// src/features/shopkeeper/scanDevice/types/scanDevice.types.ts

export interface RiskMeter {
  riskLevel: string;
  score: number;
  label: string;
}

export interface MarketValue {
  amount: number;
  currency: string;
}

export interface AIInsight {
  title: string;
  message: string;
}

export interface CheckItem {
  title: string;
  description: string;
  status: "passed" | "warning" | "failed";
  [key: string]: unknown;
}

export interface TechnicalBreakdown {
  processor: string;
  batteryHealth: {
    percentage: number;
    cycleCount: number;
    label: string;
  };
  storage: {
    total: string;
    free: string;
    label: string;
  };
  modem: string;
  display: string;
  warranty: {
    status: string;
    label: string;
  };
  origin: {
    country: string;
    modelNumber: string;
    label: string;
  };
  activation: {
    lockStatus: string;
    simType: string;
    label: string;
  };
}

export interface IMEIResult {
  deviceName: string;
  imei: string;
  deviceStatus: string;
  riskMeter: RiskMeter;
  marketValue: MarketValue;
  aiInsight: AIInsight;
  checks: {
    globalBlacklist: CheckItem;
    carrierFinancing: CheckItem;
    hardwareLock: CheckItem;
    partAuthenticity: CheckItem;
  };
  technicalBreakdown: TechnicalBreakdown;
  reportActions: {
    smartInvoiceCreated: boolean;
    pdfCertificateUrl: string | null;
    isPdfGenerated: boolean;
  };
  providerData: unknown;
}

export interface IMEIService {
  service: string;
  name: string;
  price: string;
}

export interface ServiceListResponse {
  "Service List": IMEIService[];
}
