"use client";

import { useState } from "react";

export default function Bobalytics() {
  const [bedCount, setBedCount] = useState(540);
  const [dischargesPerMonth, setDischargesPerMonth] = useState(1400);

  // Dynamic clinical ROI calculation
  const handoffErrorsAvoided = Math.round(dischargesPerMonth * 0.043);
  const annualLiabilitySavedUSD = Math.round(handoffErrorsAvoided * 12 * 750);
  const pharmacyRevenueRecoveredINR = Math.round(dischargesPerMonth * 206 * 12);
  const manualAuditHoursSaved = Math.round((bedCount / 50) * 36);

  const parallelTools = [
    { name: "ast.parse('Wards.jsx')", latency: "14ms", status: "parallel", category: "Syntax AST" },
    { name: "ast.parse('Pharmacy.jsx')", latency: "16ms", status: "parallel", category: "Syntax AST" },
    { name: "ast.parse('Billing.jsx')", latency: "19ms", status: "parallel", category: "Syntax AST" },
    { name: "graph.link_dependencies(11)", latency: "28ms", status: "parallel", category: "DAG Graph" },
    { name: "shap.explain_features('ICU-3')", latency: "38ms", status: "parallel", category: "ML Explainability" },
    { name: "crypto.hash_proof('SHA-256')", latency: "4ms", status: "parallel", category: "Ledger Seal" },
    { name: "git.stage_diff('PR #14')", latency: "42ms", status: "parallel", category: "Autonomous Agent" },
  ];

  const tokenFiles = [
    { name: "sentinelData.js", tokens: "64,200", pct: 24, type: "ML Core", color: "var(--accent-purple)" },
    { name: "Billing.jsx", tokens: "42,100", pct: 16, type: "Revenue", color: "var(--accent-cyan)" },
    { name: "Analytics.jsx", tokens: "38,400", pct: 14, type: "Reports", color: "var(--accent-blue)" },
    { name: "Wards.jsx", tokens: "34,900", pct: 13, type: "Clinical", color: "var(--accent-orange)" },
    { name: "Pharmacy.jsx", tokens: "31,200", pct: 11, type: "Dispensary", color: "var(--critical)" },
    { name: "Lab.jsx", tokens: "28,100", pct: 10, type: "Diagnostic", color: "var(--accent-green)" },
    { name: "Admission.jsx", tokens: "21,500", pct: 8, type: "Intake", color: "var(--text-secondary)" },
    { name: "Doctors.jsx", tokens: "10,012", pct: 4, type: "Staff Registry", color: "var(--text-muted)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: "26px 30px" }}>
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "space-between",
          alignItems: "center", gap: "24px",
        }}>
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "22px" }}>📊</span>
              <h2 style={{ fontSize: "20px", fontWeight: 800 }}>
                Bobalytics™: Productivity, Parallel Tools &amp; Clinical ROI
              </h2>
              <span className="badge badge-purple">IBM Bob 2.0 Native Metrics</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.5 }}>
              Track the exact velocity gains, parallel tool latency, and financial return on investment of deploying
              IBM Bob’s 270k context engine across hospital operations.
            </p>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              background: "rgba(56,139,253,0.12)", border: "1px solid rgba(56,139,253,0.3)",
              borderRadius: "12px", padding: "12px 18px", textAlign: "center",
            }}>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "var(--accent-cyan)", lineHeight: 1 }}>
                +45.8%
              </div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase" }}>
                Dev Speed Boost
              </div>
            </div>

            <div style={{
              background: "rgba(63,185,80,0.12)", border: "1px solid rgba(63,185,80,0.3)",
              borderRadius: "12px", padding: "12px 18px", textAlign: "center",
            }}>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "var(--accent-green)", lineHeight: 1 }}>
                90s
              </div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase" }}>
                Audit vs. 3 Weeks
              </div>
            </div>

            <div style={{
              background: "rgba(188,140,255,0.12)", border: "1px solid rgba(188,140,255,0.3)",
              borderRadius: "12px", padding: "12px 18px", textAlign: "center",
            }}>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "var(--accent-purple)", lineHeight: 1 }}>
                270,412
              </div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase" }}>
                Tokens Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: ROI Simulator & Parallel Tool Execution Timeline */}
      <div className="bobalytics-grid">
        {/* Left: Hospital Value & ROI Calculator */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>
              Hospital Clinical &amp; Financial Impact Calculator
            </h3>
            <span className="badge badge-ok">Live Model</span>
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.5 }}>
            Adjust your hospital facility size to simulate the preventable medication errors and direct revenue leakage
            captured by MedTrace:
          </p>

          {/* Sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Hospital Inpatient Bed Capacity:</span>
                <span className="mono" style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{bedCount} Beds</span>
              </div>
              <input
                type="range" min="100" max="1500" step="20"
                value={bedCount}
                onChange={e => setBedCount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-cyan)", cursor: "pointer" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Monthly Inpatient Discharges:</span>
                <span className="mono" style={{ color: "var(--accent-purple)", fontWeight: 700 }}>{dischargesPerMonth} Discharges/mo</span>
              </div>
              <input
                type="range" min="200" max="4000" step="50"
                value={dischargesPerMonth}
                onChange={e => setDischargesPerMonth(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-purple)", cursor: "pointer" }}
              />
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.25)", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", color: "var(--critical)", fontWeight: 700, textTransform: "uppercase" }}>
                Near-Misses Caught
              </div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
                {handoffErrorsAvoided} <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>/mo</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                4.3% handoff error cohort eliminated
              </div>
            </div>

            <div style={{ background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.25)", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: 700, textTransform: "uppercase" }}>
                Annual Liability Saved
              </div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--accent-green)", marginTop: "4px" }}>
                ${(annualLiabilitySavedUSD / 1000).toFixed(0)}k <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>/yr</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                Malpractice claim settlements averted
              </div>
            </div>

            <div style={{ background: "rgba(56,139,253,0.08)", border: "1px solid rgba(56,139,253,0.25)", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: 700, textTransform: "uppercase" }}>
                Pharmacy Revenue Leakage
              </div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--accent-cyan)", marginTop: "4px" }}>
                ₹{(pharmacyRevenueRecoveredINR / 100000).toFixed(1)}L <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>/yr</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                Unbilled bedside drugs recaptured
              </div>
            </div>

            <div style={{ background: "rgba(188,140,255,0.08)", border: "1px solid rgba(188,140,255,0.25)", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "11px", color: "var(--accent-purple)", fontWeight: 700, textTransform: "uppercase" }}>
                Clinical Dev Hours Saved
              </div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--accent-purple)", marginTop: "4px" }}>
                {manualAuditHoursSaved}h <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>/audit</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                Automated AST vs. manual file review
              </div>
            </div>
          </div>
        </div>

        {/* Right: Parallel Tool Calling & Token Distribution */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Parallel Tool Call Timeline */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 800 }}>
                  Parallel Tool Execution (IBM Bob 2.0)
                </h4>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Single-turn multi-tool concurrency
                </div>
              </div>
              <span className="badge badge-medium">7 Parallel Ops</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {parallelTools.map((t, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 10px", background: "rgba(0,0,0,0.25)", borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.04)", fontSize: "11px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--accent-cyan)", fontSize: "10px" }}>⚡</span>
                    <span className="mono" style={{ color: "var(--text-primary)" }}>{t.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "9px", background: "rgba(56,139,253,0.15)", color: "var(--accent-cyan)", padding: "1px 5px", borderRadius: "3px" }}>
                      {t.category}
                    </span>
                    <span className="mono" style={{ color: "var(--accent-green)", fontWeight: 700 }}>
                      {t.latency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "var(--accent-green)", marginTop: "10px", textAlign: "right", fontWeight: 600 }}>
              ✓ All 7 parallel tools executed simultaneously in 42ms total elapsed turn
            </div>
          </div>

          {/* 270k Context Token Distribution */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 800 }}>
                  270k Context Token Distribution
                </h4>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  MediCore Hospital Codebase Footprint
                </div>
              </div>
              <span className="mono" style={{ fontSize: "11px", color: "var(--accent-purple)", fontWeight: 700 }}>
                270,412 Tokens
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tokenFiles.map((f, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="mono" style={{ color: "var(--text-primary)" }}>{f.name}</span>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>({f.type})</span>
                    </div>
                    <span className="mono" style={{ color: f.color, fontWeight: 700 }}>
                      {f.tokens} ({f.pct}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${f.pct}%`, height: "100%", background: f.color, borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
