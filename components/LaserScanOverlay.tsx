"use client";

import { useEffect, useState } from "react";

interface LaserScanOverlayProps {
  isAnalyzing: boolean;
}

export default function LaserScanOverlay({ isAnalyzing }: LaserScanOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Ingesting AST: Admission.jsx & Wards.jsx (24.0 kb)...",
    "Loading MediSentinel™ BiLSTM + XGBoost model weights...",
    "Scanning Pharmacy.jsx ↔ Billing.jsx handoff schemas...",
    "Constructing 270,000-token directed dependency graph...",
    "Analyzing EU AI Act Article 50 & NABH QPS.5 compliance...",
    "Synchronizing 11 hospital modules into Bob runtime memory...",
  ];

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 450);
    return () => clearInterval(interval);
  }, [isAnalyzing, steps.length]);

  if (!isAnalyzing) return null;

  return (
    <>
      {/* Sweeping Laser Beam */}
      <div className="laser-scan-beam" />
      <div className="laser-scan-grid" />

      {/* Floating HUD Telemetry Pill */}
      <div style={{
        position: "fixed", top: "84px", left: "50%", transform: "translateX(-50%)",
        zIndex: 9999, pointerEvents: "none",
      }} className="animate-slide-up">
        <div style={{
          background: "rgba(4, 12, 24, 0.92)",
          border: "1px solid var(--accent-cyan)",
          boxShadow: "0 8px 32px rgba(88, 214, 232, 0.35), 0 0 20px rgba(56, 139, 253, 0.2)",
          borderRadius: "9999px", padding: "8px 22px",
          display: "flex", alignItems: "center", gap: "12px",
          color: "var(--accent-cyan)", fontSize: "12px", fontWeight: 700,
          backdropFilter: "blur(20px)",
        }}>
          <span style={{
            width: "10px", height: "10px", borderRadius: "50%",
            background: "var(--accent-cyan)",
          }} className="animate-pulse-ring" />
          <span className="mono">{steps[currentStep]}</span>
          <span className="badge badge-purple" style={{ fontSize: "9px" }}>
            270K ACTIVE
          </span>
        </div>
      </div>
    </>
  );
}
