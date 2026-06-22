/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Loader2,
  Receipt,
  Copy,
  RefreshCw,
  Clock,
  Shield,
} from "lucide-react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import { CertificatePDF } from "./CertificatePDF";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SmartInvoicePDF } from "./SmartInvoicePDF";
import { toast } from "sonner";

interface SingleResultViewProps {
  scanResult: IMEIResult;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onRegenerate?: (imei: string, serviceId: number) => Promise<void>;
  onDownload?: () => Promise<void> | void;
  isDownloading?: boolean;
}

// Constants
const DEFAULT_SERVICE_ID = 6;
const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 60,
};

// Helper functions
const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr || dateStr === "N/A") return "N/A";

  try {
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const [day, month, year] = dateStr.split("/");
      const date = new Date(
        2000 + parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (dateStr.match(/^[A-Za-z]+ \d{1,2}, \d{4}$/)) {
      return dateStr;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const getRiskColor = (score: number): string => {
  if (score <= RISK_THRESHOLDS.LOW) return "bg-emerald-500";
  if (score <= RISK_THRESHOLDS.MEDIUM) return "bg-amber-500";
  return "bg-red-500";
};

const getRiskBadgeColor = (score: number): string => {
  if (score <= RISK_THRESHOLDS.LOW) return "bg-emerald-100 text-emerald-700";
  if (score <= RISK_THRESHOLDS.MEDIUM) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

interface FieldConfig {
  label: string;
  value: any;
  condition?: boolean;
}

interface ExtractedDeviceData {
  // Basic Info
  deviceName: string;
  deviceId: string;
  deviceDescription: string;
  marketingName: string;
  deviceConfiguration: string;
  modelName: string;
  fullName: string;
  manufacturer: string;

  // Identifiers
  imeiValue: string;
  imei2Value: string;
  meidValue: string;
  serialNumber: string;
  serialKey: string;
  eidNumber: string;
  configCode: string;
  materialNumber: string;
  partNumber: string;
  modelNumber: string;
  doNumber: string;

  // Purchase & Warranty
  warrantyStatus: string;
  warrantyStatusCode: string;
  warrantyStatusDescription: string;
  coverageStatus: string;
  purchaseDate: string;
  productionDate: string;
  estimatedPurchaseDate: string;
  coverageEndDate: string;
  coverageStartDate: string;
  daysRemaining: string;
  coverageBenefits: string;
  applecareDescription: string;
  applecareCovered: string;
  applecareEligible: string;
  applecareClaimEligible: string;
  applecareClaimInProgress: string;
  applecarePurchaseDate: string;
  limitedWarranty: string;
  incidentsAvailable: string;

  // Support Info
  telephoneTechnicalSupport: string;
  telephoneSupportExpiresIn: string;
  telephoneSupportExpirationDate: string;
  repairsAndServiceCoverage: string;
  repairsAndServiceExpiresIn: string;
  repairsAndServiceExpirationDate: string;

  // Status Flags
  activationStatus: string;
  deviceActivation: string;
  registrationStatus: string;
  registrationDate: string;
  replacedDevice: string;
  replacementDevice: string;
  refurbishedDevice: string;
  demoUnit: string;
  loanerDevice: string;
  lostMode: string;
  validPurchaseDate: string;
  tempCoverage: string;
  openRepair: string;
  isDemo: string;
  isValid: string;

  // Lock Status
  iCloudLock: string;
  iCloudStatus: string;
  mdmLock: string;
  simlockStatus: string;
  simlock: string;
  unlockStatus: string;
  lockedCarrier: string;

  // Carrier & Network
  carrierName: string;
  sim1Carrier: string;
  soldToName: string;
  salesBuyerCode: string;
  salesBuyerName: string;
  soldByCountry: string;
  shipToCountry: string;
  purchaseCountryDesc: string;
  purchaseCountryCode: string;
  partCountry: string;
  partType: string;

  // Activation & Policy
  appliedActivationDetails: string;
  appliedActivationPolicyId: string;
  initialActivationPolicyId: string;
  initialActivationPolicyDescription: string;
  lastActivationPolicyDescription: string;
  nextActivationPolicyDescription: string;
  nextTetherPolicyId: string;
  nextTetherPolicyDetails: string;
  unlockDate: string;

  // Device Specs
  capacity: string;
  color: string;
  productLine: string;
  configDescription: string;
  deviceFamily: string;
  productDescription: string;
  productVersion: string;

  // Dates
  firstActivationDate: string;
  lastRestoreDate: string;
  lastUnbrickOsBuild: string;
  initialUnbrick: string;
  soldDate: string;
  shipDate: string;

  // GSX & History
  gsxReplacementHistory: string;

  // Other
  notice: string;
  wirelessMacAddress: string;
  iccid: string;
  messages: string;
  knoxGuard: string;
  blacklistStatus: string;
  attStatus: string;
  errorR01: string;
  hasError: boolean;
  errorMessage: string;
  isEmpty: boolean;
  riskScore: number;
  riskLevel: string;
  image: string | null;
  aiInsight: any;
  provider: string | null;
  oldGenerated: boolean;
  rawData: any;
}

const extractDeviceData = (scanResult: IMEIResult): ExtractedDeviceData => {
  const resultData = (scanResult as any).data || scanResult;
  const rawData = resultData?.data || resultData;
  const actualData =
    Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
  const mainData = actualData?.data || actualData;
  const parsedProviderData = mainData?.parsedProviderData || {};
  const riskMeterData = mainData?.riskMeter || scanResult?.riskMeter || {};

  const provider = mainData?.provider || parsedProviderData?.provider || null;
  const oldGenerated =
    mainData?.oldGenerated === true || actualData?.oldGenerated === true;

  // Risk Score
  let riskScore = 0;
  let riskLevel = "N/A";
  if (typeof riskMeterData === "number") {
    riskScore = riskMeterData;
    riskLevel =
      riskScore <= RISK_THRESHOLDS.LOW
        ? "low"
        : riskScore <= RISK_THRESHOLDS.MEDIUM
          ? "medium"
          : "high";
  } else if (typeof riskMeterData === "object" && riskMeterData !== null) {
    riskScore = riskMeterData.score || riskMeterData.riskMeter || 0;
    riskLevel =
      riskMeterData.riskLevel ||
      (riskScore <= RISK_THRESHOLDS.LOW
        ? "low"
        : riskScore <= RISK_THRESHOLDS.MEDIUM
          ? "medium"
          : "high");
  }

  // Basic device info
  const deviceName =
    parsedProviderData.device ||
    parsedProviderData.model ||
    parsedProviderData.marketing_name ||
    "iPhone";
  const deviceId =
    parsedProviderData.deviceid || parsedProviderData.device_id || "";
  const deviceDescription =
    parsedProviderData.description ||
    parsedProviderData.model_description ||
    "";
  const marketingName = parsedProviderData.marketing_name || "";
  const deviceConfiguration = parsedProviderData.device_configuration || "";
  const modelName = parsedProviderData.model_name || "";
  const fullName = parsedProviderData.full_name || "";
  const manufacturer = parsedProviderData.manufacturer || "";

  // Identifiers
  const imeiValue =
    parsedProviderData.imei_number ||
    parsedProviderData.imei1 ||
    parsedProviderData.imei ||
    parsedProviderData.deviceid ||
    scanResult.imei ||
    "";
  const imei2Value =
    parsedProviderData.imei2_number ||
    parsedProviderData.imei2 ||
    parsedProviderData.imei_2 ||
    "";
  const meidValue =
    parsedProviderData.meid_number || parsedProviderData.meid || "";
  const serialNumber =
    parsedProviderData.serial_number ||
    parsedProviderData.serial ||
    parsedProviderData.sn ||
    "N/A";
  const serialKey = parsedProviderData.serial_key || "";
  const eidNumber =
    parsedProviderData.eid || parsedProviderData.csncsn2eid || "N/A";
  const configCode = parsedProviderData.config_code || "";
  const materialNumber = parsedProviderData.material_number || "";
  const partNumber =
    parsedProviderData.part_number || parsedProviderData.do_number || "";
  const modelNumber =
    parsedProviderData.model_number || parsedProviderData.basic_material || "";
  const doNumber = parsedProviderData.do_number || "";

  // Warranty & Coverage
  let warrantyStatus =
    parsedProviderData.warranty_type ||
    parsedProviderData.warranty_status ||
    "N/A";
  const warrantyStatusCode = parsedProviderData.warranty_status_code || "";
  const warrantyStatusDescription =
    parsedProviderData.warranty_status_description || "";
  const coverageStatus =
    parsedProviderData.coverage_status || warrantyStatusDescription || "";
  const limitedWarranty = parsedProviderData.limited_warranty || "";
  const incidentsAvailable = parsedProviderData.incidents_available || "";

  if (warrantyStatusCode === "LP") warrantyStatus = "Limited Warranty";
  if (parsedProviderData.applecare_covered === "Yes")
    warrantyStatus = "AppleCare+";

  const purchaseDate = parsedProviderData.purchase_date || "";
  const productionDate = parsedProviderData.production_date || "";
  const estimatedPurchaseDate =
    parsedProviderData.estimated_purchase_date || "";
  const coverageEndDate =
    parsedProviderData.warranty_expires ||
    parsedProviderData.warranty_until ||
    parsedProviderData.coverage_end_date ||
    parsedProviderData.repairs_and_service_expiration_date ||
    "N/A";
  const coverageStartDate = parsedProviderData.coverage_start_date || "";
  const daysRemaining = parsedProviderData.days_remaining || "";
  const coverageBenefits = parsedProviderData.coverage_benefits || "";
  const applecareDescription = parsedProviderData.applecare_description || "";
  const applecareCovered = parsedProviderData.applecare_covered || "";
  const applecareEligible = parsedProviderData.applecare_eligible || "";
  const applecareClaimEligible =
    parsedProviderData.applecare_claim_eligible || "";
  const applecareClaimInProgress =
    parsedProviderData.applecare_claim_in_progress || "";
  const applecarePurchaseDate =
    parsedProviderData.applecare_purchase_date || "";

  // Support Info
  const telephoneTechnicalSupport =
    parsedProviderData.telephone_technical_support || "";
  const telephoneSupportExpiresIn =
    parsedProviderData.telephone_technical_support_expires_in || "";
  const telephoneSupportExpirationDate =
    parsedProviderData.telephone_technical_support_expiration_date || "";
  const repairsAndServiceCoverage =
    parsedProviderData.repairs_and_service_coverage || "";
  const repairsAndServiceExpiresIn =
    parsedProviderData.repairs_and_service_expires_in || "";
  const repairsAndServiceExpirationDate =
    parsedProviderData.repairs_and_service_expiration_date || "";

  // Status Flags
  const activationStatus =
    parsedProviderData.activation_status ||
    (parsedProviderData.device_activation === "No"
      ? "Not Activated"
      : "Activated") ||
    "Activated";
  const deviceActivation = parsedProviderData.device_activation || "";

  let registrationStatus = parsedProviderData.registration_status || "";
  if (registrationStatus === "Yes") registrationStatus = "Registered";
  if (parsedProviderData.icloud_status === "CLEAN")
    registrationStatus = "Clean";
  const registrationDate = parsedProviderData.registration_date || "";

  const replacedDevice = parsedProviderData.replaced_device || "No";
  const replacementDevice = parsedProviderData.replacement_device || "No";
  const refurbishedDevice = parsedProviderData.refurbished_device || "No";
  const demoUnit =
    parsedProviderData.demo_unit || parsedProviderData.is_demo || "No";
  const loanerDevice = parsedProviderData.loaner_device || "No";
  const lostMode = parsedProviderData.lost_mode || "No";
  const validPurchaseDate = parsedProviderData.valid_purchase_date || "No";
  const tempCoverage = parsedProviderData.temp_coverage || "No";
  const openRepair = parsedProviderData.open_repair || "No";
  const isDemo = parsedProviderData.is_demo || "";
  const isValid = parsedProviderData.is_valid || "";

  // Lock Status
  let iCloudLock = parsedProviderData.icloud_lock || "N/A";
  if (iCloudLock === "ON") iCloudLock = "Locked";
  if (iCloudLock === "OFF") iCloudLock = "Unlocked";

  const iCloudStatus = parsedProviderData.icloud_status || "N/A";

  let mdmLock = parsedProviderData.mdm_lock || "N/A";
  if (mdmLock === "ON") mdmLock = "Locked";
  if (mdmLock === "OFF") mdmLock = "Unlocked";

  const simlockStatus = parsedProviderData.simlock_status || "N/A";
  const simlock =
    parsedProviderData.simlock || parsedProviderData.sim_lock || "";
  const lockedCarrier = parsedProviderData.locked_carrier || "";

  let unlockStatus = "N/A";
  if (parsedProviderData.simpolicy_unlock_status) {
    unlockStatus = parsedProviderData.simpolicy_unlock_status;
  } else if (
    parsedProviderData.initial_activation_policy_description?.includes("UNLOCK")
  ) {
    unlockStatus = "UNLOCKED";
  } else if (parsedProviderData.simlock_status === "Unlocked") {
    unlockStatus = "UNLOCKED";
  } else if (parsedProviderData.locked_carrier === "10 - Unlock") {
    unlockStatus = "UNLOCKED";
  }

  // Carrier & Network
  const carrierName =
    parsedProviderData.carrier_name || parsedProviderData.carrier || "N/A";
  const sim1Carrier =
    parsedProviderData.sim1_carrier || parsedProviderData.carrier || "";
  const soldToName =
    parsedProviderData.sold_to_name ||
    parsedProviderData.sales_buyer_name ||
    "";
  const salesBuyerCode = parsedProviderData.sales_buyer_code || "";
  const salesBuyerName = parsedProviderData.sales_buyer_name || "";
  const soldByCountry = parsedProviderData.sold_by_country || "";
  const shipToCountry = parsedProviderData.ship_to_country || "";
  const purchaseCountryDesc =
    parsedProviderData.purchase_country_desc ||
    parsedProviderData.sold_by_country ||
    "";
  const purchaseCountryCode = parsedProviderData.purchase_country_code || "";
  const partCountry = parsedProviderData.part_country || "";
  const partType = parsedProviderData.part_type || "";

  // Activation & Policy
  const appliedActivationDetails =
    parsedProviderData.applied_activation_details || "";
  const appliedActivationPolicyId =
    parsedProviderData.applied_activation_policy_id || "";
  const initialActivationPolicyId =
    parsedProviderData.initial_activation_policy_id || "";
  const initialActivationPolicyDescription =
    parsedProviderData.initial_activation_policy_description || "";
  const lastActivationPolicyDescription =
    parsedProviderData.last_activation_policy_description || "";
  const nextActivationPolicyDescription =
    parsedProviderData.next_activation_policy_description || "";
  const nextTetherPolicyId = parsedProviderData.next_tether_policy_id || "";
  const nextTetherPolicyDetails =
    parsedProviderData.next_tether_policy_details || "";
  const unlockDate = parsedProviderData.unlock_date || "";

  // Device Specs
  const productDescription =
    parsedProviderData.product_description ||
    parsedProviderData.config_description ||
    "";
  const productVersion = parsedProviderData.product_version || "";
  const productLine = parsedProviderData.product_line || "";
  const configDescription = parsedProviderData.config_description || "";
  const deviceFamily = parsedProviderData.device_family || "";

  let capacity = parsedProviderData.capacity || "";
  if (productDescription.includes("256GB")) capacity = "256GB";
  if (productDescription.includes("128GB")) capacity = "128GB";
  if (productDescription.includes("512GB")) capacity = "512GB";
  if (deviceConfiguration.includes("256GB")) capacity = "256GB";

  let color = "";
  if (productDescription.includes("DBLUE")) color = "Deep Blue";
  if (productDescription.includes("BLU")) color = "Blue";
  if (deviceConfiguration.includes("DBLUE")) color = "Deep Blue";
  if (deviceConfiguration.includes("BLU")) color = "Blue";

  // Dates
  const firstActivationDate = parsedProviderData.first_activation_date || "";
  const lastRestoreDate = parsedProviderData.last_restore_date || "";
  const lastUnbrickOsBuild = parsedProviderData.last_unbrick_os_build || "";
  const initialUnbrick = parsedProviderData.initial_unbrick || "";
  const soldDate = parsedProviderData.sold_date || "";
  const shipDate = parsedProviderData.ship_date || "";

  // GSX & History
  const gsxReplacementHistory =
    parsedProviderData.gsx_replacement_history || "";

  // Other
  const notice = parsedProviderData.notice || "";
  const wirelessMacAddress = parsedProviderData.wireless_mac_address || "";
  const iccid = parsedProviderData.iccid || "";
  const messages = parsedProviderData.messages || "";
  const knoxGuard = parsedProviderData.knox_guard || "";
  const blacklistStatus = parsedProviderData.blacklist_status || "";
  const attStatus = parsedProviderData.att_status || "";
  const errorR01 = parsedProviderData.error_r01 || "";

  const hasError =
    !!parsedProviderData.error_r01 || !!parsedProviderData.failed_reason;
  const errorMessage =
    parsedProviderData.error_r01 || parsedProviderData.failed_reason || "";
  const isEmpty = Object.keys(parsedProviderData).length === 0;

  const image = parsedProviderData.image?.src || null;
  const aiInsight = mainData?.aiInsight || null;

  return {
    deviceName,
    deviceId,
    deviceDescription,
    marketingName,
    deviceConfiguration,
    modelName,
    fullName,
    manufacturer,
    imeiValue,
    imei2Value,
    meidValue,
    serialNumber,
    serialKey,
    eidNumber,
    configCode,
    materialNumber,
    partNumber,
    modelNumber,
    doNumber,
    warrantyStatus,
    warrantyStatusCode,
    warrantyStatusDescription,
    coverageStatus,
    purchaseDate,
    productionDate,
    estimatedPurchaseDate,
    coverageEndDate,
    coverageStartDate,
    daysRemaining,
    coverageBenefits,
    applecareDescription,
    applecareCovered,
    applecareEligible,
    applecareClaimEligible,
    applecareClaimInProgress,
    applecarePurchaseDate,
    limitedWarranty,
    incidentsAvailable,
    telephoneTechnicalSupport,
    telephoneSupportExpiresIn,
    telephoneSupportExpirationDate,
    repairsAndServiceCoverage,
    repairsAndServiceExpiresIn,
    repairsAndServiceExpirationDate,
    activationStatus,
    deviceActivation,
    registrationStatus,
    registrationDate,
    replacedDevice,
    replacementDevice,
    refurbishedDevice,
    demoUnit,
    loanerDevice,
    lostMode,
    validPurchaseDate,
    tempCoverage,
    openRepair,
    isDemo,
    isValid,
    iCloudLock,
    iCloudStatus,
    mdmLock,
    simlockStatus,
    simlock,
    unlockStatus,
    lockedCarrier,
    carrierName,
    sim1Carrier,
    soldToName,
    salesBuyerCode,
    salesBuyerName,
    soldByCountry,
    shipToCountry,
    purchaseCountryDesc,
    purchaseCountryCode,
    partCountry,
    partType,
    appliedActivationDetails,
    appliedActivationPolicyId,
    initialActivationPolicyId,
    initialActivationPolicyDescription,
    lastActivationPolicyDescription,
    nextActivationPolicyDescription,
    nextTetherPolicyId,
    nextTetherPolicyDetails,
    unlockDate,
    capacity,
    color,
    productLine,
    configDescription,
    deviceFamily,
    productDescription,
    productVersion,
    firstActivationDate,
    lastRestoreDate,
    lastUnbrickOsBuild,
    initialUnbrick,
    soldDate,
    shipDate,
    gsxReplacementHistory,
    notice,
    wirelessMacAddress,
    iccid,
    messages,
    knoxGuard,
    blacklistStatus,
    attStatus,
    errorR01,
    hasError,
    errorMessage,
    isEmpty,
    riskScore,
    riskLevel,
    image,
    aiInsight,
    provider,
    oldGenerated,
    rawData: mainData,
  };
};

export const SingleResultView = ({
  scanResult,
  singleReportMeta,
  selectedService,
  onBack,
  onRegenerate,
  onDownload,
  isDownloading: parentIsDownloading,
}: SingleResultViewProps) => {
  const { status } = useSession();
  const isGuest = status === "unauthenticated";
  const { downloadCertificatePdf } = useCertificateDownload();

  const [isCertificateDownloading, setIsCertificateDownloading] =
    useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] =
    useState<InvoiceFormData | null>(null);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);

  const extractedData = useMemo(
    () => extractDeviceData(scanResult),
    [scanResult],
  );

  const {
    deviceName,
    deviceId,
    deviceDescription,
    marketingName,
    deviceConfiguration,
    modelName,
    fullName,
    manufacturer,
    imeiValue,
    imei2Value,
    meidValue,
    serialNumber,
    serialKey,
    eidNumber,
    configCode,
    materialNumber,
    partNumber,
    modelNumber,
    doNumber,
    warrantyStatus,
    warrantyStatusCode,
    warrantyStatusDescription,
    coverageStatus,
    purchaseDate,
    productionDate,
    estimatedPurchaseDate,
    coverageEndDate,
    coverageStartDate,
    daysRemaining,
    coverageBenefits,
    applecareDescription,
    applecareCovered,
    applecareEligible,
    applecareClaimEligible,
    applecareClaimInProgress,
    applecarePurchaseDate,
    limitedWarranty,
    incidentsAvailable,
    telephoneTechnicalSupport,
    telephoneSupportExpiresIn,
    telephoneSupportExpirationDate,
    repairsAndServiceCoverage,
    repairsAndServiceExpiresIn,
    repairsAndServiceExpirationDate,
    activationStatus,
    deviceActivation,
    registrationStatus,
    registrationDate,
    replacedDevice,
    replacementDevice,
    refurbishedDevice,
    demoUnit,
    loanerDevice,
    lostMode,
    validPurchaseDate,
    tempCoverage,
    openRepair,
    isDemo,
    isValid,
    iCloudLock,
    iCloudStatus,
    mdmLock,
    simlockStatus,
    simlock,
    unlockStatus,
    lockedCarrier,
    carrierName,
    sim1Carrier,
    soldToName,
    salesBuyerCode,
    salesBuyerName,
    soldByCountry,
    shipToCountry,
    purchaseCountryDesc,
    purchaseCountryCode,
    partCountry,
    partType,
    appliedActivationDetails,
    appliedActivationPolicyId,
    initialActivationPolicyId,
    initialActivationPolicyDescription,
    lastActivationPolicyDescription,
    nextActivationPolicyDescription,
    nextTetherPolicyId,
    nextTetherPolicyDetails,
    unlockDate,
    capacity,
    color,
    productLine,
    configDescription,
    deviceFamily,
    productDescription,
    productVersion,
    firstActivationDate,
    lastRestoreDate,
    lastUnbrickOsBuild,
    initialUnbrick,
    soldDate,
    shipDate,
    gsxReplacementHistory,
    notice,
    wirelessMacAddress,
    iccid,
    messages,
    knoxGuard,
    blacklistStatus,
    attStatus,
    errorR01,
    hasError,
    errorMessage,
    isEmpty,
    riskScore,
    riskLevel,
    image,
    aiInsight,
    provider,
    oldGenerated,
  } = extractedData;

  // Collect all non-empty fields for display - with proper boolean conditions
  const allFields: FieldConfig[] = useMemo(() => {
    const fields: FieldConfig[] = [
      // Basic Info
      { label: "Device Name", value: deviceName },
      { label: "Device ID", value: deviceId, condition: !!deviceId },
      {
        label: "Device Description",
        value: deviceDescription,
        condition: !!deviceDescription,
      },
      {
        label: "Marketing Name",
        value: marketingName,
        condition: !!marketingName,
      },
      {
        label: "Device Configuration",
        value: deviceConfiguration,
        condition: !!deviceConfiguration,
      },
      { label: "Model Name", value: modelName, condition: !!modelName },
      { label: "Full Name", value: fullName, condition: !!fullName },
      { label: "Manufacturer", value: manufacturer, condition: !!manufacturer },

      // Identifiers
      { label: "IMEI", value: imeiValue },
      { label: "IMEI2", value: imei2Value, condition: !!imei2Value },
      { label: "MEID", value: meidValue, condition: !!meidValue },
      { label: "Serial Number", value: serialNumber },
      { label: "Serial Key", value: serialKey, condition: !!serialKey },
      {
        label: "EID",
        value: eidNumber,
        condition: eidNumber !== "N/A" && !!eidNumber,
      },
      { label: "Config Code", value: configCode, condition: !!configCode },
      {
        label: "Material Number",
        value: materialNumber,
        condition: !!materialNumber,
      },
      {
        label: "Part Number",
        value: partNumber,
        condition: partNumber !== "N/A" && !!partNumber,
      },
      {
        label: "Model Number",
        value: modelNumber,
        condition: modelNumber !== "N/A" && !!modelNumber,
      },
      { label: "DO Number", value: doNumber, condition: !!doNumber },

      // Product Specs
      {
        label: "Product Description",
        value: productDescription,
        condition: !!productDescription,
      },
      {
        label: "Product Version",
        value: productVersion,
        condition: !!productVersion,
      },
      { label: "Product Line", value: productLine, condition: !!productLine },
      {
        label: "Config Description",
        value: configDescription,
        condition: !!configDescription,
      },
      {
        label: "Device Family",
        value: deviceFamily,
        condition: !!deviceFamily,
      },
      { label: "Capacity", value: capacity, condition: !!capacity },
      { label: "Color", value: color, condition: !!color },

      // Warranty & Coverage
      { label: "Warranty Status", value: warrantyStatus },
      {
        label: "Warranty Status Code",
        value: warrantyStatusCode,
        condition: !!warrantyStatusCode,
      },
      {
        label: "Warranty Status Description",
        value: warrantyStatusDescription,
        condition: !!warrantyStatusDescription,
      },
      {
        label: "Coverage Status",
        value: coverageStatus,
        condition: !!coverageStatus,
      },
      {
        label: "Coverage Start Date",
        value: coverageStartDate ? formatDate(coverageStartDate) : null,
        condition: !!coverageStartDate,
      },
      {
        label: "Coverage End Date",
        value: coverageEndDate !== "N/A" ? formatDate(coverageEndDate) : null,
        condition: coverageEndDate !== "N/A",
      },
      {
        label: "Purchase Date",
        value: purchaseDate ? formatDate(purchaseDate) : null,
        condition: !!purchaseDate,
      },
      {
        label: "Production Date",
        value: productionDate ? formatDate(productionDate) : null,
        condition: !!productionDate,
      },
      {
        label: "Estimated Purchase Date",
        value: estimatedPurchaseDate ? formatDate(estimatedPurchaseDate) : null,
        condition: !!estimatedPurchaseDate,
      },
      {
        label: "Days Remaining",
        value: daysRemaining,
        condition: !!daysRemaining,
      },
      {
        label: "Coverage Benefits",
        value: coverageBenefits,
        condition: !!coverageBenefits,
      },
      {
        label: "Limited Warranty",
        value:
          limitedWarranty === "Yes"
            ? "Yes"
            : limitedWarranty === "No"
              ? "No"
              : null,
        condition: !!limitedWarranty,
      },
      {
        label: "Incidents Available",
        value: incidentsAvailable,
        condition: !!incidentsAvailable,
      },

      // AppleCare
      {
        label: "AppleCare Description",
        value: applecareDescription,
        condition: !!applecareDescription,
      },
      {
        label: "AppleCare Covered",
        value:
          applecareCovered === "Yes"
            ? "Yes"
            : applecareCovered === "No"
              ? "No"
              : null,
        condition: !!applecareCovered,
      },
      {
        label: "AppleCare Eligible",
        value:
          applecareEligible === "Yes"
            ? "Yes"
            : applecareEligible === "No"
              ? "No"
              : null,
        condition: !!applecareEligible,
      },
      {
        label: "AppleCare Claim Eligible",
        value:
          applecareClaimEligible === "Yes"
            ? "Yes"
            : applecareClaimEligible === "No"
              ? "No"
              : null,
        condition: !!applecareClaimEligible,
      },
      {
        label: "AppleCare Claim In Progress",
        value:
          applecareClaimInProgress === "Yes"
            ? "Yes"
            : applecareClaimInProgress === "No"
              ? "No"
              : null,
        condition: !!applecareClaimInProgress,
      },
      {
        label: "AppleCare Purchase Date",
        value: applecarePurchaseDate ? formatDate(applecarePurchaseDate) : null,
        condition: !!applecarePurchaseDate,
      },

      // Support
      {
        label: "Telephone Technical Support",
        value: telephoneTechnicalSupport,
        condition: !!telephoneTechnicalSupport,
      },
      {
        label: "Telephone Support Expires In",
        value: telephoneSupportExpiresIn,
        condition: !!telephoneSupportExpiresIn,
      },
      {
        label: "Telephone Support Expiration Date",
        value: telephoneSupportExpirationDate
          ? formatDate(telephoneSupportExpirationDate)
          : null,
        condition: !!telephoneSupportExpirationDate,
      },
      {
        label: "Repairs & Service Coverage",
        value: repairsAndServiceCoverage,
        condition: !!repairsAndServiceCoverage,
      },
      {
        label: "Repairs & Service Expires In",
        value: repairsAndServiceExpiresIn,
        condition: !!repairsAndServiceExpiresIn,
      },
      {
        label: "Repairs & Service Expiration Date",
        value: repairsAndServiceExpirationDate
          ? formatDate(repairsAndServiceExpirationDate)
          : null,
        condition: !!repairsAndServiceExpirationDate,
      },

      // Status - All status fields always shown, but with proper values
      { label: "Activation Status", value: activationStatus },
      {
        label: "Device Activation",
        value:
          deviceActivation === "No"
            ? "Not Activated"
            : deviceActivation === "Yes"
              ? "Activated"
              : deviceActivation,
        condition: !!deviceActivation,
      },
      {
        label: "Registration Status",
        value: registrationStatus,
        condition: !!registrationStatus,
      },
      {
        label: "Registration Date",
        value: registrationDate ? formatDate(registrationDate) : null,
        condition: !!registrationDate,
      },
      {
        label: "Replaced Device",
        value: replacedDevice === "Yes" ? "Yes" : "No",
      },
      {
        label: "Replacement Device",
        value:
          replacementDevice === "Yes"
            ? "Yes"
            : replacementDevice === "No"
              ? "No"
              : null,
        condition: !!replacementDevice && replacementDevice !== "No",
      },
      {
        label: "Refurbished Device",
        value:
          refurbishedDevice === "Yes"
            ? "Yes"
            : refurbishedDevice === "No"
              ? "No"
              : null,
        condition: !!refurbishedDevice && refurbishedDevice !== "No",
      },
      {
        label: "Demo Unit",
        value:
          demoUnit === "Yes" || demoUnit === "True"
            ? "Yes"
            : demoUnit === "No" || demoUnit === "False"
              ? "No"
              : null,
        condition: !!demoUnit && demoUnit !== "No",
      },
      {
        label: "Is Demo",
        value: isDemo === "True" ? "Yes" : isDemo === "False" ? "No" : null,
        condition: !!isDemo,
      },
      {
        label: "Is Valid",
        value: isValid === "True" ? "Yes" : isValid === "False" ? "No" : null,
        condition: !!isValid,
      },
      {
        label: "Loaner Device",
        value:
          loanerDevice === "Yes" ? "Yes" : loanerDevice === "No" ? "No" : null,
        condition: !!loanerDevice && loanerDevice !== "No",
      },
      {
        label: "Lost Mode",
        value: lostMode === "Yes" ? "Yes" : lostMode === "No" ? "No" : null,
        condition: !!lostMode && lostMode !== "No",
      },
      {
        label: "Valid Purchase Date",
        value:
          validPurchaseDate === "Yes"
            ? "Yes"
            : validPurchaseDate === "No"
              ? "No"
              : null,
        condition: !!validPurchaseDate && validPurchaseDate !== "No",
      },
      {
        label: "Temp Coverage",
        value:
          tempCoverage === "Yes" ? "Yes" : tempCoverage === "No" ? "No" : null,
      },
      {
        label: "Open Repair",
        value: openRepair === "Yes" ? "Yes" : openRepair === "No" ? "No" : null,
      },

      // Lock Status
      {
        label: "iCloud Lock",
        value: iCloudLock !== "N/A" ? iCloudLock : null,
        condition: iCloudLock !== "N/A",
      },
      {
        label: "iCloud Status",
        value: iCloudStatus !== "N/A" ? iCloudStatus : null,
        condition: iCloudStatus !== "N/A",
      },
      {
        label: "MDM Lock",
        value: mdmLock !== "N/A" ? mdmLock : null,
        condition: mdmLock !== "N/A",
      },
      {
        label: "SIM Lock Status",
        value: simlockStatus !== "N/A" ? simlockStatus : null,
        condition: simlockStatus !== "N/A",
      },
      { label: "SIM Lock", value: simlock, condition: !!simlock },
      {
        label: "Unlock Status",
        value: unlockStatus !== "N/A" ? unlockStatus : null,
        condition: unlockStatus !== "N/A",
      },
      {
        label: "Locked Carrier",
        value: lockedCarrier,
        condition: !!lockedCarrier,
      },

      // Carrier & Network
      {
        label: "Carrier Name",
        value: carrierName !== "N/A" ? carrierName : null,
        condition: carrierName !== "N/A",
      },
      { label: "SIM1 Carrier", value: sim1Carrier, condition: !!sim1Carrier },
      { label: "Sold To", value: soldToName, condition: !!soldToName },
      {
        label: "Sales Buyer Code",
        value: salesBuyerCode,
        condition: !!salesBuyerCode,
      },
      {
        label: "Sales Buyer Name",
        value: salesBuyerName,
        condition: !!salesBuyerName,
      },
      {
        label: "Sold By Country",
        value: soldByCountry,
        condition: !!soldByCountry,
      },
      {
        label: "Ship To Country",
        value: shipToCountry,
        condition: !!shipToCountry,
      },
      {
        label: "Purchase Country",
        value: purchaseCountryDesc || purchaseCountryCode,
        condition: !!(purchaseCountryDesc || purchaseCountryCode),
      },
      { label: "Part Country", value: partCountry, condition: !!partCountry },
      { label: "Part Type", value: partType, condition: !!partType },

      // Activation Policy
      {
        label: "Applied Activation Details",
        value: appliedActivationDetails,
        condition: !!appliedActivationDetails,
      },
      {
        label: "Applied Activation Policy ID",
        value: appliedActivationPolicyId,
        condition: !!appliedActivationPolicyId,
      },
      {
        label: "Initial Activation Policy ID",
        value: initialActivationPolicyId,
        condition: !!initialActivationPolicyId,
      },
      {
        label: "Initial Activation Policy",
        value: initialActivationPolicyDescription,
        condition: !!initialActivationPolicyDescription,
      },
      {
        label: "Last Activation Policy",
        value: lastActivationPolicyDescription,
        condition: !!lastActivationPolicyDescription,
      },
      {
        label: "Next Activation Policy",
        value: nextActivationPolicyDescription,
        condition: !!nextActivationPolicyDescription,
      },
      {
        label: "Next Tether Policy ID",
        value: nextTetherPolicyId,
        condition: !!nextTetherPolicyId,
      },
      {
        label: "Next Tether Policy Details",
        value: nextTetherPolicyDetails,
        condition: !!nextTetherPolicyDetails,
      },
      {
        label: "Unlock Date",
        value: unlockDate ? formatDate(unlockDate) : null,
        condition: !!unlockDate,
      },

      // Dates
      {
        label: "First Activation Date",
        value: firstActivationDate ? formatDate(firstActivationDate) : null,
        condition: !!firstActivationDate,
      },
      {
        label: "Last Restore Date",
        value: lastRestoreDate ? formatDate(lastRestoreDate) : null,
        condition: !!lastRestoreDate,
      },
      {
        label: "Last Unbrick OS Build",
        value: lastUnbrickOsBuild,
        condition: !!lastUnbrickOsBuild,
      },
      {
        label: "Initial Unbrick",
        value: initialUnbrick ? formatDate(initialUnbrick) : null,
        condition: !!initialUnbrick,
      },
      {
        label: "Sold Date",
        value: soldDate ? formatDate(soldDate) : null,
        condition: !!soldDate,
      },
      {
        label: "Ship Date",
        value: shipDate ? formatDate(shipDate) : null,
        condition: !!shipDate,
      },

      // GSX History
      {
        label: "GSX Replacement History",
        value: gsxReplacementHistory,
        condition: !!gsxReplacementHistory,
      },

      // Other
      { label: "Notice", value: notice, condition: !!notice },
      {
        label: "Wireless MAC Address",
        value: wirelessMacAddress,
        condition: !!wirelessMacAddress,
      },
      { label: "ICCID", value: iccid, condition: !!iccid },
      { label: "Messages", value: messages, condition: !!messages },
      { label: "Knox Guard", value: knoxGuard, condition: !!knoxGuard },
      {
        label: "Blacklist Status",
        value: blacklistStatus,
        condition: !!blacklistStatus,
      },
      { label: "AT&T Status", value: attStatus, condition: !!attStatus },
      { label: "Error R01", value: errorR01, condition: !!errorR01 },
    ];

    return fields.filter((field) => {
      // Check if value exists and is not null/undefined
      const hasValue =
        field.value !== null && field.value !== undefined && field.value !== "";
      // Check condition if provided, otherwise true
      const conditionMet =
        field.condition !== undefined ? field.condition : true;
      return hasValue && conditionMet;
    });
  }, [extractedData]);

  const visibleFields = showAllFields ? allFields : allFields.slice(0, 15);

  const generateCopyText = useCallback(() => {
    return allFields
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");
  }, [allFields]);

  const handleCopyToClipboard = useCallback(() => {
    const text = generateCopyText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [generateCopyText]);

  const handleDownloadCertificate = async () => {
    if (onDownload) {
      await onDownload();
    } else {
      setIsCertificateDownloading(true);
      try {
        await downloadCertificatePdf(
          ["certificate-pdf-single"],
          `Certificate_${scanResult.imei}.pdf`,
        );
        toast.success("Certificate downloaded successfully!");
      } catch (error) {
        toast.error("Failed to download certificate");
      } finally {
        setIsCertificateDownloading(false);
      }
    }
  };

  const handleGenerateInvoice = async (formData: InvoiceFormData) => {
    setIsInvoiceGenerating(true);
    setInvoiceFormData(formData);
    setIsInvoiceModalOpen(false);
    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      await downloadCertificatePdf(
        ["smart-invoice-pdf-container"],
        `Invoice_${scanResult.imei}.pdf`,
      );
      toast.success("Invoice generated successfully!");
    } catch (error) {
      toast.error("Failed to generate invoice");
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) {
      toast.error("Regenerate function not available.");
      return;
    }
    const serviceId = selectedService?.serviceId ?? DEFAULT_SERVICE_ID;
    const currentImei = scanResult?.imei;
    if (!currentImei || !/^\d{15}$/.test(currentImei)) {
      toast.error(`Valid IMEI not found.`);
      return;
    }
    setIsRegenerating(true);
    try {
      await onRegenerate(currentImei, serviceId);
      toast.success("Report regenerated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate report");
    } finally {
      setIsRegenerating(false);
    }
  };

  const isDownloadingNow = parentIsDownloading || isCertificateDownloading;

  if (hasError || isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition"
          >
            <ArrowLeft size={18} /> Back to scan
          </button>
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 text-center">
            <div className="text-slate-400 text-6xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {hasError ? "Unable to Retrieve Data" : "No Data Available"}
            </h3>
            <p className="text-slate-500">
              {hasError && errorMessage
                ? errorMessage
                : "No device information available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition"
        >
          <ArrowLeft size={18} /> Back to scan
        </button>

        {oldGenerated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-[32px] p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Cached Data Notice
                </p>
                <p className="text-xs text-amber-700">
                  This data is from a previous report. Click &quot;Generate
                  New&quot; for the latest information.
                </p>
              </div>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 flex-shrink-0 transition"
            >
              {isRegenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {isRegenerating ? "Generating..." : "Generate New"}
            </button>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-5 shadow-sm relative">
          <div className="space-y-3 text-center text-[14px] text-[#5F6368] leading-relaxed">
            {image && (
              <div className="flex justify-center mb-2">
                <img
                  src={image}
                  alt="Device"
                  className="h-20 w-auto object-contain"
                />
              </div>
            )}

            {/* Display all fields */}
            {visibleFields.map((field, idx) => (
              <p key={idx}>
                <span className="font-semibold">{field.label}:</span>{" "}
                {String(field.value)}
              </p>
            ))}

            {/* Show More / Show Less Button */}
            {allFields.length > 15 && (
              <button
                onClick={() => setShowAllFields(!showAllFields)}
                className="text-primary text-sm font-semibold hover:underline mt-2"
              >
                {showAllFields
                  ? "Show Less"
                  : `Show More (${allFields.length - 15} more)`}
              </button>
            )}

            {/* Risk Meter */}
            <div className="border-t border-slate-100 pt-3 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Risk Level:</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getRiskBadgeColor(riskScore)}`}
                >
                  {riskLevel.toUpperCase()} RISK
                </span>
              </div>
              <div>
                <span className="font-semibold">Risk Score:</span> {riskScore}
                /100
              </div>
              <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getRiskColor(riskScore)}`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>

            {/* AI Insight */}
            {aiInsight?.message && (
              <div className="border-t border-slate-100 pt-3 mt-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield size={14} className="text-indigo-500" />
                  <p className="font-semibold text-indigo-600">
                    {aiInsight.title || "AI INSIGHT"}
                  </p>
                </div>
                <p className="text-sm italic text-slate-600">
                  {aiInsight.message}
                </p>
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyToClipboard}
            className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-500 transition"
            title="Copy to clipboard"
          >
            <Copy size={22} />
          </button>

          {copied && (
            <div className="absolute top-3 right-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
              Copied!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isGuest && (
          <div className="mt-4 flex gap-2 flex-col sm:flex-row">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              disabled={isInvoiceGenerating}
              className="flex-1 py-2.5 px-4 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm flex items-center justify-center gap-2 hover:bg-lime-50 transition disabled:opacity-50"
            >
              {isInvoiceGenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Receipt size={14} />
              )}
              Create Smart Invoice
            </button>
            <button
              onClick={handleDownloadCertificate}
              disabled={isDownloadingNow}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#84CC16] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 disabled:opacity-50"
            >
              {isDownloadingNow ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {isDownloadingNow ? "Generating..." : "Download PDF Certificate"}
            </button>
          </div>
        )}
      </div>

      {/* Hidden PDF Containers */}
      <div className="fixed top-0 left-[-10000px] w-[1100px] pointer-events-none z-0">
        <CertificatePDF
          data={scanResult}
          id="certificate-pdf-single"
          providerName={singleReportMeta?.provider || selectedService?.name}
          serviceId={
            singleReportMeta?.serviceId ??
            selectedService?.serviceId ??
            undefined
          }
        />
        {invoiceFormData && (
          <SmartInvoicePDF
            data={scanResult}
            id="smart-invoice-pdf-container"
            invoiceData={invoiceFormData}
          />
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
        scanResult={scanResult}
        isGenerating={isInvoiceGenerating}
      />
    </div>
  );
};
