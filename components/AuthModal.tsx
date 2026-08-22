"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "signin" | "signup";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      setInfo("Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      onClose();
    }
  }

  async function handleGoogle() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  }

  return (
    <>
      {/* Backdrop — acts as the centering container */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        onClick={onClose}
      >
      {/* Modal — stops click propagation so backdrop click doesn't close when clicking inside */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--color-panel)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          animation: "sf-fade-in 0.18s ease forwards",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            color: "var(--color-muted)",
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        <p className="sf-kicker" style={{ marginBottom: 8 }}>
          {mode === "signin" ? "Welcome back" : "Create account"}
        </p>
        <h2 style={{ fontSize: 22, marginBottom: 24 }}>
          {mode === "signin" ? "Sign in" : "Sign up"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label htmlFor="auth-email" className="sf-label">Email</label>
            <input
              id="auth-email"
              className="sf-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label htmlFor="auth-password" className="sf-label">Password</label>
            <input
              id="auth-password"
              className="sf-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {error && <div className="sf-alert sf-alert-bad">{error}</div>}
          {info  && <div className="sf-alert sf-alert-ok">{info}</div>}

          <button
            className="sf-btn sf-btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: 4 }}
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "20px 0",
          color: "var(--color-muted)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          or
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        </div>

        {/* Google */}
        <button
          className="sf-btn sf-btn-ghost"
          style={{ width: "100%", gap: 10 }}
          onClick={handleGoogle}
          type="button"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        {/* Toggle mode */}
        <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--color-muted)" }}>
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-accent)", fontWeight: 700, fontSize: 13 }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.583c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.583 9 3.583Z" fill="#EA4335"/>
    </svg>
  );
}
