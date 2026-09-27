"use client";

import { useState } from "react";
import { Incident } from "@/lib/types";

interface VerificationPanelProps {
  incident: Incident;
  onProceedToRelease: () => void;
}

interface ReviewItem {
  id: string;
  category: "Correctness" | "Maintainability" | "Security" | "Regression" | "PHI Safety" | "Role / Access" | "Audit Logging" | "Clinical Workflow" | "Integration Impact";
  check: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  fileRef?: string;
  remediation?: string;
  codeSnippet?: string;
}

const CODE_REVIEW_ITEMS: ReviewItem[] = [
  {
    id: "CR-01", category: "Correctness",
    check: "Logic change directly addresses root cause",
    status: "pass",
    detail: "getQueueDepth() now queries patient_queue.status = 'active' instead of deprecated scheduled_slots table. Resolves false 0/stale wait times. Confidence: 94%.",
    fileRef: "QueueService.js L:109-114",
    codeSnippet: "const activeCount = await db('patient_queue')\n  .where({ department_id: deptId, status: 'active' })\n  .count('* as count');",
  },
  {
    id: "CR-02", category: "Correctness",
    check: "No silent data type coercion or NaN returns",
    status: "pass",
    detail: "DB query returns integer count. Previous code returned Array.length — same integer type, guaranteeing zero downstream NaN/undefined cast breaks in UI widgets.",
    fileRef: "QueueService.js L:112",
    codeSnippet: "return parseInt(activeCount[0].count, 10);",
  },
  {
    id: "CR-03", category: "Maintainability",
    check: "Deprecated slot-based path fully decoupled",
    status: "pass",
    detail: "Legacy appointment-slot querying logic has been safely removed with an explicit deprecation tombstone comment. Zero dead code paths remain.",
    fileRef: "QueueService.js L:106",
  },
  {
    id: "CR-04", category: "Maintainability",
    check: "Async/await promise handling in callers",
    status: "warn",
    detail: "getQueueDepth() is now async (returns Promise). Caller in WaitTimeController.js does not await the return before sending response, which could trigger a race condition under spike load.",
    fileRef: "WaitTimeController.js L:47",
    remediation: "Add 'await' before QueueService.getQueueDepth(deptId) or chain with .then() handler.",
    codeSnippet: "// In WaitTimeController.js L:47\n- const depth = QueueService.getQueueDepth(deptId);\n+ const depth = await QueueService.getQueueDepth(deptId);",
  },
  {
    id: "CR-05", category: "Security",
    check: "PHI removed from runtime error logger",
    status: "pass",
    detail: "Raw patient_id stripped from console.error in handleQueueError(). Operational error message retained with sanitized trace ID for triage without violating HIPAA §164.312.",
    fileRef: "QueueService.js L:98",
    codeSnippet: "- console.error(`[Queue Error] Patient ${patient.id} failed queue sync`, err);\n+ console.error(`[Queue Error] [traceId=${traceId}] Queue sync failed`, err.message);",
  },
  {
    id: "CR-06", category: "Security",
    check: "SQL injection immunity in revised query",
    status: "pass",
    detail: "Parameterized Knex.js query builder employed — zero string concatenation. Database driver escapes 'active' and department ID parameters automatically.",
    fileRef: "QueueService.js L:110",
  },
  {
    id: "CR-07", category: "Regression",
    check: "AST scan verifies all downstream callers",
    status: "pass",
    detail: "AST analyzer scanned all 14 hospital services. Exactly 2 callers invoke getQueueDepth(). Both consume numeric values — 100% compatible with patched contract.",
    fileRef: "WaitTimeController.js, TriageAnalytics.js",
  },
];

const HEALTHCARE_CHECKS: ReviewItem[] = [
  {
    id: "HC-01", category: "PHI Safety",
    check: "Zero patient identifiers exposed in log stream",
    status: "pass",
    detail: "QueueService.js L:98 patient_id purged from error logs. Regex AST inspection confirms 0 occurrences of MRN, SSN, DOB, or patient names across the entire patch.",
    fileRef: "QueueService.js L:98",
  },
  {
    id: "HC-02", category: "PHI Safety",
    check: "Wait-time API payload conforms to de-identification",
    status: "pass",
    detail: "/api/ed/wait-time returns solely { waitMinutes: number, queueDepth: number }. No patient metadata or clinical classifications exist in the response schema.",
    fileRef: "/api/ed/wait-time response schema",
  },
  {
    id: "HC-03", category: "Role / Access",
    check: "Role-based access boundaries strictly preserved",
    status: "pass",
    detail: "JWT role guard ('ED_STAFF', 'CHIEF_NURSE', 'ADMIN') protecting /api/ed/wait-time remains untouched. Fix modifies service-layer aggregation only.",
    fileRef: "routes/ed.js L:22",
  },
  {
    id: "HC-04", category: "Audit Logging",
    check: "Clinical operational reads audit trail hook",
    status: "warn",
    detail: "Emergency wait-time reads currently lack an audit log event. While not a strict HIPAA breach, clinical ops compliance standard recommends logging queue queries during surge hours.",
    fileRef: "QueueService.js L:115",
    remediation: "Inject telemetryHook.logOpsEvent('ED_QUEUE_READ', { deptId, depth, timestamp: Date.now() }) post-query.",
  },
  {
    id: "HC-05", category: "Clinical Workflow",
    check: "Zero alteration to clinical triage acuity scoring",
    status: "pass",
    detail: "The bug fix affects display telemetry only. Emergency Severity Index (ESI 1-5), MediSentinel AI neural scoring, and trauma alert triggers are 100% isolated.",
    fileRef: "triage/MediSentinelEngine.js (Isolated)",
  },
  {
    id: "HC-06", category: "Integration Impact",
    check: "Cross-service hospital dependency containment",
    status: "pass",
    detail: "Architectural dependency graph confirms EmergencyDashboard.jsx is the sole direct consumer. Pharmacy Dispensing, Inpatient Beds, Lab Orders, and Billing are fully decoupled.",
    fileRef: "Dependency Graph: 1 Consumer / 5 Decoupled",
  },
];

const HOSPITAL_MODULES = [
  { module: "Emergency Triage Queue", status: "Fixed & Verified", color: "#34d399", icon: "✓", desc: "Active patient count and wait time calculation now accurate.", risk: "Fixed", tier: "emerald" },
  { module: "Nurse Station Display", status: "Sync Restored", color: "#34d399", icon: "✓", desc: "Live dashboard refreshed every 30s with correct depth.", risk: "Fixed", tier: "emerald" },
  { module: "MediSentinel AI Triage", status: "Isolated / Zero Risk", color: "#38bdf8", icon: "🛡️", desc: "Acuity classification and vitals evaluation unaffected.", risk: "Safe", tier: "cyan" },
  { module: "Pharmacy Dispensing", status: "Decoupled / Safe", color: "#94a3b8", icon: "○", desc: "Rx queue relies on e-prescribe gateway, not QueueService.", risk: "Safe", tier: "slate" },
  { module: "Billing & Invoicing", status: "Decoupled / Safe", color: "#94a3b8", icon: "○", desc: "Charge capture relies on patient encounter close events.", risk: "Safe", tier: "slate" },
  { module: "Lab Results Pipeline", status: "Decoupled / Safe", color: "#94a3b8", icon: "○", desc: "HL7/FHIR observation feeds bypass ED wait-time service.", risk: "Safe", tier: "slate" },
];

export default function VerificationPanel({ incident, onProceedToRelease }: VerificationPanelProps) {
  const [activeTab, setActiveTab] = useState<"review" | "healthcare">("review");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ReviewItem>(CODE_REVIEW_ITEMS[0]);
  const [simulating, setSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState<Record<string, boolean>>({});

  const allItems = activeTab === "review" ? CODE_REVIEW_ITEMS : HEALTHCARE_CHECKS;

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      item.check.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["ALL", ...Array.from(new Set(allItems.map(i => i.category)))];

  const totalPassed = allItems.filter(i => i.status === "pass").length;
  const totalWarned = allItems.filter(i => i.status === "warn").length;
  const totalFailed = allItems.filter(i => i.status === "fail").length;

  const handleSimulate = () => {
    setSimulating(true);
    setSimLogs([]);
    const steps = [
      "🔄 Initializing IBM Bob 2.0 Independent Review Agent [Sandbox Isolated]...",
      "📦 Ingesting change set: 2 modified files, 1 new test file (QueueService.test.js)...",
      "🔍 [Correctness] Tracing AST call chain: EmergencyDashboard ➔ /api/ed/wait-time ➔ QueueService... OK",
      "⚠️ [Correctness] Async/await audit: WaitTimeController.js L:47 — missing await detected (Non-blocking)",
      "🔒 [PHI Safety] Executing HIPAA §164.312 regex audit for patient_id, SSN, DOB, MRN... CLEAN (0 leaks)",
      "🛡️ [Security] SQL Injection analysis: Parameterized query validation on Knex query... IMMUNE",
      "🔬 [AST Callers] Cross-referencing 14 modules for getQueueDepth() consumers... 2 found, both compatible",
      "⚠️ [Audit Logging] Queue read ops event absent in QueueService.js — recommendation logged",
      "🏥 [Clinical Safety] Zero mutation detected in MediSentinel AI Acuity scoring or triage paths... SAFE",
      "✅ Independent review complete: 11 PASS · 2 WARN · 0 FAIL. Ready for Release Gate signoff.",
    ];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, s]);
        if (i === steps.length - 1) setSimulating(false);
      }, (i + 1) * 360);
    });
  };

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedWarnings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">

      {/* ── Control Center Header ── */}
      <div className="glass-card" style={{
        padding: "24px 28px",
        background: "linear-gradient(135deg, rgba(8, 20, 42, 0.85) 0%, rgba(6, 12, 24, 0.95) 100%)",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 30px rgba(56, 189, 248, 0.08)",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(56, 189, 248, 0.25))",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
              }}>
                🛡️
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
                AI Code Review & Healthcare Safety Gate
              </h2>
              <span className="badge badge-purple" style={{ fontSize: "10px" }}>
                Independent Review Agent · Isolated Swarm
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              A decoupled Bob 2.0 reviewer agent validates the fix against clinical invariants, HIPAA §164.312 PHI sanitization, AST caller compatibility, and emergency hospital triage safety — completely separate from the generator agent.
            </p>
          </div>

          {/* Dual Score Rings */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            {[
              {
                title: "Code Review",
                pass: CODE_REVIEW_ITEMS.filter(i => i.status === "pass").length,
                total: CODE_REVIEW_ITEMS.length,
                color: "#38bdf8",
                icon: "🔍",
              },
              {
                title: "Clinical Safety",
                pass: HEALTHCARE_CHECKS.filter(i => i.status === "pass").length,
                total: HEALTHCARE_CHECKS.length,
                color: "#34d399",
                icon: "🏥",
              },
            ].map(ring => {
              const pct = Math.round((ring.pass / ring.total) * 100);
              const r = 28;
              const circ = 2 * Math.PI * r;
              const offset = circ * (1 - ring.pass / ring.total);
              return (
                <div key={ring.title} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "10px 14px", borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}>
                  <div style={{ position: "relative", width: "68px", height: "68px", margin: "0 auto 6px" }}>
                    <svg width="68" height="68" viewBox="0 0 68 68">
                      <circle cx="34" cy="34" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                      <circle
                        cx="34" cy="34" r={r} stroke={ring.color} strokeWidth="6" fill="none"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 34 34)"
                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
                      />
                    </svg>
                    <div style={{
                      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "14px", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: ring.color }}>
                        {ring.pass}/{ring.total}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}>{ring.title}</div>
                  <div style={{ fontSize: "9.5px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{pct}% Cleared</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "20px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.06)",
          flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={handleSimulate}
              disabled={simulating}
              style={{ fontSize: "12.5px", padding: "9px 18px", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <span>{simulating ? "⏳" : "⚖️"}</span>
              <span>{simulating ? "Running Agent Audit..." : "Run Live Review Audit"}</span>
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "4px 12px", borderRadius: "8px",
              background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.25)",
              fontSize: "11px", color: "#34d399", fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>🛡️ HIPAA §164.312 Verified</span>
              <span>·</span>
              <span>0 Critical Blockers</span>
            </div>
          </div>

          <button
            className="btn-ghost"
            onClick={onProceedToRelease}
            style={{
              fontSize: "12.5px", padding: "9px 18px",
              display: "inline-flex", alignItems: "center", gap: "6px",
              borderColor: "rgba(56, 189, 248, 0.4)", color: "var(--accent-cyan)",
            }}
          >
            <span>Proceed to Release Gate</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* ── Live Simulation Terminal ── */}
      {simLogs.length > 0 && (
        <div className="glass-card animate-slide-up" style={{
          padding: "18px 22px", background: "#030914",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge badge-cyan" style={{ fontSize: "9px" }}>AGENT STREAMS</span>
              <strong style={{ fontSize: "12.5px", fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}>
                IBM Bob 2.0 — Independent Safety Subagent
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {simulating && (
                <span style={{ fontSize: "11px", color: "#38bdf8", fontFamily: "'JetBrains Mono', monospace", animation: "glow-pulse 1.5s infinite" }}>
                  ● SCANNING IN PROGRESS
                </span>
              )}
              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                {simLogs.length} / 10 telemetry events
              </span>
            </div>
          </div>

          <div className="mono" style={{
            fontSize: "11.5px", display: "flex", flexDirection: "column", gap: "5px",
            maxHeight: "180px", overflowY: "auto", paddingRight: "6px",
          }}>
            {simLogs.map((log, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: "8px", alignItems: "flex-start",
                  color: log.includes("⚠️")
                    ? "#fbbf24"
                    : log.includes("✅")
                      ? "#34d399"
                      : log.includes("🔒") || log.includes("🛡️")
                        ? "#c084fc"
                        : "#38bdf8",
                }}
              >
                <span style={{ color: "var(--text-muted)", opacity: 0.6 }}>›</span>
                <span>{log}</span>
              </div>
            ))}
            {simulating && (
              <div style={{ color: "var(--text-muted)", animation: "blink-cursor 0.8s infinite" }}>
                › _ analyzing AST safety boundaries...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sub-tab Switcher & Filter Controls ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "14px",
      }}>
        {/* Review vs Healthcare Tab Switcher */}
        <div style={{
          display: "inline-flex", padding: "4px", borderRadius: "12px",
          background: "rgba(7, 14, 28, 0.8)", border: "1px solid rgba(56, 189, 248, 0.15)",
        }}>
          {[
            { id: "review" as const, label: "Code Review Checks", icon: "🔍", count: CODE_REVIEW_ITEMS.length, sub: "Logic & AST" },
            { id: "healthcare" as const, label: "Healthcare Safety Checks", icon: "🏥", count: HEALTHCARE_CHECKS.length, sub: "HIPAA & Triage" },
          ].map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setSelectedCategory("ALL");
                  setSelectedItem(t.id === "review" ? CODE_REVIEW_ITEMS[0] : HEALTHCARE_CHECKS[0]);
                }}
                style={{
                  padding: "8px 18px", border: "none", borderRadius: "8px",
                  background: isActive ? "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.15))" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer", fontSize: "12.5px", fontWeight: isActive ? 700 : 500,
                  display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s",
                  borderBottom: isActive ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid transparent",
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "6px",
                  background: isActive ? "rgba(56, 189, 248, 0.25)" : "rgba(255,255,255,0.06)",
                  color: isActive ? "#38bdf8" : "var(--text-muted)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            position: "relative", display: "flex", alignItems: "center",
          }}>
            <span style={{ position: "absolute", left: "10px", fontSize: "12px", color: "var(--text-muted)" }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter checks..."
              style={{
                background: "rgba(10, 20, 38, 0.7)", border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "8px", padding: "6px 12px 6px 30px", fontSize: "12px",
                color: "var(--text-primary)", outline: "none", width: "180px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <span className="badge badge-ok" style={{ fontSize: "9px" }}>{totalPassed} PASS</span>
            {totalWarned > 0 && <span className="badge badge-high" style={{ fontSize: "9px" }}>{totalWarned} WARN</span>}
            {totalFailed > 0 && <span className="badge badge-critical" style={{ fontSize: "9px" }}>{totalFailed} FAIL</span>}
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "4px 12px", borderRadius: "6px", border: "1px solid",
              borderColor: selectedCategory === cat ? "rgba(56, 189, 248, 0.4)" : "rgba(255,255,255,0.06)",
              background: selectedCategory === cat ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.02)",
              color: selectedCategory === cat ? "var(--accent-cyan)" : "var(--text-muted)",
              fontSize: "11px", fontWeight: selectedCategory === cat ? 700 : 500,
              cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.15s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Main Two-Column Review Layout ── */}
      <div className="responsive-review-grid" style={{ alignItems: "start" }}>

        {/* LEFT: Check Items List */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              INSPECTION CHECKS ({filteredItems.length})
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
              Click to view inspector details
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                No checks matching "{searchQuery}"
              </div>
              <div style={{ fontSize: "11px", marginBottom: "16px" }}>
                Try adjusting your search terms or category filter.
              </div>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("ALL"); }}
                className="btn-ghost"
                style={{ fontSize: "11.5px", padding: "6px 14px", margin: "0 auto" }}
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredItems.map(item => {
              const isSelected = selectedItem?.id === item.id;
              const isAcknowledged = acknowledgedWarnings[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(30, 58, 138, 0.18) 100%)"
                      : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.45)" : "rgba(255, 255, 255, 0.05)"}`,
                    boxShadow: isSelected ? "0 4px 20px rgba(56, 189, 248, 0.12)" : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    transform: isSelected ? "translateX(4px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "5px", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "9.5px", fontWeight: 700, color: "var(--text-muted)",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {item.id}
                        </span>
                        <span style={{
                          fontSize: "9.5px", fontWeight: 700,
                          padding: "1px 6px", borderRadius: "4px",
                          background: "rgba(168, 85, 247, 0.12)", color: "#c084fc",
                          border: "1px solid rgba(168, 85, 247, 0.25)",
                        }}>
                          {item.category}
                        </span>
                        {item.fileRef && (
                          <span style={{
                            fontSize: "9.5px", color: "#38bdf8",
                            fontFamily: "'JetBrains Mono', monospace",
                            background: "rgba(56, 189, 248, 0.08)",
                            padding: "1px 6px", borderRadius: "4px",
                          }}>
                            {item.fileRef.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {item.check}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      {item.status === "pass" ? (
                        <span className="badge badge-ok" style={{ fontSize: "9px" }}>
                          ✓ PASS
                        </span>
                      ) : item.status === "warn" ? (
                        <span className="badge badge-high" style={{ fontSize: "9px" }}>
                          {isAcknowledged ? "✓ ACKED" : "⚠️ WARN"}
                        </span>
                      ) : (
                        <span className="badge badge-critical" style={{ fontSize: "9px" }}>
                          ✕ FAIL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: Selected Item Inspector + Clinical Regression Ward Map */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Inspector Card */}
          <div className="glass-card animate-fade-in" style={{
            padding: "22px",
            background: "linear-gradient(135deg, rgba(8, 18, 38, 0.9) 0%, rgba(5, 12, 26, 0.95) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
          }} key={selectedItem.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-purple" style={{ fontSize: "10px" }}>{selectedItem.category}</span>
                <span className="mono" style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{selectedItem.id}</span>
              </div>
              <div>
                {selectedItem.status === "pass" ? (
                  <span className="badge badge-ok">PASS</span>
                ) : (
                  <span className="badge badge-high">WARNING (NON-BLOCKING)</span>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", lineHeight: 1.35, color: "var(--text-primary)" }}>
              {selectedItem.check}
            </h3>

            <div style={{
              background: "rgba(0, 0, 0, 0.35)", padding: "14px", borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "12.5px",
              color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "14px",
            }}>
              {selectedItem.detail}
            </div>

            {selectedItem.fileRef && (
              <div style={{
                marginBottom: "14px", padding: "8px 12px", borderRadius: "8px",
                background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontFamily: "'JetBrains Mono', monospace" }}>
                  📍 {selectedItem.fileRef}
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                  AST Ref
                </span>
              </div>
            )}

            {selectedItem.codeSnippet && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
                  INSPECTION CONTEXT / PATCH:
                </div>
                <div style={{
                  background: "#030814", padding: "10px 12px", borderRadius: "8px",
                  border: "1px solid rgba(56, 189, 248, 0.2)", fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px", color: "#e2e8f0", lineHeight: 1.5, overflowX: "auto", whiteSpace: "pre",
                }}>
                  {selectedItem.codeSnippet}
                </div>
              </div>
            )}

            {selectedItem.remediation && (
              <div style={{
                padding: "12px 14px", borderRadius: "10px",
                background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.25)",
                marginBottom: "14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", color: "#fbbf24", fontSize: "11.5px", fontWeight: 700 }}>
                  <span>💡</span>
                  <span>AI Remediation Recommendation:</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {selectedItem.remediation}
                </div>
              </div>
            )}

            {selectedItem.status === "warn" && (
              <button
                onClick={() => toggleAcknowledge(selectedItem.id)}
                style={{
                  width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid",
                  borderColor: acknowledgedWarnings[selectedItem.id] ? "rgba(52, 211, 153, 0.4)" : "rgba(251, 191, 36, 0.4)",
                  background: acknowledgedWarnings[selectedItem.id] ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 191, 36, 0.12)",
                  color: acknowledgedWarnings[selectedItem.id] ? "#34d399" : "#fbbf24",
                  fontSize: "12px", fontWeight: 700, cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s",
                }}
              >
                {acknowledgedWarnings[selectedItem.id]
                  ? "✓ Warning Acknowledged for Release"
                  : "⚠️ Acknowledge Warning & Proceed"}
              </button>
            )}
          </div>

          {/* Clinical Workflow Regression Blast Radius Map */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🏥</span>
                <h4 style={{ fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Clinical Workflow Blast Radius
                </h4>
              </div>
              <span className="badge badge-ok" style={{ fontSize: "9px" }}>
                0 UNEXPECTED REGRESSIONS
              </span>
            </div>

            <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.4 }}>
              Impact assessment across hospital modules consuming or adjacent to QueueService:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {HOSPITAL_MODULES.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{m.module}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{m.desc}</div>
                  </div>
                  <span style={{
                    fontSize: "10px", fontWeight: 700, color: m.color,
                    padding: "2px 8px", borderRadius: "6px",
                    background: `${m.color}15`, border: `1px solid ${m.color}35`,
                    fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                  }}>
                    {m.icon} {m.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
