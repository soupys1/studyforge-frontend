"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface AuthButtonProps {
  onOpenModal: () => void;
}

export default function AuthButton({ onOpenModal }: AuthButtonProps) {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <button className="sf-btn sf-btn-ghost" style={{ fontSize: 13 }} onClick={onOpenModal}>
        Sign in
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        className="sf-btn sf-btn-ghost"
        style={{ fontSize: 13, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}
        onClick={() => setMenuOpen(o => !o)}
      >
        {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
      </button>
      {menuOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--ln-s1)",
            border: "1px solid var(--ln-hair)",
            borderRadius: "var(--radius-md)",
            padding: "4px 0",
            minWidth: 140,
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}>
            <button
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                padding: "8px 14px",
                fontSize: 13,
                fontFamily: "var(--font-body)",
                color: "var(--ln-error)",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--ln-s2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
              onClick={async () => {
                setMenuOpen(false);
                await supabase.auth.signOut();
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
