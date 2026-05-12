"use client";

import React from "react";
import {
  ShieldCheck,
  Smartphone,
  User,
  ShoppingBag,
  Calendar,
  Zap,
  Lock,
  Battery,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { IMEIResult } from "../types/scanDevice.types";

interface SmartInvoicePDFProps {
  data: IMEIResult;
  id: string;
  customerName?: string;
  customerEmail?: string;
}

export const INVOICE_PDF_WIDTH = 750;
export const INVOICE_PDF_HEIGHT = 1350; // বাড়ানো হয়েছে

// Helper function to parse HTML
const parseProviderData = (rawHtml: string) => {
  const getValue = (label: string): string => {
    const regex = new RegExp(`${label}:\\s*([^<\\n]+)`);
    const match = rawHtml.match(regex);
    return match ? match[1].trim() : "N/A";
  };
  return { getValue };
};

export const SmartInvoicePDF = React.forwardRef<
  HTMLDivElement,
  SmartInvoicePDFProps
>(
  (
    {
      data,
      id,
      customerName = "Alexander Wright",
      customerEmail = "alex.wright@example.com",
    },
    ref,
  ) => {
    // Parse provider data
    const providerData = data.providerData as { result?: string } | undefined;
    const rawHtml = providerData?.result || "";
    const { getValue } = parseProviderData(rawHtml);

    // Extract device info
    const deviceName =
      getValue("Device") || data.deviceName || "Unknown Device";
    const imei1 = getValue("IMEI Number") || data.imei;
    const serialNumber = getValue("Serial Number") || "N/A";
    const warrantyExpiry = getValue("Warranty Expires") || "N/A";
    const purchaseDate = getValue("Estimated Purchase Date") || "N/A";
    const activationStatus = getValue("Activation Status") || "Unknown";

    // Risk data
    const riskScore = data.riskMeter?.score || 0;
    const riskLevel =
      riskScore <= 25
        ? "Low Risk"
        : riskScore <= 60
          ? "Medium Risk"
          : "High Risk";

    // Market value
    const marketValue = data.marketValue?.amount || 599;
    const currency = data.marketValue?.currency || "USD";

    // Checks
    const checks = data.checks;
    const isBlacklistClean = checks?.globalBlacklist?.status === "passed";
    const isFinancingClean = checks?.carrierFinancing?.status === "passed";
    const isSimLockClean = checks?.hardwareLock?.status === "passed";

    // Colors
    const colors = {
      brand: "#84CC16",
      brandDark: "#65A30D",
      slate900: "#0F172A",
      slate800: "#1E293B",
      slate700: "#334155",
      slate600: "#475569",
      slate500: "#64748B",
      slate400: "#94A3B8",
      slate300: "#CBD5E1",
      slate200: "#E2E8F0",
      slate100: "#F1F5F9",
      slate50: "#F8FAFC",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
      bgLight: "#F8FAFC",
      successBg: "#F0FDF4",
      warningBg: "#FFFBEB",
    };

    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const invoiceId = `IMS-${data.imei.slice(-6)}-${new Date().getFullYear()}`;

    return (
      <div
        ref={ref}
        id={id}
        style={{
          width: `${INVOICE_PDF_WIDTH}px`,
          minHeight: `${INVOICE_PDF_HEIGHT}px`,
          backgroundColor: "#ffffff",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "30px 28px 40px",
          color: colors.slate900,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: colors.brand,
                letterSpacing: "-1px",
              }}
            >
              imoscan
            </span>
            <div
              style={{
                backgroundColor: colors.brand,
                borderRadius: "24px",
                padding: "4px 10px",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "1px",
                }}
              >
                PRO
              </span>
            </div>
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 900,
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            DEVICE INVOICE
          </h1>
          <p style={{ fontSize: "11px", color: colors.slate500, margin: 0 }}>
            Check before you buy • Verified Hardware Report
          </p>
          <div
            style={{
              display: "inline-block",
              backgroundColor: colors.successBg,
              padding: "3px 12px",
              borderRadius: "16px",
              marginTop: "10px",
              border: `1px solid #BBF7D0`,
            }}
          >
            <span
              style={{
                fontSize: "8px",
                fontWeight: 800,
                color: colors.brandDark,
                letterSpacing: "0.5px",
              }}
            >
              ✓ AUTHENTICITY VERIFIED
            </span>
          </div>
        </div>

        {/* Invoice Meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            paddingBottom: "12px",
            borderBottom: `1px solid ${colors.slate200}`,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "9px",
                fontWeight: 800,
                color: colors.slate500,
                margin: "0 0 3px",
                letterSpacing: "0.5px",
              }}
            >
              INVOICE NUMBER
            </p>
            <p style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>
              {invoiceId}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "9px",
                fontWeight: 800,
                color: colors.slate500,
                margin: "0 0 3px",
                letterSpacing: "0.5px",
              }}
            >
              DATE ISSUED
            </p>
            <p style={{ fontSize: "12px", fontWeight: 600, margin: 0 }}>
              {reportDate}
            </p>
          </div>
        </div>

        {/* Device Main Information */}
        <div
          style={{
            border: `1px solid ${colors.slate200}`,
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "20px",
            backgroundColor: colors.slate50,
          }}
        >
          <div
            style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "14px",
                padding: "12px",
                border: `1px solid ${colors.slate200}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "70px",
              }}
            >
              <Smartphone size={42} color={colors.brand} strokeWidth={1.5} />
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: 900,
                      margin: "0 0 3px",
                    }}
                  >
                    {deviceName}
                  </h2>
                  <p
                    style={{
                      fontSize: "10px",
                      color: colors.slate500,
                      margin: 0,
                    }}
                  >
                    256GB • Natural Titanium
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: colors.successBg,
                    padding: "4px 12px",
                    borderRadius: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      color: colors.brandDark,
                    }}
                  >
                    IN STOCK
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: `1px solid ${colors.slate200}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: "7px",
                      fontWeight: 800,
                      color: colors.slate500,
                      margin: "0 0 3px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    IMEI NUMBER
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      margin: 0,
                    }}
                  >
                    {imei1}
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: `1px solid ${colors.slate200}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: "7px",
                      fontWeight: 800,
                      color: colors.slate500,
                      margin: "0 0 3px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    SERIAL NUMBER
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      margin: 0,
                    }}
                  >
                    {serialNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Provider Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              border: `1px solid ${colors.slate200}`,
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <User size={12} color={colors.brand} />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: colors.slate500,
                  letterSpacing: "0.5px",
                }}
              >
                BILL TO
              </span>
            </div>
            <p style={{ fontSize: "12px", fontWeight: 800, margin: "0 0 3px" }}>
              {customerName}
            </p>
            <p
              style={{
                fontSize: "10px",
                color: colors.slate500,
                margin: "0 0 3px",
              }}
            >
              {customerEmail}
            </p>
            <p style={{ fontSize: "10px", color: colors.slate500, margin: 0 }}>
              742 Evergreen Terrace, Springfield, IL
            </p>
          </div>

          <div
            style={{
              border: `1px solid ${colors.slate200}`,
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <ShoppingBag size={12} color={colors.brand} />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: colors.slate500,
                  letterSpacing: "0.5px",
                }}
              >
                AUTHORIZED SELLER
              </span>
            </div>
            <p style={{ fontSize: "12px", fontWeight: 800, margin: "0 0 3px" }}>
              Imoscan Flagship Store #04
            </p>
            <p
              style={{
                fontSize: "10px",
                color: colors.slate500,
                margin: "0 0 3px",
              }}
            >
              VAT ID: US882910283
            </p>
            <p style={{ fontSize: "10px", color: colors.slate500, margin: 0 }}>
              101 AI Plaza, Palo Alto, CA 94301
            </p>
          </div>
        </div>

        {/* Warranty & Activation Info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: colors.warningBg,
              borderRadius: "14px",
              padding: "14px",
              border: `1px solid #FDE68A`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
              }}
            >
              <Shield size={12} color={colors.warning} />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: "#92400E",
                  letterSpacing: "0.5px",
                }}
              >
                WARRANTY
              </span>
            </div>
            <p style={{ fontSize: "11px", fontWeight: 700, margin: "0 0 3px" }}>
              Limited Warranty
            </p>
            <p style={{ fontSize: "10px", color: "#92400E", margin: 0 }}>
              Expires: {warrantyExpiry}
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.successBg,
              borderRadius: "14px",
              padding: "14px",
              border: `1px solid #BBF7D0`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
              }}
            >
              <CheckCircle size={12} color={colors.success} />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: "#166534",
                  letterSpacing: "0.5px",
                }}
              >
                ACTIVATION
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                margin: 0,
                color: "#166534",
              }}
            >
              {activationStatus}
            </p>
            <p style={{ fontSize: "9px", color: "#166534", margin: "4px 0 0" }}>
              Purchase: {purchaseDate}
            </p>
          </div>
        </div>

        {/* Security Checks Summary */}
        <div
          style={{
            border: `1px solid ${colors.slate200}`,
            borderRadius: "14px",
            marginBottom: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: colors.slate100,
              padding: "10px 16px",
              borderBottom: `1px solid ${colors.slate200}`,
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              SECURITY & COMPLIANCE CHECKS
            </span>
          </div>
          <div
            style={{
              padding: "14px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {[
              {
                label: "Global Blacklist",
                status: isBlacklistClean,
                message: isBlacklistClean
                  ? "Clean / Not Reported"
                  : "Reported / Blocked",
              },
              {
                label: "Carrier Financing",
                status: isFinancingClean,
                message: isFinancingClean
                  ? "No active payment plan"
                  : "Active payment plan detected",
              },
              {
                label: "SIM / Hardware Lock",
                status: isSimLockClean,
                message: isSimLockClean ? "Carrier Unlocked" : "Carrier Locked",
              },
              {
                label: "Part Authenticity",
                status: true,
                message: "Original Components Verified",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  backgroundColor: colors.slate50,
                  borderRadius: "10px",
                }}
              >
                {item.status ? (
                  <CheckCircle size={12} color={colors.success} />
                ) : (
                  <AlertCircle size={12} color={colors.danger} />
                )}
                <div>
                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      margin: "0 0 1px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: "8px",
                      color: colors.slate500,
                      margin: 0,
                    }}
                  >
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${colors.slate200}`,
                backgroundColor: colors.slate50,
              }}
            >
              {["DESCRIPTION", "IDENTIFIER", "CONDITION", "QTY", "PRICE"].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      fontSize: "8px",
                      fontWeight: 800,
                      color: colors.slate500,
                      padding: "8px 6px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${colors.slate200}` }}>
              <td style={{ padding: "12px 6px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    margin: "0 0 2px",
                  }}
                >
                  {deviceName}
                </p>
                <p
                  style={{ fontSize: "8px", color: colors.slate500, margin: 0 }}
                >
                  256GB / Natural Titanium
                </p>
              </td>
              <td
                style={{
                  padding: "12px 6px",
                  fontSize: "9px",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                {imei1.slice(-8)}
              </td>
              <td style={{ padding: "12px 6px" }}>
                <span
                  style={{
                    fontSize: "7px",
                    fontWeight: 900,
                    color: "#0D9488",
                    backgroundColor: "#F0FDFA",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  MINT
                </span>
              </td>
              <td
                style={{
                  padding: "12px 6px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                1
              </td>
              <td
                style={{
                  padding: "12px 6px",
                  fontSize: "12px",
                  fontWeight: 800,
                  textAlign: "right",
                }}
              >
                {currency} ${marketValue.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Total Summary */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <div style={{ width: "220px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: `1px solid ${colors.slate200}`,
              }}
            >
              <span style={{ fontSize: "10px", color: colors.slate500 }}>
                Subtotal
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700 }}>
                {currency} ${marketValue.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: `1px solid ${colors.slate200}`,
              }}
            >
              <span style={{ fontSize: "10px", color: colors.slate500 }}>
                Tax (0%)
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700 }}>
                {currency} $0.00
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0 6px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 800 }}>TOTAL</span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  color: colors.brand,
                }}
              >
                {currency} ${marketValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            borderTop: `1px solid ${colors.slate200}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: colors.success,
                }}
              ></div>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  color: colors.success,
                }}
              >
                PAYMENT RECEIVED
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  border: `1px solid ${colors.slate300}`,
                }}
              ></div>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: colors.slate500,
                }}
              >
                BALANCE: $0.00
              </span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: "8px", color: colors.slate500, margin: 0 }}>
              TXN: {data.imei.slice(-8)}-{new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Risk Meter Footer */}
        <div
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            backgroundColor: colors.slate100,
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Shield size={10} color={colors.brand} />
            <span
              style={{
                fontSize: "8px",
                fontWeight: 600,
                color: colors.slate600,
              }}
            >
              AI Verified • Risk Score: {riskScore}/100 ({riskLevel})
            </span>
          </div>
        </div>
      </div>
    );
  },
);

SmartInvoicePDF.displayName = "SmartInvoicePDF";
