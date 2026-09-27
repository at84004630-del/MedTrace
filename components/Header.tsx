"use client";

import { Incident } from "@/lib/types";

interface HeaderProps {
  isAnalyzing: boolean;
  analysisComplete: boolean;
  agentProgress: number;
  onTriggerScan: () => void;
  onOpenCommandPalette: () => void;
  onOpenAnalytics?: () => void;
  onOpenVitals?: () => void;
  activeIncident: Incident | null;
}

export default function Header({
  isAnalyzing,
  analysisComplete,
  agentProgress,
  onTriggerScan,
  onOpenCommandPalette,
  onOpenAnalytics,
  onOpenVitals,
  activeIncident,
}: HeaderProps) {
  return (
    <header style={{
      padding: "0 28px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(5, 9, 20, 0.85)",
      backdropFilter: "blur(24px) saturate(1.4)",
      WebkitBackdropFilter: "blur(24px) saturate(1.4)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      {/* Top luminous accent beam */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "1.5px",
        background: "linear-gradient(90deg, transparent 0%, #00f2fe 25%, #388bfd 50%, #bc8cff 75%, transparent 100%)",
        opacity: isAnalyzing ? 1 : 0.6,
      }} />

      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
      }}>

        {/* ── Brand & Repo Target ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {/* Logo badge with pulse halo */}
          <div style={{
            position: "relative",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 55%, #7c3aed 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 900,
            color: "#ffffff",
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: "0 4px 18px rgba(14, 165, 233, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
          }}>
            MT
            <div style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: isAnalyzing ? "#38bdf8" : "#10b981",
              border: "2px solid #050914",
              boxShadow: isAnalyzing ? "0 0 8px #38bdf8" : "0 0 8px #10b981",
            }} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontWeight: 800,
                fontSize: "17px",
                letterSpacing: "-0.03em",
                fontFamily: "'Space Grotesk', sans-serif",
                background: "linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                MedTrace
              </span>

              {/* IBM BOB badge */}
              <span style={{
                fontSize: "9.5px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                letterSpacing: "0.06em",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                IBM BOB 2.0
              </span>
            </div>

            {/* Sub-label with hospital target */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "10.5px",
              color: "var(--text-secondary)",
              marginTop: "1px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>🏥 st-jude-ehr</span>
              <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>/</span>
              <span style={{ color: "var(--accent-cyan)" }}>v4.18-prod</span>
            </div>
          </div>
        </div>

        {/* ── Active Incident Telemetry Capsule ── */}
        {activeIncident ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "linear-gradient(180deg, rgba(13, 23, 44, 0.8) 0%, rgba(7, 14, 28, 0.9) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: "14px",
            padding: "8px 18px",
            maxWidth: "540px",
            flex: 1,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          }}>
            {/* Live radar dot */}
            <div style={{ position: "relative", width: "12px", height: "12px", flexShrink: 0 }}>
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: isAnalyzing ? "#38bdf8" : analysisComplete ? "#10b981" : "#eab308",
                boxShadow: isAnalyzing ? "0 0 12px #38bdf8" : analysisComplete ? "0 0 10px #10b981" : "0 0 8px #eab308",
              }} />
              {isAnalyzing && (
                <div style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: "50%",
                  border: "1.5px solid #38bdf8",
                  animation: "pulse-ring 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
                }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: "2px",
              }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>ACTIVE INVESTIGATION</span>
                <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>·</span>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>{activeIncident.id}</span>
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {activeIncident.title}
              </div>
            </div>

            {/* Progress gauge */}
            <div style={{ flexShrink: 0, textAlign: "right", minWidth: "80px" }}>
              <div style={{
                fontSize: "12.5px",
                fontWeight: 800,
                color: isAnalyzing ? "#38bdf8" : analysisComplete ? "#34d399" : "#94a3b8",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {isAnalyzing ? `${agentProgress}%` : analysisComplete ? "✓ Verified" : "Ready"}
              </div>
              {isAnalyzing && (
                <div style={{
                  width: "80px",
                  height: "4px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginTop: "4px",
                }}>
                  <div style={{
                    width: `${agentProgress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
                    borderRadius: "2px",
                    transition: "width 0.4s ease-out",
                  }} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {/* ── Actions & System Status ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Parallel agents status pill */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "6px 12px",
            borderRadius: "8px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#34d399",
            fontWeight: 600,
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 6px #10b981",
            }} />
            5 Agents Online
          </div>

          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "9px",
                padding: "7px 12px",
                cursor: "pointer",
                color: "var(--accent-purple)",
                fontSize: "11.5px",
                fontWeight: 600,
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168, 85, 247, 0.5)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(168, 85, 247, 0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255, 255, 255, 0.1)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-purple)";
              }}
              title="Open Bobalytics: Parallel Tool Latency & Clinical Financial ROI Engine"
            >
              <span>📊</span>
              <span>Bobalytics™</span>
            </button>
          )}

          {onOpenVitals && (
            <button
              onClick={onOpenVitals}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "9px",
                padding: "7px 12px",
                cursor: "pointer",
                color: "var(--accent-cyan)",
                fontSize: "11.5px",
                fontWeight: 600,
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56, 189, 248, 0.5)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(56, 189, 248, 0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255, 255, 255, 0.1)";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-cyan)";
              }}
              title="Open Real-time 60FPS ECG Waveform & Telemetry Crisis Simulator"
            >
              <span>🫀</span>
              <span>Vitals ECG</span>
            </button>
          )}

          {/* Search / Command palette trigger */}
          <button
            onClick={onOpenCommandPalette}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "9px",
              padding: "7px 14px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "12px",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56, 189, 248, 0.4)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(56, 189, 248, 0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255, 255, 255, 0.1)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.04)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
            }}
          >
            <span style={{ fontSize: "12px" }}>🔍</span>
            <span>Search</span>
            <span className="kbd-shortcut" style={{ fontSize: "9.5px", padding: "1px 6px" }}>⌘K</span>
          </button>

          {/* New investigation CTA */}
          <button
            onClick={onTriggerScan}
            disabled={isAnalyzing}
            className="btn-primary"
            style={{
              padding: "9px 20px",
              fontSize: "12.5px",
              fontWeight: 700,
              gap: "8px",
              boxShadow: "0 4px 20px rgba(14, 165, 233, 0.45)",
            }}
          >
            {isAnalyzing ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                Triage In Progress…
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Swarm Triage</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
