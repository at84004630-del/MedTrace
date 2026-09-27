"use client";

import { useState } from "react";
import { Incident } from "@/lib/types";

interface ReleaseGateProps {
  incident: Incident;
  onNewIncident: () => void;
}

interface GateCheck {
  id: string;
  label: string;
  result: "PASS" | "REVIEW" | "FAIL";
  icon: string;
  detail: string;
  color: string;
  category: "Diagnosis" | "Verification" | "Testing" | "Security" | "Clinical";
}

const GATE_CHECKS: GateCheck[] = [
  { id: "GC-01", category: "Diagnosis", label: "Root Cause Triangulated", result: "PASS", icon: "🎯", detail: "QueueService.js querying deprecated slots table — 94% Bayesian confidence", color: "#34d399" },
  { id: "GC-02", category: "Verification", label: "Developer Fix Approval", result: "PASS", icon: "✅", detail: "Developer reviewed and verified AST plan & diff preview", color: "#34d399" },
  { id: "GC-03", category: "Testing", label: "Automated Test Suite", result: "PASS", icon: "🧪", detail: "8/8 auto-generated tests passed · 0 regressions · 98.2% coverage of patched path", color: "#34d399" },
  { id: "GC-04", category: "Verification", label: "Code Review & Static AST", result: "PASS", icon: "🔍", detail: "7/7 code review items verified · Zero silent type coercions or broken signatures", color: "#34d399" },
  { id: "GC-05", category: "Security", label: "HIPAA §164.312 PHI Sanitized", result: "PASS", icon: "🔒", detail: "patient_id purged from error logger L:98 · De-identified response payload", color: "#34d399" },
  { id: "GC-06", category: "Security", label: "RBAC Authorization Intact", result: "PASS", icon: "🛡️", detail: "JWT guard (ED_STAFF, ADMIN) on /api/ed/wait-time strictly preserved", color: "#34d399" },
  { id: "GC-07", category: "Clinical", label: "Triage Invariants Preserved", result: "PASS", icon: "🏥", detail: "MediSentinel AI Acuity scoring and emergency triage decision paths isolated", color: "#34d399" },
  { id: "GC-08", category: "Testing", label: "Async Caller Optimization", result: "REVIEW", icon: "⚠️", detail: "WaitTimeController.js L:47 caller does not await getQueueDepth() — non-blocking for this release", color: "#fbbf24" },
  { id: "GC-09", category: "Security", label: "Queue Read Audit Logging", result: "REVIEW", icon: "⚠️", detail: "Ops audit hook recommended for emergency queue reads — low compliance risk for immediate deploy", color: "#fbbf24" },
];

const BEFORE_METRICS = [
  { label: "Time to root cause (MTTR)", value: "~2.0 hrs", sub: "Manual log grepping + pair debugging" },
  { label: "Code files manually traversed", value: "14 files", sub: "Searched through dead code paths" },
  { label: "Developer context switches", value: "22 steps", sub: "Switching terminals, IDEs, EHR docs" },
  { label: "Unit & regression tests", value: "0 written", sub: "Relied on manual smoke test in staging" },
  { label: "PHI leak detection", value: "Undetected", sub: "patient_id logged in plaintext (L:98)" },
  { label: "Total time to production fix", value: "~6.5 hrs", sub: "Including manual signoff & QA cycle" },
];

const AFTER_METRICS = [
  { label: "Time to root cause (MTTR)", value: "90 sec", sub: "5 concurrent specialist agents · 94% conf", highlight: true },
  { label: "Code files precisely targeted", value: "2 files", sub: "QueueService.js + QueueService.test.js", highlight: true },
  { label: "Developer context switches", value: "3 clicks", sub: "Triage ➔ Approve Diff ➔ Deploy Gate", highlight: true },
  { label: "Unit & regression tests", value: "8 auto-gen", sub: "100% test pass rate in 320ms", highlight: true },
  { label: "PHI leak detection", value: "Auto-Sanitized", sub: "HIPAA agent purged patient_id at L:98", highlight: true },
  { label: "Total time to production fix", value: "~18 min", sub: "AI-orchestrated end-to-end lifecycle", highlight: true },
];

const AUDIT_TRAIL = [
  { ts: "00:00:00", event: "Incident INC-2026-0847 created from Slack triage hook", actor: "Developer", badge: "badge-purple" },
  { ts: "00:00:03", event: "Bob 2.0 parsed st-jude-ehr codebase (270k tokens, 11 modules)", actor: "Bob (Ask)", badge: "badge-cyan" },
  { ts: "00:00:06", event: "5 parallel specialist agents dispatched concurrently", actor: "Bob (Agent)", badge: "badge-cyan" },
  { ts: "00:00:22", event: "All agents finished — AST & dependency graph evidence synthesized", actor: "Bob (Agent)", badge: "badge-cyan" },
  { ts: "00:01:30", event: "Root cause triangulated: QueueService.js (94% confidence)", actor: "Bob (Agent)", badge: "badge-ok" },
  { ts: "00:01:38", event: "Developer verified root-cause diagnosis via interactive UI", actor: "Developer", badge: "badge-purple" },
  { ts: "00:02:00", event: "Patch implementation plan generated — 2 files, 5 atomic steps", actor: "Bob (Plan)", badge: "badge-cyan" },
  { ts: "00:04:30", event: "Developer approved code diff and test suite preview", actor: "Developer", badge: "badge-purple" },
  { ts: "00:04:32", event: "Bob applied atomic patch — QueueService.js updated, PHI removed", actor: "Bob (Agent)", badge: "badge-cyan" },
  { ts: "00:05:50", event: "Test suite synthesized — 8 tests across 3 clinical scenarios", actor: "Bob (Agent)", badge: "badge-cyan" },
  { ts: "00:06:30", event: "Vitest test suite executed — 8/8 PASSED in 320ms", actor: "Bob (Agent)", badge: "badge-ok" },
  { ts: "00:08:00", event: "Independent reviewer agent finished — 5 PASS · 2 WARN · 0 FAIL", actor: "Bob (Agent)", badge: "badge-cyan" },
  { ts: "00:08:10", event: "Healthcare safety checks validated — HIPAA §164.312 cleared", actor: "Bob (Agent)", badge: "badge-ok" },
  { ts: "00:08:30", event: "Release gate evaluated: PASS WITH REVIEW (2 non-blocking warnings)", actor: "Bob (Agent)", badge: "badge-high" },
  { ts: "00:17:45", event: "Cryptographic release seal generated (SHA-256: 7f9a2b8e...3c1)", actor: "MedTrace Core", badge: "badge-cyan" },
];

export default function ReleaseGate({ incident, onNewIncident }: ReleaseGateProps) {
  const [showAudit, setShowAudit] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [released, setReleased] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleDownloadDossier = () => {
    const content = `================================================================================
MEDTRACE ENTERPRISE CLINICAL RELEASE COMPLIANCE DOSSIER
POWERED BY IBM BOB 2.0 ORCHESTRATION PLATFORM
================================================================================

INCIDENT IDENTIFIER:    ${incident.id}
INCIDENT TITLE:         ${incident.title}
GENERATION TIMESTAMP:   ${new Date().toISOString()}
HOSPITAL DEPLOYMENT:    hospital/st-jude-ehr (branch: main)
GATEWAY JURISDICTION:   US-EAST-1 Healthcare Cloud (HIPAA / HITECH Compliant)

--------------------------------------------------------------------------------
1. EXECUTIVE DIAGNOSIS & CAUSE
--------------------------------------------------------------------------------
ROOT CAUSE FILE:        QueueService.js L:112
DIAGNOSIS SUMMARY:      QueueService.getQueueDepth() computed wait times from deprecated
                        appointment_slots instead of live active patient_queue rows.
CONFIDENCE SCORE:       94% Certainty (Triangulated by 5 specialist subagents)
REGRESSION RISK:        Low — isolated to ED wait-time calculation pathway.

--------------------------------------------------------------------------------
2. SURGICAL CODE REMEDIATION & AST INTEGRITY
--------------------------------------------------------------------------------
FILES MODIFIED:         QueueService.js (Knex.js parameterized active query)
NEW TEST FILES:         QueueService.test.js (Unit + regression test suite)
AST SCAN VERDICT:       2 downstream consumers verified compliant (Zero broken contracts)
PHI PURGE AUDIT:        QueueService.js L:98 raw patient_id stripped from error log.

--------------------------------------------------------------------------------
3. AUTOMATED TEST & VERIFICATION SUITE
--------------------------------------------------------------------------------
TOTAL TESTS EXECUTED:   8 tests
PASSED:                 8 / 8 (100% Pass Rate)
REGRESSIONS:            0 regressions detected
EXECUTION DURATION:     66ms

--------------------------------------------------------------------------------
4. HEALTHCARE SAFETY & REGULATORY COMPLIANCE ATTESTATION
--------------------------------------------------------------------------------
HIPAA §164.312 PHI:     PASS — Zero patient identifiers in logs, API or error paths.
HL7 / FHIR STANDARD:    PASS — Conforms to HL7 v2.6 Emergency Care schema.
ROLE-BASED ACCESS (RBAC): PASS — Restricted to authenticated ED_STAFF & CLINICAL_LEAD.
CLINICAL TRIAGE SAFETY: PASS — Emergency Severity Index (ESI 1-5) scoring isolated.

--------------------------------------------------------------------------------
5. CRYPTOGRAPHIC PROOF OF VERIFICATION
--------------------------------------------------------------------------------
BLOCKCHAIN / IMMUTABLE SEAL: sha256:7f9a2b8e3d1c4f5a9e6b7d2c1a8f4e3d3c1b6e8a0f9d2
VERDICT:                 APPROVED_FOR_CLINICAL_PRODUCTION_DEPLOYMENT
RELEASE OFFICER:         Automated IBM Bob 2.0 Release Gatekeeper (Lead HITL Verified)

================================================================================
END OF AUDIT DOSSIER — CONFIDENTIAL & PRIVILEGED CLINICAL RECORD
================================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MedTrace-Compliance-Dossier-${incident.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDossierModal(false);
    showToast(`Compliance dossier for ${incident.id} downloaded.`);
  };

  const passCount = GATE_CHECKS.filter(g => g.result === "PASS").length;
  const reviewCount = GATE_CHECKS.filter(g => g.result === "REVIEW").length;

  const filteredGateChecks = GATE_CHECKS.filter(g =>
    filterCategory === "ALL" || g.category === filterCategory
  );

  const handleDeploy = () => {
    setDeploying(true);
    setDeployStep(1);
    const deploySteps = [
      "Connecting to k8s-us-east-clinical-prod...",
      "Validating SHA-256 cryptographic passport...",
      "Canary rollout to Emergency Ward (pod 1/4)...",
      "Live wait-time telemetry verification: OK...",
      "Full rollout complete · Zero downtime achieved",
    ];
    deploySteps.forEach((_, i) => {
      setTimeout(() => {
        setDeployStep(i + 1);
        if (i === deploySteps.length - 1) {
          setDeploying(false);
          setReleased(true);
        }
      }, (i + 1) * 600);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="animate-fade-in">

      {/* ── Executive Verdict Capsule & Deployment Seal ── */}
      <div style={{
        borderRadius: "20px", padding: "28px 32px",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(56, 189, 248, 0.08) 50%, rgba(168, 85, 247, 0.08) 100%)",
        border: "1px solid rgba(52, 211, 153, 0.4)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(52, 211, 153, 0.12)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Hologram background flare */}
        <div style={{
          position: "absolute", top: "-50px", right: "-50px", width: "220px", height: "220px",
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(52, 211, 153, 0.25), rgba(56, 189, 248, 0.25))",
                border: "1px solid rgba(52, 211, 153, 0.45)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
              }}>
                🚀
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  IBM Bob 2.0 · Final Release Verdict
                </div>
                <div style={{
                  fontSize: "26px", fontWeight: 900, color: "#34d399", letterSpacing: "-0.02em",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  RELEASE GATE: PASS WITH REVIEW
                </div>
              </div>
            </div>

            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "14px" }}>
              <strong style={{ color: "#34d399" }}>{passCount} security & correctness checks PASSED</strong> · <strong style={{ color: "#fbbf24" }}>{reviewCount} non-blocking warnings documented</strong>. Fix is verified safe for hospital production deployment.
            </p>

            {/* Cryptographic Passport Digest */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "6px 14px", borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.45)", border: "1px solid rgba(56, 189, 248, 0.25)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-secondary)",
              flexWrap: "wrap",
            }}>
              <span style={{ color: "#38bdf8", fontWeight: 700 }}>PASSPORT SHA-256:</span>
              <span style={{ color: "var(--text-primary)" }}>7f9a2b8e3d1c4f5a9e6b7d2c1a8f4e3d...3c1</span>
              <span style={{ color: "#34d399" }}>✓ SIGNED</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
            {!released ? (
              <>
                <button
                  className="btn-primary"
                  onClick={handleDeploy}
                  disabled={deploying}
                  style={{
                    fontSize: "13.5px", padding: "12px 28px", fontWeight: 800,
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "1px solid rgba(52, 211, 153, 0.6)",
                    boxShadow: "0 0 25px rgba(16, 185, 129, 0.35)",
                  }}
                >
                  <span>{deploying ? "⏳" : "✓"}</span>
                  <span>{deploying ? `Deploying to Staging (${deployStep}/5)...` : `Approve & Deploy ${incident.id}`}</span>
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setShowDossierModal(true)}
                    className="btn-ghost"
                    style={{ fontSize: "11.5px", padding: "7px 14px" }}
                  >
                    📄 View Audit Dossier
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => showToast("Review ticket dispatched to #ehr-release-ops Slack channel.")}
                    style={{ fontSize: "11.5px", padding: "7px 14px" }}
                  >
                    💬 Notify Team (Slack)
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "right" }} className="animate-slide-up">
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "6px 16px", borderRadius: "10px",
                  background: "rgba(52, 211, 153, 0.2)", border: "1px solid rgba(52, 211, 153, 0.5)",
                  marginBottom: "8px",
                }}>
                  <span style={{ fontSize: "16px" }}>🎉</span>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#34d399", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Production Deployed Successfully
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {incident.id} · Resolved · Cluster: k8s-us-east-clinical-prod
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button
                    onClick={handleDownloadDossier}
                    className="btn-ghost"
                    style={{ fontSize: "11px", padding: "6px 12px" }}
                  >
                    📥 Download Compliance Dossier
                  </button>
                  <button
                    onClick={onNewIncident}
                    className="btn-primary"
                    style={{ fontSize: "11px", padding: "6px 14px" }}
                  >
                    ← Start New Investigation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Deployment Progress Bar */}
        {deploying && (
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#38bdf8", marginBottom: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
              <span>ROLLOUT TELEMETRY STREAM</span>
              <span>Step {deployStep} of 5</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(deployStep / 5) * 100}%`,
                background: "linear-gradient(90deg, #38bdf8, #34d399)",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Gate Checklist Matrix ── */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>🛡️</span>
            <h3 style={{ fontSize: "16px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
              Release Gate Checklist & Verification Invariants
            </h3>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {["ALL", "Diagnosis", "Verification", "Testing", "Security", "Clinical"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    padding: "3px 8px", borderRadius: "5px", border: "1px solid",
                    borderColor: filterCategory === cat ? "rgba(56, 189, 248, 0.4)" : "rgba(255, 255, 255, 0.06)",
                    background: filterCategory === cat ? "rgba(56, 189, 248, 0.15)" : "transparent",
                    color: filterCategory === cat ? "var(--accent-cyan)" : "var(--text-muted)",
                    fontSize: "10.5px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="badge badge-ok">{passCount} PASS</span>
            <span className="badge badge-high">{reviewCount} REVIEW</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "12px" }}>
          {filteredGateChecks.map((g) => (
            <div
              key={g.id}
              style={{
                padding: "14px 16px", borderRadius: "12px",
                background: g.result === "PASS" ? "rgba(52, 211, 153, 0.04)" : "rgba(251, 191, 36, 0.04)",
                border: `1px solid ${g.result === "PASS" ? "rgba(52, 211, 153, 0.2)" : "rgba(251, 191, 36, 0.25)"}`,
                display: "flex", gap: "12px", alignItems: "flex-start",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "20px", flexShrink: 0 }}>{g.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "9.5px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>{g.id}</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>{g.label}</span>
                  </div>
                  <span style={{
                    fontSize: "9px", fontWeight: 800, padding: "2px 7px", borderRadius: "5px",
                    background: g.result === "PASS" ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 191, 36, 0.15)",
                    color: g.color, letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {g.result}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {g.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Before vs After Impact (The Core Hackathon Story!) ── */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>📊</span>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                Developer Workflow Impact: Before vs After IBM Bob 2.0
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Empirical productivity comparison for hospital software maintenance and incident resolution.
              </p>
            </div>
          </div>
          <span className="badge badge-purple" style={{ fontSize: "10.5px" }}>
            +83% Engineering Velocity
          </span>
        </div>

        {/* Dual Side-by-Side Comparison */}
        <div className="responsive-release-grid" style={{ marginBottom: "24px" }}>

          {/* Left: Traditional Manual Workflow */}
          <div style={{
            borderRadius: "14px", overflow: "hidden",
            border: "1px solid rgba(248, 81, 73, 0.25)",
            background: "rgba(24, 8, 12, 0.4)",
          }}>
            <div style={{
              padding: "12px 18px",
              background: "linear-gradient(135deg, rgba(248, 81, 73, 0.15) 0%, rgba(248, 81, 73, 0.05) 100%)",
              borderBottom: "1px solid rgba(248, 81, 73, 0.25)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#ff8b85", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                ❌ Manual Developer Workflow
              </span>
              <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                Status Quo
              </span>
            </div>
            <div>
              {BEFORE_METRICS.map((m, i) => (
                <div key={i} style={{
                  padding: "12px 16px",
                  borderBottom: i < BEFORE_METRICS.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{m.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{m.sub}</div>
                  </div>
                  <div style={{
                    fontSize: "15px", fontWeight: 800, color: "#f85149",
                    fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                  }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: IBM Bob 2.0 Agentic Workflow */}
          <div style={{
            borderRadius: "14px", overflow: "hidden",
            border: "1px solid rgba(52, 211, 153, 0.35)",
            background: "rgba(8, 24, 18, 0.4)",
            boxShadow: "0 0 30px rgba(52, 211, 153, 0.08)",
          }}>
            <div style={{
              padding: "12px 18px",
              background: "linear-gradient(135deg, rgba(52, 211, 153, 0.18) 0%, rgba(56, 189, 248, 0.08) 100%)",
              borderBottom: "1px solid rgba(52, 211, 153, 0.3)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#34d399", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                ⚡ IBM Bob 2.0 Agentic Workflow
              </span>
              <span className="badge badge-ok" style={{ fontSize: "9px" }}>
                AI Orchestrated
              </span>
            </div>
            <div>
              {AFTER_METRICS.map((m, i) => (
                <div key={i} style={{
                  padding: "12px 16px",
                  borderBottom: i < AFTER_METRICS.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{m.sub}</div>
                  </div>
                  <div style={{
                    fontSize: "15px", fontWeight: 800, color: "#34d399",
                    fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                  }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Aggregate Productivity KPI Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px",
          padding: "18px 20px", background: "rgba(0, 0, 0, 0.35)", borderRadius: "14px",
          border: "1px solid rgba(56, 189, 248, 0.15)",
        }}>
          {[
            { label: "MTTR Reduction", value: "98.7%", color: "#38bdf8", sub: "90s vs 2 hrs" },
            { label: "Developer Steps", value: "-86%", color: "#34d399", sub: "3 vs 22 context switches" },
            { label: "Engineering Time Saved", value: "~5.5 hrs", color: "#c084fc", sub: "per incident" },
            { label: "PHI Leak Prevented", value: "100%", color: "#fbbf24", sub: "L:98 patient_id" },
            { label: "Tests Auto-Synthesized", value: "8 tests", color: "#34d399", sub: "0 regression delta" },
            { label: "Total ROI Multiplier", value: "4.8×", color: "#38bdf8", sub: "annualized dev hours" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 900, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {s.label}
              </div>
              <div style={{ fontSize: "9.5px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tamper-Evident Audit Dossier & Timeline ── */}
      <div className="glass-card" style={{ padding: "22px" }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
          onClick={() => setShowAudit(!showAudit)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>📋</span>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                Tamper-Evident Multi-Agent Audit Trail
              </h4>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Cryptographically ordered event log of every Bob 2.0 subagent action and developer verification.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="badge badge-ok">{AUDIT_TRAIL.length} Events Logged</span>
            <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontFamily: "'JetBrains Mono', monospace" }}>
              {showAudit ? "▲ Collapse Log" : "▼ Expand Full Log"}
            </span>
          </div>
        </div>

        {showAudit && (
          <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "8px" }} className="animate-slide-up">
            {AUDIT_TRAIL.map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: "12px", alignItems: "center",
                  padding: "9px 12px", borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  fontSize: "11.5px",
                }}
              >
                <span className="mono" style={{ color: "var(--text-muted)", flexShrink: 0, minWidth: "65px", fontSize: "11px" }}>
                  {e.ts}
                </span>
                <span style={{ color: "var(--text-secondary)", flex: 1 }}>
                  {e.event}
                </span>
                <span className={`badge ${e.badge}`} style={{ fontSize: "9px", flexShrink: 0 }}>
                  {e.actor}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: Compliance Dossier Preview ── */}
      {showDossierModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowDossierModal(false)}>
          <div
            className="glass-card animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "650px", width: "100%", padding: "26px",
              background: "#040a16", border: "1px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>🛡️</span>
                <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Clinical Release Compliance Dossier</h3>
              </div>
              <button
                onClick={() => setShowDossierModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: "#020610", padding: "16px", borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.06)", fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px", color: "#cbd5e1", lineHeight: 1.6, maxHeight: "300px", overflowY: "auto",
            }}>
              <div>{"// MEDTRACE COMPLIANCE PASSPORT · IBM BOB 2.0"}</div>
              <div>{"// Incident ID: "}{incident.id}</div>
              <div>{"// Timestamp: "}{new Date().toISOString()}</div>
              <div>{"// Repository: hospital/st-jude-ehr (branch: main)"}</div>
              <div>--------------------------------------------------</div>
              <div>DIAGNOSIS: Root cause confirmed at QueueService.js (94% conf)</div>
              <div>PATCH: 2 modified files, 1 test file (QueueService.test.js)</div>
              <div>TESTS: 8 passed, 0 failed, 0 regressions</div>
              <div>HIPAA: §164.312 PHI sanitization audit = PASS (0 leaks)</div>
              <div>AST INVARIANTS: 2 callers verified compatible</div>
              <div>CLINICAL SAFETY: MediSentinel triage scoring = ISOLATED</div>
              <div>SIGNATURE: sha256:7f9a2b8e3d1c4f5a9e6b7d2c1a8f4e3d3c1</div>
              <div>VERDICT: APPROVED_FOR_STAGING_DEPLOYMENT</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
              <button
                onClick={() => {
                  const payload = {
                    platform: "MedTrace Powered by IBM Bob 2.0",
                    incidentId: incident.id,
                    timestamp: new Date().toISOString(),
                    diagnosis: "Root cause confirmed at QueueService.js (94% conf)",
                    tests: "8 passed, 0 failed, 0 regressions",
                    hipaa: "PASS (0 leaks)",
                    verdict: "APPROVED_FOR_STAGING_DEPLOYMENT",
                    digest: "sha256:7f9a2b8e3d1c4f5a9e6b7d2c1a8f4e3d3c1",
                  };
                  navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
                  setShowDossierModal(false);
                  showToast("Dossier JSON copied to clipboard!");
                }}
                className="btn-ghost"
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                📋 Copy JSON
              </button>
              <button
                onClick={handleDownloadDossier}
                className="btn-primary"
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                📥 Download Compliance Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Real-time Toast Feedback ── */}
      {toastMessage && (
        <div style={{
          position: "fixed", bottom: "30px", right: "30px", zIndex: 99999,
          background: "rgba(6, 16, 32, 0.95)", border: "1px solid rgba(56, 189, 248, 0.5)",
          boxShadow: "0 12px 35px rgba(0,0,0,0.8), 0 0 25px rgba(56, 189, 248, 0.25)",
          borderRadius: "12px", padding: "12px 20px", color: "#38bdf8",
          fontSize: "12.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px",
          fontFamily: "'Space Grotesk', sans-serif",
        }} className="animate-slide-up">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
