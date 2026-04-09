import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getJobs } from "../../api/jobs";
import type { Job, JobStatus } from "../../api/jobs";

const STATUS_COLOR: Record<JobStatus, string> = {
  Active: "#22C55E", Pending: "#A1A1A1", "On Hold": "#EF4444", Done: "#444",
};

const AdminReports = () => {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    const headers = ["ID", "Título", "Cliente", "Estado", "Prioridad", "Fecha"];
    const rows = jobs.map((j) => [j.id, j.title, j.client, j.status, j.priority ?? "", j.date ?? j.scheduledAt ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "fieldnex-jobs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  const byStatus = (s: JobStatus) => jobs.filter((j) => j.status === s);
  const techMap: Record<string, number> = {};
  jobs.forEach((j) => {
    const name = j.technicianName ?? "Sin asignar";
    techMap[name] = (techMap[name] ?? 0) + 1;
  });

  return (
    <AdminLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 900 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#FFF", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Reportes</h1>
            <p style={{ color: "#555", fontSize: 13 }}>Resumen general</p>
            {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>API error: {error}</p>}
          </div>
          <button onClick={downloadCSV} style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid #22C55E", background: "none", color: "#22C55E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ↓ Export CSV
          </button>
        </div>

        {/* Jobs por estado */}
        <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "#FFF", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Jobs por estado</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["Active", "Pending", "On Hold", "Done"] as JobStatus[]).map((s) => (
              <div key={s} style={{ flex: "1 1 140px", background: "#1A1A1A", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ color: STATUS_COLOR[s], fontSize: 32, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{byStatus(s).length}</div>
                <div style={{ color: "#555", fontSize: 12, fontWeight: 600 }}>{s.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs por técnico */}
        <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "#FFF", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Jobs por técnico</div>
          {Object.keys(techMap).length === 0 ? (
            <p style={{ color: "#555", fontSize: 13 }}>Sin datos.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(techMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#A1A1A1", fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                  <span style={{ color: "#FFF", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{count}</span>
                  <div style={{ flex: 2, height: 6, background: "#1A1A1A", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(count / jobs.length) * 100}%`, background: "#22C55E", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabla completa */}
        <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "#FFF", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Todos los jobs ({jobs.length})</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1F1F1F" }}>
                  {["Título", "Cliente", "Técnico", "Estado", "Prioridad"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textAlign: "left" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} style={{ borderBottom: "1px solid #1A1A1A" }}>
                    <td style={{ padding: "10px 12px", color: "#FFF" }}>{j.title}</td>
                    <td style={{ padding: "10px 12px", color: "#A1A1A1" }}>{j.client}</td>
                    <td style={{ padding: "10px 12px", color: "#A1A1A1" }}>{j.technicianName ?? "—"}</td>
                    <td style={{ padding: "10px 12px" }}><span style={{ color: STATUS_COLOR[j.status], fontWeight: 600 }}>{j.status}</span></td>
                    <td style={{ padding: "10px 12px", color: "#555" }}>{j.priority ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
