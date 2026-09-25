"use client";

import { useState, useEffect, useRef } from "react";

interface BobSessionProps {
  isAnalyzing: boolean;
  analysisComplete: boolean;
}

interface Message {
  id?: string;
  role: "user" | "bob";
  content: string;
  timestamp: string;
  mode?: "ask" | "plan" | "agent";
  thoughtChain?: string[];
}

const DEMO_CONVERSATION: Message[] = [
  {
    id: "m-1",
    role: "user", mode: "ask",
    timestamp: "00:00:02",
    content: `Read all 11 modules in MediCore. For each module:
1. What patient data does it create?
2. What patient data does it consume from other modules?
3. What data hand-off is MISSING (broken link)?
Map this as a directed graph with risk scores.`,
  },
  {
    id: "m-2",
    role: "bob",
    timestamp: "00:00:05",
    thoughtChain: [
      "Parsed AST for Admission.jsx, Wards.jsx, sentinelData.js, Pharmacy.jsx, Lab.jsx, Billing.jsx...",
      "Indexed 270,000 tokens of React/JavaScript state and Redux slices",
      "Constructed directed acyclic graph (DAG) of cross-feature event emitters",
      "Identified 3 unhandled data boundary transitions with zero foreign-key integrity",
    ],
    content: `✅ Read all 11 MediCore modules (270k context loaded). Analysis complete.

📊 **Patient Journey Map — Data Flow Analysis**

**Critical Disconnects Found (3):**

🔴 **GAP-001: Ward → Pharmacy (CRITICAL)**
• \`Wards.jsx\` assigns \`bed.patient\` on admission
• \`Pharmacy.jsx\` tracks DRUGS with NO reference to bed or patient ID
• Missing: Discharge event trigger to close active prescriptions
• Clinical Risk: Active prescriptions persist after discharge → medication administered to next bed occupant
• Market Impact: Direct root cause of 40% of hospital handoff errors ($42B global cost)

🔴 **GAP-002: Pharmacy → Billing (CRITICAL)**  
• \`Pharmacy.jsx\` bedside dispensing has no link to \`Billing.jsx\` INVOICES
• Missing: Drug cost line items omitted from patient billing ledger
• Financial Risk: ₹2.34L outstanding underreported; compliance penalty under insurer audit

🟡 **GAP-003: Billing → Analytics (MEDIUM)**
• Revenue stream in \`Billing.jsx\` not piped to Analytics dashboard
• Operational Risk: Stale financial capacity metrics for leadership

**Synchronized Flows (8 of 11):** Admission→Wards ✓, Wards→MediSentinel ✓, Lab→MediSentinel ✓, Appointments→Doctors ✓`,
  },
  {
    id: "m-3",
    role: "user", mode: "plan",
    timestamp: "00:01:10",
    content: `For each gap you found:
1. What is the clinical risk if exploited?
2. What is the minimum code change to close it?
3. Which changes are safe vs. require clinical review?
Output as a prioritized risk register.`,
  },
  {
    id: "m-4",
    role: "bob",
    timestamp: "00:01:14",
    thoughtChain: [
      "Evaluating clinical severity against WHO Patient Safety & NABH Standard QPS.5",
      "Analyzing dependency tree to isolate blast radius of potential refactors",
      "Flagging changes that alter prescription schemas for mandatory Human-in-the-Loop approval",
    ],
    content: `📋 **Clinical Risk Register & Remediation Roadmap**

**PRIORITY 1 — GAP-001 (Ward ↔ Pharmacy)**
• Severity: CRITICAL | Impact: ~4.3% of all discharges
• Clinical Risk: Dispensing error to newly admitted patient
• Minimum Code Fix: Inject \`pharmacyPatientId\` foreign key + dispatch \`onPatientDischarged\` event
• Governance Level: Clinical Lead + Chief Pharmacist sign-off required
• Estimated Dev Effort: 2 hours

**PRIORITY 2 — GAP-002 (Pharmacy ↔ Billing)**
• Severity: CRITICAL | Impact: 18% under-billing exposure
• Financial Risk: Payer fraud audit failure
• Minimum Code Fix: Add \`drug_id\` array to \`INVOICES\` schema in Billing.jsx
• Governance Level: Financial Controller review (Zero clinical risk)
• Estimated Dev Effort: 3 hours

**PRIORITY 3 — GAP-003 (Billing ↔ Analytics)**
• Severity: MEDIUM | Impact: Executive dashboard delay
• Minimum Code Fix: Subscribe Analytics store to Billing ledger events
• Governance Level: Safe for automated merge
• Estimated Dev Effort: 1 hour`,
  },
  {
    id: "m-5",
    role: "user", mode: "agent",
    timestamp: "00:02:05",
    content: `Close GAP-001. Write the minimum code change to add pharmacyPatientId reference to Pharmacy.jsx. Show me the diff before applying.`,
  },
  {
    id: "m-6",
    role: "bob",
    timestamp: "00:02:09",
    thoughtChain: [
      "Generating surgical patch for Pharmacy.jsx DRUGS data structure",
      "Adding discharge hook in Wards.jsx handlePatientDischarge",
      "Running AST syntax tree validator — 0 syntax errors detected",
    ],
    content: `🤖 **Agent Mode — Synthesizing Autonomous Code Patch for GAP-001**

\`\`\`diff
// Pharmacy.jsx — DRUGS data structure
- const DRUGS = [{ id: 1, name: 'Paracetamol 500mg', stock: 850, threshold: 200 }];
+ const DRUGS = [{ 
+   id: 1, name: 'Paracetamol 500mg', stock: 850, threshold: 200,
+   activePatientId: null,      // Links to Wards.jsx bed.patient ID
+   lastDispensedBedId: null,   // Tracks bedside location
+   prescriptionStatus: 'open'  // 'open' | 'closed' | 'discharged'
+ }];

// Wards.jsx — Bed discharge handler
+ const handlePatientDischarge = (bedId, patientId) => {
+   // Dispatch webhook to close all active bedside prescriptions
+   pharmacyService.closePrescriptionsForPatient(patientId);
+   setBedStatus(bedId, 'available');
+ };
\`\`\`

✅ **Patch Validated**: 2 files modified · 0 broken tests · Backward-compatible
⚠️ **Enterprise Governance**: Mandates sign-off from Chief Pharmacist prior to production deployment.`,
  },
];

const SUGGESTIONS = [
  { mode: "ask" as const, prompt: "Map GAP-001: Ward ↔ Pharmacy Disconnect" },
  { mode: "plan" as const, prompt: "Generate Prioritized Risk Register" },
  { mode: "agent" as const, prompt: "Generate Code Patch for GAP-001" },
  { mode: "ask" as const, prompt: "Deconstruct SHAP Drivers for Room ICU-3" },
];

export default function BobSession({ isAnalyzing, analysisComplete }: BobSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState<"ask" | "plan" | "agent">("ask");
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Replay the demo conversation smoothly
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

  const msgCounterRef = useRef(10);

  const handleSendPrompt = (text: string, modeOverride?: "ask" | "plan" | "agent") => {
    const mode = modeOverride || activeMode;
    const msgId = msgCounterRef.current++;
    const userMsg: Message = {
      id: `usr-${msgId}`,
      role: "user", mode,
      content: text,
      timestamp: "00:03:" + (msgId < 10 ? "0" + msgId : msgId),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    setTimeout(() => {
      let replyContent = "";
      let thoughtChain: string[] = [];

      if (mode === "ask") {
        thoughtChain = ["Scanning MediCore AST files...", "Evaluating cross-module dependencies", "Synthesizing answer from 270k context"];
        replyContent = `🔍 **IBM Bob 2.0 (Ask Mode)**\n\nAnalyzed 11 MediCore modules against your query:\n\n• **AST Match**: Found direct state references in \`sentinelData.js\` and \`Wards.jsx\`.\n• **Context Window**: 270k tokens active with zero truncation.\n• **Defensibility**: Cross-checked with EU AI Act Article 50 transparency requirements.`;
      } else if (mode === "plan") {
        thoughtChain = ["Assessing risk impact score", "Prioritizing remediation roadmap", "Structuring clinical change management sequence"];
        replyContent = `📋 **IBM Bob 2.0 (Plan Mode)**\n\nFormulated 3-phase deployment plan:\n\n1. **Phase 1 (Immediate)**: Apply schema migration to \`Pharmacy.jsx\`\n2. **Phase 2 (Clinical Approval)**: Obtain Dr. Sharma's digital signature for threshold updates\n3. **Phase 3 (Audit Verification)**: Regenerate ClinicalPassport cryptographic digest.`;
      } else {
        thoughtChain = ["Generating syntactically checked diff", "Running automated lint & regression suite", "Staging PR for human review"];
        replyContent = `⚡ **IBM Bob 2.0 (Agent Mode)**\n\nAutonomous patch prepared and validated against TypeScript compiler.\n\n\`\`\`typescript\n// Autonomous patch staged for merge\nexport const verifyIntegrity = (packet: HospitalTelemetry) => {\n  return crypto.createHash('sha256').update(JSON.stringify(packet)).digest('hex');\n};\n\`\`\`\n\n✅ Ready to deploy to MediCore dev server.`;
      }

      const bobMsgId = msgCounterRef.current++;
      setMessages(prev => [...prev, {
        id: `bob-${bobMsgId}`,
        role: "bob",
        content: replyContent,
        thoughtChain,
        timestamp: "00:03:" + (bobMsgId < 10 ? "0" + bobMsgId : bobMsgId),
      }]);
      setStreaming(false);
    }, 1400);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const modeColors = { ask: "var(--accent-blue)", plan: "var(--accent-purple)", agent: "var(--accent-green)" };

  return (
    <div className="bob-grid">
      {/* Main Terminal Window */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "740px" }}>
        {/* Terminal Header */}
        <div style={{
          padding: "16px 22px", borderBottom: "1px solid var(--border)",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
          background: "rgba(4, 8, 14, 0.75)", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #388bfd, #bc8cff)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
              boxShadow: "0 0 15px rgba(56, 139, 253, 0.35)",
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>IBM Bob 2.0 Agentic Workspace</span>
                <span className="badge badge-purple" style={{ fontSize: "9px" }}>270k Context</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--accent-green)", marginTop: "2px" }}>
                {isAnalyzing ? "⟳ Scanning MediCore..." : analysisComplete ? "✓ Connected · 11 Modules Loaded in Memory" : "Waiting for scan..."}
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: "flex", gap: "6px" }}>
            {(["ask", "plan", "agent"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                style={{
                  padding: "6px 14px", border: "1px solid",
                  borderColor: activeMode === mode ? modeColors[mode] : "var(--border)",
                  background: activeMode === mode ? `rgba(${mode === "ask" ? "56,139,253" : mode === "plan" ? "188,140,255" : "63,185,80"},0.15)` : "rgba(255,255,255,0.02)",
                  color: activeMode === mode ? modeColors[mode] : "var(--text-muted)",
                  borderRadius: "8px", fontSize: "11px", fontWeight: 700,
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em",
                  transition: "all 0.2s",
                }}
              >
                {mode} Mode
              </button>
            ))}
          </div>
        </div>

        {/* Suggestion Chips */}
        <div style={{
          padding: "10px 20px", background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid var(--border)", display: "flex", gap: "8px", overflowX: "auto",
        }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, alignSelf: "center", whiteSpace: "nowrap" }}>
            Try Prompts:
          </span>
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(s.prompt, s.mode)}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: "var(--text-secondary)",
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
              }}
              className="hover:border-accent-cyan hover:text-white"
            >
              {s.prompt}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {!analysisComplete && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", paddingTop: "50px" }}>
              <div style={{ fontSize: "42px", marginBottom: "14px" }}>🤖</div>
              Connecting to IBM Bob 2.0 Agentic Runtime...
            </div>
          )}

          {messages
            .filter((msg): msg is Message => Boolean(msg && msg.role))
            .map((msg, i) => (
              <div key={msg.id || i} className="animate-fade-in" style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                gap: "12px", alignItems: "flex-start",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                  background: msg.role === "user"
                    ? "rgba(56,139,253,0.2)" : "linear-gradient(135deg, #388bfd44, #bc8cff44)",
                  border: `1px solid ${msg.role === "user" ? "rgba(56,139,253,0.4)" : "rgba(188,140,255,0.4)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px",
                }}>
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>

                <div style={{ maxWidth: "82%" }}>
                  {msg.mode && msg.role === "user" && (
                    <div style={{
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
                      color: modeColors[msg.mode], marginBottom: "4px",
                      textAlign: "right",
                    }}>
                      {msg.mode.toUpperCase()} MODE
                    </div>
                  )}

                  {/* Bob Thought Chain Accordion */}
                  {msg.thoughtChain && msg.thoughtChain.length > 0 && (
                    <div style={{
                      background: "rgba(188, 140, 255, 0.06)", border: "1px solid rgba(188, 140, 255, 0.2)",
                      borderRadius: "8px", padding: "8px 12px", marginBottom: "8px", fontSize: "11px",
                    }}>
                      <div style={{ fontWeight: 700, color: "var(--accent-purple)", marginBottom: "4px" }}>
                        🧠 IBM Bob Autonomous Thought Chain:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px", color: "var(--text-secondary)" }}>
                        {msg.thoughtChain.map((tc, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "6px" }}>
                            <span style={{ color: "var(--accent-purple)" }}>›</span>
                            <span>{tc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{
                    background: msg.role === "user" ? "rgba(56,139,253,0.12)" : "rgba(10,24,44,0.85)",
                    border: `1px solid ${msg.role === "user" ? "rgba(56,139,253,0.25)" : "var(--border)"}`,
                    borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                    padding: "14px 18px", position: "relative",
                  }}>
                    <pre style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "12.5px",
                      color: "var(--text-primary)", whiteSpace: "pre-wrap",
                      wordBreak: "break-word", lineHeight: 1.7, margin: 0,
                    }}>{msg.content}</pre>

                    {msg.role === "bob" && (
                      <button
                        onClick={() => handleCopy(msg.id || `${i}`, msg.content)}
                        style={{
                          position: "absolute", top: "10px", right: "10px",
                          background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
                          borderRadius: "4px", padding: "3px 8px", fontSize: "10px", color: "var(--text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        {copiedId === (msg.id || `${i}`) ? "✓ Copied" : "Copy"}
                      </button>
                    )}
                  </div>

                  <div style={{
                    fontSize: "10px", color: "var(--text-muted)", marginTop: "4px",
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}>{msg.timestamp}</div>
                </div>
              </div>
            ))}

          {streaming && (
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: "linear-gradient(135deg, #388bfd44, #bc8cff44)",
                border: "1px solid rgba(188,140,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px",
              }}>🤖</div>
              <div style={{
                background: "rgba(10,24,44,0.85)", border: "1px solid var(--border)",
                borderRadius: "4px 14px 14px 14px", padding: "14px 20px",
                display: "flex", gap: "6px", alignItems: "center",
              }}>
                <span style={{ fontSize: "11px", color: "var(--accent-cyan)", marginRight: "6px" }}>Bob is reasoning...</span>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "var(--accent-cyan)",
                    animation: `glow-pulse 1s ease-in-out ${j * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          padding: "16px 20px", borderTop: "1px solid var(--border)",
          background: "rgba(4, 8, 14, 0.75)", display: "flex", gap: "12px", alignItems: "center",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) handleSendPrompt(input);
              }
            }}
            placeholder={`Ask IBM Bob in ${activeMode.toUpperCase()} mode... (Press Enter to execute)`}
            style={{
              flex: 1, background: "rgba(10, 24, 44, 0.9)",
              border: "1px solid var(--border)", borderRadius: "10px",
              color: "var(--text-primary)", padding: "12px 16px",
              resize: "none", fontSize: "13px", outline: "none",
              fontFamily: "'Inter', sans-serif", height: "48px",
              lineHeight: 1.5,
            }}
          />
          <button
            className="btn-primary"
            onClick={() => { if (input.trim()) handleSendPrompt(input); }}
            style={{ padding: "0 22px", height: "48px" }}
          >
            Execute →
          </button>
        </div>
      </div>

      {/* Right: Bob Architectural Specs & Context Inspector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Bob Modes Spec */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <h4 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            NATIVE BOB 2.0 CAPABILITIES
          </h4>
          {[
            { mode: "ask",   icon: "🔍", title: "Ask Mode", desc: "Global codebase semantic query across 270k context" },
            { mode: "plan",  icon: "📋", title: "Plan Mode", desc: "Prioritizes clinical risk registers & governance" },
            { mode: "agent", icon: "⚡", title: "Agent Mode", desc: "Autonomous AST patches with Human-in-the-Loop review" },
          ].map(({ mode, icon, title, desc }) => (
            <div
              key={mode}
              onClick={() => setActiveMode(mode as "ask" | "plan" | "agent")}
              style={{
                padding: "12px", borderRadius: "10px", marginBottom: "8px",
                background: activeMode === mode ? `rgba(${mode === "ask" ? "56,139,253" : mode === "plan" ? "188,140,255" : "63,185,80"},0.12)` : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeMode === mode ? modeColors[mode as keyof typeof modeColors] : "transparent"}`,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "3px" }}>
                <span>{icon}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: modeColors[mode as keyof typeof modeColors] }}>
                  {title}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        {/* Loaded Context Files */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ACTIVE AST CONTEXT (11)
            </h4>
            <span style={{ fontSize: "10px", color: "var(--accent-cyan)", fontWeight: 700 }}>270k TOKENS</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { name: "Wards.jsx", size: "14.2 kb", gap: true },
              { name: "Pharmacy.jsx", size: "12.8 kb", gap: true },
              { name: "Billing.jsx", size: "18.4 kb", gap: true },
              { name: "sentinelData.js", size: "26.1 kb", gap: false },
              { name: "Lab.jsx", size: "11.5 kb", gap: false },
              { name: "Analytics.jsx", size: "15.9 kb", gap: true },
              { name: "Admission.jsx", size: "9.8 kb", gap: false },
              { name: "Doctors.jsx", size: "8.4 kb", gap: false },
            ].map(m => (
              <div key={m.name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "6px 8px", background: "rgba(0,0,0,0.2)", borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="mono" style={{ fontSize: "11px", color: m.gap ? "#ff7b72" : "var(--text-primary)" }}>
                    {m.name}
                  </span>
                  {m.gap && <span style={{ fontSize: "9px", background: "rgba(248,81,73,0.2)", color: "#ff7b72", padding: "1px 4px", borderRadius: "3px" }}>GAP</span>}
                </div>
                <span className="mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>{m.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
