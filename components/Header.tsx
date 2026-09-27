"use client";

import { Incident, Tab } from "@/lib/types";
import MedTraceLogo from "@/components/MedTraceLogo";
import {
  IconIntake,
  IconInvestigate,
  IconFix,
  IconReview,
  IconRelease,
  IconBobalytics,
  IconVitals,
  IconSearch,
  IconBolt,
  IconAgents,
} from "@/components/NavIcons";

interface HeaderProps {
  isAnalyzing: boolean;
  analysisComplete: boolean;
  agentProgress: number;
  onTriggerScan: () => void;
  onOpenCommandPalette: () => void;
  onOpenAnalytics?: () => void;
  onOpenVitals?: () => void;
  activeIncident: Incident | null;
  activeTab?: Tab;
  onSelectTab?: (tab: Tab) => void;
}

const NAV_STAGES: { id: Tab; label: string; icon: typeof IconIntake; step: string }[] = [
  { id: "incidents", label: "Intake", icon: IconIntake, step: "01" },
  { id: "investigate", label: "Investigate", icon: IconInvestigate, step: "02" },
  { id: "fix", label: "Fix & Tests", icon: IconFix, step: "03" },
  { id: "review", label: "AI Review", icon: IconReview, step: "04" },
  { id: "release", label: "Release Gate", icon: IconRelease, step: "05" },
];

export default function Header({
  isAnalyzing,
  analysisComplete,
  agentProgress,
  onTriggerScan,
  onOpenCommandPalette,
  onOpenAnalytics,
  onOpenVitals,
  activeIncident,
  activeTab = "incidents",
  onSelectTab,
}: HeaderProps) {
  const getTabBadge = (id: Tab) => {
    if (id === "incidents") return "3";
    if (id === "investigate") {
      if (isAnalyzing) return `${agentProgress}%`;
      if (analysisComplete) return "✓";
      return null;
    }
    if (id === "fix") return analysisComplete ? "Diff" : null;
    if (id === "review") return analysisComplete ? "7" : null;
    if (id === "release") return analysisComplete ? "Pass" : null;
    return null;
  };

  return (
    <header
      style={{
        padding: "0 24px",
        borderBottom: "1px solid rgba(56, 189, 248, 0.12)",
        background: "rgba(4, 9, 20, 0.88)",
        backdropFilter: "blur(28px) saturate(1.5)",
        WebkitBackdropFilter: "blur(28px) saturate(1.5)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Top luminous accent beam */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1.5px",
          background: "linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.3) 15%, #00f2fe 35%, #3b82f6 50%, #a855f7 70%, transparent 100%)",
          opacity: isAnalyzing ? 1 : 0.75,
          transition: "opacity 0.3s ease",
        }}
      />

      <div
        style={{
          maxWidth: "1480px",
          margin: "0 auto",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* ── Left: Brand & Co-Branding Logo ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          <MedTraceLogo
            size="md"
            isAnalyzing={isAnalyzing}
            onClick={() => onSelectTab?.("incidents")}
          />
        </div>

        {/* ── Center: 5-Stage Remediation Workflow Nav Tabs ── */}
        {onSelectTab && (
          <nav
            aria-label="Workflow Stages"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 6px",
              background: "rgba(10, 20, 40, 0.75)",
              border: "1px solid rgba(56, 189, 248, 0.16)",
              borderRadius: "12px",
              backdropFilter: "blur(16px)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            {NAV_STAGES.map((s) => {
              const isActive = activeTab === s.id;
              const badge = getTabBadge(s.id);
              const IconComp = s.icon;

              return (
                <button
                  key={s.id}
                  onClick={() => onSelectTab(s.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: isActive ? "rgba(56, 189, 248, 0.45)" : "transparent",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(37, 99, 235, 0.16) 100%)"
                      : "transparent",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 500,
                    transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: "relative",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isActive ? "#38bdf8" : "var(--text-muted)",
                      opacity: isActive ? 1 : 0.7,
                    }}
                  >
                    {s.step}
                  </span>

                  <IconComp
                    size={14}
                    color={isActive ? "#38bdf8" : "currentColor"}
                  />

                  <span style={{ letterSpacing: "-0.01em" }}>{s.label}</span>

                  {badge && (
                    <span
                      style={{
                        padding: "1px 5px",
                        borderRadius: "999px",
                        fontSize: "9px",
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        background: isActive
                          ? "rgba(56, 189, 248, 0.25)"
                          : "rgba(255, 255, 255, 0.08)",
                        color: isActive ? "#38bdf8" : "#94a3b8",
                        border: `1px solid ${
                          isActive
                            ? "rgba(56, 189, 248, 0.4)"
                            : "rgba(255, 255, 255, 0.06)"
                        }`,
                      }}
                    >
                      {badge}
                    </span>
                  )}

                  {/* Active bottom reflection dot */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-1px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "16px",
                        height: "2px",
                        borderRadius: "1px",
                        background: "#38bdf8",
                        boxShadow: "0 0 8px #38bdf8",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* ── Active Incident Telemetry Capsule (When active or analyzing) ── */}
        {activeIncident && (
          <div
            onClick={() => onSelectTab?.("investigate")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "linear-gradient(180deg, rgba(13, 23, 44, 0.75) 0%, rgba(7, 14, 28, 0.85) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "10px",
              padding: "5px 12px",
              maxWidth: "240px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
              e.currentTarget.style.background = "rgba(14, 165, 233, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.2)";
              e.currentTarget.style.background = "linear-gradient(180deg, rgba(13, 23, 44, 0.75) 0%, rgba(7, 14, 28, 0.85) 100%)";
            }}
            title="Active Incident: Click to inspect parallel investigation"
          >
            <div style={{ position: "relative", width: "8px", height: "8px", flexShrink: 0 }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isAnalyzing ? "#38bdf8" : analysisComplete ? "#10b981" : "#f59e0b",
                  boxShadow: isAnalyzing
                    ? "0 0 8px #38bdf8"
                    : analysisComplete
                    ? "0 0 8px #10b981"
                    : "0 0 8px #f59e0b",
                }}
              />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "9.5px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#38bdf8",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {activeIncident.id}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 500,
                }}
              >
                {activeIncident.title}
              </div>
            </div>
            {isAnalyzing && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "#38bdf8",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {agentProgress}%
              </span>
            )}
          </div>
        )}

        {/* ── Right: System Telemetry & Quick Action Bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Parallel Agents Online Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.22)",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#34d399",
              fontWeight: 600,
            }}
          >
            <IconAgents size={13} color="#10b981" />
            <span>5 Mesh Online</span>
          </div>

          {/* Bobalytics Button */}
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(168, 85, 247, 0.08)",
                border: "1px solid rgba(168, 85, 247, 0.22)",
                borderRadius: "8px",
                padding: "6px 11px",
                cursor: "pointer",
                color: "#c084fc",
                fontSize: "11.5px",
                fontWeight: 600,
                transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.55)";
                e.currentTarget.style.background = "rgba(168, 85, 247, 0.18)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(168, 85, 247, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.22)";
                e.currentTarget.style.background = "rgba(168, 85, 247, 0.08)";
                e.currentTarget.style.color = "#c084fc";
                e.currentTarget.style.boxShadow = "none";
              }}
              title="Open Bobalytics: Parallel Tool Latency & Clinical Financial ROI Engine"
            >
              <IconBobalytics size={14} color="currentColor" />
              <span>Bobalytics</span>
            </button>
          )}

          {/* Vitals ECG Button */}
          {onOpenVitals && (
            <button
              onClick={onOpenVitals}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(14, 165, 233, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.22)",
                borderRadius: "8px",
                padding: "6px 11px",
                cursor: "pointer",
                color: "#38bdf8",
                fontSize: "11.5px",
                fontWeight: 600,
                transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.55)";
                e.currentTarget.style.background = "rgba(14, 165, 233, 0.18)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(56, 189, 248, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.22)";
                e.currentTarget.style.background = "rgba(14, 165, 233, 0.08)";
                e.currentTarget.style.color = "#38bdf8";
                e.currentTarget.style.boxShadow = "none";
              }}
              title="Open Real-time 60FPS ECG Waveform & Telemetry Crisis Simulator"
            >
              <IconVitals size={14} color="currentColor" />
              <span>Vitals ECG</span>
            </button>
          )}

          {/* Search Trigger */}
          <button
            onClick={onOpenCommandPalette}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "6px 11px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "11.5px",
              transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.08)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <IconSearch size={13} color="currentColor" />
            <span>Search</span>
            <span
              style={{
                fontSize: "9px",
                padding: "1px 5px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "var(--text-muted)",
              }}
            >
              ⌘K
            </span>
          </button>

          {/* Primary Action Button: Swarm Triage */}
          <button
            onClick={onTriggerScan}
            disabled={isAnalyzing}
            className="btn-primary"
            style={{
              padding: "7px 16px",
              fontSize: "12px",
              fontWeight: 700,
              gap: "7px",
              borderRadius: "8px",
              boxShadow: "0 4px 18px rgba(14, 165, 233, 0.4)",
            }}
          >
            {isAnalyzing ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
                  ⟳
                </span>
                <span>Triaging…</span>
              </>
            ) : (
              <>
                <IconBolt size={14} color="#ffffff" />
                <span>Swarm Triage</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
