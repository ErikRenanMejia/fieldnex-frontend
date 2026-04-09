import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, createJob } from "../api/jobs";
import type { Job, JobStatus, CreateJobPayload } from "../api/jobs";

// ─── Types ────────────────────────────────────────────────────────────────────

type Filter = "All" | JobStatus;
type NavItem = "Home" | "Jobs" | "Inventory" | "Profile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<JobStatus, { bg: string; color: string }> = {
  "Active":   { bg: "#052E16", color: "#22C55E" },
  "Pending":  { bg: "#1C1C1C", color: "#A1A1A1" },
  "On Hold":  { bg: "#2D0A0A", color: "#EF4444" },
  "Done":     { bg: "#111111", color: "#444444" },
};

const FILTERS: Filter[] = ["All", "Active", "Pending", "On Hold", "Done"];

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon   = ({ a }: { a: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const BriefIcon  = ({ a }: { a: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const BoxIcon    = ({ a }: { a: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const UserIcon   = ({ a }: { a: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ChevronR   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const ClockIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PinIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

// ─── Loading / Error states ───────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ width: 36, height: 36, border: "3px solid #1F1F1F", borderTop: "3px solid #22C55E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  </div>
);

// ─── Job Card ─────────────────────────────────────────────────────────────────

const JobCard = ({ job, onClick }: { job: Job; onClick: () => void }) => {
  const [pressed, setPressed] = useState(false);
  const cfg = STATUS_CFG[job.status];

  return (
    <div
      onClick={onClick}
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
          <span style={{ color: "#FFF", fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            <span style={{ color: "#555", fontSize: 12 }}>{job.time}</span>
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center", minWidth: 0, overflow: "hidden" }}>
            <PinIcon />
            <span style={{ color: "#555", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.address}</span>
          </div>
        </div>
      </div>
      <ChevronR />
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastMsg = { msg: string; ok: boolean } | null;

// ─── Job Form ─────────────────────────────────────────────────────────────────

const SYSTEMS = ["Lutron", "Savant", "Control4", "Other"];

const inputStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 14px",
  background: "#1A1A1A", border: "1px solid #2A2A2A",
  borderRadius: 12, color: "#FFF", fontSize: 14,
  outline: "none", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  color: "#555", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.06em", marginBottom: 6, display: "block",
};

interface JobFormProps {
  onClose: () => void;
  onSaved: () => void;
  onToast: (t: ToastMsg) => void;
}

const JobForm = ({ onClose, onSaved, onToast }: JobFormProps) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", location: "", scheduledAt: "", priority: "Medium", system: "Lutron",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: CreateJobPayload = {
        title:       form.title,
        companyId:   1,
        customerId:  1,
        description: form.description || undefined,
        location:    form.location    || undefined,
        scheduledAt: form.scheduledAt || undefined,
        priority:    form.priority,
        status:      "Pending",
      };
      await createJob(payload);
      onToast({ msg: "Job creado", ok: true });
      onClose();
      onSaved();
    } catch (err) {
      onToast({ msg: err instanceof Error ? err.message : "Failed to create job", ok: false });
      setSaving(false);
    }
  };

  const canSubmit = form.title.trim().length > 0 && !saving;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 30 }} />
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#111", borderTop: "1px solid #1F1F1F", borderRadius: "20px 20px 0 0", padding: "8px 20px 40px", zIndex: 31, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 18px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#2A2A2A" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ color: "#FFF", fontSize: 16, fontWeight: 700 }}>New Job</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>TÍTULO *</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. HVAC Installation" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>DESCRIPCIÓN</label>
            <textarea value={form.description} onChange={set("description")} placeholder="Detalles del job..." rows={2} style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "none" }} />
          </div>
          <div>
            <label style={labelStyle}>UBICACIÓN</label>
            <input value={form.location} onChange={set("location")} placeholder="e.g. 123 Main St" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>FECHA Y HORA</label>
            <input value={form.scheduledAt} onChange={set("scheduledAt")} type="datetime-local" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>SISTEMA</label>
            <select value={form.system} onChange={set("system")} style={{ ...inputStyle, appearance: "none" }}>
              {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>PRIORIDAD</label>
            <select value={form.priority} onChange={set("priority")} style={{ ...inputStyle, appearance: "none" }}>
              {["High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ width: "100%", height: 52, borderRadius: 14, border: "none", marginTop: 24, background: canSubmit ? "#22C55E" : "#1A1A1A", color: canSubmit ? "#000" : "#444", fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "inherit" }}
        >
          {saving ? "Saving..." : "CREATE JOB"}
        </button>
      </div>
    </>
  );
};

// ─── Jobs Page ────────────────────────────────────────────────────────────────

const Jobs = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [search, setSearch]             = useState("");
  const [activeNav, setActiveNav]       = useState<NavItem>("Jobs");
  const [jobs, setJobs]                 = useState<Job[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showForm, setShowForm]         = useState(false);
  const [toast, setToast]               = useState<ToastMsg>(null);

  const showToast = (t: ToastMsg) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filtered = jobs.filter((j) => {
    const matchFilter = activeFilter === "All" || j.status === activeFilter;
    const matchSearch =
      search === "" ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.client.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const NAV: { key: NavItem; label: string; Icon: React.FC<{ a: boolean }> }[] = [
    { key: "Home",      label: "Home",      Icon: HomeIcon },
    { key: "Jobs",      label: "Jobs",      Icon: BriefIcon },
    { key: "Inventory", label: "Inventory", Icon: BoxIcon },
    { key: "Profile",   label: "Profile",   Icon: UserIcon },
  ];

  if (loading) return <Spinner />;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:0;}`}</style>
      <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Syne', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10, background: "#080808" }}>
          <div>
            <h1 style={{ color: "#FFF", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Jobs</h1>
            <p style={{ color: "#555", fontSize: 13 }}>{filtered.length} job{filtered.length !== 1 ? "s" : ""} found</p>
            {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4, wordBreak: "break-all" }}>API error: {error}</p>}
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ width: 36, height: 36, borderRadius: 10, background: "#22C55E", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 100px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search jobs or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", height: 46, paddingLeft: 40, paddingRight: 16, background: "#111", border: "1px solid #1F1F1F", borderRadius: 12, color: "#FFF", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {FILTERS.map((f) => {
              const active = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 20, border: active ? "1px solid #22C55E" : "1px solid #1F1F1F", background: active ? "#052E16" : "#111", color: active ? "#22C55E" : "#A1A1A1", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease" }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 ? (
              <div style={{ color: "#444", fontSize: 14, textAlign: "center", paddingTop: 40 }}>No jobs match this filter.</div>
            ) : (
              filtered.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`)} />
              ))
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#111", borderTop: "1px solid #1F1F1F", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "12px 0 20px", zIndex: 20 }}>
          {NAV.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => {
              if (key === "Profile")        navigate("/profile");
              else if (key === "Inventory") navigate("/inventory");
              else if (key === "Home")      navigate("/dashboard");
              else setActiveNav(key as NavItem);
            }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 16px" }}>
              <Icon a={activeNav === key} />
              <span style={{ color: activeNav === key ? "#22C55E" : "#555", fontSize: 11, fontWeight: activeNav === key ? 600 : 400, letterSpacing: "0.04em" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Form sheet */}
      {showForm && <JobForm onClose={() => setShowForm(false)} onSaved={fetchJobs} onToast={showToast} />}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 50, background: toast.ok ? "#052E16" : "#2D0A0A", border: `1px solid ${toast.ok ? "#22C55E" : "#EF4444"}`, borderRadius: 12, padding: "10px 20px", color: toast.ok ? "#22C55E" : "#EF4444", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'Syne', sans-serif" }}>
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default Jobs;
