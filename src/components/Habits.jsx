import { useState, useEffect } from "react";

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };

const DEFAULT_HABITS = [
  "💧 Drink 2L Water", "🏃 Exercise", "📚 Study today",
  "🛏️ Sleep by 11 PM", "🍎 Eat clean", "🧘 Morning stretch",
  "✍️ Journal", "☀️ Get sunlight",
];

export default function Habits() {
  const today = new Date().toISOString().split("T")[0];
  const [habits, setHabits] = useState(() => load("ms_habits", DEFAULT_HABITS));
  const [checks, setChecks] = useState(() => load("ms_checks", {}));
  const [newHabit, setNewHabit] = useState("");
  const [viewDate, setViewDate] = useState(() => {
    const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() + 1 };
  });

  useEffect(() => { save("ms_habits", habits); }, [habits]);
  useEffect(() => { save("ms_checks", checks); }, [checks]);

  const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const days = daysInMonth(viewDate.y, viewDate.m);
  const todayStr = today;

  const key = (i, d) => `${i}_${viewDate.y}-${String(viewDate.m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const dateStr = (d) => `${viewDate.y}-${String(viewDate.m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const isChecked = (i, d) => !!checks[key(i, d)];
  const isFuture = (d) => dateStr(d) > todayStr;
  const isToday = (d) => dateStr(d) === todayStr;

  const toggle = (i, d) => {
    if (isFuture(d)) return;
    const k = key(i, d);
    setChecks(prev => { const n = {...prev}; n[k] ? delete n[k] : (n[k] = true); return n; });
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits(prev => [...prev, newHabit.trim()]);
    setNewHabit("");
  };

  const deleteHabit = (i) => setHabits(prev => prev.filter((_, idx) => idx !== i));

  const changeMonth = (dir) => {
    setViewDate(prev => {
      let m = prev.m + dir, y = prev.y;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      return { y, m };
    });
  };

  // Stats
  const todayChecks = habits.filter((_, i) => isChecked(i, parseInt(todayStr.split("-")[2]))).length;
  const totalPossible = habits.length * parseInt(todayStr.split("-")[2]);
  const totalChecked = Object.keys(checks).filter(k => k.includes(`_${viewDate.y}-${String(viewDate.m).padStart(2,"0")}`)).length;
  const monthPct = totalPossible > 0 ? Math.round(totalChecked / totalPossible * 100) : 0;

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const card = { background: "white", borderRadius: "16px", border: "1.5px solid #f0d6e4", padding: "20px" };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#1a1a2e" }}>
            Habit <em style={{ color: "#c45c82" }}>Tracker</em>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#aaa", marginTop: "4px" }}>
            {todayChecks}/{habits.length} done today · {monthPct}% this month
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => changeMonth(-1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #f0d6e4", background: "white", cursor: "pointer", fontSize: "1rem" }}>‹</button>
          <span style={{ fontFamily: "DM Serif Display, serif", fontSize: "1rem", color: "#1a1a2e", minWidth: 120, textAlign: "center" }}>{monthNames[viewDate.m - 1]} {viewDate.y}</span>
          <button onClick={() => changeMonth(1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #f0d6e4", background: "white", cursor: "pointer", fontSize: "1rem" }}>›</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { val: `${todayChecks}/${habits.length}`, label: "Today" },
          { val: `${monthPct}%`, label: "Month Rate" },
          { val: totalChecked, label: "Total ✓" },
          { val: habits.length, label: "Habits" },
        ].map(s => (
          <div key={s.label} style={{ ...card, textAlign: "center", padding: "16px" }}>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#c45c82" }}>{s.val}</div>
            <div style={{ fontSize: "0.7rem", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ ...card, overflowX: "auto", marginBottom: "16px", padding: "16px" }}>
        <table style={{ borderCollapse: "collapse", minWidth: "700px", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 12px 6px 4px", fontSize: "0.72rem", color: "#aaa", fontWeight: 700, minWidth: 180 }}>Habit</th>
              {Array.from({ length: days }, (_, i) => i + 1).map(d => (
                <th key={d} style={{ fontSize: "0.65rem", color: isToday(d) ? "#c45c82" : "#aaa", fontWeight: isToday(d) ? 700 : 500, padding: "4px 2px", textAlign: "center" }}>{d}</th>
              ))}
              <th style={{ fontSize: "0.65rem", color: "#aaa", padding: "4px 8px" }}>%</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, i) => {
              const habitChecks = Array.from({ length: parseInt(todayStr.split("-")[2]) }, (_, d) => isChecked(i, d + 1) ? 1 : 0).reduce((a, b) => a + b, 0);
              const possibleDays = parseInt(todayStr.split("-")[2]);
              const pct = possibleDays > 0 ? Math.round(habitChecks / possibleDays * 100) : 0;

              // Streak
              let streak = 0;
              for (let d = parseInt(todayStr.split("-")[2]); d >= 1; d--) {
                if (isChecked(i, d)) streak++; else break;
              }

              return (
                <tr key={i}>
                  <td style={{ padding: "6px 12px 6px 4px", fontSize: "0.83rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {habit}
                      {streak > 0 && (
                        <span style={{ fontSize: "0.65rem", background: "#FDF6E7", color: "#D4A853", padding: "2px 7px", borderRadius: "20px", fontWeight: 700 }}>🔥{streak}</span>
                      )}
                    </div>
                  </td>
                  {Array.from({ length: days }, (_, idx) => idx + 1).map(d => (
                    <td key={d} style={{ padding: "2px", textAlign: "center" }}>
                      <div onClick={() => toggle(i, d)} style={{
                        width: 24, height: 24, borderRadius: 7, margin: "0 auto",
                        border: `1.5px solid ${isChecked(i, d) ? "#7BAE9E" : isToday(d) ? "#c45c82" : "#f0d6e4"}`,
                        background: isChecked(i, d) ? "#7BAE9E" : "white",
                        cursor: isFuture(d) ? "default" : "pointer",
                        opacity: isFuture(d) ? 0.3 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all .15s",
                      }}>
                        {isChecked(i, d) && <span style={{ color: "white", fontSize: "0.6rem", fontWeight: 700 }}>✓</span>}
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: "0 8px", fontSize: "0.75rem", fontWeight: 700, color: pct >= 80 ? "#7BAE9E" : "#aaa" }}>{pct}%</td>
                  <td>
                    <button onClick={() => deleteHabit(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f0d6e4", fontSize: "0.8rem", padding: "4px" }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Add habit */}
        <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          <input
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addHabit()}
            placeholder="+ Add a new habit and press Enter"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: "12px",
              border: "1.5px solid #f0d6e4", fontFamily: "DM Sans, sans-serif",
              fontSize: "0.85rem", outline: "none", color: "#1a1a2e", background: "#fff9fc"
            }}
          />
          <button onClick={addHabit} style={{
            padding: "10px 20px", borderRadius: "12px", border: "none",
            background: "#1a1a2e", color: "white", fontFamily: "DM Sans, sans-serif",
            fontSize: "0.82rem", fontWeight: 600, cursor: "pointer"
          }}>Add</button>
        </div>
      </div>
    </div>
  );
}