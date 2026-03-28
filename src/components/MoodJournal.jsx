import { useState } from "react";

const MOODS = [
  { emoji: "😄", label: "Happy",      color: "#e8a84a" },
  { emoji: "😌", label: "Calm",       color: "#7bae9e" },
  { emoji: "😔", label: "Sad",        color: "#8a9bae" },
  { emoji: "😤", label: "Frustrated", color: "#c4785a" },
  { emoji: "😰", label: "Anxious",    color: "#a08ab4" },
  { emoji: "🥰", label: "Grateful",   color: "#c4785a" },
  { emoji: "😴", label: "Tired",      color: "#9aacbe" },
  { emoji: "🔥", label: "Motivated",  color: "#b85c38" },
];

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function MoodJournal() {
  const [entries, setEntries] = useState(() => load("mindspace_mood"));
  const [selectedMood, setSelectedMood] = useState(null);
  const [saved, setSaved] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const monthName = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const todaysMood = entries.find(e =>
    new Date(e.date).toDateString() === now.toDateString()
  );

  const moodByDay = {};
  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      moodByDay[d.getDate()] = e.mood;
    }
  });

  const saveMood = () => {
    if (!selectedMood) return;
    let updated;
    if (todaysMood) {
      updated = entries.map(e =>
        new Date(e.date).toDateString() === now.toDateString()
          ? { ...e, mood: selectedMood, date: new Date().toISOString() }
          : e
      );
    } else {
      updated = [{ id: Date.now(), date: new Date().toISOString(), mood: selectedMood }, ...entries];
    }
    setEntries(updated);
    save("mindspace_mood", updated);
    setSelectedMood(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div style={{ width: "100%" }}>

      {/* Page header */}
      <div style={{ marginBottom: "24px" }}>
        <div className="page-title">
          How are you <em style={{ color: "#b85c38", fontStyle: "italic" }}>feeling?</em>
        </div>
        <div className="page-sub">
          {now.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Calendar — full width */}
      <div className="card" style={{ marginBottom: "16px", width: "100%" }}>
        <div className="section-label" style={{ marginBottom: "14px" }}>{monthName}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "6px" }}>
          {dayLabels.map(d => (
            <div key={d} style={{
              textAlign: "center", fontSize: "0.68rem", color: "#a07060",
              fontWeight: 500, letterSpacing: "0.06em", padding: "2px 0"
            }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ aspectRatio: "1" }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const mood = moodByDay[day];
            const isToday = day === todayDate;
            return (
              <div key={day} style={{
                aspectRatio: "1",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: mood ? "#f5e8e0" : "transparent",
                border: isToday ? "1.5px solid #b85c38" : "0.5px solid transparent",
                transition: "background 0.2s",
              }}>
                {mood
                  ? <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{mood.emoji}</span>
                  : <span style={{ fontSize: "0.78rem", color: isToday ? "#b85c38" : "#c4a99a" }}>{day}</span>
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's mood banner */}
      {todaysMood && !selectedMood && (
        <div style={{
          background: "#f5e8e0", border: "0.5px solid #ddc8bc",
          borderRadius: "12px", padding: "14px 18px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "1.5rem" }}>{todaysMood.mood.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "#1a1008" }}>
              Feeling {todaysMood.mood.label} today
            </div>
            <div style={{ fontSize: "0.7rem", color: "#a07060", marginTop: "2px" }}>
              Logged at {new Date(todaysMood.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <button
            onClick={() => setSelectedMood(todaysMood.mood)}
            style={{
              fontSize: "0.7rem", color: "#b85c38", background: "none",
              border: "0.5px solid #ddc8bc", borderRadius: "8px",
              padding: "4px 10px", cursor: "pointer",
            }}
          >
            Update
          </button>
        </div>
      )}

      {/* Mood picker */}
      <div className="card">
        <div className="section-label">
          {todaysMood ? "Update your mood" : "Pick your mood"}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {MOODS.map(m => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                border: selectedMood?.label === m.label ? "1.5px solid #b85c38" : "0.5px solid #ddc8bc",
                background: selectedMood?.label === m.label ? "#f0ddd3" : "#fff9f6",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{m.emoji}</span>
              <span style={{ fontSize: "0.62rem", color: "#a07060", fontWeight: 500 }}>{m.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={saveMood}
          disabled={!selectedMood}
          style={{
            width: "100%", padding: "12px",
            background: selectedMood ? "#1a1008" : "#f0ddd3",
            color: selectedMood ? "#fdf6f2" : "#a07060",
            border: "none", borderRadius: "10px",
            fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem",
            fontWeight: 500, cursor: selectedMood ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {saved ? "Saved ✓" : todaysMood ? "Update mood" : "Save mood"}
        </button>
      </div>

    </div>
  );
}