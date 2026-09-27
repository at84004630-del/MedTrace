"use client";

import React from "react";

interface MedTraceLogoProps {
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  showTarget?: boolean;
  animated?: boolean;
  isAnalyzing?: boolean;
  onClick?: () => void;
}

export default function MedTraceLogo({
  size = "md",
  showBadge = true,
  showTarget = true,
  animated = true,
  isAnalyzing = false,
  onClick,
}: MedTraceLogoProps) {
  const iconDimensions = size === "sm" ? 32 : size === "lg" ? 44 : 38;
  const titleSize = size === "sm" ? "15px" : size === "lg" ? "20px" : "17.5px";

  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      className="group"
    >
      {/* ── Vector Emblem ── */}
      <div
        style={{
          position: "relative",
          width: `${iconDimensions}px`,
          height: `${iconDimensions}px`,
          flexShrink: 0,
          borderRadius: "11px",
          padding: "1px",
          background: "linear-gradient(135deg, rgba(56, 189, 248, 0.7) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(147, 51, 234, 0.6) 100%)",
          boxShadow: isAnalyzing
            ? "0 0 24px rgba(56, 189, 248, 0.6), inset 0 0 12px rgba(56, 189, 248, 0.3)"
            : "0 4px 18px rgba(14, 165, 233, 0.35), 0 0 10px rgba(56, 189, 248, 0.2)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Inner glass vessel */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(8, 17, 36, 0.95) 0%, rgba(4, 9, 20, 0.98) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Subtle ambient gradient mesh inside emblem */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.25) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Precision SVG Vector: ECG Wave + Neural Trace Matrix */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "relative", zIndex: 1 }}
          >
            <defs>
              <linearGradient id="logo-stroke" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00f2fe" />
                <stop offset="0.5" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="logo-glow" x1="10" y1="12" x2="30" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="1" stopColor="#818cf8" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Neural connector grid lines */}
            <path
              d="M10 20h4l3-7 5 15 4-11 3 6h7"
              stroke="url(#logo-stroke)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-blur)"
            />

            {/* Central micro clinical cross */}
            <path
              d="M20 7v5M17.5 9.5h5"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Neural network nodes with glow */}
            <circle cx="10" cy="20" r="2.2" fill="#00f2fe" />
            <circle cx="17" cy="13" r="2.2" fill="#38bdf8" />
            <circle cx="22" cy="28" r="2.2" fill="#60a5fa" />
            <circle cx="26" cy="17" r="2.2" fill="#a855f7" />
            <circle cx="33" cy="23" r="2.2" fill="#c084fc" />

            {/* Micro pulse wave ring during active analysis */}
            {isAnalyzing && (
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 20 20"
                  to="360 20 20"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </svg>
        </div>

        {/* Live Status Pip */}
        <div
          style={{
            position: "absolute",
            bottom: "-3px",
            right: "-3px",
            width: "11px",
            height: "11px",
            borderRadius: "50%",
            background: isAnalyzing ? "#38bdf8" : "#10b981",
            border: "2px solid #050914",
            boxShadow: isAnalyzing
              ? "0 0 10px #38bdf8, 0 0 4px #38bdf8"
              : "0 0 10px #10b981, 0 0 4px #10b981",
            zIndex: 2,
          }}
        />
      </div>

      {/* ── Wordmark & Co-branding ── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Main Name */}
          <span
            style={{
              fontWeight: 800,
              fontSize: titleSize,
              letterSpacing: "-0.035em",
              fontFamily: "'Space Grotesk', sans-serif",
              lineHeight: 1.15,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Med</span>
            <span
              style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 60%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Trace
            </span>
          </span>

          {/* Modern IBM BOB 2.0 Co-Brand Badge */}
          {showBadge && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "2px 7px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                boxShadow: "0 2px 8px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {/* IBM 8-bar mini icon */}
              <svg width="10" height="9" viewBox="0 0 12 10" fill="none">
                <rect y="1" width="12" height="1.5" rx="0.5" fill="#38bdf8" />
                <rect y="4.2" width="12" height="1.5" rx="0.5" fill="#60a5fa" />
                <rect y="7.5" width="12" height="1.5" rx="0.5" fill="#818cf8" />
              </svg>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: "#38bdf8",
                  textShadow: "0 0 8px rgba(56, 189, 248, 0.4)",
                }}
              >
                BOB 2.0
              </span>
            </div>
          )}
        </div>

        {/* Clinical target sub-label */}
        {showTarget && (
          <div
            className="nav-logo-sublabel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "10.5px",
              color: "var(--text-secondary)",
              marginTop: "2px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: "#94a3b8" }}>st-jude-ehr</span>
            <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>/</span>
            <span style={{ color: "#38bdf8", fontWeight: 600 }}>v4.18-prod</span>
            <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>·</span>
            <span style={{ color: "#34d399", fontSize: "9.5px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#10b981" }} />
              HEALTHY
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
