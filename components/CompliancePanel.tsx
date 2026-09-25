"use client";

import { useState } from "react";

type StandardId = "all" | "eu_ai_act" | "nabh" | "dpdp";

interface ComplianceItem {
  id: string;
  standard: "EU AI Act" | "NABH QPS.5" | "DPDP Act 2023";
  clause: string;
  requirement: string;
  status: "compliant" | "warning" | "remediation";
  score: number;
  evidence: string;
  codeAnchor: string;
  actionRequired?: string;
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: "COMP-001",
    standard: "EU AI Act",
    clause: "Article 50(1) — Transparency & Explainability Obligations",
    requirement: "High-risk clinical AI must be interpretable; clinicians must be able to verify feature weights behind patient triage.",
    status: "compliant",
    score: 96,
    evidence: "ClinicalPassport auto-generates SHAP value decomposition (SpO₂: +0.41, HR: +0.34, BP: +0.25) per alert.",
    codeAnchor: "sentinelData.js:147 · computeRiskScore()",
  },
  {
    id: "COMP-002",
    standard: "EU AI Act",
    clause: "Article 14 — Human-in-the-Loop (HITL) Oversight",
    requirement: "Natural persons must oversee operation, maintain override capabilities, and approve critical risk threshold configurations.",
    status: "compliant",
    score: 92,
    evidence: "Dual-signoff workflow logged: Dr. Arvind Sharma approved thresholds, clinical nurse override capability authenticated.",
    codeAnchor: "ClinicalPassport.tsx · approvedBy signature verification",
  },
  {
    id: "COMP-003",
    standard: "EU AI Act",
    clause: "Article 12 — Continuous Record-Keeping & Traceability",
    requirement: "Automatic recording of events throughout system lifecycle with cryptographic audit permanence.",
    status: "warning",
    score: 74,
    evidence: "Audit records hashed via SHA-256; automated 7-year immutable cold-storage retention hook recommended.",
    codeAnchor: "passport.hash · SHA256 immutable block linkage",
    actionRequired: "Deploy retention rollover cron to long-term S3/GCS compliance bucket",
  },
  {
    id: "COMP-004",
    standard: "NABH QPS.5",
    clause: "QPS.5(a) — Sentinel Event & Near-Miss Incident Management",
    requirement: "Documented Root Cause Analysis (RCA) to eliminate near-misses and sentinel events occurring at cross-department handoffs.",
    status: "remediation",
    score: 65,
    evidence: "NexusGuard flagged 3 cross-module gaps (Ward discharge ↛ Pharmacy close; Pharmacy ↛ Billing).",
    codeAnchor: "Wards.jsx ↔ Pharmacy.jsx · GAP-001",
    actionRequired: "Merge Bob-generated PR #14: adds automated pharmacy prescription close upon ward bed release",
  },
  {
    id: "COMP-005",
    standard: "NABH QPS.5",
    clause: "QPS.5(d) — Continuous Quality Improvement (CQI)",
    requirement: "Clinical AI false-positive rate and alarm fatigue metrics must be formally reported quarterly to CQI committee.",
    status: "compliant",
    score: 90,
    evidence: "MediSentinel logs alarm specificity (94.2%) and clinical escalation utility rate directly to analytics.",
    codeAnchor: "HeroStats.tsx · Compliance & Decision metrics",
  },
  {
    id: "COMP-006",
    standard: "DPDP Act 2023",
    clause: "Section 8(1) — Data Fiduciary Anonymization",
    requirement: "Protected Health Information (PHI) must be anonymized before telemetry ingestion into AI decision models.",
    status: "compliant",
    score: 98,
    evidence: "Patient names and phone numbers masked at edge. AI passports log anonymized bed identifiers (ICU-3).",
    codeAnchor: "sentinelData.js · patientMaskingFilter()",
  },
  {
    id: "COMP-007",
    standard: "DPDP Act 2023",
    clause: "Section 9 — Processing of Sensitive Personal Data",
    requirement: "Explicit purpose limitation: AI scoring restricted exclusively to active inpatient physiological triage.",
    status: "compliant",
    score: 94,
    evidence: "Audit trail confirms zero clinical vector export to external marketing or non-clinical downstream APIs.",
    codeAnchor: "Billing.jsx & Analytics.jsx access control gates",
  },
];

export default function CompliancePanel() {
  const [selectedStandard, setSelectedStandard] = useState<StandardId>("all");
  const [simulatingAudit, setSimulatingAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(COMPLIANCE_ITEMS[0]);

  const filteredItems = COMPLIANCE_ITEMS.filter((item) => {
    if (selectedStandard === "eu_ai_act") return item.standard === "EU AI Act";
    if (selectedStandard === "nabh") return item.standard === "NABH QPS.5";
    if (selectedStandard === "dpdp") return item.standard === "DPDP Act 2023";
    return true;
  });

  const avgScore = Math.round(
    filteredItems.reduce((acc, curr) => acc + curr.score, 0) / (filteredItems.length || 1)
  );

  const handleSimulateAudit = () => {
    setShowTerminal(true);
    setSimulatingAudit(true);
    setAuditLogs([]);

    const steps = [
      "Connecting to hospital AST repository: 11 MediCore modules located...",
      "[EU AI Act Art. 50] Ingesting SHAP explainability weights for high-risk triage alerts... [PASSED]",
      "[EU AI Act Art. 14] Validating Human-In-The-Loop signature: Dr. Arvind Sharma verified... [PASSED]",
      "[NABH QPS.5] Inspecting module boundaries: Wards.jsx ↔ Pharmacy.jsx... [FLAGGED: GAP-001]",
      "[DPDP Act 2023] Verifying edge cryptographic anonymization for patient records... [PASSED: 98%]",
      "Calculating composite institutional legal defensibility... [87% AUDIT READY]",
      "✅ Regulatory scan completed: Hospital is defensible in court against malpractice & AI liability claims.",
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setAuditLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setSimulatingAudit(false);
        }
      }, (idx + 1) * 350);
    });
  };

  const handleExportDossier = () => {
    setDownloadSuccess(true);
    const dossierData = {
      hospital: "Metro General Hospital · Central ICU & Wards (540 Beds)",
      auditTool: "MedTrace Powered by IBM Bob 2.0 Agentic Framework",
      generatedAt: new Date().toISOString(),
      standards: [
        { name: "EU AI Act Article 50", status: "Compliant", score: "87%" },
        { name: "NABH 5th Edition QPS.5", status: "Remediation In-Flight", score: "78%" },
        { name: "India DPDP Act 2023", status: "Compliant", score: "96%" },
      ],
      complianceScore: `${avgScore}%`,
      items: COMPLIANCE_ITEMS,
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MedTrace_Audit_Dossier_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner with Circular Gauges */}
      <div className="glass-card" style={{ padding: "26px 30px" }}>
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "space-between",
          alignItems: "center", gap: "24px",
        }}>
          <div style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "22px" }}>🛡️</span>
              <h2 style={{ fontSize: "20px", fontWeight: 800 }}>
                Hospital Regulatory Audit &amp; Legal Defensibility Suite
              </h2>
              <span className="badge badge-high">Live Mandates Active</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.5 }}>
              Continuous automated enforcement across <strong style={{ color: "var(--accent-cyan)" }}>EU AI Act Article 50</strong> (high-risk AI transparency),{" "}
              <strong style={{ color: "var(--accent-blue)" }}>NABH 5th Edition QPS.5</strong> sentinel event governance, and the{" "}
              <strong style={{ color: "var(--accent-purple)" }}>India DPDP Act 2023</strong>.
            </p>
          </div>

          {/* Three Circular Progress Gauges */}
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {[
              { label: "EU AI ACT", score: 87, color: "var(--accent-cyan)" },
              { label: "NABH QPS.5", score: 78, color: "var(--accent-orange)" },
              { label: "DPDP 2023", score: 96, color: "var(--accent-green)" },
            ].map(gauge => (
              <div key={gauge.label} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: "70px", height: "70px", margin: "0 auto 6px" }}>
                  <svg width="70" height="70" viewBox="0 0 70 70">
                    <circle cx="35" cy="35" r="28" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
                    <circle
                      cx="35" cy="35" r="28"
                      stroke={gauge.color}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - gauge.score / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 35 35)"
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", fontWeight: 800, color: "var(--text-primary)",
                  }}>
                    {gauge.score}%
                  </div>
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                  {gauge.label}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleSimulateAudit}
              className="btn-primary"
              style={{ fontSize: "13px", padding: "10px 18px" }}
            >
              <span>⚖️</span>
              <span>Run Live Mock Inspection</span>
            </button>

            <button
              onClick={() => setShowDossierModal(true)}
              className="btn-ghost"
              style={{ fontSize: "12px", padding: "8px 16px", justifyContent: "center" }}
            >
              <span>📜</span>
              <span>Preview Official Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Modal for Mock Regulatory Audit */}
      {showTerminal && (
        <div className="glass-card animate-slide-up" style={{ padding: "20px 24px", background: "#060d17", border: "1px solid var(--border-bright)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge badge-medium">Terminal</span>
              <strong style={{ fontSize: "13px" }}>IBM Bob Autonomous Regulatory Verification Runner</strong>
            </div>
            <button
              onClick={() => setShowTerminal(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px" }}
            >
              ✕
            </button>
          </div>

          <div className="mono" style={{ fontSize: "12px", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "6px" }}>
            {auditLogs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes("PASSED") ? "var(--accent-green)" : log.includes("FLAGGED") ? "var(--critical)" : "var(--accent-cyan)" }}>
                {log}
              </div>
            ))}
            {simulatingAudit && (
              <div style={{ color: "var(--text-muted)" }}>
                _ scanning telemetry schemas...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {[
          { id: "all" as StandardId, label: "All Regulations", count: COMPLIANCE_ITEMS.length },
          { id: "eu_ai_act" as StandardId, label: "EU AI Act Art. 50 (High-Risk AI)", count: 3 },
          { id: "nabh" as StandardId, label: "NABH 5th Ed. QPS.5 (Patient Safety)", count: 2 },
          { id: "dpdp" as StandardId, label: "DPDP Act 2023 (Data Privacy)", count: 2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStandard(tab.id)}
            style={{
              padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
              fontWeight: selectedStandard === tab.id ? 700 : 500,
              background: selectedStandard === tab.id ? "rgba(56,139,253,0.18)" : "rgba(255,255,255,0.03)",
              border: selectedStandard === tab.id ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
              color: selectedStandard === tab.id ? "var(--accent-cyan)" : "var(--text-secondary)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "10px" }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Compliance Clauses & Evidence Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        {/* Left: Clauses Table */}
        <div className="glass-card" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>
              Mandate Clause Verification Matrix
            </h3>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Select item to view source code verification
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredItems.map(item => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: "14px 16px", borderRadius: "10px",
                    background: isSelected ? "rgba(56,139,253,0.12)" : "rgba(255,255,255,0.02)",
                    border: isSelected ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", marginRight: "8px" }}>
                        {item.standard}
                      </span>
                      <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                        {item.clause}
                      </strong>
                    </div>

                    <span className={item.status === "compliant" ? "badge badge-ok" : item.status === "warning" ? "badge badge-high" : "badge badge-critical"}>
                      {item.score}%
                    </span>
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", lineHeight: 1.4 }}>
                    {item.requirement}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                    <span className="mono" style={{ color: "var(--text-muted)" }}>
                      🔗 {item.codeAnchor}
                    </span>
                    <span style={{ color: "var(--accent-blue)", fontWeight: 600 }}>
                      Inspect Proof →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Evidence & Remediation Action Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {selectedItem && (
            <div className="glass-card animate-fade-in" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="badge badge-purple">{selectedItem.standard}</span>
                <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {selectedItem.id}
                </span>
              </div>

              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>
                {selectedItem.clause}
              </h4>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                  Codebase Evidence Found:
                </div>
                <div style={{
                  background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px",
                  border: "1px solid var(--border)", fontSize: "12px", lineHeight: 1.5,
                }}>
                  {selectedItem.evidence}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                  AST Code Reference:
                </div>
                <div className="mono" style={{
                  fontSize: "11px", color: "var(--accent-cyan)",
                  background: "rgba(88,214,232,0.08)", border: "1px solid rgba(88,214,232,0.2)",
                  padding: "8px 12px", borderRadius: "6px",
                }}>
                  {selectedItem.codeAnchor}
                </div>
              </div>

              {selectedItem.actionRequired && (
                <div style={{
                  background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.25)",
                  borderRadius: "8px", padding: "12px", marginBottom: "16px",
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--critical)", marginBottom: "4px" }}>
                    ⚠️ BOB RECOMMENDED REMEDIATION
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4 }}>
                    {selectedItem.actionRequired}
                  </div>
                </div>
              )}

              <button
                onClick={() => alert(`Staging PR in MediCore repository to enforce compliance on ${selectedItem.codeAnchor}`)}
                className="btn-primary"
                style={{ width: "100%", fontSize: "12px" }}
              >
                Apply IBM Bob Automated Patch
              </button>
            </div>
          )}

          {/* Legal Defensibility Certificate Summary */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "18px" }}>⚖️</span>
              <h4 style={{ fontSize: "13px", fontWeight: 700 }}>Hospital Legal Defense Summary</h4>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
              In clinical negligence or AI bias lawsuits, MedTrace guarantees tamper-evident provenance
              for all automated patient triage decisions.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Court Defensibility:</span>
                <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>100% Admissible Evidence</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>NABH Standard QPS.5:</span>
                <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>RCA Alignment Verified</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Cryptographic Digest:</span>
                <span className="mono" style={{ color: "var(--accent-purple)" }}>SHA-256 Block-Linked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Institutional Dossier Modal */}
      {showDossierModal && (
        <div className="modal-overlay" onClick={() => setShowDossierModal(false)}>
          <div
            className="glass-card animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "800px", width: "100%", maxHeight: "85vh", overflowY: "auto",
              padding: "36px", boxShadow: "0 24px 60px rgba(0,0,0,0.85)", border: "1px solid var(--border-bright)",
            }}
          >
            {/* Dossier Header */}
            <div style={{ borderBottom: "2px solid var(--border)", paddingBottom: "20px", marginBottom: "24px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "var(--accent-cyan)", fontWeight: 800 }}>
                  OFFICIAL HOSPITAL ACCREDITATION AUDIT PACKAGE
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 900, marginTop: "4px" }}>
                  MedTrace Institutional Compliance Dossier
                </h2>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Metro General Hospital · Central ICU &amp; Inpatient Wards (540 Beds)
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span className="badge badge-high" style={{ fontSize: "12px" }}>
                  87% READY
                </span>
                <div className="mono" style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Ref: MT-AUD-2026-09
                </div>
              </div>
            </div>

            {/* Content summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px", fontSize: "13px" }}>
              <div style={{ background: "rgba(0,0,0,0.25)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "var(--accent-cyan)" }}>Executive Summary:</strong>
                <p style={{ marginTop: "6px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  This dossier certifies that all 11 modules comprising the MediCore Hospital Management System
                  have been analyzed under IBM Bob 2.0. High-risk AI scoring systems comply with EU AI Act Article 50
                  transparency mandates with full SHAP decomposition and Human-In-The-Loop clinical oversight.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <strong style={{ fontSize: "14px" }}>Regulatory Standard Scores:</strong>
                {COMPLIANCE_ITEMS.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                    <span style={{ color: "var(--text-primary)" }}>{c.clause}</span>
                    <span className="mono" style={{ color: c.score > 85 ? "var(--accent-green)" : "var(--accent-orange)", fontWeight: 700 }}>{c.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dossier Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Digitally Sealed with SHA-256 cryptographic proof
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowDossierModal(false)} className="btn-ghost" style={{ fontSize: "12px" }}>
                  Close
                </button>
                <button onClick={handleExportDossier} className="btn-primary" style={{ fontSize: "12px" }}>
                  <span>📥</span>
                  <span>{downloadSuccess ? "Dossier Exported!" : "Download PDF / JSON"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
