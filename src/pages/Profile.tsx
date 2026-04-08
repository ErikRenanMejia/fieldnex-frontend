import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BriefcaseIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const BoxIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const UserIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="1" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="17" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 0 }}>
    <span style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 16 }}>
      {title.toUpperCase()}
    </span>
    {children}
  </div>
);

const Row = ({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    paddingBottom: last ? 0 : 16,
    marginBottom: last ? 0 : 16,
    borderBottom: last ? "none" : "1px solid #1A1A1A",
  }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ color: "#555", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", marginBottom: 3 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ color: "#FFF", fontSize: 14 }}>{value}</div>
    </div>
  </div>
);

// ─── Profile ──────────────────────────────────────────────────────────────────

const Profile = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const firstName  = auth.user?.firstName ?? "";
  const lastName   = auth.user?.lastName  ?? "";
  const fullName   = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const email      = auth.user?.email ?? "—";
  const role       = auth.user?.role  ?? "—";
  const companyId  = auth.user?.companyId != null ? `#${auth.user.companyId}` : "—";
  const initials   = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "?";

  const roleLabel: Record<string, string> = {
    admin:       "Administrator",
    supervisor:  "Supervisor",
    technician:  "Technician",
  };

  const NAV = [
    { key: "Home",    label: "Home",    Icon: HomeIcon,       path: "/dashboard" },
    { key: "Jobs",    label: "Jobs",    Icon: BriefcaseIcon,  path: "/jobs"      },
    { key: "Inventory", label: "Inventory", Icon: BoxIcon, path: "/inventory" },
    { key: "Profile", label: "Profile", Icon: UserIcon,       path: "/profile"   },
  ];

  const handleSignOut = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080808",
        fontFamily: "'Syne', sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Topbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px 20px 16px",
          position: "sticky", top: 0, zIndex: 10,
          background: "#080808",
        }}>
          <span style={{ color: "#FFF", fontSize: 17, fontWeight: 700 }}>Profile</span>
        </div>

        {/* Scrollable body */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "8px 20px 120px",
          display: "flex", flexDirection: "column", gap: 20,
        }}>

          {/* Avatar + name + email */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 8 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#22C55E",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", fontSize: 28, fontWeight: 800,
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#FFF", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{fullName}</div>
              <div style={{ color: "#A1A1A1", fontSize: 14 }}>{email}</div>
            </div>
          </div>

          {/* Account section */}
          <Section title="Account">
            <Row icon={<ShieldIcon />}  label="Role"       value={roleLabel[role] ?? role} />
            <Row icon={<BuildingIcon />} label="Company ID" value={companyId} last />
          </Section>

          {/* App section */}
          <Section title="App">
            <Row icon={<InfoIcon />} label="Version" value="1.0.0" />
            <Row icon={<MailIcon />} label="Support"  value="support@fieldnex.io" last />
          </Section>
        </div>

        {/* Sign Out button — fixed above nav */}
        <div style={{
          position: "fixed", bottom: 64, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          padding: "0 20px 12px",
          background: "#080808",
          zIndex: 15,
        }}>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%", height: 52, borderRadius: 14, border: "none",
              background: "#2D0A0A",
              color: "#EF4444",
              fontSize: 14, fontWeight: 700, letterSpacing: "0.06em",
              cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3D1010")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2D0A0A")}
          >
            Sign Out
          </button>
        </div>

        {/* Bottom nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          background: "#111", borderTop: "1px solid #1F1F1F",
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "12px 0 20px", zIndex: 20,
        }}>
          {NAV.map(({ key, label, Icon, path }) => {
            const active = key === "Profile";
            return (
              <button
                key={key}
                onClick={() => path && navigate(path)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "4px 16px",
                }}
              >
                <Icon active={active} />
                <span style={{ color: active ? "#22C55E" : "#555", fontSize: 11, fontWeight: active ? 600 : 400, letterSpacing: "0.04em" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Profile;
