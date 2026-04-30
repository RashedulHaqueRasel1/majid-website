"use client";

import React from "react";
import QRCode from "react-qr-code";
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Info,
  Shield,
  Check,
  Globe,
  Calendar,
  BadgeCheck,
  Zap,
} from "lucide-react";
import { IMEIResult } from "../types/scanDevice.types";

interface CertificatePDFProps {
  data: IMEIResult;
  id: string;
}

export const CertificatePDF = React.forwardRef<
  HTMLDivElement,
  CertificatePDFProps
>(({ data, id }, ref) => {
  // Generate a mock IMEI 2 and EID for the demo as requested
  const imei2 = data.imei.slice(0, -3) + "999";
  const eid = "8904903020008884802411333186032";
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const expiryDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1),
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Premium Design System (Inline HEX)
  const colors = {
    primary: "#3B82F6",
    primaryDark: "#1D4ED8",
    secondary: "#84CC16",
    background: "#ffffff",
    surface: "#F8FAFC",
    textMain: "#0F172A",
    textMedium: "#475569",
    textLight: "#94A3B8",
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    accent: "#F0F9FF",
  };

  const s = {
    section: {
      backgroundColor: "#ffffff",
      borderRadius: "20px",
      border: `1px solid ${colors.border}`,
      overflow: "hidden",
      marginBottom: "24px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    },
    sectionHeader: {
      padding: "16px 24px",
      backgroundColor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    headerTitle: {
      fontSize: "12px",
      fontWeight: 900,
      textTransform: "uppercase" as const,
      letterSpacing: "2px",
      color: colors.textMedium,
    },
    label: {
      fontSize: "13px",
      fontWeight: 700,
      color: colors.textLight,
      marginBottom: "4px",
    },
    value: { fontSize: "16px", fontWeight: 800, color: colors.textMain },
    textSecondary: {
      color: colors.textMedium,
      fontWeight: 700,
      fontSize: "14px",
    },
    textMain: { color: colors.textMain, fontWeight: 900, fontSize: "15px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
    badge: (color: string) => ({
      padding: "6px 14px",
      borderRadius: "10px",
      fontSize: "11px",
      fontWeight: 900,
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      color: "#ffffff",
      backgroundColor: color,
      display: "inline-block",
    }),
  };

  return (
    <div
      ref={ref}
      id={id}
      style={{
        width: "800px",
        backgroundColor: colors.background,
        padding: "50px",
        fontFamily: "'Inter', sans-serif",
        color: colors.textMain,
        display: "flex",
        flexDirection: "column",
        minHeight: "1120px",
        position: "relative",
      }}
    >
      {/* Premium Watermark Background */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-35deg)",
          opacity: 0.03,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <span style={{ fontSize: "180px", fontWeight: 900 }}>VERIFIED</span>
      </div>

      {/* Header Area */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                color: colors.secondary,
                fontSize: "42px",
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: "-2.5px",
              }}
            >
              imo
            </span>
            <span
              style={{
                color: colors.primary,
                fontSize: "42px",
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: "-2.5px",
              }}
            >
              scan
            </span>
            <div
              style={{
                marginLeft: "6px",
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                backgroundColor: colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={22} color="#ffffff" strokeWidth={4} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: colors.textMain,
                letterSpacing: "-0.5px",
              }}
            >
              Verification Certificate
            </h1>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: colors.textMedium,
              }}
            >
              Official report for device hardware & risk assessment
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "12px",
          }}
        >
          <div
            style={{
              padding: "8px",
              border: `2px solid ${colors.textMain}`,
              borderRadius: "16px",
              backgroundColor: "#ffffff",
            }}
          >
            <QRCode
              value={`https://imoscan.com/report/${data.imei}`}
              size={90}
            />
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: colors.textLight,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Scan to verify online
          </span>
        </div>
      </div>

      {/* Hero Result Section */}
      <div
        style={{
          ...s.section,
          border: `2px solid ${data.riskMeter.score < 20 ? colors.success : colors.warning}`,
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "30px",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "80px",
              border: `12px solid ${data.riskMeter.score < 20 ? "#DCFCE7" : "#FEF3C7"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Shield
              size={60}
              color={
                data.riskMeter.score < 20 ? colors.success : colors.warning
              }
              strokeWidth={2.5}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-10px",
                backgroundColor: "#ffffff",
                padding: "4px 12px",
                borderRadius: "10px",
                border: `1px solid ${colors.border}`,
                fontSize: "12px",
                fontWeight: 900,
              }}
            >
              SCORE: {data.riskMeter.score}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 900,
                color: colors.textLight,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              AI SECURITY ANALYSIS
            </span>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: 900,
                color: colors.textMain,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {data.riskMeter.label}
            </h2>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: colors.textMedium,
                marginTop: "4px",
              }}
            >
              {data.aiInsight.message}
            </p>
          </div>
          <div
            style={{
              width: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <BadgeCheck size={50} color={colors.secondary} strokeWidth={2} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: colors.secondary,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              CERTIFIED SAFE
            </span>
          </div>
        </div>
      </div>

      <div style={s.grid2}>
        {/* Device Info */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <Zap size={16} color={colors.primary} />
            <h3 style={s.headerTitle}>Device Identity</h3>
          </div>
          <div
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "100px",
                  backgroundColor: colors.accent,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=300&auto=format&fit=crop"
                  style={{
                    width: "60px",
                    height: "80px",
                    objectFit: "contain",
                  }}
                  crossOrigin="anonymous"
                />
              </div>
              <div>
                <p style={s.label}>Model Name</p>
                <p style={{ ...s.value, fontSize: "18px" }}>
                  {data.deviceName}
                </p>
              </div>
            </div>
            <div>
              <p style={s.label}>IMEI Primary</p>
              <p style={s.value}>{data.imei}</p>
            </div>
            <div>
              <p style={s.label}>Serial Number</p>
              <p style={s.value}>
                {data.technicalBreakdown.origin.modelNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <BadgeCheck size={16} color={colors.primary} />
            <h3 style={s.headerTitle}>Verification Status</h3>
          </div>
          <div
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={s.textSecondary}>Global Blacklist</span>
              <span
                style={{
                  color: colors.success,
                  fontWeight: 900,
                  fontSize: "14px",
                }}
              >
                PASSED
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={s.textSecondary}>Activation Lock</span>
              <span
                style={{
                  color: colors.success,
                  fontWeight: 900,
                  fontSize: "14px",
                }}
              >
                OFF
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={s.textSecondary}>Carrier Status</span>
              <span
                style={{
                  color: colors.primary,
                  fontWeight: 900,
                  fontSize: "14px",
                }}
              >
                UNLOCKED
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={s.textSecondary}>Warranty Label</span>
              <span
                style={{
                  color: colors.textMain,
                  fontWeight: 900,
                  fontSize: "14px",
                }}
              >
                {data.technicalBreakdown.warranty.label}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={s.textSecondary}>Hardware Grade</span>
              <span
                style={{
                  color: colors.secondary,
                  fontWeight: 900,
                  fontSize: "14px",
                }}
              >
                GRADE A+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div style={{ ...s.section, marginBottom: "30px" }}>
        <div style={s.sectionHeader}>
          <AlertTriangle size={16} color={colors.warning} />
          <h3 style={s.headerTitle}>Risk Assessment Breakdown</h3>
        </div>
        <div
          style={{
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <CheckCircle2
              size={20}
              color={colors.success}
              style={{ flexShrink: 0 }}
            />
            <div>
              <p style={{ fontWeight: 800, fontSize: "14px" }}>Clean Record</p>
              <p style={{ fontSize: "12px", color: colors.textMedium }}>
                No reports of theft or loss found in global databases.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <CheckCircle2
              size={20}
              color={colors.success}
              style={{ flexShrink: 0 }}
            />
            <div>
              <p style={{ fontWeight: 800, fontSize: "14px" }}>
                Financing Clear
              </p>
              <p style={{ fontSize: "12px", color: colors.textMedium }}>
                Device is not under any unpaid carrier financing plans.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <CheckCircle2
              size={20}
              color={colors.success}
              style={{ flexShrink: 0 }}
            />
            <div>
              <p style={{ fontWeight: 800, fontSize: "14px" }}>Auth. Parts</p>
              <p style={{ fontSize: "12px", color: colors.textMedium }}>
                Internal serials match system database records.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Info size={20} color={colors.primary} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: "14px" }}>
                Hardware Integrity
              </p>
              <p style={{ fontSize: "12px", color: colors.textMedium }}>
                Original factory configuration detected.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          backgroundColor: "#FFFBEB",
          border: `1px solid ${colors.warning}`,
          display: "flex",
          gap: "15px",
          alignItems: "flex-start",
        }}
      >
        <AlertTriangle
          size={24}
          color={colors.warning}
          style={{ flexShrink: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 900,
              color: "#92400E",
              textTransform: "uppercase",
            }}
          >
            Safety Notice
          </span>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#B45309",
              lineHeight: 1.5,
            }}
          >
            Always verify the IMEI on the device screen (*#06#) matches this
            certificate. Scammers may attempt to use valid certificates for
            different physical devices.
          </p>
        </div>
      </div>

      {/* Footer Details */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "30px",
          borderTop: `2px solid ${colors.surface}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: colors.textLight,
            }}
          >
            <Globe size={14} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              Certificate ID: IMO-{data.imei.slice(-10)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: colors.textLight,
            }}
          >
            <Calendar size={14} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              Generated: {reportDate} | Valid Until: {expiryDate}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 800,
                color: colors.textLight,
                textTransform: "uppercase",
              }}
            >
              Authorized By
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 900,
                color: colors.primary,
                fontStyle: "italic",
              }}
            >
              IMOSCAN SECURITY
            </p>
          </div>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "25px",
              border: `2px solid ${colors.secondary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={30} color={colors.secondary} />
          </div>
        </div>
      </div>
    </div>
  );
});

CertificatePDF.displayName = "CertificatePDF";
