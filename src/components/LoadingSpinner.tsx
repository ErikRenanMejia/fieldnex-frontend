const LoadingSpinner = ({ fullPage = false }: { fullPage?: boolean }) => {
  const wrap: React.CSSProperties = fullPage
    ? { minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }
    : { display: "flex", alignItems: "center", justifyContent: "center", padding: 60 };
  return (
    <div style={wrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, border: "3px solid #1F1F1F", borderTop: "3px solid #22C55E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
};

export default LoadingSpinner;
