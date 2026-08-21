"use client";
import { useState } from "react";
import { generateNotes } from "@/lib/api";

interface NoteData {
  note_id: string;
  title: string;
  content: string;
  source_page: number | string | null;
}

interface NoteCardProps {
  documentId: string;
  index: number;
}

export default function NoteCard({ documentId, index }: NoteCardProps) {
  const [topic,   setTopic]   = useState("");
  const [note,    setNote]    = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const result = await generateNotes(documentId, topic);
      setNote(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sf-generator">
      {/* ── Sidebar ── */}
      <div>
        <span style={{
          fontFamily: '"Times New Roman", serif',
          fontSize: 68,
          color: "var(--sf-ink)",
          lineHeight: 1,
          display: "block",
          marginBottom: 10,
        }}>0{index}</span>

        <h3 style={{ fontSize: 18, letterSpacing: "0.04em", marginBottom: 12 }}>Notes</h3>
        <p style={{ fontSize: 13.5, color: "var(--color-muted)", lineHeight: 1.56, marginBottom: 24 }}>
          A concise, structured summary of the most relevant content for your topic.
        </p>

        <input
          className="sf-input"
          type="text"
          placeholder="Enter topic…"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleGenerate()}
          style={{ marginBottom: 12 }}
        />
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%" }}
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
        >
          {loading ? "Generating…" : "Generate notes"}
        </button>
      </div>

      {/* ── Output ── */}
      <div className="sf-panel" style={{ padding: 32, minHeight: 180 }}>

        {/* Ghost / awaiting topic */}
        {!note && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 20, width: "50%", opacity: 0.35 }} />
            <div style={{ height: 6 }} />
            <div className="skeleton" style={{ height: 13, width: "100%", opacity: 0.2 }} />
            <div className="skeleton" style={{ height: 13, width: "90%",  opacity: 0.16 }} />
            <div className="skeleton" style={{ height: 13, width: "80%",  opacity: 0.13 }} />
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 22, width: "44%" }} />
            <div style={{ height: 4 }} />
            <div className="skeleton" style={{ height: 13, width: "100%" }} />
            <div className="skeleton" style={{ height: 13, width: "87%" }} />
            <div className="skeleton" style={{ height: 13, width: "94%" }} />
            <div className="skeleton" style={{ height: 13, width: "70%" }} />
            <div style={{ marginTop: 10 }}>
              <p className="sf-label" style={{ animation: "sf-pulse 1.2s ease-in-out infinite" }}>
                Retrieving relevant passages…
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="sf-alert sf-alert-bad">{error}</div>}

        {/* Result */}
        {note && (
          <div>
            <div style={{
              display: "flex", alignItems: "baseline", gap: 12,
              flexWrap: "wrap", marginBottom: 16,
            }}>
              <h3 style={{ fontSize: 20, letterSpacing: "0.02em" }}>{note.title}</h3>
              {note.source_page != null && (
                <span className="sf-tag">Page {note.source_page}</span>
              )}
            </div>
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 18 }}>
              {note.content.split("\n\n").filter(Boolean).map((para, i) => (
                <p key={i} style={{
                  fontSize: 14.5,
                  lineHeight: 1.62,
                  marginBottom: 14,
                }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
