import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getCompanyById } from "../../api/companies";
import type { Company } from "../../api/companies";

const AdminCompanyDetail = () => {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getCompanyById(Number(id)).then(setCompany).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;
  if (!company) return <AdminLayout><p style={{ color: "#EF4444" }}>Empresa no encontrada</p></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/admin/companies")} style={{ width: 36, height: 36, borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFF", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <h1 style={{ color: "#FFF", fontSize: 22, fontWeight: 800 }}>{company.name}</h1>
        </div>
        <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Contacto",   value: company.contactName },
            { label: "Email",      value: company.email },
            { label: "Teléfono",   value: company.phone },
            { label: "Dirección",  value: company.address },
            { label: "Notas",      value: company.notes },
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

export default AdminCompanyDetail;
