"use client";

import { useState, useEffect, useRef } from "react";

interface BobSessionProps {
  isAnalyzing: boolean;
  analysisComplete: boolean;
}

interface Message {
  role: "user" | "bob";
  content: string;
  timestamp: string;
  mode?: "ask" | "plan" | "agent";
}

const DEMO_CONVERSATION: Message[] = [
  {
    role: "user", mode: "ask",
    timestamp: "00:00:02",
    content: `Read all 11 modules in MediCore. For each module:
1. What patient data does it create?
2. What patient data does it consume from other modules?
3. What data hand-off is MISSING (broken link)?
Map this as a directed graph with risk scores.`,
  },
  {
    role: "bob",
    timestamp: "00:00:05",
    content: `✅ Read all 11 MediCore modules (270k context). Analysis complete.

📊 **Patient Journey Map — Data Flow Analysis**

**Critical Gaps Found (3):**

🔴 GAP-001: Ward → Pharmacy (CRITICAL)
• \`Wards.jsx\` creates \`bed.patient\` on admission
• \`Pharmacy.jsx\` tracks DRUGS with NO reference to bed/patient
• Missing: Discharge event → pharmacy prescription close
• Risk: Active prescriptions persist after discharge → wrong dispensing

🔴 GAP-002: Pharmacy → Billing (CRITICAL)  
• \`Pharmacy.jsx\` DRUGS dispensing has no drug_id in \`Billing.jsx\` INVOICES
• Missing: Drug cost line items in patient invoices
• Risk: Revenue leakage + incorrect billing exposure

🟡 GAP-003: Billing → Analytics (MEDIUM)
• Revenue data in \`Billing.jsx\` not piped to Analytics module
• Risk: Stale financial dashboards for leadership

**Connected Flows (8 of 11):** Admission→Wards ✓, Wards→MediSentinel ✓, Lab→MediSentinel ✓ ...`,
  },
  {
    role: "user", mode: "plan",
    timestamp: "00:01:10",
    content: `For each gap you found:
1. What is the clinical risk if exploited?
2. What is the minimum code change to close it?
3. Which changes are safe vs. require clinical review?
Output as a prioritized risk register.`,
  },
  {
    role: "bob",
    timestamp: "00:01:14",
    content: `📋 **Risk Register — Prioritized**

**PRIORITY 1 — GAP-001 (Ward→Pharmacy)**
• Clinical Risk: Medication administered to wrong patient after bed reassignment
• Estimated Impact: ~4.3% of discharges (based on BEDS×DRUGS data analysis)
• Code Change: Add \`pharmacyPatientId\` reference to DRUGS + discharge webhook
• Review Required: YES — requires clinical sign-off before deployment
• Effort: 2 hours

**PRIORITY 2 — GAP-002 (Pharmacy→Billing)**
• Clinical Risk: Ghost billing, insurance fraud exposure
• Estimated Impact: ₹2.34L outstanding likely understated by ~18%
• Code Change: Add \`drug_id\` FK in INVOICES + dispensing event hook
• Review Required: NO — financial change, safe to deploy
• Effort: 3 hours

**PRIORITY 3 — GAP-003 (Billing→Analytics)**
• Clinical Risk: LOW — operational/strategic, not patient safety
• Code Change: Add analytics event emitter in Billing.jsx
• Review Required: NO
• Effort: 1 hour`,
  },
  {
    role: "user", mode: "agent",
    timestamp: "00:02:05",
    content: `Close GAP-001. Write the minimum code change to add pharmacyPatientId reference to Pharmacy.jsx. Show me the diff before applying.`,
  },
  {
    role: "bob",
    timestamp: "00:02:09",
    content: `🤖 **Agent Mode — Generating fix for GAP-001**

\`\`\`diff
// Pharmacy.jsx — DRUGS data structure
- { id: 1, name: 'Paracetamol 500mg', stock: 850, threshold: 200, ... }
+ { id: 1, name: 'Paracetamol 500mg', stock: 850, threshold: 200,
+   activePatientId: null,  // links to Wards.jsx bed.patient ID
+   lastDispensedBedId: null, // tracks which bed last received this
+   prescriptionStatus: 'open' // 'open' | 'closed' | 'discharged'
+ }

// Wards.jsx — discharge handler (new)
+ const handlePatientDischarge = (bedId, patientId) => {
+   // Notify pharmacy to close all active prescriptions for patient
+   closePrescriptionsForPatient(patientId);
+   setBedStatus(bedId, 'available');
+ };
\`\`\`

✅ **3 files modified** · 0 tests broken · Clinical review required before merge
⚠️ This change requires approval from: Clinical Lead + Pharmacist-in-charge`,
  },
];

export default function BobSession({ isAnalyzing, analysisComplete }: BobSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState<"ask" | "plan" | "agent">("ask");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Replay the demo conversation on load
  useEffect(() => {
    if (!analysisComplete) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    let i = 0;

    const addNext = () => {
      if (i >= DEMO_CONVERSATION.length) return;
      const nextMsg = DEMO_CONVERSATION[i];
      i++;
      if (nextMsg) {
        setMessages(prev => {
          if (prev.some(m => m.timestamp === nextMsg.timestamp && m.content === nextMsg.content)) {
            return prev;
          }
          return [...prev, nextMsg];
        });
      }
      if (i < DEMO_CONVERSATION.length) {
        timeoutId = setTimeout(addNext, i % 2 === 0 ? 800 : 1800);
      }
    };

    timeoutId = setTimeout(addNext, 400);
    return () => clearTimeout(timeoutId);
  }, [analysisComplete]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      role: "user", mode: activeMode,
      content: input, timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "bob",
        content: `Analyzing MediCore with IBM Bob 2.0 in **${activeMode.toUpperCase()} mode**...\n\n📦 Context loaded: 11 modules, 270k tokens\n✅ Response generated based on live MediCore codebase analysis.\n\nFor a full demo, see the conversation replay above.`,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      }]);
      setStreaming(false);
    }, 1400);
  };

  const modeColors = { ask: "var(--accent-blue)", plan: "var(--accent-purple)", agent: "var(--accent-green)" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
      {/* Chat window */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "700px" }}>
        {/* Chat header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "12px", background: "rgba(5,10,15,0.5)",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #388bfd, #bc8cff)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>IBM Bob 2.0 · MedTrace Session</div>
            <div style={{ fontSize: "11px", color: "var(--accent-green)" }}>
              {isAnalyzing ? "⟳ Scanning MediCore..." : analysisComplete ? "✓ Connected · 11 modules loaded · 270k context" : "Waiting to connect..."}
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["ask", "plan", "agent"] as const).map(mode => (
              <button key={mode}
                onClick={() => setActiveMode(mode)}
                style={{
                  padding: "5px 12px", border: "1px solid",
                  borderColor: activeMode === mode ? modeColors[mode] : "var(--border)",
                  background: activeMode === mode ? `rgba(${mode === "ask" ? "56,139,253" : mode === "plan" ? "188,140,255" : "63,185,80"},0.15)` : "transparent",
                  color: activeMode === mode ? modeColors[mode] : "var(--text-muted)",
                  borderRadius: "6px", fontSize: "11px", fontWeight: 700,
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.04em",
                  transition: "all 0.2s",
                }}
              >{mode}</button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {!analysisComplete && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", paddingTop: "40px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🤖</div>
              Waiting for IBM Bob to analyze MediCore...
            </div>
          )}
          {messages
            .filter((msg): msg is Message => Boolean(msg && msg.role))
            .map((msg, i) => (
            <div key={i} className="animate-fade-in" style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: "10px", alignItems: "flex-start",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                background: msg.role === "user"
                  ? "rgba(56,139,253,0.2)" : "linear-gradient(135deg, #388bfd44, #bc8cff44)",
                border: `1px solid ${msg.role === "user" ? "rgba(56,139,253,0.3)" : "rgba(188,140,255,0.3)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
              }}>
                {msg.role === "user" ? "👤" : "🤖"}
              </div>
              <div style={{ maxWidth: "80%" }}>
                {msg.mode && msg.role === "user" && (
                  <div style={{
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
                    color: modeColors[msg.mode], marginBottom: "4px",
                    textAlign: "right",
                  }}>{msg.mode.toUpperCase()} MODE</div>
                )}
                <div style={{
                  background: msg.role === "user"
                    ? "rgba(56,139,253,0.1)" : "rgba(13,31,53,0.8)",
                  border: `1px solid ${msg.role === "user" ? "rgba(56,139,253,0.2)" : "var(--border)"}`,
                  borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                  padding: "12px 16px",
                }}>
                  <pre style={{
                    fontFamily: "'Inter', sans-serif", fontSize: "12px",
                    color: "var(--text-secondary)", whiteSpace: "pre-wrap",
                    wordBreak: "break-word", lineHeight: 1.7, margin: 0,
                  }}>{msg.content}</pre>
                </div>
                <div style={{
                  fontSize: "10px", color: "var(--text-muted)", marginTop: "4px",
                  textAlign: msg.role === "user" ? "right" : "left",
                }}>{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {streaming && (
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "linear-gradient(135deg, #388bfd44, #bc8cff44)",
                border: "1px solid rgba(188,140,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
              }}>🤖</div>
              <div style={{
                background: "rgba(13,31,53,0.8)", border: "1px solid var(--border)",
                borderRadius: "4px 12px 12px 12px", padding: "14px 18px",
                display: "flex", gap: "5px", alignItems: "center",
              }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "var(--accent-blue)",
                    animation: `glow-pulse 1s ease-in-out ${j * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "16px", borderTop: "1px solid var(--border)",
          background: "rgba(5,10,15,0.5)", display: "flex", gap: "10px",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Ask IBM Bob in ${activeMode.toUpperCase()} mode... (Enter to send)`}
            style={{
              flex: 1, background: "rgba(13,31,53,0.8)",
              border: "1px solid var(--border)", borderRadius: "8px",
              color: "var(--text-primary)", padding: "10px 14px",
              resize: "none", fontSize: "13px", outline: "none",
              fontFamily: "'Inter', sans-serif", height: "44px",
              lineHeight: 1.5,
            }}
          />
          <button className="btn-primary" onClick={handleSend} style={{ padding: "10px 18px", height: "44px" }}>
            Send →
          </button>
        </div>
      </div>

      {/* Right: Mode guide */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "14px", color: "var(--text-secondary)" }}>
            BOB MODES
          </h4>
          {([
            { mode: "ask",   icon: "🔍", desc: "Analyze codebase, find patterns, map data flows" },
            { mode: "plan",  icon: "📋", desc: "Create risk register, prioritize fixes, estimate effort" },
            { mode: "agent", icon: "⚡", desc: "Generate code diff, open PR, apply approved changes" },
          ] as const).map(({ mode, icon, desc }) => (
            <div key={mode} style={{
              padding: "12px", borderRadius: "8px", marginBottom: "8px",
              background: activeMode === mode ? `rgba(${mode === "ask" ? "56,139,253" : mode === "plan" ? "188,140,255" : "63,185,80"},0.08)` : "rgba(255,255,255,0.02)",
              border: `1px solid ${activeMode === mode ? modeColors[mode] + "44" : "transparent"}`,
              cursor: "pointer", transition: "all 0.2s",
            }} onClick={() => setActiveMode(mode)}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                <span>{icon}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: modeColors[mode], textTransform: "uppercase" }}>{mode}</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "14px", color: "var(--text-secondary)" }}>
            CONTEXT LOADED
          </h4>
          {["Wards.jsx", "Pharmacy.jsx", "Billing.jsx", "MediSentinel™", "Lab", "Analytics", "Patients", "Appointments", "Doctors", "Auth", "Notifications"].map(m => (
            <div key={m} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)",
            }}>
              <span className="mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{m}</span>
              <span style={{ fontSize: "10px", color: "var(--accent-green)" }}>✓</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
