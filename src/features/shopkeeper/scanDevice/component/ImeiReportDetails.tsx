"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Gauge,
  RadioTower,
  Shield,
  Smartphone,
  Sparkles,
  Tag,
} from "lucide-react";
import { IMEIResult } from "../types/scanDevice.types";

type ReportRow = {
  label: string;
  value: string;
};

type ProviderDataShape = {
  result?: string;
  status?: string;
  id?: string | number;
  price?: string;
  balance?: string | number;
  ip?: string;
};

interface ImeiReportDetailsProps {
  result: IMEIResult;
  heading?: string;
  caption?: string;
  meta?: {
    provider?: string;
    serviceId?: number;
    cached?: boolean;
    message?: string;
    rowNumber?: number;
    totalRows?: number;
  };
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(font|span|b|strong|i|em)[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
}

function parseProviderRows(rawHtml?: string): ReportRow[] {
  if (!rawHtml) return [];
  return stripHtml(rawHtml)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      if (rest.length === 0) return { label: "Detail", value: line };
      return { label: label.trim(), value: rest.join(":").trim() };
    });
}

function formatValue(value: unknown) {
  if (value == null || value === "") return "N/A";
  return String(value);
}

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
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return fallback;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Derives semantic tone from device status string */
function getStatusTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("clean") || s.includes("ok") || s.includes("active"))
    return {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      border: "border-emerald-500/25",
    };
  if (
    s.includes("blacklist") ||
    s.includes("stolen") ||
    s.includes("blocked") ||
    s.includes("lost")
  )
    return {
      bg: "bg-red-500/15",
      text: "text-red-400",
      dot: "bg-red-400",
      border: "border-red-500/25",
    };
  if (s.includes("financed") || s.includes("finance"))
    return {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      dot: "bg-amber-400",
      border: "border-amber-500/25",
    };
  return {
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    dot: "bg-slate-400",
    border: "border-slate-500/25",
  };
}

/** Derives risk colour from score */
function getRiskColor(score: number) {
  if (score <= 25) return { stroke: "#22c55e", text: "text-emerald-400" };
  if (score <= 60) return { stroke: "#f59e0b", text: "text-amber-400" };
  return { stroke: "#ef4444", text: "text-red-400" };
}

/** Circular arc risk meter */
function RiskArc({ score }: { score: number }) {
  const r = 42;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(score, 100));
  // Arc starts at -90deg (top). We use a 270-degree arc (leaving a gap at bottom).
  const arcLength = (270 / 360) * circumference;
  const filledLength = (progress / 100) * arcLength;
  const { stroke, text } = getRiskColor(score);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 112, height: 112 }}
    >
      <svg width={112} height={112} style={{ transform: "rotate(135deg)" }}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={8}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeDasharray={`${filledLength} ${circumference}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`text-2xl font-black tabular-nums ${text}`}>{score}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-0.5">
          / 100
        </p>
      </div>
    </div>
  );
}

/** A single detail card in the findings grid */
function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-4 hover:bg-white/[0.07] transition-colors">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-6 text-white/90 break-words">
        {value}
      </p>
    </div>
  );
}

/** A single row in the snapshot table */
function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-white/[0.06] py-3 last:border-0">
      <p className="shrink-0 text-[11px] font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p
        className="text-right text-sm font-semibold text-white/80 break-words font-mono"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
      >
        {value}
      </p>
    </div>
  );
}

/** Metric card for the top summary strip */
function MetricPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#84CC16]/15 text-[#84CC16]">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35 truncate">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-white/85 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ImeiReportDetails({
  result,
  heading = "Reports",
  caption = "Structured IMEI scan details",
  meta,
}: ImeiReportDetailsProps) {
  const resultData = getObject(result);
  const providerData = getObject(resultData?.providerData) as
    | ProviderDataShape
    | undefined;
  const riskMeter = getObject(resultData?.riskMeter);
  const aiInsight = getObject(resultData?.aiInsight);
  const marketValue = getObject(resultData?.marketValue);
  const technicalBreakdown = getObject(resultData?.technicalBreakdown);
  const warranty = getObject(technicalBreakdown?.warranty);
  const origin = getObject(technicalBreakdown?.origin);
  const activation = getObject(technicalBreakdown?.activation);
  const checks = getObject(resultData?.checks);

  const deviceName = getText(resultData?.deviceName, "Unknown Device");
  const imei = getText(resultData?.imei);
  const deviceStatus = getText(resultData?.deviceStatus, "Unknown");
  const riskLabel = getText(riskMeter?.label, "Unknown Risk");
  const riskScore = getNumber(riskMeter?.score) ?? 0;
  const aiMessage = getText(aiInsight?.message, "No AI insight available.");
  const marketCurrency = getText(marketValue?.currency, "USD");
  const marketAmount = getNumber(marketValue?.amount);
  const warrantyLabel = getText(warranty?.label);
  const originLabel = getText(origin?.label);
  const activationLabel = getText(activation?.label);
  const providerStatus = getText(
    providerData?.status || resultData?.deviceStatus,
  );
  const providerPrice = getText(providerData?.price);
  const providerBalance = getText(providerData?.balance);
  const providerReference = getText(providerData?.id);
  const providerIp = getText(providerData?.ip, "");

  const statusTone = getStatusTone(deviceStatus);
  const riskColor = getRiskColor(riskScore);

  const providerRows = parseProviderRows(providerData?.result);
  const fallbackCheckRows =
    providerRows.length === 0
      ? Object.values(checks ?? {})
          .map((check) => getObject(check))
          .filter(Boolean)
          .map((check, index) => ({
            label: getText(check?.title, `Check ${index + 1}`),
            value: `${toTitleCase(getText(check?.status, "unknown"))} — ${getText(
              check?.description,
              "No description available",
            )}`,
          }))
      : [];

  const detailRows =
    providerRows.length > 0
      ? providerRows
      : [
          { label: "Device", value: deviceName },
          { label: "IMEI", value: imei },
          { label: "Status", value: deviceStatus },
          { label: "Risk", value: riskLabel },
          { label: "AI Insight", value: aiMessage },
          {
            label: "Market Value",
            value:
              marketAmount != null
                ? `${marketCurrency} ${marketAmount.toFixed(2)}`
                : marketCurrency,
          },
          {
            label: "Blacklist Summary",
            value:
              fallbackCheckRows.find((row) => row.label === "Global Blacklist")
                ?.value ?? "No blacklist summary available",
          },
          {
            label: "Financing Summary",
            value:
              fallbackCheckRows.find((row) => row.label === "Carrier Financing")
                ?.value ?? "No financing summary available",
          },
          { label: "Warranty", value: warrantyLabel },
          { label: "Origin", value: originLabel },
          { label: "Activation", value: activationLabel },
        ];

  const scanMeta = [
    { label: "Scan Status", value: providerStatus, icon: CheckCircle2 },
    {
      label: "Provider",
      value: formatValue(meta?.provider || "IMEI Service"),
      icon: RadioTower,
    },
    { label: "Service ID", value: formatValue(meta?.serviceId), icon: Tag },
    { label: "Reference", value: providerReference, icon: Database },
  ].filter((item) => item.value !== "N/A");

  const insightRows = [
    {
      label: "Overall Assessment",
      value: `${riskLabel} — based on available provider and validation signals.`,
    },
    {
      label: "Blacklist Risk",
      value:
        fallbackCheckRows.find((row) => row.label === "Global Blacklist")
          ?.value ?? "No blacklist signal available",
    },
    {
      label: "Carrier / Finance Risk",
      value:
        fallbackCheckRows.find((row) => row.label === "Carrier Financing")
          ?.value ?? "No carrier financing signal available",
    },
    {
      label: "Lock / Activation Risk",
      value:
        fallbackCheckRows.find((row) => row.label === "Hardware Lock")?.value ??
        activationLabel,
    },
  ];

  return (
    <section
      className="overflow-hidden rounded-[32px]"
      style={{ background: "#0B1120", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ─── HERO HEADER ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-6 pb-8 pt-8 md:px-8 md:pt-10"
        style={{
          background:
            "linear-gradient(135deg, #0f1a2e 0%, #0B1120 60%, #111d10 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Decorative grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(132,204,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blob */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(132,204,22,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          {/* Left: Title block */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#84CC16]/20">
                <Sparkles size={11} className="text-[#84CC16]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#84CC16]">
                {heading}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(132,204,22,0.12)",
                  border: "1px solid rgba(132,204,22,0.25)",
                }}
              >
                <Smartphone size={22} className="text-[#84CC16]" />
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl font-black text-white md:text-3xl">
                  {deviceName}
                </h2>
                <p
                  className="mt-1 font-mono text-xs font-semibold text-white/40 tracking-widest"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  }}
                >
                  IMEI&nbsp;&nbsp;{imei}
                </p>
              </div>
            </div>

            {/* Status + meta badges */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${statusTone.bg} ${statusTone.text} ${statusTone.border}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusTone.dot}`}
                />
                {toTitleCase(deviceStatus)}
              </span>

              <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/50">
                {caption}
              </span>

              {meta?.rowNumber && meta?.totalRows ? (
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/50">
                  {meta.rowNumber} / {meta.totalRows}
                </span>
              ) : null}
            </div>
          </div>

          {/* Right: Scan meta pills */}
          <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 xl:w-72">
            {scanMeta.map((item) => (
              <MetricPill
                key={item.label}
                label={item.label}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </div>
        </div>

        {/* Primary metrics strip */}
        <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: "Device Status",
              value: toTitleCase(deviceStatus),
              icon: Shield,
              accent: statusTone.text,
            },
            {
              label: "Risk Level",
              value: riskLabel,
              icon: Gauge,
              accent: riskColor.text,
            },
            {
              label: "Market Value",
              value:
                marketAmount != null
                  ? `${marketCurrency} ${marketAmount.toFixed(2)}`
                  : marketCurrency,
              icon: Tag,
              accent: "text-sky-400",
            },
            {
              label: "Data Source",
              value:
                providerRows.length > 0
                  ? "Direct Report"
                  : "Structured Fallback",
              icon: Database,
              accent: "text-violet-400",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl px-4 py-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-2 text-white/35">
                  <Icon size={14} />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em]">
                    {item.label}
                  </p>
                </div>
                <p
                  className={`mt-3 text-sm font-black break-words ${item.accent}`}
                >
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── BODY ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1.8fr)_340px]">
        {/* ── LEFT COLUMN ──────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Processing note */}
          {meta?.message ? (
            <div
              className="flex items-start gap-3 rounded-2xl px-5 py-4"
              style={{
                background: "rgba(234,179,8,0.08)",
                border: "1px solid rgba(234,179,8,0.2)",
              }}
            >
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-400"
                size={16}
              />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                  Processing Note
                </p>
                <p className="mt-1 text-sm font-semibold text-amber-300/80">
                  {meta.message}
                  {meta.cached ? " Cached result used." : ""}
                </p>
              </div>
            </div>
          ) : null}

          {/* Key Findings */}
          <div
            className="rounded-[24px] p-5 md:p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "rgba(132,204,22,0.12)" }}
              >
                <Database size={15} className="text-[#84CC16]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Key Findings
                </h3>
                <p className="text-[11px] font-medium text-white/35">
                  {providerRows.length > 0
                    ? "Parsed directly from provider response"
                    : "Assembled from scan signals"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {detailRows.map((row, index) => (
                <DetailCard
                  key={`${row.label}-${index}`}
                  label={row.label}
                  value={row.value}
                />
              ))}
            </div>
          </div>

          {/* Risk Insights */}
          <div
            className="rounded-[24px] p-5 md:p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "rgba(239,68,68,0.12)" }}
              >
                <Shield size={15} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Risk Insights
                </h3>
                <p className="text-[11px] font-medium text-white/35">
                  Signals that matter most when evaluating this device
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {insightRows.map((row, index) => (
                <DetailCard
                  key={`${row.label}-${index}`}
                  label={row.label}
                  value={row.value}
                />
              ))}
            </div>
          </div>

          {/* Supporting Checks */}
          {fallbackCheckRows.length > 0 ? (
            <div
              className="rounded-[24px] p-5 md:p-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "rgba(132,204,22,0.12)" }}
                >
                  <CheckCircle2 size={15} className="text-[#84CC16]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Supporting Checks
                  </h3>
                  <p className="text-[11px] font-medium text-white/35">
                    Provider signals structured for reference
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {fallbackCheckRows.map((row, index) => (
                  <DetailCard
                    key={`${row.label}-${index}`}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
        <div className="space-y-5">
          {/* AI Insight + Risk Arc */}
          <div
            className="rounded-[24px] p-6"
            style={{
              background: "linear-gradient(145deg, #0f1c0b 0%, #0B1120 100%)",
              border: "1px solid rgba(132,204,22,0.18)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={14} className="text-[#84CC16]" />
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#84CC16]">
                AI Insight
              </p>
            </div>

            {/* Arc meter + insight text side-by-side */}
            <div className="flex items-start gap-5">
              <div className="shrink-0">
                <RiskArc score={riskScore} />
                <p
                  className={`mt-1 text-center text-[11px] font-black uppercase tracking-[0.16em] ${riskColor.text}`}
                >
                  {riskLabel}
                </p>
              </div>
              <p className="flex-1 text-sm font-semibold leading-7 text-white/70 pt-1">
                {aiMessage}
              </p>
            </div>
          </div>

          {/* Report Snapshot */}
          <div
            className="rounded-[24px] p-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "rgba(99,102,241,0.15)" }}
              >
                <Database size={15} className="text-indigo-400" />
              </div>
              <h3 className="text-base font-black text-white">
                Report Snapshot
              </h3>
            </div>

            <div className="space-y-0">
              {[
                { label: "IMEI", value: imei },
                { label: "Device", value: deviceName },
                {
                  label: "Provider",
                  value: getText(meta?.provider, "IMEI Service"),
                },
                { label: "Origin", value: originLabel },
                { label: "Warranty", value: warrantyLabel },
                { label: "Activation", value: activationLabel },
                { label: "Provider Price", value: providerPrice },
                { label: "Remaining Balance", value: providerBalance },
                ...(providerIp
                  ? [{ label: "Provider IP", value: providerIp }]
                  : []),
              ].map((row) => (
                <SnapshotRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                />
              ))}
            </div>
          </div>

          {/* Scan meta detail card */}
          <div
            className="rounded-[24px] p-5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30 mb-4">
              Scan Metadata
            </p>
            <div className="space-y-0">
              {[
                {
                  label: "Provider",
                  value: formatValue(meta?.provider || "IMEI Service"),
                },
                { label: "Service ID", value: formatValue(meta?.serviceId) },
                { label: "Reference", value: providerReference },
                { label: "Cached", value: meta?.cached ? "Yes" : "No" },
              ]
                .filter((r) => r.value !== "N/A")
                .map((row) => (
                  <SnapshotRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
