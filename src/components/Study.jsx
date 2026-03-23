import { useState } from "react";

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const card = { background: "white", borderRadius: "16px", border: "1.5px solid #f0d6e4" };
const STATUSES = ["Completed", "In Progress", "Revisit", "Skipped"];
const STATUS_COLORS = {
  Completed: { bg: "#EAF3F0", color: "#5a9080" },
  "In Progress": { bg: "#FFFBEB", color: "#D97706" },
  Revisit: { bg: "#FDF0ED", color: "#E8A090" },
  Skipped: { bg: "#F8F8F8", color: "#aaa" },
};

const EMPTY = { date: new Date().toISOString().split("T")[0], subject: "", topic: "", hours: "", pages: "", quality: 4, status: "Completed", notes: "" };

export default function Study() {
  const [sessions, setSessions] = useState(() => load("ms_study", []));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const saveSessions = (s) => { setSessions(s); save("ms_study", s); };

  const submit = () => {
    if (!form.subject.trim() || !form.hours) return;
    saveSessions([{ ...form, id: uid() }, ...sessions]);
    setShowModal(false);
    setForm(EMPTY);
  };

  const del = (id) => saveSessions(sessions.filter(s => s.id !== id));

  const totalHrs = sessions.reduce((s, e) => s + parseFloat(e.hours || 0), 0);
  const subjects = [...new Set(sessions.map(e => e.subject))].length;
  const avgQ = sessions.length > 0 ? (sessions.reduce((s, e) => s + parseInt(e.quality || 0), 0) / sessions.length).toFixed(1) : 0;

  const field = (label, key, extra = {}) => (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "5px" }}>{label}</label>
      <input
        {...extra}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #f0d6e4", fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", outline: "none", color: "#1a1a2e" }}
      />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#1a1a2e" }}>
            Study <em style={{ color: "#c45c82" }}>Log</em>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#aaa", marginTop: "4px" }}>
            Log every session. Watch the hours stack up.
          </div>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          padding: "10px 20px", borderRadius: "12px", border: "none",
          background: "#1a1a2e", color: "white", fontFamily: "DM Sans, sans-serif",
          fontSize: "0.82rem", fontWeight: 600, cursor: "pointer"
        }}>+ Log Session</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { val: `${totalHrs.toFixed(1)}h`, label: "Total Hours" },
          { val: sessions.length, label: "Sessions" },
          { val: subjects, label: "Subjects" },
          { val: `${avgQ}⭐`, label: "Avg Quality" },
        ].map(s => (
          <div key={s.label} style={{ ...card, textAlign: "center", padding: "16px" }}>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.8rem", color: "#c45c82" }}>{s.val}</div>
            <div style={{ fontSize: "0.7rem", color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#cbb" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📖</div>
          <div>No sessions yet. Log your first one!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {sessions.map(s => {
            const sc = STATUS_COLORS[s.status] || STATUS_COLORS.Skipped;
            return (
              <div key={s.id} style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ minWidth: 80, fontSize: "0.78rem", color: "#aaa" }}>{s.date}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1a1a2e" }}>{s.subject}</div>
                  <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "2px" }}>{s.topic}</div>
                </div>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.2rem", color: "#7BAE9E", minWidth: 50 }}>{s.hours}h</div>
                <div style={{ display: "flex", gap: "3px" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < parseInt(s.quality) ? "#D4A853" : "#f0d6e4" }} />
                  ))}
                </div>
                <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 600, background: sc.bg, color: sc.color }}>{s.status}</span>
                <button onClick={() => del(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f0d6e4", fontSize: "0.8rem" }}>✕</button>
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
            width: "90%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(26,26,46,0.15)",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: "1.4rem", color: "#1a1a2e", marginBottom: "20px" }}>Log Session</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {field("Date", "date", { type: "date" })}
              {field("Hours", "hours", { type: "number", placeholder: "e.g. 1.5", step: "0.5", min: "0" })}
              {field("Subject", "subject", { placeholder: "e.g. Mathematics" })}
              {field("Topic", "topic", { placeholder: "e.g. Integration" })}
              {field("Pages / Problems", "pages", { placeholder: "e.g. 20 problems" })}
              {field("Quality (1-5)", "quality", { type: "number", min: "1", max: "5" })}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "5px" }}>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #f0d6e4", fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", outline: "none", color: "#1a1a2e" }}>
                {STATUSES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {field("Notes", "notes", { placeholder: "How did it go?" })}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1.5px solid #f0d6e4", background: "white", color: "#aaa", fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>Cancel</button>
              <button onClick={submit} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#1a1a2e", color: "white", fontFamily: "DM Sans, sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Save Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}