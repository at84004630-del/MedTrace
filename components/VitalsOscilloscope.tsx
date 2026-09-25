"use client";

import { useEffect, useRef, useState } from "react";

interface VitalsOscilloscopeProps {
  onTriggerCrisisAlert?: () => void;
}

export default function VitalsOscilloscope({ onTriggerCrisisAlert }: VitalsOscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [heartRate, setHeartRate] = useState(74);
  const [spo2, setSpo2] = useState(98);
  const [mapVal, setMapVal] = useState(94);
  const [packetCount, setPacketCount] = useState(148290);

  // Crisis Mode Toggle
  const toggleCrisis = () => {
    const nextCrisis = !isCrisis;
    setIsCrisis(nextCrisis);
    if (nextCrisis) {
      setHeartRate(128);
      setSpo2(91);
      setMapVal(66);
      if (onTriggerCrisisAlert) onTriggerCrisisAlert();
    } else {
      setHeartRate(74);
      setSpo2(98);
      setMapVal(94);
    }
  };

  // Packet stream ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketCount(prev => prev + Math.floor(Math.random() * 8 + 12));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // 60FPS ECG Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const height = canvas.height;
    const width = canvas.width;
    const midY = height / 2;

    // Grid background
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(56, 139, 253, 0.08)";
      ctx.lineWidth = 1;
      const step = 15;
      for (let i = 0; i < width; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += step) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }
    };

    // Draw initial black bg and grid
    ctx.fillStyle = "rgba(4, 10, 18, 1)";
    ctx.fillRect(0, 0, width, height);
    drawGrid();

    let stepCounter = 0;

    const render = () => {
      stepCounter++;
      const speed = isCrisis ? 3.5 : 2.0;

      // Clear cursor trail
      ctx.fillStyle = "rgba(4, 10, 18, 0.06)";
      ctx.fillRect(x, 0, 16, height);

      // Re-draw faint grid behind cursor
      ctx.strokeStyle = "rgba(56, 139, 253, 0.04)";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Calculate ECG amplitude
      let yOffset = 0;
      const cycle = isCrisis ? 28 : 55;
      const pos = stepCounter % cycle;

      if (!isCrisis) {
        // Normal P-QRS-T complex
        if (pos > 8 && pos < 14) {
          yOffset = -Math.sin(((pos - 8) / 6) * Math.PI) * 7; // P wave
        } else if (pos === 20) {
          yOffset = 5; // Q
        } else if (pos === 22) {
          yOffset = -34; // R spike
        } else if (pos === 24) {
          yOffset = 14; // S
        } else if (pos > 30 && pos < 42) {
          yOffset = -Math.sin(((pos - 30) / 12) * Math.PI) * 11; // T wave
        }
      } else {
        // Tachycardia with ectopic spikes
        if (pos === 8) {
          yOffset = -42;
        } else if (pos === 10) {
          yOffset = 22;
        } else if (pos > 14 && pos < 22) {
          yOffset = -Math.sin(((pos - 14) / 8) * Math.PI) * 16;
        }
      }

      const nextX = (x + speed) % width;
      const nextY = midY + yOffset;

      // Draw glowing ECG line
      ctx.shadowBlur = isCrisis ? 12 : 8;
      ctx.shadowColor = isCrisis ? "#f85149" : "#58d6e8";
      ctx.strokeStyle = isCrisis ? "#ff7b72" : "#58d6e8";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(x, midY);
      ctx.lineTo(nextX, nextY);
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;

      x = nextX;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isCrisis]);

  return (
    <div className="glass-card" style={{
      padding: "16px 20px", marginBottom: "24px",
      border: isCrisis ? "1px solid rgba(248,81,73,0.5)" : "1px solid var(--border)",
      background: isCrisis ? "rgba(35, 12, 18, 0.85)" : "rgba(6, 14, 26, 0.85)",
      transition: "all 0.3s ease",
    }}>
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between",
        alignItems: "center", gap: "16px",
      }}>
        {/* Left: Waveform Header & Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: isCrisis ? "rgba(248,81,73,0.2)" : "rgba(56,139,253,0.15)",
            border: `1px solid ${isCrisis ? "rgba(248,81,73,0.4)" : "rgba(56,139,253,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px",
          }}>
            {isCrisis ? "🚨" : "💓"}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "-0.01em" }}>
                Live Inpatient Telemetry Pipeline
              </span>
              <span className={`badge ${isCrisis ? "badge-critical" : "badge-ok"}`} style={{ fontSize: "9px" }}>
                {isCrisis ? "CRITICAL CRISIS EVENT" : "STABLE SINUS RHYTHM"}
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Bed ICU-3 · MediSentinel™ BiLSTM Feed · Ingesting {packetCount.toLocaleString()} packets
            </div>
          </div>
        </div>

        {/* Center: Live Canvas Oscilloscope */}
        <div style={{ flex: 1, minWidth: "260px", maxWidth: "480px", height: "54px", position: "relative" }}>
          <canvas
            ref={canvasRef}
            width={480}
            height={54}
            className="oscilloscope-canvas"
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>

        {/* Right: Live Vital Numerics & Crisis Simulator Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)" }}>HEART RATE</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: isCrisis ? "var(--critical)" : "var(--accent-cyan)", lineHeight: 1.1 }}>
                {heartRate} <span style={{ fontSize: "10px", fontWeight: 500 }}>bpm</span>
              </div>
            </div>

            <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)" }}>SpO₂</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: isCrisis ? "var(--critical)" : "var(--accent-green)", lineHeight: 1.1 }}>
                {spo2}%
              </div>
            </div>

            <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)" }}>MAP</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: isCrisis ? "var(--accent-orange)" : "var(--text-primary)", lineHeight: 1.1 }}>
                {mapVal} <span style={{ fontSize: "10px", fontWeight: 500 }}>mmHg</span>
              </div>
            </div>
          </div>

          {/* Interactive Crisis Simulator Button */}
          <button
            onClick={toggleCrisis}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              background: isCrisis ? "rgba(248,81,73,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${isCrisis ? "var(--critical)" : "var(--border)"}`,
              color: isCrisis ? "#ff7b72" : "var(--text-primary)",
              display: "flex", alignItems: "center", gap: "6px",
            }}
            className="hover:border-accent-cyan"
            title="Toggle simulated patient acute crisis deterioration to test MedTrace autonomous alert and passport generation"
          >
            <span>{isCrisis ? "⚡ Stabilize Patient" : "⚠️ Inject Septic Crisis"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
