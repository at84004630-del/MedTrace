"use client";

import { useState } from "react";

interface HeaderProps {
  isAnalyzing: boolean;
  analysisComplete: boolean;
  onTriggerScan?: () => void;
}

export default function Header({ isAnalyzing, analysisComplete, onTriggerScan }: HeaderProps) {
  const [hospital, setHospital] = useState("Metro General Hospital · Central ICU & Inpatient Wards (540 Beds)");
  const [liveStream, setLiveStream] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showHospitalMenu, setShowHospitalMenu] = useState(false);

  const hospitals = [
    { name: "Metro General Hospital · Central ICU & Inpatient Wards (540 Beds)", badge: "3 Gaps", code: "MGH-ICU" },
    { name: "Apollo Apex Institute · Cardiovascular ICU & Cath Lab (320 Beds)", badge: "1 Gap", code: "APOLLO-CCU" },
    { name: "St. Jude Children's · Pediatric Oncology & Intensive Care (210 Beds)", badge: "2 Gaps", code: "STJ-PED" },
  ];

  return (
    <header style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(4, 8, 14, 0.88)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: "1440px", margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "68px",
      }}>
        {/* Left: Logo & Hospital Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px", height: "40px",
              background: "linear-gradient(135deg, #0969da 0%, #58d6e8 100%)",
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 0 20px rgba(88, 214, 232, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>🔬</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: "19px", letterSpacing: "-0.03em", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Med<span className="gradient-text">Trace</span></span>
                <span style={{
                  fontSize: "9px",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  background: "rgba(188, 140, 255, 0.15)",
                  color: "var(--accent-purple)",
                  border: "1px solid rgba(188, 140, 255, 0.3)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}>v2.4 PRO</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 600 }}>
                POWERED BY IBM BOB 2.0 · 270K CONTEXT
              </div>
            </div>
          </div>

          {/* Hospital Scope Divider & Dropdown */}
          <div style={{ display: "none", alignItems: "center", gap: "10px", position: "relative" }} className="md:flex">
            <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />
            <button
              onClick={() => setShowHospitalMenu(!showHospitalMenu)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "6px 12px", fontSize: "12px",
                color: "var(--text-secondary)", cursor: "pointer",
                transition: "all 0.2s",
              }}
              className="hover:border-accent-cyan"
            >
              <span style={{ fontSize: "14px" }}>🏥</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {hospital.split("·")[0]}
              </span>
              <span style={{ fontSize: "10px", color: "var(--accent-cyan)" }}>▼</span>
            </button>

            {showHospitalMenu && (
              <div
                className="glass-card animate-slide-up"
                style={{
                  position: "absolute", top: "42px", left: "10px",
                  width: "360px", padding: "10px", zIndex: 100,
                  background: "rgba(6, 14, 26, 0.96)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.85)",
                  border: "1px solid var(--border-bright)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", padding: "6px 10px", textTransform: "uppercase" }}>
                  Select Hospital Facility
                </div>
                {hospitals.map(h => (
                  <div
                    key={h.code}
                    onClick={() => {
                      setHospital(h.name);
                      setShowHospitalMenu(false);
                      if (onTriggerScan) onTriggerScan();
                    }}
                    style={{
                      padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: hospital.startsWith(h.name.split("·")[0]) ? "rgba(56,139,253,0.15)" : "transparent",
                      transition: "all 0.15s",
                    }}
                    className="hover:bg-card-hover"
                  >
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {h.name.split("·")[0]}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                        {h.name.split("·")[1]}
                      </div>
                    </div>
                    <span className="badge badge-critical" style={{ fontSize: "9px" }}>
                      {h.badge}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Analysis Status Banner & Manual Scan Trigger */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isAnalyzing && (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(56,139,253,0.12)", border: "1px solid rgba(56,139,253,0.35)",
              borderRadius: "9999px", padding: "6px 16px",
              fontSize: "12px", color: "var(--accent-cyan)",
              boxShadow: "0 0 15px rgba(56,139,253,0.2)",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "var(--accent-cyan)",
                display: "inline-block",
              }} className="animate-pulse-ring" />
              <span style={{ fontWeight: 600 }}>IBM Bob AST: Scanning 11 MediCore Modules...</span>
            </div>
          )}

          {analysisComplete && !isAnalyzing && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.3)",
              borderRadius: "9999px", padding: "6px 14px",
              fontSize: "12px", color: "var(--accent-green)",
              boxShadow: "0 0 15px rgba(63,185,80,0.15)",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "var(--accent-green)",
                display: "inline-block",
              }} className="animate-pulse-green" />
              <span style={{ fontWeight: 600 }}>Active Protection: 11 Modules Synchronized</span>
            </div>
          )}

          {/* Trigger Scan Button for Judges */}
          <button
            onClick={() => onTriggerScan && onTriggerScan()}
            disabled={isAnalyzing}
            style={{
              background: "linear-gradient(135deg, rgba(56,139,253,0.18) 0%, rgba(88,214,232,0.12) 100%)",
              border: "1px solid rgba(88,214,232,0.35)",
              borderRadius: "8px", padding: "5px 12px",
              fontSize: "11px", fontWeight: 700, color: "var(--accent-cyan)",
              display: "flex", alignItems: "center", gap: "6px", cursor: isAnalyzing ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            className="hover:border-accent-cyan"
            title="Trigger an autonomous IBM Bob AST audit scan across all 11 MediCore modules"
          >
            <span>⟳</span>
            <span>{isAnalyzing ? "Scanning..." : "Rescan 11 Modules"}</span>
          </button>

          {/* Live Telemetry Stream Indicator Toggle */}
          <button
            onClick={() => setLiveStream(!liveStream)}
            style={{
              background: liveStream ? "rgba(56,139,253,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${liveStream ? "rgba(56,139,253,0.4)" : "var(--border)"}`,
              borderRadius: "8px", padding: "5px 10px",
              fontSize: "11px", fontWeight: 600, color: liveStream ? "var(--accent-cyan)" : "var(--text-muted)",
              display: "none", alignItems: "center", gap: "6px", cursor: "pointer",
            }}
            className="sm:flex"
          >
            <span>{liveStream ? "📡" : "⏸️"}</span>
            <span>{liveStream ? "TELEMETRY LIVE" : "PAUSED"}</span>
          </button>
        </div>

        {/* Right: Regulatory Badges & Notification Drawer Trigger */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "none", alignItems: "center", gap: "8px" }} className="lg:flex">
            <span className="badge badge-critical" style={{ fontSize: "10px" }}>
              EU AI ACT ART. 50
            </span>
            <span className="badge badge-medium" style={{ fontSize: "10px" }}>
              NABH QPS.5
            </span>
            <span className="badge badge-purple" style={{ fontSize: "10px" }}>
              DPDP 2023
            </span>
          </div>

          {/* Notifications bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px", cursor: "pointer", transition: "all 0.2s",
                position: "relative",
              }}
              className="hover:border-accent-cyan"
            >
              🔔
              <span style={{
                position: "absolute", top: "-4px", right: "-4px",
                width: "16px", height: "16px", borderRadius: "50%",
                background: "var(--critical)", color: "#fff",
                fontSize: "9px", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 8px rgba(248,81,73,0.6)",
              }}>3</span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                className="glass-card animate-slide-up"
                style={{
                  position: "absolute", right: 0, top: "46px",
                  width: "320px", padding: "16px", zIndex: 100,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
                  border: "1px solid var(--border-bright)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <strong style={{ fontSize: "13px" }}>Active Clinical Disconnects</strong>
                  <span className="badge badge-critical">3 High Risk</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ padding: "8px", background: "rgba(248,81,73,0.08)", borderRadius: "8px", border: "1px solid rgba(248,81,73,0.2)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--critical)" }}>GAP-001: Wards ↔ Pharmacy</div>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>Active prescription for discharged bed ICU-3</div>
                  </div>
                  <div style={{ padding: "8px", background: "rgba(248,81,73,0.08)", borderRadius: "8px", border: "1px solid rgba(248,81,73,0.2)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--critical)" }}>GAP-002: Pharmacy ↔ Billing</div>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>₹2.34L uncaptured drug line items</div>
                  </div>
                  <div style={{ padding: "8px", background: "rgba(227,179,65,0.08)", borderRadius: "8px", border: "1px solid rgba(227,179,65,0.2)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-orange)" }}>GAP-003: Billing ↛ Analytics</div>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>Stale executive revenue pipeline</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
