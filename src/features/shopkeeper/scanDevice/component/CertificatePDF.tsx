"use client";

import React from "react";
import QRCode from "react-qr-code";
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  CircleAlert,
  Shield,
} from "lucide-react";
import { IMEIResult } from "../types/scanDevice.types";

interface CertificatePDFProps {
  data: IMEIResult;
  id: string;
  providerName?: string;
  serviceId?: number;
}

export const CERTIFICATE_PDF_WIDTH = 800;
export const CERTIFICATE_PDF_HEIGHT = 1450;

// Helper functions
function getText(value: unknown, fallback = "N/A") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.src === "string") return obj.src;
  }
  return fallback;
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function stripHtml(value: string) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(font|span|b|strong|i|em)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/<img[^>]*>/gi, "")
    .trim();
}

function parseProviderRows(rawHtml?: string) {
  if (!rawHtml) return [];

  const cleanText = stripHtml(rawHtml);
  const rows: { label: string; value: string }[] = [];
  const lines = cleanText.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const label = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      if (label && value) {
        rows.push({ label, value });
      }
    }
  }
  return rows;
}

function getParsedRows(data: IMEIResult) {
  const parsedProviderData = (
    data as unknown as { parsedProviderData?: unknown }
  ).parsedProviderData;

  if (!parsedProviderData || typeof parsedProviderData !== "object") return [];

  return Object.entries(parsedProviderData as Record<string, unknown>)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([label, value]) => ({
      label: formatLabel(label),
      value: getText(value),
      rawValue: value,
    }));
}

function getAllProviderRows(data: IMEIResult) {
  const providerData = data.providerData as { result?: string } | undefined;
  const parsedRows = getParsedRows(data);
  const htmlRows = parseProviderRows(providerData?.result).map((row) => ({
    ...row,
    rawValue: row.value,
  }));
  const seen = new Set<string>();

  return [...parsedRows, ...htmlRows].filter((row) => {
    const key = normalizeLabel(row.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findProviderValue(
  rows: { label: string; value: string }[],
  searchTerms: string[],
) {
  for (const row of rows) {
    for (const term of searchTerms) {
      if (normalizeLabel(row.label).includes(normalizeLabel(term))) {
        return row.value;
      }
    }
  }
  return null;
}

export const CertificatePDF = React.forwardRef<
  HTMLDivElement,
  CertificatePDFProps
>(({ data, id, providerName, serviceId }, ref) => {
  const providerRows = getAllProviderRows(data);
  const imageRow = providerRows.find((row) => {
    const raw = row.rawValue;
    return (
      raw &&
      typeof raw === "object" &&
      typeof (raw as { src?: unknown }).src === "string"
    );
  });
  const imageSrc =
    imageRow && typeof imageRow.rawValue === "object"
      ? ((imageRow.rawValue as { src?: string }).src ?? "")
      : "";

  // Extract values from provider rows
  const deviceName =
    findProviderValue(providerRows, ["Device"]) ||
    data.deviceName ||
    "Unknown Device";
  const imeiValue =
    findProviderValue(providerRows, ["IMEI Number", "IMEI"]) || data.imei;
  const serialNumber =
    findProviderValue(providerRows, ["Serial Number", "Serial"]) || "";
  const warrantyExpiry =
    findProviderValue(providerRows, ["Warranty Expires", "Warranty Expiry"]) ||
    "";
  const purchaseDate =
    findProviderValue(providerRows, [
      "Estimated Purchase Date",
      "Purchase Date",
    ]) || "";
  const coverageBenefits =
    findProviderValue(providerRows, ["Coverage Benefits", "Benefits"]) || "";
  const notice = findProviderValue(providerRows, ["Notice"]) || "";
  const warrantyType =
    findProviderValue(providerRows, ["Warranty Type"]) || "N/A";
  const activationStatus =
    findProviderValue(providerRows, ["Activation Status"]) || "N/A";
  const registrationStatus =
    findProviderValue(providerRows, ["Registration Status"]) || "N/A";
  const openRepair = findProviderValue(providerRows, ["Open Repair"]) || "N/A";
  const replacedDevice =
    findProviderValue(providerRows, ["Replaced Device"]) || "N/A";

  // Risk meter data
  const riskScore = data.riskMeter?.score ?? 0;
  const riskLabel = data.riskMeter?.label ?? "Unknown Risk";
  const aiMessage = data.aiInsight?.message ?? "No AI insight available.";

  // Security checks
  const checks = data.checks;
  const checkItems = [
    {
      title: "Global Blacklist",
      description: checks?.globalBlacklist?.description,
      status: checks?.globalBlacklist?.status,
    },
    {
      title: "Carrier Financing",
      description: checks?.carrierFinancing?.description,
      status: checks?.carrierFinancing?.status,
    },
    {
      title: "Hardware Lock",
      description: checks?.hardwareLock?.description,
      status: checks?.hardwareLock?.status,
    },
    {
      title: "Part Authenticity",
      description: checks?.partAuthenticity?.description,
      status: checks?.partAuthenticity?.status,
    },
  ];

  // Conclusion based on risk score
  const conclusion =
    riskScore <= 25
      ? "This device appears safe based on the available verification signals."
      : riskScore <= 60
        ? "This device appears generally safe, but it should be reviewed with basic caution."
        : "This device should be handled carefully due to elevated verification risk signals.";

  const warningNotes = [
    "Always match the IMEI shown on the physical device with this certificate before completing a purchase.",
    "Use this certificate together with a live device check and physical inspection for the safest decision.",
  ];

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const colors = {
    ink: "#1F2937",
    softInk: "#4B5563",
    pale: "#6B7280",
    line: "#E5E7EB",
    section: "#F3F4F6",
    brand: "#84CC16",
    brandDark: "#65A30D",
    brandSoft: "#F7FEE7",
    brandLine: "#D9F99D",
    warning: "#D97706",
    warningBg: "#FEF3C7",
    warningSoft: "#FFFBEB",
  };

  return (
    <div
      ref={ref}
      id={id}
      style={{
        width: `${CERTIFICATE_PDF_WIDTH}px`,
        minHeight: `${CERTIFICATE_PDF_HEIGHT}px`,
        backgroundColor: "white",
        fontFamily: "'Inter', sans-serif",
        padding: "40px 34px 50px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "visible",
      }}
    >
      <div
        style={{
          borderRadius: "28px",
          border: `1px solid ${colors.line}`,
          backgroundColor: "#ffffff",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
          padding: "30px 28px 35px",
          minHeight: `${CERTIFICATE_PDF_HEIGHT - 90}px`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 132px",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "34px",
                  fontWeight: 900,
                  color: colors.brand,
                }}
              >
                imoscan
              </span>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  backgroundColor: colors.brand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BadgeCheck size={20} color="#ffffff" />
              </div>
            </div>
            <h1
              style={{ margin: "8px 0 4px", fontSize: "24px", fontWeight: 900 }}
            >
              Device Verification Certificate
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 600,
                color: colors.pale,
              }}
            >
              Check before you buy
            </p>
          </div>
          <div style={{ justifySelf: "end" }}>
            <div
              style={{
                border: `1px solid ${colors.line}`,
                borderRadius: "12px",
                padding: "6px",
              }}
            >
              <QRCode
                value={`https://imoscan.com/report/${imeiValue}`}
                size={90}
              />
            </div>
          </div>
        </div>

        {/* Device Details */}
        <div
          style={{
            border: `1px solid ${colors.line}`,
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              backgroundColor: colors.section,
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 800,
              borderBottom: `1px solid ${colors.line}`,
            }}
          >
            Device Details
          </div>
          <div style={{ padding: "18px" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {imageSrc && (
                <div
                  style={{
                    width: "110px",
                    height: "110px",
                    border: `1px solid ${colors.line}`,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Device"
                    style={{
                      maxWidth: "90px",
                      maxHeight: "90px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              <div style={{ flex: "1", minWidth: "250px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: colors.pale,
                      textTransform: "uppercase",
                    }}
                  >
                    Device Name
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700 }}>
                    {deviceName}
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: colors.pale,
                      textTransform: "uppercase",
                    }}
                  >
                    IMEI Number
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {imeiValue}
                  </div>
                </div>
                {serialNumber && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: colors.pale,
                        textTransform: "uppercase",
                      }}
                    >
                      Serial Number
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      {serialNumber}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ flex: "1", minWidth: "250px" }}>
                {warrantyExpiry && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: colors.pale,
                        textTransform: "uppercase",
                      }}
                    >
                      Warranty Expiry
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      {warrantyExpiry}
                    </div>
                  </div>
                )}
                {purchaseDate && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: colors.pale,
                        textTransform: "uppercase",
                      }}
                    >
                      Purchase Date
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      {purchaseDate}
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: colors.pale,
                      textTransform: "uppercase",
                    }}
                  >
                    Warranty Type
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>
                    {warrantyType}
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: colors.pale,
                      textTransform: "uppercase",
                    }}
                  >
                    Activation / Registration
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>
                    {activationStatus} / {registrationStatus}
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: colors.pale,
                      textTransform: "uppercase",
                    }}
                  >
                    Replaced / Open Repair
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>
                    {replacedDevice} / {openRepair}
                  </div>
                </div>
                {coverageBenefits && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: colors.pale,
                        textTransform: "uppercase",
                      }}
                    >
                      Coverage Benefits
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>
                      {coverageBenefits}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div
          style={{
            border: `1px solid ${colors.line}`,
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "18px",
            backgroundColor: colors.brandSoft,
          }}
        >
          <div
            style={{
              backgroundColor: colors.brandSoft,
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 800,
              color: colors.brandDark,
              borderBottom: `1px solid ${colors.brandLine}`,
            }}
          >
            AI Analysis
          </div>
          <div style={{ padding: "18px" }}>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                fontStyle: "italic",
                margin: 0,
              }}
            >
              &quot;{aiMessage}&quot;
            </p>
          </div>
        </div>

        {/* Risk Analysis */}
        <div
          style={{
            border: `1px solid ${colors.line}`,
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              backgroundColor: colors.brandSoft,
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 800,
              color: colors.brandDark,
              borderBottom: `1px solid ${colors.brandLine}`,
            }}
          >
            Risk Analysis
          </div>
          <div style={{ padding: "18px" }}>
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 700 }}>
                Risk Score:
              </span>
              <span
                style={{
                  backgroundColor: colors.brandSoft,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: colors.brandDark,
                }}
              >
                {riskScore}/100 - {riskLabel}
              </span>
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              Security Checks:
            </div>
            {checkItems.map((item, idx) => {
              const isPassed = item.status === "passed";
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  {isPassed ? (
                    <CheckCircle2
                      size={14}
                      color={colors.brand}
                      style={{ marginTop: "2px" }}
                    />
                  ) : (
                    <CircleAlert
                      size={14}
                      color={colors.warning}
                      style={{ marginTop: "2px" }}
                    />
                  )}
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 600 }}>
                      {item.title}:
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: colors.softInk,
                        marginLeft: "4px",
                      }}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>
              );
            })}

            <div
              style={{
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: `1px solid ${colors.line}`,
                display: "flex",
                gap: "8px",
              }}
            >
              <Shield size={14} color={colors.brand} />
              <span style={{ fontSize: "11px", fontWeight: 600 }}>
                Conclusion: {conclusion}
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: colors.warningSoft,
              padding: "12px 18px",
              borderTop: `1px solid #FDE68A`,
            }}
          >
            {notice && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#92400E",
                  marginBottom: "8px",
                }}
              >
                ⚠️ {notice}
              </div>
            )}
            {warningNotes.map((note, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: idx === 0 ? "8px" : 0,
                }}
              >
                <CircleAlert size={12} color={colors.warning} />
                <span style={{ fontSize: "10px", color: "#92400E" }}>
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Provider Response */}
        {providerRows.length > 0 && (
          <div
            style={{
              border: `1px solid ${colors.line}`,
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                backgroundColor: colors.brandSoft,
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: 800,
                color: colors.brandDark,
                borderBottom: `1px solid ${colors.brandLine}`,
              }}
            >
              Complete IMEI Check Data
            </div>
            <div
              style={{
                padding: "14px 18px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {providerRows.map((row, index) => (
                <div
                  key={`${row.label}-${index}`}
                  style={{
                    borderBottom: `1px solid ${colors.line}`,
                    paddingBottom: "8px",
                    minHeight: "42px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      color: colors.pale,
                      textTransform: "uppercase",
                    }}
                  >
                    {row.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: colors.ink,
                      wordBreak: "break-word",
                      lineHeight: 1.35,
                    }}
                  >
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <Shield size={12} color={colors.brand} />
            <span style={{ fontSize: "10px" }}>
              Report ID: IMO-{String(imeiValue).slice(-8)}
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <Calendar size={12} color={colors.brand} />
            <span style={{ fontSize: "10px" }}>Generated: {reportDate}</span>
          </div>
        </div>

        {(providerName || serviceId) && (
          <div
            style={{
              marginTop: "10px",
              textAlign: "center",
              fontSize: "9px",
              color: colors.pale,
            }}
          >
            {providerName && `Provider: ${providerName}`}
            {providerName && serviceId && " | "}
            {serviceId && `Service ID: ${serviceId}`}
          </div>
        )}
      </div>
    </div>
  );
});

CertificatePDF.displayName = "CertificatePDF";
