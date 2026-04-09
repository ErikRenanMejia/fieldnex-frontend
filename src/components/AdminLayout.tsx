import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NAV = [
  { label: "Dashboard",   path: "/admin",                icon: "▦" },
  { label: "Jobs",        path: "/admin/jobs",           icon: "✦" },
  { label: "Técnicos",    path: "/admin/technicians",    icon: "◉" },
  { label: "Empresas",    path: "/admin/companies",      icon: "⬡" },
  { label: "Inventario",  path: "/admin/inventory",      icon: "◈" },
  { label: "Vehículos",   path: "/admin/vehicles",       icon: "⬢" },
  { label: "Reportes",    path: "/admin/reports",        icon: "▤" },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const auth      = useAuth();

  const initials = `${auth.user?.firstName?.[0] ?? ""}${auth.user?.lastName?.[0] ?? ""}`.toUpperCase() || "A";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#111;}::-webkit-scrollbar-thumb{background:#2A2A2A;border-radius:2px;}`}</style>
      <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Syne', sans-serif", display: "flex", flexDirection: "column" }}>

        {/* Top nav */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0C0C0C", borderBottom: "1px solid #1A1A1A", padding: "0 24px", display: "flex", alignItems: "center", gap: 0, height: 54, overflowX: "auto" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 32, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: "#22C55E", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 800, fontSize: 14 }}>✓</div>
            <span style={{ color: "#FFF", fontFamily: "monospace", letterSpacing: "0.2em", fontSize: 11, fontWeight: 700 }}>FIELDNEX</span>
            <span style={{ color: "#22C55E", fontSize: 9, fontWeight: 700, background: "#052E16", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.08em" }}>ADMIN</span>
          </div>

          {/* Nav items */}
          <div style={{ display: "flex", gap: 0, flex: 1 }}>
            {NAV.map(({ label, path }) => {
              const active = path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{ padding: "0 14px", height: 54, background: "none", border: "none", borderBottom: `2px solid ${active ? "#22C55E" : "transparent"}`, color: active ? "#22C55E" : "#555", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "color 0.15s, border-color 0.15s" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 16 }}>
            <span style={{ color: "#555", fontSize: 12 }}>{auth.user?.firstName}</span>
            <div
              title="Logout"
              onClick={() => { auth.logout(); navigate("/login"); }}
              style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1A1A", border: "1.5px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", padding: "28px 24px 60px" }}>
          {children}
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
