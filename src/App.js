import { useState } from "react";
import Habits from "./components/Habits";
import Goals from "./components/Goals";
import Study from "./components/Study";
import Todo from "./components/Todo";
import Timer from "./components/Timer";
import MoodJournal from "./components/MoodJournal";
import Insights from "./components/Insights";

const tabs = [
  { id: "mood",    label: "Mood",     icon: "🌸" },
  { id: "habits",  label: "Habits",   icon: "📅" },
  { id: "goals",   label: "Goals",    icon: "🎯" },
  { id: "study",   label: "Study",    icon: "📖" },
  { id: "todo",    label: "To-Do",    icon: "✅" },
  { id: "timer",   label: "Timer",    icon: "⏱" },
  { id: "insights",label: "Insights", icon: "✨" },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #FDF6F9; color: #2C3E50; min-height: 100vh; }

  .nav-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 10px 18px; border-radius: 16px; border: 1.5px solid #f0d6e4;
    background: white; font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem; font-weight: 600; color: #aaa;
    cursor: pointer; transition: all .2s; letter-spacing: 0.03em;
    white-space: nowrap;
  }
  .nav-btn .icon { font-size: 1.2rem; }
  .nav-btn:hover { border-color: #c45c82; color: #c45c82; background: #fff9fc; transform: translateY(-2px); }
  .nav-btn.active {
    background: #1a1a2e; color: white; border-color: #1a1a2e;
    box-shadow: 0 4px 16px rgba(26,26,46,0.18); transform: translateY(-2px);
  }
  .nav-btn.active .icon { filter: grayscale(0); }

  .coming-soon {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 24px; color: #cbb; font-size: 0.9rem; gap: 12px;
  }
  .coming-soon .big { font-size: 3rem; }
`;

export default function App() {
  const [active, setActive] = useState("mood");

  const now = new Date();
  const day = now.toLocaleDateString("en-IN", { weekday: "long" });
  const date = now.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <style>{styles}</style>

      {/* Header */}
      <header style={{
        background: "white",
        borderBottom: "1.5px solid #f0d6e4",
        padding: "18px 36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.6rem" }}>🌿</span>
          <div>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.3rem", color: "#1a1a2e", lineHeight: 1 }}>
              Mind<em style={{ color: "#c45c82" }}>Space</em>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#cbb", fontWeight: 500, letterSpacing: "0.04em" }}>
              your daily companion
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1rem", color: "#1a1a2e" }}>{day}</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{date}</div>
        </div>
      </header>

      {/* Nav */}
      <div style={{
        padding: "20px 36px 0",
        background: "#FDF6F9",
        borderBottom: "1.5px solid #f0d6e4",
      }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "16px" }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-btn${active === t.id ? " active" : ""}`}
              onClick={() => setActive(t.id)}
            >
              <span className="icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ padding: "32px 36px", maxWidth: "1100px", margin: "0 auto" }}>
        {active === "mood"     && <MoodJournal />}
        {active === "habits"   && <Habits />}
        {active === "goals"    && <Goals />}
        {active === "study"    && <Study />}
        {active === "todo"     && <Todo />}
        {active === "timer"    && <Timer />}
        {active === "insights" && <Insights />}
      </main>
    </>
  );
}