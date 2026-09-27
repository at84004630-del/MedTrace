"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import IncidentDashboard from "@/components/IncidentDashboard";
import InvestigationWorkspace from "@/components/InvestigationWorkspace";
import FixWorkspace from "@/components/FixWorkspace";
import VerificationPanel from "@/components/VerificationPanel";
import ReleaseGate from "@/components/ReleaseGate";
import CommandPalette from "@/components/CommandPalette";
import LaserScanOverlay from "@/components/LaserScanOverlay";
import Bobalytics from "@/components/Bobalytics";
import VitalsOscilloscope from "@/components/VitalsOscilloscope";
import { Tab, Incident, DEMO_INCIDENT } from "@/lib/types";
import {
  IconIntake,
  IconInvestigate,
  IconFix,
  IconReview,
  IconRelease,
} from "@/components/NavIcons";

const HERO_STATS = [
  { value: "90s", label: "Root Cause MTTR", sub: "vs 2 hrs manual grep · -88%", color: "#38bdf8", tier: "cyan", icon: "⚡" },
  { value: "83%", label: "Dev Productivity", sub: "end-to-end AI workflow", color: "#34d399", tier: "green", icon: "📈" },
  { value: "5×", label: "Parallel Subagents", sub: "AST, graph, PHI, DB, tests", color: "#c084fc", tier: "purple", icon: "🤖" },
  { value: "8", label: "Auto-Tests Synthesized", sub: "unit + integration + regression", color: "#fbbf24", tier: "orange", icon: "🧪" },
];

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; color?: string }>; hint: string; num: string }[] = [
  { id: "incidents",   label: "Incident Intake",  icon: IconIntake, hint: "Create & triage", num: "1" },
  { id: "investigate", label: "Investigation",     icon: IconInvestigate, hint: "Parallel agents", num: "2" },
  { id: "fix",         label: "Fix & Tests",       icon: IconFix, hint: "Diff + auto tests", num: "3" },
  { id: "review",      label: "AI Review",         icon: IconReview, hint: "Healthcare checks", num: "4" },
  { id: "release",     label: "Release Gate",      icon: IconRelease, hint: "Deploy verdict", num: "5" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("incidents");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [agentProgress, setAgentProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(p => !p);
      }
      // Alt or Cmd + 1..5 for tabs
      if ((e.metaKey || e.altKey) && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const tabMap: Record<string, Tab> = {
          "1": "incidents",
          "2": "investigate",
          "3": "fix",
          "4": "review",
          "5": "release",
        };
        setActiveTab(tabMap[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runAgentProgress = (speedMs = 900) => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAgentProgress(0);
    [18, 42, 65, 84, 100].forEach((step, i) => {
      const tid = setTimeout(() => {
        setAgentProgress(step);
        if (step === 100) { setIsAnalyzing(false); setAnalysisComplete(true); }
      }, (i + 1) * speedMs);
      timeoutsRef.current.push(tid);
    });
  };

  const handleStartInvestigation = (incident: Incident) => {
    setActiveIncident(incident);
    setActiveTab("investigate");
    runAgentProgress(900);
  };

  const handleRescan = () => runAgentProgress(700);

  const tabBadge = (tab: Tab) => {
    if (tab === "incidents") return "3 Active";
    if (tab === "investigate") return analysisComplete ? "Done ✓" : isAnalyzing ? `${agentProgress}%` : "Ready";
    if (tab === "fix")     return analysisComplete ? "Diff Ready" : undefined;
    if (tab === "review")  return analysisComplete ? "7 Checks" : undefined;
    if (tab === "release") return analysisComplete ? "PASS" : undefined;
  };


  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* ── Ambient background ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(56,189,248,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,189,248,0.02) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div style={{
        position: "fixed", top: "-15%", right: "5%", width: "750px", height: "750px",
        background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", left: "0%", width: "550px", height: "550px",
        background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", top: "45%", left: "35%", width: "350px", height: "350px",
        background: "radial-gradient(circle, rgba(16,185,129,0.035) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <LaserScanOverlay isAnalyzing={isAnalyzing} />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab as Tab)}
        onTriggerScan={handleRescan}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenVitals={() => setIsVitalsOpen(true)}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header
          isAnalyzing={isAnalyzing}
          analysisComplete={analysisComplete}
          agentProgress={agentProgress}
          onTriggerScan={handleRescan}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          onOpenVitals={() => setIsVitalsOpen(true)}
          activeIncident={activeIncident || (activeTab !== "incidents" ? DEMO_INCIDENT : null)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px 80px" }}>

          {/* ── Hero section (Incidents tab only) ── */}
          {activeTab === "incidents" && (
            <div className="animate-fade-in" style={{ padding: "40px 0 28px" }}>
              {/* Eyebrow badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(59,130,246,0.12) 100%)",
                  border: "1px solid rgba(56,189,248,0.3)",
                  borderRadius: "20px", padding: "5px 16px",
                  fontSize: "11px", color: "var(--accent-cyan)", letterSpacing: "0.08em", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: "0 2px 10px rgba(14,165,233,0.15)",
                }}>
                  <span style={{ animation: "glow-pulse 2s ease-in-out infinite", color: "#10b981" }}>●</span>
                  HOSPITAL SOFTWARE DEVELOPER WORKFLOW · IBM BOB 2.0
                </div>
              </div>

              {/* H1 */}
              <h1 style={{
                fontSize: "clamp(30px, 3.8vw, 48px)", fontWeight: 800, lineHeight: 1.15,
                letterSpacing: "-0.035em", marginBottom: "14px",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                Diagnose, fix, test & safely<br />
                release <span className="gradient-text">hospital software</span>
              </h1>

              {/* Sub */}
              <p style={{
                color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.65,
                maxWidth: "680px", marginBottom: "32px", fontWeight: 400,
              }}>
                MedTrace orchestrates{" "}
                <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>5 specialist AI agents</strong>{" "}
                in parallel across your hospital codebase — from incident to root-cause, code diff, automated tests, healthcare safety review, and release gate. Built for IBM Bob 2.0's Agent Mode.
              </p>

              {/* Stat tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "10px" }}>
                {HERO_STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`stat-card stat-card-${s.tier} animate-slide-up stagger-${i + 1}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                      <span style={{ fontSize: "16px", opacity: 0.8 }}>{s.icon}</span>
                    </div>
                    <div className="stat-label">{s.label}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "3px", fontFamily: "'JetBrains Mono', monospace" }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Workflow breadcrumb strip (non-hero tabs) ── */}
          {activeTab !== "incidents" && (
            <div style={{ padding: "20px 0 10px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <span style={{ color: "var(--text-muted)" }}>STAGES:</span>
                {TABS.map((t, i) => {
                  const Icon = t.icon;
                  const isCurrent = t.id === activeTab;
                  return (
                    <span key={t.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => setActiveTab(t.id)}
                        style={{
                          background: isCurrent ? "rgba(56, 189, 248, 0.12)" : "transparent",
                          border: isCurrent ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
                          borderRadius: "6px",
                          padding: "3px 8px",
                          cursor: "pointer",
                          color: isCurrent ? "var(--accent-cyan)" : "var(--text-muted)",
                          fontWeight: isCurrent ? 700 : 400,
                          fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
                          transition: "all 0.15s",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Icon size={12} color={isCurrent ? "#38bdf8" : "currentColor"} />
                        <span>{t.label}</span>
                      </button>
                      {i < TABS.length - 1 && <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>›</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Segmented Navigation Dock ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div className="nav-tab-container">
              {TABS.map((tab) => {
                const badge = tabBadge(tab.id);
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-tab ${isActive ? "active" : ""}`}
                  >
                    <Icon size={15} color={isActive ? "#38bdf8" : "currentColor"} />
                    <span style={{ fontSize: "13px", fontWeight: isActive ? 700 : 500 }}>
                      {tab.label}
                    </span>
                    {badge && (
                      <span style={{
                        padding: "1.5px 7px",
                        borderRadius: "9999px",
                        fontSize: "9.5px",
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        background: isActive
                          ? tab.id === "release" && analysisComplete
                            ? "rgba(16, 185, 129, 0.25)"
                            : isAnalyzing
                              ? "rgba(234, 179, 8, 0.2)"
                              : "rgba(56, 189, 248, 0.25)"
                          : "rgba(255, 255, 255, 0.07)",
                        color: isActive
                          ? tab.id === "release" && analysisComplete
                            ? "#34d399"
                            : isAnalyzing
                              ? "#facc15"
                              : "#38bdf8"
                          : "var(--text-muted)",
                        border: `1px solid ${isActive ? "rgba(56, 189, 248, 0.4)" : "rgba(255, 255, 255, 0.06)"}`,
                      }}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick action / workflow hint */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "var(--text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>CURRENT STAGE:</span>
              <span style={{
                color: "var(--accent-cyan)",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "6px",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}>
                {TABS.find(t => t.id === activeTab)?.hint}
              </span>
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="animate-fade-in" key={activeTab}>
            {activeTab === "incidents" && (
              <IncidentDashboard
                onStartInvestigation={handleStartInvestigation}
                activeIncident={activeIncident}
                onSelectTab={setActiveTab}
              />
            )}
            {activeTab === "investigate" && (
              <InvestigationWorkspace
                incident={activeIncident || DEMO_INCIDENT}
                isAnalyzing={isAnalyzing}
                analysisComplete={analysisComplete}
                agentProgress={agentProgress}
                onProceedToFix={() => setActiveTab("fix")}
                onTriggerScan={handleRescan}
              />
            )}
            {activeTab === "fix" && (
              <FixWorkspace
                incident={activeIncident || DEMO_INCIDENT}
                analysisComplete={analysisComplete}
                onProceedToReview={() => setActiveTab("review")}
              />
            )}
            {activeTab === "review" && (
              <VerificationPanel
                incident={activeIncident || DEMO_INCIDENT}
                onProceedToRelease={() => setActiveTab("release")}
              />
            )}
            {activeTab === "release" && (
              <ReleaseGate
                incident={activeIncident || DEMO_INCIDENT}
                onNewIncident={() => setActiveTab("incidents")}
              />
            )}
          </div>
        </main>
      </div>

      {/* ── Bobalytics Modal ── */}
      {isAnalyticsOpen && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setIsAnalyticsOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(2, 6, 16, 0.85)",
            backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="glass-card animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "1180px", width: "100%", maxHeight: "90vh", overflowY: "auto",
              padding: "28px", background: "#050e1f",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(168, 85, 247, 0.15)",
              borderRadius: "20px", position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📊</span>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                  MedTrace Bobalytics™ Suite
                </span>
              </div>
              <button
                onClick={() => setIsAnalyticsOpen(false)}
                className="btn-ghost"
                style={{ fontSize: "11.5px", padding: "6px 14px" }}
              >
                ✕ Close
              </button>
            </div>
            <Bobalytics />
          </div>
        </div>
      )}

      {/* ── Live Vitals Oscilloscope Modal ── */}
      {isVitalsOpen && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setIsVitalsOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(2, 6, 16, 0.85)",
            backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="glass-card animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "1050px", width: "100%", maxHeight: "90vh", overflowY: "auto",
              padding: "28px", background: "#050e1f",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(56, 189, 248, 0.15)",
              borderRadius: "20px", position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🫀</span>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Live Patient Telemetry & Crisis Simulator
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                    60FPS Canvas ECG waveform stream with real-time vitals & simulated septic crisis injection
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVitalsOpen(false)}
                className="btn-ghost"
                style={{ fontSize: "11.5px", padding: "6px 14px" }}
              >
                ✕ Close
              </button>
            </div>
            <VitalsOscilloscope />
          </div>
        </div>
      )}
    </div>
  );
}
