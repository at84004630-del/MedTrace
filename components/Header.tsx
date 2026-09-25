"use client";

interface HeaderProps {
  isAnalyzing: boolean;
  analysisComplete: boolean;
}

export default function Header({ isAnalyzing, analysisComplete }: HeaderProps) {
  return (
    <header style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(5,10,15,0.85)",
      backdropFilter: "blur(16px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "38px", height: "38px",
            background: "linear-gradient(135deg, #388bfd, #58d6e8)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", boxShadow: "var(--glow-blue)",
          }}>🔬</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.03em" }}>
              Med<span className="gradient-text">Trace</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
              IBM BOB 2.0 · HOSPITAL AI COMPLIANCE
            </div>
          </div>
        </div>

        {/* Center — analysis status */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isAnalyzing && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(56,139,253,0.1)", border: "1px solid rgba(56,139,253,0.25)",
              borderRadius: "20px", padding: "6px 14px",
              fontSize: "12px", color: "var(--accent-blue)",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "var(--accent-blue)",
                animation: "pulse-ring 1s infinite",
                display: "inline-block",
              }} />
              IBM Bob analyzing MediCore...
            </div>
          )}
          {analysisComplete && !isAnalyzing && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.25)",
              borderRadius: "20px", padding: "6px 14px",
              fontSize: "12px", color: "var(--accent-green)",
            }}>
              <span>✓</span> Analysis complete · 11 modules scanned
            </div>
          )}
        </div>

        {/* Right — regulatory tags */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
            background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.25)",
            color: "#f85149", padding: "4px 10px", borderRadius: "6px",
          }}>EU AI ACT ART.50</span>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
            background: "rgba(88,214,232,0.1)", border: "1px solid rgba(88,214,232,0.25)",
            color: "#58d6e8", padding: "4px 10px", borderRadius: "6px",
          }}>NABH QPS.5</span>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", cursor: "pointer",
          }}>⚙️</div>
        </div>
      </div>
    </header>
  );
}
