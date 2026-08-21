"use client";
import { useEffect, useState } from "react";
import FileUpload from "@/components/FileUpload";
import NoteCard from "@/components/NoteCard";
import QuizCard from "@/components/QuizCard";
import FlashCardComponent from "@/components/FlashCard";
import type { DocInfo } from "@/components/FileUpload";

export default function Home() {
  const [docInfo, setDocInfo] = useState<DocInfo | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("studyforge-theme") as "light" | "dark" | null;
    setTheme(stored ?? "light");
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("studyforge-theme", next);
  }

  const W = { maxWidth: 1120, margin: "0 auto", padding: "0 32px" } as const;

  return (
    <>
      {/* ── Header ────────────────────────────────── */}
      <header style={{
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-panel)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.18s",
      }}>
        <div style={{ ...W, height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {/* Logo + wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
              <rect width="26" height="26" rx="6" fill="var(--color-accent)" />
              <text x="13" y="19" textAnchor="middle" fontFamily="Times New Roman" fontSize="14" fill="white">SF</text>
            </svg>
            <span style={{
              fontFamily: '"Times New Roman", serif',
              fontSize: 17,
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}>
              StudyForge
            </span>
          </div>

          {/* Status + theme toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {docInfo && (
              <span style={{
                display: "inline-block",
                padding: "3px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                background: "color-mix(in srgb, var(--sf-ok) 12%, transparent)",
                color: "var(--sf-ok)",
                border: "1px solid color-mix(in srgb, var(--sf-ok) 28%, transparent)",
              }}>
                ✓ {docInfo.filename}
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="sf-btn sf-btn-ghost"
              style={{ padding: "7px 14px" }}
              aria-label="Toggle theme"
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────── */}
      <section style={{ ...W, padding: "72px 32px 80px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: 64,
          alignItems: "center",
        }}>
          {/* Left: copy */}
          <div>
            <p className="sf-kicker" style={{ marginBottom: 28 }}>AI-Powered Study Tool</p>
            <h1 style={{
              fontSize: "clamp(46px, 6vw, 78px)",
              marginBottom: 28,
              maxWidth: 520,
            }}>
              Turn any document into a study session.
            </h1>
            <p style={{
              fontSize: 16,
              lineHeight: 1.62,
              color: "var(--color-muted)",
              maxWidth: 400,
              marginBottom: 52,
            }}>
              Upload a PDF, DOCX, or TXT file. Enter a topic. Get back structured notes, flashcards, and a quiz, all grounded in your source material.
            </p>

            {/* Three-step strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {(["01 Upload", "02 Generate", "03 Study"] as const).map((step, i) => {
                const [num, label] = step.split(" ");
                return (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{
                        fontFamily: '"Times New Roman", serif',
                        fontSize: 30,
                        color: "var(--sf-ink)",
                        lineHeight: 1,
                      }}>{num}</span>
                      <span className="sf-label">{label}</span>
                    </div>
                    {i < 2 && (
                      <span style={{ color: "var(--color-border)", fontSize: 18, userSelect: "none" }}>/</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: upload */}
          <FileUpload onUploadComplete={setDocInfo} />
        </div>
      </section>

      {/* ── Generators ────────────────────────────── */}
      {docInfo && (
        <section className="sf-generators" style={{ ...W, padding: "0 32px 100px" }}>
          <div style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: 56,
            marginBottom: 60,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}>
            <h2 style={{ fontSize: 13, letterSpacing: "0.14em" }}>Study Materials</h2>
            <span className="sf-label">{docInfo.chunks} source chunks indexed</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
            <NoteCard       documentId={docInfo.documentId} index={1} />
            <div style={{ borderTop: "1px solid var(--color-border)" }} />
            <FlashCardComponent documentId={docInfo.documentId} index={2} />
            <div style={{ borderTop: "1px solid var(--color-border)" }} />
            <QuizCard       documentId={docInfo.documentId} index={3} />
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--color-border)",
        ...W,
        padding: "28px 32px",
      }}>
        <p style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.7 }}>
          StudyForge · AI-powered study tool
        </p>
        <p style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.7 }}>
          Notes, flashcards, and quizzes generated via RAG from your own documents.
        </p>
      </footer>
    </>
  );
}
