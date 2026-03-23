import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };
const card = { background: "white", borderRadius: "16px", border: "1.5px solid #f0d6e4" };

export default function Insights() {
  const moods = load("mindspace_mood", []);
  const sessions = load("ms_timer", []);
  const study = load("ms_study", []);
  const habits = load("ms_habits", []);
  const checks = load("ms_checks", {});
  const todos = load("ms_todos", []);

  // Mood trend over last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayMoods = moods.filter(m => m.date?.startsWith(dateStr));
    const posCount = dayMoods.filter(m => m.sentiment === "positive").length;
    const score = dayMoods.length > 0 ? Math.round((posCount / dayMoods.length) * 100) : null;
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      score,
      entries: dayMoods.length,
    };
  });

  // Study hours per day
  const studyByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const hrs = study.filter(s => s.date === dateStr).reduce((a, s) => a + parseFloat(s.hours || 0), 0);
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), hrs: parseFloat(hrs.toFixed(1)) };
  });

  // Habit completion today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDay = parseInt(todayStr.split("-")[2]);
  const todayChecks = habits.filter((_, i) => !!checks[`${i}_${todayStr}`]).length;
  const habitPct = habits.length > 0 ? Math.round((todayChecks / habits.length) * 100) : 0;

  // Todo stats
  const doneTodos = todos.filter(t => t.done).length;
  const todoPct = todos.length > 0 ? Math.round((doneTodos / todos.length) * 100) : 0;

  // Study total
  const totalStudyHrs = study.reduce((a, s) => a + parseFloat(s.hours || 0), 0);

  // Focus mins
  const totalFocusMins = sessions.filter(s => s.type !== "break").reduce((a, s) => a + s.mins, 0);

  // Mood counts
  const moodCounts = {};
  moods.forEach(m => { if (m.mood?.label) moodCounts[m.mood.label] = (moodCounts[m.mood.label] || 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const COLORS = ["#c45c82", "#7BAE9E", "#D4A853", "#E8A090", "#8A9BAE", "#6366F1", "#16A34A", "#E11D48"];

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#1a1a2e" }}>
          Your <em style={{ color: "#c45c82" }}>Insights</em>
        </div>
        <div style={{ fontSize: "0.82rem", color: "#aaa", marginTop: "4px" }}>A snapshot of your week</div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { val: `${habitPct}%`, label: "Habits Today", icon: "📅" },
          { val: `${totalStudyHrs.toFixed(1)}h`, label: "Study Total", icon: "📖" },
          { val: `${totalFocusMins}m`, label: "Focus Time", icon: "⏱" },
          { val: `${todoPct}%`, label: "Tasks Done", icon: "✅" },
        ].map(s => (
          <div key={s.label} style={{ ...card, textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{s.icon}</div>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#c45c82" }}>{s.val}</div>
            <div style={{ fontSize: "0.7rem", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Mood trend */}
        <div style={{ ...card, padding: "20px" }}>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.1rem", color: "#1a1a2e", marginBottom: "4px" }}>Mood Trend</div>
          <div style={{ fontSize: "0.72rem", color: "#aaa", marginBottom: "16px" }}>Positivity score — last 7 days</div>
          {moods.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#cbb", fontSize: "0.85rem" }}>No mood entries yet 🌸</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={last7}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1.5px solid #f0d6e4", fontSize: "0.78rem" }} />
                <Line type="monotone" dataKey="score" stroke="#c45c82" strokeWidth={2} dot={{ fill: "#c45c82", r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Study hours */}
        <div style={{ ...card, padding: "20px" }}>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.1rem", color: "#1a1a2e", marginBottom: "4px" }}>Study Hours</div>
          <div style={{ fontSize: "0.72rem", color: "#aaa", marginBottom: "16px" }}>Hours logged — last 7 days</div>
          {study.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#cbb", fontSize: "0.85rem" }}>No study sessions yet 📖</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={studyByDay}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1.5px solid #f0d6e4", fontSize: "0.78rem" }} />
                <Bar dataKey="hrs" radius={[6, 6, 0, 0]}>
                  {studyByDay.map((_, i) => <Cell key={i} fill={i === 6 ? "#c45c82" : "#f0d6e4"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mood breakdown + highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Mood breakdown */}
        <div style={{ ...card, padding: "20px" }}>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.1rem", color: "#1a1a2e", marginBottom: "16px" }}>Mood Breakdown</div>
          {Object.keys(moodCounts).length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#cbb", fontSize: "0.85rem" }}>No mood entries yet 🌸</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).map(([mood, count], i) => {
                const pct = Math.round((count / moods.length) * 100);
                return (
                  <div key={mood}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#1a1a2e", marginBottom: "4px" }}>
                      <span>{mood}</span><span style={{ color: "#aaa" }}>{count}x · {pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "#f0d6e4", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 10, transition: "width .5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Highlights */}
        <div style={{ ...card, padding: "20px" }}>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.1rem", color: "#1a1a2e", marginBottom: "16px" }}>Highlights</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "🌸", label: "Top mood", val: topMood ? `${topMood[0]} (${topMood[1]}x)` : "No data yet" },
              { icon: "📖", label: "Study sessions", val: study.length > 0 ? `${study.length} sessions logged` : "None yet" },
              { icon: "📅", label: "Habits today", val: habits.length > 0 ? `${todayChecks} of ${habits.length} done` : "No habits yet" },
              { icon: "✅", label: "Tasks", val: todos.length > 0 ? `${doneTodos} of ${todos.length} complete` : "No tasks yet" },
              { icon: "⏱", label: "Focus today", val: sessions.filter(s => s.date === todayStr && s.type !== "break").length > 0 ? `${sessions.filter(s => s.date === todayStr && s.type !== "break").reduce((a, s) => a + s.mins, 0)} mins` : "No sessions today" },
            ].map(h => (
              <div key={h.label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "#fff9fc", borderRadius: "12px", border: "1.5px solid #f0d6e4" }}>
                <span style={{ fontSize: "1.2rem" }}>{h.icon}</span>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h.label}</div>
                  <div style={{ fontSize: "0.85rem", color: "#1a1a2e", fontWeight: 500 }}>{h.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}