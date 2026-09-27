"use client";

import { useState, useEffect, useRef } from "react";
import { Incident } from "@/lib/types";

interface FixWorkspaceProps {
  incident: Incident;
  analysisComplete: boolean;
  onProceedToReview: () => void;
}

export interface PlanStep {
  step: number;
  file: string;
  action: string;
  risk: string;
  effort: string;
  highlight: boolean;
}

export interface DiffHunk {
  file: string;
  hunks: string;
}

export interface FixStrategy {
  id: string;
  name: string;
  tag: string;
  desc: string;
  totalEffort: string;
  filesModified: number;
  plan: PlanStep[];
  diffHunks: DiffHunk[];
}

const DEFAULT_PLAN: PlanStep[] = [
  { step: 1, file: "QueueService.js", action: "Update getQueueDepth() to query patient_queue table (active status only)", risk: "Low", effort: "15 min", highlight: true },
  { step: 2, file: "QueueService.js", action: "Remove PHI (patient_id) from console.error debug log on L:98", risk: "Low — PHI safety fix", effort: "2 min", highlight: false },
  { step: 3, file: "WaitTimeController.js", action: "No change needed — correctly calls getQueueDepth()", risk: "None", effort: "0 min", highlight: false },
  { step: 4, file: "QueueService.test.js", action: "Recreate deleted test file — add unit tests for getQueueDepth() with active-only logic", risk: "Low", effort: "30 min", highlight: false },
  { step: 5, file: "WaitTimeController.test.js", action: "Add integration test: /api/ed/wait-time returns count matching patient_queue.active rows", risk: "Low", effort: "20 min", highlight: false },
];

const DIFF_HUNKS = [
  {
    file: "QueueService.js",
    hunks: `@@ -109,8 +109,9 @@ class QueueService {
   getQueueDepth() {
-    // BUG: counts all appointment slots (including future reserved)
-    return this.slots
-      .filter(s => s.status !== 'cancelled')
-      .length;
+    // FIX: query active patient_queue rows only (live ED queue)
+    return this.db
+      .query('SELECT COUNT(*) FROM patient_queue WHERE status = ?', ['active'])
+      .then(r => r[0].count);
   }
 
   handleQueueError(patientId, err) {
-    console.error('Queue error for patient:', patientId, err); // PHI LEAK
+    console.error('Queue error occurred:', err.message); // PHI removed
   }`,
  },
  {
    file: "QueueService.test.js (NEW)",
    hunks: `@@ -0,0 +1,38 @@
+const QueueService = require('./QueueService');
+const mockDb = require('../__mocks__/db');
+
+describe('QueueService.getQueueDepth()', () => {
+  beforeEach(() => mockDb.reset());
+
+  it('returns 0 when no active patients', async () => {
+    mockDb.seed('patient_queue', []);
+    const svc = new QueueService(mockDb);
+    expect(await svc.getQueueDepth()).toBe(0);
+  });
+
+  it('counts only active patients, ignoring discharged', async () => {
+    mockDb.seed('patient_queue', [
+      { id: 1, status: 'active' },
+      { id: 2, status: 'discharged' },
+      { id: 3, status: 'active' },
+    ]);
+    const svc = new QueueService(mockDb);
+    expect(await svc.getQueueDepth()).toBe(2); // NOT 3
+  });
+
+  it('does not expose patient_id in error logs', async () => {
+    const spy = jest.spyOn(console, 'error');
+    await svc.handleQueueError('PT-001', new Error('DB timeout'));
+    expect(spy).not.toHaveBeenCalledWith(
+      expect.stringContaining('PT-001')
+    );
+  });
+});`,
  },
];

const STRATEGIES: FixStrategy[] = [
  {
    id: "sql",
    name: "Strategy A: Direct SQL Live Queue Aggregation (Recommended)",
    tag: "SURGICAL PATCH · LOW RISK",
    desc: "Query active patient_queue rows directly with Knex.js parameterized query. Minimal footprint, zero new dependencies, 100% backward compatible.",
    totalEffort: "~67 minutes",
    filesModified: 2,
    plan: DEFAULT_PLAN,
    diffHunks: DIFF_HUNKS,
  },
  {
    id: "redis",
    name: "Strategy B: Distributed Redis Event-Driven Counter",
    tag: "HIGH THROUGHPUT · SURGE SAFE",
    desc: "Maintain atomic in-memory active set in Redis with asynchronous write-behind to patient_queue. Handles up to 50,000 arrivals/sec during emergency surges.",
    totalEffort: "~85 minutes",
    filesModified: 3,
    plan: [
      { step: 1, file: "QueueService.js", action: "Add Redis client connection & check 'ed:active_patients' set cardinality", risk: "Low", effort: "20 min", highlight: true },
      { step: 2, file: "QueueService.js", action: "Remove PHI (patient_id) from console.error debug log on L:98", risk: "Low — PHI safety fix", effort: "2 min", highlight: false },
      { step: 3, file: "QueueService.js", action: "Add fallback SQL query if Redis cluster fails health check", risk: "Low", effort: "15 min", highlight: false },
      { step: 4, file: "QueueService.test.js", action: "Add mock Redis cluster unit test suite for cache hit and cache miss", risk: "Low", effort: "28 min", highlight: false },
      { step: 5, file: "WaitTimeController.test.js", action: "Integration test for sub-millisecond wait time response", risk: "Low", effort: "20 min", highlight: false },
    ],
    diffHunks: [
      {
        file: "QueueService.js",
        hunks: `@@ -109,8 +109,14 @@ class QueueService {
   async getQueueDepth() {
-    // BUG: counts all appointment slots (including future reserved)
-    return this.slots
-      .filter(s => s.status !== 'cancelled')
-      .length;
+    // FIX: check Redis in-memory set with SQL fallback for high surge
+    try {
+      const cached = await this.redis.scard('ed:active_patients');
+      if (cached !== null) return cached;
+    } catch (e) {
+      console.warn('Redis unavailable, falling back to SQL');
+    }
+    return this.db('patient_queue').where({ status: 'active' }).count('* as count');
   }

   handleQueueError(patientId, err) {
-    console.error('Queue error for patient:', patientId, err); // PHI LEAK
+    console.error('Queue error occurred:', err.message); // PHI removed
   }`,
      },
      DIFF_HUNKS[1],
    ],
  },
  {
    id: "ebpf",
    name: "Strategy C: Zero-Allocation Lockless Ring Buffer",
    tag: "CRITICAL CARE · ZERO GC",
    desc: "Atomic ring-buffer state synchronization for sub-millisecond intensive care telemetry pipelines without V8 garbage collection pauses.",
    totalEffort: "~95 minutes",
    filesModified: 2,
    plan: [
      { step: 1, file: "QueueService.js", action: "Implement SharedArrayBuffer atomic counter for ED arrival events", risk: "Medium", effort: "35 min", highlight: true },
      { step: 2, file: "QueueService.js", action: "Remove PHI from error logger", risk: "Low", effort: "2 min", highlight: false },
      { step: 3, file: "QueueService.test.js", action: "Verify lockless concurrency under 1,000 parallel web workers", risk: "Low", effort: "38 min", highlight: false },
      { step: 4, file: "WaitTimeController.test.js", action: "Zero memory allocation assertion test in benchmark suite", risk: "Low", effort: "20 min", highlight: false },
    ],
    diffHunks: [
      {
        file: "QueueService.js",
        hunks: `@@ -109,8 +109,10 @@ class QueueService {
   getQueueDepth() {
-    return this.slots.filter(s => s.status !== 'cancelled').length;
+    // FIX: Lock-free atomic read from telemetry ring buffer
+    return Atomics.load(this.sharedQueueBuffer, 0);
   }`,
      },
      DIFF_HUNKS[1],
    ],
  },
];

const TEST_RESULTS = [
  { name: "QueueService: returns 0 when no active patients", status: "pass", time: "4ms" },
  { name: "QueueService: counts only active patients", status: "pass", time: "6ms" },
  { name: "QueueService: does not expose patient_id in logs", status: "pass", time: "3ms" },
  { name: "WaitTimeController: /api/ed/wait-time matches patient_queue count", status: "pass", time: "18ms" },
  { name: "EmergencyDashboard: renders corrected wait time", status: "pass", time: "22ms" },
  { name: "EmergencyDashboard: refreshes data every 60s", status: "pass", time: "11ms" },
  { name: "QueueService: legacy slot-based calculation removed", status: "pass", time: "5ms" },
  { name: "Security: no PHI in QueueService error logs", status: "pass", time: "2ms" },
];

export default function FixWorkspace({ incident, analysisComplete, onProceedToReview }: FixWorkspaceProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<FixStrategy>(STRATEGIES[0]);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeDiffFile, setActiveDiffFile] = useState(0);
  const [planApproved, setPlanApproved] = useState(false);
  const [testsRunning, setTestsRunning] = useState(false);
  const [testsComplete, setTestsComplete] = useState(false);
  const [passedTests, setPassedTests] = useState(0);
  const tickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const IMPL_PLAN = selectedStrategy.plan;
  const DIFF_HUNKS = selectedStrategy.diffHunks;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectStrategy = (strat: FixStrategy) => {
    setSelectedStrategy(strat);
    setActiveDiffFile(0);
    setShowRevisionModal(false);
    showToast(`Fix plan revised to: ${strat.name}`);
  };

  useEffect(() => {
    return () => {
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    };
  }, []);

  const handleApproveAndImplement = () => {
    setPlanApproved(true);
    tickTimerRef.current = setTimeout(() => {
      setTestsRunning(true);
      let i = 0;
      const tick = () => {
        if (i >= TEST_RESULTS.length) {
          setTestsRunning(false);
          setTestsComplete(true);
          return;
        }
        setPassedTests(p => p + 1);
        i++;
        tickTimerRef.current = setTimeout(tick, 280 + Math.random() * 150);
      };
      tickTimerRef.current = setTimeout(tick, 600);
    }, 800);
  };

  const diffLineColor = (line: string) => {
    if (line.startsWith("+")) return { color: "#3fb950", background: "rgba(63,185,80,0.08)" };
    if (line.startsWith("-")) return { color: "#f85149", background: "rgba(248,81,73,0.08)" };
    if (line.startsWith("@@")) return { color: "#58d6e8", background: "rgba(88,214,232,0.05)" };
    return { color: "#c9d1d9", background: "transparent" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Workspace Header */}
      <div className="glass-card" style={{ padding: "22px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
              }}>
                ⚡
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                Fix Synthesis & Automated Test Suite
              </h2>
              <span className="badge badge-purple" style={{ fontSize: "9.5px" }}>
                Agent Mode Active
              </span>
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              IBM Bob 2.0 has synthesized an implementation plan, surgical AST code diff and automated test suite for <strong style={{ color: "var(--accent-cyan)" }}>{incident.id}</strong>.
            </p>
          </div>

          {testsComplete && (
            <div style={{
              textAlign: "center", background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px",
              padding: "10px 20px",
            }}>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#34d399", fontFamily: "'Space Grotesk', sans-serif" }}>
                8/8 PASS
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                0 Regressions
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: "24px" }}>

        {/* Left: Code Diff & Automated Test Runner */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Diff Viewer Card */}
          <div className="glass-card" style={{ padding: "0", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            
            {/* Editor-Style File Tabs */}
            <div style={{
              display: "flex", borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(4, 9, 20, 0.9)", padding: "4px 8px 0",
              gap: "4px",
            }}>
              {DIFF_HUNKS.map((d, i) => {
                const isSelected = activeDiffFile === i;
                const isNew = d.file.includes("NEW");
                return (
                  <button
                    key={i}
                    onClick={() => setActiveDiffFile(i)}
                    style={{
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "8px 8px 0 0",
                      background: isSelected ? "rgba(14, 25, 48, 0.95)" : "transparent",
                      borderTop: isSelected ? "2px solid #38bdf8" : "2px solid transparent",
                      color: isSelected ? "#ffffff" : "var(--text-muted)",
                      cursor: "pointer", fontSize: "11.5px",
                      display: "flex", alignItems: "center", gap: "8px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "13px" }}>{isNew ? "✨" : "📄"}</span>
                    <span className="mono" style={{ fontWeight: isSelected ? 700 : 500 }}>
                      {d.file}
                    </span>
                    <span style={{
                      fontSize: "9px", padding: "1px 5px", borderRadius: "3px",
                      background: isNew ? "rgba(16, 185, 129, 0.2)" : "rgba(234, 179, 8, 0.2)",
                      color: isNew ? "#34d399" : "#fbbf24",
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                    }}>
                      {isNew ? "NEW" : "MODIFIED"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Code Diff Canvas */}
            <div style={{ padding: "0", background: "#040814", maxHeight: "380px", overflowY: "auto" }}>
              <div style={{ padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace" }}>
                {DIFF_HUNKS[activeDiffFile].hunks.split("\n").map((line, i) => {
                  const style = diffLineColor(line);
                  return (
                    <div key={i} style={{
                      display: "flex", gap: "12px",
                      background: style.background, padding: "2px 8px",
                      borderRadius: "3px",
                    }}>
                      <span className="mono" style={{
                        fontSize: "10px", color: "var(--text-muted)",
                        userSelect: "none", minWidth: "24px", textAlign: "right",
                      }}>
                        {!line.startsWith("@@") ? i + 1 : ""}
                      </span>
                      <pre style={{
                        margin: 0, fontSize: "11.5px", color: style.color,
                        fontFamily: "'JetBrains Mono', monospace",
                        whiteSpace: "pre-wrap", wordBreak: "break-all",
                      }}>
                        {line}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Diff Footer Metrics */}
            <div style={{
              padding: "10px 18px", borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              background: "rgba(4, 9, 20, 0.8)", display: "flex",
              justifyContent: "space-between", alignItems: "center", fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <div style={{ display: "flex", gap: "14px" }}>
                <span style={{ color: "#34d399", fontWeight: 700 }}>
                  +{DIFF_HUNKS[activeDiffFile].hunks.split("\n").filter(l => l.startsWith("+")).length} additions
                </span>
                <span style={{ color: "#f87171", fontWeight: 700 }}>
                  -{DIFF_HUNKS[activeDiffFile].hunks.split("\n").filter(l => l.startsWith("-")).length} deletions
                </span>
              </div>
              <span style={{ color: "var(--text-muted)" }}>
                ✓ AST syntax verified · Zero breaking dependencies
              </span>
            </div>
          </div>

          {/* Automated Test Suite Execution */}
          {(testsRunning || testsComplete) && (
            <div className="glass-card animate-slide-up" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🧪</span>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                      Automated Regression Test Suite
                    </h4>
                    <p style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                      Unit + integration verification synthesized by Bob Agent Mode
                    </p>
                  </div>
                </div>

                {testsComplete ? (
                  <span className="badge badge-ok" style={{ fontSize: "10px" }}>8/8 PASSED (0 REGRESSIONS)</span>
                ) : (
                  <span className="badge badge-medium" style={{ fontSize: "10px" }}>
                    Executing {passedTests}/{TEST_RESULTS.length}…
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {TEST_RESULTS.slice(0, passedTests).map((t, i) => (
                  <div key={i} className="animate-fade-in" style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", background: "rgba(16, 185, 129, 0.05)", borderRadius: "8px",
                    border: "1px solid rgba(16, 185, 129, 0.18)", fontSize: "11.5px",
                  }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ color: "#34d399", fontWeight: 800 }}>✓</span>
                      <span style={{ color: "var(--text-primary)" }}>{t.name}</span>
                    </div>
                    <span className="mono" style={{ color: "var(--text-muted)", fontSize: "10px" }}>{t.time}</span>
                  </div>
                ))}
                {testsRunning && passedTests < TEST_RESULTS.length && (
                  <div style={{
                    padding: "8px 12px", fontSize: "11px", color: "#38bdf8",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <span style={{ animation: "spin 1s linear infinite" }}>⟳</span>
                    <span>Running test: {TEST_RESULTS[passedTests]?.name}…</span>
                  </div>
                )}
              </div>

              {testsComplete && (
                <div style={{
                  marginTop: "14px", padding: "12px 16px",
                  background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.35)",
                  borderRadius: "10px", fontSize: "12px", color: "#34d399", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <span style={{ fontSize: "16px" }}>🛡️</span>
                  <span>All 8 tests passed with 0 regressions detected. Queue calculation bug verified resolved.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Implementation Plan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 800 }}>Implementation Plan</h3>
              <span className="badge badge-purple">Plan Mode</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {IMPL_PLAN.map(step => (
                <div
                  key={step.step}
                  style={{
                    padding: "12px 14px", borderRadius: "8px",
                    background: step.highlight ? "rgba(56,139,253,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${step.highlight ? "rgba(56,139,253,0.3)" : "rgba(255,255,255,0.05)"}`,
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                      background: step.highlight ? "var(--accent-blue)" : "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: 800, color: step.highlight ? "#fff" : "var(--text-muted)",
                    }}>
                      {step.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="mono" style={{ fontSize: "10px", color: "var(--accent-cyan)", marginBottom: "2px" }}>
                        {step.file}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "6px" }}>
                        {step.action}
                      </div>
                      <div style={{ display: "flex", gap: "8px", fontSize: "10px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Risk: <span style={{ color: step.risk === "None" ? "var(--accent-green)" : "var(--accent-orange)" }}>{step.risk}</span></span>
                        <span style={{ color: "var(--text-muted)" }}>·</span>
                        <span style={{ color: "var(--text-muted)" }}>Effort: <span style={{ color: "var(--accent-cyan)" }}>{step.effort}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "14px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)" }}>Files modified:</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{selectedStrategy.filesModified}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)" }}>Tests generated:</span>
                <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>8 tests</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)" }}>PHI fix included:</span>
                <span style={{ color: "var(--accent-orange)", fontWeight: 600 }}>Yes (QueueService L:98)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Estimated total effort:</span>
                <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>{selectedStrategy.totalEffort}</span>
              </div>
            </div>

            {/* Developer Approval Gate */}
            {!planApproved ? (
              <div>
                <div style={{ padding: "10px 12px", background: "rgba(227,179,65,0.08)", border: "1px solid rgba(227,179,65,0.25)", borderRadius: "8px", marginBottom: "10px", fontSize: "11px", color: "var(--accent-orange)" }}>
                  ⚠️ Developer approval required before Bob applies any code changes
                </div>
                <button
                  className="btn-primary"
                  onClick={handleApproveAndImplement}
                  style={{ width: "100%", fontSize: "13px", marginBottom: "8px" }}
                >
                  ✓ Approve Plan — Apply Fix & Run Tests
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setShowRevisionModal(true)}
                  style={{ width: "100%", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <span>🛠️</span>
                  <span>Request Plan Revision (Switch Strategy)</span>
                </button>
              </div>
            ) : (
              <div>
                <div style={{ padding: "10px 12px", background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.3)", borderRadius: "8px", marginBottom: "10px", fontSize: "12px", color: "var(--accent-green)", fontWeight: 600 }}>
                  {testsComplete ? "✓ Fix applied · 8/8 tests passing · Proceeding to review..." : "⟳ Bob is applying changes and running test suite..."}
                </div>
                {testsComplete && (
                  <button
                    className="btn-primary"
                    onClick={onProceedToReview}
                    style={{ width: "100%", fontSize: "13px" }}
                  >
                    🛡️ Run AI Code Review →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bob Role Card */}
          <div className="glass-card" style={{ padding: "16px" }}>
            <h4 style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              BOB 2.0 — AGENT MODE ACTIONS
            </h4>
            {[
              { icon: "📝", action: `Modified QueueService.js (${selectedStrategy.name.slice(0, 30)}...)` },
              { icon: "🧪", action: "Generated QueueService.test.js (8 tests)" },
              { icon: "▶️", action: "Executed test suite via npm test" },
              { icon: "🔍", action: "Ran AST syntax validation — 0 errors" },
              { icon: "🔒", action: "Removed PHI from debug log path" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", fontSize: "11px", color: "var(--text-secondary)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span>{a.icon}</span>
                <span>{a.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Plan Revision Modal ── */}
      {showRevisionModal && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={() => setShowRevisionModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(2, 6, 16, 0.8)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="glass-card animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "680px", width: "100%", padding: "26px",
              background: "#050e1f", border: "1px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.9)", borderRadius: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🛠️</span>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                    Bob 2.0 Plan Revision Studio
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                    Choose an alternate engineering strategy. Bob will re-synthesize diffs and tests.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRevisionModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {STRATEGIES.map(strat => {
                const isSelected = selectedStrategy.id === strat.id;
                return (
                  <div
                    key={strat.id}
                    onClick={() => handleSelectStrategy(strat)}
                    style={{
                      padding: "16px", borderRadius: "12px",
                      cursor: "pointer", transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.6)" : "rgba(255, 255, 255, 0.08)"}`,
                      background: isSelected ? "rgba(14, 30, 60, 0.85)" : "rgba(255, 255, 255, 0.02)",
                      boxShadow: isSelected ? "0 8px 24px rgba(14, 165, 233, 0.18)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          width: "16px", height: "16px", borderRadius: "50%",
                          border: `2px solid ${isSelected ? "#38bdf8" : "rgba(255,255,255,0.3)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {isSelected && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8" }} />}
                        </span>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: isSelected ? "#ffffff" : "var(--text-secondary)", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {strat.name}
                        </span>
                      </div>
                      <span className="mono" style={{ fontSize: "10px", color: isSelected ? "#38bdf8" : "var(--text-muted)" }}>
                        {strat.totalEffort}
                      </span>
                    </div>

                    <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.5, marginLeft: "24px", marginBottom: "8px" }}>
                      {strat.desc}
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginLeft: "24px" }}>
                      <span style={{
                        fontSize: "9px", fontWeight: 800, padding: "2px 8px", borderRadius: "6px",
                        background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.25)",
                      }}>
                        {strat.tag}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {strat.filesModified} files affected · {strat.plan.length} plan steps
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="btn-ghost"
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                Close
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
          fontFamily: "'Space Grotesk', sans-serif", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
