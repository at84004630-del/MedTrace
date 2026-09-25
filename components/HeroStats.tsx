"use client";

import { useEffect, useState } from "react";

interface HeroStatsProps {
  analysisComplete: boolean;
  isAnalyzing: boolean;
}

const stats = [
  { label: "Modules Scanned", value: 11, suffix: "", icon: "📦", color: "var(--accent-blue)" },
  { label: "Data Gaps Found", value: 3, suffix: "", icon: "🔴", color: "var(--critical)" },
  { label: "AI Decisions Audited", value: 9, suffix: "", icon: "📋", color: "var(--accent-purple)" },
  { label: "Compliance Score", value: 61, suffix: "%", icon: "⚠️", color: "var(--accent-orange)" },
];

export default function HeroStats({ analysisComplete, isAnalyzing }: HeroStatsProps) {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    if (!analysisComplete) return;
    const intervals: NodeJS.Timeout[] = [];
    stats.forEach((s, i) => {
      let current = 0;
      const step = Math.ceil(s.value / 40);
      const interval = setInterval(() => {
        current = Math.min(current + step, s.value);
        setCounts(prev => { const n = [...prev]; n[i] = current; return n; });
        if (current >= s.value) clearInterval(interval);
      }, 30);
      intervals.push(interval);
    });
    return () => {
      intervals.forEach(id => clearInterval(id));
    };
  }, [analysisComplete]);

  return (
    <div style={{ padding: "32px 0 24px" }}>
      {/* Hero headline */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(56,139,253,0.08)", border: "1px solid rgba(56,139,253,0.2)",
          borderRadius: "20px", padding: "5px 14px", marginBottom: "16px",
          fontSize: "12px", color: "var(--accent-cyan)", letterSpacing: "0.06em", fontWeight: 600,
        }}>
          🤖 POWERED BY IBM BOB 2.0 · AGENTIC ANALYSIS
        </div>
        <h1 style={{
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900,
          lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: "12px",
        }}>
          IBM Bob traces every{" "}
          <span className="gradient-text">patient data flow</span>{" "}
          <br />and every{" "}
          <span className="gradient-text-red">AI decision</span>{" "}
          in your hospital
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "620px", lineHeight: 1.6 }}>
          40% of medication errors happen at module boundaries. 78% of hospitals can&apos;t explain
          their AI decisions — which is now <strong style={{ color: "var(--critical)" }}>illegal</strong> under{" "}
          EU AI Act Article 50 (in force Aug 2, 2026).
        </p>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px", marginBottom: "32px",
      }}>
        {stats.map((s, i) => (
          <div key={s.label} className="glass-card" style={{
            padding: "22px",
            opacity: analysisComplete ? 1 : 0.4,
            transition: `opacity 0.4s ${i * 0.1}s`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
              {isAnalyzing && (
                <span style={{ fontSize: "10px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                  SCANNING...
                </span>
              )}
            </div>
            <div style={{
              fontSize: "40px", fontWeight: 900, lineHeight: 1,
              color: s.color, fontFamily: "'JetBrains Mono', monospace",
              marginBottom: "6px",
            }}>
              {analysisComplete ? counts[i] : "--"}{s.suffix}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Target system pill */}
      {analysisComplete && (
        <div className="animate-slide-up" style={{
          display: "flex", alignItems: "center", gap: "12px",
          background: "rgba(13,31,53,0.8)", border: "1px solid var(--border)",
          borderRadius: "12px", padding: "14px 20px",
          marginBottom: "8px",
        }}>
          <span style={{ color: "var(--accent-green)", fontSize: "18px" }}>✓</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>
              Target System: <span className="mono" style={{ color: "var(--accent-cyan)" }}>MediCore Hospital Management System</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              11 modules · React/JSX · BiLSTM + XGBoost + ClinicalBERT AI stack · Analyzed by IBM Bob 2.0 in 3.2s
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="badge badge-critical">3 CRITICAL GAPS</span>
            <span className="badge badge-ok">9 PASSPORTS</span>
          </div>
        </div>
      )}
    </div>
  );
}
