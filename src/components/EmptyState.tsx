interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ title, subtitle, actionLabel, onAction }: EmptyStateProps) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12, fontFamily: "'Syne', sans-serif" }}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
    <span style={{ color: "#555", fontSize: 15, fontWeight: 600 }}>{title}</span>
    {subtitle && <span style={{ color: "#444", fontSize: 13, textAlign: "center", lineHeight: 1.5 }}>{subtitle}</span>}
    {actionLabel && onAction && (
      <button onClick={onAction} style={{ marginTop: 8, padding: "10px 24px", borderRadius: 12, background: "#22C55E", border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
