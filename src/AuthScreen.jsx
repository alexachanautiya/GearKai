import { useState } from "react";
import { useAuth } from "./AuthContext";

// ─────────────────────────────────────────────────────────────
// Shared styled input
// ─────────────────────────────────────────────────────────────
function TacticalInput({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "'Orbitron', monospace", fontSize: 9,
        letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase"
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: "12px 16px",
          background: focused ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${focused ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 8, color: "#fff", fontSize: 14, outline: "none",
          transition: "all 0.2s",
          boxShadow: focused ? "0 0 16px rgba(245,158,11,0.1)" : "none",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Auth Screen
// ─────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const { login, register, authError, clearError } = useAuth();

  const [mode,        setMode]        = useState("login"); // "login" | "register"
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError,  setLocalError]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setLocalError(null);
    clearError();
    setEmail("");
    setPassword("");
    setConfirmPass("");
    setDisplayName("");
  };

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();

    // ── Validation ──────────────────────────────────────────
    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }
    if (mode === "register") {
      if (!displayName.trim()) { setLocalError("Operative name is required."); return; }
      if (password.length < 6) { setLocalError("Password must be at least 6 characters."); return; }
      if (password !== confirmPass) { setLocalError("Passwords do not match."); return; }
    }

    setLoading(true);
    const result = mode === "login"
      ? await login(email.trim(), password)
      : await register(email.trim(), password, displayName.trim());
    setLoading(false);

    if (result.success && mode === "register") {
      setSuccess(true);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  const error = localError || authError;

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0f0f",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", position: "relative", overflow: "hidden",
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      {/* Scanline */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "2px",
        background: "linear-gradient(transparent, rgba(245,158,11,0.2), transparent)",
        animation: "scanline 4s linear infinite", pointerEvents: "none", zIndex: 100
      }} />

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px", pointerEvents: "none"
      }} />

      {/* Glow orb */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420, position: "relative", zIndex: 10,
        animation: "fadeUp 0.5s ease"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #F59E0B, #d97706)",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, boxShadow: "0 0 40px rgba(245,158,11,0.35)"
          }}>⚡</div>
          <div style={{
            fontFamily: "'Orbitron', monospace", fontWeight: 900,
            fontSize: 28, color: "#F59E0B", letterSpacing: 4,
            textShadow: "0 0 30px rgba(245,158,11,0.4)"
          }}>GEARKAI</div>
          <div style={{
            fontFamily: "'Orbitron', monospace", fontSize: 9,
            color: "rgba(255,255,255,0.25)", letterSpacing: 3, marginTop: 6
          }}>TACTICAL SCOUTER v2.0</div>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10, padding: 4, marginBottom: 28
        }}>
          {[["login", "🔐 LOGIN"], ["register", "⚡ ENLIST"]].map(([m, label]) => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: "10px",
              background: mode === m ? "linear-gradient(135deg, #F59E0B, #d97706)" : "transparent",
              border: "none", borderRadius: 7,
              color: mode === m ? "#000" : "rgba(255,255,255,0.3)",
              fontFamily: "'Orbitron', monospace", fontWeight: 700,
              fontSize: 10, letterSpacing: 2, cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: mode === m ? "0 0 16px rgba(245,158,11,0.3)" : "none"
            }}>{label}</button>
          ))}
        </div>

        {/* Form panel */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 14, padding: 28,
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 40px rgba(245,158,11,0.06), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}>
          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 3, height: 18, background: "#F59E0B", borderRadius: 2, boxShadow: "0 0 10px #F59E0B" }} />
            <span style={{
              fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700,
              color: "#fff", letterSpacing: 3
            }}>
              {mode === "login" ? "OPERATIVE LOGIN" : "NEW OPERATIVE"}
            </span>
          </div>

          {success ? (
            /* Registration success state */
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, color: "#22c55e", letterSpacing: 2, marginBottom: 8 }}>
                ENLISTMENT CONFIRMED
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
                Your operative profile has been created.
              </div>
              <button onClick={() => switchMode("login")} style={{
                padding: "12px 24px", background: "linear-gradient(135deg, #F59E0B, #d97706)",
                border: "none", borderRadius: 8, color: "#000",
                fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 10, letterSpacing: 2,
                cursor: "pointer"
              }}>PROCEED TO LOGIN</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }} onKeyDown={handleKey}>
              {mode === "register" && (
                <TacticalInput
                  label="Operative Name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              )}
              <TacticalInput
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operative@gearkai.io"
                autoComplete={mode === "login" ? "email" : "new-email"}
              />
              <TacticalInput
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Min. 6 characters" : "••••••••"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              {mode === "register" && (
                <TacticalInput
                  label="Confirm Password"
                  type="password"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              )}

              {/* Error message */}
              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8, padding: "10px 14px",
                  fontSize: 12, color: "#f87171", display: "flex", alignItems: "center", gap: 8
                }}>
                  <span>⚠</span> {error}
                </div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading} style={{
                marginTop: 4, padding: "14px",
                background: loading ? "rgba(245,158,11,0.3)" : "linear-gradient(135deg, #F59E0B, #d97706)",
                border: "none", borderRadius: 8,
                color: loading ? "rgba(0,0,0,0.5)" : "#000",
                fontFamily: "'Orbitron', monospace", fontWeight: 700,
                fontSize: 12, letterSpacing: 2, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 0 20px rgba(245,158,11,0.35)",
                transition: "all 0.2s"
              }}>
                {loading
                  ? "⚡ PROCESSING..."
                  : mode === "login" ? "⚡ ACCESS SCOUTER" : "⚡ ENLIST NOW"
                }
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        {!success && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              {mode === "login" ? "No account? " : "Already enlisted? "}
            </span>
            <button onClick={() => switchMode(mode === "login" ? "register" : "login")} style={{
              background: "none", border: "none", color: "#F59E0B",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              textDecoration: "underline"
            }}>
              {mode === "login" ? "Enlist here" : "Login instead"}
            </button>
          </div>
        )}

        {/* Admin note */}
        {mode === "register" && !success && (
          <div style={{
            marginTop: 16, padding: "10px 14px",
            background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)",
            borderRadius: 8, textAlign: "center"
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Admin access is granted manually by a system operator.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
