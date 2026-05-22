// hooks/useScanDevice.ts - সম্পূর্ণ আপডেটেড

import { useState, useCallback } from "react";
import {
  checkIMEIApi,
  checkFavouriteIMEIApi,
} from "../../scanDevice/api/scanDevice.api";
import {
  IMEIResult,
  BatchImeiResponse,
  BatchImeiItemResult,
  FavouriteIMEIData,
} from "../../scanDevice/types/scanDevice.types";

export const useScanDevice = () => {
  const [imei, setImei] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<IMEIResult | null>(null);
  const [favouriteResult, setFavouriteResult] =
    useState<FavouriteIMEIData | null>(null);
  const [batchResult, setBatchResult] = useState<BatchImeiResponse | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [singleReportMeta, setSingleReportMeta] = useState<{
    provider?: string;
    serviceId?: number;
  } | null>(null);

  const isValidIMEI = (imei: string): boolean => {
    return /^\d{15}$/.test(imei);
  };

  const parseIMEIInput = useCallback(
    (input: string): string[] => {
      if (!input || input.trim() === "") return [];
      const items = input
        .split(/[,\n\r\t;]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && isValidIMEI(item));
      console.log("📝 Parsed IMEIs:", items);
      return items;
    },
    [isValidIMEI],
  );

  // Check if selected service is favourite
  const isFavouriteService = useCallback((serviceId: number): boolean => {
    // Favourite service IDs: 1000, 1001, 1002 etc.
    return [1000, 1001, 1002].includes(serviceId);
  }, []);

  const handleScan = useCallback(
    async (imeiInput: string, serviceId: number, onComplete?: () => void) => {
      if (!imeiInput || !serviceId) return;

      console.log("🔍 Raw input:", imeiInput);

      const imeiList = parseIMEIInput(imeiInput);
      console.log("📋 Parsed list:", imeiList);
      console.log("📊 Is bulk:", imeiList.length > 1);

      if (imeiList.length === 0) {
        setError("No valid IMEI found. Please enter valid IMEI numbers.");
        setIsScanning(false);
        return;
      }

      setIsScanning(true);
      setScanResult(null);
      setFavouriteResult(null);
      setBatchResult(null);
      setError(null);
      setCurrentStep(1);

      try {
        setTimeout(() => setCurrentStep(2), 1500);
        setTimeout(() => setCurrentStep(3), 3000);

        const isBulk = imeiList.length > 1;
        const isFav = !isBulk && isFavouriteService(serviceId);

        // Favourite service (single IMEI only)
        if (isFav) {
          console.log("⭐ Sending favourite service request:", {
            imei: imeiList[0],
            serviceId,
          });

          const response = await checkFavouriteIMEIApi(imeiList[0], serviceId);
          console.log("📦 Favourite response:", response);

          if (
            response.success &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const firstItem = response.data[0];
            if (firstItem.ok && firstItem.data) {
              setTimeout(() => {
                setFavouriteResult(firstItem.data);
                setSingleReportMeta({
                  provider: firstItem.data.bundledServiceName,
                  serviceId: firstItem.data.bundledServiceId,
                });
                setIsScanning(false);
                onComplete?.();
              }, 4500);
            } else {
              setError(firstItem.message || "No valid IMEI data received");
              setIsScanning(false);
            }
          } else {
            setError(response.message || "Failed to check IMEI");
            setIsScanning(false);
          }
        }
        // Bulk IMEI check
        else if (isBulk) {
          console.log("🚀 Sending bulk request:", {
            imei: imeiList,
            serviceId,
          });
          const response = await checkIMEIApi(imeiList, serviceId);
          console.log("📦 Bulk response:", response);

          if (response.success && Array.isArray(response.data)) {
            const bulkItems: BatchImeiItemResult[] = response.data.map(
              (item, index) => ({
                rowNumber: index + 1,
                imei: item.imei,
                ok: item.ok,
                message: item.message,
                data: item.data || undefined,
                serviceId: serviceId,
                provider: item.provider || "API",
              }),
            );

            const successCount = bulkItems.filter((item) => item.ok).length;
            const failedCount = bulkItems.filter((item) => !item.ok).length;

            const batchResponse: BatchImeiResponse = {
              success: true,
              message: response.message,
              summary: { total: imeiList.length, successCount, failedCount },
              data: bulkItems,
            };
            setBatchResult(batchResponse);
            setTimeout(() => {
              setIsScanning(false);
              onComplete?.();
            }, 4500);
          } else {
            setError(response.message || "Failed to check IMEIs");
            setIsScanning(false);
          }
        }
        // Single IMEI check (non-favourite)
        else {
          console.log("🎯 Sending single request:", {
            imei: imeiList[0],
            serviceId,
          });
          const response = await checkIMEIApi(imeiList[0], serviceId);

          if (
            response.success &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const firstItem = response.data[0];
            if (firstItem.ok && firstItem.data) {
              setTimeout(() => {
                setScanResult(firstItem.data);
                setSingleReportMeta({
                  provider:
                    firstItem.provider ||
                    (firstItem.data as { provider?: string })?.provider,
                  serviceId: firstItem.serviceId || serviceId,
                });
                setIsScanning(false);
                onComplete?.();
              }, 4500);
            } else {
              setError(firstItem.message || "No valid IMEI data received");
              setIsScanning(false);
            }
          } else {
            setError(response.message || "Failed to check IMEI");
            setIsScanning(false);
          }
        }
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        console.error("❌ Scan error:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong",
        );
        setIsScanning(false);
      }
    },
    [parseIMEIInput, isFavouriteService, isValidIMEI],
  );

  const handleRegenerateScan = useCallback(
    async (imeiInput: string, serviceId: number, onComplete?: () => void) => {
      if (!imeiInput || !serviceId) return;

      console.log("🔄 Regenerating scan with generate: new");
      console.log("🔍 Raw input:", imeiInput);

      const imeiList = parseIMEIInput(imeiInput);

      if (imeiList.length === 0) {
        setError("No valid IMEI found. Please enter valid IMEI numbers.");
        return;
      }

      setIsScanning(true);
      setScanResult(null);
      setFavouriteResult(null);
      setBatchResult(null);
      setError(null);
      setCurrentStep(1);

      try {
        setTimeout(() => setCurrentStep(2), 1500);
        setTimeout(() => setCurrentStep(3), 3000);

        const isBulk = imeiList.length > 1;
        const isFav = !isBulk && isFavouriteService(serviceId);

        // Favourite service (single IMEI only)
        if (isFav) {
          console.log("⭐ Sending favourite service request with regenerate:", {
            imei: imeiList[0],
            serviceId,
            generate: "new",
          });

          const response = await checkFavouriteIMEIApi(
            imeiList[0],
            serviceId,
            true,
          );

          if (
            response.success &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const firstItem = response.data[0];
            if (firstItem.ok && firstItem.data) {
              setTimeout(() => {
                setFavouriteResult(firstItem.data);
                setSingleReportMeta({
                  provider: firstItem.data.bundledServiceName,
                  serviceId: firstItem.data.bundledServiceId,
                });
                setIsScanning(false);
                onComplete?.();
              }, 4500);
            } else {
              setError(firstItem.message || "No valid IMEI data received");
              setIsScanning(false);
            }
          } else {
            setError(response.message || "Failed to check IMEI");
            setIsScanning(false);
          }
        }
        // Bulk IMEI check
        else if (isBulk) {
          console.log("🚀 Sending bulk request with regenerate:", {
            imei: imeiList,
            serviceId,
            generate: "new",
          });

          const response = await checkIMEIApi(imeiList, serviceId, true);
          console.log("📦 Bulk response:", response);

          if (response.success && Array.isArray(response.data)) {
            const bulkItems: BatchImeiItemResult[] = response.data.map(
              (item, index) => ({
                rowNumber: index + 1,
                imei: item.imei,
                ok: item.ok,
                message: item.message,
                data: item.data || undefined,
                serviceId: serviceId,
                provider: item.provider || "API",
              }),
            );

            const successCount = bulkItems.filter((item) => item.ok).length;
            const failedCount = bulkItems.filter((item) => !item.ok).length;

            const batchResponse: BatchImeiResponse = {
              success: true,
              message: response.message,
              summary: { total: imeiList.length, successCount, failedCount },
              data: bulkItems,
            };
            setBatchResult(batchResponse);
            setTimeout(() => {
              setIsScanning(false);
              onComplete?.();
            }, 4500);
          } else {
            setError(response.message || "Failed to check IMEIs");
            setIsScanning(false);
          }
        }
        // Single IMEI check (non-favourite)
        else {
          console.log("🎯 Sending single request with regenerate:", {
            imei: imeiList[0],
            serviceId,
            generate: "new",
          });

          const response = await checkIMEIApi(imeiList[0], serviceId, true);

          if (
            response.success &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const firstItem = response.data[0];
            if (firstItem.ok && firstItem.data) {
              setTimeout(() => {
                setScanResult(firstItem.data);
                setSingleReportMeta({
                  provider:
                    firstItem.provider ||
                    (firstItem.data as { provider?: string })?.provider,
                  serviceId: firstItem.serviceId || serviceId,
                });
                setIsScanning(false);
                onComplete?.();
              }, 4500);
            } else {
              setError(firstItem.message || "No valid IMEI data received");
              setIsScanning(false);
            }
          } else {
            setError(response.message || "Failed to check IMEI");
            setIsScanning(false);
          }
        }
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        console.error("❌ Regenerate scan error:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong",
        );
        setIsScanning(false);
      }
    },
    [parseIMEIInput, isFavouriteService, isValidIMEI],
  );

  const clearResults = () => {
    console.log("🧹 Clearing all results");
    setScanResult(null);
    setFavouriteResult(null);
    setBatchResult(null);
    setSingleReportMeta(null);
    setError(null);
    setCurrentStep(0);
    setImei("");
  };

  return {
    imei,
    setImei,
    isScanning,
    scanResult,
    favouriteResult,
    batchResult,
    setBatchResult,
    currentStep,
    error,
    singleReportMeta,
    handleScan,
    handleRegenerateScan,
    clearResults,
    parseIMEIInput,
  };
};
