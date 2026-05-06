"use client";

import React from "react";
import QRCode from "react-qr-code";
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  CircleAlert,
  Shield,
  Smartphone,
} from "lucide-react";
import { IMEIResult } from "../types/scanDevice.types";

interface CertificatePDFProps {
  data: IMEIResult;
  id: string;
  providerName?: string;
  serviceId?: number;
}

export const CERTIFICATE_PDF_WIDTH = 800;
export const CERTIFICATE_PDF_HEIGHT = 1320;

type ProviderDataShape = {
  result?: string;
};

function getObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function getText(value: unknown, fallback = "N/A") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : fallback;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(font|span|b|strong|i|em)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
}

function parseProviderRows(rawHtml?: string) {
  if (!rawHtml) return [];

  return stripHtml(rawHtml)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: label?.trim() || "Detail",
        value: rest.length ? rest.join(":").trim() : line,
      };
    });
}

function findProviderValue(
  rows: Array<{ label: string; value: string }>,
  labels: string[],
) {
  const lowered = labels.map((label) => label.toLowerCase());
  const found = rows.find((row) => lowered.includes(row.label.toLowerCase()));
  return found?.value;
}

function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const CertificatePDF = React.forwardRef<
  HTMLDivElement,
  CertificatePDFProps
>(({ data, id, providerName, serviceId }, ref) => {
  const resultData = getObject(data);
  const providerData = getObject(resultData?.providerData) as
    | ProviderDataShape
    | undefined;
  const riskMeter = getObject(resultData?.riskMeter);
  const marketValue = getObject(resultData?.marketValue);
  const technicalBreakdown = getObject(resultData?.technicalBreakdown);
  const origin = getObject(technicalBreakdown?.origin);
  const warranty = getObject(technicalBreakdown?.warranty);
  const activation = getObject(technicalBreakdown?.activation);
  const checks = getObject(resultData?.checks);

  const providerRows = parseProviderRows(providerData?.result);
  const deviceName = getText(resultData?.deviceName, "Unknown Device");
  const imei = getText(resultData?.imei);
  const riskLabel = getText(riskMeter?.label, "Unknown Risk");
  const riskScore = getNumber(riskMeter?.score) ?? 0;
  const warrantyLabel = getText(warranty?.label);
  const activationLabel = getText(activation?.label);
  const serialNumber =
    findProviderValue(providerRows, [
      "Serial Number",
      "Model Name",
      "Model Code",
      "Model Number",
    ]) || getText(origin?.modelNumber, "");
  const imei2 = findProviderValue(providerRows, ["IMEI 2", "IMEI2"]);
  const eid = findProviderValue(providerRows, ["EID"]);
  const marketAmount = getNumber(marketValue?.amount);
  const marketCurrency = getText(marketValue?.currency, "USD");

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const headerChecks = [
    {
      label: "Activation Status",
      value: activationLabel,
    },
    {
      label: "Warranty Status",
      value: warrantyLabel,
    },
    {
      label: "Market Value",
      value:
        marketAmount != null
          ? `${marketCurrency} ${marketAmount.toFixed(2)}`
          : marketCurrency,
    },
    {
      label: "Blacklist Status",
      value:
        getText(getObject(checks?.globalBlacklist)?.description, "") ||
        "No blacklist signal available",
    },
  ].filter((item) => item.value && item.value !== "N/A");

  const riskItems = [
    getObject(checks?.globalBlacklist),
    getObject(checks?.carrierFinancing),
    getObject(checks?.hardwareLock),
    getObject(checks?.partAuthenticity),
  ]
    .filter(Boolean)
    .map((check) => ({
      title: getText(check?.title, "Signal"),
      description: getText(check?.description, "No description available"),
      status: toTitleCase(getText(check?.status, "unknown")),
    }));

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

  const detailRows = [
    { label: "Device", value: deviceName },
    { label: "IMEI", value: imei },
    { label: "IMEI 2", value: imei2 || "" },
    { label: "Serial Number", value: serialNumber || "" },
    { label: "EID", value: eid || "" },
  ].filter((item) => item.value);

  const colors = {
    ink: "#1F2937",
    softInk: "#4B5563",
    pale: "#6B7280",
    line: "#E5E7EB",
    section: "#F3F4F6",
    brand: "#84CC16",
    brandBlue: "#60A5FA",
    success: "#16A34A",
    warning: "#D97706",
    warningBg: "#FEF3C7",
    warningSoft: "#FFFBEB",
    page: "#FFFFFF",
  };

  return (
    <div
      ref={ref}
      id={id}
      style={{
        width: `${CERTIFICATE_PDF_WIDTH}px`,
        minHeight: `${CERTIFICATE_PDF_HEIGHT}px`,
        backgroundColor: colors.page,
        fontFamily: "'Inter', sans-serif",
        padding: "40px 34px 34px",
        color: colors.ink,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          borderRadius: "28px",
          border: `1px solid ${colors.line}`,
          backgroundColor: "#ffffff",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
          padding: "30px 28px 28px",
          minHeight: `${CERTIFICATE_PDF_HEIGHT - 120}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 132px",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "8px",
              paddingTop: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "34px",
                  fontWeight: 900,
                  color: colors.brand,
                  letterSpacing: "-1px",
                }}
              >
                imoscan
              </span>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  backgroundColor: colors.brandBlue,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BadgeCheck size={20} color="#ffffff" strokeWidth={2.8} />
              </div>
            </div>
            <h1
              style={{
                margin: "6px 0 0",
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.6px",
                lineHeight: 1.15,
              }}
            >
              Device Verification Certificate
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                color: colors.pale,
              }}
            >
              Check before you buy
            </p>
          </div>

          <div style={{ justifySelf: "end", textAlign: "center" }}>
            <div
              style={{
                border: `1px solid ${colors.line}`,
                borderRadius: "14px",
                padding: "7px",
                backgroundColor: "#ffffff",
              }}
            >
              <QRCode value={`https://imoscan.com/report/${imei}`} size={96} />
            </div>
          </div>
        </div>

        <Section title="Device Details">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "170px 1fr",
              gap: "28px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                width: "170px",
                height: "170px",
                borderRadius: "12px",
                border: `1px solid ${colors.line}`,
                background: "linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "150px",
                  borderRadius: "26px",
                  background:
                    "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
                  boxShadow: "0 12px 25px rgba(15,23,42,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Smartphone size={52} color="#E2E8F0" strokeWidth={1.8} />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "190px 1fr",
                rowGap: "14px",
                columnGap: "18px",
                alignItems: "start",
                paddingTop: "4px",
              }}
            >
              {detailRows.map((row) => (
                <React.Fragment key={row.label}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: colors.ink,
                    }}
                  >
                    {row.label}:
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: colors.softInk,
                      lineHeight: 1.55,
                      wordBreak: "break-word",
                    }}
                  >
                    {row.value}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Verification Summary">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "18px 32px",
            }}
          >
            {headerChecks.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <CheckCircle2
                  size={22}
                  color={colors.brandBlue}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: colors.ink,
                      marginBottom: "4px",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.55,
                      fontWeight: 500,
                      color: colors.softInk,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div
          style={{
            border: `1px solid ${colors.line}`,
            borderRadius: "12px",
            overflow: "hidden",
            marginTop: "18px",
          }}
        >
          <div
            style={{
              backgroundColor: colors.warningBg,
              borderBottom: `1px solid #FDE68A`,
              padding: "16px 18px",
              fontSize: "15px",
              fontWeight: 800,
              color: "#7C2D12",
            }}
          >
            Risk Analysis (AI Powered)
          </div>
          <div
            style={{ padding: "18px 18px 16px", backgroundColor: "#ffffff" }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <CheckCircle2 size={24} color={colors.warning} />
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 900,
                  color: colors.ink,
                }}
              >
                Overall Risk Level:
              </div>
              <div
                style={{
                  borderRadius: "999px",
                  backgroundColor: colors.warningBg,
                  color: "#92400E",
                  fontSize: "13px",
                  fontWeight: 900,
                  padding: "6px 14px",
                  textTransform: "uppercase",
                }}
              >
                {riskLabel}
              </div>
            </div>

            <div
              style={{
                marginTop: "18px",
                fontSize: "14px",
                fontWeight: 700,
                color: colors.ink,
              }}
            >
              Explanation:
            </div>

            <div
              style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {riskItems.map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  {item.status === "Passed" ? (
                    <CheckCircle2
                      size={18}
                      color={colors.brandBlue}
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                  ) : (
                    <CircleAlert
                      size={18}
                      color={colors.warning}
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.6,
                      fontWeight: 500,
                      color: colors.softInk,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <Shield
                size={18}
                color={colors.brandBlue}
                style={{ marginTop: "2px" }}
              />
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: 1.65,
                  fontWeight: 800,
                  color: colors.ink,
                }}
              >
                Conclusion: {conclusion}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: colors.warningSoft,
              borderTop: `1px solid #FDE68A`,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {warningNotes.map((note, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <CircleAlert
                  size={18}
                  color={colors.warning}
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.6,
                    fontWeight: 600,
                    color: "#92400E",
                  }}
                >
                  {note}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
            gap: "34px",
            alignItems: "center",
            color: colors.softInk,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={16} color={colors.brand} />
            <span
              style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.5 }}
            >
              Report ID: IMO-{imei.slice(-8)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={16} color={colors.brandBlue} />
            <span
              style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.5 }}
            >
              Generated On: {reportDate}
            </span>
          </div>
        </div>

        {(providerName || serviceId) && (
          <div
            style={{
              marginTop: "14px",
              textAlign: "center",
              fontSize: "11px",
              color: colors.pale,
              fontWeight: 600,
              lineHeight: 1.6,
              wordBreak: "break-word",
            }}
          >
            {providerName ? `Provider: ${providerName}` : ""}
            {providerName && serviceId ? " | " : ""}
            {serviceId ? `Service ID: ${serviceId}` : ""}
          </div>
        )}
      </div>
    </div>
  );
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        overflow: "hidden",
        marginTop: "18px",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          backgroundColor: "#F3F4F6",
          borderBottom: "1px solid #D1D5DB",
          padding: "16px 18px",
          fontSize: "15px",
          fontWeight: 800,
          color: "#374151",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "18px" }}>{children}</div>
    </div>
  );
}

CertificatePDF.displayName = "CertificatePDF";
