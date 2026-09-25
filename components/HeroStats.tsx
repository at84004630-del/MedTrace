"use client";

import { useEffect, useState } from "react";

interface HeroStatsProps {
  analysisComplete: boolean;
  isAnalyzing: boolean;
  onSelectTab?: (tab: "nexus" | "passport" | "bob" | "compliance") => void;
}

const stats = [
  {
    id: "nexus" as const,
    label: "MediCore Modules Scanned",
    value: 11,
    suffix: "/11",
    sparkline: [2, 4, 7, 9, 10, 11, 11],
    icon: "📦",
    color: "var(--accent-blue)",
    badge: "100% Coverage",
    badgeType: "ok",
    subtext: "270k tokens loaded into Bob context",
  },
  {
    id: "nexus" as const,
    label: "Cross-Module Data Gaps",
    value: 3,
    suffix: " Gaps",
    sparkline: [8, 6, 5, 4, 3, 3, 3],
    icon: "🔴",
    color: "var(--critical)",
    badge: "Action Required",
    badgeType: "critical",
    subtext: "40% medication error exposure at handoffs",
  },
  {
    id: "passport" as const,
    label: "Clinical AI Decisions Audited",
    value: 9,
    suffix: " Passports",
    sparkline: [1, 2, 4, 6, 7, 8, 9],
    icon: "📋",
    color: "var(--accent-purple)",
    badge: "Cryptographic",
    badgeType: "purple",
    subtext: "SHAP drivers & physician sign-off logged",
  },
  {
    id: "compliance" as const,
    label: "Hospital Audit Readiness",
    value: 87,
    suffix: "%",
    sparkline: [42, 55, 68, 74, 80, 85, 87],
    icon: "🛡️",
    color: "var(--accent-cyan)",
    badge: "Audit Ready",
    badgeType: "high",
    subtext: "Aligned with EU AI Act & NABH QPS.5",
  },
];

export default function HeroStats({ analysisComplete, isAnalyzing, onSelectTab }: HeroStatsProps) {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    if (!analysisComplete) return;
    const intervals: NodeJS.Timeout[] = [];
    stats.forEach((s, i) => {
      let current = 0;
      const step = Math.ceil(s.value / 35);
      const interval = setInterval(() => {
        current = Math.min(current + step, s.value);
        setCounts(prev => {
          const n = [...prev];
          n[i] = current;
          return n;
        });
        if (current >= s.value) clearInterval(interval);
      }, 30);
      intervals.push(interval);
    });
    return () => {
      intervals.forEach(id => clearInterval(id));
    };
  }, [analysisComplete]);

  return (
    <div style={{ padding: "36px 0 28px" }}>
      {/* Top Banner and Headline */}
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end",
        gap: "24px", marginBottom: "32px",
      }}>
        <div style={{ maxWidth: "780px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(56,139,253,0.1)", border: "1px solid rgba(56,139,253,0.3)",
            borderRadius: "20px", padding: "6px 16px", marginBottom: "16px",
            fontSize: "12px", color: "var(--accent-cyan)", letterSpacing: "0.06em", fontWeight: 700,
          }}>
            <span>⚡</span>
            <span>ENTERPRISE CLINICAL GOVERNANCE · POWERED BY IBM BOB 2.0</span>
          </div>

          <h1 style={{
            fontSize: "clamp(30px, 4.2vw, 50px)", fontWeight: 900,
            lineHeight: 1.12, letterSpacing: "-0.04em", marginBottom: "14px",
          }}>
            Trace every <span className="gradient-text">patient data flow</span><br />
            and audit every <span className="gradient-text-red">clinical AI decision</span>.
          </h1>

          <p style={{
            color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6,
            maxWidth: "700px",
          }}>
            Hospitals operate in silos where <strong style={{ color: "var(--text-primary)" }}>40% of medication errors</strong> happen
            at unmonitored module boundaries. MedTrace uses IBM Bob’s 270k context to map hidden data disconnects
            and produce tamper-evident proof under <strong style={{ color: "var(--critical)" }}>EU AI Act Article 50</strong>.
          </p>
        </div>

        {/* Quick Pitch Pills */}
        <div style={{
          display: "flex", flexDirection: "column", gap: "10px",
          background: "rgba(13,31,53,0.6)", padding: "16px 20px", borderRadius: "14px",
          border: "1px solid var(--border)", minWidth: "260px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            The Grounded Reality
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
            <span style={{ color: "var(--critical)", fontWeight: 700 }}>$42B/yr</span>
            <span style={{ color: "var(--text-secondary)" }}>Global medication error toll</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
            <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>90 Seconds</span>
            <span style={{ color: "var(--text-secondary)" }}>Bob audit vs. 2-3 weeks manual</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
            <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>₹206/pt</span>
            <span style={{ color: "var(--text-secondary)" }}>Direct savings via reconciliation</span>
          </div>
        </div>
      </div>

      {/* Modern Metric Cards Grid with SVG Sparklines */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "18px",
      }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            onClick={() => onSelectTab && onSelectTab(s.id)}
            className="glass-card glass-card-interactive"
            style={{
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top row: Icon and Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>
                {s.icon}
              </div>

              <span className={`badge badge-${s.badgeType}`}>
                {s.badge}
              </span>
            </div>

            {/* Middle: Number Counter & Sparkline */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1 }}>
                  {analysisComplete ? counts[i] : "—"}
                  <span style={{ fontSize: "20px", fontWeight: 700, color: s.color, marginLeft: "4px" }}>
                    {analysisComplete ? s.suffix : ""}
                  </span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "6px" }}>
                  {s.label}
                </div>
              </div>

              {/* Sparkline Visualizer */}
              <div style={{ width: "70px", height: "30px", opacity: 0.85 }}>
                <svg width="100%" height="100%" viewBox="0 0 70 30" fill="none">
                  <path
                    d={`M 0,${30 - s.sparkline[0] * 3} ` + s.sparkline.map((val, idx) => `L ${idx * 11},${30 - val * 3}`).join(" ")}
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom: Subtext & Deep link */}
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", marginTop: "6px",
              display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px",
            }}>
              <span style={{ color: "var(--text-muted)" }}>{s.subtext}</span>
              <span style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Explore →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
