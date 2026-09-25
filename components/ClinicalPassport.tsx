"use client";

import { useState } from "react";

interface PassportRecord {
  id: string;
  patient: string;
  room: string;
  decision: string;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  timestamp: string;
  drivers: { label: string; value: string; shap: number; color: string }[];
  models: string[];
  codeRef: string;
  threshold: number;
  score: number;
  hash: string;
  approved: boolean;
  approvedBy?: string;
}

const PASSPORTS: PassportRecord[] = [
  {
    id: "CP-20260925-001",
    patient: "ANONYMIZED · Room ICU-1, Bed ICU-3",
    room: "ICU",
    decision: "🔴 CRITICAL RISK — Immediate escalation required",
    riskLevel: "CRITICAL",
    timestamp: "2026-09-25 02:47:31 IST",
    drivers: [
      { label: "SpO₂ critically low (91%, falling)", value: "91%", shap: 0.41, color: "#f85149" },
      { label: "Heart rate severe tachycardia (128 bpm)", value: "128 bpm", shap: 0.34, color: "#e3b341" },
      { label: "BP critically low (88/56)", value: "88/56", shap: 0.25, color: "#388bfd" },
    ],
    models: ["BiLSTM (Vitals Trend)", "XGBoost (Lab: Troponin 4.8)", "ClinicalBERT (Nursing Note: URGENT)"],
    codeRef: "computeRiskScore() → sentinelData.js:147 · RISK_CONFIG.critical.threshold = 75",
    threshold: 75, score: 94,
    hash: "sha256:a4f2c891d73e02b1f8a9c5d3e7f1b4a2",
    approved: true, approvedBy: "Dr. Sharma (Clinical Lead) · 2026-09-12",
  },
  {
    id: "CP-20260925-002",
    patient: "ANONYMIZED · Room Ward-B, Bed W-204",
    room: "Ward-B",
    decision: "🟡 HIGH RISK — Monitor closely, escalate if worsening",
    riskLevel: "HIGH",
    timestamp: "2026-09-25 06:15:44 IST",
    drivers: [
      { label: "Platelet count critical (42 × 10³/μL)", value: "42k", shap: 0.38, color: "#f85149" },
      { label: "BP falling (110/70 → 94/62)", value: "94/62", shap: 0.32, color: "#e3b341" },
      { label: "Fever cycling 39.8°C (Dengue NS1+)", value: "39.8°C", shap: 0.30, color: "#388bfd" },
    ],
    models: ["BiLSTM (BP trend)", "XGBoost (Lab: platelets 42)", "ClinicalBERT (Note: bleeding gums)"],
    codeRef: "scoreVitalsTrend() → sentinelData.js:147 · scoreLabValues() → sentinelData.js:195",
    threshold: 75, score: 82,
    hash: "sha256:b7c3d4e1f9a2b8c5d6e7f3a1b9c2d4e1",
    approved: true, approvedBy: "Dr. Sharma (Clinical Lead) · 2026-09-12",
  },
  {
    id: "CP-20260925-003",
    patient: "ANONYMIZED · OPD-3, Consultation",
    room: "OPD",
    decision: "🟢 LOW RISK — Routine monitoring",
    riskLevel: "LOW",
    timestamp: "2026-09-25 09:03:17 IST",
    drivers: [
      { label: "SpO₂ stable (98%)", value: "98%", shap: 0.55, color: "#3fb950" },
      { label: "HR within normal range (74 bpm)", value: "74 bpm", shap: 0.30, color: "#3fb950" },
      { label: "BP controlled (122/80)", value: "122/80", shap: 0.15, color: "#3fb950" },
    ],
    models: ["BiLSTM (Vitals stable)", "XGBoost (Lab: all normal)", "ClinicalBERT (Note: no concerns)"],
    codeRef: "computeRiskScore() → sentinelData.js:147 · Result: score 18 < threshold 40",
    threshold: 40, score: 18,
    hash: "sha256:c9d5e8f2a4b7c1d3e9f5a8b2c6d1e4f7",
    approved: true, approvedBy: "Dr. Mehta (Ward Physician) · 2026-09-15",
  },
];

const LEVEL_COLOR = {
  CRITICAL: "var(--critical)",
  HIGH:     "var(--accent-orange)",
  MODERATE: "var(--accent-blue)",
  LOW:      "var(--accent-green)",
};

export default function ClinicalPassport() {
  const [selected, setSelected] = useState(0);
  const [showRaw, setShowRaw] = useState(false);

  const p = PASSPORTS[selected];
  const color = LEVEL_COLOR[p.riskLevel];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>

        {/* Left: Passport list */}
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>ClinicalPassport™</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
            EU AI Act Article 50 compliant audit trail
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {PASSPORTS.map((pr, i) => (
              <div
                key={pr.id}
                className="glass-card"
                onClick={() => setSelected(i)}
                style={{
                  padding: "14px", cursor: "pointer",
                  borderColor: selected === i ? "rgba(56,139,253,0.4)" : "var(--border)",
                  background: selected === i ? "rgba(56,139,253,0.06)" : undefined,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>{pr.id}</span>
                  <span className={`badge badge-${pr.riskLevel.toLowerCase()}`}>{pr.riskLevel}</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "3px" }}>{pr.room}</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{pr.timestamp.slice(11)}</div>
                {pr.approved && (
                  <div style={{ fontSize: "10px", color: "var(--accent-green)", marginTop: "6px" }}>
                    ✓ Approved · EU AI Act Compliant
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Passport detail */}
        <div className="glass-card" style={{ padding: "28px" }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            paddingBottom: "20px", borderBottom: "1px solid var(--border)", marginBottom: "24px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ fontSize: "22px" }}>📋</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.02em" }}>
                    Clinical Decision Passport
                  </div>
                  <div className="mono" style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {p.id} · MediTrace v1.0 · IBM Bob 2.0
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={`badge badge-${p.riskLevel.toLowerCase()}`} style={{ fontSize: "13px", padding: "6px 14px" }}>
                {p.riskLevel}
              </span>
              {p.approved && (
                <div style={{ fontSize: "11px", color: "var(--accent-green)", marginTop: "6px" }}>
                  ✅ EU AI Act Article 50: COMPLIANT
                </div>
              )}
            </div>
          </div>

          {/* Info row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            {[
              ["Patient", p.patient],
              ["Decision Time", p.timestamp],
              ["Approved By", p.approvedBy || "—"],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "8px", padding: "12px" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "4px", letterSpacing: "0.06em" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Decision */}
          <div style={{
            background: `rgba(${p.riskLevel === "CRITICAL" ? "248,81,73" : p.riskLevel === "HIGH" ? "227,179,65" : "63,185,80"}, 0.06)`,
            border: `1px solid ${color}44`,
            borderRadius: "10px", padding: "16px", marginBottom: "24px",
          }}>
            <div style={{ fontSize: "10px", color: color, fontWeight: 700, marginBottom: "6px", letterSpacing: "0.06em" }}>AI DECISION</div>
            <div style={{ fontSize: "15px", fontWeight: 600 }}>{p.decision}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
              Risk Score: <span className="mono" style={{ color }}>{p.score}</span> / 100 
              &nbsp;·&nbsp; Threshold: <span className="mono">{p.threshold}</span>
            </div>
          </div>

          {/* SHAP Evidence Trail */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px", color: "var(--text-secondary)" }}>
              EVIDENCE TRAIL — SHAP Contributions
            </div>
            {p.drivers.map((d, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{d.label}</span>
                  <span className="mono" style={{ fontSize: "12px", color: d.color, fontWeight: 600 }}>
                    +{d.shap.toFixed(2)}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{
                    width: `${d.shap * 100}%`,
                    background: `linear-gradient(90deg, ${d.color}88, ${d.color})`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Models used */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "10px", color: "var(--text-secondary)" }}>AI MODELS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {p.models.map(m => (
                <span key={m} style={{
                  background: "rgba(56,139,253,0.1)", border: "1px solid rgba(56,139,253,0.2)",
                  borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "var(--accent-blue)",
                }}>{m}</span>
              ))}
            </div>
          </div>

          {/* Code reference + hash */}
          <div style={{
            background: "rgba(5,10,15,0.7)", borderRadius: "8px", padding: "14px",
            border: "1px solid var(--border)", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "6px" }}>CODE REFERENCE</div>
            <div className="mono" style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>{p.codeRef}</div>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "10px", paddingTop: "10px" }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, marginBottom: "4px" }}>ATTESTATION HASH</div>
              <div className="mono" style={{ fontSize: "11px", color: "var(--text-secondary)", wordBreak: "break-all" }}>{p.hash}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => alert("Exporting PDF passport...")}>
              📄 Export PDF
            </button>
            <button className="btn-ghost" onClick={() => setShowRaw(!showRaw)}>
              {showRaw ? "Hide" : "View"} Raw
            </button>
          </div>

          {showRaw && (
            <div className="animate-fade-in" style={{
              marginTop: "16px", background: "rgba(5,10,15,0.8)",
              borderRadius: "8px", padding: "16px", border: "1px solid var(--border)",
            }}>
              <pre className="mono" style={{ fontSize: "10px", color: "var(--accent-green)", overflow: "auto", maxHeight: "200px" }}>
{`{
  "passport_id": "${p.id}",
  "timestamp": "${p.timestamp}",
  "risk_level": "${p.riskLevel}",
  "risk_score": ${p.score},
  "threshold": ${p.threshold},
  "primary_driver": "${p.drivers[0].label}",
  "shap_values": {
    "${p.drivers[0].label}": ${p.drivers[0].shap},
    "${p.drivers[1].label}": ${p.drivers[1].shap},
    "${p.drivers[2].label}": ${p.drivers[2].shap}
  },
  "models_used": ${JSON.stringify(p.models)},
  "code_reference": "${p.codeRef}",
  "attestation_hash": "${p.hash}",
  "eu_ai_act_article_50": "COMPLIANT",
  "nabh_qps5": "ALIGNED",
  "approved": ${p.approved},
  "approved_by": "${p.approvedBy}"
}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
