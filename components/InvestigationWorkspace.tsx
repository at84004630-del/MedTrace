"use client";

import { useState, useEffect, useRef } from "react";
import { Incident } from "@/lib/types";

interface InvestigationWorkspaceProps {
  incident: Incident;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  agentProgress: number;
  onProceedToFix: () => void;
  onTriggerScan?: () => void;
}

interface Agent {
  id: string;
  name: string;
  icon: string;
  domain: string;
  color: string;
  status: "queued" | "running" | "done" | "flagged";
  latency: string;
  findings: string[];
  evidence: { file: string; line: string; detail: string }[];
}

const AGENTS: Agent[] = [
  {
    id: "backend",
    name: "Backend Agent",
    icon: "⚙️",
    domain: "API / Service Layer",
    color: "var(--accent-blue)",
    status: "done",
    latency: "14s",
    findings: [
      "WaitTimeController.js computes wait time from appointmentSlots array, not the live queue",
      "getQueueDepth() in QueueService.js was refactored on Sep 23 — now returns raw slot count instead of active patient count",
      "API endpoint /api/ed/wait-time still calls the deprecated slot-based calculation"
    ],
    evidence: [
      { file: "WaitTimeController.js", line: "L:47", detail: "const waitMinutes = appointmentSlots.length * AVG_SLOT_DURATION" },
      { file: "QueueService.js", line: "L:112", detail: "return this.slots.filter(s => s.status !== 'cancelled').length // BUG: includes reserved future slots" },
    ],
  },
  {
    id: "frontend",
    name: "Frontend Agent",
    icon: "🖥️",
    domain: "UI / React Components",
    color: "var(--accent-cyan)",
    status: "done",
    latency: "11s",
    findings: [
      "EmergencyDashboard.jsx calls /api/ed/wait-time and renders without validation",
      "No staleness guard — component does not re-fetch after 60s, displaying stale data",
      "Display logic correctly converts minutes to 'X min' format — UI is not the root cause"
    ],
    evidence: [
      { file: "EmergencyDashboard.jsx", line: "L:88", detail: "const { data } = useFetch('/api/ed/wait-time', { interval: null }) // missing refresh interval" },
    ],
  },
  {
    id: "database",
    name: "Database Agent",
    icon: "🗄️",
    domain: "Schema / Queries",
    color: "var(--accent-purple)",
    status: "done",
    latency: "18s",
    findings: [
      "appointment_slots table contains both confirmed and tentative future bookings",
      "Active queue is tracked in patient_queue table (separate) — QueueService.js was not updated to use it",
      "Schema diff from Sep 23 migration: patient_queue table added, QueueService not migrated"
    ],
    evidence: [
      { file: "schema_migration_20260923.sql", line: "L:14", detail: "CREATE TABLE patient_queue (id, patient_id, arrival_time, status) // new table not referenced by service" },
    ],
  },
  {
    id: "testing",
    name: "Testing Agent",
    icon: "🧪",
    domain: "Test Coverage / Gaps",
    color: "var(--accent-green)",
    status: "done",
    latency: "22s",
    findings: [
      "WaitTimeController.test.js only tests empty slot arrays — no test for mixed confirmed/tentative",
      "QueueService.test.js was deleted in the Sep 23 refactor PR (#811)",
      "0 integration tests cover the /api/ed/wait-time endpoint end-to-end",
      "Coverage gap identified: patient_queue logic has 0% test coverage"
    ],
    evidence: [
      { file: "QueueService.test.js", line: "DELETED", detail: "Removed in PR #811 — no replacement added" },
    ],
  },
  {
    id: "security",
    name: "Security & PHI Agent",
    icon: "🔒",
    domain: "Security / PHI Safety",
    color: "var(--accent-orange)",
    status: "flagged",
    latency: "9s",
    findings: [
      "Wait-time API does NOT expose PHI — patient identifiers are not included in response",
      "⚠️ QueueService.js logs patient_id in debug output on error paths (line 98) — review for PHI leak",
      "Role guard on /api/ed/wait-time correctly restricted to ED_STAFF and ADMIN roles",
      "Audit logging for wait-time reads is absent — recommend adding for compliance"
    ],
    evidence: [
      { file: "QueueService.js", line: "L:98", detail: "console.error('Queue error for patient:', patientId) // PHI in logs ⚠️" },
    ],
  },
];

const ROOT_CAUSE = {
  title: "QueueService.js returns slot count instead of active patient count",
  confidence: 94,
  evidence: "After the Sep 23 refactor (PR #811), QueueService.getQueueDepth() was changed to count appointment_slots rows. This includes future reserved slots, inflating the returned count. WaitTimeController.js multiplies this by AVG_SLOT_DURATION (15 min), producing wait times 15–20 min higher than reality. The new patient_queue table (added in the same migration) contains accurate live queue data but was never used in the service.",
  affectedModules: ["QueueService.js", "WaitTimeController.js", "EmergencyDashboard.jsx", "/api/ed/wait-time"],
  rootFile: "QueueService.js",
  rootLine: "L:112",
  regressionRisk: "Medium — change is isolated to wait-time calculation path; no patient data mutation",
};

const BOB_THOUGHT_LOG = [
  { t: "00:00", text: "Parsed repository: 11 MediCore modules loaded into 270k context" },
  { t: "00:01", text: "Identified relevant modules: QueueService, WaitTimeController, EmergencyDashboard, appointment schema" },
  { t: "00:02", text: "Dispatching 5 parallel specialist agents (backend, frontend, DB, testing, security)" },
  { t: "00:08", text: "Backend agent: traced API call chain from EmergencyDashboard → /api/ed/wait-time → QueueService" },
  { t: "00:14", text: "Database agent: schema diff shows patient_queue table added Sep 23, not referenced by QueueService" },
  { t: "00:18", text: "Testing agent: QueueService.test.js deleted in PR #811 — coverage gap confirmed" },
  { t: "00:22", text: "Security agent: ⚠️ PHI exposure in QueueService.js L:98 debug log — flagged for remediation" },
  { t: "00:23", text: "Aggregating findings from all 5 agents — computing root cause confidence score" },
  { t: "00:24", text: "Root cause identified (94% confidence): QueueService.getQueueDepth() uses wrong data source" },
];

export default function InvestigationWorkspace({
  incident, isAnalyzing, analysisComplete, agentProgress, onProceedToFix, onTriggerScan,
}: InvestigationWorkspaceProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [planApproved, setPlanApproved] = useState(false);
  const [deepTraceActive, setDeepTraceActive] = useState(false);
  const [isDeepTracing, setIsDeepTracing] = useState(false);
  const [logLines, setLogLines] = useState<typeof BOB_THOUGHT_LOG>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const handleRequestDeepTrace = () => {
    if (isDeepTracing || deepTraceActive) return;
    setIsDeepTracing(true);
    const deepLines = [
      { t: "00:26", text: "⚡ Deep Trace Probe: Attaching eBPF socket listener to /api/ed/wait-time handler" },
      { t: "00:27", text: "🔍 Span #ed-0x9f1: Call frame in QueueService.getQueueDepth() (2.1ms execution wait)" },
      { t: "00:28", text: "📊 Span #ed-0x9f2: SQL SELECT count(*) FROM appointment_slots (returned 24 rows, 18 future tentative)" },
      { t: "00:29", text: "✓ Deep trace confirmed: 18 ghost slots skew wait-time calculation by +18.4 min." },
    ];
    let step = 0;
    const tickTrace = () => {
      if (step < deepLines.length) {
        const line = deepLines[step];
        setLogLines(prev => [...prev, line]);
        step++;
        setTimeout(tickTrace, 350);
      } else {
        setIsDeepTracing(false);
        setDeepTraceActive(true);
      }
    };
    setTimeout(tickTrace, 250);
  };

  useEffect(() => {
    if (!isAnalyzing && !analysisComplete) {
      setLogLines([]);
      return;
    }
    if (analysisComplete && !isAnalyzing) {
      setLogLines(BOB_THOUGHT_LOG);
      return;
    }

    setLogLines([]);
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let i = 0;
    const addLine = () => {
      if (i >= BOB_THOUGHT_LOG.length) return;
      const nextLine = BOB_THOUGHT_LOG[i];
      if (nextLine) {
        setLogLines(prev => [...prev, nextLine]);
      }
      i++;
      if (i < BOB_THOUGHT_LOG.length) {
        timerId = setTimeout(addLine, 700 + Math.random() * 300);
      }
    };
    timerId = setTimeout(addLine, 200);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isAnalyzing, analysisComplete]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [logLines]);

  const agentStatusColor = {
    queued: "var(--text-muted)",
    running: "var(--accent-cyan)",
    done: "var(--accent-green)",
    flagged: "var(--accent-orange)",
  };

  const agentStatusIcon = { queued: "○", running: "⟳", done: "✓", flagged: "⚠" };

  const displayedAgents = AGENTS.map(a => ({
    ...a,
    status: !analysisComplete && !isAnalyzing ? ("queued" as const)
      : agentProgress < 100 && ["testing", "security"].includes(a.id) ? ("running" as const)
      : analysisComplete ? a.status
      : ("running" as const),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Incident Forensic Header */}
      <div className="glass-card" style={{ padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "4px", height: "100%",
          background: "linear-gradient(180deg, #38bdf8 0%, #a855f7 100%)",
        }} />

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="badge badge-critical" style={{ fontSize: "10px", letterSpacing: "0.06em" }}>
                {incident.id}
              </span>
              <span className="badge badge-cyan" style={{ fontSize: "10px" }}>
                PARALLEL TRIAGE ACTIVE
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                🏥 St. Jude Emergency Department
              </span>
            </div>

            <h2 style={{
              fontSize: "19px", fontWeight: 800, marginBottom: "6px", color: "#ffffff",
              fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em",
            }}>
              {incident.title}
            </h2>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "780px", lineHeight: 1.6 }}>
              {incident.description}
            </p>
          </div>

          {/* High-Tech Circular Progress Ring */}
          <div style={{
            textAlign: "center", flexShrink: 0,
            background: "rgba(0, 0, 0, 0.3)", padding: "14px 20px", borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}>
            <div style={{ position: "relative", width: "84px", height: "84px", margin: "0 auto 8px" }}>
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r="34" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none"/>
                <circle
                  cx="42" cy="42" r="34"
                  stroke={analysisComplete ? "#34d399" : "#38bdf8"}
                  strokeWidth="8" fill="none"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - agentProgress / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 42 42)"
                  style={{
                    transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    filter: analysisComplete ? "drop-shadow(0 0 8px rgba(52, 211, 153, 0.5))" : "drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))",
                  }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "18px", fontWeight: 900, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {agentProgress}%
                </span>
                <span style={{ fontSize: "8px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  TRIAGE
                </span>
              </div>
            </div>
            <div style={{
              fontSize: "10px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              color: analysisComplete ? "#34d399" : isAnalyzing ? "#38bdf8" : "var(--text-muted)",
              letterSpacing: "0.04em",
            }}>
              {analysisComplete ? "ALL AGENTS CONVERGED" : isAnalyzing ? "5 AGENTS SCANNING" : "STANDBY"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "24px" }}>
        {/* Left: Parallel Agents & Root Cause */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Parallel Agent Cards */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🤖</span>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Parallel Specialist Subagents
                  </h3>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  IBM Bob 2.0 subagent mesh inspecting AST, call graphs, schemas, and PHI paths
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {analysisComplete && <span className="badge badge-ok" style={{ fontSize: "10px" }}>5/5 Completed · 22s</span>}
                {isAnalyzing && <span className="badge badge-cyan" style={{ fontSize: "10px" }}>Active Parallel Scan</span>}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {displayedAgents.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  style={{
                    borderRadius: "10px", overflow: "hidden", cursor: "pointer",
                    border: `1px solid ${selectedAgent === agent.id ? agent.color : "var(--border)"}`,
                    background: selectedAgent === agent.id ? `${agent.color}10` : "rgba(255,255,255,0.02)",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Agent Header */}
                  <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: `${agent.color}18`, border: `1px solid ${agent.color}44`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px",
                      }}>
                        {agent.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{agent.name}</span>
                          <span style={{
                            fontSize: "10px", fontWeight: 700,
                            color: agentStatusColor[agent.status],
                          }}>
                            {agentStatusIcon[agent.status]}
                          </span>
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{agent.domain}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {agent.status === "flagged" && (
                        <span className="badge badge-high" style={{ fontSize: "9px" }}>⚠ Flagged</span>
                      )}
                      {(agent.status === "done" || agent.status === "flagged") && (
                        <span className="mono" style={{ fontSize: "10px", color: "var(--accent-green)" }}>{agent.latency}</span>
                      )}
                      {agent.status === "running" && (
                        <span className="badge badge-medium" style={{ fontSize: "9px" }}>Running...</span>
                      )}
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {selectedAgent === agent.id ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Agent Findings Accordion */}
                  {selectedAgent === agent.id && (
                    <div style={{ borderTop: `1px solid ${agent.color}25`, padding: "14px 16px", background: "rgba(0,0,0,0.2)" }}>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: agent.color, textTransform: "uppercase", marginBottom: "6px" }}>
                          {agent.findings.length} Findings:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          {agent.findings.map((f, i) => (
                            <div key={i} style={{ display: "flex", gap: "6px", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                              <span style={{ color: agent.color, flexShrink: 0 }}>›</span>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                          Code Evidence:
                        </div>
                        {agent.evidence.map((ev, i) => (
                          <div key={i} style={{
                            background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "6px",
                            border: "1px solid rgba(56,139,253,0.15)", marginBottom: "5px",
                          }}>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "3px" }}>
                              <span className="mono" style={{ fontSize: "10px", color: agent.color }}>{ev.file}</span>
                              <span className="mono" style={{ fontSize: "9px", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "1px 4px", borderRadius: "3px" }}>{ev.line}</span>
                            </div>
                            <code style={{ fontSize: "10px", color: "var(--text-secondary)", display: "block", fontFamily: "'JetBrains Mono', monospace" }}>
                              {ev.detail}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Standby Swarm Launcher Card */}
          {!analysisComplete && !isAnalyzing && (
            <div className="glass-card animate-slide-up" style={{
              padding: "28px",
              textAlign: "center",
              border: "1px dashed rgba(56, 189, 248, 0.4)",
              background: "linear-gradient(135deg, rgba(8, 20, 42, 0.7) 0%, rgba(6, 12, 26, 0.85) 100%)",
              boxShadow: "0 12px 35px rgba(0,0,0,0.5)",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "14px", margin: "0 auto 12px",
                background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
              }}>
                🤖
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", marginBottom: "6px", fontFamily: "'Space Grotesk', sans-serif" }}>
                5 Specialist Subagents In Standby
              </h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto 18px", lineHeight: 1.6 }}>
                Dispatch the parallel subagent swarm across Backend AST, Frontend React UI, Postgres Schema, Vitest Coverage, and HIPAA §164.312 PHI boundaries.
              </p>
              {onTriggerScan && (
                <button
                  className="btn-primary"
                  onClick={onTriggerScan}
                  style={{
                    fontSize: "13px", padding: "11px 26px", fontWeight: 700,
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    boxShadow: "0 0 25px rgba(56, 189, 248, 0.3)",
                  }}
                >
                  <span>🚀</span>
                  <span>Launch 5-Agent Parallel Swarm</span>
                </button>
              )}
            </div>
          )}

          {/* Root Cause Forensic Verdict Card */}
          {analysisComplete && (
            <div className="glass-card animate-slide-up" style={{
              padding: "26px",
              borderColor: "rgba(16, 185, 129, 0.4)",
              background: "linear-gradient(180deg, rgba(8, 22, 42, 0.9) 0%, rgba(5, 14, 28, 0.95) 100%)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.12)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.14)", border: "1px solid rgba(16, 185, 129, 0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                  }}>
                    🎯
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                      Root Cause Isolated & Synthesized
                    </h3>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Triangulated from 5 specialist agent findings in 22 seconds
                    </p>
                  </div>
                </div>

                {/* Circular Confidence Gauge */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.3)", padding: "6px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ position: "relative", width: "46px", height: "46px" }}>
                    <svg width="46" height="46" viewBox="0 0 46 46">
                      <circle cx="23" cy="23" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none"/>
                      <circle cx="23" cy="23" r="18" stroke="#10b981" strokeWidth="5" fill="none"
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - ROOT_CAUSE.confidence / 100)}
                        strokeLinecap="round" transform="rotate(-90 23 23)"
                        style={{ filter: "drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 900, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {ROOT_CAUSE.confidence}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#34d399", fontFamily: "'JetBrains Mono', monospace" }}>HIGH CONFIDENCE</div>
                    <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>Evidence Verified</div>
                  </div>
                </div>
              </div>

              {/* Title & Evidence */}
              <div style={{
                fontWeight: 800, fontSize: "15px", color: "#38bdf8", marginBottom: "10px",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {ROOT_CAUSE.title}
              </div>
              
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "16px" }}>
                {ROOT_CAUSE.evidence}
              </p>

              {/* Visual Triangulation Graph */}
              <div style={{
                background: "rgba(0, 0, 0, 0.35)", borderRadius: "12px", padding: "12px 16px",
                border: "1px solid rgba(255, 255, 255, 0.06)", marginBottom: "16px",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace" }}>
                  CALL CHAIN TRIANGULATION:
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ padding: "3px 8px", borderRadius: "5px", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                    EmergencyDashboard.jsx
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>➔</span>
                  <span style={{ padding: "3px 8px", borderRadius: "5px", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                    /api/ed/wait-time
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>➔</span>
                  <span style={{ padding: "3px 8px", borderRadius: "5px", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                    WaitTimeController.js:47
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>➔</span>
                  <span style={{ padding: "3px 10px", borderRadius: "5px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.4)", fontWeight: 700 }}>
                    QueueService.js:112 (ROOT BUG ⚠️)
                  </span>
                </div>
              </div>

              {/* Metadata chips */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                <div style={{ padding: "6px 12px", background: "rgba(56, 189, 248, 0.08)", borderRadius: "8px", border: "1px solid rgba(56, 189, 248, 0.2)", fontSize: "11.5px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Root File: </span>
                  <span className="mono" style={{ color: "#38bdf8", fontWeight: 700 }}>{ROOT_CAUSE.rootFile} {ROOT_CAUSE.rootLine}</span>
                </div>
                <div style={{ padding: "6px 12px", background: "rgba(234, 179, 8, 0.08)", borderRadius: "8px", border: "1px solid rgba(234, 179, 8, 0.2)", fontSize: "11.5px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Regression Risk: </span>
                  <span style={{ color: "#fbbf24", fontWeight: 600 }}>{ROOT_CAUSE.regressionRisk}</span>
                </div>
              </div>

              {/* Action buttons */}
              {!planApproved ? (
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => { setPlanApproved(true); }}
                      className="btn-primary"
                      style={{ flex: 1, fontSize: "13px", height: "44px" }}
                    >
                      ✓ Approve Investigation & Generate Patch
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={handleRequestDeepTrace}
                      disabled={isDeepTracing}
                      style={{
                        fontSize: "12px", padding: "10px 18px",
                        borderColor: deepTraceActive ? "rgba(52, 211, 153, 0.4)" : undefined,
                        color: deepTraceActive ? "#34d399" : undefined,
                        background: deepTraceActive ? "rgba(52, 211, 153, 0.08)" : undefined,
                        display: "inline-flex", alignItems: "center", gap: "6px",
                      }}
                    >
                      {isDeepTracing ? (
                        <>
                          <span style={{ animation: "spin 1s linear infinite" }}>⟳</span>
                          <span>Probing eBPF Trace...</span>
                        </>
                      ) : deepTraceActive ? (
                        <>
                          <span>✓</span>
                          <span>Deep Trace Attached (+4 Spans)</span>
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          <span>Request Deep Trace</span>
                        </>
                      )}
                    </button>
                  </div>

                  {deepTraceActive && (
                    <div className="animate-fade-in" style={{
                      padding: "12px 14px", background: "rgba(5, 14, 28, 0.9)",
                      border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "10px",
                      fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#38bdf8", fontWeight: 700, marginBottom: "8px" }}>
                        <span>⚡ EBPF KERNEL TELEMETRY SPANS</span>
                        <span style={{ color: "#34d399" }}>PROBE ID: #0x8F-LIVE</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                          <span>1. ingress · GET /api/ed/wait-time</span>
                          <span style={{ color: "#38bdf8" }}>14.2ms · HTTP 200</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                          <span>2. WaitTimeController.js:47 · computeWaitMinutes()</span>
                          <span style={{ color: "#38bdf8" }}>2.3ms · frame #1</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                          <span>3. QueueService.js:112 · getQueueDepth() [OVERRUN]</span>
                          <span style={{ color: "#f87171" }}>8.4ms · 18 ghost slots</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                          <span>4. db:knex · SELECT * FROM appointment_slots</span>
                          <span style={{ color: "#fbbf24" }}>4.1ms · 24 rows</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div style={{
                    padding: "10px 14px", background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.35)", borderRadius: "10px",
                    fontSize: "12px", color: "#34d399", marginBottom: "12px",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <span>✓</span>
                    <span>Investigation verified by lead engineer. Ready for code diff and automated test suite.</span>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={onProceedToFix}
                    style={{ width: "100%", fontSize: "13.5px", height: "46px" }}
                  >
                    ⚡ View Fix Plan & Synthesized Test Suite →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Bob Reasoning Terminal + Impact Map */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Bob Reasoning Terminal */}
          <div className="terminal-block" style={{ padding: "20px", background: "rgba(4, 8, 16, 0.95)", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>🤖</span>
                <h4 style={{ fontSize: "12.5px", fontWeight: 700, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                  IBM Bob 2.0 — Live Reasoning Stream
                </h4>
              </div>
              {isAnalyzing && (
                <span style={{ fontSize: "10px", color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace" }}>
                  ● Streaming AST Tokens
                </span>
              )}
            </div>

            <div
              ref={logRef}
              style={{ maxHeight: "290px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "7px", paddingRight: "4px" }}
            >
              {logLines.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px", padding: "30px 0" }}>
                  Subagent reasoning will stream live once investigation is initiated…
                </div>
              )}
              {logLines.filter(Boolean).map((line, i) => (
                <div key={i} className="animate-fade-in" style={{ display: "flex", gap: "8px", fontSize: "11px", lineHeight: 1.5 }}>
                  <span className="mono" style={{ color: "rgba(56, 189, 248, 0.6)", flexShrink: 0 }}>[{line?.t || "00:00"}]</span>
                  <span style={{ color: i === logLines.length - 1 ? "#38bdf8" : "var(--text-secondary)" }}>
                    {line?.text || ""}
                  </span>
                </div>
              ))}
              {(isAnalyzing && logLines.length > 0) && (
                <div style={{ display: "flex", gap: "5px", padding: "4px 0", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace" }}>bob_subagent&gt;</span>
                  <span style={{ animation: "blink-cursor 0.8s infinite", color: "#38bdf8" }}>█</span>
                </div>
              )}
            </div>
          </div>

          {/* Affected Module Map */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <h4 style={{
              fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              CODEBASE IMPACT GRAPH
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {[
                { file: "QueueService.js", type: "Service", impact: "ROOT CAUSE", color: "#f87171", badge: "badge-critical" },
                { file: "WaitTimeController.js", type: "Controller", impact: "Affected", color: "#fbbf24", badge: "badge-high" },
                { file: "/api/ed/wait-time", type: "Endpoint", impact: "Affected", color: "#fbbf24", badge: "badge-high" },
                { file: "EmergencyDashboard.jsx", type: "React UI", impact: "Downstream", color: "#38bdf8", badge: "badge-medium" },
                { file: "patient_queue table", type: "Postgres DB", impact: "Fix Target", color: "#34d399", badge: "badge-ok" },
                { file: "QueueService.test.js", type: "Jest Suite", impact: "DELETED (Gap)", color: "#f87171", badge: "badge-critical" },
              ].map(m => (
                <div key={m.file} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", background: "rgba(0,0,0,0.25)", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <span className="mono" style={{ fontSize: "11px", color: m.color, fontWeight: 600 }}>
                    {m.file}
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "9.5px", color: "var(--text-muted)" }}>{m.type}</span>
                    <span className={`badge ${m.badge}`} style={{ fontSize: "8.5px", padding: "1px 6px" }}>{m.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PHI & Clinical Safety Callout */}
          {analysisComplete && (
            <div className="glass-card animate-fade-in" style={{
              padding: "18px",
              background: "rgba(234, 179, 8, 0.05)",
              borderColor: "rgba(234, 179, 8, 0.3)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>🔒</span>
                <h4 style={{ fontSize: "12.5px", fontWeight: 700, color: "#fbbf24", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Clinical PHI Exposure Flagged
                </h4>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "10px" }}>
                Security agent flagged <strong style={{ color: "#fbbf24" }}>1 PHI exposure violation</strong> in QueueService.js:98 — patient_id logged in debug error path. Automatically staged for removal in Fix Workspace.
              </div>
              <span className="mono" style={{
                fontSize: "10px", color: "#f87171", background: "rgba(239, 68, 68, 0.1)",
                padding: "4px 8px", borderRadius: "5px", border: "1px solid rgba(239, 68, 68, 0.25)",
                display: "inline-block",
              }}>
                QueueService.js L:98 · console.error('Queue error for patient:', patientId)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
