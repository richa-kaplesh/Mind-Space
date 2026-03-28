import { useState } from "react";
import './App.css';
import MoodJournal from "./components/MoodJournal";
import Habits from "./components/Habits";
import Todo from "./components/Todo";
import Timer from "./components/Timer";
import Goals from "./components/Goals";
import Insights from "./components/Insights";

const NAV = [
  {
    group: "Daily",
    items: [
      { id: "mood",    label: "Mood" },
      { id: "habits",  label: "Habits" },
      { id: "todo",    label: "To-do" },
      { id: "timer",   label: "Timer" },
    ],
  },
  {
    group: "Mind",
    items: [
      { id: "thoughts",     label: "Thoughts" },
      { id: "affirmations", label: "Affirmations" },
      { id: "ideas",        label: "Ideas" },
    ],
  },
  {
    group: "Body",
    items: [
      { id: "workout",    label: "Workout" },
      { id: "diet",       label: "Diet" },
      { id: "wanttotry",  label: "Want to try" },
    ],
  },
  {
    group: "Track",
    items: [
      { id: "goals",    label: "Goals" },
      { id: "insights", label: "Insights" },
    ],
  },
];

function ComingSoon({ label }) {
  return (
    <div style={{ padding: "60px 0", textAlign: "center", color: "#a07060", fontSize: "0.85rem" }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>✦</div>
      {label} is coming soon
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("mood");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const now = new Date();
  const day  = now.toLocaleDateString("en-IN", { weekday: "long" });
  const date = now.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });

  function navigate(id) {
    setActive(id);
    setSidebarOpen(false);
  }

  function renderContent() {
    switch (active) {
      case "mood":    return <MoodJournal />;
      case "habits":  return <Habits />;
      case "todo":    return <Todo />;
      case "timer":   return <Timer />;
      case "goals":   return <Goals />;
      case "insights":return <Insights />;
      default:        return <ComingSoon label={NAV.flatMap(g => g.items).find(i => i.id === active)?.label} />;
    }
  }

  return (
    <div className="app-shell">

      {/* Overlay for mobile */}
      <div
        className={`sb-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sb-header">
          <div className="sb-logo">Mind<em>Space</em></div>
          <div className="sb-tagline">your daily companion</div>
        </div>

        {NAV.map(({ group, items }) => (
          <div className="sb-group" key={group}>
            <div className="sb-group-label">{group}</div>
            {items.map(({ id, label }) => (
              <div
                key={id}
                className={`sb-item${active === id ? " active" : ""}`}
                onClick={() => navigate(id)}
              >
                {label}
              </div>
            ))}
          </div>
        ))}

        <div className="sb-footer">{day}, {date}</div>
      </aside>

      {/* Main */}
      <div className="main-area">
        <div className="main-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="ham-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="menu">
              <span /><span /><span />
            </button>
            <div className="topbar-logo">Mind<em>Space</em></div>
          </div>
          <div className="topbar-date">
            <div className="topbar-day">{day}</div>
            <div className="topbar-date-sub">{date}</div>
          </div>
        </div>

        <div className="main-content">
          {renderContent()}
        </div>
      </div>

    </div>
  );
}