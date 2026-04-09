import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Toast from "../../components/Toast";
import ConfirmDialog from "../../components/ConfirmDialog";
import Modal from "../../components/Modal";
import { getTechnicians, createTechnician, updateTechnician } from "../../api/technicians";
import type { Technician } from "../../api/technicians";

const inputStyle: React.CSSProperties = { width: "100%", height: 48, padding: "0 14px", background: "#0C0C0C", border: "1.5px solid #2E2E2E", borderRadius: 12, color: "#FFF", fontSize: 14, outline: "none", fontFamily: "inherit" };
const labelStyle: React.CSSProperties = { color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6, display: "block" };

const initials = (t: Technician) => `${t.firstName[0] ?? ""}${t.lastName[0] ?? ""}`.toUpperCase();

const AdminTechnicians = () => {
  const navigate = useNavigate();
  const [techs, setTechs]         = useState<Technician[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "technician", isActive: true });

  const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

  const fetchTechs = useCallback(async () => {
    try { setLoading(true); setError(null); const d = await getTechnicians(); setTechs(d); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTechs(); }, [fetchTechs]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.firstName.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      const created = await createTechnician({ ...form, companyId: 1 });
      setTechs((p) => [...p, created]);
      showToast("Técnico creado", true);
      setShowForm(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "technician", isActive: true });
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al crear", false);
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (t: Technician) => {
    try {
      await updateTechnician(t.id, { isActive: !t.isActive });
      setTechs((p) => p.map((x) => x.id === t.id ? { ...x, isActive: !x.isActive } : x));
      showToast(t.isActive ? "Técnico desactivado" : "Técnico activado", true);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error", false);
    }
  };

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      {toast && <Toast message={toast.msg} type={toast.ok ? "success" : "error"} onDismiss={() => setToast(null)} />}
      {confirmId !== null && (
        <ConfirmDialog
          title="Desactivar técnico"
          message="¿Deseas desactivar este técnico?"
          confirmLabel="Desactivar"
          onConfirm={() => { const t = techs.find((x) => x.id === confirmId); if (t) handleToggleActive(t); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {showForm && (
        <Modal title="Nuevo Técnico" onClose={() => setShowForm(false)} onSave={handleCreate} saveLabel="Crear Técnico" saving={saving}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "12px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>NOMBRE *</label>
                <input value={form.firstName} onChange={set("firstName")} placeholder="Nombre" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>APELLIDO</label>
                <input value={form.lastName} onChange={set("lastName")} placeholder="Apellido" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>EMAIL *</label>
              <input value={form.email} onChange={set("email")} placeholder="email@empresa.com" type="email" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>TELÉFONO</label>
              <input value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PASSWORD TEMPORAL</label>
              <input value={form.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" type="password" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ROL</label>
              <select value={form.role} onChange={set("role")} style={{ ...inputStyle, appearance: "none" }}>
                <option value="technician">Técnico</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#FFF", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Técnicos</h1>
            <p style={{ color: "#555", fontSize: 13 }}>{techs.length} técnico{techs.length !== 1 ? "s" : ""}</p>
            {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>API error: {error}</p>}
          </div>
          <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", borderRadius: 12, background: "#22C55E", border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            + Nuevo Técnico
          </button>
        </div>

        {techs.length === 0 ? (
          <EmptyState title="Sin técnicos" subtitle="Agrega tu primer técnico." actionLabel="Nuevo Técnico" onAction={() => setShowForm(true)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {techs.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: t.isActive ? "#052E16" : "#1A1A1A", border: `2px solid ${t.isActive ? "#22C55E" : "#2A2A2A"}`, display: "flex", alignItems: "center", justifyContent: "center", color: t.isActive ? "#22C55E" : "#555", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {initials(t)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#FFF", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{t.firstName} {t.lastName}</div>
                  <div style={{ color: "#555", fontSize: 12 }}>{t.email}</div>
                </div>
                <span style={{ color: t.isActive ? "#22C55E" : "#555", fontSize: 11, fontWeight: 600, background: t.isActive ? "#052E16" : "#1A1A1A", padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                  {t.isActive ? "ACTIVO" : "INACTIVO"}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => navigate(`/admin/technicians/${t.id}`)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #2A2A2A", background: "none", color: "#A1A1A1", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Ver</button>
                  <button onClick={() => t.isActive ? setConfirmId(t.id) : handleToggleActive(t)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #2A2A2A", background: "none", color: t.isActive ? "#EF4444" : "#22C55E", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    {t.isActive ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTechnicians;
