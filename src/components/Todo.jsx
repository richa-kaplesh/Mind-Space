import { useState } from "react";

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const card = { background: "white", borderRadius: "16px", border: "1.5px solid #f0d6e4" };

const PRIORITIES = ["high", "med", "low"];
const CATEGORIES = ["Work", "Study", "Personal", "Finance", "Health", "Home", "Other"];
const PRI_COLORS = { high: "#E57373", med: "#D4A853", low: "#7BAE9E" };
const PRI_LABELS = { high: "High", med: "Medium", low: "Low" };

const EMPTY = { text: "", category: "Work", priority: "med", due: "" };

export default function Todo() {
  const [todos, setTodos] = useState(() => load("ms_todos", []));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState("all");

  const saveTodos = (t) => { setTodos(t); save("ms_todos", t); };

  const submit = () => {
    if (!form.text.trim()) return;
    saveTodos([{ ...form, id: uid(), done: false, createdAt: Date.now() }, ...todos]);
    setShowModal(false);
    setForm(EMPTY);
  };

  const toggle = (id) => saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const del = (id) => saveTodos(todos.filter(t => t.id !== id));

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    if (filter === "high") return t.priority === "high";
    return true;
  });

  const doneCount = todos.filter(t => t.done).length;
  const activeCount = todos.filter(t => !t.done).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#1a1a2e" }}>
            To-<em style={{ color: "#c45c82" }}>Do</em>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#aaa", marginTop: "4px" }}>
            {activeCount} active · {doneCount} done · {todos.length} total
          </div>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          padding: "10px 20px", borderRadius: "12px", border: "none",
          background: "#1a1a2e", color: "white", fontFamily: "DM Sans, sans-serif",
          fontSize: "0.82rem", fontWeight: 600, cursor: "pointer"
        }}>+ Add Task</button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "done", label: "Done" },
          { key: "high", label: "🔴 High Priority" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: "6px 16px", borderRadius: "50px",
            border: `1.5px solid ${filter === f.key ? "#1a1a2e" : "#f0d6e4"}`,
            background: filter === f.key ? "#1a1a2e" : "white",
            color: filter === f.key ? "white" : "#aaa",
            fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif"
          }}>{f.label}</button>
        ))}
      </div>

      {/* Todo list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#cbb" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✅</div>
          <div>{filter === "done" ? "Nothing done yet!" : "All clear!"}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(t => (
            <div key={t.id} style={{
              ...card, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: "12px",
              opacity: t.done ? 0.6 : 1, transition: "all .2s"
            }}>
              {/* Checkbox */}
              <div onClick={() => toggle(t.id)} style={{
                width: 22, height: 22, borderRadius: 7, minWidth: 22,
                border: `1.5px solid ${t.done ? "#7BAE9E" : "#f0d6e4"}`,
                background: t.done ? "#7BAE9E" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all .2s"
              }}>
                {t.done && <span style={{ color: "white", fontSize: "0.65rem", fontWeight: 700 }}>✓</span>}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "#1a1a2e", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "3px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", color: "#aaa" }}>{t.category}</span>
                  {t.due && <span style={{ fontSize: "0.7rem", color: "#aaa" }}>· 📅 {t.due}</span>}
                </div>
              </div>

              {/* Priority dot */}
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRI_COLORS[t.priority], minWidth: 8 }} />

              {/* Delete */}
              <button onClick={() => del(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f0d6e4", fontSize: "0.8rem", padding: "4px" }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(26,26,46,0.4)",
          backdropFilter: "blur(4px)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "white", borderRadius: "20px", padding: "32px",
            width: "90%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(26,26,46,0.15)"
          }}>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.4rem", color: "#1a1a2e", marginBottom: "20px" }}>Add Task</div>

            {[
              { label: "Task", key: "text", placeholder: "What needs to be done?" },
              { label: "Due Date", key: "due", type: "date" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "5px" }}>{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #f0d6e4", fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", outline: "none", color: "#1a1a2e" }}
                />
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              {[
                { label: "Category", key: "category", options: CATEGORIES },
                { label: "Priority", key: "priority", options: PRIORITIES, labels: PRI_LABELS },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "5px" }}>{f.label}</label>
                  <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #f0d6e4", fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", outline: "none", color: "#1a1a2e" }}>
                    {f.options.map(o => <option key={o} value={o}>{f.labels ? f.labels[o] : o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid #f0d6e4", background: "white", color: "#aaa", fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>Cancel</button>
              <button onClick={submit} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#1a1a2e", color: "white", fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}