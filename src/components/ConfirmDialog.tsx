interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ title, message, confirmLabel = "Delete", danger = true, onConfirm, onCancel }: ConfirmDialogProps) => (
  <>
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50 }} />
    <div style={{
      position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      width: "calc(100% - 40px)", maxWidth: 380, background: "#111",
      border: "1px solid #2A2A2A", borderRadius: 20, padding: 24,
      zIndex: 51, fontFamily: "'Syne', sans-serif",
    }}>
      <div style={{ color: "#FFF", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ color: "#A1A1A1", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{message}</div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, height: 46, borderRadius: 12, border: "1px solid #2A2A2A", background: "#1A1A1A", color: "#FFF", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{ flex: 1, height: 46, borderRadius: 12, border: "none", background: danger ? "#EF4444" : "#22C55E", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </>
);

export default ConfirmDialog;
