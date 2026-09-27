"use client";

import { useState } from "react";
import { Incident, DEMO_INCIDENT, Tab } from "@/lib/types";

interface IncidentDashboardProps {
  onStartInvestigation: (incident: Incident) => void;
  activeIncident: Incident | null;
  onSelectTab: (tab: Tab) => void;
}

const SAMPLE_INCIDENTS: Incident[] = [
  DEMO_INCIDENT,
  {
    id: "INC-2026-0844",
    title: "Pharmacy module crashes on patient discharge",
    description: "Unhandled exception in Pharmacy.jsx when bed is vacated while an active prescription is open. Stack trace points to null reference on patient ID lookup after discharge event.",
    severity: "critical",
    module: "Pharmacy.jsx",
    status: "open",
    createdAt: "2026-09-26T18:30:00+05:30",
  },
  {
    id: "INC-2026-0841",
    title: "Lab results not appearing in MediSentinel AI scoring",
    description: "Troponin and platelet counts from Lab.jsx are not reaching the sentinelData.js scoring pipeline. AI triage scores are computed without lab data, causing under-triage of cardiac patients.",
    severity: "high",
    module: "Lab.jsx → sentinelData.js",
    status: "fixing",
    createdAt: "2026-09-26T14:00:00+05:30",
  },
];

const QUICK_TEMPLATES = [
  { icon: "🏥", label: "ED wait time mismatch", value: "Emergency department dashboard shows incorrect patient wait time. Affects triage prioritisation." },
  { icon: "💊", label: "Pharmacy crash on discharge", value: "Pharmacy module crashes on patient discharge with unhandled null reference exception." },
  { icon: "🧪", label: "Lab data not reaching AI", value: "Lab results not appearing in MediSentinel AI scoring pipeline. Troponin values missing." },
  { icon: "💰", label: "Billing under-reporting drugs", value: "Pharmacy drug dispense records are not linked to billing invoices. Missing revenue line items." },
];

const WORKFLOW_STEPS: { icon: string; label: string; desc: string; tab: Tab; tag: string }[] = [
  { icon: "📥", label: "Incident Intake", desc: "Natural language & crash dumps", tab: "incidents", tag: "ACTIVE" },
  { icon: "🔍", label: "Parallel Agents", desc: "5 specialist subagents", tab: "investigate", tag: "5× CONCURRENT" },
  { icon: "🎯", label: "Root Cause", desc: "Evidence & confidence graph", tab: "investigate", tag: "94% CERTAINTY" },
  { icon: "⚡", label: "Fix Generation", desc: "AST patch & code diff", tab: "fix", tag: "DIFF READY" },
  { icon: "🧪", label: "Automated Tests", desc: "8 regression + unit tests", tab: "fix", tag: "100% PASS" },
  { icon: "🛡️", label: "AI Safety Review", desc: "HIPAA, PHI & HL7 checks", tab: "review", tag: "7 CHECKS" },
  { icon: "🚀", label: "Release Gate", desc: "Deployment audit passport", tab: "release", tag: "DEPLOY GATE" },
];

export default function IncidentDashboard({ onStartInvestigation, activeIncident, onSelectTab }: IncidentDashboardProps) {
  const [inputText, setInputText] = useState("");
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("high");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const handleCreate = () => {
    if (!inputText.trim()) return;
    setIsCreating(true);
    const newIncident: Incident = {
      id: `INC-2026-${Math.floor(Math.random() * 1000).toString().padStart(4, "0")}`,
      title: inputText.slice(0, 80),
      description: inputText,
      severity,
      module: "Auto-detected by Bob AST Scanner",
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
      setIsCreating(false);
      onStartInvestigation(newIncident);
    }, 600);
  };

  const severityColor = {
    critical: "#f87171",
    high: "#fbbf24",
    medium: "#38bdf8",
    low: "#34d399",
  };

  const statusLabel: Record<Incident["status"], { label: string; badge: string }> = {
    open: { label: "Open", badge: "badge-critical" },
    investigating: { label: "Investigating", badge: "badge-high" },
    fixing: { label: "Fixing", badge: "badge-medium" },
    reviewing: { label: "Reviewing", badge: "badge-purple" },
    released: { label: "Released", badge: "badge-ok" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* ── Interactive AI Workflow Pipeline Visualizer ── */}
      <div className="glass-card" style={{ padding: "22px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px",
            }}>
              ⚡
            </span>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "-0.01em", color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                IBM Bob 2.0 — Orchestrated Developer Pipeline
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                Click any workflow node to inspect artifacts, code diffs, or gate verdicts
              </p>
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
            color: "var(--text-secondary)", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "4px 10px",
          }}>
            <span style={{ color: "#34d399" }}>●</span> 7 Autonomous Stages
          </div>
        </div>

        {/* Stepper Track */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0",
          overflowX: "auto", paddingBottom: "6px",
        }}>
          {WORKFLOW_STEPS.map((step, i) => {
            const isFirst = i === 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div
                  onClick={() => onSelectTab(step.tab)}
                  className={`workflow-step ${isFirst ? "active" : ""}`}
                  style={{
                    padding: "10px 14px",
                    minWidth: "115px",
                    maxWidth: "140px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "18px" }}>{step.icon}</span>
                    <span style={{
                      fontSize: "8.5px", fontWeight: 700, padding: "1px 5px",
                      borderRadius: "4px",
                      background: isFirst ? "rgba(56, 189, 248, 0.25)" : "rgba(255,255,255,0.06)",
                      color: isFirst ? "#38bdf8" : "var(--text-muted)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {step.tag}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: isFirst ? 700 : 600,
                    color: isFirst ? "#38bdf8" : "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}>
                    {step.label}
                  </span>
                  <span style={{
                    fontSize: "9.5px",
                    color: "var(--text-muted)",
                    lineHeight: 1.25,
                    whiteSpace: "normal",
                  }}>
                    {step.desc}
                  </span>
                </div>

                {i < WORKFLOW_STEPS.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", padding: "0 6px", opacity: 0.6 }}>
                    <svg width="22" height="12" viewBox="0 0 22 12">
                      <path d="M0 6 L16 6 M12 2 L16 6 L12 10" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main 2-Column Workspace ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "24px" }}>
        
        {/* ── Left Column: Issue Intake Studio ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="glass-card" style={{ padding: "26px", position: "relative" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                }}>
                  🚨
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                    AI Incident Intake Studio
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Natural language triage powered by IBM Bob 2.0 repository reasoning
                  </p>
                </div>
              </div>

              <span style={{
                fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                padding: "3px 8px", borderRadius: "6px",
                background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}>
                Target: hospital-ehr:main
              </span>
            </div>

            {/* Quick Templates */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{
                fontSize: "10.5px", fontWeight: 700, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                One-Click Incident Presets:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {QUICK_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(t.value);
                      setSelectedTemplate(i);
                    }}
                    style={{
                      background: selectedTemplate === i ? "rgba(56, 189, 248, 0.14)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedTemplate === i ? "rgba(56, 189, 248, 0.45)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: "9px", padding: "8px 12px", fontSize: "11.5px",
                      color: selectedTemplate === i ? "#ffffff" : "var(--text-secondary)",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => {
                      if (selectedTemplate !== i) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56, 189, 248, 0.3)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedTemplate !== i) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                      }
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{t.icon}</span>
                    <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div style={{ position: "relative", marginBottom: "14px" }}>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Describe the clinical software anomaly in plain English: 'Emergency department dashboard shows incorrect patient wait time. Nurses report times are 15–20 minutes higher than actual queue data. Issue started after Tuesday's deployment...'"
                style={{
                  width: "100%", minHeight: "115px",
                  background: "rgba(8, 16, 32, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px", color: "var(--text-primary)",
                  padding: "14px 16px", resize: "vertical", fontSize: "13px",
                  outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  lineHeight: 1.6,
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
                  transition: "all 0.2s",
                }}
              />
              <div style={{
                position: "absolute", bottom: "10px", right: "12px",
                fontSize: "10px", color: "var(--text-muted)",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {inputText.length} chars
              </div>
            </div>

            {/* Severity Radio Group & Submit */}
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{
                  fontSize: "10.5px", fontWeight: 700, color: "var(--text-muted)",
                  marginBottom: "6px", fontFamily: "'JetBrains Mono', monospace",
                }}>
                  INCIDENT SEVERITY
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {(["critical", "high", "medium", "low"] as const).map(s => {
                    const isSel = severity === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSeverity(s)}
                        style={{
                          flex: 1,
                          padding: "6px 8px", borderRadius: "8px", fontSize: "10.5px", fontWeight: 700,
                          cursor: "pointer", textTransform: "uppercase",
                          fontFamily: "'JetBrains Mono', monospace",
                          background: isSel ? `${severityColor[s]}20` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isSel ? severityColor[s] : "rgba(255,255,255,0.08)"}`,
                          color: isSel ? severityColor[s] : "var(--text-muted)",
                          boxShadow: isSel ? `0 0 12px ${severityColor[s]}33` : "none",
                          transition: "all 0.18s ease",
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={!inputText.trim() || isCreating}
                style={{
                  padding: "11px 24px",
                  height: "46px",
                  fontSize: "13px",
                  fontWeight: 700,
                  opacity: inputText.trim() ? 1 : 0.45,
                  minWidth: "200px",
                }}
              >
                {isCreating ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                    Orchestrating Agents…
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Launch 5-Agent Swarm</span>
                  </>
                )}
              </button>
            </div>

            {/* Document Understanding Dropzone Mockup */}
            <div
              onClick={() => setAttachedFile(prev => prev ? null : "ed_triage_dump_2026-09-26.log (48 KB)")}
              style={{
                marginTop: "16px", padding: "12px 16px",
                background: attachedFile ? "rgba(52, 211, 153, 0.08)" : "rgba(0,0,0,0.25)",
                borderRadius: "10px",
                border: `1px ${attachedFile ? "solid rgba(52, 211, 153, 0.4)" : "dashed rgba(56,189,248,0.25)"}`,
                fontSize: "11px", color: "var(--text-secondary)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                if (!attachedFile) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(56,189,248,0.45)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(56,189,248,0.04)";
                }
              }}
              onMouseLeave={e => {
                if (!attachedFile) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(56,189,248,0.25)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.25)";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>{attachedFile ? "📄" : "📎"}</span>
                <div>
                  <span style={{ fontWeight: 600, color: attachedFile ? "#34d399" : "#ffffff" }}>
                    {attachedFile ? attachedFile : "Attach hospital logs, FHIR bundles, or stack traces"}
                  </span>
                  <div style={{ fontSize: "10px", color: attachedFile ? "rgba(52, 211, 153, 0.8)" : "var(--text-muted)", marginTop: "1px" }}>
                    {attachedFile
                      ? "✓ Parsed by Bob 2.0 Document Understanding · 14 stack trace frames indexed"
                      : "Bob 2.0 Document Understanding parses crash dumps, Jira tickets, and clinical schemas"}
                  </div>
                </div>
              </div>
              <span className="kbd-shortcut" style={{
                fontSize: "9px",
                color: attachedFile ? "#34d399" : "var(--accent-cyan)",
                borderColor: attachedFile ? "rgba(52, 211, 153, 0.4)" : "rgba(56, 189, 248, 0.3)",
              }}>
                {attachedFile ? "✕ REMOVE" : "BROWSE"}
              </span>
            </div>
          </div>

          {/* Bob Capabilities Telemetry */}
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px",
              fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span>✦</span> ACTIVE IBM BOB 2.0 MODES
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { mode: "ask", icon: "🔍", title: "Ask Mode", desc: "Explain unfamiliar hospital code, architecture and dependencies without modifying files", color: "#38bdf8" },
                { mode: "plan", icon: "📋", title: "Plan Mode", desc: "Synthesizes structured investigation, patch implementation, and regression test plan", color: "#c084fc" },
                { mode: "agent", icon: "⚡", title: "Agent Mode", desc: "Executes approved patches, runs CLI test suites, and coordinates 5 parallel subagents", color: "#34d399" },
              ].map(({ mode, icon, title, desc, color }) => (
                <div key={mode} style={{
                  padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", gap: "12px",
                  transition: "all 0.2s",
                }}>
                  <span style={{
                    fontSize: "14px", width: "28px", height: "28px", borderRadius: "7px",
                    background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {title}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4, marginTop: "2px" }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column: Active Incidents Feed ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                Active Hospital Incidents
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                Clinical engineering priority queue
              </p>
            </div>
            <span className="badge badge-critical" style={{ fontSize: "10px" }}>
              {SAMPLE_INCIDENTS.filter(i => i.status !== "released").length} Active
            </span>
          </div>

          {/* Incident Cards */}
          {SAMPLE_INCIDENTS.map(inc => {
            const isSelected = activeIncident?.id === inc.id;
            return (
              <div
                key={inc.id}
                className="glass-card glass-card-interactive"
                onClick={() => onStartInvestigation(inc)}
                style={{
                  padding: "18px 20px",
                  borderColor: isSelected ? "rgba(56, 189, 248, 0.55)" : "rgba(255, 255, 255, 0.08)",
                  background: isSelected
                    ? "linear-gradient(180deg, rgba(16, 36, 68, 0.85) 0%, rgba(10, 22, 44, 0.95) 100%)"
                    : "rgba(11, 20, 38, 0.65)",
                  boxShadow: isSelected ? "0 8px 30px rgba(14, 165, 233, 0.2)" : undefined,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: 700 }}>
                      {inc.id}
                    </span>
                    <span className={`badge ${statusLabel[inc.status].badge}`} style={{ fontSize: "9px" }}>
                      {statusLabel[inc.status].label}
                    </span>
                  </div>

                  <span style={{
                    fontSize: "10px", fontWeight: 800, padding: "2px 8px",
                    background: `${severityColor[inc.severity]}18`,
                    border: `1px solid ${severityColor[inc.severity]}44`,
                    color: severityColor[inc.severity], borderRadius: "6px", textTransform: "uppercase",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {inc.severity}
                  </span>
                </div>

                <div style={{
                  fontSize: "13.5px", fontWeight: 700, marginBottom: "6px", color: "#ffffff",
                  lineHeight: 1.35, fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  {inc.title}
                </div>

                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                  {inc.description.slice(0, 115)}…
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontSize: "10.5px", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                }}>
                  <span className="mono" style={{ color: "#38bdf8", background: "rgba(56, 189, 248, 0.08)", padding: "2px 6px", borderRadius: "4px" }}>
                    📁 {inc.module}
                  </span>
                  
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                      {new Date(inc.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{
                      color: "#38bdf8", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      Investigate →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Workflow Impact Matrix */}
          <div className="glass-card" style={{ padding: "18px 20px", background: "rgba(6, 12, 24, 0.75)" }}>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              📊 WORKFLOW IMPACT (BEFORE VS AFTER)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{
                padding: "12px", background: "rgba(239, 68, 68, 0.06)",
                borderRadius: "10px", border: "1px solid rgba(239, 68, 68, 0.2)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#f87171", marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace" }}>
                  MANUAL TRIAGE
                </div>
                {["~2 hrs to root cause", "14 files searched", "0 tests synthesized", "No PHI safety check"].map((x, i) => (
                  <div key={i} style={{ fontSize: "10.5px", color: "var(--text-secondary)", padding: "2px 0", display: "flex", gap: "6px" }}>
                    <span style={{ color: "#f87171" }}>×</span>
                    <span>{x}</span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: "12px", background: "rgba(16, 185, 129, 0.06)",
                borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#34d399", marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace" }}>
                  BOB 2.0 WORKFLOW
                </div>
                {["90s to root cause", "5 parallel agents", "8 tests auto-generated", "PHI + audit verified"].map((x, i) => (
                  <div key={i} style={{ fontSize: "10.5px", color: "var(--text-secondary)", padding: "2px 0", display: "flex", gap: "6px" }}>
                    <span style={{ color: "#34d399" }}>✓</span>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
