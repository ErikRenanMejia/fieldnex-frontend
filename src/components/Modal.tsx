import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  saving?: boolean;
  children: ReactNode;
}

const Modal = ({ title, onClose, onSave, saveLabel = "Save", saving = false, children }: ModalProps) => (
  <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 40 }} />
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 520, background: "#111", borderTop: "1px solid #1F1F1F",
      borderRadius: "20px 20px 0 0", zIndex: 41, maxHeight: "90vh", display: "flex", flexDirection: "column",
      fontFamily: "'Syne', sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#2A2A2A" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 10px" }}>
        <span style={{ color: "#FFF", fontSize: 16, fontWeight: 700 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 8px" }}>
        {children}
      </div>
      {onSave && (
        <div style={{ padding: "14px 20px 32px", borderTop: "1px solid #1F1F1F", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 48, borderRadius: 12, border: "1px solid #2A2A2A", background: "#1A1A1A", color: "#FFF", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving} style={{ flex: 2, height: 48, borderRadius: 12, border: "none", background: saving ? "#1A1A1A" : "#22C55E", color: saving ? "#444" : "#000", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      )}
    </div>
  </>
);

export default Modal;
