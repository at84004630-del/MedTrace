"use client";

import { useEffect, useState } from "react";
import { Tab } from "@/app/page";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: Tab) => void;
  onTriggerScan: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerScan,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const commands = [
    { id: "tab-nexus", category: "Navigation", label: "Open NexusGuard™ Topology & Gap Engine", icon: "🗺️", action: () => onSelectTab("nexus") },
    { id: "tab-passport", category: "Navigation", label: "Open ClinicalPassport™ AI Audit Ledger", icon: "📋", action: () => onSelectTab("passport") },
    { id: "tab-bob", category: "Navigation", label: "Launch IBM Bob 2.0 Workspace (Ask/Plan/Agent)", icon: "🤖", action: () => onSelectTab("bob") },
    { id: "tab-bobalytics", category: "Navigation", label: "View Bobalytics™ & Hospital ROI Simulator", icon: "📊", action: () => onSelectTab("bobalytics") },
    { id: "tab-compliance", category: "Navigation", label: "Inspect EU AI Act & NABH Compliance Matrix", icon: "🛡️", action: () => onSelectTab("compliance") },
    { id: "act-scan", category: "Autonomous Actions", label: "Trigger IBM Bob 2.0 AST Codebase Scan", icon: "⚡", action: () => onTriggerScan() },
    { id: "act-gap1", category: "Autonomous Actions", label: "Inspect Code Diff: Ward ↔ Pharmacy Disconnect", icon: "💊", action: () => onSelectTab("nexus") },
    { id: "act-audit", category: "Governance", label: "Run Mock Hospital Regulatory Audit Simulation", icon: "⚖️", action: () => onSelectTab("compliance") },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="glass-card animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "600px", width: "100%", padding: "0",
          overflow: "hidden", background: "rgba(6, 14, 26, 0.96)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.85), 0 0 35px rgba(56,139,253,0.2)",
          border: "1px solid var(--border-bright)",
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: "16px", color: "var(--accent-cyan)" }}>🔍</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or jump to feature... (ESC to close)"
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "var(--text-primary)", fontSize: "14px", outline: "none",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <span className="kbd-shortcut">ESC</span>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "10px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No commands found matching "{query}"
            </div>
          ) : (
            filtered.map(cmd => (
              <div
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                className="cmd-item"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "18px" }}>{cmd.icon}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{cmd.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{cmd.category}</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", color: "var(--accent-blue)", fontWeight: 700 }}>Jump →</span>
              </div>
            ))
          )}
        </div>

        {/* Command Footer */}
        <div style={{
          padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "space-between",
          alignItems: "center", fontSize: "11px", color: "var(--text-muted)",
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <span>Navigate: <span className="kbd-shortcut">↑</span> <span className="kbd-shortcut">↓</span></span>
            <span>Select: <span className="kbd-shortcut">↵</span></span>
          </div>
          <div>MedTrace Command Center · IBM Bob 2.0</div>
        </div>
      </div>
    </div>
  );
}
