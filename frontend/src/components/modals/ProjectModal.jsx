import React, { useState } from 'react';
import toast from 'react-hot-toast';

const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];
const ICONS = ["📋","🚀","🎯","💡","🔥","⚡","🎨","🛠️","📊","🌟"];

const ProjectModal = ({ onSave, onClose, project }) => {
  const [form, setForm] = useState({
    name: project?.name || "", description: project?.description || "",
    color: project?.color || "#6366f1", icon: project?.icon || "📋",
    dueDate: project?.dueDate?.split("T")[0] || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Project name required");
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px" }}>{project ? "Edit Project" : "New Project"}</h3>
          <button onClick={onClose} style={{ background: "none", color: "var(--text-muted)", fontSize: "20px" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: form.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{form.icon}</div>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Project name" required style={{ fontWeight: 700, fontSize: "16px" }} />
          </div>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description (optional)" rows={3} style={{ resize: "none" }} />
          <div>
            <label style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Color</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {COLORS.map(c => <button type="button" key={c} onClick={() => setForm({...form, color: c})} style={{ width: "28px", height: "28px", borderRadius: "50%", background: c, border: form.color === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }} />)}
            </div>
          </div>
          <div>
            <label style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Icon</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {ICONS.map(ic => <button type="button" key={ic} onClick={() => setForm({...form, icon: ic})} style={{ width: "36px", height: "36px", borderRadius: "8px", background: form.icon === ic ? "rgba(91,110,245,0.2)" : "var(--bg-overlay)", border: form.icon === ic ? "1px solid var(--accent)" : "1px solid var(--border)", fontSize: "18px", cursor: "pointer" }}>{ic}</button>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Saving..." : "Create Project"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
