import { useState, useEffect, useRef } from "react";

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };

const CIRCUMFERENCE = 2 * Math.PI * 88;
const today = () => new Date().toISOString().split("T")[0];

const fmt = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
    : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};

const cardStyle = {
  background: "#fff9f6",
  border: "0.5px solid #ddc8bc",
  borderRadius: "12px",
};

export default function Timer() {
  const [mode, setMode]         = useState("pomodoro");
  const [phase, setPhase]       = useState("work");
  const [running, setRunning]   = useState(false);
  const [seconds, setSeconds]   = useState(25 * 60);
  const [total, setTotal]       = useState(25 * 60);
  const [pomoWork, setPomoWork] = useState(25);
  const [pomoBreak, setPomoBreak] = useState(5);
  const [pomoCount, setPomoCount] = useState(0);
  const [label, setLabel]       = useState("");
  const [sessions, setSessions] = useState(() => load("ms_timer", []));
  const [customH, setCustomH]   = useState(0);
  const [customM, setCustomM]   = useState(25);
  const [customS, setCustomS]   = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            onEnd();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const onEnd = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start(); osc.stop(ctx.currentTime + 1.2);
    } catch (e) {}

    const type = mode === "custom" ? "custom" : phase === "work" ? "pomo" : "break";
    const mins = Math.round(total / 60);
    const sessionLabel = label || (mode === "pomodoro" ? (phase === "work" ? "Work session" : "Break") : "Custom timer");
    const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const newSession = { label: sessionLabel, mins, type, time, date: today() };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    save("ms_timer", updated);

    if (mode === "pomodoro") {
      if (phase === "work") {
        setPomoCount(c => Math.min(c + 1, 4));
        setPhase("break");
        setSeconds(pomoBreak * 60);
        setTotal(pomoBreak * 60);
      } else {
        setPhase("work");
        setSeconds(pomoWork * 60);
        setTotal(pomoWork * 60);
      }
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    if (mode === "pomodoro") {
      setPhase("work"); setPomoCount(0);
      setSeconds(pomoWork * 60); setTotal(pomoWork * 60);
    } else {
      const s = customH * 3600 + customM * 60 + customS;
      setSeconds(s); setTotal(s);
    }
  };

  const skip = () => {
    setRunning(false);
    if (mode === "pomodoro") {
      const next = phase === "work" ? "break" : "work";
      setPhase(next);
      const s = next === "work" ? pomoWork * 60 : pomoBreak * 60;
      setSeconds(s); setTotal(s);
    } else reset();
  };

  const setPreset = (w, b) => {
    setPomoWork(w); setPomoBreak(b);
    setRunning(false); setPhase("work");
    setSeconds(w * 60); setTotal(w * 60);
  };

  const switchMode = (m) => {
    setMode(m); setRunning(false);
    if (m === "pomodoro") {
      setSeconds(pomoWork * 60); setTotal(pomoWork * 60); setPhase("work");
    } else {
      const s = customH * 3600 + customM * 60 + customS;
      setSeconds(s); setTotal(s);
    }
  };

  const updateCustom = (h, m, s) => {
    const t = h * 3600 + m * 60 + s;
    setSeconds(t); setTotal(t);
  };

  const pct    = total > 0 ? seconds / total : 1;
  const offset = CIRCUMFERENCE * (1 - pct);
  const ringColor = mode === "custom" ? "#e8a84a" : phase === "work" ? "#b85c38" : "#7bae9e";

  const todaySessions = sessions.filter(s => s.date === today());
  const pomos     = todaySessions.filter(s => s.type === "pomo").length;
  const totalMins = todaySessions.filter(s => s.type !== "break").reduce((a, s) => a + s.mins, 0);

  const TYPE_STYLE = {
    pomo:   { bg: "#f5e8e0", color: "#b85c38", label: "Pomo" },
    break:  { bg: "#eef7f4", color: "#7bae9e", label: "Break" },
    custom: { bg: "#fdf5e6", color: "#e8a84a", label: "Custom" },
  };

  return (
    <div style={{ width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div className="page-title">
          Focus <em style={{ color: "#b85c38", fontStyle: "italic" }}>Timer</em>
        </div>
        <div className="page-sub">Pomodoro · Custom — stay in the zone</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>

        {/* Left — Timer */}
        <div style={cardStyle}>
          {/* Mode toggle */}
          <div style={{ display: "flex", borderBottom: "0.5px solid #ddc8bc", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
            {["pomodoro", "custom"].map((m, i) => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: "13px",
                border: "none",
                borderLeft: i > 0 ? "0.5px solid #ddc8bc" : "none",
                background: mode === m ? "#f0ddd3" : "transparent",
                color: mode === m ? "#1a1008" : "#a07060",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "0.82rem", fontWeight: mode === m ? 500 : 400,
                cursor: "pointer", transition: "all 0.15s",
                textTransform: "capitalize",
              }}>{m}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 28px" }}>

            {/* Ring */}
            <div style={{ position: "relative" }}>
              <svg style={{ transform: "rotate(-90deg)" }} width="200" height="200" viewBox="0 0 200 200">
                <circle fill="none" stroke="#f0e4dc" strokeWidth="6" cx="100" cy="100" r="88" />
                <circle fill="none" stroke={ringColor} strokeWidth="6" strokeLinecap="round"
                  cx="100" cy="100" r="88"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s" }}
                />
              </svg>
            </div>

            {/* Time */}
            <div style={{
              fontFamily: "DM Serif Display, serif", fontSize: "3.2rem",
              color: "#1a1008", marginTop: "16px", lineHeight: 1,
            }}>{fmt(seconds)}</div>

            {/* Phase label */}
            <div style={{
              fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#a07060", marginTop: "6px", marginBottom: "20px", fontWeight: 500,
            }}>
              {mode === "pomodoro" ? (phase === "work" ? "Work session" : "Break") : "Custom timer"}
            </div>

            {/* Presets */}
            {mode === "pomodoro" && (
              <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                {[{ w: 25, b: 5, l: "25 / 5" }, { w: 50, b: 10, l: "50 / 10" }, { w: 15, b: 3, l: "15 / 3" }].map(p => (
                  <button key={p.l} onClick={() => setPreset(p.w, p.b)} style={{
                    padding: "5px 14px", borderRadius: "20px",
                    border: pomoWork === p.w ? "1.5px solid #b85c38" : "0.5px solid #ddc8bc",
                    background: pomoWork === p.w ? "#f0ddd3" : "#fff9f6",
                    color: pomoWork === p.w ? "#1a1008" : "#a07060",
                    fontSize: "0.72rem", cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
                  }}>{p.l}</button>
                ))}
              </div>
            )}

            {/* Custom inputs */}
            {mode === "custom" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                {[
                  { label: "H", val: customH, set: setCustomH },
                  { label: "M", val: customM, set: setCustomM },
                  { label: "S", val: customS, set: setCustomS },
                ].map((f, i) => (
                  <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {i > 0 && <span style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.4rem", color: "#a07060" }}>:</span>}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.6rem", color: "#a07060", fontWeight: 500, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{f.label}</div>
                      <input type="number" value={f.val} min="0" max={f.label === "H" ? 23 : 59}
                        onChange={e => {
                          f.set(+e.target.value);
                          const h = f.label === "H" ? +e.target.value : customH;
                          const m = f.label === "M" ? +e.target.value : customM;
                          const s = f.label === "S" ? +e.target.value : customS;
                          updateCustom(h, m, s);
                        }}
                        style={{
                          width: 56, height: 44, border: "0.5px solid #ddc8bc",
                          borderRadius: 8, fontFamily: "DM Serif Display, serif",
                          fontSize: "1.3rem", textAlign: "center", color: "#1a1008",
                          outline: "none", background: "#fdf6f2",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <button onClick={reset} style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "0.5px solid #ddc8bc", background: "#fff9f6",
                cursor: "pointer", fontSize: "1rem", color: "#a07060",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>↺</button>
              <button onClick={() => setRunning(r => !r)} style={{
                width: 60, height: 60, borderRadius: "50%",
                border: "none", background: "#1a1008",
                color: "#fdf6f2", cursor: "pointer", fontSize: "1.2rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {running ? "⏸" : "▶"}
              </button>
              <button onClick={skip} style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "0.5px solid #ddc8bc", background: "#fff9f6",
                cursor: "pointer", fontSize: "1rem", color: "#a07060",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>⏭</button>
            </div>

            {/* Pomodoro dots */}
            {mode === "pomodoro" && (
              <div style={{ display: "flex", gap: "6px", marginTop: "18px" }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: i < pomoCount ? "#b85c38" : "#f0e4dc",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
            )}

            {/* Label */}
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="What are you working on?"
              style={{
                marginTop: "18px", width: "100%", maxWidth: 220,
                padding: "8px 14px", borderRadius: "20px",
                border: "0.5px solid #ddc8bc", fontFamily: "DM Sans, sans-serif",
                fontSize: "0.78rem", textAlign: "center",
                outline: "none", color: "#1a1008", background: "#fdf6f2",
              }}
            />
          </div>
        </div>

        {/* Right — Stats + Log */}
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
            {[
              { val: pomos,              label: "Pomodoros" },
              { val: totalMins,          label: "Mins focused" },
              { val: todaySessions.length, label: "Sessions" },
            ].map(s => (
              <div key={s.label} style={{ ...cardStyle, textAlign: "center", padding: "16px" }}>
                <div style={{
                  fontFamily: "DM Serif Display, serif",
                  fontSize: "1.8rem", color: "#b85c38", lineHeight: 1, marginBottom: "4px",
                }}>{s.val}</div>
                <div style={{
                  fontSize: "0.6rem", color: "#a07060",
                  fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em",
                }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Session log */}
          <div style={cardStyle}>
            <div style={{
              padding: "14px 18px", borderBottom: "0.5px solid #ddc8bc",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#1a1008" }}>Today's sessions</div>
              <button
                onClick={() => { const u = sessions.filter(s => s.date !== today()); setSessions(u); save("ms_timer", u); }}
                style={{
                  background: "none", border: "0.5px solid #ddc8bc", borderRadius: 6,
                  padding: "3px 10px", fontSize: "0.68rem", color: "#a07060",
                  cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                }}
              >Clear</button>
            </div>

            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {todaySessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#a07060", fontSize: "0.78rem" }}>
                  No sessions yet — start focusing
                </div>
              ) : todaySessions.map((s, i) => (
                <div key={i} style={{
                  padding: "12px 18px",
                  borderBottom: i < todaySessions.length - 1 ? "0.5px solid #f0e4dc" : "none",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#1a1008" }}>{s.label}</div>
                    <div style={{ fontSize: "0.68rem", color: "#a07060", marginTop: "2px" }}>{s.time}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#a07060" }}>{s.mins} min</span>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "0.62rem", fontWeight: 500,
                      background: TYPE_STYLE[s.type]?.bg,
                      color: TYPE_STYLE[s.type]?.color,
                    }}>{TYPE_STYLE[s.type]?.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}