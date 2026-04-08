import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../api/jobs";
import type { Job, JobStatus, Priority } from "../api/jobs";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<JobStatus, { bg: string; color: string }> = {
  "Active":   { bg: "#052E16", color: "#22C55E" },
  "Pending":  { bg: "#1C1C1C", color: "#A1A1A1" },
  "On Hold":  { bg: "#2D0A0A", color: "#EF4444" },
  "Done":     { bg: "#111111", color: "#444444" },
};

const PRIORITY_COLOR: Record<Priority, string> = {
  High:   "#EF4444",
  Medium: "#F59E0B",
  Low:    "#22C55E",
};

// ─── Loading / Error states ───────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ width: 36, height: 36, border: "3px solid #1F1F1F", borderTop: "3px solid #22C55E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 20, fontFamily: "'Syne', sans-serif" }}>
    <span style={{ color: "#EF4444", fontSize: 16, fontWeight: 600 }}>Failed to load</span>
    <span style={{ color: "#555", fontSize: 13, textAlign: "center" }}>{message}</span>
    <button onClick={onRetry} style={{ padding: "10px 24px", borderRadius: 12, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFF", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
      Try again
    </button>
  </div>
);

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackArrow   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
const CalendarIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const PinIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const PhoneIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>;
const WrenchIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const FlagIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const NoteIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const ClockIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 16, borderBottom: "1px solid #1A1A1A" }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ color: "#555", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", marginBottom: 3 }}>{label.toUpperCase()}</div>
      <div style={{ color: "#FFF", fontSize: 14 }}>{value}</div>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
    <span style={{ color: "#FFF", fontSize: 15, fontWeight: 600 }}>{title}</span>
    {children}
  </div>
);

// ─── JobDetail ────────────────────────────────────────────────────────────────

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob]         = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [startHover, setStartHover]     = useState(false);
  const [startActive, setStartActive]   = useState(false);
  const [contactHover, setContactHover] = useState(false);

  const fetchJob = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getJobById(id);
      setJob(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  if (loading) return <Spinner />;
  if (error)   return <ErrorState message={error} onRetry={fetchJob} />;
  if (!job)    return null;

  const statusCfg    = STATUS_CFG[job.status];
  const priorityColor = job.priority ? PRIORITY_COLOR[job.priority] : "#A1A1A1";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:0;}`}</style>
      <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Syne', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10, background: "#080808" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <BackArrow />
          </button>
          <span style={{ color: "#FFF", fontSize: 17, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Job Detail
          </span>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 120px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Hero */}
          <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ background: statusCfg.bg, color: statusCfg.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 20 }}>
                {job.status.toUpperCase()}
              </span>
              {job.priority && (
                <span style={{ color: priorityColor, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px", borderRadius: 20, background: `${priorityColor}18` }}>
                  {job.priority.toUpperCase()} PRIORITY
                </span>
              )}
            </div>
            <h2 style={{ color: "#FFF", fontSize: 22, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{job.title}</h2>
            <div style={{ color: "#A1A1A1", fontSize: 14 }}>{job.client}</div>
          </div>

          {/* Details section */}
          <Section title="Details">
            {job.date    && <DetailRow icon={<CalendarIcon />} label="Date"    value={job.date} />}
            {job.time    && <DetailRow icon={<ClockIcon />}    label="Time"    value={job.time} />}
            {job.address && <DetailRow icon={<PinIcon />}      label="Address" value={job.address} />}
            {job.contact && <DetailRow icon={<PhoneIcon />}    label="Contact" value={`${job.contact}${job.phone ? " · " + job.phone : ""}`} />}
            {job.system  && <DetailRow icon={<WrenchIcon />}   label="System"  value={job.system} />}
            {job.priority && (
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FlagIcon />
                </div>
                <div>
                  <div style={{ color: "#555", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", marginBottom: 3 }}>PRIORITY</div>
                  <span style={{ color: priorityColor, fontSize: 14, fontWeight: 600 }}>{job.priority}</span>
                </div>
              </div>
            )}
          </Section>

          {/* Notes section */}
          {job.notes && (
            <Section title="Notes">
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <NoteIcon />
                </div>
                <p style={{ color: "#A1A1A1", fontSize: 14, lineHeight: 1.6 }}>{job.notes}</p>
              </div>
            </Section>
          )}
        </div>

        {/* Action buttons — fixed footer */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#080808", borderTop: "1px solid #1F1F1F", padding: "16px 20px 28px", display: "flex", flexDirection: "column", gap: 10, zIndex: 20 }}>
          <button
            onMouseEnter={() => setStartHover(true)}
            onMouseLeave={() => { setStartHover(false); setStartActive(false); }}
            onMouseDown={() => setStartActive(true)}
            onMouseUp={() => setStartActive(false)}
            onClick={() => navigate(`/work-orders/${job.id}`)}
            style={{ width: "100%", height: 52, borderRadius: 14, border: "none", cursor: "pointer", background: startActive ? "#15803D" : startHover ? "#16A34A" : "#22C55E", color: "#000", fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", transform: startActive ? "scale(0.97)" : "scale(1)", transition: "background 0.15s, transform 0.1s", fontFamily: "inherit" }}
          >
            START WORK ORDER
          </button>
          <button
            onMouseEnter={() => setContactHover(true)}
            onMouseLeave={() => setContactHover(false)}
            style={{ width: "100%", height: 52, borderRadius: 14, border: "1px solid #2A2A2A", cursor: "pointer", background: contactHover ? "#1A1A1A" : "#111", color: "#A1A1A1", fontSize: 14, fontWeight: 600, transition: "background 0.15s", fontFamily: "inherit" }}
          >
            Contact Client
          </button>
        </div>
      </div>
    </>
  );
};

export default JobDetail;
