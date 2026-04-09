import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { getJobs, deleteJob } from "../../api/jobs";
import type { Job, JobStatus } from "../../api/jobs";
import Toast from "../../components/Toast";
import ConfirmDialog from "../../components/ConfirmDialog";

const STATUS_CFG: Record<JobStatus, { bg: string; color: string }> = {
  Active:    { bg: "#052E16", color: "#22C55E" },
  Pending:   { bg: "#1C1C1C", color: "#A1A1A1" },
  "On Hold": { bg: "#2D0A0A", color: "#EF4444" },
  Done:      { bg: "#111",    color: "#444"    },
};

const PRIORITY_COLOR: Record<string, string> = { High: "#EF4444", Medium: "#F59E0B", Low: "#22C55E" };

const FILTERS: ("All" | JobStatus)[] = ["All", "Active", "Pending", "On Hold", "Done"];

const AdminJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState<"All" | JobStatus>("All");
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); };

  const fetchJobs = useCallback(async () => {
    try { setLoading(true); setError(null); const d = await getJobs(); setJobs(d); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteJob(confirmId);
      setJobs((p) => p.filter((j) => j.id !== confirmId));
      showToast("Job eliminado", true);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error", false);
    } finally { setConfirmId(null); }
  };

  const filtered = jobs.filter((j) => {
    const okFilter = filter === "All" || j.status === filter;
    const q = search.toLowerCase();
    const okSearch = !q || j.title.toLowerCase().includes(q) || j.client.toLowerCase().includes(q) || (j.technicianName ?? "").toLowerCase().includes(q);
    return okFilter && okSearch;
  });

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      {toast && <Toast message={toast.msg} type={toast.ok ? "success" : "error"} onDismiss={() => setToast(null)} />}
      {confirmId && (
        <ConfirmDialog
          title="Eliminar job"
          message="¿Seguro que deseas eliminar este job? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ color: "#FFF", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Jobs</h1>
            <p style={{ color: "#555", fontSize: 13 }}>{filtered.length} de {jobs.length} jobs</p>
            {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>API error: {error}</p>}
          </div>
          <button
            onClick={() => navigate("/admin/jobs/new")}
            style={{ padding: "10px 20px", borderRadius: 12, background: "#22C55E", border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            + Nuevo Job
          </button>
        </div>

        {/* Filters + Search */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, cliente, técnico..."
            style={{ flex: "1 1 240px", height: 42, padding: "0 14px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 10, color: "#FFF", fontSize: 13, outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 14px", borderRadius: 20, border: filter === f ? "1px solid #22C55E" : "1px solid #1F1F1F", background: filter === f ? "#052E16" : "#111", color: filter === f ? "#22C55E" : "#A1A1A1", fontSize: 12, fontWeight: filter === f ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState title="Sin jobs" subtitle="No hay jobs que coincidan con el filtro." actionLabel="Nuevo Job" onAction={() => navigate("/admin/jobs/new")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr 1fr 1fr 100px", gap: 12, padding: "8px 16px", color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
              <span>TÍTULO</span><span>CLIENTE</span><span>TÉCNICO</span><span>ESTADO</span><span>PRIORIDAD</span><span></span>
            </div>
            {filtered.map((job) => {
              const cfg = STATUS_CFG[job.status];
              return (
                <div
                  key={job.id}
                  style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr 1fr 1fr 100px", gap: 12, padding: "14px 16px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 12, alignItems: "center" }}
                >
                  <div>
                    <div style={{ color: "#FFF", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{job.title}</div>
                    <div style={{ color: "#555", fontSize: 11 }}>{job.date ?? ""} {job.time ?? ""}</div>
                  </div>
                  <div style={{ color: "#A1A1A1", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.client}</div>
                  <div style={{ color: "#A1A1A1", fontSize: 13 }}>{job.technicianName ?? "—"}</div>
                  <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {job.status.toUpperCase()}
                  </span>
                  <span style={{ color: job.priority ? PRIORITY_COLOR[job.priority] : "#555", fontSize: 12, fontWeight: 600 }}>
                    {job.priority ?? "—"}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => navigate(`/admin/jobs/${job.id}`)} style={{ flex: 1, height: 30, borderRadius: 8, border: "1px solid #2A2A2A", background: "none", color: "#A1A1A1", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Ver</button>
                    <button onClick={() => navigate(`/admin/jobs/${job.id}/edit`)} style={{ flex: 1, height: 30, borderRadius: 8, border: "1px solid #2A2A2A", background: "none", color: "#22C55E", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                    <button onClick={() => setConfirmId(job.id)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #2D0A0A", background: "none", color: "#EF4444", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminJobs;
