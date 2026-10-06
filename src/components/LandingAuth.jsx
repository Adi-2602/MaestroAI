import { useState } from "react";
import { Music } from "lucide-react";
import { loginUser, registerUser, forgotPassword, resetPassword } from "../api.js";

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length < 6) {
    return { score: 1, label: "Too short (min 6 chars)", color: "var(--red)" };
  }

  if (score <= 2) {
    return { score: 2, label: "Weak", color: "var(--red)" };
  } else if (score <= 4) {
    return { score: 3, label: "Medium", color: "var(--amber)" };
  } else {
    return { score: 4, label: "Strong", color: "var(--green)" };
  }
}

export default function LandingAuth({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot-request" | "forgot-reset"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [redirectProgress, setRedirectProgress] = useState(0);

  function changeMode(newMode) {
    setMode(newMode);
    setError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMessage("");
    try {
      if (mode === "register") {
        const response = await registerUser(form);
        triggerRedirect(response);
      } else if (mode === "login") {
        const response = await loginUser({ email: form.email, password: form.password });
        triggerRedirect(response);
      } else if (mode === "forgot-request") {
        await forgotPassword(form.email);
        setMode("forgot-reset");
        setSuccessMessage("If an account exists for this email, an 8-digit verification code has been sent.");
        setBusy(false);
      } else if (mode === "forgot-reset") {
        await resetPassword(form.email, otp, newPassword);
        setMode("login");
        setSuccessMessage("Password reset successfully! You can now log in with your new password.");
        setForm({ ...form, password: "" });
        setOtp("");
        setNewPassword("");
        setBusy(false);
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
      setBusy(false);
    }
  }

  function triggerRedirect(response) {
    setRedirecting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      if (progress >= 100) {
        clearInterval(interval);
        onAuth(response);
      } else {
        setRedirectProgress(progress);
      }
    }, 50); // ~1.25s animation time
  }


  if (redirecting) {
    let subtitle = "Setting up secure workspace...";
    if (redirectProgress > 70) {
      subtitle = "Preparing digital workstation...";
    } else if (redirectProgress > 35) {
      subtitle = "Loading creative history...";
    }

    return (
      <main className="landing-shell redirecting-loader">
        <div className="loader-container">
          <div className="brand-lockup loader-brand">
            <div className="brand-mark"><Music size={32} className="spinning-loader" /></div>
            <h2>Maestro AI</h2>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${redirectProgress}%` }} />
          </div>
          <div className="loader-status">
            <strong>{redirectProgress}%</strong>
            <span>{subtitle}</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="brand-lockup landing-brand">
          <div className="brand-mark"><Music size={24} /></div>
          <div>
            <h1>Maestro AI</h1>
            <p>AI composition workstation</p>
          </div>
        </div>
        <div className="landing-copy">
          <h2>Compose, arrange, and save every session.</h2>
          <p>Workspaces, projects, melodies, chords, lyrics, and exports stay mapped together for a clean studio workflow.</p>
        </div>
        <div className="landing-console" aria-hidden="true">
          <div className="console-head">
            <span>Workspace</span>
            <span>Project</span>
            <span>Draft</span>
          </div>
          <div className="console-lanes">
            {Array.from({ length: 5 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>
        <div className="landing-grid" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => <span key={index} />)}
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-header">
          <strong>
            {mode === "register"
              ? "Create account"
              : mode === "forgot-request"
              ? "Reset password"
              : mode === "forgot-reset"
              ? "Verify reset"
              : "Welcome back"}
          </strong>
          <span>
            {mode === "register"
              ? "Start a mapped studio workspace."
              : mode === "forgot-request"
              ? "Request an 8-digit verification code."
              : mode === "forgot-reset"
              ? `Enter the code sent to ${form.email}`
              : "Open your saved music workspace."}
          </span>
        </div>

        {(mode === "login" || mode === "register") && (
          <div className="auth-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Login</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => changeMode("register")}>Register</button>
          </div>
        )}

        {mode === "forgot-request" ? (
          <form onSubmit={handleSubmit}>
            <label>Email
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            {error && <div className="message error">{error}</div>}
            {successMessage && <div className="message success">{successMessage}</div>}
            <button className="primary-button" disabled={busy}>
              {busy ? (
                <span className="button-progress-bar" aria-label="Loading">
                  <span className="button-progress-fill" />
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
            <div className="forgot-password-link-container" style={{ justifyContent: 'center' }}>
              <button type="button" className="link-button" onClick={() => changeMode("login")} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--teal)', fontSize: '12px', textTransform: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Back to Login
              </button>
            </div>
          </form>
        ) : mode === "forgot-reset" ? (
          <form onSubmit={handleSubmit}>
            <label>Email
              <input type="email" value={form.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </label>
            <label>Verification Code (8-digit)
              <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="12345678" required pattern="\d{8}" title="Please enter exactly 8 digits" />
            </label>
            <label>New Password
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={6} />
            </label>
            {error && <div className="message error">{error}</div>}
            {successMessage && <div className="message success">{successMessage}</div>}
            <button className="primary-button" disabled={busy}>
              {busy ? (
                <span className="button-progress-bar" aria-label="Loading">
                  <span className="button-progress-fill" />
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
            <div className="forgot-password-link-container" style={{ justifyContent: 'space-between', width: '100%' }}>
              <button type="button" className="link-button" onClick={() => changeMode("login")} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--muted)', fontSize: '12px', textTransform: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Back to Login
              </button>
              <button type="button" className="link-button" onClick={async () => {
                setBusy(true);
                setError("");
                setSuccessMessage("");
                try {
                  await forgotPassword(form.email);
                  setSuccessMessage("Verification code resent successfully!");
                } catch (err) {
                  setError(err.message || "Failed to resend code.");
                } finally {
                  setBusy(false);
                }
              }} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--teal)', fontSize: '12px', textTransform: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Resend Code
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            {successMessage && <div className="message success" style={{ marginBottom: '10px' }}>{successMessage}</div>}
            {mode === "register" && (
              <label>Name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </label>
            )}
            <label>Email
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            <label>Password
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} />
            </label>
            {mode === "register" && form.password && (
              <div className="password-strength-container" style={{ marginTop: '2px', marginBottom: '8px' }}>
                <div className="strength-meter-bar" style={{ height: '3px', background: '#2d3842', borderRadius: '1.5px', overflow: 'hidden' }}>
                  <div 
                    className="strength-meter-fill" 
                    style={{ 
                      height: '100%', 
                      width: `${(getPasswordStrength(form.password).score / 4) * 100}%`, 
                      background: getPasswordStrength(form.password).color, 
                      transition: 'all 0.3s ease' 
                    }} 
                  />
                </div>
                <div className="strength-label" style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Password strength</span>
                  <span style={{ color: getPasswordStrength(form.password).color }}>{getPasswordStrength(form.password).label}</span>
                </div>
              </div>
            )}
            {mode === "login" && (
              <div className="forgot-password-link-container">
                <button type="button" className="link-button" onClick={() => changeMode("forgot-request")} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--teal)', fontSize: '11px', textTransform: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Forgot Password?
                </button>
              </div>
            )}
            {error && <div className="message error">{error}</div>}
            <button className="primary-button" disabled={busy}>
              {busy ? (
                <span className="button-progress-bar" aria-label="Loading">
                  <span className="button-progress-fill" />
                </span>
              ) : mode === "register" ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

