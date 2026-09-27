"use client";

import { useEffect, useState } from "react";
import { Tab } from "@/lib/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: Tab) => void;
  onTriggerScan: () => void;
  onOpenAnalytics?: () => void;
  onOpenVitals?: () => void;
}

interface CommandItem {
  id: string;
  category: "Navigation" | "Actions" | "Diagnostics";
  label: string;
  shortcut?: string;
  icon: string;
  action: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerScan,
  onOpenAnalytics,
  onOpenVitals,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    { id: "tab-incidents", category: "Navigation", label: "Jump to Incident Intake & Queue", shortcut: "⌘1", icon: "🚨", action: () => onSelectTab("incidents") },
    { id: "tab-investigate", category: "Navigation", label: "Open Investigation Workspace (5 Subagents)", shortcut: "⌘2", icon: "🔍", action: () => onSelectTab("investigate") },
    { id: "tab-fix", category: "Navigation", label: "Review Code Diff & Auto Tests", shortcut: "⌘3", icon: "⚡", action: () => onSelectTab("fix") },
    { id: "tab-review", category: "Navigation", label: "AI Code Review & Healthcare Safety Checks", shortcut: "⌘4", icon: "🛡️", action: () => onSelectTab("review") },
    { id: "tab-release", category: "Navigation", label: "Open Release Gate & Deployment Passport", shortcut: "⌘5", icon: "🚀", action: () => onSelectTab("release") },
    { id: "act-scan", category: "Actions", label: "Rerun 5-Agent Parallel Swarm Investigation", shortcut: "↵", icon: "⚡", action: () => onTriggerScan() },
    { id: "act-demo", category: "Actions", label: "Load Demo: ED Wait Time Discrepancy (INC-2026-0847)", icon: "🏥", action: () => onSelectTab("investigate") },
    { id: "act-hipaa", category: "Diagnostics", label: "Run HIPAA §164.312 PHI Leak Audit", icon: "🔒", action: () => onSelectTab("review") },
    { id: "act-tests", category: "Diagnostics", label: "Synthesize Vitest Automated Regression Suite", icon: "🧪", action: () => onSelectTab("fix") },
    ...(onOpenAnalytics ? [{ id: "act-bobalytics", category: "Diagnostics" as const, label: "Open Bobalytics™ (Clinical ROI & Token Velocity)", shortcut: "⌘B", icon: "📊", action: () => onOpenAnalytics() }] : []),
    ...(onOpenVitals ? [{ id: "act-vitals", category: "Diagnostics" as const, label: "Open Live Vitals Oscilloscope (Real-time 60FPS ECG Stream)", shortcut: "⌘V", icon: "🫀", action: () => onOpenVitals() }] : []),
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault();
        filtered[selectedIndex]?.action();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2, 6, 16, 0.8)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "12vh",
      }}
    >
      <div
        className="glass-card animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "620px", width: "100%", padding: "0",
          overflow: "hidden", background: "#050d1c",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.15)",
          border: "1px solid rgba(56, 189, 248, 0.35)",
          borderRadius: "18px",
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "18px 22px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(255, 255, 255, 0.02)",
        }}>
          <span style={{ fontSize: "18px", color: "var(--accent-cyan)" }}>⚡</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search workflow stages... (ESC to close)"
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "var(--text-primary)", fontSize: "14.5px", outline: "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500,
            }}
          />
          <span className="kbd-shortcut" style={{ fontSize: "10px", padding: "2px 7px" }}>ESC</span>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "8px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                    background: isSelected ? "linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)" : "transparent",
                    border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.35)" : "transparent"}`,
                    transition: "all 0.12s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px",
                      background: isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
                    }}>
                      {cmd.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                        {cmd.label}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {cmd.category}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {cmd.shortcut && (
                      <span className="kbd-shortcut" style={{ fontSize: "10px", padding: "1px 6px" }}>
                        {cmd.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        ↵ Select
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div style={{
          padding: "10px 20px", borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          background: "rgba(0, 0, 0, 0.4)", display: "flex", justifyContent: "space-between",
          alignItems: "center", fontSize: "11px", color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <span>Navigate: <span className="kbd-shortcut">↑</span> <span className="kbd-shortcut">↓</span></span>
            <span>Select: <span className="kbd-shortcut">↵</span></span>
          </div>
          <div>MedTrace Command Orchestrator · IBM Bob 2.0</div>
        </div>
      </div>
    </div>
  );
}
