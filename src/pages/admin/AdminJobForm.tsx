import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";
import { getJobById, createJob, updateJob } from "../../api/jobs";
import type { CreateJobPayload } from "../../api/jobs";
import { getTechnicians } from "../../api/technicians";
import { getCompanies } from "../../api/companies";
import type { Technician } from "../../api/technicians";
import type { Company } from "../../api/companies";

const SYSTEMS = ["Lutron QSX", "Lutron RadioRA 3", "Savant", "Control4", "Ubiquiti", "CCTV", "Otro"];
const PRIORITIES = ["High", "Medium", "Low"];
const STATUSES = ["Active", "Pending", "On Hold", "Done"];

const inputStyle: React.CSSProperties = {
  width: "100%", height: 48, padding: "0 14px",
  background: "#0C0C0C", border: "1.5px solid #2E2E2E",
  borderRadius: 12, color: "#FFF", fontSize: 14, outline: "none", fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
  color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6, display: "block",
};
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none", cursor: "pointer" };

const AdminJobForm = () => {
  const navigate         = useNavigate();
  const { id }           = useParams<{ id: string }>();
  const isEdit           = !!id;
  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [companies, setCompanies]     = useState<Company[]>([]);

  const [form, setForm] = useState({
    title: "", description: "", client: "", technicianId: "",
    companyId: "", system: "Control4", priority: "Medium",
    status: "Pending", date: "", time: "", address: "", notes: "",
  });

  useEffect(() => {
    Promise.all([getTechnicians(), getCompanies()])
      .then(([t, c]) => { setTechnicians(t); setCompanies(c); })
      .catch(() => {});
    if (isEdit && id) {
      getJobById(id)
        .then((j) => setForm({
          title: j.title ?? "", description: j.description ?? "", client: j.client ?? "",
          technicianId: j.technicianId ? String(j.technicianId) : "",
          companyId: j.companyId ? String(j.companyId) : "",
          system: j.system ?? "Control4", priority: j.priority ?? "Medium",
          status: j.status ?? "Pending", date: j.date ?? "", time: j.time ?? "",
          address: j.address ?? "", notes: j.notes ?? "",
        }))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const techId   = form.technicianId ? Number(form.technicianId) : undefined;
      const coId     = form.companyId    ? Number(form.companyId)    : 1;
      if (isEdit && id) {
        await updateJob(id, {
          title: form.title, description: form.description, location: form.address,
          scheduledAt: form.date && form.time ? `${form.date}T${form.time}:00` : undefined,
          priority: form.priority as "High" | "Medium" | "Low",
          status: form.status as "Active" | "Pending" | "On Hold" | "Done",
          technicianId: techId, companyId: coId, notes: form.notes,
        });
      } else {
        const payload: CreateJobPayload = {
          title: form.title, companyId: coId, customerId: coId,
          technicianId: techId, description: form.description || undefined,
          location: form.address || undefined,
          scheduledAt: form.date && form.time ? `${form.date}T${form.time}:00` : undefined,
          priority: form.priority, status: form.status,
        };
        await createJob(payload);
      }
      navigate("/admin/jobs");
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : "Error al guardar", ok: false });
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      {toast && <Toast message={toast.msg} type={toast.ok ? "success" : "error"} onDismiss={() => setToast(null)} />}
      <div style={{ maxWidth: 680 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <button onClick={() => navigate("/admin/jobs")} style={{ width: 36, height: 36, borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFF", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <h1 style={{ color: "#FFF", fontSize: 22, fontWeight: 800 }}>{isEdit ? "Editar Job" : "Nuevo Job"}</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>TÍTULO *</label>
              <input value={form.title} onChange={set("title")} placeholder="Título del job" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>DESCRIPCIÓN</label>
              <textarea value={form.description} onChange={set("description")} placeholder="Descripción..." rows={3} style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical" }} />
            </div>

            <div>
              <label style={labelStyle}>CLIENTE</label>
              <input value={form.client} onChange={set("client")} placeholder="Nombre del cliente" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>EMPRESA</label>
              <select value={form.companyId} onChange={set("companyId")} style={selectStyle}>
                <option value="">Sin empresa</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>TÉCNICO ASIGNADO</label>
              <select value={form.technicianId} onChange={set("technicianId")} style={selectStyle}>
                <option value="">Sin asignar</option>
                {technicians.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>SISTEMA</label>
              <select value={form.system} onChange={set("system")} style={selectStyle}>
                {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>PRIORIDAD</label>
              <select value={form.priority} onChange={set("priority")} style={selectStyle}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>ESTADO</label>
              <select value={form.status} onChange={set("status")} style={selectStyle}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>FECHA</label>
              <input value={form.date} onChange={set("date")} type="date" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>HORA</label>
              <input value={form.time} onChange={set("time")} type="time" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>DIRECCIÓN</label>
              <input value={form.address} onChange={set("address")} placeholder="Dirección del site" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>NOTAS INTERNAS</label>
              <textarea value={form.notes} onChange={set("notes")} placeholder="Notas..." rows={3} style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical" }} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button onClick={() => navigate("/admin/jobs")} style={{ flex: 1, height: 48, borderRadius: 12, border: "1px solid #2A2A2A", background: "#1A1A1A", color: "#FFF", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              style={{ flex: 2, height: 48, borderRadius: 12, border: "none", background: saving || !form.title.trim() ? "#1A1A1A" : "#22C55E", color: saving || !form.title.trim() ? "#444" : "#000", fontSize: 14, fontWeight: 700, cursor: saving || !form.title.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear Job"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminJobForm;
