"use client";

import { useState } from "react";
import { Incident, DEMO_INCIDENT, Tab } from "@/lib/types";
import {
  IconIntake,
  IconInvestigate,
  IconAgents,
  IconTarget,
  IconFix,
  IconTestTube,
  IconReview,
  IconRelease,
  IconBolt,
  IconHospital,
} from "@/components/NavIcons";

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
  { icon: IconHospital, label: "ED wait time mismatch", value: "Emergency department dashboard shows incorrect patient wait time. Affects triage prioritisation.", tag: "ED QUEUE" },
  { icon: IconFix, label: "Pharmacy crash on discharge", value: "Pharmacy module crashes on patient discharge with unhandled null reference exception.", tag: "PHARMACY" },
  { icon: IconTestTube, label: "Lab data not reaching AI", value: "Lab results not appearing in MediSentinel AI scoring pipeline. Troponin values missing.", tag: "LAB / AI" },
  { icon: IconTarget, label: "Billing under-reporting drugs", value: "Pharmacy drug dispense records are not linked to billing invoices. Missing revenue line items.", tag: "REVENUE" },
];

interface WorkflowStepDef {
  stepNum: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  desc: string;
  tab: Tab;
  tag: string;
  tagColor: string;
  latency: string;
  accent: string;
}

const WORKFLOW_STEPS: WorkflowStepDef[] = [
  {
    stepNum: "01",
    icon: IconIntake,
    label: "Incident Intake",
    desc: "Natural language & stack ingestion",
    tab: "incidents",
    tag: "LIVE INPUT",
    tagColor: "#38bdf8",
    latency: "< 5s",
    accent: "rgba(56, 189, 248, 0.35)",
  },
  {
    stepNum: "02",
    icon: IconAgents,
    label: "Parallel Mesh",
    desc: "5 subagents analyze AST & call graph",
    tab: "investigate",
    tag: "5× MESH",
    tagColor: "#60a5fa",
    latency: "270k Ctx",
    accent: "rgba(96, 165, 250, 0.35)",
  },
  {
    stepNum: "03",
    icon: IconTarget,
    label: "Root Cause Engine",
    desc: "Deterministic evidence & confidence graph",
    tab: "investigate",
    tag: "94% CERTAINTY",
    tagColor: "#a855f7",
    latency: "Zero Drift",
    accent: "rgba(168, 85, 247, 0.35)",
  },
  {
    stepNum: "04",
    icon: IconFix,
    label: "Fix Synthesizer",
    desc: "Minimal surgical AST patch & diff",
    tab: "fix",
    tag: "DIFF READY",
    tagColor: "#38bdf8",
    latency: "AST Match",
    accent: "rgba(56, 189, 248, 0.35)",
  },
  {
    stepNum: "05",
    icon: IconTestTube,
    label: "Automated Tests",
    desc: "8 Vitest unit & regression tests synthesized",
    tab: "fix",
    tag: "100% PASS",
    tagColor: "#34d399",
    latency: "Vitest Suite",
    accent: "rgba(52, 211, 153, 0.35)",
  },
  {
    stepNum: "06",
    icon: IconReview,
    label: "AI Safety Review",
    desc: "HIPAA §164.312, PHI & HL7 guardrails",
    tab: "review",
    tag: "7 CHECKS",
    tagColor: "#fbbf24",
    latency: "FHIR Guard",
    accent: "rgba(251, 191, 36, 0.35)",
  },
  {
    stepNum: "07",
    icon: IconRelease,
    label: "Release Gate",
    desc: "Cryptographic SHA-256 clinical passport",
    tab: "release",
    tag: "DEPLOY GATE",
    tagColor: "#c084fc",
    latency: "HITL Signed",
    accent: "rgba(192, 132, 252, 0.35)",
  },
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
      {/* ── Interactive AI Workflow Pipeline Visualizer (IBM Bob 2.0 Orchestrated Developer Pipeline) ── */}
      <div
        className="glass-card"
        style={{
          padding: "24px 26px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(8, 17, 36, 0.85) 0%, rgba(4, 9, 20, 0.95) 100%)",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Top luminous accent beam */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.4) 20%, #00f2fe 50%, rgba(168, 85, 247, 0.4) 80%, transparent 100%)",
          }}
        />

        {/* Pipeline Control Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(37, 99, 235, 0.3) 100%)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(56, 189, 248, 0.3)",
              }}
            >
              <IconBolt size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#ffffff",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  IBM Bob 2.0 — Orchestrated Developer Pipeline
                </h3>
                <span
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: "2px 7px",
                    borderRadius: "5px",
                    background: "rgba(56, 189, 248, 0.15)",
                    border: "1px solid rgba(56, 189, 248, 0.35)",
                    color: "#38bdf8",
                    letterSpacing: "0.04em",
                  }}
                >
                  7 AUTONOMOUS STAGES
                </span>
              </div>
              <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Deterministic multi-agent execution pipeline: from incident detection to verified clinical release gate. Click any node to inspect.
              </p>
            </div>
          </div>

          {/* Right Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "10.5px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#34d399",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontWeight: 600,
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
              Live Pipeline Active
            </div>

            <div
              style={{
                fontSize: "10.5px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.22)",
                borderRadius: "6px",
                padding: "4px 10px",
                fontWeight: 600,
              }}
            >
              ⚡ 90s MTTR
            </div>
          </div>
        </div>

        {/* Stepper Track */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: "0",
            overflowX: "auto",
            padding: "4px 2px 10px 2px",
            scrollbarWidth: "thin",
          }}
        >
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isFirst = i === 0;

            return (
              <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div
                  onClick={() => onSelectTab(step.tab)}
                  style={{
                    background: isFirst
                      ? "linear-gradient(145deg, rgba(14, 165, 233, 0.18) 0%, rgba(37, 99, 235, 0.1) 100%)"
                      : "linear-gradient(145deg, rgba(12, 22, 44, 0.6) 0%, rgba(6, 12, 24, 0.8) 100%)",
                    border: `1px solid ${isFirst ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                    borderRadius: "14px",
                    padding: "14px 16px",
                    minWidth: "148px",
                    maxWidth: "168px",
                    cursor: "pointer",
                    transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "8px",
                    boxShadow: isFirst
                      ? "0 6px 20px rgba(14, 165, 233, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 4px 12px rgba(0, 0, 0, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = step.tagColor;
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${step.accent}, inset 0 1px 0 rgba(255, 255, 255, 0.15)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isFirst ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isFirst
                      ? "0 6px 20px rgba(14, 165, 233, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 4px 12px rgba(0, 0, 0, 0.25)";
                  }}
                >
                  {/* Top: Step Number & Stage Tag */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: step.tagColor,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {step.stepNum}
                    </span>
                    <span
                      style={{
                        fontSize: "8.5px",
                        fontWeight: 700,
                        padding: "1.5px 6px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: `1px solid ${step.tagColor}40`,
                        color: step.tagColor,
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {step.tag}
                    </span>
                  </div>

                  {/* Middle: Vector Icon in glowing orb & Title */}
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: `${step.tagColor}1a`,
                        border: `1px solid ${step.tagColor}4d`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color={step.tagColor} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12.5px",
                          fontWeight: 700,
                          color: "#ffffff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {step.label}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "10.5px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.35,
                      margin: 0,
                    }}
                  >
                    {step.desc}
                  </p>

                  {/* Bottom: Micro Metric & Inspect Hint */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: "6px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      marginTop: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "var(--text-muted)",
                      }}
                    >
                      {step.latency}
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        color: step.tagColor,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      Inspect →
                    </span>
                  </div>
                </div>

                {/* Animated Glowing Conduit between stages */}
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 6px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "2px",
                        background: "linear-gradient(90deg, rgba(56, 189, 248, 0.6) 0%, rgba(168, 85, 247, 0.6) 100%)",
                        position: "relative",
                        boxShadow: "0 0 8px rgba(56, 189, 248, 0.4)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          right: "-2px",
                          top: "-3px",
                          width: 0,
                          height: 0,
                          borderTop: "4px solid transparent",
                          borderBottom: "4px solid transparent",
                          borderLeft: "5px solid #38bdf8",
                        }}
                      />
                    </div>
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
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconIntake size={18} color="#ef4444" />
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
                {QUICK_TEMPLATES.map((t, i) => {
                  const Icon = t.icon;
                  const isSelected = selectedTemplate === i;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setInputText(t.value);
                        setSelectedTemplate(i);
                      }}
                      style={{
                        background: isSelected ? "rgba(56, 189, 248, 0.14)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.45)" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: "9px", padding: "8px 12px", fontSize: "11.5px",
                        color: isSelected ? "#ffffff" : "var(--text-secondary)",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        textAlign: "left",
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56, 189, 248, 0.3)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                        }
                      }}
                    >
                      <Icon size={16} color={isSelected ? "#38bdf8" : "var(--text-muted)"} />
                      <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
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
                    <IconBolt size={15} color="#ffffff" />
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
                <span style={{ fontSize: "16px", color: attachedFile ? "#34d399" : "#38bdf8" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
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
              <span style={{ color: "#38bdf8" }}>✦</span> ACTIVE IBM BOB 2.0 MODES
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { mode: "ask", icon: IconInvestigate, title: "Ask Mode", desc: "Explain unfamiliar hospital code, architecture and dependencies without modifying files", color: "#38bdf8" },
                { mode: "plan", icon: IconReview, title: "Plan Mode", desc: "Synthesizes structured investigation, patch implementation, and regression test plan", color: "#c084fc" },
                { mode: "agent", icon: IconBolt, title: "Agent Mode", desc: "Executes approved patches, runs CLI test suites, and coordinates 5 parallel subagents", color: "#34d399" },
              ].map(({ mode, icon: ModeIcon, title, desc, color }) => (
                <div key={mode} style={{
                  padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", gap: "12px",
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "7px",
                    background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <ModeIcon size={15} color={color} />
                  </div>
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
