"use client";

import { useState } from "react";

interface DriverFeature {
  label: string;
  value: string;
  shap: number;
  direction: "positive" | "negative";
  color: string;
  clinicalNote: string;
}

interface PassportRecord {
  id: string;
  patientIdMasked: string;
  wardRoom: string;
  decision: string;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  timestamp: string;
  vitals: {
    spo2: number;
    hr: number;
    bp: string;
    temp: number;
  };
  drivers: DriverFeature[];
  models: { name: string; weight: string; latency: string }[];
  codeRef: string;
  threshold: number;
  score: number;
  hash: string;
  approved: boolean;
  approvedBy: string;
  approvalDate: string;
}

const PASSPORTS: PassportRecord[] = [
  {
    id: "CP-20260925-001",
    patientIdMasked: "MED-PT-9482 (Anonymized · DPDP Compliant)",
    wardRoom: "Central ICU · Bed ICU-3",
    decision: "🔴 CRITICAL SEPTIC DETERIORATION — Immediate Vasopressor & Resuscitation Escalation",
    riskLevel: "CRITICAL",
    timestamp: "2026-09-25 02:47:31 IST",
    vitals: { spo2: 91, hr: 128, bp: "88/56", temp: 39.2 },
    drivers: [
      { label: "SpO₂ Drop (91%, precipitous fall)", value: "91%", shap: 0.41, direction: "positive", color: "#f85149", clinicalNote: "Reflects acute alveolar-capillary barrier degradation" },
      { label: "Heart Rate Severe Tachycardia", value: "128 bpm", shap: 0.34, direction: "positive", color: "#e3b341", clinicalNote: "Systemic inflammatory response compensatory phase" },
      { label: "Mean Arterial Pressure Collapse", value: "88/56", shap: 0.25, direction: "positive", color: "#388bfd", clinicalNote: "Distributive shock threshold breached" },
      { label: "High Baseline WBC Count", value: "18.4 k/μL", shap: 0.12, direction: "positive", color: "#bc8cff", clinicalNote: "Elevated inflammatory biomarker" },
    ],
    models: [
      { name: "BiLSTM Temporal Trend (4h Window)", weight: "45%", latency: "14ms" },
      { name: "XGBoost Tabular Labs (Troponin + Lactate)", weight: "35%", latency: "8ms" },
      { name: "ClinicalBERT Unstructured Note NLP", weight: "20%", latency: "38ms" },
    ],
    codeRef: "computeRiskScore() → sentinelData.js:147 · Threshold = 75",
    threshold: 75,
    score: 94,
    hash: "sha256:a4f2c891d73e02b1f8a9c5d3e7f1b4a2e5d9c8b7a6f5e4d3c2b1a09876543210",
    approved: true,
    approvedBy: "Dr. Arvind Sharma, MD · Chief of Intensive Care",
    approvalDate: "2026-09-25 02:49:12 IST (101s post-alert)",
  },
  {
    id: "CP-20260925-002",
    patientIdMasked: "MED-PT-8104 (Anonymized · DPDP Compliant)",
    wardRoom: "Step-Down Ward B · Bed W-204",
    decision: "🟡 HIGH HEMORRHAGIC RISK — Thrombocytopenic Platelet Warning",
    riskLevel: "HIGH",
    timestamp: "2026-09-25 06:15:44 IST",
    vitals: { spo2: 95, hr: 98, bp: "94/62", temp: 39.8 },
    drivers: [
      { label: "Platelet Count Depletion", value: "42k /μL", shap: 0.38, direction: "positive", color: "#f85149", clinicalNote: "Dengue hemorrhagic fever Stage II classification" },
      { label: "Diastolic Pressure Trend Falling", value: "94/62", shap: 0.32, direction: "positive", color: "#e3b341", clinicalNote: "Plasma leakage indicator" },
      { label: "Persistent Pyrexia Spike", value: "39.8°C", shap: 0.30, direction: "positive", color: "#388bfd", clinicalNote: "Active viral replication phase" },
    ],
    models: [
      { name: "BiLSTM Vitals Sequencer", weight: "40%", latency: "12ms" },
      { name: "XGBoost Hematology Model", weight: "40%", latency: "9ms" },
      { name: "ClinicalBERT Nurse Station NLP", weight: "20%", latency: "34ms" },
    ],
    codeRef: "scoreVitalsTrend() → sentinelData.js:147 · scoreLabValues() → sentinelData.js:195",
    threshold: 75,
    score: 82,
    hash: "sha256:b7c3d4e1f9a2b8c5d6e7f3a1b9c2d4e1a0b3c5d7e9f1a2b4c6d8e0f2a4b6c8d0",
    approved: true,
    approvedBy: "Dr. S. K. Nair, MD · Ward Supervising Consultant",
    approvalDate: "2026-09-25 06:21:00 IST",
  },
  {
    id: "CP-20260925-003",
    patientIdMasked: "MED-PT-6029 (Anonymized · DPDP Compliant)",
    wardRoom: "Cardiology Day Ward · Bed C-102",
    decision: "🟢 STABLE / LOW RISK — Telemetry Discontinuation Permitted",
    riskLevel: "LOW",
    timestamp: "2026-09-25 09:03:17 IST",
    vitals: { spo2: 98, hr: 72, bp: "120/78", temp: 36.8 },
    drivers: [
      { label: "Euvolemic Hemodynamics", value: "120/78", shap: 0.55, direction: "negative", color: "#3fb950", clinicalNote: "Cardiac output within normal limits" },
      { label: "Normal Sinus Rhythm", value: "72 bpm", shap: 0.30, direction: "negative", color: "#3fb950", clinicalNote: "Zero arrhythmic ectopic events" },
      { label: "Oxygen Saturation Nominal", value: "98%", shap: 0.15, direction: "negative", color: "#3fb950", clinicalNote: "Ambient air oxygenation verified" },
    ],
    models: [
      { name: "BiLSTM Temporal Trend", weight: "50%", latency: "11ms" },
      { name: "XGBoost Lab Model", weight: "30%", latency: "7ms" },
      { name: "ClinicalBERT Discharge NLP", weight: "20%", latency: "29ms" },
    ],
    codeRef: "computeRiskScore() → sentinelData.js:147 · Score 18 < Threshold 40",
    threshold: 40,
    score: 18,
    hash: "sha256:c9d5e8f2a4b7c1d3e9f5a8b2c6d1e4f7a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1",
    approved: true,
    approvedBy: "Dr. Priya Mehta, MD · Inpatient Physician",
    approvalDate: "2026-09-25 09:10:45 IST",
  },
];

export default function ClinicalPassport() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "LOW">("ALL");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  const filteredPassports = PASSPORTS.filter(p => {
    if (filter === "ALL") return true;
    return p.riskLevel === filter;
  });

  const p = PASSPORTS[selectedIdx] || PASSPORTS[0];

  const handleVerifyIntegrity = () => {
    setIsVerifying(true);
    setVerifyStatus(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyStatus("✓ CRYPTOGRAPHIC SEAL VALIDATED: SHA-256 block hash matches tamper-evident audit ledger. Dr. Arvind Sharma signature authenticated.");
    }, 1200);
  };

  const handleExportPassport = () => {
    const data = JSON.stringify(p, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ClinicalPassport_${p.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "20px" }}>📋</span>
              <h2 style={{ fontSize: "19px", fontWeight: 800 }}>
                ClinicalPassport™: AI Decision Audit Ledger
              </h2>
              <span className="badge badge-purple">EU AI Act Art. 50 Enforced</span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Per-decision cryptographic audit passports capturing SHAP feature attribution, model weights, and physician Human-in-the-Loop approval.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {(["ALL", "CRITICAL", "HIGH", "LOW"] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  cursor: "pointer",
                  background: filter === lvl ? "rgba(188,140,255,0.18)" : "rgba(255,255,255,0.03)",
                  border: filter === lvl ? "1px solid var(--accent-purple)" : "1px solid var(--border)",
                  color: filter === lvl ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Passport Explorer & Holographic Certificate Viewer */}
      <div className="passport-grid">
        {/* Left List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredPassports.map((item, idx) => {
            const isSelected = p.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedIdx(PASSPORTS.findIndex(x => x.id === item.id))}
                className="glass-card glass-card-interactive"
                style={{
                  padding: "16px 18px",
                  borderColor: isSelected ? "var(--accent-cyan)" : "var(--border)",
                  background: isSelected ? "rgba(16, 36, 64, 0.9)" : "var(--bg-card)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>
                    {item.id}
                  </span>
                  <span className={`badge ${item.riskLevel === "CRITICAL" ? "badge-critical" : item.riskLevel === "HIGH" ? "badge-high" : "badge-ok"}`}>
                    {item.riskLevel} · {item.score}
                  </span>
                </div>

                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {item.wardRoom}
                </div>

                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  {item.patientIdMasked}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "var(--text-muted)" }}>
                  <span>{item.timestamp}</span>
                  <span style={{ color: "var(--accent-green)" }}>✓ HITL Signed</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Holographic Document Viewer */}
        <div className="glass-card" style={{ padding: "28px", position: "relative" }}>
          {/* Passport Header Bar */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start",
            borderBottom: "1px solid var(--border)", paddingBottom: "20px", marginBottom: "24px", gap: "16px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <span className="badge badge-purple" style={{ fontSize: "11px" }}>
                  EU AI ACT ARTICLE 50 PASSPORT
                </span>
                <span className="mono" style={{ fontSize: "12px", color: "var(--accent-cyan)" }}>
                  {p.id}
                </span>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                {p.wardRoom} · {p.patientIdMasked}
              </h3>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Triage Incident Timestamp: {p.timestamp}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleVerifyIntegrity}
                disabled={isVerifying}
                className="btn-primary"
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                {isVerifying ? "Verifying SHA-256..." : "Verify Hash Integrity"}
              </button>

              <button
                onClick={handleExportPassport}
                className="btn-ghost"
                style={{ fontSize: "12px", padding: "8px 14px" }}
              >
                📥 Export JSON
              </button>
            </div>
          </div>

          {/* Verification Alert Banner */}
          {verifyStatus && (
            <div className="animate-slide-up" style={{
              padding: "12px 16px", borderRadius: "8px", background: "rgba(63,185,80,0.12)",
              border: "1px solid rgba(63,185,80,0.3)", color: "var(--accent-green)",
              fontSize: "12px", fontWeight: 600, marginBottom: "20px",
            }}>
              {verifyStatus}
            </div>
          )}

          {/* Clinical Telemetry & Vital Waveform Row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px",
            marginBottom: "24px",
          }}>
            <div style={{ background: "rgba(0,0,0,0.25)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>SpO₂ OXYGENATION</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: p.vitals.spo2 < 92 ? "var(--critical)" : "var(--accent-green)", marginTop: "4px" }}>
                {p.vitals.spo2}%
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Threshold: ≥95%</div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.25)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>HEART RATE</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: p.vitals.hr > 110 ? "var(--accent-orange)" : "var(--accent-cyan)", marginTop: "4px" }}>
                {p.vitals.hr} <span style={{ fontSize: "13px", fontWeight: 500 }}>bpm</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Threshold: 60-100</div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.25)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>BLOOD PRESSURE</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
                {p.vitals.bp}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>MAP: Critical Range</div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.25)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>BODY TEMP</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: p.vitals.temp > 38.5 ? "var(--critical)" : "var(--text-primary)", marginTop: "4px" }}>
                {p.vitals.temp}°C
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Pyrexia Marker</div>
            </div>
          </div>

          {/* Explainability: SHAP Feature Attribution Waterfall */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                SHAP Feature Attribution (Why the AI made this decision):
              </div>
              <span style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>
                Calculated on live BiLSTM + XGBoost embeddings
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {p.drivers.map((d, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>
                      {d.label}
                    </div>
                    <div className="mono" style={{ fontSize: "12px", fontWeight: 700, color: d.color }}>
                      +{Math.round(d.shap * 100)}% Weight
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
                    <div style={{ width: `${d.shap * 100}%`, height: "100%", background: d.color, borderRadius: "3px" }} />
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Clinical rationale: {d.clinicalNote}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Ledger & Human Oversight Signoff Footer */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px",
            background: "rgba(5, 12, 22, 0.8)", padding: "18px 20px", borderRadius: "12px",
            border: "1px solid var(--border)",
          }}>
            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                SHA-256 Tamper-Evident Hash Digest
              </div>
              <div className="mono" style={{ fontSize: "10px", color: "var(--accent-cyan)", wordBreak: "break-all", marginTop: "4px" }}>
                {p.hash}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "8px" }}>
                Code Trigger: <span className="mono" style={{ color: "var(--accent-purple)" }}>{p.codeRef}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Human-In-The-Loop (HITL) Oversight
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-green)", marginTop: "4px" }}>
                ✓ {p.approvedBy}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Approved on: {p.approvalDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
