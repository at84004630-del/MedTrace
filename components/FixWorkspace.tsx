"use client";

import { useState, useEffect, useRef } from "react";
import { Incident } from "@/lib/types";
import { IconTestTube, IconCheck } from "@/components/NavIcons";

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

export interface TestCase {
  id: string;
  name: string;
  category: "Integration" | "Unit" | "Regression" | "Security";
  suite: string;
  endpoint?: string;
  time: string;
  desc: string;
  assertion: string;
  details: {
    request?: string;
    expected: string;
    received: string;
    contract?: string;
  };
}

const TEST_CASES: TestCase[] = [
  {
    id: "TC-01",
    category: "Integration",
    suite: "WaitTimeController.test.js:42",
    endpoint: "GET /api/ed/wait-time",
    name: "WaitTimeController: /api/ed/wait-time matches patient_queue count",
    time: "18ms",
    desc: "End-to-end integration test validating controller aggregates live active queue depth instead of appointment slots.",
    assertion: "const res = await request(app).get('/api/ed/wait-time');\nexpect(res.status).toBe(200);\nexpect(res.body.queueDepth).toEqual(4);\nexpect(res.body.waitMinutes).toEqual(18);",
    details: {
      request: "GET /api/ed/wait-time?dept=ED-MAIN",
      expected: "HTTP 200 OK · { queueDepth: 4, waitMinutes: 18, status: 'nominal' }",
      received: "HTTP 200 OK · { queueDepth: 4, waitMinutes: 18, status: 'nominal' }",
      contract: "OpenAPI v3.1 / FHIR R4 Schedule Resource",
    },
  },
  {
    id: "TC-02",
    category: "Integration",
    suite: "EmergencyDashboard.test.jsx:88",
    endpoint: "WebSocket /live/triage/stream",
    name: "EmergencyDashboard: renders corrected live wait time",
    time: "22ms",
    desc: "Component integration test verifying React HUD renders live queue depth without frozen zero-minute state.",
    assertion: "render(<EmergencyDashboard />);\nawait waitFor(() => {\n  expect(screen.getByTestId('live-wait-time')).toHaveTextContent('18 min');\n  expect(screen.queryByText('0 min')).not.toBeInTheDocument();\n});",
    details: {
      expected: "Dashboard HUD unfreezes and renders '18 min' live estimate",
      received: "Rendered in 22ms with zero layout shift (CLS: 0.00)",
    },
  },
  {
    id: "TC-03",
    category: "Integration",
    suite: "EmergencyDashboard.test.jsx:134",
    endpoint: "Cron / Polling Telemetry Heartbeat",
    name: "EmergencyDashboard: refreshes data telemetry every 60s",
    time: "11ms",
    desc: "Heartbeat integration test confirming periodic background telemetry refreshes without memory leaks or race conditions.",
    assertion: "jest.advanceTimersByTime(60000);\nexpect(fetchQueueDepthSpy).toHaveBeenCalledTimes(2);\nexpect(memoryProfile.heapDelta).toBeLessThan(1024 * 50);",
    details: {
      expected: "Background interval triggers fresh query every 60,000ms",
      received: "Timer dispatched on schedule (jitter < 3ms)",
    },
  },
  {
    id: "TC-04",
    category: "Unit",
    suite: "QueueService.test.js:18",
    name: "QueueService: returns 0 when no active patients exist",
    time: "4ms",
    desc: "Edge-case unit test verifying boundary condition when department queue is genuinely empty.",
    assertion: "await db('patient_queue').truncate();\nconst depth = await queueService.getQueueDepth('ED');\nexpect(depth).toBe(0);\nexpect(typeof depth).toBe('number');",
    details: {
      expected: "Exact integer 0 (guarantees zero NaN / undefined downstream)",
      received: "0",
    },
  },
  {
    id: "TC-05",
    category: "Unit",
    suite: "QueueService.test.js:32",
    name: "QueueService: counts only active patients in emergency queue",
    time: "6ms",
    desc: "Unit test asserting that Knex query WHERE status = 'active' filters out discharged or scheduled rows.",
    assertion: "const depth = await queueService.getQueueDepth('ED');\nexpect(depth).toBe(4); // Excludes 6 discharged + 3 reserved slots",
    details: {
      expected: "Aggregates only rows where status === 'active'",
      received: "4 active rows returned",
    },
  },
  {
    id: "TC-06",
    category: "Regression",
    suite: "QueueService.test.js:55",
    name: "QueueService: legacy slot-based calculation removed",
    time: "5ms",
    desc: "Regression prevention test verifying obsolete appointment_slots query paths are completely tombstoned.",
    assertion: "const querySpy = jest.spyOn(mockDb, 'query');\nawait queueService.getQueueDepth('ED');\nexpect(querySpy).not.toHaveBeenCalledWith(expect.stringContaining('appointment_slots'));",
    details: {
      expected: "Zero queries directed to deprecated appointment_slots table",
      received: "0 legacy queries executed",
    },
  },
  {
    id: "TC-07",
    category: "Security",
    suite: "SecurityAudit.test.js:14",
    name: "QueueService: does not expose patient_id in logs",
    time: "3ms",
    desc: "HIPAA §164.312 unit audit confirming error logging uses sanitized operational trace IDs without patient MRN or ID.",
    assertion: "const logSpy = jest.spyOn(console, 'error');\nawait queueService.handleQueueError({ id: 'PAT-9912' }, new Error('Sync failed'));\nexpect(logSpy.mock.calls[0][0]).not.toContain('PAT-9912');\nexpect(logSpy.mock.calls[0][0]).toMatch(/traceId=/);",
    details: {
      expected: "Log string sanitized of patient MRN, ID, DOB, or SSN",
      received: "[Queue Error] [traceId=tr-20260927-01] Queue sync failed",
    },
  },
  {
    id: "TC-08",
    category: "Security",
    suite: "SecurityAudit.test.js:28",
    name: "Security: zero PHI in QueueService error logs AST scan",
    time: "2ms",
    desc: "Regex static AST scan over the entire patch changeset to guarantee zero inadvertent PHI token exposures.",
    assertion: "const astViolations = scanDiffForPHI(diffContent);\nexpect(astViolations).toHaveLength(0);",
    details: {
      expected: "0 PHI violations detected across entire diff changeset",
      received: "0 violations (HIPAA Compliant)",
    },
  },
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
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "Integration" | "Unit" | "Regression" | "Security">("ALL");
  const [expandedTestId, setExpandedTestId] = useState<string | null>("TC-01");
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

  const runTests = () => {
    if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    setTestsRunning(true);
    setTestsComplete(false);
    setPassedTests(0);
    let i = 0;
    const tick = () => {
      if (i >= TEST_CASES.length) {
        setTestsRunning(false);
        setTestsComplete(true);
        showToast("✓ All 8 automated unit & integration tests passed!");
        return;
      }
      setPassedTests(p => p + 1);
      i++;
      tickTimerRef.current = setTimeout(tick, 220 + Math.random() * 120);
    };
    tickTimerRef.current = setTimeout(tick, 350);
  };

  const handleApproveAndImplement = () => {
    setPlanApproved(true);
    runTests();
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

      <div className="responsive-fix-grid">

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
          <div className="glass-card animate-slide-up" style={{ padding: "20px 22px", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconTestTube size={17} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", fontFamily: "'Space Grotesk', sans-serif" }}>
                      Automated Test Suite (Vitest)
                    </h4>
                    <span className="mono" style={{ fontSize: "10px", color: "var(--accent-cyan)" }}>
                      8/8 Synthesized
                    </span>
                  </div>
                  <p style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                    End-to-end integration contracts, Knex queries, PHI audits & regression assertions
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {testsComplete ? (
                  <span className="badge badge-ok" style={{ fontSize: "10px" }}>8/8 PASSED (0 REGRESSIONS)</span>
                ) : testsRunning ? (
                  <span className="badge badge-medium" style={{ fontSize: "10px" }}>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block", marginRight: "4px" }}>⟳</span>
                    Executing {passedTests}/{TEST_CASES.length}…
                  </span>
                ) : (
                  <span className="badge badge-cyan" style={{ fontSize: "10px" }}>READY TO EXECUTE</span>
                )}

                <button
                  onClick={runTests}
                  disabled={testsRunning}
                  className="btn-secondary"
                  style={{
                    fontSize: "11px", padding: "6px 12px",
                    display: "flex", alignItems: "center", gap: "5px",
                    borderColor: "rgba(56, 189, 248, 0.3)",
                    background: "rgba(56, 189, 248, 0.08)",
                    color: "#38bdf8",
                  }}
                >
                  <span>{testsComplete ? "⟳ Re-run Suite" : testsRunning ? "Running..." : "▶ Run Tests"}</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
              {(["ALL", "Integration", "Unit", "Regression", "Security"] as const).map(cat => {
                const isSelected = selectedCategory === cat;
                const count = cat === "ALL" ? TEST_CASES.length : TEST_CASES.filter(t => t.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: isSelected ? 700 : 500,
                      border: isSelected ? "1px solid rgba(56, 189, 248, 0.5)" : "1px solid rgba(255, 255, 255, 0.06)",
                      background: isSelected ? "rgba(56, 189, 248, 0.15)" : "rgba(255, 255, 255, 0.02)",
                      color: isSelected ? "#38bdf8" : "var(--text-muted)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span>{cat === "ALL" ? "All Tests" : cat === "Integration" ? "⚡ Integration" : cat}</span>
                    <span style={{
                      fontSize: "9px",
                      padding: "1px 5px",
                      borderRadius: "10px",
                      background: isSelected ? "rgba(56, 189, 248, 0.25)" : "rgba(255, 255, 255, 0.06)",
                      color: isSelected ? "#ffffff" : "var(--text-muted)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Test Case List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {TEST_CASES.filter(t => selectedCategory === "ALL" || t.category === selectedCategory).map((t, idx) => {
                const originalIndex = TEST_CASES.findIndex(item => item.id === t.id);
                const isPassed = testsComplete || originalIndex < passedTests;
                const isCurrent = testsRunning && originalIndex === passedTests;
                const isExpanded = expandedTestId === t.id;

                const categoryBadge = {
                  Integration: { bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.3)", color: "#38bdf8", label: "INTEGRATION" },
                  Unit: { bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.3)", color: "#34d399", label: "UNIT" },
                  Regression: { bg: "rgba(192, 132, 252, 0.12)", border: "rgba(192, 132, 252, 0.3)", color: "#c084fc", label: "REGRESSION" },
                  Security: { bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.3)", color: "#fbbf24", label: "SECURITY" },
                }[t.category];

                return (
                  <div
                    key={t.id}
                    className="animate-fade-in"
                    style={{
                      borderRadius: "8px",
                      border: isExpanded ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid rgba(255, 255, 255, 0.05)",
                      background: isExpanded
                        ? "rgba(10, 22, 45, 0.85)"
                        : isPassed
                        ? "rgba(16, 185, 129, 0.04)"
                        : "rgba(255, 255, 255, 0.02)",
                      transition: "all 0.18s ease",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => setExpandedTestId(isExpanded ? null : t.id)}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "9px 12px", cursor: "pointer",
                        fontSize: "11.5px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "9px", alignItems: "center", flex: 1, minWidth: 0 }}>
                        <span style={{
                          color: isPassed ? "#34d399" : isCurrent ? "#38bdf8" : "var(--text-muted)",
                          fontWeight: 800, fontSize: "12px", width: "14px", textAlign: "center", flexShrink: 0,
                        }}>
                          {isPassed ? "✓" : isCurrent ? "⟳" : "○"}
                        </span>
                        
                        <span style={{
                          fontSize: "8.5px", padding: "1px 5px", borderRadius: "3px",
                          background: categoryBadge.bg, color: categoryBadge.color,
                          border: `1px solid ${categoryBadge.border}`,
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, flexShrink: 0,
                        }}>
                          {categoryBadge.label}
                        </span>

                        <span style={{
                          color: isPassed ? "var(--text-primary)" : "var(--text-secondary)",
                          fontWeight: isPassed ? 600 : 400,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {t.name}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
                        <span className="mono" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                          {t.time}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Expandable Diagnostic Drawer */}
                    {isExpanded && (
                      <div className="animate-fade-in" style={{
                        padding: "10px 14px 12px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                        background: "rgba(4, 9, 20, 0.95)",
                        fontSize: "11px",
                      }}>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "8px", lineHeight: 1.5 }}>
                          {t.desc}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                          <div style={{ padding: "6px 8px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "5px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <div className="mono" style={{ fontSize: "9.5px", color: "var(--text-muted)" }}>TEST FILE</div>
                            <div className="mono" style={{ color: "#38bdf8", fontWeight: 600, fontSize: "10.5px" }}>{t.suite}</div>
                          </div>

                          {t.endpoint && (
                            <div style={{ padding: "6px 8px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "5px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                              <div className="mono" style={{ fontSize: "9.5px", color: "var(--text-muted)" }}>TARGET ENDPOINT</div>
                              <div className="mono" style={{ color: "#34d399", fontWeight: 600, fontSize: "10.5px" }}>{t.endpoint}</div>
                            </div>
                          )}
                        </div>

                        {t.details?.expected && (
                          <div style={{
                            padding: "6px 10px", background: "rgba(16, 185, 129, 0.06)",
                            border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "5px",
                            marginBottom: "8px", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            <span style={{ color: "var(--text-muted)" }}>ASSERTION CONTRACT: </span>
                            <span style={{ color: "#34d399" }}>{t.details.expected}</span>
                          </div>
                        )}

                        <div style={{
                          padding: "8px 10px", background: "#02050e", borderRadius: "5px",
                          border: "1px solid rgba(56, 189, 248, 0.15)",
                          fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px",
                          color: "#c9d1d9",
                        }}>
                          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{t.assertion}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Test Completion Verification Banner */}
            {testsComplete && (
              <div style={{
                marginTop: "14px", padding: "12px 16px",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 78, 59, 0.15))",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                borderRadius: "10px", fontSize: "12px", color: "#34d399", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <IconCheck size={18} color="#34d399" />
                  <span>All 8 tests passed (3 integration · 3 unit · 1 regression · 2 security). Queue calculation verified nominal.</span>
                </div>
                <span className="mono" style={{ fontSize: "11px", color: "#34d399" }}>Duration: 66ms</span>
              </div>
            )}
          </div>
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
            padding: "clamp(12px, 4vw, 24px)",
          }}
        >
          <div
            className="glass-card animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "680px", width: "100%", padding: "clamp(16px, 3vw, 26px)",
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
          position: "fixed", bottom: "clamp(16px, 4vw, 30px)", right: "clamp(16px, 4vw, 30px)", zIndex: 99999,
          maxWidth: "calc(100vw - 32px)",
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
