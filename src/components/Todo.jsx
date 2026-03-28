import { useState } from "react";

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const BUCKETS = [
  { id: "today",    label: "Today",        sub: "Tasks for today",              accent: "#b85c38", bg: "#f5e8e0" },
  { id: "anyday",   label: "Any day",      sub: "No deadline, do whenever",     accent: "#7bae9e", bg: "#eef7f4" },
  { id: "weekend",  label: "Weekend",      sub: "Saved for the weekend",        accent: "#a08ab4", bg: "#f3f0fb" },
  { id: "feellike", label: "Feels like",   sub: "Only when you're in the mood", accent: "#e8a84a", bg: "#fdf5e6" },
];

const PRIORITIES = ["high", "med", "low"];
const PRI_LABELS  = { high: "High", med: "Med", low: "Low" };
const PRI_COLORS  = { high: "#c4785a", med: "#e8a84a", low: "#7bae9e" };
const PRI_BG      = { high: "#fdf0ec", med: "#fdf5e6", low: "#eef7f4" };

const EMPTY_FORM  = { text: "", priority: "med", due: "", reminder: false };

function requestNotif() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function scheduleReminder(task) {
  if (!task.reminder || !task.due) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const delay = new Date(task.due).getTime() - Date.now();
  if (delay > 0 && delay < 86400000 * 7) {
    setTimeout(() => new Notification("MindSpace", { body: task.text }), delay);
  }
}

function BucketSection({ bucket, todos, onAdd, onToggle, onDelete }) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  const active = todos.filter(t => !t.done).length;
  const done   = todos.filter(t => t.done).length;

  const submit = () => {
    if (!form.text.trim()) return;
    const task = { ...form, id: uid(), done: false, bucket: bucket.id, createdAt: Date.now() };
    onAdd(task);
    if (task.reminder) { requestNotif(); scheduleReminder(task); }
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  return (
    <div style={{
      background: "#fff9f6", border: "0.5px solid #ddc8bc",
      borderRadius: "14px", overflow: "hidden", marginBottom: "12px",
    }}>
      {/* Bucket header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "16px 18px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderLeft: `3px solid ${bucket.accent}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "0.92rem", fontWeight: 500, color: "#1a1008" }}>{bucket.label}</div>
            <div style={{ fontSize: "0.68rem", color: "#a07060", marginTop: "2px" }}>{bucket.sub}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {active > 0 && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 500, padding: "2px 10px",
              borderRadius: "20px", background: bucket.bg, color: bucket.accent,
            }}>{active} left</span>
          )}
          {done > 0 && (
            <span style={{ fontSize: "0.65rem", color: "#a07060" }}>{done} done</span>
          )}
          <span style={{ fontSize: "0.75rem", color: "#a07060" }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Task list */}
      {open && (
        <div style={{ borderTop: "0.5px solid #f0e4dc" }}>
          {todos.length === 0 && !adding && (
            <div style={{ padding: "20px 18px", fontSize: "0.78rem", color: "#c4a99a", textAlign: "center" }}>
              No tasks here yet
            </div>
          )}

          {todos.map(t => (
            <div key={t.id} style={{
              padding: "12px 18px", borderBottom: "0.5px solid #f0e4dc",
              display: "flex", alignItems: "center", gap: "10px",
              opacity: t.done ? 0.5 : 1,
            }}>
              {/* Checkbox */}
              <div onClick={() => onToggle(t.id)} style={{
                width: 20, height: 20, borderRadius: 6, minWidth: 20,
                border: t.done ? `1.5px solid ${bucket.accent}` : "0.5px solid #ddc8bc",
                background: t.done ? bucket.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
              }}>
                {t.done && <span style={{ color: "#fdf6f2", fontSize: "0.55rem", fontWeight: 600 }}>✓</span>}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.85rem", color: "#1a1008",
                  textDecoration: t.done ? "line-through" : "none",
                }}>{t.text}</div>
                {(t.due || t.reminder) && (
                  <div style={{ fontSize: "0.67rem", color: "#a07060", marginTop: "2px" }}>
                    {t.due && `Due ${t.due}`}
                    {t.due && t.reminder && " · "}
                    {t.reminder && "Reminder set"}
                  </div>
                )}
              </div>

              {/* Priority */}
              <span style={{
                fontSize: "0.6rem", padding: "2px 8px", borderRadius: "20px",
                background: PRI_BG[t.priority], color: PRI_COLORS[t.priority],
                fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0,
              }}>{PRI_LABELS[t.priority]}</span>

              {/* Delete */}
              <button onClick={() => onDelete(t.id)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#ddc8bc", fontSize: "0.72rem", padding: "2px",
                flexShrink: 0, lineHeight: 1,
              }}>✕</button>
            </div>
          ))}

          {/* Add form */}
          {adding ? (
            <div style={{ padding: "14px 18px", borderTop: "0.5px solid #f0e4dc" }}>
              <input
                autoFocus
                value={form.text}
                onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setAdding(false); }}
                placeholder="Task name..."
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: "8px",
                  border: "0.5px solid #ddc8bc", fontFamily: "DM Sans, sans-serif",
                  fontSize: "0.82rem", outline: "none", color: "#1a1008",
                  background: "#fdf6f2", marginBottom: "10px",
                }}
              />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "10px" }}>
                {/* Priority */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {PRIORITIES.map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))} style={{
                      padding: "4px 10px", borderRadius: "20px", cursor: "pointer",
                      border: form.priority === p ? `1.5px solid ${PRI_COLORS[p]}` : "0.5px solid #ddc8bc",
                      background: form.priority === p ? PRI_BG[p] : "#fff9f6",
                      color: form.priority === p ? PRI_COLORS[p] : "#a07060",
                      fontSize: "0.68rem", fontFamily: "DM Sans, sans-serif",
                    }}>{PRI_LABELS[p]}</button>
                  ))}
                </div>

                {/* Due date */}
                <input
                  type="date"
                  value={form.due}
                  onChange={e => setForm(p => ({ ...p, due: e.target.value }))}
                  style={{
                    padding: "4px 10px", borderRadius: "8px",
                    border: "0.5px solid #ddc8bc", fontFamily: "DM Sans, sans-serif",
                    fontSize: "0.72rem", outline: "none", color: "#1a1008",
                    background: "#fdf6f2",
                  }}
                />

                {/* Reminder toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div
                    onClick={() => setForm(p => ({ ...p, reminder: !p.reminder }))}
                    style={{
                      width: 34, height: 18, borderRadius: 9, cursor: "pointer",
                      background: form.reminder ? bucket.accent : "#ddc8bc",
                      position: "relative", transition: "background 0.2s", flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%", background: "#fdf6f2",
                      position: "absolute", top: 3,
                      left: form.reminder ? 19 : 3,
                      transition: "left 0.2s",
                    }} />
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "#a07060" }}>Remind</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={submit} style={{
                  padding: "7px 16px", borderRadius: "8px", border: "none",
                  background: "#1a1008", color: "#fdf6f2",
                  fontFamily: "DM Sans, sans-serif", fontSize: "0.78rem",
                  fontWeight: 500, cursor: "pointer",
                }}>Add</button>
                <button onClick={() => { setAdding(false); setForm(EMPTY_FORM); }} style={{
                  padding: "7px 14px", borderRadius: "8px",
                  border: "0.5px solid #ddc8bc", background: "#fff9f6",
                  color: "#a07060", fontFamily: "DM Sans, sans-serif",
                  fontSize: "0.78rem", cursor: "pointer",
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setAdding(true)}
              style={{
                padding: "12px 18px", fontSize: "0.78rem", color: "#a07060",
                cursor: "pointer", borderTop: "0.5px solid #f0e4dc",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <span style={{ fontSize: "1rem", color: bucket.accent, lineHeight: 1 }}>+</span> Add task
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Todo() {
  const [todos, setTodos] = useState(() => load("ms_todos_v2", []));

  const saveTodos = (t) => { setTodos(t); save("ms_todos_v2", t); };
  const onAdd    = (task) => saveTodos([task, ...todos]);
  const onToggle = (id)   => saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null } : t));
  const onDelete = (id)   => saveTodos(todos.filter(t => t.id !== id));

  const totalActive = todos.filter(t => !t.done).length;
  const totalDone   = todos.filter(t => t.done).length;

  return (
    <div style={{ width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div className="page-title">
          To-<em style={{ color: "#b85c38", fontStyle: "italic" }}>Do</em>
        </div>
        <div className="page-sub">
          {totalActive} active · {totalDone} done
        </div>
      </div>

      {/* Buckets */}
      {BUCKETS.map(bucket => (
        <BucketSection
          key={bucket.id}
          bucket={bucket}
          todos={todos.filter(t => t.bucket === bucket.id)}
          onAdd={onAdd}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}