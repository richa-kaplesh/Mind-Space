import { useState, useEffect } from "react";

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };

const DEFAULT_HABITS = [
  "Drink 2L water",
  "Exercise",
  "Sleep by 11 PM",
  "Eat clean",
  "Morning stretch",
  "Journal",
  "Get sunlight",
  "Read 20 mins",
];

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Habits() {
  const today = new Date().toISOString().split("T")[0];
  const [habits, setHabits] = useState(() => load("ms_habits", DEFAULT_HABITS));
  const [checks, setChecks] = useState(() => load("ms_checks", {}));
  const [newHabit, setNewHabit] = useState("");
  const [viewDate, setViewDate] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1 };
  });

  useEffect(() => { save("ms_habits", habits); }, [habits]);
  useEffect(() => { save("ms_checks", checks); }, [checks]);

  const daysInMonth = new Date(viewDate.y, viewDate.m, 0).getDate();
  const todayDay = parseInt(today.split("-")[2]);
  const todayMonth = parseInt(today.split("-")[1]);
  const todayYear = parseInt(today.split("-")[0]);
  const isCurrentMonth = viewDate.y === todayYear && viewDate.m === todayMonth;

  const dateStr = (d) => `${viewDate.y}-${String(viewDate.m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const key = (i, d) => `${i}_${dateStr(d)}`;
  const isChecked = (i, d) => !!checks[key(i, d)];
  const isFuture = (d) => dateStr(d) > today;
  const isToday = (d) => isCurrentMonth && d === todayDay;

  const toggle = (i, d) => {
    if (isFuture(d)) return;
    const k = key(i, d);
    setChecks(prev => {
      const next = { ...prev };
      next[k] ? delete next[k] : (next[k] = true);
      return next;
    });
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
  const maxDay = isCurrentMonth ? todayDay : daysInMonth;
  const todayChecks = habits.filter((_, i) => isChecked(i, todayDay)).length;
  const totalChecked = Object.keys(checks).filter(k =>
    k.includes(`_${viewDate.y}-${String(viewDate.m).padStart(2,"0")}`)
  ).length;
  const totalPossible = habits.length * maxDay;
  const monthPct = totalPossible > 0 ? Math.round(totalChecked / totalPossible * 100) : 0;

  const getStreak = (i) => {
    let streak = 0;
    const start = isCurrentMonth ? todayDay : daysInMonth;
    for (let d = start; d >= 1; d--) {
      if (isChecked(i, d)) streak++; else break;
    }
    return streak;
  };

  const getHabitPct = (i) => {
    const done = Array.from({ length: maxDay }, (_, d) => isChecked(i, d + 1) ? 1 : 0).reduce((a, b) => a + b, 0);
    return maxDay > 0 ? Math.round(done / maxDay * 100) : 0;
  };

  return (
    <div style={{ width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div className="page-title">
            Habit <em style={{ color: "#b85c38", fontStyle: "italic" }}>Tracker</em>
          </div>
          <div className="page-sub">
            {todayChecks}/{habits.length} done today · {monthPct}% this month
          </div>
        </div>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => changeMonth(-1)} style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "0.5px solid #ddc8bc", background: "#fff9f6",
            cursor: "pointer", fontSize: "1rem", color: "#1a1008",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
          <span style={{
            fontFamily: "DM Serif Display, serif", fontSize: "1rem",
            color: "#1a1008", minWidth: 140, textAlign: "center"
          }}>
            {MONTH_NAMES[viewDate.m - 1]} {viewDate.y}
          </span>
          <button onClick={() => changeMonth(1)} style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "0.5px solid #ddc8bc", background: "#fff9f6",
            cursor: "pointer", fontSize: "1rem", color: "#1a1008",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>›</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { val: `${todayChecks}/${habits.length}`, label: "Today" },
          { val: `${monthPct}%`,                    label: "Month rate" },
          { val: totalChecked,                       label: "Total done" },
          { val: habits.length,                      label: "Habits" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff9f6", border: "0.5px solid #ddc8bc",
            borderRadius: "12px", padding: "16px", textAlign: "center",
          }}>
            <div style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: "1.8rem", color: "#b85c38", lineHeight: 1, marginBottom: "4px"
            }}>{s.val}</div>
            <div style={{
              fontSize: "0.62rem", color: "#a07060",
              fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em"
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tracker grid */}
      <div style={{
        background: "#fff9f6", border: "0.5px solid #ddc8bc",
        borderRadius: "12px", padding: "20px",
        overflowX: "auto", marginBottom: "16px",
      }}>
        <table style={{ borderCollapse: "collapse", minWidth: "800px", width: "100%" }}>
          <thead>
            <tr>
              <th style={{
                textAlign: "left", padding: "0 16px 12px 0",
                fontSize: "0.62rem", color: "#a07060",
                fontWeight: 500, textTransform: "uppercase",
                letterSpacing: "0.08em", minWidth: 180,
              }}>Habit</th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                <th key={d} style={{
                  fontSize: "0.65rem", padding: "0 2px 12px",
                  textAlign: "center", fontWeight: isToday(d) ? 500 : 400,
                  color: isToday(d) ? "#b85c38" : "#a07060",
                  minWidth: 28,
                }}>{d}</th>
              ))}
              <th style={{ fontSize: "0.62rem", color: "#a07060", padding: "0 0 12px 12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Rate</th>
              <th style={{ width: 28 }}></th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, i) => {
              const streak = getStreak(i);
              const pct = getHabitPct(i);
              return (
                <tr key={i} style={{ borderTop: "0.5px solid #f0e4dc" }}>
                  <td style={{ padding: "10px 16px 10px 0", fontSize: "0.85rem", color: "#1a1008", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {habit}
                      {streak > 1 && (
                        <span style={{
                          fontSize: "0.6rem", background: "#fdf0e0",
                          color: "#b85c38", padding: "2px 7px",
                          borderRadius: "20px", fontWeight: 500,
                        }}>
                          {streak}d streak
                        </span>
                      )}
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, idx) => idx + 1).map(d => (
                    <td key={d} style={{ padding: "4px 2px", textAlign: "center" }}>
                      <div
                        onClick={() => toggle(i, d)}
                        style={{
                          width: 26, height: 26,
                          borderRadius: 7, margin: "0 auto",
                          border: isChecked(i, d)
                            ? "1.5px solid #b85c38"
                            : isToday(d)
                            ? "1.5px solid #b85c38"
                            : "0.5px solid #ddc8bc",
                          background: isChecked(i, d) ? "#b85c38" : "transparent",
                          cursor: isFuture(d) ? "default" : "pointer",
                          opacity: isFuture(d) ? 0.25 : 1,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all .15s",
                        }}
                      >
                        {isChecked(i, d) && (
                          <span style={{ color: "#fdf6f2", fontSize: "0.6rem", fontWeight: 600 }}>✓</span>
                        )}
                      </div>
                    </td>
                  ))}
                  <td style={{
                    padding: "4px 0 4px 12px",
                    fontSize: "0.78rem", fontWeight: 500,
                    color: pct >= 80 ? "#7bae9e" : pct >= 50 ? "#b85c38" : "#c4a99a",
                  }}>{pct}%</td>
                  <td style={{ padding: "4px", textAlign: "center" }}>
                    <button
                      onClick={() => deleteHabit(i)}
                      style={{
                        background: "none", border: "none",
                        cursor: "pointer", color: "#ddc8bc",
                        fontSize: "0.75rem", padding: "4px",
                        lineHeight: 1,
                      }}
                    >✕</button>
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
            placeholder="Add a new habit..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: "10px",
              border: "0.5px solid #ddc8bc", fontFamily: "DM Sans, sans-serif",
              fontSize: "0.82rem", outline: "none", color: "#1a1008",
              background: "#fdf6f2",
            }}
          />
          <button onClick={addHabit} className="btn-primary">
            Add
          </button>
        </div>
      </div>

    </div>
  );
}