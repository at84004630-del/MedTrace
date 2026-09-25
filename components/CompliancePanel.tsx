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
    clause: "Article 50(1) — Transparency Obligations",
    requirement: "AI systems must be designed to ensure users can interpret outputs and trace input drivers.",
    status: "compliant",
    score: 96,
    evidence: "ClinicalPassport auto-generates SHAP value decomposition (SpO₂: +0.41, HR: +0.34, BP: +0.25) per alert.",
    codeAnchor: "sentinelData.js:147 · computeRiskScore()",
  },
  {
    id: "COMP-002",
    standard: "EU AI Act",
    clause: "Article 14 — Human Oversight (HITL)",
    requirement: "High-risk AI must permit natural persons to oversee operation, verify alarms, and override decisions.",
    status: "compliant",
    score: 92,
    evidence: "Dual-signoff workflow logged: Dr. Sharma approved thresholds, clinical nurse override capability enabled.",
    codeAnchor: "ClinicalPassport.tsx · approvedBy signature verification",
  },
  {
    id: "COMP-003",
    standard: "EU AI Act",
    clause: "Article 12 — Continuous Record-Keeping & Logging",
    requirement: "Automatic recording of events throughout system lifecycle with cryptographic audit permanence.",
    status: "warning",
    score: 74,
    evidence: "Audit records hashed via SHA-256; cold-storage retention pipeline needs automated weekly rollover hook.",
    codeAnchor: "passport.hash · SHA256 immutable block linkage",
    actionRequired: "Deploy retention rollover cron to long-term S3/GCS immutable compliance bucket",
  },
  {
    id: "COMP-004",
    standard: "NABH QPS.5",
    clause: "QPS.5(a) — Sentinel Event Incident Management",
    requirement: "Documented process to identify near-misses and sentinel events occurring at cross-department handoffs.",
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
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);

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
    setSimulatingAudit(true);
    setAuditResult(null);
    setTimeout(() => {
      setSimulatingAudit(false);
      setAuditResult(
        "MOCK INSPECTION PASSED: EU AI Act Article 50 & NABH QPS.5 readiness verified. 100% of high-risk triage alerts have cryptographic hash verification and SHAP driver transparency. 1 remediation action item flagged for Ward→Pharmacy webhook sync."
      );
    }, 1800);
  };

  const handleExportDossier = () => {
    setDownloadSuccess(true);
    const dossierData = {
      hospital: "MediCore Healthcare Network (Metro Hospital ICU & Wards)",
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
      {/* Top Banner with Score and Actions */}
      <div
        className="glass-card"
        style={{
          padding: "24px 28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          borderLeft: "4px solid var(--accent-cyan)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "20px" }}>🛡️</span>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
              Hospital Regulatory Audit &amp; Defensibility Package
            </h2>
            <span className="badge badge-high">Live Mandate Enforcement</span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "680px", lineHeight: 1.5 }}>
            Automated alignment across <strong style={{ color: "var(--accent-blue)" }}>EU AI Act Article 50</strong> (in force Aug 2026),{" "}
            <strong style={{ color: "var(--accent-cyan)" }}>NABH QPS.5</strong> sentinel event standards, and the{" "}
            <strong style={{ color: "var(--accent-purple)" }}>India DPDP Act 2023</strong>.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Readiness gauge */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Composite Audit Readiness
            </div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--accent-cyan)", lineHeight: 1.1 }}>
              {avgScore}%
            </div>
            <div style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: 600 }}>
              ✓ Legal Defensibility Ready
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleSimulateAudit}
              disabled={simulatingAudit}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                padding: "8px 16px",
              }}
            >
              <span>{simulatingAudit ? "⏳" : "⚖️"}</span>
              <span>{simulatingAudit ? "Simulating Inspector Audit..." : "Simulate Regulatory Audit"}</span>
            </button>

            <button
              onClick={handleExportDossier}
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                padding: "6px 14px",
                justifyContent: "center",
              }}
            >
              <span>📥</span>
              <span>{downloadSuccess ? "Dossier Exported!" : "Export Full Audit Dossier"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Audit Result Box */}
      {auditResult && (
        <div
          className="glass-card animate-slide-up"
          style={{
            padding: "16px 20px",
            background: "rgba(63, 185, 80, 0.08)",
            border: "1px solid rgba(63, 185, 80, 0.3)",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <span style={{ fontSize: "24px" }}>📋</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--accent-green)", marginBottom: "4px" }}>
              MOCK REGULATORY INSPECTION VERIFIED BY IBM BOB
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>
              {auditResult}
            </div>
          </div>
          <button
            onClick={() => setAuditResult(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Standard Selector Tabs */}
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
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: selectedStandard === tab.id ? 600 : 400,
              background: selectedStandard === tab.id ? "rgba(56,139,253,0.18)" : "rgba(255,255,255,0.03)",
              border: selectedStandard === tab.id ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
              color: selectedStandard === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: "11px",
                background: "rgba(255,255,255,0.08)",
                padding: "2px 6px",
                borderRadius: "10px",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Compliance Table and Detail Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px" }}>
        {/* Left: Clause & Verification Matrix */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Regulatory Clause &amp; Verification Matrix
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Click any item to inspect code anchor
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: isSelected ? "rgba(56,139,253,0.12)" : "rgba(255,255,255,0.02)",
                    border: isSelected ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "var(--accent-cyan)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginRight: "8px",
                        }}
                      >
                        {item.standard}
                      </span>
                      <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                        {item.clause}
                      </strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        className={
                          item.status === "compliant"
                            ? "badge badge-ok"
                            : item.status === "warning"
                            ? "badge badge-high"
                            : "badge badge-critical"
                        }
                      >
                        {item.status === "compliant"
                          ? "Compliant"
                          : item.status === "warning"
                          ? "Audit Flag"
                          : "Remediation"}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {item.score}%
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px", lineHeight: 1.4 }}>
                    {item.requirement}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                    <div style={{ color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
                      🔗 {item.codeAnchor}
                    </div>
                    <div style={{ color: "var(--accent-blue)", fontWeight: 500 }}>
                      Inspect Evidence →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Anchor & Legal Defensibility Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {selectedItem ? (
            <div className="glass-card animate-fade-in" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>🔍</span>
                  <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Inspection Inspector</h3>
                </div>
                <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {selectedItem.id}
                </span>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Regulatory Mandate
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-cyan)", marginTop: "2px" }}>
                  {selectedItem.clause}
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Audit Evidence Found in Codebase
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    marginTop: "4px",
                    background: "rgba(0,0,0,0.25)",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    lineHeight: 1.5,
                  }}
                >
                  {selectedItem.evidence}
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Exact MediCore Code Reference
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: "11px",
                    color: "var(--accent-purple)",
                    background: "rgba(188, 140, 255, 0.08)",
                    border: "1px solid rgba(188, 140, 255, 0.2)",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    marginTop: "4px",
                  }}
                >
                  {selectedItem.codeAnchor}
                </div>
              </div>

              {selectedItem.actionRequired && (
                <div
                  style={{
                    background: "rgba(248, 81, 73, 0.08)",
                    border: "1px solid rgba(248, 81, 73, 0.25)",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--critical)", marginBottom: "4px" }}>
                    ⚠️ BOB RECOMMENDED REMEDIATION ACTION
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.4 }}>
                    {selectedItem.actionRequired}
                  </div>
                </div>
              )}

              <button
                onClick={() => alert(`Navigating to IBM Bob automated patch for ${selectedItem.codeAnchor}`)}
                className="btn-primary"
                style={{ width: "100%", fontSize: "12px", padding: "8px" }}
              >
                Apply IBM Bob Automated Code Fix
              </button>
            </div>
          ) : (
            <div
              className="glass-card"
              style={{
                padding: "32px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "240px",
              }}
            >
              <span style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.7 }}>📜</span>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Select a Regulatory Item
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "240px", lineHeight: 1.4 }}>
                Click any clause on the left to inspect the live codebase anchor, SHAP values, or required remediation.
              </p>
            </div>
          )}

          {/* Legal Defensibility Card */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "18px" }}>⚖️</span>
              <h4 style={{ fontSize: "13px", fontWeight: 700 }}>Hospital Legal Defense Summary</h4>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
              In the event of a clinical malpractice claim or regulatory audit, MedTrace guarantees tamper-evident provenance
              for all AI-escalated patient interventions.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Court Defensibility Standard:</span>
                <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>100% Admissible</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Audit Trail Retention:</span>
                <span style={{ color: "var(--text-primary)" }}>7 Years (NABH Standard)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Cryptographic Digest:</span>
                <span className="mono" style={{ color: "var(--accent-cyan)" }}>SHA-256 Block Linked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
