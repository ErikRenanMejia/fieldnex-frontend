import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Toast from "../../components/Toast";
import Modal from "../../components/Modal";
import { getCompanies, createCompany } from "../../api/companies";
import type { Company } from "../../api/companies";

const inputStyle: React.CSSProperties = { width: "100%", height: 48, padding: "0 14px", background: "#0C0C0C", border: "1.5px solid #2E2E2E", borderRadius: 12, color: "#FFF", fontSize: 14, outline: "none", fontFamily: "inherit" };
const labelStyle: React.CSSProperties = { color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6, display: "block" };

const AdminCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({ name: "", contactName: "", email: "", phone: "", address: "", notes: "" });

  const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

  const fetchCompanies = useCallback(async () => {
    try { setLoading(true); setError(null); const d = await getCompanies(); setCompanies(d); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await createCompany(form);
      setCompanies((p) => [...p, created]);
      showToast("Empresa creada", true);
      setShowForm(false);
      setForm({ name: "", contactName: "", email: "", phone: "", address: "", notes: "" });
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al crear", false);
    } finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      {toast && <Toast message={toast.msg} type={toast.ok ? "success" : "error"} onDismiss={() => setToast(null)} />}
      {showForm && (
        <Modal title="Nueva Empresa" onClose={() => setShowForm(false)} onSave={handleCreate} saveLabel="Crear Empresa" saving={saving}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "12px 0" }}>
            <div>
              <label style={labelStyle}>NOMBRE *</label>
              <input value={form.name} onChange={set("name")} placeholder="Nombre de la empresa" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CONTACTO PRINCIPAL</label>
              <input value={form.contactName} onChange={set("contactName")} placeholder="Nombre del contacto" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>EMAIL</label>
                <input value={form.email} onChange={set("email")} placeholder="email@empresa.com" type="email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>TELÉFONO</label>
                <input value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>DIRECCIÓN</label>
              <input value={form.address} onChange={set("address")} placeholder="Dirección" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>NOTAS</label>
              <textarea value={form.notes} onChange={set("notes")} placeholder="Notas..." rows={3} style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical" }} />
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#FFF", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Empresas</h1>
            <p style={{ color: "#555", fontSize: 13 }}>{companies.length} empresa{companies.length !== 1 ? "s" : ""}</p>
            {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>API error: {error}</p>}
          </div>
          <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", borderRadius: 12, background: "#22C55E", border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            + Nueva Empresa
          </button>
        </div>

        {companies.length === 0 ? (
          <EmptyState title="Sin empresas" subtitle="Agrega tu primera empresa cliente." actionLabel="Nueva Empresa" onAction={() => setShowForm(true)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {companies.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/admin/companies/${c.id}`)}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 14, cursor: "pointer" }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                  {c.name[0]?.toUpperCase() ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#FFF", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ color: "#555", fontSize: 12 }}>{c.contactName ?? ""}{c.phone ? ` · ${c.phone}` : ""}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCompanies;
