import { useState, useEffect } from "react";

const MOODS = [
  { emoji: "😄", label: "Happy",     color: "#FFD93D" },
  { emoji: "😌", label: "Calm",      color: "#7BAE9E" },
  { emoji: "😔", label: "Sad",       color: "#8A9BAE" },
  { emoji: "😤", label: "Frustrated",color: "#E8A090" },
  { emoji: "😰", label: "Anxious",   color: "#C3A6D4" },
  { emoji: "🥰", label: "Grateful",  color: "#E8A0B4" },
  { emoji: "😴", label: "Tired",     color: "#B0C4DE" },
  { emoji: "🔥", label: "Motivated", color: "#D4A853" },
];

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k) => { 
  try { 
    return JSON.parse(localStorage.getItem(k)) || []; 
  } catch { 
    return []; 
  } 
};

export default function MoodTracker() {
  const [entries, setEntries] = useState(() => load("mindspace_mood"));
  const [selectedMood, setSelectedMood] = useState(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", month: "long", day: "numeric"
  });

  // Check if mood already logged today
  const todaysMood = entries.find(e => {
    const entryDate = new Date(e.date).toDateString();
    const currentDate = new Date().toDateString();
    return entryDate === currentDate;
  });

  const saveMood = () => {
    if (!selectedMood) {
      alert('Please select a mood first!');
      return;
    }

    // If already logged today, update it
    if (todaysMood) {
      const updated = entries.map(e => {
        const entryDate = new Date(e.date).toDateString();
        const currentDate = new Date().toDateString();
        if (entryDate === currentDate) {
          return {
            ...e,
            mood: selectedMood,
            date: new Date().toISOString(),
          };
        }
        return e;
      });
      setEntries(updated);
      save("mindspace_mood", updated);
    } else {
      // Create new entry
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        mood: selectedMood,
      };
      const updated = [entry, ...entries];
      setEntries(updated);
      save("mindspace_mood", updated);
    }

    setSelectedMood(null);
    alert('Mood saved!');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ 
          fontFamily: "DM Serif Display, serif", 
          fontSize: "1.8rem", 
          color: "#1a1a2e" 
        }}>
          How are you <em style={{ color: "#c45c82" }}>feeling?</em>
        </div>
        <div style={{ 
          fontSize: "0.82rem", 
          color: "#aaa", 
          marginTop: "4px" 
        }}>
          {today}
        </div>
      </div>

      {/* Today's mood banner (if already logged) */}
      {todaysMood && (
        <div style={{
          background: todaysMood.mood.color + "22",
          border: `1.5px solid ${todaysMood.mood.color}`,
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <span style={{ fontSize: "1.8rem" }}>{todaysMood.mood.emoji}</span>
          <div>
            <div style={{ 
              fontWeight: 600, 
              fontSize: "0.9rem", 
              color: "#1a1a2e" 
            }}>
              Today you're feeling {todaysMood.mood.label}
            </div>
            <div style={{ 
              fontSize: "0.72rem", 
              color: "#888", 
              marginTop: "2px" 
            }}>
              Logged at {new Date(todaysMood.date).toLocaleTimeString("en-IN", { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mood picker */}
      <div style={{
        background: "white", 
        borderRadius: "20px", 
        border: "1.5px solid #f0d6e4",
        padding: "24px", 
        marginBottom: "16px"
      }}>
        <div style={{ 
          fontSize: "0.72rem", 
          fontWeight: 600, 
          color: "#aaa", 
          letterSpacing: "0.08em", 
          textTransform: "uppercase", 
          marginBottom: "16px" 
        }}>
          {todaysMood ? "Update your mood" : "Pick your mood"}
        </div>
        
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          flexWrap: "wrap",
          marginBottom: "16px"
        }}>
          {MOODS.map(m => (
            <button 
              key={m.label} 
              onClick={() => setSelectedMood(m)} 
              style={{
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: "4px",
                padding: "12px 16px", 
                borderRadius: "14px",
                border: `1.5px solid ${selectedMood?.label === m.label ? m.color : "#f0d6e4"}`,
                background: selectedMood?.label === m.label ? m.color + "22" : "white",
                cursor: "pointer", 
                transition: "all .2s",
                transform: selectedMood?.label === m.label ? "translateY(-2px)" : "none",
              }}
            >
              <span style={{ fontSize: "1.6rem" }}>{m.emoji}</span>
              <span style={{ 
                fontSize: "0.68rem", 
                fontWeight: 600, 
                color: "#aaa" 
              }}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        <button 
          onClick={saveMood} 
          disabled={!selectedMood} 
          style={{
            width: "100%", 
            padding: "14px",
            background: selectedMood ? "#1a1a2e" : "#f0d6e4",
            color: selectedMood ? "white" : "#cbb",
            border: "none", 
            borderRadius: "14px", 
            fontFamily: "DM Sans, sans-serif",
            fontSize: "0.9rem", 
            fontWeight: 500, 
            cursor: selectedMood ? "pointer" : "not-allowed", 
            transition: "all .2s"
          }}
        >
          {todaysMood ? "Update Mood" : "Save Mood"}
        </button>
      </div>

      {/* Mood history */}
      {entries.length > 0 && (
        <div>
          <div style={{ 
            fontSize: "0.72rem", 
            fontWeight: 600, 
            color: "#aaa", 
            letterSpacing: "0.08em", 
            textTransform: "uppercase", 
            marginBottom: "14px" 
          }}>
            Mood History (Last 7 days)
          </div>
          
          {entries.slice(0, 7).map(e => (
            <div 
              key={e.id} 
              style={{
                background: "white", 
                borderRadius: "16px", 
                border: "1.5px solid #f0d6e4",
                padding: "16px 20px", 
                marginBottom: "10px",
                display: "flex", 
                gap: "14px", 
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>{e.mood.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: "0.82rem", 
                  color: "#1a1a2e" 
                }}>
                  {e.mood.label}
                </div>
                <div style={{ 
                  fontSize: "0.72rem", 
                  color: "#aaa", 
                  marginTop: "2px" 
                }}>
                  {new Date(e.date).toLocaleDateString("en-IN", { 
                    month: "short", 
                    day: "numeric",
                    weekday: "short"
                  })} · {new Date(e.date).toLocaleTimeString("en-IN", { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div style={{
          background: "white",
          borderRadius: "16px",
          border: "1.5px solid #f0d6e4",
          padding: "40px 20px",
          textAlign: "center",
          color: "#aaa"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🌸</div>
          <div style={{ fontSize: "0.85rem" }}>
            No mood entries yet. Start tracking how you feel!
          </div>
        </div>
      )}
    </div>
  );
}