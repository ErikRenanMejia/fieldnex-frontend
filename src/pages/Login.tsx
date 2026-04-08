import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

interface FieldState {
  value: string;
  error: string;
  touched: boolean;
}

const validateEmail = (value: string): string => {
  if (!value) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
  return "";
};

const validatePassword = (value: string): string => {
  if (!value) return "Password is required";
  if (value.length < 6) return "Minimum 6 characters";
  return "";
};

const Spinner = () => (
  <span
    style={{
      display: "inline-block",
      width: 18,
      height: 18,
      border: "2.5px solid #15803D",
      borderTopColor: "#000",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      verticalAlign: "middle",
    }}
  />
);

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState<FieldState>({ value: "", error: "", touched: false });
  const [password, setPassword] = useState<FieldState>({ value: "", error: "", touched: false });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [btnHover, setBtnHover] = useState(false);
  const [btnActive, setBtnActive] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const isFormValid =
    !validateEmail(email.value) && !validatePassword(password.value);

  const handleEmailChange = (val: string) => {
    setEmail({ value: val, error: email.touched ? validateEmail(val) : "", touched: email.touched });
  };

  const handlePasswordChange = (val: string) => {
    setPassword({ value: val, error: password.touched ? validatePassword(val) : "", touched: password.touched });
  };

  const handleEmailBlur = () => {
    setEmail((prev) => ({ ...prev, touched: true, error: validateEmail(prev.value) }));
  };

  const handlePasswordBlur = () => {
    setPassword((prev) => ({ ...prev, touched: true, error: validatePassword(prev.value) }));
  };

  const handleSubmit = async () => {
    const emailErr = validateEmail(email.value);
    const passwordErr = validatePassword(password.value);

    setEmail((prev) => ({ ...prev, touched: true, error: emailErr }));
    setPassword((prev) => ({ ...prev, touched: true, error: passwordErr }));

    if (emailErr || passwordErr) return;

    setLoading(true);
    setApiError("");
    try {
      const data = await loginUser(email.value, password.value);
      auth.login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (error: any) {
      setApiError(
        error.response?.data?.message ?? error.message ?? "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const inputStyle = (hasError: boolean, isFocused: boolean): React.CSSProperties => ({
    width: "100%",
    height: 56,
    padding: "0 16px",
    borderRadius: 12,
    background: "#FFFFFF",
    color: "#000000",
    fontSize: 15,
    border: hasError
      ? "2px solid #EF4444"
      : isFocused
      ? "2px solid #22C55E"
      : "2px solid transparent",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  });

  const btnBackground = () => {
    if (loading || !isFormValid) return "#2A2A2A";
    if (btnActive) return "#15803D";
    if (btnHover) return "#16A34A";
    return "#22C55E";
  };

  const btnTextColor = loading || !isFormValid ? "#666666" : "#000000";

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#080808",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          ref={formRef}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#111111",
            border: "1px solid #1F1F1F",
            borderRadius: 16,
            padding: 24,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#22C55E",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                ✓
              </div>
              <span
                style={{
                  color: "#FFFFFF",
                  fontFamily: "monospace",
                  letterSpacing: "0.2em",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                FIELDNEX
              </span>
            </div>
          </div>

          {/* Header */}
          <h1 style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 600, margin: "0 0 4px 0" }}>
            Sign in
          </h1>
          <p style={{ color: "#A1A1A1", fontSize: 14, margin: "0 0 24px 0" }}>
            Technician access
          </p>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                color: "#A1A1A1",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email.value}
              placeholder="you@company.com"
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              onFocus={() => setEmailFocus(true)}
              onKeyDown={handleKeyDown}
              style={inputStyle(!!email.error, emailFocus)}
              onBlurCapture={() => setEmailFocus(false)}
              autoComplete="email"
            />
            {email.error && (
              <span style={{ color: "#EF4444", fontSize: 12, marginTop: 4, display: "block" }}>
                {email.error}
              </span>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                color: "#A1A1A1",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password.value}
              placeholder="••••••••"
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={handlePasswordBlur}
              onFocus={() => setPasswordFocus(true)}
              onKeyDown={handleKeyDown}
              style={inputStyle(!!password.error, passwordFocus)}
              onBlurCapture={() => setPasswordFocus(false)}
              autoComplete="current-password"
            />
            {password.error && (
              <span style={{ color: "#EF4444", fontSize: 12, marginTop: 4, display: "block" }}>
                {password.error}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => { setBtnHover(false); setBtnActive(false); }}
            onMouseDown={() => setBtnActive(true)}
            onMouseUp={() => setBtnActive(false)}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 12,
              border: "none",
              background: btnBackground(),
              color: btnTextColor,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: loading || !isFormValid ? "not-allowed" : "pointer",
              transition: "background 0.15s ease",
              transform: btnActive && isFormValid ? "scale(0.97)" : "scale(1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? <><Spinner /> Signing in...</> : "SIGN IN"}
          </button>

          {/* API error */}
          {apiError && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#2D0A0A", border: "1px solid #EF444433", borderRadius: 10, color: "#EF4444", fontSize: 13 }}>
              {apiError}
            </div>
          )}

          {/* Secondary links */}
          <div
            style={{
              borderTop: "1px solid #1F1F1F",
              marginTop: 24,
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                color: "#A1A1A1",
                fontSize: 13,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                textDecorationColor: "transparent",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#22C55E")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A1A1A1")}
            >
              Forgot password?
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                color: "#A1A1A1",
                fontSize: 13,
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#22C55E")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A1A1A1")}
            >
              Need help?
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
