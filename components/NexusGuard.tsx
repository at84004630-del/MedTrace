"use client";

import { useState } from "react";

const MODULES = [
  { id: "admission",    label: "Admission",        icon: "🏥", x: 50,  y: 40  },
  { id: "wards",        label: "Wards.jsx",         icon: "🛏️", x: 200, y: 40  },
  { id: "medisentinel", label: "MediSentinel™",     icon: "🧠", x: 350, y: 40  },
  { id: "pharmacy",     label: "Pharmacy.jsx",      icon: "💊", x: 200, y: 200 },
  { id: "lab",          label: "Lab",               icon: "🔬", x: 350, y: 200 },
  { id: "billing",      label: "Billing.jsx",       icon: "💰", x: 500, y: 200 },
  { id: "analytics",    label: "Analytics",         icon: "📊", x: 500, y: 40  },
  { id: "appointments", label: "Appointments",      icon: "📅", x: 50,  y: 200 },
  { id: "doctors",      label: "Doctors",           icon: "👨‍⚕️", x: 50, y: 340 },
  { id: "patients",     label: "Patients DB",       icon: "🗃️", x: 200, y: 340 },
  { id: "notifications",label: "Notifications",     icon: "🔔", x: 350, y: 340 },
];

type LinkStatus = "ok" | "gap" | "partial";

const LINKS: { from: string; to: string; status: LinkStatus; label: string }[] = [
  { from: "admission",    to: "wards",        status: "ok",      label: "Patient → Bed assignment ✓" },
  { from: "wards",        to: "medisentinel", status: "ok",      label: "Vitals → AI scoring ✓" },
  { from: "wards",        to: "pharmacy",     status: "gap",     label: "❌ Ward discharge ↛ Pharmacy close" },
  { from: "pharmacy",     to: "billing",      status: "gap",     label: "❌ Drug items ↛ Invoice line" },
  { from: "medisentinel", to: "notifications",status: "ok",      label: "Alert → Notification ✓" },
  { from: "lab",          to: "medisentinel", status: "ok",      label: "Lab results → AI engine ✓" },
  { from: "patients",     to: "billing",      status: "partial", label: "⚠️ Patient → Invoice (partial)" },
  { from: "appointments", to: "doctors",      status: "ok",      label: "Schedule → Doctor ✓" },
  { from: "billing",      to: "analytics",    status: "gap",     label: "❌ Invoice ↛ Analytics module" },
  { from: "doctors",      to: "medisentinel", status: "partial", label: "⚠️ Orders → AI (partial)" },
];

const STATUS_COLOR: Record<LinkStatus, string> = {
  ok:      "#3fb950",
  gap:     "#f85149",
  partial: "#e3b341",
};

const GAPS = [
  {
    title: "Ward → Pharmacy Disconnect",
    severity: "critical" as const,
    file: "Wards.jsx ↔ Pharmacy.jsx",
    detail: "Patient discharge in Wards.jsx has no corresponding prescription-closure trigger in Pharmacy.jsx. Active prescriptions remain open for discharged patients.",
    risk: "Wrong medication dispensed to next patient occupying the same bed",
    impact: "~4.3% of discharges affected",
    bobFix: "Add pharmacyPatientId reference + discharge webhook to Pharmacy module",
  },
  {
    title: "Pharmacy → Billing Line Items Missing",
    severity: "critical" as const,
    file: "Pharmacy.jsx ↔ Billing.jsx",
    detail: "DRUGS dispensing records in Pharmacy.jsx have no data link to INVOICES in Billing.jsx. Drug costs are not line-itemted in patient invoices.",
    risk: "Revenue leakage + incorrect billing — potential fraud exposure",
    impact: "₹2.34L outstanding likely understated",
    bobFix: "Add drug_id foreign reference in INVOICES schema + dispensing event hook",
  },
  {
    title: "Billing → Analytics Data Void",
    severity: "medium" as const,
    file: "Billing.jsx ↔ Analytics",
    detail: "Invoice and revenue data in Billing.jsx is not fed into the Analytics module. Financial dashboards cannot reflect real-time billing status.",
    risk: "CFO and administrators make decisions on stale financial data",
    impact: "Analytics shows outdated revenue figures",
    bobFix: "Add Billing → Analytics data pipeline with real-time event push",
  },
];

export default function NexusGuard({ analysisComplete }: { analysisComplete: boolean }) {
  const [selectedGap, setSelectedGap] = useState<number | null>(0);
  const [approvedFixes, setApprovedFixes] = useState<Set<number>>(new Set());

  const approveFix = (i: number) => {
    setApprovedFixes(prev => new Set([...prev, i]));
  };

  const getNodeColor = (id: string) => {
    const gapModules = ["wards", "pharmacy", "billing", "analytics"];
    const partialModules = ["patients", "doctors"];
    if (gapModules.includes(id)) return "#f85149";
    if (partialModules.includes(id)) return "#e3b341";
    return "#3fb950";
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>
        {/* Left: Journey Map */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
                🗺️ Patient Journey Map™
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                IBM Bob mapped all 11 MediCore modules · Red = data gap · Green = connected
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "11px" }}>
              {[["#3fb950","Connected"],["#e3b341","Partial"],["#f85149","Gap"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
                  <span style={{ color: "var(--text-secondary)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SVG Journey Map */}
          <div style={{
            background: "rgba(5,10,15,0.6)", borderRadius: "12px",
            border: "1px solid var(--border)", padding: "20px",
            position: "relative", overflow: "hidden",
            minHeight: "420px",
          }}>
            {!analysisComplete ? (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px",
              }}>
                <div style={{
                  width: "40px", height: "40px", border: "3px solid var(--accent-blue)",
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>IBM Bob scanning modules...</p>
              </div>
            ) : (
              <svg width="100%" viewBox="0 0 600 420" style={{ overflow: "visible" }}>
                <defs>
                  <marker id="arrow-ok" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#3fb950" opacity="0.7" />
                  </marker>
                  <marker id="arrow-gap" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#f85149" opacity="0.8" />
                  </marker>
                  <marker id="arrow-partial" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#e3b341" opacity="0.7" />
                  </marker>
                </defs>

                {/* Links */}
                {LINKS.map((link, i) => {
                  const from = MODULES.find(m => m.id === link.from)!;
                  const to   = MODULES.find(m => m.id === link.to)!;
                  const col  = STATUS_COLOR[link.status];
                  return (
                    <line key={i}
                      x1={from.x + 30} y1={from.y + 30}
                      x2={to.x + 30}   y2={to.y + 30}
                      stroke={col} strokeWidth={link.status === "gap" ? 2 : 1.5}
                      strokeDasharray={link.status === "gap" ? "6,4" : link.status === "partial" ? "4,3" : "none"}
                      opacity={0.7}
                      markerEnd={`url(#arrow-${link.status})`}
                    />
                  );
                })}

                {/* Nodes */}
                {MODULES.map((mod) => {
                  const col = getNodeColor(mod.id);
                  return (
                    <g key={mod.id} style={{ animation: `node-appear 0.3s ease-out forwards` }}>
                      <rect
                        x={mod.x} y={mod.y} width={80} height={56}
                        rx={10} fill="rgba(13,31,53,0.9)"
                        stroke={col} strokeWidth={1.5}
                        style={{ filter: `drop-shadow(0 0 8px ${col}44)` }}
                      />
                      <text x={mod.x + 40} y={mod.y + 24} textAnchor="middle"
                        fontSize="18" dominantBaseline="middle">{mod.icon}</text>
                      <text x={mod.x + 40} y={mod.y + 44} textAnchor="middle"
                        fontSize="8" fill={col} fontWeight="600"
                        dominantBaseline="middle" fontFamily="Inter, sans-serif">
                        {mod.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Legend */}
          <div style={{ marginTop: "16px", display: "flex", gap: "20px", fontSize: "11px", color: "var(--text-muted)" }}>
            <span>🔴 Solid border = has data gap</span>
            <span>🟡 Yellow = partial connection</span>
            <span>🟢 Green = fully connected</span>
            <span>--- Dashed line = broken data flow</span>
          </div>
        </div>

        {/* Right: Gap Registry */}
        <div>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
              Gap Registry
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Bob-detected data flow breaks, ranked by clinical risk
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {GAPS.map((gap, i) => (
              <div
                key={i}
                className="glass-card"
                onClick={() => setSelectedGap(selectedGap === i ? null : i)}
                style={{
                  padding: "16px", cursor: "pointer",
                  borderColor: selectedGap === i
                    ? gap.severity === "critical" ? "rgba(248,81,73,0.5)" : "rgba(227,179,65,0.5)"
                    : "var(--border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span className={`badge badge-${gap.severity}`}>{gap.severity.toUpperCase()}</span>
                  {approvedFixes.has(i) && <span className="badge badge-ok">FIX APPROVED ✓</span>}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{gap.title}</div>
                <div className="mono" style={{ fontSize: "10px", color: "var(--accent-cyan)", marginBottom: "8px" }}>{gap.file}</div>

                {selectedGap === i && (
                  <div className="animate-fade-in" style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px" }}>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px", lineHeight: 1.6 }}>
                      {gap.detail}
                    </p>
                    <div style={{ background: "rgba(248,81,73,0.06)", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
                      <div style={{ fontSize: "10px", color: "var(--critical)", fontWeight: 700, marginBottom: "4px" }}>CLINICAL RISK</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{gap.risk}</div>
                    </div>
                    <div style={{ background: "rgba(56,139,253,0.06)", borderRadius: "8px", padding: "10px", marginBottom: "12px" }}>
                      <div style={{ fontSize: "10px", color: "var(--accent-blue)", fontWeight: 700, marginBottom: "4px" }}>BOB&apos;S FIX</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{gap.bobFix}</div>
                    </div>
                    {!approvedFixes.has(i) ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn-success" style={{ flex: 1, fontSize: "12px", padding: "8px" }}
                          onClick={(e) => { e.stopPropagation(); approveFix(i); }}>
                          ✓ Approve Fix
                        </button>
                        <button className="btn-ghost" style={{ flex: 1, fontSize: "12px", padding: "8px" }}
                          onClick={(e) => e.stopPropagation()}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        textAlign: "center", fontSize: "12px", color: "var(--accent-green)",
                        padding: "8px", background: "rgba(63,185,80,0.1)", borderRadius: "8px",
                      }}>
                        ✓ Fix approved — PR created by IBM Bob
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
