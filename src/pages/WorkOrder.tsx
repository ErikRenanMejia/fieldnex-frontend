import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkOrderById, updateWorkOrderStatus } from "../api/workOrders";
import type { WorkOrder as WorkOrderData, CheckItem } from "../api/workOrders";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3;

// ─── Steps config ─────────────────────────────────────────────────────────────

const STEPS: { label: string; sublabel: string }[] = [
  { label: "Arrive",  sublabel: "On site"      },
  { label: "Work",    sublabel: "In progress"  },
  { label: "Review",  sublabel: "Verification" },
  { label: "Close",   sublabel: "Complete"     },
];

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

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#EF4444" stroke="none">
    <circle cx="12" cy="12" r="5"/>
  </svg>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ step, onStepClick }: { step: Step; onStepClick: (s: Step) => void }) => (
  <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 20 }}>
    <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
      {STEPS.map((s, i) => {
        const done    = i < step;
        const current = i === step;
        const isLast  = i === STEPS.length - 1;

        return (
          <div key={s.label} style={{ flex: isLast ? "0 0 auto" : 1, display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === STEPS.length - 1 ? "flex-end" : "center", position: "relative" }}>
            {!isLast && (
              <div style={{ position: "absolute", top: 15, left: i === 0 ? 15 : "50%", right: i === STEPS.length - 2 ? 15 : "-50%", height: 2, background: done ? "#22C55E" : "#1F1F1F", transition: "background 0.3s ease", zIndex: 0 }} />
            )}
            <button
              onClick={() => onStepClick(i as Step)}
              style={{ width: 30, height: 30, borderRadius: "50%", cursor: "pointer", background: done ? "#22C55E" : current ? "#22C55E22" : "#1A1A1A", border: current ? "2px solid #22C55E" : done ? "none" : "2px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, position: "relative", flexShrink: 0, transition: "background 0.3s ease, border-color 0.3s ease" } as React.CSSProperties}
            >
              {done ? <CheckIcon /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: current ? "#22C55E" : "#333" }} />}
            </button>
            <div style={{ marginTop: 8, textAlign: i === 0 ? "left" : i === STEPS.length - 1 ? "right" : "center" }}>
              <div style={{ color: current || done ? "#FFF" : "#555", fontSize: 12, fontWeight: current ? 700 : 500, transition: "color 0.3s" }}>{s.label}</div>
              <div style={{ color: current ? "#22C55E" : "#444", fontSize: 10, marginTop: 1 }}>{s.sublabel}</div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Checklist Item ───────────────────────────────────────────────────────────

const ChecklistItem = ({ item, checked, onToggle }: { item: CheckItem; checked: boolean; onToggle: () => void }) => {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onClick={onToggle}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: checked ? "#052E1622" : "#111", border: `1px solid ${checked ? "#22C55E33" : "#1F1F1F"}`, borderRadius: 12, cursor: "pointer", transform: pressed ? "scale(0.985)" : "scale(1)", transition: "all 0.15s ease", userSelect: "none" }}
    >
      <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: checked ? "#22C55E" : "transparent", border: `2px solid ${checked ? "#22C55E" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}>
        {checked && <CheckIcon />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: checked ? "#555" : "#FFF", fontSize: 14, textDecoration: checked ? "line-through" : "none", transition: "color 0.15s, text-decoration 0.15s" }}>
          {item.label}
        </span>
      </div>
      {item.required && !checked && <div title="Required"><StarIcon /></div>}
    </div>
  );
};

// ─── WorkOrder ────────────────────────────────────────────────────────────────

const WorkOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder]         = useState<WorkOrderData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const [step, setStep]           = useState<Step>(1);
  const [checked, setChecked]     = useState<Set<string>>(new Set());
  const [btnHover, setBtnHover]   = useState(false);
  const [btnActive, setBtnActive] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const toggle = (itemId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleComplete = async () => {
    if (!order || !id || completing) return;
    try {
      setCompleting(true);
      await updateWorkOrderStatus(id, "completed");
      navigate(-1);
    } catch {
      setCompleting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error)   return <ErrorState message={error} onRetry={fetchOrder} />;
  if (!order)  return null;

  const requiredItems = order.items.filter((i) => i.required);
  const allReqDone    = requiredItems.every((i) => checked.has(i.id));
  const doneCount     = checked.size;
  const totalCount    = order.items.length;
  const pct           = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const canComplete   = allReqDone;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:0;}`}</style>
      <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Syne', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10, background: "#080808" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ width: 36, height: 36, borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            >
              <BackArrow />
            </button>
            <div>
              <div style={{ color: "#FFF", fontSize: 16, fontWeight: 600 }}>Work Order</div>
              <div style={{ color: "#555", fontSize: 12 }}>{order.id}</div>
            </div>
          </div>
          <div style={{ color: "#22C55E", fontSize: 13, fontWeight: 600 }}>{pct}%</div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 120px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Order info */}
          <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: 20 }}>
            <div style={{ color: "#555", fontSize: 11, letterSpacing: "0.06em", marginBottom: 6 }}>WORK ORDER</div>
            <div style={{ color: "#FFF", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{order.title}</div>
            <div style={{ color: "#A1A1A1", fontSize: 13 }}>{order.client} · {order.tech}</div>
          </div>

          {/* Progress steps */}
          <ProgressBar step={step} onStepClick={setStep} />

          {/* Progress mini-bar */}
          <div style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "#A1A1A1", fontSize: 13 }}>Checklist progress</span>
              <span style={{ color: "#FFF", fontSize: 13, fontWeight: 600 }}>{doneCount}/{totalCount}</span>
            </div>
            <div style={{ height: 6, background: "#1F1F1F", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#22C55E" : "#22C55E99", borderRadius: 6, transition: "width 0.3s ease" }} />
            </div>
            {!allReqDone && (
              <div style={{ color: "#555", fontSize: 11, marginTop: 8 }}>
                ● Required items remaining: {requiredItems.filter((i) => !checked.has(i.id)).length}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div>
            <div style={{ color: "#FFF", fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Checklist</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  checked={checked.has(item.id)}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>
            <div style={{ marginTop: 12, color: "#444", fontSize: 11 }}>● Red dot = required item</div>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#080808", borderTop: "1px solid #1F1F1F", padding: "16px 20px 28px", zIndex: 20 }}>
          <button
            disabled={!canComplete || completing}
            onClick={handleComplete}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => { setBtnHover(false); setBtnActive(false); }}
            onMouseDown={() => setBtnActive(true)}
            onMouseUp={() => setBtnActive(false)}
            style={{ width: "100%", height: 52, borderRadius: 14, border: "none", cursor: canComplete && !completing ? "pointer" : "not-allowed", background: !canComplete ? "#1A1A1A" : btnActive ? "#15803D" : btnHover ? "#16A34A" : "#22C55E", color: !canComplete ? "#444" : "#000", fontSize: 14, fontWeight: 700, letterSpacing: "0.06em", transform: btnActive && canComplete ? "scale(0.97)" : "scale(1)", transition: "background 0.15s, transform 0.1s", fontFamily: "inherit" }}
          >
            {completing
              ? "Saving..."
              : canComplete
              ? "COMPLETE & REVIEW"
              : `COMPLETE REQUIRED ITEMS (${requiredItems.filter((i) => !checked.has(i.id)).length} left)`}
          </button>
        </div>
      </div>
    </>
  );
};

export default WorkOrder;
