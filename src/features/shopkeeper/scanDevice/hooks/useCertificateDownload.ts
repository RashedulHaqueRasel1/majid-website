/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Certificate dimensions (A4 size in pixels at 96 DPI)
const CERTIFICATE_PDF_WIDTH = 800;
const CERTIFICATE_PDF_HEIGHT = 1100;

// Certificate quality settings
const CERTIFICATE_SCALE = 3; // Higher scale for better quality

export const useCertificateDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const waitForDomUpdate = (
    ms: number = 500, // Delay একটু বাড়িয়ে ৫০০ করুন যাতে ইমেজ লোড হওয়ার সময় পায়
  ) => new Promise((resolve) => setTimeout(resolve, ms));

  const downloadCertificatePdf = useCallback(
    async (
      elementIds: string[],
      filename: string,
      onProgress?: (progress: number) => void,
    ) => {
      if (elementIds.length === 0) {
        setError("No certificate elements found");
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);
      setError(null);

      try {
        // ইমেজ লোড হওয়ার জন্য পর্যাপ্ত সময় দিন
        await waitForDomUpdate(500);

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT],
        });

        let successCount = 0;

        for (let index = 0; index < elementIds.length; index++) {
          const elementId = elementIds[index];
          const element = document.getElementById(elementId);

          if (!element) continue;

          try {
            const canvas = await html2canvas(element, {
              scale: CERTIFICATE_SCALE,
              useCORS: true, // অত্যন্ত গুরুত্বপূর্ণ
              allowTaint: false, // এটি false রাখাই ভালো যাতে সিকিউরিটি এরর না দেয়
              logging: false,
              backgroundColor: "#ffffff",
              imageTimeout: 15000, // ইমেজ লোডের জন্য ১৫ সেকেন্ড পর্যন্ত অপেক্ষা করবে
            });

            const imgData = canvas.toDataURL("image/png", 1.0);

            if (index > 0) {
              pdf.addPage(
                [CERTIFICATE_PDF_WIDTH, CERTIFICATE_PDF_HEIGHT],
                "portrait",
              );
            }

            const imgWidth = CERTIFICATE_PDF_WIDTH;
            const imgHeight =
              (canvas.height * CERTIFICATE_PDF_WIDTH) / canvas.width;

            let yOffset = 0;
            if (imgHeight < CERTIFICATE_PDF_HEIGHT) {
              yOffset = (CERTIFICATE_PDF_HEIGHT - imgHeight) / 2;
            }

            pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);
            successCount++;

            const progress = Math.round(
              ((index + 1) / elementIds.length) * 100,
            );
            setDownloadProgress(progress);
            onProgress?.(progress);
          } catch (err) {
            console.error(`Error capturing ${elementId}:`, err);
          }
        }

        if (successCount === 0) throw new Error("Generation failed");

        pdf.save(filename);
      } catch (err: any) {
        setError(err.message || "Failed to generate PDF");
      } finally {
        setIsDownloading(false);
        setDownloadProgress(0);
      }
    },
    [],
  );

  return { isDownloading, downloadProgress, error, downloadCertificatePdf };
};
