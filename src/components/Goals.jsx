import { useState } from "react";

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };

const CATEGORIES = ["Career", "Finance", "Health", "Education", "Personal", "Other"];
const STATUSES = ["Not Started", "In Progress", "Done 🎉", "On Hold"];

const CAT_COLORS = {
  Career: { bg: "#EEF2FF", color: "#6366F1" },
  Finance: { bg: "#F0FDF4", color: "#16A34A" },
  Health: { bg: "#FFF1F2", color: "#E11D48" },
  Education: { bg: "#FFFBEB", color: "#D97706" },
  Personal: { bg: "#EAF3F0", color: "#5a9080" },
  Other: { bg: "#FDF0ED", color: "#E8A090" },
};

const STATUS_COLORS = {
  "Done 🎉": { bg: "#F0FDF4", color: "#16A34A" },
  "In Progress": { bg: "#FFFBEB", color: "#D97706" },
  "Not Started": { bg: "#F8F8F8", color: "#aaa" },
  "On Hold": { bg: "#F8F8F8", color: "#aaa" },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const card = { background: "white", borderRadius: "16px", border: "1.5px solid #f0d6e4" };

const EMPTY_FORM = { title: "", category: "Career", status: "Not Started", target: "", current: "", deadline: "", pct: "", notes: "" };

export default function Goals() {
  const [goals, setGoals] = useState(() => load("ms_goals", []));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("All");

  const saveGoals = (g) => { setGoals(g); save("ms_goals", g); };

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
  const openEdit = (g) => { setForm({ ...g }); setEditId(g.id); setShowModal(true); };

  const submit = () => {
    if (!form.title.trim()) return;
    if (editId) {
      saveGoals(goals.map(g => g.id === editId ? { ...form, id: editId } : g));
    } else {
      saveGoals([...goals, { ...form, id: uid() }]);
    }
    setShowModal(false);
  };

  const deleteGoal = (id) => saveGoals(goals.filter(g => g.id !== id));

  const filtered = filter === "All" ? goals : goals.filter(g => g.status === filter || g.category === filter);

  const doneCount = goals.filter(g => g.status === "Done 🎉").length;
  const inProgressCount = goals.filter(g => g.status === "In Progress").length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#1a1a2e" }}>
            Your <em style={{ color: "#c45c82" }}>Goals</em>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#aaa", marginTop: "4px" }}>
            {doneCount} done · {inProgressCount} in progress · {goals.length} total
          </div>
        </div>
        <button onClick={openAdd} style={{
          padding: "10px 20px", borderRadius: "12px", border: "none",
          background: "#1a1a2e", color: "white", fontFamily: "DM Sans, sans-serif",
          fontSize: "0.82rem", fontWeight: 600, cursor: "pointer"
        }}>+ Add Goal</button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {["All", ...STATUSES].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: "50px",
            border: `1.5px solid ${filter === f ? "#1a1a2e" : "#f0d6e4"}`,
            background: filter === f ? "#1a1a2e" : "white",
            color: filter === f ? "white" : "#aaa",
            fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif"
          }}>{f}</button>
        ))}
      </div>

      {/* Goals grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#cbb" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎯</div>
          <div>No goals yet. Dream big!</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {filtered.map(g => {
            const cat = CAT_COLORS[g.category] || CAT_COLORS.Other;
            const status = STATUS_COLORS[g.status] || STATUS_COLORS["Not Started"];
            return (
              <div key={g.id} style={{ ...card, padding: "20px", position: "relative", transition: "all .2s" }}>
                {/* Actions */}
                <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: "4px" }}>
                  <button onClick={() => openEdit(g)} style={{ width: 26, height: 26, borderRadius: 7, border: "1.5px solid #f0d6e4", background: "white", cursor: "pointer", fontSize: "0.75rem" }}>✏️</button>
                  <button onClick={() => deleteGoal(g.id)} style={{ width: 26, height: 26, borderRadius: 7, border: "1.5px solid #f0d6e4", background: "white", cursor: "pointer", fontSize: "0.75rem" }}>✕</button>
                </div>

                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: cat.bg, color: cat.color, marginBottom: "10px" }}>{g.category}</span>

                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "12px", lineHeight: 1.4, paddingRight: "40px" }}>{g.title}</div>

                {g.pct !== "" && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#aaa", marginBottom: "5px" }}>
                      <span>{g.current || "0"} / {g.target || "?"}</span>
                      <span>{g.pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "#f0d6e4", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(g.pct, 100)}%`, background: "linear-gradient(90deg, #7BAE9E, #5a9080)", borderRadius: 10, transition: "width .5s" }} />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 600, background: status.bg, color: status.color }}>{g.status}</span>
                  {g.deadline && <span style={{ fontSize: "0.7rem", color: "#aaa" }}>📅 {g.deadline}</span>}
                </div>

                {g.notes && <div style={{ marginTop: 10, fontSize: "0.78rem", color: "#aaa", lineHeight: 1.5 }}>{g.notes}</div>}
              </div>
            );
          })}
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
            width: "90%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(26,26,46,0.15)"
          }}>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.4rem", color: "#1a1a2e", marginBottom: "20px" }}>
              {editId ? "Edit Goal" : "Add Goal"}
            </div>

            {[
              { label: "Goal Title", key: "title", placeholder: "e.g. Read 12 books this year" },
              { label: "Target", key: "target", placeholder: "e.g. 12 books" },
              { label: "Current Progress", key: "current", placeholder: "e.g. 3" },
              { label: "Progress %", key: "pct", placeholder: "0-100", type: "number" },
              { label: "Deadline", key: "deadline", type: "date" },
              { label: "Notes", key: "notes", placeholder: "Any notes..." },
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
                { label: "Status", key: "status", options: STATUSES },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "5px" }}>{f.label}</label>
                  <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #f0d6e4", fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", outline: "none", color: "#1a1a2e" }}>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid #f0d6e4", background: "white", color: "#aaa", fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>Cancel</button>
              <button onClick={submit} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#1a1a2e", color: "white", fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Save Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}