import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getTechnicianById } from "../../api/technicians";
import type { Technician } from "../../api/technicians";

const AdminTechnicianDetail = () => {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const [tech, setTech]     = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTechnicianById(Number(id))
      .then(setTech)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;
  if (!tech) return <AdminLayout><p style={{ color: "#EF4444" }}>Técnico no encontrado</p></AdminLayout>;

  const initials = `${tech.firstName[0] ?? ""}${tech.lastName[0] ?? ""}`.toUpperCase();

  return (
    <AdminLayout>
      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/admin/technicians")} style={{ width: 36, height: 36, borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFF", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <h1 style={{ color: "#FFF", fontSize: 22, fontWeight: 800 }}>Perfil del Técnico</h1>
        </div>

        <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: tech.isActive ? "#052E16" : "#1A1A1A", border: `3px solid ${tech.isActive ? "#22C55E" : "#2A2A2A"}`, display: "flex", alignItems: "center", justifyContent: "center", color: tech.isActive ? "#22C55E" : "#555", fontSize: 24, fontWeight: 800 }}>
            {initials}
          </div>
          <div style={{ color: "#FFF", fontSize: 20, fontWeight: 700 }}>{tech.firstName} {tech.lastName}</div>
          <span style={{ color: tech.isActive ? "#22C55E" : "#555", fontSize: 11, fontWeight: 600, background: tech.isActive ? "#052E16" : "#1A1A1A", padding: "4px 12px", borderRadius: 20 }}>
            {tech.isActive ? "ACTIVO" : "INACTIVO"}
          </span>
        </div>

        <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Email",    value: tech.email },
            { label: "Teléfono", value: tech.phone },
            { label: "Rol",      value: tech.role },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>{label.toUpperCase()}</div>
              <div style={{ color: "#FFF", fontSize: 14 }}>{value}</div>
            </div>
          ) : null)}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTechnicianDetail;
