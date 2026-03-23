import { useState, useEffect, useRef } from "react";

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };

const CIRCUMFERENCE = 2 * Math.PI * 88;
const today = () => new Date().toISOString().split("T")[0];

export default function Timer() {
  const [mode, setMode] = useState("pomodoro");
  const [phase, setPhase] = useState("work");
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [total, setTotal] = useState(25 * 60);
  const [pomoWork, setPomoWork] = useState(25);
  const [pomoBreak, setPomoBreak] = useState(5);
  const [pomoCount, setPomoCount] = useState(0);
  const [label, setLabel] = useState("");
  const [sessions, setSessions] = useState(() => load("ms_timer", []));
  const [customH, setCustomH] = useState(0);
  const [customM, setCustomM] = useState(25);
  const [customS, setCustomS] = useState(0);
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
    const sessionLabel = label || (mode === "pomodoro" ? (phase === "work" ? "Work Session" : "Break") : "Custom Timer");
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
      const nextPhase = phase === "work" ? "break" : "work";
      setPhase(nextPhase);
      const s = nextPhase === "work" ? pomoWork * 60 : pomoBreak * 60;
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
    if (m === "pomodoro") { setSeconds(pomoWork * 60); setTotal(pomoWork * 60); setPhase("work"); }
    else { const s = customH * 3600 + customM * 60 + customS; setSeconds(s); setTotal(s); }
  };

  const updateCustom = (h, m, s) => {
    const total = h * 3600 + m * 60 + s;
    setSeconds(total); setTotal(total);
  };

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
      : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const pct = total > 0 ? seconds / total : 1;
  const offset = CIRCUMFERENCE * (1 - pct);
  const ringColor = mode === "custom" ? "#D4A853" : phase === "work" ? "#7BAE9E" : "#E8A090";

  const todaySessions = sessions.filter(s => s.date === today());
  const pomos = todaySessions.filter(s => s.type === "pomo").length;
  const totalMins = todaySessions.filter(s => s.type !== "break").reduce((a, s) => a + s.mins, 0);

  const card = { background: "white", borderRadius: "16px", border: "1.5px solid #f0d6e4" };
  const btnStyle = (active) => ({
    flex: 1, padding: "12px", border: "none", background: active ? "#1a1a2e" : "transparent",
    color: active ? "white" : "#aaa", fontFamily: "DM Sans, sans-serif",
    fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all .2s"
  });

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#1a1a2e" }}>
          Focus <em style={{ color: "#c45c82" }}>Timer</em>
        </div>
        <div style={{ fontSize: "0.82rem", color: "#aaa", marginTop: "4px" }}>Pomodoro · Custom — stay in the zone</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>

        {/* Left — Timer */}
        <div style={card}>
          {/* Mode toggle */}
          <div style={{ display: "flex", borderBottom: "1.5px solid #f0d6e4" }}>
            <button style={btnStyle(mode === "pomodoro")} onClick={() => switchMode("pomodoro")}>🍅 Pomodoro</button>
            <button style={{ ...btnStyle(mode === "custom"), borderLeft: "1.5px solid #f0d6e4" }} onClick={() => switchMode("custom")}>⏱ Custom</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 28px" }}>
            {/* Ring */}
            <svg style={{ transform: "rotate(-90deg)" }} width="200" height="200" viewBox="0 0 200 200">
              <circle fill="none" stroke="#f0d6e4" strokeWidth="8" cx="100" cy="100" r="88" />
              <circle fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round"
                cx="100" cy="100" r="88"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s" }}
              />
            </svg>

            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "3.5rem", color: "#1a1a2e", marginTop: "20px", lineHeight: 1 }}>{fmt(seconds)}</div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: "20px", marginTop: "6px" }}>
              {mode === "pomodoro" ? (phase === "work" ? "Work Session" : "Break Time ☕") : "Custom Timer"}
            </div>

            {/* Presets */}
            {mode === "pomodoro" && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                {[{ w: 25, b: 5, l: "Classic 25/5" }, { w: 50, b: 10, l: "Deep 50/10" }, { w: 15, b: 3, l: "Quick 15/3" }].map(p => (
                  <button key={p.l} onClick={() => setPreset(p.w, p.b)} style={{
                    padding: "6px 14px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 600,
                    border: `1.5px solid ${pomoWork === p.w ? "#1a1a2e" : "#f0d6e4"}`,
                    background: pomoWork === p.w ? "#1a1a2e" : "white",
                    color: pomoWork === p.w ? "white" : "#aaa", cursor: "pointer", fontFamily: "DM Sans, sans-serif"
                  }}>{p.l}</button>
                ))}
              </div>
            )}

            {/* Custom inputs */}
            {mode === "custom" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                {[{ label: "H", val: customH, set: setCustomH }, { label: "M", val: customM, set: setCustomM }, { label: "S", val: customS, set: setCustomS }].map((f, i) => (
                  <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {i > 0 && <span style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.4rem", color: "#aaa" }}>:</span>}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", color: "#aaa", fontWeight: 700, marginBottom: "4px" }}>{f.label}</div>
                      <input type="number" value={f.val} min="0" max={f.label === "H" ? 23 : 59}
                        onChange={e => {
                          f.set(+e.target.value);
                          const h = f.label === "H" ? +e.target.value : customH;
                          const m = f.label === "M" ? +e.target.value : customM;
                          const s = f.label === "S" ? +e.target.value : customS;
                          updateCustom(h, m, s);
                        }}
                        style={{ width: 60, height: 48, border: "1.5px solid #f0d6e4", borderRadius: 10, fontFamily: "DM Serif Display, serif", fontSize: "1.4rem", textAlign: "center", color: "#1a1a2e", outline: "none" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={reset} style={{ width: 48, height: 48, borderRadius: "50%", border: "1.5px solid #f0d6e4", background: "white", cursor: "pointer", fontSize: "1.1rem" }}>↺</button>
              <button onClick={() => setRunning(r => !r)} style={{ width: 64, height: 64, borderRadius: "50%", border: "none", background: "#1a1a2e", color: "white", cursor: "pointer", fontSize: "1.4rem", boxShadow: "0 4px 16px rgba(26,26,46,0.2)" }}>
                {running ? "⏸" : "▶"}
              </button>
              <button onClick={skip} style={{ width: 48, height: 48, borderRadius: "50%", border: "1.5px solid #f0d6e4", background: "white", cursor: "pointer", fontSize: "1.1rem" }}>⏭</button>
            </div>

            {/* Pomodoro dots */}
            {mode === "pomodoro" && (
              <div style={{ display: "flex", gap: "6px", marginTop: "20px" }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < pomoCount ? "#7BAE9E" : "#f0d6e4", transition: "background .3s" }} />
                ))}
              </div>
            )}

            {/* Label */}
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="What are you working on?"
              style={{ marginTop: "18px", width: "100%", maxWidth: 220, padding: "8px 14px", borderRadius: "50px", border: "1.5px solid #f0d6e4", fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", textAlign: "center", outline: "none", color: "#1a1a2e", background: "#fff9fc" }}
            />
          </div>
        </div>

        {/* Right — Stats + Log */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {[
              { val: pomos, label: "Pomodoros", color: "#7BAE9E" },
              { val: totalMins, label: "Mins Focused", color: "#1a1a2e" },
              { val: todaySessions.length, label: "Sessions", color: "#D4A853" },
            ].map(s => (
              <div key={s.label} style={{ ...card, textAlign: "center", padding: "16px" }}>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: s.color }}>{s.val}</div>
                <div style={{ fontSize: "0.68rem", color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={{ padding: "14px 18px", borderBottom: "1.5px solid #f0d6e4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1a1a2e" }}>Today's Sessions</div>
              <button onClick={() => { const updated = sessions.filter(s => s.date !== today()); setSessions(updated); save("ms_timer", updated); }}
                style={{ background: "none", border: "1.5px solid #f0d6e4", borderRadius: 8, padding: "4px 10px", fontSize: "0.72rem", color: "#aaa", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Clear</button>
            </div>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {todaySessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#cbb" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎯</div>
                  <div style={{ fontSize: "0.82rem" }}>No sessions yet. Start focusing!</div>
                </div>
              ) : todaySessions.map((s, i) => (
                <div key={i} style={{ padding: "12px 18px", borderBottom: "1px solid #f0d6e4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1a1a2e" }}>{s.label}</div>
                    <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "2px" }}>{s.time}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{s.mins} min</span>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700,
                      background: s.type === "pomo" ? "#FDF0ED" : s.type === "break" ? "#EAF3F0" : "#FDF6E7",
                      color: s.type === "pomo" ? "#E8A090" : s.type === "break" ? "#5a9080" : "#D4A853"
                    }}>
                      {s.type === "pomo" ? "🍅 Pomo" : s.type === "break" ? "☕ Break" : "⏱ Custom"}
                    </span>
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