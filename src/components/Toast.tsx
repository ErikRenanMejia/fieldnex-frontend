import { useEffect } from "react";

export interface ToastProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

const Toast = ({ message, type, onDismiss }: ToastProps) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100,
      background: type === "success" ? "#052E16" : "#2D0A0A",
      border: `1px solid ${type === "success" ? "#22C55E" : "#EF4444"}`,
      borderRadius: 12, padding: "10px 20px",
      color: type === "success" ? "#22C55E" : "#EF4444",
      fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
      fontFamily: "'Syne', sans-serif",
    }}>
      {message}
    </div>
  );
};

export default Toast;
