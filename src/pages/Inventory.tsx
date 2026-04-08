import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getInventory } from "../api/inventory";
import type { InventoryItem, StockStatus } from "../api/inventory";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = "Home" | "Jobs" | "Inventory" | "Profile";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<StockStatus, { bg: string; color: string }> = {
  "In Stock": { bg: "#052E16",  color: "#22C55E" },
  "Low":      { bg: "#1C1200",  color: "#F59E0B" },
  "Out":      { bg: "#2D0A0A",  color: "#EF4444" },
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

const HomeIcon  = ({ active }: { active: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const BriefIcon = ({ active }: { active: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const BoxIcon   = ({ active }: { active: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const UserIcon  = ({ active }: { active: boolean }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#22C55E" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const BackArrow  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const TagIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const PackageIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const PinIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const NoteIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>;

// ─── Item Card ────────────────────────────────────────────────────────────────

const ItemCard = ({ item, onClick }: { item: InventoryItem; onClick: () => void }) => {
  const [pressed, setPressed] = useState(false);
  const cfg = STATUS_CFG[item.status];

  return (
    <div
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{ background: "#111", border: "1px solid #1F1F1F", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transform: pressed ? "scale(0.985)" : "scale(1)", transition: "transform 0.1s ease", userSelect: "none" }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0, alignSelf: "flex-start", marginTop: 6 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{ color: "#FFF", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
          <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 20, flexShrink: 0 }}>{item.status.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ color: "#555", fontSize: 12 }}>{item.category}</span>
          <span style={{ color: "#A1A1A1", fontSize: 12, fontWeight: 600 }}>{item.qty} {item.unit}</span>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  );
};

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

const DetailSheet = ({ item, onClose }: { item: InventoryItem; onClose: () => void }) => {
  const cfg = STATUS_CFG[item.status];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 30 }} />
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#111", borderTop: "1px solid #1F1F1F", borderRadius: "20px 20px 0 0", padding: "8px 20px 40px", zIndex: 31 }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 18px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#2A2A2A" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <BackArrow />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#FFF", fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{item.name}</div>
            <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 20 }}>{item.status.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 14, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: "#555", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em" }}>QUANTITY</span>
          <span style={{ color: cfg.color, fontSize: 28, fontWeight: 800 }}>{item.qty} <span style={{ fontSize: 14, fontWeight: 500, color: "#555" }}>{item.unit}</span></span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: <TagIcon />,     label: "Category",    value: item.category    },
            { icon: <PinIcon />,     label: "Location",    value: item.location    },
            { icon: <PackageIcon />, label: "Unit",        value: item.unit        },
            { icon: <NoteIcon />,    label: "Description", value: item.description },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ color: "#555", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", marginBottom: 2 }}>{label.toUpperCase()}</div>
                <div style={{ color: "#FFF", fontSize: 13, lineHeight: 1.5 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ─── Inventory ────────────────────────────────────────────────────────────────

const Inventory = () => {
  const navigate = useNavigate();
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<InventoryItem | null>(null);
  const [items, setItems]         = useState<InventoryItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventory();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  const inStock = items.filter((i) => i.status === "In Stock").length;
  const low     = items.filter((i) => i.status === "Low").length;
  const out     = items.filter((i) => i.status === "Out").length;

  const NAV: { key: NavItem; label: string; Icon: React.FC<{ active: boolean }>; path: string }[] = [
    { key: "Home",      label: "Home",      Icon: HomeIcon,  path: "/dashboard" },
    { key: "Jobs",      label: "Jobs",      Icon: BriefIcon, path: "/jobs"      },
    { key: "Inventory", label: "Inventory", Icon: BoxIcon,   path: "/inventory" },
    { key: "Profile",   label: "Profile",   Icon: UserIcon,  path: "/profile"   },
  ];

  if (loading) return <Spinner />;
  if (error)   return <ErrorState message={error} onRetry={fetchItems} />;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:0;}`}</style>

      <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Syne', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10, background: "#080808" }}>
          <h1 style={{ color: "#FFF", fontSize: 24, fontWeight: 700 }}>Inventory</h1>
          <button
            style={{ width: 36, height: 36, borderRadius: 10, background: "#22C55E", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            title="Add item"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 100px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Summary row */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "In Stock", value: inStock, color: "#22C55E" },
              { label: "Low",      value: low,     color: "#F59E0B" },
              { label: "Out",      value: out,     color: "#EF4444" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, background: "#111", border: "1px solid #1F1F1F", borderRadius: 12, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</span>
                <span style={{ color: "#555", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search items or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", height: 46, paddingLeft: 40, paddingRight: 16, background: "#111", border: "1px solid #1F1F1F", borderRadius: 12, color: "#FFF", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>

          {/* Count */}
          <div style={{ color: "#555", fontSize: 12 }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""}</div>

          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 ? (
              <div style={{ color: "#444", fontSize: 14, textAlign: "center", paddingTop: 40 }}>No items match your search.</div>
            ) : (
              filtered.map((item) => (
                <ItemCard key={item.id} item={item} onClick={() => setSelected(item)} />
              ))
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#111", borderTop: "1px solid #1F1F1F", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "12px 0 20px", zIndex: 20 }}>
          {NAV.map(({ key, label, Icon, path }) => {
            const active = key === "Inventory";
            return (
              <button key={key} onClick={() => navigate(path)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 16px" }}>
                <Icon active={active} />
                <span style={{ color: active ? "#22C55E" : "#555", fontSize: 11, fontWeight: active ? 600 : 400, letterSpacing: "0.04em" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail sheet */}
      {selected && <DetailSheet item={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default Inventory;
