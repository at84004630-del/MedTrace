"use client";

import { useState } from "react";

interface ModuleNode {
  id: string;
  label: string;
  filename: string;
  icon: string;
  x: number;
  y: number;
  description: string;
  emits: string[];
  consumes: string[];
}

const MODULES: ModuleNode[] = [
  { id: "admission",    label: "Admission",        filename: "Admission.jsx",   icon: "🏥", x: 60,  y: 60,  description: "Inpatient intake and registration", emits: ["patientId", "admissionTimestamp", "assignedWard"], consumes: [] },
  { id: "wards",        label: "Wards.jsx",         filename: "Wards.jsx",       icon: "🛏️", x: 250, y: 60,  description: "Bed management and vital telemetry", emits: ["bedId", "vitalsStream", "dischargeEvent"], consumes: ["patientId", "assignedWard"] },
  { id: "medisentinel", label: "MediSentinel™",     filename: "sentinelData.js", icon: "🧠", x: 450, y: 60,  description: "Multimodal BiLSTM + XGBoost triage AI", emits: ["riskScore", "criticalEscalationAlert", "shapFactors"], consumes: ["vitalsStream", "labResults"] },
  { id: "pharmacy",     label: "Pharmacy.jsx",      filename: "Pharmacy.jsx",    icon: "💊", x: 250, y: 220, description: "Drug inventory and bedside dispensing", emits: ["dispensedDrugBatch", "stockLevel"], consumes: ["activePrescription (MISSING)"] },
  { id: "lab",          label: "Lab Results",       filename: "Lab.jsx",         icon: "🔬", x: 450, y: 220, description: "Pathology and hematology diagnostic labs", emits: ["troponinLevel", "plateletCount", "bloodGas"], consumes: ["patientId"] },
  { id: "billing",      label: "Billing.jsx",       filename: "Billing.jsx",     icon: "💰", x: 650, y: 220, description: "Insurance claims and invoice generation", emits: ["invoiceFinal", "outstandingBalance"], consumes: ["bedCharges", "drugLineItems (MISSING)"] },
  { id: "analytics",    label: "Analytics",         filename: "Analytics.jsx",   icon: "📊", x: 650, y: 60,  description: "Executive and hospital capacity reports", emits: ["mortalityTrend", "bedTurnaroundRate"], consumes: ["billingRevenue (DISCONNECTED)"] },
  { id: "appointments", label: "Appointments",      filename: "Appointments.jsx",icon: "📅", x: 60,  y: 220, description: "Outpatient and consultation scheduler", emits: ["consultSlot", "assignedDoctor"], consumes: ["patientId"] },
  { id: "doctors",      label: "Doctors",           filename: "Doctors.jsx",     icon: "👨‍⚕️", x: 60,  y: 360, description: "Staff registry and attending physicians", emits: ["clinicalNotes", "physicianSignoff"], consumes: ["consultSlot"] },
  { id: "patients",     label: "Patients DB",       filename: "mockData.js",     icon: "🗃️", x: 250, y: 360, description: "Core electronic health records repository", emits: ["patientProfile", "insurancePolicyId"], consumes: [] },
  { id: "notifications",label: "Alert Engine",      filename: "Notifications.jsx",icon: "🔔", x: 450, y: 360, description: "Pager and nurse station escalation alerts", emits: ["smsBroadcast", "codeBluePager"], consumes: ["criticalEscalationAlert"] },
];

type LinkStatus = "ok" | "gap" | "partial";

interface ModuleLink {
  from: string;
  to: string;
  status: LinkStatus;
  label: string;
  gapId?: number;
}

const LINKS: ModuleLink[] = [
  { from: "admission",    to: "wards",        status: "ok",      label: "Patient → Bed Assignment ✓" },
  { from: "wards",        to: "medisentinel", status: "ok",      label: "Vitals Stream → AI Scoring ✓" },
  { from: "wards",        to: "pharmacy",     status: "gap",     gapId: 0, label: "❌ Discharged Bed ↛ Prescription Close" },
  { from: "pharmacy",     to: "billing",      status: "gap",     gapId: 1, label: "❌ Dispensed Drugs ↛ Invoice Line Items" },
  { from: "medisentinel", to: "notifications",status: "ok",      label: "Critical Alert → Notification Bus ✓" },
  { from: "lab",          to: "medisentinel", status: "ok",      label: "Troponin/Platelets → AI Fusion ✓" },
  { from: "patients",     to: "billing",      status: "partial", label: "⚠️ Patient → Invoice (Missing Insurance Hook)" },
  { from: "appointments", to: "doctors",      status: "ok",      label: "Schedule → Doctor Roster ✓" },
  { from: "billing",      to: "analytics",    status: "gap",     gapId: 2, label: "❌ Revenue Stream ↛ Analytics Module" },
  { from: "doctors",      to: "medisentinel", status: "partial", label: "⚠️ Clinical Order → AI Protocol" },
];

const GAPS = [
  {
    id: 0,
    title: "Ward Discharge ↛ Pharmacy Closure",
    severity: "critical" as const,
    file: "Wards.jsx ↔ Pharmacy.jsx",
    detail: "Patient discharge event in Wards.jsx does not emit a prescription closure hook. Active prescriptions for discharged patients remain open in Pharmacy.jsx.",
    risk: "Medication administered to next patient occupying the same bed. Directly accounts for 40% of handoff medication errors.",
    impact: "~4.3% of inpatient discharges vulnerable",
    bobFix: "Inject pharmacyPatientId reference into DRUGS table + publish onPatientDischarged webhook.",
    diffSnippet: `// MediCore: Pharmacy.jsx (Lines 34-48)
- const DRUGS = [{ id: 1, name: 'Paracetamol 500mg', stock: 850, threshold: 200 }];
+ const DRUGS = [{ 
+   id: 1, name: 'Paracetamol 500mg', stock: 850, threshold: 200,
+   activePatientId: null, // Foreign Key: Wards.jsx bed.patient
+   lastBedId: null,
+   status: 'active' // 'active' | 'discharged_closed'
+ }];

// MediCore: Wards.jsx (Lines 112-118)
+ const onPatientDischarge = (bedId, patientId) => {
+   pharmacyService.closePrescriptions(patientId);
+   wardsService.vacateBed(bedId);
+ };`,
  },
  {
    id: 1,
    title: "Pharmacy Dispense ↛ Billing Invoice Gap",
    severity: "critical" as const,
    file: "Pharmacy.jsx ↔ Billing.jsx",
    detail: "Bedside drug dispensing records in Pharmacy.jsx have no foreign key relation to INVOICES in Billing.jsx. Medication line items are omitted from patient bills.",
    risk: "Severe revenue leakage and insurance fraud exposure during payer audits.",
    impact: "₹2.34L outstanding likely understated by 18%",
    bobFix: "Add drug_id foreign reference in INVOICES schema + automate event dispatch on medication administration.",
    diffSnippet: `// MediCore: Billing.jsx (Lines 52-64)
- const INVOICES = [{ id: 'INV-001', bedCharge: 4500, total: 4500 }];
+ const INVOICES = [{ 
+   id: 'INV-001', bedCharge: 4500, 
+   medicationCharges: [{ drugId: 1, units: 3, costPerUnit: 120 }], // Added
+   total: 4860 
+ }];`,
  },
  {
    id: 2,
    title: "Billing ↛ Analytics Financial Pipeline Void",
    severity: "medium" as const,
    file: "Billing.jsx ↔ Analytics.jsx",
    detail: "Real-time payment collections in Billing.jsx are not piped to Analytics.jsx. Executive dashboards show outdated financial health metrics.",
    risk: "Hospital administrators make capital allocation decisions on stale revenue telemetry.",
    impact: "Analytics exhibits 48-hour data lag",
    bobFix: "Implement real-time WebSocket event bridge connecting billing ledger with analytics pipeline.",
    diffSnippet: `// MediCore: Analytics.jsx (Lines 22-29)
+ useEffect(() => {
+   const unsub = billingChannel.onUpdate((tx) => {
+     updateRevenueMetrics(tx.amount);
+   });
+   return () => unsub();
+ }, []);`,
  },
];

export default function NexusGuard({ analysisComplete }: { analysisComplete: boolean }) {
  const [selectedNode, setSelectedNode] = useState<ModuleNode | null>(MODULES[1]); // Default to Wards.jsx
  const [selectedGap, setSelectedGap] = useState<number | null>(0);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "gaps" | "connected">("all");
  const [approvedFixes, setApprovedFixes] = useState<Set<number>>(new Set());

  const handleApproveFix = (id: number) => {
    setApprovedFixes(prev => new Set([...prev, id]));
  };

  const filteredLinks = LINKS.filter(link => {
    if (filterMode === "gaps") return link.status === "gap";
    if (filterMode === "connected") return link.status === "ok";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Topology Header Controls */}
      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "20px" }}>🗺️</span>
              <h2 style={{ fontSize: "19px", fontWeight: 800 }}>
                NexusGuard™: Autonomous Topology &amp; Gap Engine
              </h2>
              <span className="badge badge-critical">3 Critical Disconnects</span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              IBM Bob parsed all 11 MediCore AST files to detect missing foreign keys, stale event hooks, and unclosed handoffs.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Topology Filter:
            </span>
            {[
              { id: "all" as const, label: "All Links (10)" },
              { id: "gaps" as const, label: "Broken Gaps (3)" },
              { id: "connected" as const, label: "Connected (5)" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: filterMode === f.id ? "rgba(56,139,253,0.18)" : "rgba(255,255,255,0.03)",
                  border: filterMode === f.id ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
                  color: filterMode === f.id ? "var(--accent-cyan)" : "var(--text-secondary)",
                  transition: "all 0.2s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas and Inspector Drawer */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: "24px" }}>
        {/* Left: SVG Topological Canvas */}
        <div className="glass-card" style={{ padding: "24px", position: "relative", minHeight: "520px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700 }}>
              Live Telemetry Graph · Click any module to inspect
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "11px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--accent-green)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-green)" }} />
                Synchronized
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--critical)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--critical)" }} />
                Broken Gap (Data Loss)
              </span>
            </div>
          </div>

          {/* SVG Map */}
          <div style={{ position: "relative", width: "100%", height: "440px", overflow: "hidden" }}>
            <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 760 420">
              <defs>
                <linearGradient id="flowGradOk" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#388bfd" />
                  <stop offset="100%" stopColor="#3fb950" />
                </linearGradient>
                <linearGradient id="flowGradGap" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f85149" />
                  <stop offset="100%" stopColor="#ff7b72" />
                </linearGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Lines */}
              {filteredLinks.map((link, idx) => {
                const src = MODULES.find(m => m.id === link.from);
                const dst = MODULES.find(m => m.id === link.to);
                if (!src || !dst) return null;

                const isGap = link.status === "gap";
                const isSelected = selectedNode && (selectedNode.id === src.id || selectedNode.id === dst.id);

                return (
                  <g key={idx} style={{ cursor: "pointer" }} onClick={() => link.gapId !== undefined && setSelectedGap(link.gapId)}>
                    {/* Background glow path */}
                    <line
                      x1={src.x + 40} y1={src.y + 25}
                      x2={dst.x + 40} y2={dst.y + 25}
                      stroke={isGap ? "rgba(248,81,73,0.3)" : "rgba(56,139,253,0.2)"}
                      strokeWidth={isSelected ? 6 : 4}
                      strokeLinecap="round"
                    />

                    {/* Animated Dash flow line */}
                    <line
                      x1={src.x + 40} y1={src.y + 25}
                      x2={dst.x + 40} y2={dst.y + 25}
                      stroke={isGap ? "#f85149" : "url(#flowGradOk)"}
                      strokeWidth={isSelected ? 3 : 2}
                      className={isGap ? "flow-line-reverse" : "flow-line"}
                      strokeLinecap="round"
                    />

                    {/* Gap Warning Pulse Pin */}
                    {isGap && (
                      <circle
                        cx={(src.x + dst.x) / 2 + 40}
                        cy={(src.y + dst.y) / 2 + 25}
                        r="6"
                        fill="#f85149"
                        filter="url(#glowEffect)"
                        className="animate-pulse-ring"
                      />
                    )}
                  </g>
                );
              })}

              {/* Module Nodes */}
              {MODULES.map(mod => {
                const isSelected = selectedNode?.id === mod.id;
                const isGapNode = ["wards", "pharmacy", "billing", "analytics"].includes(mod.id);

                return (
                  <g
                    key={mod.id}
                    transform={`translate(${mod.x}, ${mod.y})`}
                    onClick={() => setSelectedNode(mod)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Selection halo */}
                    {isSelected && (
                      <rect
                        x="-4" y="-4" width="108" height="62" rx="14"
                        fill="none"
                        stroke="var(--accent-cyan)"
                        strokeWidth="2.5"
                        filter="url(#glowEffect)"
                      />
                    )}

                    {/* Node Body Card */}
                    <rect
                      x="0" y="0" width="100" height="54" rx="12"
                      fill={isSelected ? "rgba(16, 36, 64, 0.95)" : isGapNode ? "rgba(35, 12, 18, 0.9)" : "rgba(10, 24, 44, 0.9)"}
                      stroke={isGapNode ? "rgba(248, 81, 73, 0.5)" : "rgba(56, 139, 253, 0.35)"}
                      strokeWidth="1.5"
                    />

                    {/* Node Icon */}
                    <text x="12" y="32" fontSize="16">
                      {mod.icon}
                    </text>

                    {/* Node Title */}
                    <text
                      x="36" y="24"
                      fontSize="11"
                      fontWeight="700"
                      fill={isSelected ? "#58d6e8" : isGapNode ? "#ff7b72" : "#f0f6fc"}
                      fontFamily="Inter, sans-serif"
                    >
                      {mod.label}
                    </text>

                    {/* Node Filename */}
                    <text
                      x="36" y="38"
                      fontSize="9"
                      fill="#8b949e"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {mod.filename.slice(0, 11)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Module & Gap Deep-Dive Drawer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Selected Module Detail Card */}
          {selectedNode && (
            <div className="glass-card animate-fade-in" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "24px" }}>{selectedNode.icon}</span>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{selectedNode.label}</h3>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>
                      medicore/src/features/{selectedNode.filename}
                    </span>
                  </div>
                </div>
                <span className="badge badge-medium">Scanned</span>
              </div>

              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "14px" }}>
                {selectedNode.description}
              </p>

              {/* Data In / Out Schemas */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
                <div>
                  <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>EMITS (Outgoing):</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "4px" }}>
                    {selectedNode.emits.map((e, idx) => (
                      <span key={idx} className="mono" style={{ background: "rgba(63,185,80,0.1)", padding: "2px 8px", borderRadius: "4px", color: "var(--accent-green)" }}>
                        +{e}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>CONSUMES (Incoming):</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "4px" }}>
                    {selectedNode.consumes.length > 0 ? (
                      selectedNode.consumes.map((c, idx) => (
                        <span key={idx} className="mono" style={{ background: c.includes("MISSING") ? "rgba(248,81,73,0.15)" : "rgba(56,139,253,0.1)", padding: "2px 8px", borderRadius: "4px", color: c.includes("MISSING") ? "var(--critical)" : "var(--accent-cyan)" }}>
                          {c}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>None (Root Source)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Gap Resolution Card */}
          {selectedGap !== null && (
            <div className="glass-card glass-card-critical animate-slide-up" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="badge badge-critical">GAP-00{GAPS[selectedGap].id + 1}</span>
                <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {GAPS[selectedGap].file}
                </span>
              </div>

              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                {GAPS[selectedGap].title}
              </h4>

              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                {GAPS[selectedGap].detail}
              </p>

              <div style={{
                background: "rgba(0,0,0,0.3)", padding: "10px 12px", borderRadius: "8px",
                border: "1px solid rgba(248,81,73,0.2)", marginBottom: "14px", fontSize: "11px",
              }}>
                <div style={{ color: "var(--critical)", fontWeight: 700, marginBottom: "2px" }}>
                  Clinical Risk:
                </div>
                <div style={{ color: "var(--text-secondary)" }}>
                  {GAPS[selectedGap].risk}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setShowDiffModal(true)}
                  className="btn-primary"
                  style={{ flex: 1, fontSize: "12px", padding: "8px 12px" }}
                >
                  Inspect Code Diff &amp; PR
                </button>

                <button
                  onClick={() => handleApproveFix(selectedGap)}
                  className="btn-ghost"
                  style={{
                    fontSize: "12px", padding: "8px 14px",
                    color: approvedFixes.has(selectedGap) ? "var(--accent-green)" : "var(--text-primary)",
                  }}
                >
                  {approvedFixes.has(selectedGap) ? "✓ Approved" : "Approve Fix"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Code Diff Modal */}
      {showDiffModal && selectedGap !== null && (
        <div className="modal-overlay" onClick={() => setShowDiffModal(false)}>
          <div
            className="glass-card animate-slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "760px", width: "100%", padding: "28px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.85)", border: "1px solid var(--border-bright)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>⚡</span>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                    IBM Bob Autonomous Code Fix · {GAPS[selectedGap].file}
                  </h3>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Pull Request #14 · Closes {GAPS[selectedGap].title}
                </div>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div className="code-block" style={{ padding: "16px", maxHeight: "320px", overflowY: "auto", marginBottom: "20px" }}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {GAPS[selectedGap].diffSnippet}
              </pre>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--accent-cyan)" }}>
                ✓ Zero breaking changes · Ast-checked by IBM Bob 2.0
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setShowDiffModal(false)}
                  className="btn-ghost"
                  style={{ fontSize: "12px" }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleApproveFix(selectedGap);
                    setShowDiffModal(false);
                  }}
                  className="btn-primary"
                  style={{ fontSize: "12px" }}
                >
                  Merge Bob Automated Patch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
