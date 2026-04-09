import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getJobs } from "../api/jobs";
import type { Job, JobStatus } from "../api/jobs";

// ─── Types ───────────────────────────────────────────────────────────────────

type NavItem = "Home" | "Jobs" | "Inventory" | "Profile";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
};

const todayLabel = (): string =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const statusConfig: Record<JobStatus, { bg: string; color: string }> = {
  Active:    { bg: "#052E16", color: "#22C55E" },
  Pending:   { bg: "#1C1C1C", color: "#A1A1A1" },
  "On Hold": { bg: "#2D0A0A", color: "#EF4444" },
  Done:      { bg: "#111111", color: "#444444" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A1A1A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

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

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Loading / Error states ───────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif" }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ width: 36, height: 36, border: "3px solid #1F1F1F", borderTop: "3px solid #22C55E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  </div>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const SummaryCard = ({ value, label, accent }: { value: number; label: string; accent?: boolean }) => (
  <div style={{ flex: 1, background: "#111111", border: `1px solid ${accent ? "#22C55E33" : "#1F1F1F"}`, borderRadius: 14, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ color: accent ? "#22C55E" : "#FFFFFF", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</span>
    <span style={{ color: "#555555", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
  </div>
);

const JobCard = ({ job }: { job: Job }) => {
  const [pressed, setPressed] = useState(false);
  const cfg = statusConfig[job.status];

  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{ background: "#111111", border: "1px solid #1F1F1F", borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transform: pressed ? "scale(0.985)" : "scale(1)", transition: "transform 0.1s ease", userSelect: "none" }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0, alignSelf: "flex-start", marginTop: 5 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {job.title}
          </span>
          <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 20, flexShrink: 0 }}>
            {job.status.toUpperCase()}
          </span>
        </div>
        <div style={{ color: "#A1A1A1", fontSize: 13, marginBottom: 8 }}>{job.client}</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <ClockIcon />
            <span style={{ color: "#555555", fontSize: 12 }}>{job.time}</span>
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center", minWidth: 0, overflow: "hidden" }}>
            <MapPinIcon />
            <span style={{ color: "#555555", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {job.address}
            </span>
          </div>
        </div>
      </div>

      <ChevronRight />
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const userName    = auth.user?.firstName ?? "User";
  const userInitials = getInitials(auth.user?.firstName, auth.user?.lastName);

  const [activeNav, setActiveNav] = useState<NavItem>("Home");
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJobs();
      setJobs(data);
    } catch {
      // Non-401 errors: show empty dashboard (401 is handled by fetchAPI → redirect to /login)
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const totalToday  = jobs.length;
  const totalActive = jobs.filter((j) => j.status === "Active").length;
  const totalDone   = jobs.filter((j) => j.status === "Done").length;

  const NAV: { key: NavItem; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { key: "Home",      label: "Home",      Icon: HomeIcon },
    { key: "Jobs",      label: "Jobs",      Icon: BriefcaseIcon },
    { key: "Inventory", label: "Inventory", Icon: BoxIcon },
    { key: "Profile",   label: "Profile",   Icon: UserIcon },
  ];

  if (loading) return <Spinner />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Syne', sans-serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>

        {/* ── Topbar ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 12px", position: "sticky", top: 0, zIndex: 10, background: "#080808" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "#22C55E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 800, fontSize: 15 }}>
              ✓
            </div>
            <span style={{ color: "#FFFFFF", fontFamily: "monospace", letterSpacing: "0.2em", fontSize: 12, fontWeight: 700 }}>
              FIELDNEX
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <BellIcon />
              <div style={{ position: "absolute", top: -1, right: -1, width: 8, height: 8, background: "#22C55E", borderRadius: "50%", border: "1.5px solid #080808" }} />
            </div>
            <div
              title="Logout"
              onClick={() => { auth.logout(); navigate("/login"); }}
              style={{ width: 34, height: 34, borderRadius: "50%", background: "#1A1A1A", border: "1.5px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em" }}
            >
              {userInitials}
            </div>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 100px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Greeting */}
          <div>
            <div style={{ color: "#555555", fontSize: 12, fontWeight: 500, marginBottom: 6, letterSpacing: "0.04em" }}>{todayLabel()}</div>
            <h1 style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginBottom: 6 }}>
              {greeting()}, {userName} 👋
            </h1>
            <p style={{ color: "#A1A1A1", fontSize: 14 }}>
              You have{" "}
              <span style={{ color: "#22C55E", fontWeight: 600 }}>
                {totalActive} active job{totalActive !== 1 ? "s" : ""}
              </span>{" "}
              — {totalToday} total assigned today.
            </p>
          </div>

          {/* Summary cards */}
          <div style={{ display: "flex", gap: 10 }}>
            <SummaryCard value={totalToday}  label="Today"  />
            <SummaryCard value={totalActive} label="Active" accent />
            <SummaryCard value={totalDone}   label="Done"   />
          </div>

          {/* Job list */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 600 }}>Today's Jobs</span>
              <span onClick={() => navigate("/jobs")} style={{ color: "#22C55E", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                See all
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {jobs.length === 0 ? (
                <div style={{ color: "#444", fontSize: 14, textAlign: "center", paddingTop: 40 }}>No jobs for today.</div>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom nav ───────────────────────────────────────────────────── */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#111111", borderTop: "1px solid #1F1F1F", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "12px 0 20px", zIndex: 20 }}>
          {NAV.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => {
                if (key === "Profile")        navigate("/profile");
                else if (key === "Inventory") navigate("/inventory");
                else if (key === "Jobs")      navigate("/jobs");
                else setActiveNav(key as NavItem);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 16px" }}
            >
              <Icon active={activeNav === key} />
              <span style={{ color: activeNav === key ? "#22C55E" : "#555555", fontSize: 11, fontWeight: activeNav === key ? 600 : 400, letterSpacing: "0.04em" }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
