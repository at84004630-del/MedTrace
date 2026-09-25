"use client";

import { useState, useEffect } from "react";
import NexusGuard from "@/components/NexusGuard";
import ClinicalPassport from "@/components/ClinicalPassport";
import BobSession from "@/components/BobSession";
import Header from "@/components/Header";
import HeroStats from "@/components/HeroStats";
import CompliancePanel from "@/components/CompliancePanel";

import Bobalytics from "@/components/Bobalytics";
import VitalsOscilloscope from "@/components/VitalsOscilloscope";
import CommandPalette from "@/components/CommandPalette";
import LaserScanOverlay from "@/components/LaserScanOverlay";

export type Tab = "nexus" | "passport" | "bob" | "bobalytics" | "compliance";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("nexus");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Trigger AST analysis
  const handleTriggerScan = () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2400);
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Simulate Bob analysis on first load
  useEffect(() => {
    const t = setTimeout(() => {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 3000);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const tabs: { id: Tab; label: string; icon: string; badge?: string }[] = [
    { id: "nexus",      label: "NexusGuard",       icon: "🗺️", badge: "3 Gaps" },
    { id: "passport",   label: "ClinicalPassport",  icon: "📋", badge: "9 Records" },
    { id: "bob",        label: "Bob Session",       icon: "🤖", badge: "Live" },
    { id: "bobalytics", label: "Bobalytics & ROI",  icon: "📊", badge: "+45% Faster" },
    { id: "compliance", label: "Compliance Report", icon: "🛡️", badge: "Audit Ready" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(56,139,253,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,139,253,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />
      {/* Radial glows */}
      <div style={{
        position: "fixed", top: "-20%", left: "60%", width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(56,139,253,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", left: "10%", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(188,140,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Fullscreen Laser Scan Beam on AST scan */}
      <LaserScanOverlay isAnalyzing={isAnalyzing} />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onTriggerScan={handleTriggerScan}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header
          isAnalyzing={isAnalyzing}
          analysisComplete={analysisComplete}
          onTriggerScan={handleTriggerScan}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px 60px" }}>
          <HeroStats
            analysisComplete={analysisComplete}
            isAnalyzing={isAnalyzing}
            onSelectTab={setActiveTab}
          />

          {/* Real-time Inpatient Vitals Oscilloscope with Crisis Simulator */}
          <VitalsOscilloscope
            onTriggerCrisisAlert={() => {
              setActiveTab("passport");
            }}
          />

          {/* Tab navigation */}
          <div style={{
            display: "flex", gap: "8px", marginBottom: "28px",
            borderBottom: "1px solid var(--border)", paddingBottom: "0",
            overflowX: "auto",
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 20px", background: "transparent", border: "none",
                  borderBottom: activeTab === tab.id
                    ? "2px solid var(--accent-blue)"
                    : "2px solid transparent",
                  color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer", fontSize: "14px", fontWeight: activeTab === tab.id ? 600 : 400,
                  transition: "all 0.2s", marginBottom: "-1px", whiteSpace: "nowrap",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    background: activeTab === tab.id
                      ? "rgba(56,139,253,0.2)" : "rgba(255,255,255,0.06)",
                    color: activeTab === tab.id ? "var(--accent-cyan)" : "var(--text-muted)",
                    fontSize: "10px", fontWeight: 700, padding: "2px 7px",
                    borderRadius: "10px", letterSpacing: "0.03em",
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="animate-fade-in" key={activeTab}>
            {activeTab === "nexus"      && <NexusGuard analysisComplete={analysisComplete} />}
            {activeTab === "passport"   && <ClinicalPassport />}
            {activeTab === "bob"        && <BobSession isAnalyzing={isAnalyzing} analysisComplete={analysisComplete} />}
            {activeTab === "bobalytics" && <Bobalytics />}
            {activeTab === "compliance" && <CompliancePanel />}
          </div>
        </main>
      </div>
    </div>
  );
}
