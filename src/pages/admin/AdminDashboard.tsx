import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getJobs } from "../../api/jobs";
import type { Job, JobStatus } from "../../api/jobs";

const STATUS_COLOR: Record<JobStatus, string> = {
  Active:    "#22C55E",
  Pending:   "#A1A1A1",
  "On Hold": "#EF4444",
  Done:      "#444",
};

const KpiCard = ({ value, label, accent }: { value: number | string; label: string; accent?: string }) => (
  <div style={{ flex: "1 1 180px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: "20px 24px" }}>
    <div style={{ color: accent ?? "#FFF", fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>{value}</div>
    <div style={{ color: "#555", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em" }}>{label.toUpperCase()}</div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  const active    = jobs.filter((j) => j.status === "Active").length;
  const pending   = jobs.filter((j) => j.status === "Pending").length;
  const done      = jobs.filter((j) => j.status === "Done").length;
  const onHold    = jobs.filter((j) => j.status === "On Hold").length;
  const recent    = [...jobs].slice(0, 5);

  const maxBar = Math.max(active, pending, done, onHold, 1);
  const bars: { label: JobStatus; count: number; color: string }[] = [
    { label: "Active",   count: active,  color: "#22C55E" },
    { label: "Pending",  count: pending, color: "#A1A1A1" },
    { label: "On Hold",  count: onHold,  color: "#EF4444" },
    { label: "Done",     count: done,    color: "#333"    },
  ];

  return (
    <AdminLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Header */}
        <div>
          <h1 style={{ color: "#FFF", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: "#555", fontSize: 14 }}>Panel de control FieldNex</p>
          {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>API error: {error}</p>}
        </div>

        {/* KPIs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <KpiCard value={jobs.length} label="Total jobs"   />
          <KpiCard value={active}      label="Activos"       accent="#22C55E" />
          <KpiCard value={pending}     label="Pendientes"    accent="#A1A1A1" />
          <KpiCard value={done}        label="Completados"   accent="#444" />
        </div>

        {/* Bar chart + Recent */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

          {/* Bar chart */}
          <div style={{ flex: "1 1 280px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 24 }}>
            <div style={{ color: "#FFF", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Jobs por estado</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {bars.map(({ label, count, color }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#A1A1A1", fontSize: 12 }}>{label}</span>
                    <span style={{ color: "#FFF", fontSize: 12, fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: 8, background: "#1A1A1A", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(count / maxBar) * 100}%`, background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ flex: "2 1 380px", background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ color: "#FFF", fontSize: 15, fontWeight: 700 }}>Actividad reciente</span>
              <span onClick={() => navigate("/admin/jobs")} style={{ color: "#22C55E", fontSize: 13, cursor: "pointer" }}>Ver todos</span>
            </div>
            {recent.length === 0 ? (
              <p style={{ color: "#444", fontSize: 14 }}>Sin jobs registrados.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recent.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#1A1A1A", borderRadius: 12, cursor: "pointer" }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[job.status], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#FFF", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
                      <div style={{ color: "#555", fontSize: 12 }}>{job.client}</div>
                    </div>
                    <span style={{ color: STATUS_COLOR[job.status], fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{job.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div style={{ color: "#FFF", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Accesos rápidos</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Nuevo Job",      action: () => navigate("/admin/jobs/new")        },
              { label: "Ver Técnicos",   action: () => navigate("/admin/technicians")     },
              { label: "Ver Inventario", action: () => navigate("/admin/inventory")       },
              { label: "Reportes",       action: () => navigate("/admin/reports")         },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #2A2A2A", background: "#1A1A1A", color: "#FFF", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
