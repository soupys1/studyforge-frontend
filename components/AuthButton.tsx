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
      <button className="sf-btn sf-btn-ghost" style={{ padding: "7px 14px" }} onClick={onOpenModal}>
        Sign in
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        className="sf-btn sf-btn-ghost"
        style={{ padding: "7px 14px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
        onClick={() => setMenuOpen(o => !o)}
      >
        {user.email}
      </button>
      {menuOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setMenuOpen(false)}
          />
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--color-panel)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            padding: "6px 0",
            minWidth: 140,
            zIndex: 50,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}>
            <button
              className="sf-btn sf-btn-ghost"
              style={{
                width: "100%",
                borderRadius: 0,
                border: "none",
                justifyContent: "flex-start",
                padding: "8px 16px",
                color: "var(--sf-bad)",
              }}
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
