import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";
import { getJobById, deleteJob, updateJob } from "../../api/jobs";
import type { Job, JobStatus } from "../../api/jobs";
import { getTechnicians } from "../../api/technicians";
import type { Technician } from "../../api/technicians";

const STATUS_CFG: Record<JobStatus, { bg: string; color: string }> = {
  Active:    { bg: "#052E16", color: "#22C55E" },
  Pending:   { bg: "#1C1C1C", color: "#A1A1A1" },
  "On Hold": { bg: "#2D0A0A", color: "#EF4444" },
  Done:      { bg: "#111",    color: "#444"    },
};

const Row = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
      <span style={{ color: "#FFF", fontSize: 14 }}>{value}</span>
    </div>
  ) : null;

const AdminJobDetail = () => {
  const navigate        = useNavigate();
  const { id }          = useParams<{ id: string }>();
  const [job, setJob]   = useState<Job | null>(null);
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState(false);
  const [reassign, setReassign] = useState(false);
  const [techs, setTechs]       = useState<Technician[]>([]);
  const [selTech, setSelTech]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getJobById(id), getTechnicians()])
      .then(([j, t]) => { setJob(j); setTechs(t); setSelTech(j.technicianId ? String(j.technicianId) : ""); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try { await deleteJob(id); navigate("/admin/jobs"); }
    catch (e: unknown) { setToast({ msg: e instanceof Error ? e.message : "Error", ok: false }); setConfirm(false); }
  };

  const handleReassign = async () => {
    if (!id || !selTech) return;
    setSaving(true);
    try {
      await updateJob(id, { technicianId: Number(selTech) });
      const tech = techs.find((t) => t.id === Number(selTech));
      setJob((p) => p ? { ...p, technicianName: `${tech?.firstName} ${tech?.lastName}`, technicianId: Number(selTech) } : p);
      setToast({ msg: "Técnico reasignado", ok: true });
      setReassign(false);
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : "Error", ok: false });
    } finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;
  if (!job) return <AdminLayout><p style={{ color: "#EF4444" }}>Job no encontrado</p></AdminLayout>;

  const cfg = STATUS_CFG[job.status];

  return (
    <AdminLayout>
      {toast && <Toast message={toast.msg} type={toast.ok ? "success" : "error"} onDismiss={() => setToast(null)} />}
      {confirm && <ConfirmDialog title="Eliminar job" message="¿Seguro que deseas eliminar este job?" onConfirm={handleDelete} onCancel={() => setConfirm(false)} />}

      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => navigate("/admin/jobs")} style={{ width: 36, height: 36, borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFF", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <div>
              <h1 style={{ color: "#FFF", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{job.title}</h1>
              <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em" }}>{job.status.toUpperCase()}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate(`/admin/jobs/${id}/edit`)} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #2A2A2A", background: "#1A1A1A", color: "#22C55E", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
            <button onClick={() => setReassign(true)} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #2A2A2A", background: "#1A1A1A", color: "#A1A1A1", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Reasignar</button>
            <button onClick={() => setConfirm(true)} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #2D0A0A", background: "none", color: "#EF4444", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Eliminar</button>
          </div>
        </div>

        {/* Info card */}
        <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Row label="Cliente"   value={job.client} />
          <Row label="Técnico"   value={job.technicianName ?? "Sin asignar"} />
          <Row label="Sistema"   value={job.system} />
          <Row label="Prioridad" value={job.priority} />
          <Row label="Fecha"     value={job.date} />
          <Row label="Hora"      value={job.time} />
          <div style={{ gridColumn: "1/-1" }}><Row label="Dirección" value={job.address} /></div>
          <div style={{ gridColumn: "1/-1" }}><Row label="Notas" value={job.notes} /></div>
        </div>

        {/* Reassign panel */}
        {reassign && (
          <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 20 }}>
            <div style={{ color: "#FFF", fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Reasignar técnico</div>
            <div style={{ display: "flex", gap: 10 }}>
              <select value={selTech} onChange={(e) => setSelTech(e.target.value)} style={{ flex: 1, height: 44, padding: "0 12px", background: "#0C0C0C", border: "1.5px solid #2E2E2E", borderRadius: 10, color: "#FFF", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                <option value="">Sin asignar</option>
                {techs.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
              <button onClick={handleReassign} disabled={saving} style={{ padding: "0 20px", height: 44, borderRadius: 10, border: "none", background: "#22C55E", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {saving ? "..." : "Guardar"}
              </button>
              <button onClick={() => setReassign(false)} style={{ padding: "0 14px", height: 44, borderRadius: 10, border: "1px solid #2A2A2A", background: "none", color: "#555", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminJobDetail;
